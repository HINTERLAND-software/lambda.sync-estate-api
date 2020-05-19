import { ContentFields } from 'contentful-management/typings/contentFields';
import { ContentType } from 'contentful-management/typings/contentType';
import { Locale } from 'contentful-management/typings/locale';
import { get, set } from 'lodash';
import {
  ContentImport,
  Dictionaries,
  ImportEntity,
  TranslatedEstateProperties,
} from '../../types';
import { getParser } from './parser';
import { getReducer } from './reducer';
import { getSys } from './utils';
import keyMappings from './keyMappings';

export class EstateContentfulAdapter {
  private nested: { [key: string]: ImportEntity } = {};
  private parsed: ImportEntity[];

  constructor(
    private data: TranslatedEstateProperties,
    private dictionaries: Dictionaries,
    private locales: Locale[],
    private contentType: ContentType
  ) {}

  private extractNestedEntity = (parsed, locale) => {
    const array = Array.isArray(parsed) ? parsed : [parsed];
    array.forEach(async (item) => {
      const {
        entity: { fields, entityID, contentTypeID } = {},
        sys: { linkType } = {},
      } = item as ImportEntity;
      if (fields) {
        const sys = getSys(linkType, contentTypeID, entityID);
        Object.entries(fields).forEach(([key, value]) => {
          set(this.nested, `[${sys.id}].sys`, sys);
          set(this.nested, `[${sys.id}].fields[${key}][${locale}]`, value);
        });
      }
      delete item.entity;
    });
  };

  private getKeys = (field: ContentFields) => {
    return keyMappings[field.id] || [field.id];
  };

  private parseEstate = async (_, i: number): Promise<ImportEntity> => {
    let id: string;
    const fields = await this.contentType.fields.reduce(async (red, field) => {
      const localized = await this.locales.reduce(
        async (red, { code, default: isDefault }) => {
          const processed = this.data[code];
          const dictionary = this.dictionaries[code].common;

          if (isDefault) {
            id = get(processed, `[${i}].internalID`);
          }

          const keys = this.getKeys(field);

          const keysValues = keys.map((key) => ({
            key,
            value: get(processed, `[${i}][${key}]`),
            dictionary,
          }));

          const reduced = await getReducer(field).reduce(keysValues);
          const parsed = await getParser(field).parse(reduced);

          if (parsed === undefined || parsed === null) return null;
          this.extractNestedEntity(parsed, code);

          return { ...(await red), [code]: parsed };
        },
        {}
      );

      if (!localized) return red;

      return { ...(await red), [field.id]: localized };
    }, {});

    return {
      sys: getSys('Entry', 'estate', id),
      fields,
    };
  };

  private sortAssetsEntries = (arr: ImportEntity[]): ContentImport => {
    return arr.reduce(
      (red, entity) => {
        const type = entity.sys.type === 'Entry' ? 'entries' : 'assets';
        return { ...red, [type]: [...red[type], entity] };
      },
      { assets: [], entries: [] } as ContentImport
    );
  };

  public getParsed = async (): Promise<ContentImport> => {
    const parsed =
      this.parsed ||
      (await Promise.all(
        this.data[this.locales[0].code].map(this.parseEstate)
      ));
    this.parsed = parsed;

    return this.sortAssetsEntries(parsed);
  };

  public getNested = async (): Promise<ContentImport> => {
    const parsed =
      this.parsed ||
      (await Promise.all(
        this.data[this.locales[0].code].map(this.parseEstate)
      ));
    this.parsed = parsed;

    return this.sortAssetsEntries(Object.values(this.nested));
  };
}
