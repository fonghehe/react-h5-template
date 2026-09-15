'use client';

import { CheckCircle2, LoaderCircle, Send } from 'lucide-react';
import { useState } from 'react';

import { api } from '@rh5/api-client';
import { PageHeader } from '../components/page-header';
import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

export default function RequestExamplePage() {
  const { Button } = useUi();
  const { locale, t } = useTranslation();
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const send = async () => {
    setLoading(true);
    try {
      const data = await api.products({ locale, page: 1, pageSize: 1 });
      setResult(t('requestSuccess', { count: data.total, name: data.items[0]?.title ?? '-' }));
    } catch (error) {
      setResult(error instanceof Error ? error.message : t('requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title={t('requestPageTitle')} />
      <section className="page demo-page">
        <header>
          <span className="eyebrow">{t('requestEyebrow')}</span>
          <h1>{t('requestTitle')}</h1>
          <p>{t('requestDescription')}</p>
        </header>
        <pre className="code-card">
          <code>{`const data = await api.products({\n  locale, page: 1, pageSize: 1\n})`}</code>
        </pre>
        <output className="request-result">
          {loading ? <LoaderCircle className="spin" size={19} /> : <CheckCircle2 size={19} />}
          <span>{result ?? t('requestInitial')}</span>
        </output>
        <Button block tone="primary" size="large" loading={loading} onClick={send}>
          <span className="button-content">
            <Send size={17} /> {t('requestSend')}
          </span>
        </Button>
      </section>
    </>
  );
}
