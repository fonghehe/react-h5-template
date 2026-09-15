import type { Metadata, Viewport } from 'next';
import '@rh5/ui-arco-mobile/styles.css';
import '@rh5/styles/globals.css';

import { NetworkBanner } from '@rh5/mobile-ui';
import { Providers } from '../components/providers';

export const metadata: Metadata = {
  title: { default: 'React H5 · Arco Mobile', template: '%s · React H5 · Arco Mobile' },
  description: 'Next.js 16 + React 19 mobile full-stack monorepo template.',
  applicationName: 'React H5 · Arco Mobile',
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
