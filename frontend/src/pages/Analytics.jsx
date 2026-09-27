import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import TrendChart from '../components/TrendChart';

export default function Analytics() {
  const { t } = useTranslation();
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    api('/analytics/trends?days=14').then((d) => setTrends(d.trends)).catch(() => {});
  }, []);

  return (
    <div className="stack">
      <div className="card">
        <h2>{t('analytics.title')}</h2>
      </div>
      {trends.length > 0 && (
        <>
          <div className="card">
            <h2>{t('analytics.revenueTrend')}</h2>
            <TrendChart data={trends} valueKey="revenue" label={t('analytics.revenueTrend')} color="#1f6f5c" />
          </div>
          <div className="card">
            <h2>{t('analytics.profitTrend')}</h2>
            <TrendChart data={trends} valueKey="profit" label={t('analytics.profitTrend')} color="#8a5a00" />
          </div>
        </>
      )}
    </div>
  );
}
