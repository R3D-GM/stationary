import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Tabs from '../components/Tabs';
import Daily from './Daily';
import Reports from './Reports';
import Analytics from './Analytics';

// Daily totals, sales history / CSV export, and trend charts,
// grouped under one nav item.
export default function ReportsHub() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('daily');

  const tabs = [
    { key: 'daily', label: t('daily.title'), icon: '📅' },
    { key: 'history', label: t('reports.salesHistory'), icon: '🧾' },
    { key: 'analytics', label: t('analytics.title'), icon: '📈' },
  ];

  return (
    <div className="stack">
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'daily' && <Daily />}
      {tab === 'history' && <Reports />}
      {tab === 'analytics' && <Analytics />}
    </div>
  );
}
