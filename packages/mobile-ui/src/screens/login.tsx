'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LockKeyhole, UserRound } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

import { api } from '@rh5/api-client';
import { loginSchema, type LoginInput } from '@rh5/contracts';
import { useSessionStore } from '@rh5/stores';

import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

function safeRedirect(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/member';
}

export default function LoginPage() {
  const { Button, Input, toast } = useUi();
  const { locale, t } = useTranslation();
  const router = useRouter();
  const search = useSearchParams();
  const login = useSessionStore((state) => state.login);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: 'user', password: '123456' },
  });

  const submit = handleSubmit(async (values) => {
    try {
      const { accessToken, ...user } = await api.login(values, locale);
      login(accessToken, user);
      toast(t('welcome'), 'success');
      router.replace(safeRedirect(search?.get('redirect') ?? null));
    } catch (error) {
      toast(error instanceof Error ? error.message : t('loginFailed'), 'error');
    }
  });

  return (
    <main className="app-frame auth-route">
      <section className="login-page">
        <button className="text-back" onClick={() => router.back()}>
          {t('back')}
        </button>
        <div className="login-mark">
          <span>R</span>
        </div>
        <span className="eyebrow">{t('loginEyebrow')}</span>
        <h1>{t('loginTitle')}</h1>
        <p>{t('loginDescription')}</p>
        <form onSubmit={submit} className="login-form">
          <label>
            <span>
              <UserRound size={17} /> {t('loginUsername')}
            </span>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value}
                  placeholder="user"
                />
              )}
            />
          </label>
          {errors.username && <small className="field-error">{t('validationUsername')}</small>}
          <label>
            <span>
              <LockKeyhole size={17} /> {t('loginPassword')}
            </span>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value}
                  type="password"
                  placeholder={t('loginPasswordHint')}
                />
              )}
            />
          </label>
          {errors.password && <small className="field-error">{t('validationPassword')}</small>}
          <Button block tone="primary" size="large" type="submit" loading={isSubmitting}>
            <span className="button-content">
              {t('login')} <ArrowRight size={18} />
            </span>
          </Button>
        </form>
        <div className="demo-account">
          <strong>{t('demoAccount')}</strong>
          <span>user / 123456</span>
          <span>admin / 123456</span>
        </div>
      </section>
    </main>
  );
}
