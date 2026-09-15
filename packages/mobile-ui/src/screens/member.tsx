'use client';

import { ChevronRight, Languages, LogIn, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import Link from 'next/link';

import { api } from '@rh5/api-client';
import { languageOptions } from '@rh5/i18n';
import { useSessionStore } from '@rh5/stores';

import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

export default function MemberPage() {
  const { Button, LanguagePicker, toast } = useUi();
  const { locale, t } = useTranslation();
  const user = useSessionStore((state) => state.user);
  const setLocale = useSessionStore((state) => state.setLocale);
  const clearSession = useSessionStore((state) => state.logout);

  const logout = async () => {
    await api.logout(locale).catch(() => null);
    clearSession();
    toast(t('logoutDone'), 'success');
  };

  return (
    <section className="page member-page">
      <header className="member-heading">
        <h1>{t('memberCenter')}</h1>
        <p>{t('memberWelcome')}</p>
      </header>

      <section className="member-hero">
        <div className="member-profile">
          {user ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt="" />
          ) : (
            <div className="guest-avatar" aria-hidden="true">
              <UserRound size={28} />
            </div>
          )}
          <div>
            <h2>{user ? user.realName : t('memberGuest')}</h2>
            <p>
              {user ? `@${user.username} · ${user.roles.join(', ')}` : t('memberGuestDescription')}
            </p>
          </div>
        </div>
      </section>

      {!user && (
        <Link className="member-login" href="/login">
          <LogIn size={19} /> {t('loginDemo')} <ChevronRight size={18} />
        </Link>
      )}

      <section className="member-card" aria-labelledby="account-heading">
        <h2 id="account-heading">{t('memberAccountInfo')}</h2>
        <dl className="account-details">
          {user && (
            <div>
              <dt>{t('memberDisplayName')}</dt>
              <dd>{user.realName}</dd>
            </div>
          )}
          <div>
            <dt>{t('memberAccountStatus')}</dt>
            <dd>{t(user ? 'memberSessionActive' : 'memberSessionGuest')}</dd>
          </div>
        </dl>
      </section>

      <section className="member-card language-card" aria-labelledby="preferences-heading">
        <h2 id="preferences-heading">{t('memberPreferences')}</h2>
        <LanguagePicker
          description={t('languageHint')}
          icon={<Languages size={19} />}
          label={t('language')}
          options={[...languageOptions]}
          value={locale}
          title={t('languageTitle')}
          onChange={setLocale}
        />
      </section>

      <section className="member-list" aria-label={t('memberCapabilities')}>
        <h2>{t('memberCapabilities')}</h2>
        <article>
          <ShieldCheck size={19} />
          <span>
            <strong>{t('requestSecurity')}</strong>
            <small>{t('requestSecurityBody')}</small>
          </span>
        </article>
        <article>
          <Languages size={19} />
          <span>
            <strong>{t('internationalization')}</strong>
            <small>{t('internationalizationBody')}</small>
          </span>
        </article>
      </section>

      {user && (
        <Button block tone="danger" onClick={logout}>
          <span className="button-content">
            <LogOut size={17} /> {t('logout')}
          </span>
        </Button>
      )}
    </section>
  );
}
