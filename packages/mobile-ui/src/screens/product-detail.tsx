'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { api } from '@rh5/api-client';
import { useCartStore } from '@rh5/stores';

import { PageHeader } from '../components/page-header';
import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

export default function ProductDetailPage() {
  const { Button, ErrorState, Skeleton, toast } = useUi();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const { formatMoney, locale, t } = useTranslation();
  const add = useCartStore((state) => state.add);
  const [favorite, setFavorite] = useState(false);
  const product = useQuery({
    queryKey: ['product', id, locale],
    queryFn: () => api.product(id, locale),
  });

  return (
    <>
      <PageHeader title={t('productPageTitle')} />
      <section className="page detail-page">
        {product.isPending ? (
          <Skeleton className="detail-skeleton" />
        ) : product.isError ? (
          <ErrorState title={t('productFailed')} description={product.error.message} />
        ) : (
          <article>
            <div className="detail-image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.data.imageUrl} alt={product.data.title} />
              <button
                className={favorite ? 'favorite-button active' : 'favorite-button'}
                onClick={() => setFavorite((value) => !value)}
                aria-label={t(favorite ? 'unfavorite' : 'favorite')}
              >
                <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="detail-content">
              <div className="product-meta">
                <span>{product.data.shopBadge}</span>
                <small>{product.data.shopName}</small>
              </div>
              <h1>{product.data.title}</h1>
              <p>{product.data.description}</p>
              <div className="detail-delivery">
                <span>{product.data.delivery}</span>
                <span>{t('deliveryReturn')}</span>
              </div>
              <div className="detail-price">
                <strong>{formatMoney(product.data.price)}</strong>
                <small>{t('memberPrice', { amount: formatMoney(product.data.memberPrice) })}</small>
              </div>
            </div>
          </article>
        )}
      </section>
      {product.data && (
        <footer className="commerce-dock detail-dock">
          <Link className="dock-cart-link" href="/cart">
            <ShoppingBag size={21} />
            <span>{t('cart')}</span>
          </Link>
          <Button
            block
            tone="primary"
            size="large"
            onClick={() => {
              add(product.data);
              toast(t('added'), 'success');
            }}
          >
            {t('add')}
          </Button>
        </footer>
      )}
    </>
  );
}
