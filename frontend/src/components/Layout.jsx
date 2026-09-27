import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import AIPanel from './AIPanel';

// Kept deliberately short: 5 items is easy to scan and fits a mobile
// bottom bar without crowding. Everything else lives inside these as tabs.
export const NAV_ITEMS = [
  { path: '/', key: 'dashboard', icon: '📊' },
  { path: '/operations', key: 'operations', icon: '📦' },
  { path: '/reports', key: 'reports', icon: '📄' },
  { path: '/settings', key: 'settings', icon: '⚙️' },
];

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1 className="brand">{t('app.name')}</h1>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}>
              <span>{item.icon}</span> {t(`nav.${item.key}`)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <LanguageSwitcher />
          <span className="user">{user.full_name}</span>
          <button className="btn-outline" onClick={logout}>{t('auth.logout')}</button>
        </header>
        <main className="content"><Outlet /></main>
      </div>

      <button className="ai-fab" onClick={() => setAiOpen(true)} aria-label={t('ai.title')} title={t('ai.title')}>
        🤖
      </button>
      {aiOpen && <AIPanel onClose={() => setAiOpen(false)} />}
    </div>
  );
}
