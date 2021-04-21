export default {
  type: 'object',
  additionalProperties: false,
  properties: {
    updates: {
      type: 'object',
      additionalProperties: false,
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
      additionalProperties: false,
      required: ['domain', 'portal', 'contentful'],
      properties: {
        domain: {
          type: 'string',
        },
        portal: {
          type: 'object',
          additionalProperties: false,
          required: ['type', 'version'],
          properties: {
            type: {
              enum: ['immobilienscout24', 'flowfact'],
            },
            version: {
              enum: ['v1', 'v2'],
            },
          },
        },
        contentful: {
          type: 'object',
          additionalProperties: false,
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
} as const;
