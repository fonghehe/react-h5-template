'use client';

import { useUi } from '../ui';
import { useTranslation } from '../hooks/use-translation';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { Button, ErrorState } = useUi();
  const { t } = useTranslation();
  return (
    <main className="app-frame">
      <div className="route-error">
        <ErrorState
          title={t('errorTitle')}
          description={t('errorDescription')}
          action={
            <Button tone="primary" onClick={reset}>
              {t('retry')}
            </Button>
          }
        />
      </div>
    </main>
  );
}
