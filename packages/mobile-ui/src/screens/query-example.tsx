'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '@rh5/api-client';
import { PageHeader } from '../components/page-header';
import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

export default function QueryExamplePage() {
  const { Button, ErrorState, Skeleton } = useUi();
  const [page, setPage] = useState(1);
  const { formatMoney, locale, t } = useTranslation();
  const query = useQuery({
    queryKey: ['products', 'page', page, locale],
    queryFn: () => api.products({ locale, page, pageSize: 2 }),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader title={t('queryPageTitle')} />
      <section className="page demo-page">
        <header>
          <span className="eyebrow">{t('queryEyebrow')}</span>
          <h1>{t('queryTitle')}</h1>
          <p>{t('queryDescription')}</p>
        </header>
        {query.isPending ? (
          <Skeleton />
        ) : query.isError ? (
          <ErrorState
            title={t('loadFailed')}
            description={query.error.message}
            action={
              <Button
                onClick={async () => {
                  await query.refetch();
                }}
              >
                {t('retry')}
              </Button>
            }
          />
        ) : (
          <div className={query.isPlaceholderData ? 'query-results loading' : 'query-results'}>
            {query.data.items.map((item) => (
              <article key={item.id}>
                <span>#{item.id}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.shopName}</small>
                </div>
                <b>{formatMoney(item.price)}</b>
              </article>
            ))}
          </div>
        )}
        <div className="pagination-row" aria-label={t('pagination')}>
          <Button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
            {t('previous')}
          </Button>
          <span>{page} / 3</span>
          <Button disabled={page === 3} onClick={() => setPage((value) => value + 1)}>
            {t('next')}
          </Button>
        </div>
        <div className="query-status">
          <span className={query.isFetching ? 'status-dot active' : 'status-dot'} />
          {query.isFetching ? t('queryFetching') : t('queryCacheReady')}
        </div>
      </section>
    </>
  );
}
