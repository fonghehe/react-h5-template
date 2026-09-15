'use client';

import { ArrowRight, Blocks, DatabaseZap, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

export default function HomePage() {
  const ui = useUi();
  const { t } = useTranslation();
  const capabilities = [
    { icon: Sparkles, title: t('capabilityAiTitle'), body: t('capabilityAiBody') },
    { icon: DatabaseZap, title: t('capabilityServerTitle'), body: t('capabilityServerBody') },
    { icon: ShieldCheck, title: t('capabilityContractTitle'), body: t('capabilityContractBody') },
  ];
  return (
    <section className="page home-page">
      <header className="hero-card">
        <div className="hero-mark">
          <Blocks size={22} />
        </div>
        <span className="eyebrow">{t('homeEyebrow')}</span>
        <h1>{t('greeting')}</h1>
        <p>{t('homeDescription')}</p>
        <Link className="primary-link" href="/products">
          {t('browse')} <ArrowRight size={18} />
        </Link>
      </header>

      <div className="section-heading">
        <div>
          <span className="eyebrow">{t('capabilitiesEyebrow')}</span>
          <h2>{t('capabilityHeading')}</h2>
        </div>
      </div>
      <div className="capability-grid">
        {capabilities.map(({ icon: Icon, title, body }) => (
          <article className="capability-card" key={title}>
            <div className="capability-icon">
              <Icon size={20} />
            </div>
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </div>

      <section className="stack-card">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">{t('baselineEyebrow')}</span>
            <h2>{t('stack')}</h2>
          </div>
        </div>
        {[
          ['Next.js 16 + React 19', 'App Router / RSC / Route Handler'],
          [`Tailwind CSS 4 + ${ui.name}`, t('stackStyle')],
          ['TanStack Query + Zustand', t('stackState')],
          ['React Hook Form + Zod', t('stackForm')],
          ['Vitest + Playwright + MSW', t('stackMock')],
        ].map(([name, description]) => (
          <div className="stack-row" key={name}>
            <strong>{name}</strong>
            <small>{description}</small>
          </div>
        ))}
      </section>
    </section>
  );
}
