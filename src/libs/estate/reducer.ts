import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';
import { KeyTranslatedValueMap, KeyValueMap, NestedEntity } from '../types';
import { slug } from '../utils';
import { getAssetType, hash, genID } from './utils';
import { upperFirst } from 'lodash';
import { ContentFields } from 'contentful-management/dist/typings/export-types';

export const getReducer = (field: ContentFields): Reducer => {
  switch (field.id) {
    case 'attachments':
      return new AttachmentReducer(field);
    case 'address':
      return new AddressReducer(field);
    case 'marketingType':
      return new MarketingTypeReducer(field);
    case 'price':
      return new PriceReducer(field);
    case 'space':
      return new SpaceReducer(field);
    case 'rooms':
      return new RoomsReducer(field);
    case 'slug':
      return new SlugReducer(field);
    case 'autoSynced':
      return new AutoSyncedReducer(field);
    case 'freeFormTexts':
      return new FreeFormTextsReducer(field);
    case 'specifications':
      return new SpecificationsReducer(field);
    default:
      return new Reducer(field);
  }
};

export class Reducer {
  constructor(protected field: ContentFields) {}
  async reduce(
    [{ value }]: KeyTranslatedValueMap[] = [{ key: 'N/A', dictionary: {} }]
  ): Promise<any | undefined> {
    return value;
  }
}

export class AttachmentReducer extends Reducer {
  async reduce(
    val: KeyTranslatedValueMap[]
  ): Promise<NestedEntity[] | undefined> {
    if (val === undefined || val === null) return;
    const [{ value = [] }] = val;
    return value
      .filter(({ url }) => !!url)
      .map(({ url, title, fileName, contentType }) => ({
        contentTypeID: 'attachment',
        entityID: hash(url),
        fields: {
          title,
          file: {
            url: url.replace(/^http[s]?:/, ''),
            fileName: fileName || title || genID(6),
            contentType: contentType || getAssetType(url),
          },
        },
      }));
  }
}

export class MarketingTypeReducer extends Reducer {
  async reduce([{ value }]: KeyTranslatedValueMap[]): Promise<
    string | undefined
  > {
    if (value === undefined || value === null) return;
    return value
      .split('_')
      .map((s) => upperFirst(s.toLowerCase()))
      .join(' / ');
  }
}

export class AddressReducer extends Reducer {
  async reduce([{ value }]: KeyTranslatedValueMap[]): Promise<
    string | undefined
  > {
    if (value === undefined || value === null) return;
    const text = [
      value.street,
      [value.postcode, value.city].filter(Boolean).join(' '),
      value.country,
    ]
      .filter(Boolean)
      .join('\n');

    return text;
  }
}

export class PriceReducer extends Reducer {
  async reduce([{ value }]: KeyTranslatedValueMap[]): Promise<
    string | undefined
  > {
    if (value === undefined || value === null) return;
    return `${value.value} ${value.currency || '€'}`;
  }
}

export class SpaceReducer extends Reducer {
  async reduce([{ value }]: KeyTranslatedValueMap[]): Promise<
    string | undefined
  > {
    if (value === undefined || value === null) return;
    return `${value} m²`;
  }
}

export class RoomsReducer extends Reducer {
  async reduce([{ value }]: KeyTranslatedValueMap[]): Promise<
    number | undefined
  > {
    if (value === undefined || value === null) return;
    const result = Number.parseInt(value);
    if (isNaN(result)) return;
    return result;
  }
}

export class AutoSyncedReducer extends Reducer {
  async reduce(): Promise<boolean> {
    return true;
  }
}

export class SlugReducer extends Reducer {
  async reduce([{ value }]: KeyTranslatedValueMap[]): Promise<string> {
    return slug(value);
  }
}

export class FreeFormTextsReducer extends Reducer {
  async reduce(
    val: KeyTranslatedValueMap[]
  ): Promise<NestedEntity[] | undefined> {
    if (val === undefined || val === null) return;
    return Promise.all(
      val.filter(Boolean).map(async ({ dictionary, value, key }) => ({
        contentTypeID: 'estateResource',
        entityID: hash(`${key}${value}`),
        fields: {
          key: dictionary[key.toLowerCase()] || key,
          value: await richTextFromMarkdown(value),
        },
      }))
    );
  }
}

export class SpecificationsReducer extends Reducer {
  async reduce(
    val: KeyTranslatedValueMap[]
  ): Promise<KeyValueMap[] | undefined> {
    if (val === undefined || val === null) return;
    return val
      .filter(({ value }) => value !== undefined)
      .map(({ key, value, dictionary }) => ({
        key: dictionary[key.toLowerCase()] || key,
        value:
          typeof value === 'boolean'
            ? value
              ? dictionary.yes || 'Yes'
              : dictionary.no || 'No'
            : dictionary[value.toString().toLowerCase()] || value.toString(),
      }));
  }
}
