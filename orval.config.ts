import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: './openapi/schema.yaml',
    output: {
      target: './packages/api-client/src/generated/generated/endpoints.ts',
      schemas: './packages/api-client/src/generated/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      mock: true,
      mode: 'split',
      clean: true,
    },
  },
});
