'use client';

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

import type { Product } from '@rh5/contracts';
import { useCartStore } from '@rh5/stores';

import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

export function ProductCard({ product }: { product: Product }) {
  const add = useCartStore((state) => state.add);
  const { formatMoney, t } = useTranslation();
  const { Button, toast } = useUi();
  return (
    <article className="product-card">
      <Link className="product-card-image" href={`/products/${product.id}`}>
        {/* Remote demo assets intentionally use native lazy loading to keep the template provider-agnostic. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt={product.title} loading="lazy" />
      </Link>
      <div className="product-card-body">
        <div className="product-meta">
          <span>{product.shopBadge}</span>
          <small>{product.shopName}</small>
        </div>
        <Link className="product-title" href={`/products/${product.id}`}>
          {product.title}
        </Link>
        <p>{product.description}</p>
        <small className="delivery">{product.delivery}</small>
      </div>
      <footer className="product-card-footer">
        <div>
          <strong>{formatMoney(product.price)}</strong>
          <small>{t('memberPrice', { amount: formatMoney(product.memberPrice) })}</small>
        </div>
        <Button
          className="round-action"
          size="small"
          onClick={() => {
            add(product);
            toast(t('added'), 'success');
          }}
        >
          <span className="button-content">
            <ShoppingBag size={17} /> {t('add')}
          </span>
        </Button>
      </footer>
    </article>
  );
}
