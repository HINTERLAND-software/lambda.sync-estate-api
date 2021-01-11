import { SSM } from 'aws-sdk';
import { Config } from './types';

export const fetchSSM = async (path: string): Promise<string | undefined> => {
  const { AWS_REGION: region, AWS_SSM_PREFIX: prefix } = process.env;
  const ssm = new SSM({ region });
  const result = await ssm
    .getParameter({ Name: `${prefix}${path}`, WithDecryption: true })
    .promise();
  return result.Parameter.Value;
};

export const fetchConfig = (domain: string): Promise<string> => {
  return fetchSSM(`/config/${domain}`);
};

export const parseConfig = (config: string): Config => {
  let parsed: Config;
  try {
    parsed = JSON.parse(config) as Config;
  } catch (error) {
    throw new Error('Misshaped domain config');
  }
  return parsed;
};

export const getConfig = async (domain: string): Promise<Config> => {
  const configString = await fetchConfig(domain);
  const config = parseConfig(configString);

  if (!config.domain) {
    throw new Error(`No configuration found for domain "${domain}"`);
  }

  return config;
};

export const mergeConfig = (
  bodyConfig: Config,
  storedConfig: Config
): Config => {
  return {
    ...bodyConfig,
    ...storedConfig,
    contentful: {
      ...(bodyConfig.contentful || {}),
      ...storedConfig.contentful,
    },
    portal: {
      ...(bodyConfig.portal || {}),
      ...storedConfig.portal,
    },
  };
};
