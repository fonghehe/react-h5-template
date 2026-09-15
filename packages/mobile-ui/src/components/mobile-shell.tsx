'use client';

import { Bot, FlaskConical, Home, PackageSearch, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { cartTotals, useCartStore } from '@rh5/stores';

import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

const tabs = [
  { href: '/home', key: 'home', icon: Home },
  { href: '/products', key: 'products', icon: PackageSearch },
  { href: '/examples', key: 'examples', icon: FlaskConical },
  { href: '/member', key: 'member', icon: UserRound },
] as const;

export function MobileShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { TabBar } = useUi();
  const { t } = useTranslation();
  const itemCount = useCartStore((state) => cartTotals(state.lines).itemCount);
  const currentPath = pathname ?? '/home';
  const active = tabs.find((tab) => currentPath.startsWith(tab.href))?.href ?? '/home';
  const hideNavigation = ['/login', '/cart', '/checkout', '/ai', '/products/'].some((route) =>
    currentPath.startsWith(route),
  );

  return (
    <main className="app-frame">
      <div className={hideNavigation ? 'app-scroll' : 'app-scroll with-tabs'}>{children}</div>
      {!hideNavigation && (
        <>
          <Link className="floating-ai" href="/ai" aria-label={t('openAi')}>
            <Bot size={22} />
          </Link>
          <nav className="bottom-tabs" aria-label={t('mainNavigation')}>
            <TabBar
              activeKey={active}
              onChange={(key) => router.push(key)}
              items={tabs.map((tab) => {
                const Icon = tab.icon;
                return {
                  badge: tab.href === '/products' && itemCount > 0 ? itemCount : undefined,
                  icon: <Icon size={22} />,
                  key: tab.href,
                  label: t(tab.key),
                };
              })}
            />
          </nav>
        </>
      )}
    </main>
  );
}
