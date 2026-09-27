import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, downloadFile } from '../api/client';
import { formatMoney, daysAgoStr, todayStr } from '../utils/format';

export default function Reports() {
  const { t } = useTranslation();
  const [from, setFrom] = useState(daysAgoStr(30));
  const [to, setTo] = useState(todayStr());
  const [paymentMethod, setPaymentMethod] = useState('');
  const [rows, setRows] = useState([]);

  async function load() {
    const params = new URLSearchParams({ from, to });
    if (paymentMethod) params.set('paymentMethod', paymentMethod);
    const d = await api(`/analytics/sales-history?${params}`);
    setRows(d.transactions);
  }
  useEffect(() => { load().catch(() => {}); }, [from, to, paymentMethod]);

  function exportInventory() {
    downloadFile('/reports/inventory.csv', 'inventory.csv').catch(() => {});
  }
  function exportSales() {
    const params = new URLSearchParams({ from, to });
    if (paymentMethod) params.set('paymentMethod', paymentMethod);
    downloadFile(`/reports/sales-history.csv?${params}`, 'sales-history.csv').catch(() => {});
  }

  return (
    <div className="stack">
      <div className="card">
        <h2>{t('reports.inventoryReport')}</h2>
        <div className="row">
          <button className="btn-outline" onClick={exportInventory}>
            {t('reports.inventoryReport')} — {t('reports.downloadCsv')}
          </button>
        </div>
      </div>

      <div className="card">
        <h2>{t('reports.salesHistory')}</h2>
        <div className="grid-2">
          <label>{t('reports.from')}<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label>{t('reports.to')}<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
          <label>
            {t('reports.paymentMethod')}
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="">{t('reports.all')}</option>
              <option value="cash">{t('common.cash')}</option>
              <option value="account">{t('common.account')}</option>
            </select>
          </label>
        </div>
        <div className="row">
          <button className="btn-outline" onClick={exportSales}>{t('reports.downloadCsv')}</button>
        </div>

        {rows.length === 0 ? <p>{t('reports.noResults')}</p> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('common.date')}</th><th>{t('reports.type')}</th><th>{t('reports.description')}</th>
                  <th>{t('sell.paymentMethod')}</th><th>{t('reports.amount')}</th><th>{t('reports.status')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.type}-${r.id}`} className={r.status === 'voided' ? 'row-voided' : ''}>
                    <td>{r.date} {r.time}</td>
                    <td>{r.type}</td>
                    <td>{r.description}</td>
                    <td>{r.payment_method === 'cash' ? t('common.cash') : t('common.account')}</td>
                    <td>{formatMoney(r.total_amount)}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
