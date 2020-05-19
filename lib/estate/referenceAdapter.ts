import { LinkType } from 'contentful-management/typings/appDefinition';
import { Entry } from 'contentful-management/typings/entry';
import { Locale } from 'contentful-management/typings/locale';
import jp from 'jsonpath';
import { get } from 'lodash';
import { ImportEntity, ReferenceSet } from '../../types';
import { Contentful } from '../contentful';
import { slug } from '../utils';
import { getSys } from './utils';

const mapLinked = (linked: ImportEntity[]): ImportEntity[] => {
  if (!Array.isArray(linked) || linked.every(({ sys }) => !sys.type))
    return linked;

  return linked.map(({ sys }) => ({
    sys: {
      type: 'Link',
      linkType: (sys.linkType || sys.type) as LinkType,
      id: sys.id,
    },
  }));
};

const parseReference = async (
  referenceSet: ReferenceSet,
  entities: ImportEntity[],
  contentful: Contentful,
  locales: Locale[]
): Promise<ImportEntity> => {
  const {
    contentTypeId,
    entityId = slug(
      `${contentTypeId}${referenceSet.referenceKey.key}${referenceSet.referenceKey.filter}`
    ),
    referenceKey,
    keys,
  } = referenceSet;
  const { key, filter } = referenceKey;

  keys[key] = filter ? jp.query(entities, filter) : entities;

  let sys;
  let existingEntry: Entry;
  try {
    existingEntry = await contentful.getEntry(entityId);
    sys = existingEntry.sys;
  } catch (error) {
    sys = getSys('Entry', contentTypeId, entityId);
  }
  const contentType = await contentful.getContentType(contentTypeId);

  const fields = contentType.fields.reduce((red, { localized, id }) => {
    const sanitizedLocales = localized
      ? locales
      : locales.filter((locale) => locale.default);
    return {
      ...red,
      [id]: sanitizedLocales.reduce((red, { code }) => {
        let mapped = get(keys, `${code}.${id}`, keys[id]);

        const isReferenceField = id === key;
        const existingFieldValue = get(existingEntry, `fields[${id}][${code}]`);
        if (!isReferenceField && existingFieldValue) {
          mapped = existingFieldValue;
        }

        if (mapped === undefined || mapped === null) return red;
        return {
          ...red,
          [code]: mapLinked(mapped),
        };
      }, {}),
    };
  }, {});

  return { sys, fields };
};

export const parseReferences = (
  referenceSets: ReferenceSet[] = [],
  estates: ImportEntity[],
  contentful: Contentful,
  locales: Locale[]
): Promise<ImportEntity[]> => {
  return Promise.all(
    referenceSets.map((refSet) =>
      parseReference(refSet, estates, contentful, locales)
    )
  );
};
