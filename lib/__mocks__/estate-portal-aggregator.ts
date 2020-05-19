class MockEstate {
  constructor(private values) {}
  getProperties() {
    return this.values;
  }
}

export const mockEstatesIS24 = [
  new MockEstate({
    internalID: '5',
    updatedAt: 123456789,
    archived: false,
    active: true,
    marketingType: 'RENT',
    furnishingNote: 'furnishingNote',
  }),
  new MockEstate({
    internalID: '2',
    updatedAt: 1589430671234,
    archived: false,
    active: true,
    marketingType: 'RENT',
    numberOfBedRooms: 3,
    price: {
      value: 2600,
      currency: '€',
    },
  }),
  new MockEstate({
    internalID: '3',
    updatedAt: 1589430671000,
    archived: false,
    active: true,
    marketingType: 'PURCHASE',
    balcony: true,
  }),
  new MockEstate({
    internalID: '4',
    updatedAt: 1589430671239,
    archived: true,
    active: true,
    marketingType: 'RENT',
    attachments: [
      {
        title: 'Titelbild',
        url:
          'https://pictures.immobilienscout24.de/listings/32836a42-9b4f-48a5-856d-f3e42a430cf0-1367406248.jpg',
      },
    ],
  }),
];

export const mockCommonIS24 = mockEstatesIS24.map((estate) =>
  estate.getProperties()
);

export const filteredResponseIS24 = [mockCommonIS24[0], mockCommonIS24[1]];

export const mockEstatesFFV2 = [
  new MockEstate({
    internalID: '1',
    updatedAt: 123456789,
    archived: false,
    active: true,
    marketingType: 'RENT',
  }),
  new MockEstate({
    internalID: '6',
    updatedAt: 1589430671234,
    archived: false,
    active: true,
    marketingType: 'RENT',
  }),
  new MockEstate({
    internalID: '4',
    updatedAt: 1589430671234,
    archived: false,
    active: true,
    marketingType: 'RENT',
  }),
];

export const mockCommonFFV2 = mockEstatesFFV2.map((estate) =>
  estate.getProperties()
);

export const filteredResponseFFV2 = [mockCommonFFV2[0], mockCommonFFV2[1]];

export const mockEstateDictionary = {
  de: { marketingType: 'Marketing Typ' },
  en: { marketingType: 'Marketing Type' },
};

export const mockCommonDictionary = {
  de: { yes: 'Ja' },
  en: { yes: 'Yes' },
};

export const mockDictionaries = {
  de: {
    common: mockCommonDictionary.de,
    estate: mockEstateDictionary.de,
  },
  en: {
    common: mockCommonDictionary.en,
    estate: mockEstateDictionary.en,
  },
};

export const generateCommonPropertiesDictionary = (locale: string) => {
  return mockCommonDictionary[locale];
};

export class Immobilienscout24 {
  public async fetchEstate(id: string): Promise<any> {
    const res = mockEstatesIS24.find(
      (estate) => estate.getProperties().internalID === id
    );
    if (!res) throw Error('404');
    return res;
  }

  public async generateDictionary(locale: string) {
    return mockEstateDictionary[locale];
  }
}

export class FlowFactV2 {
  public async fetchEstate(id): Promise<any> {
    const res = mockEstatesFFV2.find(
      (estate) => estate.getProperties().internalID === id
    );
    if (!res) throw Error('404');
    return res;
  }

  public async generateDictionary(locale: string) {
    return mockEstateDictionary[locale];
  }
}
export class FlowFactV1 extends Immobilienscout24 {}
