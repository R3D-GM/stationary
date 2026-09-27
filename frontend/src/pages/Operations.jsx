import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Tabs from '../components/Tabs';
import Products from './Products';
import AddStock from './AddStock';
import Sell from './Sell';
import Services from './Services';
import Inventory from './Inventory';

// Tabs are ordered to match the real workflow:
// 1. Register the product (name/category/unit)
// 2. Add stock (sets quantity + prices)
// 3. Sell it
// Services and Inventory are independent, so they sit at the end.
export default function Operations() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('products');

  const tabs = [
    { key: 'products', label: t('products.title'), icon: '🏷️' },
    { key: 'stock', label: t('stock.title'), icon: '➕' },
    { key: 'sell', label: t('sell.title'), icon: '🛒' },
    { key: 'services', label: t('services.title'), icon: '🖨️' },
    { key: 'inventory', label: t('inventory.title'), icon: '🗃️' },
  ];

  return (
    <div className="stack">
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'products' && <Products />}
      {tab === 'stock' && <AddStock />}
      {tab === 'sell' && <Sell />}
      {tab === 'services' && <Services />}
      {tab === 'inventory' && <Inventory />}
    </div>
  );
}
