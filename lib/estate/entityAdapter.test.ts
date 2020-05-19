import { EstateContentfulAdapter } from './entityAdapter';
import {
  mockCommonIS24,
  mockDictionaries,
} from '../__mocks__/estate-portal-aggregator';
import {
  mockLocales,
  mockContentTypes,
} from '../__mocks__/contentful-management';
import { parsedResult, nestedResult } from '../__mocks__/results';

const data: any = {
  de: mockCommonIS24,
  en: mockCommonIS24,
};

describe('estateAdapter.ts', () => {
  it('parses the entities', async () => {
    const cls = new EstateContentfulAdapter(
      data,
      mockDictionaries,
      mockLocales.items as any,
      mockContentTypes.estate as any
    );

    const result = await cls.getParsed();
    expect(result).toEqual(parsedResult);
  });
  it('parses the nested entities', async () => {
    const cls = new EstateContentfulAdapter(
      data,
      mockDictionaries,
      mockLocales.items as any,
      mockContentTypes.estate as any
    );

    const result = await cls.getNested();
    expect(result).toEqual(nestedResult);
  });
});
