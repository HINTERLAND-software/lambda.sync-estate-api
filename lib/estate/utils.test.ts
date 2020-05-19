import { genID, hash, getAssetType, getSys, getLinkedEntities } from './utils';
import { mockEstates } from '../__mocks__/contentful-management';

describe('utils.ts', () => {
  it('should generate unique IDs', () => {
    const id1 = genID(10);
    const id2 = genID(10);
    expect(id1).not.toBe(id2);
    expect(id1.length).toBe(10);
  });

  it('should generate a hash', () => {
    const result = hash('123456');
    expect(result).toBe('e10adc3949ba59abbe56e057f20f883e');
  });

  it('should return the correct mime type', () => {
    const resultPdf = getAssetType('https://baz/foobar.pdf');
    const resultPng = getAssetType('https://baz/foobar.png');
    const resultJpeg = getAssetType('https://baz/foobar.jpeg');
    const resultDefault = getAssetType('https://baz/foobar');
    expect(resultPdf).toBe('application/pdf');
    expect(resultPng).toBe('image/png');
    expect(resultJpeg).toBe('image/jpeg');
    expect(resultDefault).toBe('image/jpeg');
  });

  it('should return an asset sys', () => {
    const result = getSys('Asset', 'contentTypeId', 'entityId');
    expect(result).toEqual({
      id: 'entityId',
      publishedVersion: 1,
      type: 'Asset',
    });
  });

  it('should return an entry sys', () => {
    const result = getSys('Entry', 'contentTypeId', 'entityId');
    expect(result).toEqual({
      id: 'entityId',
      publishedVersion: 1,
      type: 'Entry',
      contentType: {
        sys: {
          type: 'Link',
          linkType: 'ContentType',
          id: 'contentTypeId',
        },
      },
    });
  });

  it('should return the linked entities', () => {
    const result = getLinkedEntities(
      mockEstates.items as any,
      { code: 'de' } as any
    );
    expect(result).toEqual([{ id: 'linked1' }, { id: 'linked2' }]);
  });
});
