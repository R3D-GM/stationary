import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { formatMoney, todayStr } from '../utils/format';

export default function Daily() {
  const { t, i18n } = useTranslation();
  const [date, setDate] = useState(todayStr());
  const [record, setRecord] = useState(null);

  useEffect(() => {
    api(`/daily?date=${date}`).then(setRecord).catch(() => setRecord(null));
  }, [date]);

  return (
    <div className="stack">
      <div className="card">
        <h2>{t('daily.title')}</h2>
        <label>
          {t('daily.pickDate')}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      {record && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card"><span className="kpi-label">{t('daily.productRevenue')}</span><span className="kpi-value">{formatMoney(record.productRevenue)}</span></div>
            <div className="kpi-card"><span className="kpi-label">{t('daily.productProfit')}</span><span className="kpi-value">{formatMoney(record.productProfit)}</span></div>
            <div className="kpi-card"><span className="kpi-label">{t('daily.serviceRevenue')}</span><span className="kpi-value">{formatMoney(record.serviceRevenue)}</span></div>
            <div className="kpi-card"><span className="kpi-label">{t('daily.cashSales')}</span><span className="kpi-value">{formatMoney(record.cashSales)}</span></div>
            <div className="kpi-card"><span className="kpi-label">{t('daily.accountSales')}</span><span className="kpi-value">{formatMoney(record.accountSales)}</span></div>
            <div className="kpi-card"><span className="kpi-label">{t('daily.totalRevenue')}</span><span className="kpi-value">{formatMoney(record.totalRevenue)}</span></div>
            <div className="kpi-card"><span className="kpi-label">{t('daily.totalProfit')}</span><span className="kpi-value">{formatMoney(record.totalProfit)}</span></div>
          </div>

          <div className="card">
            <h2>{t('daily.soldProducts')}</h2>
            {record.soldProducts.length === 0 ? <p>{t('daily.noActivity')}</p> : (
              <table>
                <thead><tr><th>{t('products.name')}</th><th>{t('sell.qty')}</th><th>{t('common.total')}</th></tr></thead>
                <tbody>
                  {record.soldProducts.map((p, i) => (
                    <tr key={i}><td>{p.name}</td><td>{p.qty}</td><td>{formatMoney(p.revenue)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h2>{t('daily.servicesByType')}</h2>
            {record.servicesByType.length === 0 ? <p>{t('daily.noActivity')}</p> : (
              <table>
                <thead><tr><th>{t('services.serviceType')}</th><th>{t('common.total')}</th></tr></thead>
                <tbody>
                  {record.servicesByType.map((s, i) => (
                    <tr key={i}><td>{i18n.language === 'am' ? s.name_am : s.name_en}</td><td>{formatMoney(s.revenue)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
