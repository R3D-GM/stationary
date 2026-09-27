import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { formatMoney, categoryName } from '../utils/format';

const UNITS = ['piece', 'pack', 'box', 'dozen'];
const EMPTY = { name: '', categoryId: '', unit: 'piece', description: '', lowStockThreshold: 5 };

export default function Products() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [newCat, setNewCat] = useState('');
  const [errorCode, setErrorCode] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [p, c] = await Promise.all([api('/products'), api('/categories')]);
    setProducts(p.products);
    setCategories(c.categories);
  }
  useEffect(() => { load().catch(() => {}); }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function startEdit(p) {
    setEditingId(p.id);
    setSaved(false);
    setErrorCode(null);
    setForm({
      name: p.name,
      categoryId: p.category_id ?? '',
      unit: p.unit,
      description: p.description ?? '',
      lowStockThreshold: p.low_stock_threshold,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function submit(e) {
    e.preventDefault();
    setErrorCode(null);
    setSaved(false);
    setBusy(true);
    const body = {
      name: form.name,
      categoryId: form.categoryId === '' ? null : Number(form.categoryId),
      unit: form.unit,
      description: form.description,
      lowStockThreshold: Number(form.lowStockThreshold),
    };
    try {
      if (editingId) await api(`/products/${editingId}`, { method: 'PUT', body });
      else await api('/products', { method: 'POST', body });
      reset();
      setSaved(true);
      await load();
    } catch (err) {
      setErrorCode(err.code || 'GENERIC');
    } finally {
      setBusy(false);
    }
  }

  async function addCategory() {
    if (!newCat.trim()) return;
    setErrorCode(null);
    try {
      await api('/categories', { method: 'POST', body: { nameAm: newCat } });
      setNewCat('');
      await load();
    } catch (err) {
      setErrorCode(err.code || 'GENERIC');
    }
  }

  return (
    <div className="stack">
      <form className="card" onSubmit={submit}>
        <h2>{editingId ? t('products.editTitle') : t('products.addTitle')}</h2>
        <div className="grid-2">
          <label>
            {t('products.name')}
            <input value={form.name} onChange={set('name')} required />
          </label>
          <label>
            {t('products.category')}
            <select value={form.categoryId} onChange={set('categoryId')}>
              <option value="">{t('products.noCategory')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {i18n.language === 'am' ? c.name_am : c.name_en || c.name_am}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('products.unit')}
            <select value={form.unit} onChange={set('unit')}>
              {UNITS.map((u) => <option key={u} value={u}>{t(`units.${u}`)}</option>)}
            </select>
          </label>
          <label>
            {t('products.threshold')}
            <input type="number" min="0" value={form.lowStockThreshold} onChange={set('lowStockThreshold')} required />
          </label>
        </div>
        <label>
          {t('products.description')}
          <input value={form.description} onChange={set('description')} />
        </label>

        {errorCode && <p className="error">{t(`errors.${errorCode}`, t('errors.GENERIC'))}</p>}
        {saved && <p className="success">{t('products.saved')}</p>}

        <div className="row">
          <button className="btn" disabled={busy}>{t('common.save')}</button>
          {editingId && (
            <button type="button" className="btn-outline" onClick={reset}>{t('common.cancel')}</button>
          )}
        </div>

        <hr />
        <label>
          {t('products.newCategory')}
          <div className="row">
            <input value={newCat} onChange={(e) => setNewCat(e.target.value)} />
            <button type="button" className="btn-outline" onClick={addCategory}>{t('common.add')}</button>
          </div>
        </label>
      </form>

      <div className="card">
        <h2>{t('products.title')}</h2>
        {products.length === 0 ? (
          <p>{t('products.empty')}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('products.name')}</th>
                  <th>{t('products.category')}</th>
                  <th>{t('products.unit')}</th>
                  <th>{t('inventory.cost')}</th>
                  <th>{t('inventory.price')}</th>
                  <th>{t('inventory.remaining')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{categoryName(p, i18n.language) || '—'}</td>
                    <td>{t(`units.${p.unit}`)}</td>
                    <td>{formatMoney(p.cost_price)}</td>
                    <td>{formatMoney(p.selling_price)}</td>
                    <td>{p.quantity}</td>
                    <td>
                      <button className="btn-outline" onClick={() => startEdit(p)}>{t('common.edit')}</button>
                    </td>
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
