import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import 'source-map-support/register';
import { getConfig, mergeConfig } from './lib/config';
import { Contentful } from './lib/contentful';
import { EstateContentfulAdapter } from './lib/estate/entityAdapter';
import { parseReferences } from './lib/estate/referenceAdapter';
import { getLinkedEntities } from './lib/estate/utils';
import { clearCache, Portal } from './lib/portal';
import { getCountAndIds, httpResponse, Logger } from './lib/utils';
import { Payload } from './types';
import { writeFileSync } from 'fs';

export const sync: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { config, updates }: Payload =
      typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    const stored = await getConfig(config.domain);
    const merged = mergeConfig(config, stored);

    const contentful = new Contentful(merged.contentful);
    await contentful.init();

    const locales = await contentful.getLocales();
    const defaultLocale = locales.find((locale) => locale.default);

    const stats = {
      deleted: {
        entries: {},
        nestedEntities: {},
      },
      changed: {
        assets: {},
        entries: {},
      },
      published: {
        assets: {},
        entries: {},
      },
    };

    if (updates.deleted.length > 0) {
      const deletedEntries = await contentful.getEntries(
        merged.contentful.estateContentTypeId,
        updates.deleted
      );
      const linked = getLinkedEntities(deletedEntries, defaultLocale);

      await Promise.all(linked.map((sys) => contentful.deleteBySys(sys)));
      await Promise.all(
        deletedEntries.map((entry) => contentful.deleteSave(entry))
      );

      stats.deleted.entries = getCountAndIds(deletedEntries);
      stats.deleted.nestedEntities = getCountAndIds(linked);
    }

    const portal = new Portal(merged.portal, locales);
    await portal.init();

    const changedEstates = await portal.fetchEstatesPropertiesForLocales(
      [...updates.created, ...updates.updated],
      locales
    );

    const estateContentType = await contentful.getContentType(
      merged.contentful.estateContentTypeId
    );

    const adapter = new EstateContentfulAdapter(
      changedEstates,
      portal.dictionaries,
      locales,
      estateContentType
    );

    const parsed = await adapter.getParsed();
    const nested = await adapter.getNested();

    const entries = [...parsed.entries, ...nested.entries];

    const parsedReferences = await parseReferences(
      merged.contentful.referenceSets,
      entries.filter(
        ({ sys }) =>
          sys?.contentType?.sys?.id === merged.contentful.estateContentTypeId
      ),
      contentful,
      locales
    );

    const content = {
      entries: [...parsedReferences, ...entries],
      assets: [...parsed.assets, ...nested.assets],
    };

    process.env.DEBUG &&
      writeFileSync('content-import.json', JSON.stringify(content, null, 2));

    stats.changed = {
      entries: getCountAndIds(content.entries),
      assets: getCountAndIds(content.assets),
    };

    const { publishedAssets, publishedEntries } = await contentful.import(
      content
    );

    stats.published = {
      entries: getCountAndIds(publishedEntries),
      assets: getCountAndIds(publishedAssets),
    };

    clearCache();
    return httpResponse(
      200,
      `"${merged.domain}" ${merged.portal.type} (${merged.portal.version}) > ${merged.contentful.spaceId} (${merged.contentful.environmentId}) synced successfully`,
      {
        portal: {
          type: merged.portal.type,
          version: merged.portal.version,
        },
        contentful: {
          spaceId: merged.contentful.spaceId,
          environmentId: merged.contentful.environmentId,
        },
        stats,
      }
    );
  } catch (error) {
    Logger.error(error);
    clearCache();
    return httpResponse(error.statusCode, error.message, error);
  }
};
