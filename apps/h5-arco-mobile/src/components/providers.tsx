'use client';

import { AppProviders } from '@rh5/mobile-ui/providers';
import { arcoMobileKit } from '@rh5/ui-arco-mobile';

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppProviders kit={arcoMobileKit}>{children}</AppProviders>;
}
