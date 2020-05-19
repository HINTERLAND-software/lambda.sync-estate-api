import { Entry } from 'contentful-management/typings/entry';
import { Locale } from 'contentful-management/typings/locale';
import {
  MetaLinkProps,
  MetaSysProps,
} from 'contentful-management/typings/meta';
import { createHash } from 'crypto';
import { parse } from 'url';
import { ImportEntitySys, ValidMimeTypes } from '../../types';

export const hash = (arg: string): string =>
  createHash('md5').update(arg).digest('hex');

export const getAssetType = (url: string): ValidMimeTypes => {
  const { pathname } = parse(url);
  if (pathname.includes('.pdf')) return 'application/pdf';
  if (pathname.includes('.png')) return 'image/png';
  return 'image/jpeg';
};

export const genID = (length: number = 22): string => {
  return [...Array(length)]
    .map(() => (~~(Math.random() * 36)).toString(36))
    .join('');
};

export const getSys = (
  type: string,
  contentTypeID?: string,
  entityID: string = genID()
): ImportEntitySys => {
  const sys: ImportEntitySys = {
    id: entityID,
    type,
    publishedVersion: 1,
  };

  if (type === 'Entry') {
    sys.contentType = {
      sys: {
        type: 'Link',
        linkType: 'ContentType',
        id: contentTypeID,
      },
    };
  }

  return sys;
};

export const getLinkedEntities = (
  entries: Entry[],
  defaultLocale: Locale
): (MetaSysProps & MetaLinkProps)[] => {
  const linkedEntities: (MetaSysProps & MetaLinkProps)[] = [];
  entries.forEach(({ fields }) => {
    Object.values(fields).forEach((field) => {
      const value = field[defaultLocale.code];
      if (value) {
        const values = Array.isArray(value) ? value : [value];
        values.forEach(({ sys }) => {
          if (sys && sys.id) linkedEntities.push(sys);
        });
      }
    });
  });
  return linkedEntities;
};
