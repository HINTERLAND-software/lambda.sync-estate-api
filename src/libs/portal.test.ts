import { Portal } from './portal';
import { mockParameters } from './__mocks__/aws-sdk';
import {
  filteredResponseFFV2,
  mockDictionaries,
} from './__mocks__/estate-portal-aggregator';

const configIS24 = mockParameters['hinterland.software'].portal as any;
const configFFV2 = mockParameters['foobar.com'].portal as any;

const locales = [{ code: 'de' }, { code: 'en' }];

describe('portal.ts', () => {
  it('initializes Immobilienscout24 v1', async () => {
    const cls = new Portal(configIS24, locales as any[]);
    expect(cls).toBeInstanceOf(Portal);
    await cls.init();
    expect(cls.dictionaries).toEqual(mockDictionaries);
  });

  it('initializes FlowFact v2', async () => {
    const cls = new Portal(configFFV2, locales as any[]);
    expect(cls).toBeInstanceOf(Portal);
    await cls.init();
    expect(cls.dictionaries).toEqual(mockDictionaries);
  });

  it('returns fetched estate properties in a dictionary', async () => {
    const cls = new Portal(configFFV2, locales as any[]);
    await cls.init();
    const result = await cls.fetchEstatesPropertiesForLocales(
      ['1', '6'],
      locales as any[]
    );
    expect(result).toEqual({
      de: filteredResponseFFV2,
      en: filteredResponseFFV2,
    });
  });
});
