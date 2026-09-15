'use client';

import { useNetwork } from 'ahooks';
import { WifiOff } from 'lucide-react';

import { useTranslation } from '../hooks/use-translation';

export function NetworkBanner() {
  const network = useNetwork();
  const { t } = useTranslation();
  if (network.online !== false) return null;
  return (
    <output className="network-banner">
      <WifiOff size={16} /> {t('offline')}
    </output>
  );
}
