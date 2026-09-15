'use client';

import { useTranslation } from '../hooks/use-translation';

export default function Loading() {
  const { t } = useTranslation();
  return <output className="route-loading">{t('loading')}</output>;
}
