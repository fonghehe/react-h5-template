'use client';

import { Clipboard, Share2, Smartphone, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PageHeader } from '../components/page-header';
import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

export default function MobileExamplePage() {
  const { Button, toast } = useUi();
  const { t } = useTranslation();
  const [online, setOnline] = useState(true);
  const [capabilities, setCapabilities] = useState<{
    clipboard: boolean;
    dynamicViewport: boolean;
    share: boolean;
  } | null>(null);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    const capabilityFrame = window.requestAnimationFrame(() => {
      setCapabilities({
        clipboard: Boolean(navigator.clipboard),
        dynamicViewport: Boolean(window.visualViewport),
        share: Reflect.has(navigator, 'share'),
      });
    });
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.cancelAnimationFrame(capabilityFrame);
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const share = async () => {
    if (navigator.share) await navigator.share({ title: document.title, url: location.href });
    else toast(t('shareUnsupported'), 'error');
  };

  return (
    <>
      <PageHeader title={t('mobilePageTitle')} />
      <section className="page demo-page">
        <header>
          <span className="eyebrow">{t('mobileEyebrow')}</span>
          <h1>{t('mobileCapabilityTitle')}</h1>
          <p>{t('mobileCapabilityDescription')}</p>
        </header>
        <div className="mobile-status-grid">
          <article>
            <Wifi size={20} />
            <span>{t('network')}</span>
            <strong>{t(online ? 'detectOnline' : 'detectOffline')}</strong>
          </article>
          <article>
            <Share2 size={20} />
            <span>{t('share')}</span>
            <strong>
              {capabilities
                ? t(capabilities.share ? 'detectSupported' : 'detectDegraded')
                : t('detectChecking')}
            </strong>
          </article>
          <article>
            <Clipboard size={20} />
            <span>{t('clipboard')}</span>
            <strong>
              {capabilities
                ? t(capabilities.clipboard ? 'detectSupported' : 'detectDegraded')
                : t('detectChecking')}
            </strong>
          </article>
          <article>
            <Smartphone size={20} />
            <span>{t('viewport')}</span>
            <strong>
              {capabilities
                ? t(capabilities.dynamicViewport ? 'detectDynamic' : 'detectStandard')
                : t('detectChecking')}
            </strong>
          </article>
        </div>
        <Button block tone="primary" size="large" onClick={share}>
          <span className="button-content">
            <Share2 size={17} /> {t('shareAction')}
          </span>
        </Button>
        <Button
          block
          onClick={async () => {
            await navigator.clipboard?.writeText(location.href);
            toast(t('clipboardCopied'), 'success');
          }}
        >
          <span className="button-content">
            <Clipboard size={17} /> {t('copyLink')}
          </span>
        </Button>
      </section>
    </>
  );
}
