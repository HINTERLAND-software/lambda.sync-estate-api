export const mockParameters = {
  'hinterland.software': {
    domain: 'hinterland.software',
    portal: {
      type: 'immobilienscout24',
      version: 'v1',
      credentials: {
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
        oauthToken: 'oauthToken',
        oauthTokenSecret: 'oauthTokenSecret',
      },
    },
    contentful: {
      cmaToken: 'cmaToken',
      referenceSets: [
        {
          contentTypeId: 'pageEstates',
          entityId: '1',
          referenceKey: {
            key: 'estates',
            filter: "$[?(@.fields.marketingType.en == 'Rent')]",
          },
          keys: {
            identifier: 'identifier',
            type: 'type',
            hasBackgroundColor: false,
            resources: [],
          },
        },
      ],
    },
  },
  'foobar.com': {
    domain: 'foobar.com',
    portal: {
      type: 'flowfact',
      version: 'v2',
      credentials: {
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
        oauthToken: 'oauthToken',
        oauthTokenSecret: 'oauthTokenSecret',
      },
    },
    contentful: {
      cmaToken: 'cmaToken',
    },
  },
};

export class SSM {
  getParameter({ Name }) {
    const result = mockParameters[Name.split('/').pop()];
    if (!result) throw new Error('ParameterNotFound');
    return {
      promise: jest
        .fn()
        .mockResolvedValue({ Parameter: { Value: JSON.stringify(result) } }),
    };
  }
}
