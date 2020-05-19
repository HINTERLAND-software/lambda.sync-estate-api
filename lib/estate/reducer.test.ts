import {
  getReducer,
  AttachmentReducer,
  AddressReducer,
  MarketingTypeReducer,
  PriceReducer,
  SpaceReducer,
  SlugReducer,
  AutoSyncedReducer,
  FreeFormTextsReducer,
  SpecificationsReducer,
  Reducer,
} from './reducer';

describe('parser.ts', () => {
  it('should get the correct parser', () => {
    expect(getReducer({ id: 'attachments' } as any)).toBeInstanceOf(
      AttachmentReducer
    );
    expect(getReducer({ id: 'marketingType' } as any)).toBeInstanceOf(
      MarketingTypeReducer
    );
    expect(getReducer({ id: 'address' } as any)).toBeInstanceOf(AddressReducer);
    expect(getReducer({ id: 'price' } as any)).toBeInstanceOf(PriceReducer);
    expect(getReducer({ id: 'space' } as any)).toBeInstanceOf(SpaceReducer);
    expect(getReducer({ id: 'slug' } as any)).toBeInstanceOf(SlugReducer);
    expect(getReducer({ id: 'autoSynced' } as any)).toBeInstanceOf(
      AutoSyncedReducer
    );
    expect(getReducer({ id: 'freeFormTexts' } as any)).toBeInstanceOf(
      FreeFormTextsReducer
    );
    expect(getReducer({ id: 'specifications' } as any)).toBeInstanceOf(
      SpecificationsReducer
    );
    expect(getReducer({ id: 'Foo' } as any)).toBeInstanceOf(Reducer);
  });

  it('should reduce attachments', async () => {
    const reducer = getReducer({ id: 'attachments' } as any);
    expect(
      await reducer.reduce([
        {
          value: [
            {
              url: 'https://foobar/foo.png',
              title: 'title1',
              fileName: 'fileName',
              contentType: 'contentType',
            },
            {
              url: '//foobar/foo.pdf',
              title: 'title2',
            },
          ],
        },
      ] as any)
    ).toEqual([
      {
        contentTypeID: 'attachment',
        entityID: '0cc9dff8541c8c40529a11dc2f2f4934',
        fields: {
          file: {
            contentType: 'contentType',
            fileName: 'fileName',
            url: '//foobar/foo.png',
          },
          title: 'title1',
        },
      },
      {
        contentTypeID: 'attachment',
        entityID: 'fa543b8673d62fe112c8d837dc704709',
        fields: {
          file: {
            contentType: 'application/pdf',
            fileName: 'title2',
            url: '//foobar/foo.pdf',
          },
          title: 'title2',
        },
      },
    ]);
  });

  it('should reduce marketingType', async () => {
    const reducer = getReducer({ id: 'marketingType' } as any);
    expect(
      await reducer.reduce([
        {
          value: 'RENT',
        },
      ] as any)
    ).toBe('Rent');
  });

  it('should reduce address', async () => {
    const reducer = getReducer({ id: 'address' } as any);
    expect(
      await reducer.reduce([
        {
          value: { street: 'street', postcode: '12345' },
        },
      ] as any)
    ).toBe('street\n12345');

    expect(
      await reducer.reduce([
        {
          value: {
            street: 'street',
            postcode: '12345',
            city: 'city',
            country: 'country',
          },
        },
      ] as any)
    ).toBe('street\n12345 city\ncountry');
  });

  it('should reduce price', async () => {
    const reducer = getReducer({ id: 'price' } as any);
    expect(
      await reducer.reduce([
        {
          value: { value: 1000, currency: '$' },
        },
      ] as any)
    ).toBe('1000 $');
    expect(
      await reducer.reduce([
        {
          value: { value: 2000 },
        },
      ] as any)
    ).toBe('2000 €');
  });

  it('should reduce space', async () => {
    const reducer = getReducer({ id: 'space' } as any);
    expect(
      await reducer.reduce([
        {
          value: 100,
        },
      ] as any)
    ).toBe('100 m²');
  });

  it('should reduce slug', async () => {
    const reducer = getReducer({ id: 'slug' } as any);
    expect(
      await reducer.reduce([
        {
          value: 'Foobaü Små',
        },
      ] as any)
    ).toBe('foobaue-sm');
  });

  it('should reduce autoSynced', async () => {
    const reducer = getReducer({ id: 'autoSynced' } as any);
    expect(await reducer.reduce()).toBe(true);
  });

  it('should reduce freeFormTexts', async () => {
    const reducer = getReducer({ id: 'freeFormTexts' } as any);
    expect(
      await reducer.reduce([
        undefined,
        {
          key: 'Foo',
          value: 'Bar',
          dictionary: { foo: 'füü' },
        },
        {
          key: 'Bar',
          value: 'Snoo',
          dictionary: { foo: 'füü' },
        },
      ] as any)
    ).toEqual([
      {
        contentTypeID: 'estateResource',
        entityID: 'f32a26e2a3a8aa338cd77b6e1263c535',
        fields: {
          key: 'füü',
          value: {
            content: [
              {
                content: [
                  { data: {}, marks: [], nodeType: 'text', value: 'Bar' },
                ],
                data: {},
                nodeType: 'paragraph',
              },
            ],
            data: {},
            nodeType: 'document',
          },
        },
      },
      {
        contentTypeID: 'estateResource',
        entityID: 'd62d1ff54512d9ae332247809bb887fd',
        fields: {
          key: 'Bar',
          value: {
            content: [
              {
                content: [
                  { data: {}, marks: [], nodeType: 'text', value: 'Snoo' },
                ],
                data: {},
                nodeType: 'paragraph',
              },
            ],
            data: {},
            nodeType: 'document',
          },
        },
      },
    ]);
  });

  it('should reduce specifications', async () => {
    const reducer = getReducer({
      id: 'specifications',
    } as any);
    expect(
      await reducer.reduce([
        {
          value: undefined,
        },
        {
          key: 'Key',
          value: false,
          dictionary: { no: 'Nein' },
        },
        {
          key: 'Foo',
          value: 'Bar',
          dictionary: { foo: 'füü' },
        },
        {
          key: 'Bar',
          value: 'Snoo',
          dictionary: { snoo: 'Snoop' },
        },
      ] as any)
    ).toEqual([
      { key: 'Key', value: 'Nein' },
      { key: 'füü', value: 'Bar' },
      { key: 'Bar', value: 'Snoop' },
    ]);
  });
});
