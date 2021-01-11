import { Locale } from 'contentful-management/dist/typings/export-types';
import * as aggregators from 'estate-portal-aggregator';
import {
  BasicAuth,
  OAuth,
  TokenAuth,
} from 'estate-portal-aggregator/lib/classes/Authorization';
import { Aggregator } from 'estate-portal-aggregator/lib/classes/portals/Aggregator';
import {
  Estate,
  RealEstateDetailedProperties,
} from 'estate-portal-aggregator/lib/classes/portals/Estate';
import { AvailableLanguages } from 'estate-portal-aggregator/lib/types';
import {
  Dictionaries,
  PortalConfig,
  TranslatedEstateProperties,
} from './types';
import { Logger } from './utils';

let cache: { [id: string]: Estate } = {};
export const clearCache = () => (cache = {});

export class Portal {
  constructor(private config: PortalConfig, private locales: Locale[]) {}
  private _dictionaries: Dictionaries;

  private get aggregator(): Aggregator {
    const { type, version, credentials } = this.config;
    switch (type) {
      case 'flowfact':
        return version === 'v1'
          ? new aggregators.FlowFactV1(credentials as BasicAuth)
          : new aggregators.FlowFactV2(credentials as TokenAuth);
      case 'immobilienscout24':
        if (version === 'v1') {
          return new aggregators.Immobilienscout24(credentials as OAuth);
        }
      default:
        throw new Error(`Portal "${type}" (${version}) is not set up`);
    }
  }

  public get dictionaries() {
    return this._dictionaries;
  }

  public async init() {
    this._dictionaries = await this.locales.reduce(async (red, { code }) => {
      const locale = code.split('-')[0] as AvailableLanguages;
      return {
        ...(await red),
        [code]: {
          common: aggregators.generateCommonPropertiesDictionary(locale),
          estate: await this.aggregator.generateDictionary(locale),
        },
      };
    }, {});
  }

  private async fetchEstate(id: string, attempt: number = 1): Promise<Estate> {
    let estate = cache[id];
    if (!estate) {
      try {
        estate = await this.aggregator.fetchEstate(id);
      } catch (error) {
        Logger.error(`Error fetching estate "${id}" (${attempt})`, error);
        if (attempt >= 10) {
          throw error;
        }
        return this.fetchEstate(id, (attempt += 1));
      }
    }
    cache[id] = estate;
    return estate;
  }

  private async fetchEstatePropertiesForLocale(
    id: string,
    locale: Locale
  ): Promise<RealEstateDetailedProperties> {
    const estate = await this.fetchEstate(id);
    const properties = estate.getProperties(
      true,
      this._dictionaries[locale.code].estate
    ) as RealEstateDetailedProperties;

    return properties;
  }

  private async fetchEstatesPropertiesForLocale(
    ids: string[],
    locale: Locale
  ): Promise<RealEstateDetailedProperties[]> {
    return Promise.all(
      ids.map((id) => this.fetchEstatePropertiesForLocale(id, locale))
    );
  }

  public async fetchEstatesPropertiesForLocales(
    ids: string[],
    locales: Locale[]
  ): Promise<TranslatedEstateProperties> {
    return locales.reduce(
      async (acc, locale) => ({
        ...(await acc),
        [locale.code]: await this.fetchEstatesPropertiesForLocale(ids, locale),
      }),
      {}
    );
  }
}
