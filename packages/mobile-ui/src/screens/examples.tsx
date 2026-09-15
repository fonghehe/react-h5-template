'use client';

import { ArrowRight, Braces, DatabaseZap, FlaskConical, Smartphone } from 'lucide-react';
import Link from 'next/link';

import { useTranslation } from '../hooks/use-translation';

export default function ExamplesPage() {
  const { t } = useTranslation();
  const demos = [
    {
      href: '/examples/query',
      icon: DatabaseZap,
      title: 'TanStack Query',
      body: t('exampleQueryBody'),
    },
    {
      href: '/examples/request',
      icon: Braces,
      title: 'Typed Fetch',
      body: t('exampleRequestBody'),
    },
    {
      href: '/examples/mobile',
      icon: Smartphone,
      title: 'Mobile Web APIs',
      body: t('exampleMobileBody'),
    },
  ];
  return (
    <section className="page examples-page">
      <header className="examples-heading">
        <div className="examples-icon">
          <FlaskConical size={23} />
        </div>
        <span className="eyebrow">{t('examplesEyebrow')}</span>
        <h1>{t('exampleTitle')}</h1>
        <p>{t('exampleDescription')}</p>
      </header>
      <div className="example-list">
        {demos.map(({ href, icon: Icon, title, body }, index) => (
          <Link className="example-card" href={href} key={href}>
            <span className="example-number">0{index + 1}</span>
            <div className="example-icon">
              <Icon size={20} />
            </div>
            <div>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
            <ArrowRight className="example-arrow" size={18} />
          </Link>
        ))}
      </div>
    </section>
  );
}
