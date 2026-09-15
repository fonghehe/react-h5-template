'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

import { api } from '@rh5/api-client';
import { cartTotals, useCartStore } from '@rh5/stores';

import { ProductCard } from '../components/product-card';
import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

export default function ProductsPage() {
  const { Button, ErrorState, InfiniteScroll, PullToRefresh, Skeleton } = useUi();
  const { locale, t } = useTranslation();
  const itemCount = useCartStore((state) => cartTotals(state.lines).itemCount);
  const products = useInfiniteQuery({
    queryKey: ['products', locale],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api.products({ locale, page: pageParam, pageSize: 4 }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
  const items = products.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section className="page commerce-page">
      <header className="catalog-header">
        <div>
          <span className="eyebrow">{t('productsEyebrow')}</span>
          <h1>{t('productsTitle')}</h1>
        </div>
        <Link className="cart-pill" href="/cart" aria-label={t('cartAria', { count: itemCount })}>
          <ShoppingBag size={20} />
          <span>{itemCount > 99 ? '99+' : itemCount}</span>
        </Link>
      </header>
      <p className="page-intro">{t('productsDescription')}</p>

      {products.isPending ? (
        <div className="product-list" aria-label={t('loadingProducts')}>
          {[1, 2, 3].map((item) => (
            <Skeleton className="product-skeleton" key={item} />
          ))}
        </div>
      ) : products.isError ? (
        <ErrorState
          title={t('productFailed')}
          description={products.error.message}
          action={
            <Button
              tone="primary"
              onClick={async () => {
                await products.refetch();
              }}
            >
              {t('retry')}
            </Button>
          }
        />
      ) : (
        <PullToRefresh
          onRefresh={async () => {
            await products.refetch();
          }}
        >
          <div className="product-list">
            {items.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
          <InfiniteScroll
            loadMore={async () => {
              await products.fetchNextPage();
            }}
            hasMore={Boolean(products.hasNextPage)}
          />
        </PullToRefresh>
      )}
    </section>
  );
}
