import {
  OAuth,
  BasicAuth,
  TokenAuth,
} from 'estate-portal-aggregator/lib/classes/Authorization';
import {
  Mapping,
  RealEstateDetailedProperties,
} from 'estate-portal-aggregator/lib/classes/portals/Estate';
import { MetaSysProps } from 'contentful-management/typings/meta';
import { EntrySys, EntryProp } from 'contentful-management/typings/entry';
import { LinkType } from 'contentful-management/typings/appDefinition';

export interface KeyTranslatedValueMap {
  key: string;
  dictionary: Mapping;
  value?: any;
}

export interface KeyValueMap {
  key: string;
  value: any;
}

export interface KeyMappings {
  [key: string]: string[];
}

export interface WebhookResponse {
  url: string;
  triggered: boolean;
  hasUpdates: boolean;
  disabled: boolean;
  response?: any;
}

export interface Payload {
  config: Config;
  updates: {
    deleted: string[];
    updated: string[];
    created: string[];
  };
}

export type FlowFactVersion = 'v1' | 'v2';
export type Immobilienscout24Version = 'v1';

export type Types = 'immobilienscout24' | 'flowfact';

export declare interface PortalConfig {
  filter?: string;
  type: Types;
  version: FlowFactVersion | Immobilienscout24Version;
  credentials: OAuth | BasicAuth | TokenAuth;
}

export declare interface ReferenceSet {
  contentTypeId: string;
  entityId?: string;
  referenceKey: {
    key: string;
    filter: string;
  };
  keys?: Mapping;
}

export declare interface ContentfulConfig {
  cmaToken: string;
  filter?: string;
  estateContentTypeId: string;
  environmentId: string;
  spaceId: string;
  referenceSets?: ReferenceSet[];
}

export declare interface Config {
  domain: string;
  portal: PortalConfig;
  contentful: ContentfulConfig;
}

export declare interface ContentImport {
  entries: ImportEntity[];
  assets: ImportEntity[];
}

export declare interface TranslatedEstateProperties {
  [code: string]: RealEstateDetailedProperties[];
}

export declare interface Dictionaries {
  [code: string]: Dictionary;
}

export declare interface Dictionary {
  common: Mapping;
  estate: Mapping;
}

export declare interface NestedEntity {
  fields: EntryProp['fields'];
  entityID: string;
  contentTypeID: string;
}

export declare interface ImportEntity {
  sys: ImportEntitySys;
  fields?: EntryProp['fields'];
  entity?: NestedEntity;
}

export declare interface ImportEntitySys
  extends Omit<MetaSysProps, 'createdAt' | 'updatedAt' | 'version'> {
  publishedVersion?: number;
  contentType?: EntrySys['contentType'];
  linkType?: LinkType;
}

export declare type ValidMimeTypes =
  | 'image/jpeg'
  | 'application/pdf'
  | 'image/png';

export declare interface StatsCountIds {
  count: number;
  ids: string[];
}
