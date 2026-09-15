import type { Metadata, Viewport } from 'next';
import '@rh5/ui-nutui/styles.css';
import '@rh5/styles/globals.css';

import { NetworkBanner } from '@rh5/mobile-ui';
import { Providers } from '../components/providers';

export const metadata: Metadata = {
  title: { default: 'React H5 · NutUI React', template: '%s · React H5 · NutUI React' },
  description: 'Next.js 16 + React 19 mobile full-stack monorepo template.',
  applicationName: 'React H5 · NutUI React',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#4169e1',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <NetworkBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
