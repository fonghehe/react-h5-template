import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  globalIgnores([
    '**/.next/**',
    '**/.turbo/**',
    '**/.vitepress/cache/**',
    '**/.vitepress/dist/**',
    '**/coverage/**',
    '**/dist/**',
    '**/node_modules/**',
    '**/playwright-report/**',
    '**/src/.umi/**',
    '**/src/generated/**',
    'packages/ui-arco-mobile/src/styles.css',
  ]),
]);
