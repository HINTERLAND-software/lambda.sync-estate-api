import { Entry, Locale } from 'contentful-management/dist/typings/export-types';
import jp from 'jsonpath';
import { get, uniqBy } from 'lodash';
import { Contentful } from '../contentful';
import { ImportEntity, LinkType, ReferenceSet } from '../types';
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

const handleExistingReferences = (
  linked: ImportEntity[],
  existingLinked?: ImportEntity[],
  deletedIDs: String[] = []
): ImportEntity[] => {
  const kept = existingLinked?.filter(
    ({ sys }) =>
      !deletedIDs.includes(sys.id) &&
      !linked.some(({ sys: lSys }) => lSys.id === sys.id)
  );
  return uniqBy([...linked, ...(kept || [])], 'sys.id');
};

const parseReference = async (
  referenceSet: ReferenceSet,
  entities: ImportEntity[],
  contentful: Contentful,
  locales: Locale[],
  deletedIDs?: String[]
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
        if (existingFieldValue) {
          mapped = isReferenceField
            ? handleExistingReferences(mapped, existingFieldValue, deletedIDs)
            : existingFieldValue;
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
  locales: Locale[],
  deletedIDs?: String[]
): Promise<ImportEntity[]> => {
  return Promise.all(
    referenceSets.map((refSet) =>
      parseReference(refSet, estates, contentful, locales, deletedIDs)
    )
  );
};
