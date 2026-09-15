'use client';

import { AppProviders } from '@rh5/mobile-ui/providers';
import { nutuiKit } from '@rh5/ui-nutui';

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppProviders kit={nutuiKit}>{children}</AppProviders>;
}
