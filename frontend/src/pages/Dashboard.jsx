import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { formatMoney } from '../utils/format';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [low, setLow] = useState([]);

  useEffect(() => {
    api('/analytics/dashboard').then(setSummary).catch(() => {});
    api('/inventory/low-stock').then((d) => setLow(d.items)).catch(() => {});
  }, []);

  return (
    <div className="stack">
      <div className="card">
        <h2>{t('common.welcome')}, {user.full_name} 👋</h2>
      </div>

      {summary && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">{t('dashboard.todaySales')}</span>
            <span className="kpi-value">{formatMoney(summary.today.totalRevenue)} {t('common.etb')}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">{t('dashboard.todayCash')}</span>
            <span className="kpi-value">{formatMoney(summary.today.cashSales)} {t('common.etb')}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">{t('dashboard.todayAccount')}</span>
            <span className="kpi-value">{formatMoney(summary.today.accountSales)} {t('common.etb')}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">{t('dashboard.todayProfit')}</span>
            <span className="kpi-value">{formatMoney(summary.today.totalProfit)} {t('common.etb')}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">{t('dashboard.outstandingAccount')}</span>
            <span className="kpi-value">{formatMoney(summary.outstandingAccount)} {t('common.etb')}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">{t('dashboard.totalStock')}</span>
            <span className="kpi-value">{summary.totalStockQty}</span>
          </div>
        </div>
      )}

      <div className="card">
        <h2>{t('dashboard.lowStock')}</h2>
        {low.length === 0 ? (
          <p className="success">{t('inventory.allGood')}</p>
        ) : (
          low.map((i) => (
            <p key={i.id} className="warn">
              ⚠️ {t('inventory.lowStockMsg', { name: i.name, qty: i.remaining })}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
