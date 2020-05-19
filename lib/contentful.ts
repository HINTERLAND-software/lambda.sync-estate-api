import contentfulImport from 'contentful-import';
import * as contentful from 'contentful-management';
import { Asset } from 'contentful-management/typings/asset';
import { ContentType } from 'contentful-management/typings/contentType';
import { Entry } from 'contentful-management/typings/entry';
import { Environment } from 'contentful-management/typings/environment';
import { Locale } from 'contentful-management/typings/locale';
import {
  MetaLinkProps,
  MetaSysProps,
} from 'contentful-management/typings/meta';
import { Space } from 'contentful-management/typings/space';
import { ContentfulConfig, ContentImport } from '../types';
import { Logger } from './utils';

export class Contentful {
  constructor(private config: ContentfulConfig) {}
  private client: contentful.ClientAPI;
  private space: Space;
  private env: Environment;

  public async init() {
    const { cmaToken: accessToken, environmentId, spaceId } = this.config;
    this.client = contentful.createClient({ accessToken });
    this.space = await this.client.getSpace(spaceId);
    this.env = await this.space.getEnvironment(environmentId);
  }

  public async getLocales(): Promise<Locale[]> {
    return this.env.getLocales().then(({ items }) => items);
  }

  public async getEntry(id: string): Promise<Entry> {
    return this.env.getEntry(id);
  }

  public async getEntries(
    contentTypeId: string,
    ids: string[]
  ): Promise<Entry[]> {
    return this.env
      .getEntries({
        content_type: contentTypeId,
        'sys.id[in]': ids.join(','),
      })
      .then(({ items }) => items);
  }

  public async getAsset(id: string): Promise<Asset> {
    return this.env.getAsset(id);
  }

  public getContentType(contentTypeId: string): Promise<ContentType> {
    return this.env.getContentType(contentTypeId);
  }

  public async deleteSave(entity: Entry | Asset): Promise<void> {
    try {
      await entity.unpublish();
    } catch (error) {
    } finally {
      await entity.delete();
    }
  }

  public async deleteBySys({ id, linkType }: MetaSysProps & MetaLinkProps) {
    try {
      const entity =
        linkType === 'Entry'
          ? await this.getEntry(id)
          : await this.getAsset(id);
      if (entity) await this.deleteSave(entity);
    } catch (error) {
      Logger.error(`Error deleting entity "${id}" (${linkType})`, error);
    }
  }

  public async import(content: ContentImport): Promise<any> {
    const { spaceId, environmentId, cmaToken: accessToken } = this.config;
    return contentfulImport({
      content,
      spaceId,
      environmentId,
      skipContentModel: true,
      managementToken: accessToken,
    });
  }
}
