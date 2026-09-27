import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Settings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ fullName: '', username: '', password: '' });
  const [errorCode, setErrorCode] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (user.role !== 'owner') return;
    const d = await api('/auth/users');
    setUsers(d.users);
  }
  useEffect(() => { load().catch(() => {}); }, []);

  if (user.role !== 'owner') {
    return <div className="card"><p>{t('settings.ownerOnly')}</p></div>;
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErrorCode(null);
    setSaved(false);
    setBusy(true);
    try {
      await api('/auth/users', { method: 'POST', body: form });
      setForm({ fullName: '', username: '', password: '' });
      setSaved(true);
      await load();
    } catch (err) {
      setErrorCode(err.code || 'GENERIC');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <form className="card" onSubmit={submit}>
        <h2>{t('settings.addStaff')}</h2>
        <div className="grid-2">
          <label>{t('auth.fullName')}<input value={form.fullName} onChange={set('fullName')} required /></label>
          <label>{t('auth.username')}<input value={form.username} onChange={set('username')} required /></label>
          <label>{t('auth.password')}<input type="password" value={form.password} onChange={set('password')} required /></label>
        </div>
        {errorCode && <p className="error">{t(`errors.${errorCode}`, t('errors.GENERIC'))}</p>}
        {saved && <p className="success">{t('settings.staffAdded')}</p>}
        <button className="btn" disabled={busy}>{t('common.add')}</button>
      </form>

      <div className="card">
        <h2>{t('settings.usersTitle')}</h2>
        <table>
          <thead><tr><th>{t('auth.fullName')}</th><th>{t('auth.username')}</th><th>{t('settings.role')}</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td><td>{u.username}</td>
                <td>{u.role === 'owner' ? t('common.owner') : t('common.staff')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
