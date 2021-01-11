import 'source-map-support/register';

import { Logger, getEnvironment } from '@libs/utils';
import { middyfy } from '@libs/lambda';
import {
  httpResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway';
import { clearCache } from '@libs/portal';
import { getConfig } from '@libs/config';

export const config: ValidatedEventAPIGatewayProxyEvent<typeof Object> = async (
  event
) => {
  try {
    const { domain } = event.pathParameters;

    const configuration = await getConfig(domain);
    const env = getEnvironment();

    clearCache();
    return httpResponse(200, 'Configuration results', {
      env,
      configuration,
    });
  } catch (error) {
    Logger.error(error);
    clearCache();
    return httpResponse(error.statusCode, error.message, error);
  }
};

export const main = middyfy(config);
