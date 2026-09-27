import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { formatMoney, categoryName } from '../utils/format';

export default function Inventory() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api('/inventory').then((d) => setItems(d.items)).catch(() => {});
  }, []);

  const shown = items.filter((i) => i.name.toLowerCase().includes(search.trim().toLowerCase()));
  const low = items.filter((i) => i.is_low);

  return (
    <div className="stack">
      {low.length > 0 && (
        <div className="card alert-card">
          {low.map((i) => (
            <p key={i.id} className="warn">
              ⚠️ {t('inventory.lowStockMsg', { name: i.name, qty: i.remaining })}
            </p>
          ))}
        </div>
      )}

      <div className="card">
        <h2>{t('inventory.title')}</h2>
        <input
          placeholder={t('inventory.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {shown.length === 0 ? (
          <p>{t('inventory.empty')}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('products.name')}</th>
                  <th>{t('products.category')}</th>
                  <th>{t('inventory.purchased')}</th>
                  <th>{t('inventory.sold')}</th>
                  <th>{t('inventory.remaining')}</th>
                  <th>{t('inventory.cost')}</th>
                  <th>{t('inventory.price')}</th>
                  <th>{t('inventory.potential')}</th>
                  <th>{t('inventory.actual')}</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((i) => (
                  <tr key={i.id} className={i.is_low ? 'row-low' : ''}>
                    <td>{i.name}</td>
                    <td>{categoryName(i, i18n.language) || '—'}</td>
                    <td>{i.total_purchased}</td>
                    <td>{i.total_sold}</td>
                    <td>
                      <b>{i.remaining}</b> {t(`units.${i.unit}`)}
                      {i.is_low && <span className="badge-low">{t('inventory.low')}</span>}
                    </td>
                    <td>{formatMoney(i.cost_price)}</td>
                    <td>{formatMoney(i.selling_price)}</td>
                    <td>{formatMoney(i.potential_profit)}</td>
                    <td>{formatMoney(i.actual_profit)}</td>
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
