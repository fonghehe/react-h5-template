'use client';

import { AppProviders } from '@rh5/mobile-ui/providers';
import { antdMobileKit } from '@rh5/ui-antd-mobile';

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppProviders kit={antdMobileKit}>{children}</AppProviders>;
}
