import 'source-map-support/register';
import { writeFileSync } from 'fs';
import { getConfig, mergeConfig } from '@libs/config';
import { Contentful } from '@libs/contentful';
import { EstateContentfulAdapter } from '@libs/estate/entityAdapter';
import { parseReferences } from '@libs/estate/referenceAdapter';
import { getLinkedEntities } from '@libs/estate/utils';
import { clearCache, Portal } from '@libs/portal';
import { getCountAndIds, Logger } from '@libs/utils';
// import { middyfy } from '@libs/lambda';
import {
  httpResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway';

import schema from './schema';

export const sync: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    const { config, updates } =
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
      estateContentType,
      merged.overrides
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
      locales,
      updates.deleted
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

// export const main = middyfy(sync);
export const main = sync;
