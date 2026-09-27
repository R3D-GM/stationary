import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { formatMoney, todayStr } from '../utils/format';

const emptyForm = () => ({
  productId: '', quantity: '', unitCost: '', sellingPrice: '', supplier: '', purchasedOn: todayStr(),
});

export default function AddStock() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [errorCode, setErrorCode] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [p, s] = await Promise.all([api('/products'), api('/stock/purchases')]);
    setProducts(p.products);
    setPurchases(s.purchases);
  }
  useEffect(() => { load().catch(() => {}); }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function chooseProduct(e) {
    const id = e.target.value;
    const p = products.find((x) => String(x.id) === id);
    setForm({
      ...form,
      productId: id,
      unitCost: p && p.cost_price ? String(p.cost_price / 100) : '',
      sellingPrice: p && p.selling_price ? String(p.selling_price / 100) : '',
    });
  }

  const cost = Number(form.unitCost) || 0;
  const price = Number(form.sellingPrice) || 0;
  const qty = Number(form.quantity) || 0;
  const profitPerUnit = price - cost;

  async function submit(e) {
    e.preventDefault();
    setErrorCode(null);
    setSaved(false);
    setBusy(true);
    try {
      await api('/stock/purchases', {
        method: 'POST',
        body: {
          productId: Number(form.productId),
          quantity: Number(form.quantity),
          unitCost: Number(form.unitCost),
          sellingPrice: Number(form.sellingPrice),
          supplier: form.supplier,
          purchasedOn: form.purchasedOn,
        },
      });
      setForm(emptyForm());
      setSaved(true);
      await load();
    } catch (err) {
      setErrorCode(err.code || 'GENERIC');
    } finally {
      setBusy(false);
    }
  }

  if (products.length === 0) {
    return <div className="card"><p>{t('stock.noProducts')}</p></div>;
  }

  return (
    <div className="stack">
      <form className="card" onSubmit={submit}>
        <h2>{t('stock.title')}</h2>
        <label>
          {t('stock.product')}
          <select value={form.productId} onChange={chooseProduct} required>
            <option value="">{t('stock.selectProduct')}</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>

        <div className="grid-2">
          <label>
            {t('stock.quantity')}
            <input type="number" min="1" step="1" value={form.quantity} onChange={set('quantity')} required />
          </label>
          <label>
            {t('stock.date')}
            <input type="date" value={form.purchasedOn} onChange={set('purchasedOn')} required />
          </label>
          <label>
            {t('stock.unitCost')} ({t('common.etb')})
            <input type="number" min="0" step="0.01" value={form.unitCost} onChange={set('unitCost')} required />
          </label>
          <label>
            {t('stock.sellingPrice')} ({t('common.etb')})
            <input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={set('sellingPrice')} required />
          </label>
        </div>
        <label>
          {t('stock.supplier')}
          <input value={form.supplier} onChange={set('supplier')} />
        </label>

        {qty > 0 && (
          <div className="preview">
            <div>{t('stock.profitPerUnit')}: <b>{profitPerUnit.toFixed(2)} {t('common.etb')}</b></div>
            <div>{t('stock.potentialProfit')}: <b>{(profitPerUnit * qty).toFixed(2)} {t('common.etb')}</b></div>
            {profitPerUnit < 0 && <p className="warn">{t('stock.lossWarning')}</p>}
          </div>
        )}

        {errorCode && <p className="error">{t(`errors.${errorCode}`, t('errors.GENERIC'))}</p>}
        {saved && <p className="success">{t('stock.saved')}</p>}
        <button className="btn" disabled={busy}>{t('stock.submit')}</button>
      </form>

      <div className="card">
        <h2>{t('stock.recent')}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('stock.date')}</th>
                <th>{t('stock.product')}</th>
                <th>{t('stock.quantity')}</th>
                <th>{t('inventory.cost')}</th>
                <th>{t('inventory.price')}</th>
                <th>{t('stock.supplier')}</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td>{p.purchased_on}</td>
                  <td>{p.product_name}</td>
                  <td>{p.quantity} {t(`units.${p.unit}`)}</td>
                  <td>{formatMoney(p.unit_cost)}</td>
                  <td>{formatMoney(p.selling_price)}</td>
                  <td>{p.supplier || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
