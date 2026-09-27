import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Tabs from '../components/Tabs';
import Sell from './Sell';
import AddStock from './AddStock';
import Services from './Services';
import Products from './Products';
import Inventory from './Inventory';

// Everything about logging new activity (sales, stock, services) and
// tracking what's on the shelf, grouped under one nav item.
export default function Operations() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('sell');

  const tabs = [
    { key: 'sell', label: t('sell.title'), icon: '🛒' },
    { key: 'stock', label: t('stock.title'), icon: '➕' },
    { key: 'services', label: t('services.title'), icon: '🖨️' },
    { key: 'products', label: t('products.title'), icon: '🏷️' },
    { key: 'inventory', label: t('inventory.title'), icon: '🗃️' },
  ];

  return (
    <div className="stack">
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'sell' && <Sell />}
      {tab === 'stock' && <AddStock />}
      {tab === 'services' && <Services />}
      {tab === 'products' && <Products />}
      {tab === 'inventory' && <Inventory />}
    </div>
  );
}
