import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { formatMoney } from '../utils/format';

export default function Services() {
  const { t, i18n } = useTranslation();
  const [types, setTypes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ serviceTypeId: '', quantity: 1, unitPrice: '', paymentMethod: 'cash' });
  const [errorCode, setErrorCode] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [t1, tx] = await Promise.all([api('/services/types'), api('/services?limit=20')]);
    setTypes(t1.types);
    setTransactions(tx.transactions);
  }
  useEffect(() => { load().catch(() => {}); }, []);

  function chooseType(e) {
    const id = e.target.value;
    const type = types.find((x) => String(x.id) === id);
    setForm({ ...form, serviceTypeId: id, unitPrice: type ? String(type.default_price / 100) : '' });
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const total = (Number(form.unitPrice) || 0) * (Number(form.quantity) || 0);

  async function submit(e) {
    e.preventDefault();
    setErrorCode(null);
    setSaved(false);
    setBusy(true);
    try {
      await api('/services', {
        method: 'POST',
        body: {
          serviceTypeId: Number(form.serviceTypeId),
          quantity: Number(form.quantity),
          unitPrice: Number(form.unitPrice),
          paymentMethod: form.paymentMethod,
        },
      });
      setForm({ serviceTypeId: '', quantity: 1, unitPrice: '', paymentMethod: 'cash' });
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
        <h2>{t('services.title')}</h2>
        <div className="grid-2">
          <label>
            {t('services.serviceType')}
            <select value={form.serviceTypeId} onChange={chooseType} required>
              <option value="">{t('stock.selectProduct')}</option>
              {types.map((s) => (
                <option key={s.id} value={s.id}>{i18n.language === 'am' ? s.name_am : s.name_en}</option>
              ))}
            </select>
          </label>
          <label>
            {t('services.quantity')}
            <input type="number" min="1" value={form.quantity} onChange={set('quantity')} required />
          </label>
          <label>
            {t('services.unitPrice')} ({t('common.etb')})
            <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={set('unitPrice')} required />
          </label>
          <label>
            {t('sell.paymentMethod')}
            <select value={form.paymentMethod} onChange={set('paymentMethod')}>
              <option value="cash">{t('common.cash')}</option>
              <option value="account">{t('common.account')}</option>
            </select>
          </label>
        </div>

        <div className="preview"><b>{t('services.total')}: {total.toFixed(2)} {t('common.etb')}</b></div>

        {errorCode && <p className="error">{t(`errors.${errorCode}`, t('errors.GENERIC'))}</p>}
        {saved && <p className="success">{t('services.saved')}</p>}
        <button className="btn" disabled={busy}>{t('services.submit')}</button>
      </form>

      <div className="card">
        <h2>{t('services.recent')}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>{t('common.date')}</th><th>{t('services.serviceType')}</th><th>{t('services.quantity')}</th><th>{t('common.total')}</th><th>{t('sell.paymentMethod')}</th></tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.done_on} {tx.done_at}</td>
                  <td>{i18n.language === 'am' ? tx.name_am : tx.name_en}</td>
                  <td>{tx.quantity}</td>
                  <td>{formatMoney(tx.total_amount)}</td>
                  <td>{tx.payment_method === 'cash' ? t('common.cash') : t('common.account')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
