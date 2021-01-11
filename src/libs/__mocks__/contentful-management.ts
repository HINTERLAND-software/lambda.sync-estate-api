const entry = (arg) => getEntity({ ...arg, type: 'Entry' });
const asset = (arg) => getEntity({ ...arg, type: 'Asset' });

const getEntity = ({ id, type, updatedAt, linked, ...rest }: any) => {
  const fields: any = Object.entries(rest).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: { de: value } }),
    {}
  );
  if (linked) {
    fields.linked = linked;
  }
  return {
    sys: { id, updatedAt, type },
    fields,
    unpublish: jest.fn(),
    delete: jest.fn(),
  };
};

export const mockEstates = {
  items: [
    entry({
      id: '1',
      updatedAt: '2020-05-14T04:31:11Z',
      autoSynced: true,
      identifier: 'iden',
      linked: { de: { sys: { id: 'linked1' } } },
    }),
    entry({
      id: '2',
      updatedAt: '2020-05-14T04:31:11Z',
      autoSynced: true,
    }),
    entry({
      id: '3',
      updatedAt: '2020-05-14T04:31:11Z',
      autoSynced: false,
      linked: { de: { sys: { id: 'linked2' } } },
    }),
    entry({
      id: '4',
      updatedAt: '2020-05-14T04:31:11Z',
      autoSynced: true,
    }),
  ],
};

export const mockAssets = {
  items: [
    asset({
      id: '3',
      updatedAt: '2020-05-14T04:31:11Z',
      autoSynced: true,
    }),
    asset({
      id: '4',
      updatedAt: '2020-05-14T04:31:11Z',
      autoSynced: true,
    }),
    asset({
      id: '6',
      updatedAt: '2020-05-14T04:31:11Z',
      autoSynced: false,
    }),
    asset({
      id: '8',
      updatedAt: '2020-05-14T04:31:11Z',
      autoSynced: true,
    }),
  ],
};

export const mockCommon = mockEstates.items;

export const mockContentTypes = {
  estate: {
    fields: [
      { id: 'marketingType', type: 'Symbol' },
      {
        id: 'freeFormTexts',
        type: 'Array',
        items: { type: 'Link', linkType: 'Entry' },
      },
      {
        id: 'attachments',
        type: 'Array',
        items: { type: 'Link', linkType: 'Asset' },
      },
      {
        id: 'specifications',
        type: 'Object',
      },
    ],
  },
  pageEstates: {
    fields: [
      { id: 'identifier', type: 'Symbol' },
      { id: 'type', type: 'Symbol' },
      { id: 'hasBackgroundColor', type: 'Boolean' },
      {
        id: 'estates',
        type: 'Array',
        items: { type: 'Link', linkType: 'Entry' },
      },
      {
        id: 'resources',
        type: 'Array',
        items: { type: 'Link', linkType: 'Entry' },
      },
    ],
  },
};

export const mockLocales = {
  items: [{ code: 'de', default: true }, { code: 'en' }],
};

class Client {
  public async getSpace(): Promise<any> {
    return new Space();
  }
}

class Space {
  public async getEnvironment(): Promise<any> {
    return new Environment();
  }
}

class Environment {
  public async getEntry(id: string): Promise<any> {
    const res = mockEstates.items.find((entry) => entry.sys.id === id);
    if (!res) throw new Error('404');
    return res;
  }

  public async getEntries(req: any): Promise<any> {
    const result = { ...mockEstates };
    result.items = result.items.filter((entry) =>
      req['sys.id[in]'].split(',').includes(entry.sys.id)
    );
    return result;
  }

  public async getAsset(id: string): Promise<any> {
    const res = mockAssets.items.find((entry) => entry.sys.id === id);
    if (!res) throw new Error('404');
    return res;
  }

  public async getLocales(): Promise<any> {
    return mockLocales;
  }

  public async getContentType(id: string): Promise<any> {
    const res = mockContentTypes[id];
    if (!res) throw new Error('404');
    return res;
  }

  public async import(content: any): Promise<any> {
    return {
      publishedEntries: content.entries,
      publishedAssets: content.assets,
    };
  }
}

export const createClient = () => new Client();
