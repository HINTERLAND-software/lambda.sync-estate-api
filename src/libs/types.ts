import {
  OAuth,
  BasicAuth,
  TokenAuth,
} from 'estate-portal-aggregator/lib/classes/Authorization';
import {
  Mapping,
  RealEstateDetailedProperties,
} from 'estate-portal-aggregator/lib/classes/portals/Estate';
import {
  MetaSysProps,
  EntityMetaSysProps,
  Entry,
  Asset,
} from 'contentful-management/dist/typings/export-types';

export type LinkType = 'Entry' | 'Asset';

export interface RichText {}
export interface Item {
  type: string;
  linkType?: LinkType;
}

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

export type FlowFactVersion = 'v1' | 'v2';
export type Immobilienscout24Version = 'v1';

export type Types = 'immobilienscout24' | 'flowfact';

export declare interface PortalConfig {
  filter?: string;
  type: Types;
  version: FlowFactVersion | Immobilienscout24Version;
  credentials: OAuth | BasicAuth | TokenAuth;
}

export declare interface OverridesConfig {
  blacklist?: string[];
  dictionary?: {
    [code: string]: Mapping;
  };
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
  overrides: OverridesConfig;
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
  fields: Entry['fields'] | Asset['fields'];
  entityID: string;
  contentTypeID: string;
}

export declare interface ImportEntity {
  sys: ImportEntitySys;
  fields?: Entry['fields'] | Asset['fields'];
  entity?: NestedEntity;
}

export declare interface ImportEntitySys
  extends Omit<MetaSysProps, 'createdAt' | 'updatedAt' | 'version'> {
  publishedVersion?: number;
  contentType?: EntityMetaSysProps['contentType'];
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
