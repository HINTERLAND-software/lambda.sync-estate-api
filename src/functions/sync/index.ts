import type { AWS } from '@serverless/typescript';
import schema from './schema';

export default {
  handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
  timeout: 600, // timeout 10 mins
  events: [
    {
      http: {
        private: true,
        cors: true,
        path: '/',
        method: 'post',
        async: true,
        request: {
          schema: {
            'application/json': schema,
          },
        },
      },
    },
  ],
} as AWS['functions'];
