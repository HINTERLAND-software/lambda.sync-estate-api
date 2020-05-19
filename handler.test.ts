import { sync } from './handler';

const responseBody = {
  message:
    '"hinterland.software" immobilienscout24 (v1) > spaceId (master-01) synced successfully',
  result: {
    portal: { type: 'immobilienscout24', version: 'v1' },
    contentful: { spaceId: 'spaceId', environmentId: 'master-01' },
    stats: {
      deleted: {
        entries: { count: 1, ids: ['2'] },
        nestedEntities: { count: 0, ids: [] },
      },
      changed: {
        entries: {
          count: 8,
          ids: [
            '1',
            '5',
            '3',
            '8dabbf62a25c9b50c0ba6e0a2e1e8e73',
            '8701cf3ecd852e7dceefe405e00aa8b0',
            'ad3d4b00dd3ed91dc3534782f6d89640',
            '8741d891c7adc9fb22278ef98d1b5700',
            '9a4b479625cd798cf37b391fe73570da',
          ],
        },
        assets: { count: 0, ids: [] },
      },
      published: {
        entries: { count: 0, ids: [] },
        assets: { count: 0, ids: [] },
      },
    },
  },
};

describe('handler.ts', () => {
  it('returns successfully', async () => {
    const result = await sync(
      {
        body: {
          updates: {
            created: ['5'],
            deleted: ['2'],
            updated: ['3'],
          },
          config: {
            domain: 'hinterland.software',
            portal: {
              type: 'immobilienscout24',
              version: 'v1',
            },
            contentful: {
              estateContentTypeId: 'estate',
              environmentId: 'master-01',
              spaceId: 'spaceId',
            },
          },
        },
      } as any,
      undefined,
      undefined
    );

    expect(result).toEqual({
      body: JSON.stringify(responseBody),
      headers: {
        'Access-Control-Allow-Credentials': '*',
        'Access-Control-Allow-Origin': '*',
      },
      statusCode: 200,
    });
  });
});
