export default {
  type: 'object',
  properties: {
    updates: {
      type: 'object',
      required: ['updated', 'created', 'deleted'],
      properties: {
        updated: {
          type: 'array',
          items: {
            anyOf: [{ type: 'string' }],
          },
        },
        created: {
          type: 'array',
          items: {
            anyOf: [{ type: 'string' }],
          },
        },
        deleted: {
          type: 'array',
          items: {
            anyOf: [{ type: 'string' }],
          },
        },
      },
    },
    config: {
      type: 'object',
      required: ['domain', 'portal', 'contentful'],
      properties: {
        domain: {
          type: 'string',
        },
        portal: {
          type: 'object',
          required: ['type', 'version'],
          properties: {
            type: {
              type: 'string',
            },
            version: {
              type: 'string',
            },
          },
        },
        contentful: {
          type: 'object',
          required: ['estateContentTypeId', 'environmentId', 'spaceId'],
          properties: {
            estateContentTypeId: {
              type: 'string',
            },
            environmentId: {
              type: 'string',
            },
            spaceId: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  required: ['updates', 'config'],
};
