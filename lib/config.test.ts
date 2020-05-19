import { getConfig, mergeConfig } from './config';
import { mockParameters } from './__mocks__/aws-sdk';

describe('config.ts', () => {
  it('should return the config for a domain', async () => {
    const result = await getConfig('hinterland.software');
    expect(result).toEqual(mockParameters['hinterland.software']);
  });

  it('should throw if config not found', async () => {
    try {
      await getConfig('xyz');
    } catch (error) {
      expect(error.message).toBe('ParameterNotFound');
    }
  });

  it('should merge the configs', async () => {
    const configOne: any = {
      domain: 'foo',
      portal: {
        credentials: { token: 'token' },
        type: 'immobilienscout24',
        version: 'v2',
      },
    };
    const configTwo: any = {
      domain: 'bar',
      contentful: {
        spaceId: 'spaceId',
      },
      portal: {
        credentials: {
          customer: '',
          user: 'user',
          password: 'pw',
        },
        type: 'flowfact',
        version: 'v1',
      },
    };
    const result = mergeConfig(configOne, configTwo);
    expect(result).toEqual({
      contentful: {
        spaceId: 'spaceId',
      },
      domain: 'bar',
      portal: {
        credentials: {
          customer: '',
          password: 'pw',
          user: 'user',
        },
        type: 'flowfact',
        version: 'v1',
      },
    });
  });
});
