import {
  Locale,
  ContentType,
  ContentFields,
} from 'contentful-management/dist/typings/export-types';
import { get, set, isEqual, assign } from 'lodash';
import {
  ContentImport,
  Dictionaries,
  ImportEntity,
  TranslatedEstateProperties,
  OverridesConfig,
} from '../types';
import { getParser } from './parser';
import { getReducer } from './reducer';
import { getSys } from './utils';
import keyMappings from './keyMappings';

const getUnique = (arr: ImportEntity[], path) => {
  // store the comparison  values in array
  const unique = arr
    .map((item) => get(item, path))
    // store the indexes of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)
    // eliminate the false indexes & return unique objects
    .filter((e) => arr[e])
    .map((e) => arr[e]);
  return unique;
};

export class EstateContentfulAdapter {
  private nested: { [key: string]: ImportEntity } = {};
  private _parsed: ImportEntity[];

  constructor(
    private data: TranslatedEstateProperties,
    private dictionaries: Dictionaries,
    private locales: Locale[],
    private contentType: ContentType,
    private overrides?: OverridesConfig
  ) {}

  private set parsed(parsed: ImportEntity[]) {
    this._parsed = getUnique(parsed, 'sys.id');
  }

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
      const reducer = getReducer(field);
      const parser = getParser(field);
      const localized = await this.locales.reduce(
        async (red, { code, default: isDefault, fallbackCode }) => {
          if (isDefault) {
            id = get(this.data[code], `[${i}].internalID`);
          }

          const parse = async (code, i, field) => {
            if (!code) return;
            const processed = this.data[code];
            const dictionary = assign(
              {},
              this.dictionaries[code]?.common,
              this.dictionaries[code]?.estate,
              this.overrides?.dictionary?.[code]
            );
            const item = get(processed, i);
            const keys = this.getKeys(field);

            const blacklist = this.overrides?.blacklist || [];

            const keysValues = keys
              .filter((key) => !blacklist.includes(key))
              .map((key) => ({
                key,
                value: get(item, key),
                dictionary,
              }));

            const reduced = await reducer.reduce(keysValues);
            return parser.parse(reduced);
          };

          const parsed = await parse(code, i, field);
          const parsedFallback = await parse(fallbackCode, i, field);

          if (
            isEqual(parsed, parsedFallback) ||
            parsed === undefined ||
            parsed === null
          ) {
            return red;
          }

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
      this._parsed ||
      (await Promise.all(
        this.data[this.locales[0].code].map(this.parseEstate)
      ));
    this.parsed = parsed;

    return this.sortAssetsEntries(parsed);
  };

  public getNested = async (): Promise<ContentImport> => {
    const parsed =
      this._parsed ||
      (await Promise.all(
        this.data[this.locales[0].code].map(this.parseEstate)
      ));
    this.parsed = parsed;

    return this.sortAssetsEntries(Object.values(this.nested));
  };
}
