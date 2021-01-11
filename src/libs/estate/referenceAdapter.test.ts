import { parseReferences } from './referenceAdapter';
import { mockLocales } from '../__mocks__/contentful-management';
import { Contentful } from '../contentful';
import { mockParameters } from '../__mocks__/aws-sdk';
import { parsedResult } from '../__mocks__/results';

const referenceSets = [
  ...mockParameters['hinterland.software'].contentful.referenceSets,
];

const resultFields = {
  estates: {
    de: [
      { sys: { id: '5', linkType: 'Entry', type: 'Link' } },
      { sys: { id: '2', linkType: 'Entry', type: 'Link' } },
      { sys: { id: '4', linkType: 'Entry', type: 'Link' } },
    ],
  },
  hasBackgroundColor: { de: false },
  identifier: { de: 'iden' },
  resources: { de: [] },
  type: { de: 'type' },
};

describe('referenceAdapter.ts', () => {
  it('parses the references', async () => {
    const contentful = new Contentful(
      mockParameters['foobar.com'].contentful as any
    );
    await contentful.init();
    const result = await parseReferences(
      referenceSets,
      parsedResult.entries,
      contentful,
      mockLocales.items as any
    );

    expect(result).toEqual([
      {
        fields: resultFields,
        sys: {
          id: '1',
          type: 'Entry',
          updatedAt: '2020-05-14T04:31:11Z',
        },
      },
    ]);
  });

  it('parses the references and creates an reference entity', async () => {
    const contentful = new Contentful(
      mockParameters['foobar.com'].contentful as any
    );
    await contentful.init();

    referenceSets[0].entityId = 'foo';
    resultFields.identifier.de = referenceSets[0].keys.identifier;

    const result = await parseReferences(
      referenceSets,
      parsedResult.entries,
      contentful,
      mockLocales.items as any
    );

    expect(result).toEqual([
      {
        fields: resultFields,
        sys: {
          contentType: {
            sys: {
              id: 'pageEstates',
              linkType: 'ContentType',
              type: 'Link',
            },
          },
          id: 'foo',
          publishedVersion: 1,
          type: 'Entry',
        },
      },
    ]);
  });
});
