'use client';

import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { cartTotals, useCartStore } from '@rh5/stores';

import { PageHeader } from '../components/page-header';
import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

export default function CartPage() {
  const { Button, Checkbox, EmptyState, Stepper } = useUi();
  const { formatMoney, t } = useTranslation();
  const router = useRouter();
  const lines = useCartStore((state) => state.lines);
  const remove = useCartStore((state) => state.remove);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const toggle = useCartStore((state) => state.toggle);
  const toggleAll = useCartStore((state) => state.toggleAll);
  const totals = cartTotals(lines);

  return (
    <main className="app-frame">
      <div className="app-scroll commerce-route">
        <PageHeader title={t('cart')} />
        <section className="page cart-page">
          {lines.length === 0 ? (
            <div className="cart-empty">
              <EmptyState
                icon={
                  <div className="empty-icon">
                    <ShoppingBag size={34} />
                  </div>
                }
                description={t('cartEmpty')}
              />
              <Link className="primary-link" href="/products">
                {t('browse')} <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <>
              <header className="commerce-heading">
                <span className="eyebrow">{t('cartEyebrow')}</span>
                <h1>{t('cartConfirmTitle')}</h1>
                <p>{t('cartPersisted', { count: totals.itemCount })}</p>
              </header>
              <div className="cart-lines">
                {lines.map((line) => (
                  <article className="cart-line" key={line.product.id}>
                    <Checkbox
                      checked={line.selected}
                      onChange={() => toggle(line.product.id)}
                      aria-label={t('selectProduct', { name: line.product.title })}
                    />
                    <Link href={`/products/${line.product.id}`} className="cart-line-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={line.product.imageUrl} alt="" />
                    </Link>
                    <div className="cart-line-content">
                      <Link href={`/products/${line.product.id}`}>{line.product.title}</Link>
                      <small>{line.product.delivery}</small>
                      <div className="cart-line-bottom">
                        <strong>{formatMoney(line.product.price)}</strong>
                        <Stepper
                          min={1}
                          max={99}
                          value={line.quantity}
                          onChange={(value) => setQuantity(line.product.id, value)}
                        />
                      </div>
                    </div>
                    <button
                      className="remove-line"
                      onClick={() => remove(line.product.id)}
                      aria-label={t('removeProduct', { name: line.product.title })}
                    >
                      <Trash2 size={17} />
                    </button>
                  </article>
                ))}
              </div>
              <Link className="continue-link" href="/products">
                {t('continueShopping')} <ArrowRight size={16} />
              </Link>
            </>
          )}
        </section>
      </div>
      {lines.length > 0 && (
        <footer className="commerce-dock cart-dock">
          <Checkbox checked={totals.allSelected} onChange={toggleAll}>
            {t('all')}
          </Checkbox>
          <div className="cart-total">
            <small>{t('total')}</small>
            <strong>{formatMoney(totals.selectedTotal)}</strong>
          </div>
          <Button
            tone="primary"
            disabled={totals.selectedCount === 0}
            onClick={() => router.push('/checkout')}
          >
            {t('checkout')} ({totals.selectedCount})
          </Button>
        </footer>
      )}
    </main>
  );
}
