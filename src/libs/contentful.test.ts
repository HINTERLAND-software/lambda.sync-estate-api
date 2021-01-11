import { Contentful } from './contentful';
import { mockParameters } from './__mocks__/aws-sdk';
import {
  mockEstates,
  mockAssets,
  mockLocales,
  mockContentTypes,
} from './__mocks__/contentful-management';

const config: any = mockParameters['hinterland.software'].contentful;

describe('contentful.ts', () => {
  it('initializes Contentful', async () => {
    const cls = new Contentful(config);
    await cls.init();
    expect(cls).toBeInstanceOf(Contentful);
  });

  it('returns fetched locales', async () => {
    const cls = new Contentful(config);
    await cls.init();
    expect(cls).toBeInstanceOf(Contentful);
    const result = await cls.getLocales();
    expect(result).toEqual(mockLocales.items);
  });

  it('returns a single entry', async () => {
    const cls = new Contentful(config);
    await cls.init();
    const result = await cls.getEntry('1');
    expect(result).toEqual(mockEstates.items[0]);
  });

  it('returns multiple entries', async () => {
    const cls = new Contentful(config);
    await cls.init();
    const result = await cls.getEntries('estate', ['1', '2']);
    expect(result).toEqual([mockEstates.items[0], mockEstates.items[1]]);
  });

  it('returns a single asset', async () => {
    const cls = new Contentful(config);
    await cls.init();
    const result = await cls.getAsset('3');
    expect(result).toEqual(mockAssets.items[0]);
  });

  it('returns a single content type', async () => {
    const cls = new Contentful(config);
    await cls.init();
    const result = await cls.getContentType('estate');
    expect(result).toEqual(mockContentTypes.estate);
  });

  it('deletes an entry safely', async () => {
    const cls = new Contentful(config);
    await cls.init();
    const entity: any = mockEstates.items[0];
    await cls.deleteSave(entity);
    expect(entity.unpublish).toHaveBeenCalledTimes(1);
    expect(entity.delete).toHaveBeenCalledTimes(1);
  });

  it('deletes an entry safely by sys', async () => {
    const cls = new Contentful(config);
    await cls.init();
    const entity: any = mockEstates.items[1];
    await cls.deleteBySys({ id: '2', linkType: 'Entry' } as any);
    expect(entity.unpublish).toHaveBeenCalledTimes(1);
    expect(entity.delete).toHaveBeenCalledTimes(1);
  });

  it('deletes an asset safely by sys', async () => {
    const cls = new Contentful(config);
    await cls.init();
    const entity: any = mockAssets.items[1];
    await cls.deleteBySys({ id: '4', linkType: 'Asset' } as any);
    expect(entity.unpublish).toHaveBeenCalledTimes(1);
    expect(entity.delete).toHaveBeenCalledTimes(1);
  });

  it('fails soft when entity does not exist', async () => {
    const cls = new Contentful(config);
    await cls.init();
    await cls.deleteBySys({ id: '666', linkType: 'Asset' } as any);
  });

  it('imports', async () => {
    const cls = new Contentful(config);
    await cls.init();
    const content = { entries: [], assets: [] };
    const result = await cls.import(content);
    expect(result).toEqual({
      content,
      environmentId: undefined,
      managementToken: 'cmaToken',
      skipContentModel: true,
      spaceId: undefined,
    });
  });
});
