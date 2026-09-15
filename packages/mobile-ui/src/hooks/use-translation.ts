'use client';

import { formatCurrency, translate, type MessageKey, type TranslationValues } from '@rh5/i18n';
import { useSessionStore } from '@rh5/stores';

export function useTranslation() {
  const locale = useSessionStore((state) => state.locale);
  return {
    formatMoney: (value: number) => formatCurrency(locale, value),
    locale,
    t: (key: MessageKey, values?: TranslationValues) => translate(locale, key, values),
  };
}
