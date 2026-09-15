# Internationalization and documentation locales

The **application** supports `en-US`, `zh-CN`, `ja-JP`, `zh-HK`, and `zh-TW`. The **documentation site** has English at `/`, Simplified Chinese at `/zh/`, and Japanese at `/ja/`; the root locale is English. These are separate products of the same repository: five-language UI coverage does not mean all database-managed content or docs pages are available in five languages.

## Runtime language flow

The selected application locale lives in the persisted Zustand session store. `AppProviders` hydrates the store on the client and sets `<html lang>`. The member-page picker updates the preference; `useTranslation()` reads it for labels, validation descriptions, accessibility text, and currency formatting. Where supported, the concrete UI adapter receives the same locale for component-provided labels. Product Query keys include locale, so changing the language fetches a distinct cache entry. The API client sends it as `Accept-Language`; the server negotiates weighted values and chooses supported messages and demo catalog text.

`packages/i18n/src/messages.ts` defines one typed key set and complete dictionaries for the five application locales. Add a key to all dictionaries in one change; TypeScript checks the shape. UI form errors are translated in the screen rather than using Zod's Chinese message strings directly. Server errors are separate localized messages in `packages/server/src/http.ts`. Do not use translated message strings as programmatic error identifiers.

## Catalog and known gaps

Bundled product records have per-locale presentation text. In PostgreSQL mode, the repository chooses among three title columns but keeps shop name, delivery, and description from shared columns. Hong Kong and Taiwan use the Chinese title column. A production catalog needs a translation/content model for all editorial fields, fallback behavior, a review workflow, and tests for missing translations. Currency display is currently localized RMB formatting, not price conversion or multicurrency settlement.

## Documentation workflow

Every sidebar topic has matching English, Chinese, and Japanese paths. The VitePress config at `docs/.vitepress/config.mts` controls locale labels, navigation, and the GitHub Pages base path. Write the English explanation first, then update the matching `/zh/` and `/ja/` pages so all readers get the same facts and capability boundaries. Build with `pnpm build:docs` and verify the three generated path families. A translation should preserve commands, endpoint names, and whether a feature is current or proposed.
