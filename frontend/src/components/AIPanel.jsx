import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { formatMoney } from '../utils/format';

// The AI insights, shown as a floating panel rather than a full page —
// it's a "check in on this sometimes" feature, not a daily destination.
export default function AIPanel({ onClose }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/analytics/insights').then(setData).catch(() => {});
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🤖 {t('ai.title')}</h2>
          <button className="btn-outline" onClick={onClose}>{t('common.close')}</button>
        </div>

        {!data ? (
          <p>{t('common.loading')}</p>
        ) : (
          <div className="stack">
            <p className="warn">ℹ️ {t('ai.disclaimer')}</p>

            <div>
              <h3>{t('ai.topSellers')}</h3>
              {data.topSellers.length === 0 ? <p>{t('ai.noData')}</p> : (
                <table>
                  <thead><tr><th>{t('products.name')}</th><th>{t('ai.qtySold')}</th><th>{t('ai.profit')}</th></tr></thead>
                  <tbody>
                    {data.topSellers.map((p, i) => (
                      <tr key={i}><td>{p.name}</td><td>{p.qty}</td><td>{formatMoney(p.profit)}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <h3>{t('ai.slowMovers')}</h3>
              {data.slowMovers.length === 0 ? <p>{t('ai.noData')}</p> : (
                <table>
                  <thead><tr><th>{t('products.name')}</th><th>{t('ai.currentStock')}</th></tr></thead>
                  <tbody>
                    {data.slowMovers.map((p) => (
                      <tr key={p.id}><td>{p.name}</td><td>{p.quantity}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <h3>{t('ai.restockSuggestions')}</h3>
              {data.restockSuggestions.length === 0 ? <p>{t('ai.noData')}</p> : (
                <>
                  <p className="warn">{t('ai.restockNote')}</p>
                  <table>
                    <thead><tr><th>{t('products.name')}</th><th>{t('ai.currentStock')}</th></tr></thead>
                    <tbody>
                      {data.restockSuggestions.map((p) => (
                        <tr key={p.id}><td>{p.name}</td><td>{p.quantity}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
