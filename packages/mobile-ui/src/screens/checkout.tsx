'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, MapPin, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

import { checkoutSchema, type CheckoutInput } from '@rh5/contracts';
import { cartTotals, useCartStore } from '@rh5/stores';

import { PageHeader } from '../components/page-header';
import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

export default function CheckoutPage() {
  const { Button, Input, Radio, confirm, toast } = useUi();
  const { formatMoney, t } = useTranslation();
  const router = useRouter();
  const lines = useCartStore((state) => state.lines);
  const clearSelected = useCartStore((state) => state.clearSelected);
  const totals = cartTotals(lines);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { address: '', name: '', payment: 'wechat', phone: '' },
  });

  const submit = handleSubmit(async () => {
    const confirmed = await confirm(
      t('checkoutConfirm', { amount: formatMoney(totals.selectedTotal) }),
    );
    if (!confirmed) return;
    clearSelected();
    toast(t('checkoutComplete'), 'success');
    router.replace('/products');
  });

  return (
    <main className="app-frame">
      <div className="app-scroll commerce-route">
        <PageHeader title={t('checkoutPageTitle')} />
        <section className="page checkout-page">
          <header className="commerce-heading">
            <span className="eyebrow">{t('checkoutEyebrow')}</span>
            <h1>{t('checkoutTitle')}</h1>
            <p>{t('checkoutDescription')}</p>
          </header>
          <form className="checkout-form" onSubmit={submit}>
            <div className="checkout-section">
              <h2>
                <MapPin size={18} /> {t('checkoutDelivery')}
              </h2>
              {(['name', 'phone', 'address'] as const).map((name) => (
                <label className="checkout-field" key={name}>
                  <span>
                    {t(
                      name === 'name'
                        ? 'checkoutName'
                        : name === 'phone'
                          ? 'checkoutPhone'
                          : 'checkoutAddress',
                    )}
                  </span>
                  <Controller
                    control={control}
                    name={name}
                    render={({ field }) => (
                      <Input
                        aria-invalid={Boolean(errors[name])}
                        name={field.name}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        value={field.value}
                        type={name === 'phone' ? 'tel' : 'text'}
                        placeholder={t(
                          name === 'name'
                            ? 'checkoutNamePlaceholder'
                            : name === 'phone'
                              ? 'checkoutPhonePlaceholder'
                              : 'checkoutAddressPlaceholder',
                        )}
                      />
                    )}
                  />
                  {errors[name] && (
                    <small className="field-error">
                      {t(
                        name === 'name'
                          ? 'validationName'
                          : name === 'phone'
                            ? 'validationPhone'
                            : 'validationAddress',
                      )}
                    </small>
                  )}
                </label>
              ))}
            </div>
            <div className="checkout-section">
              <h2>
                <CreditCard size={18} /> {t('checkoutPayment')}
              </h2>
              <Radio checked value="wechat" onChange={() => undefined}>
                {t('checkoutPaymentWechat')}
              </Radio>
            </div>
            <div className="checkout-summary">
              <span>{t('checkoutSelected', { count: totals.selectedCount })}</span>
              <strong>{formatMoney(totals.selectedTotal)}</strong>
            </div>
            <p className="secure-note">
              <ShieldCheck size={16} /> {t('checkoutSecure')}
            </p>
            <div className="checkout-submit">
              <Button
                block
                tone="primary"
                size="large"
                type="submit"
                loading={isSubmitting}
                disabled={totals.selectedCount === 0}
              >
                {t('checkoutSubmit', { amount: formatMoney(totals.selectedTotal) })}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
