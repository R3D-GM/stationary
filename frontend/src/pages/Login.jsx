import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Login() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const [needsSetup, setNeedsSetup] = useState(false);
  const [form, setForm] = useState({ fullName: '', username: '', password: '' });
  const [errorCode, setErrorCode] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/auth/status').then((d) => setNeedsSetup(d.needsSetup)).catch(() => {});
  }, []);

  if (user) return <Navigate to="/" replace />;

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErrorCode(null);
    setBusy(true);
    try {
      if (needsSetup) {
        await api('/auth/setup', { method: 'POST', body: form });
      }
      await login(form.username, form.password);
    } catch (err) {
      setErrorCode(err.code || 'GENERIC');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={submit}>
        <LanguageSwitcher />
        <h2>{needsSetup ? t('auth.setupTitle') : t('auth.loginTitle')}</h2>

        {needsSetup && (
          <label>
            {t('auth.fullName')}
            <input value={form.fullName} onChange={set('fullName')} required />
          </label>
        )}
        <label>
          {t('auth.username')}
          <input value={form.username} onChange={set('username')} required autoComplete="username" />
        </label>
        <label>
          {t('auth.password')}
          <input type="password" value={form.password} onChange={set('password')} required
                 autoComplete={needsSetup ? 'new-password' : 'current-password'} />
        </label>

        {errorCode && <p className="error">{t(`errors.${errorCode}`, t('errors.GENERIC'))}</p>}

        <button className="btn" disabled={busy}>
          {needsSetup ? t('auth.setup') : t('auth.login')}
        </button>
      </form>
    </div>
  );
}
