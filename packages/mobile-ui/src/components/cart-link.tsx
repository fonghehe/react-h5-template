'use client';

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

import { useCartStore } from '@rh5/stores';

import { useTranslation } from '../hooks/use-translation';

export function CartLink() {
  const { t } = useTranslation();
  const itemCount = useCartStore((state) =>
    state.lines.reduce((sum, line) => sum + line.quantity, 0),
  );

  return (
    <Link className="cart-pill" href="/cart" aria-label={t('cartAria', { count: itemCount })}>
      <ShoppingBag size={20} />
      <span>{itemCount > 99 ? '99+' : itemCount}</span>
    </Link>
  );
}
