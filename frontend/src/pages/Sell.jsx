import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatMoney } from '../utils/format';

export default function Sell() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // { productId, name, unit, price, qty, available }
  const [pickProduct, setPickProduct] = useState('');
  const [pickQty, setPickQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [sales, setSales] = useState([]);
  const [errorCode, setErrorCode] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [p, s] = await Promise.all([api('/products'), api('/sales?limit=15')]);
    setProducts(p.products);
    setSales(s.sales);
  }
  useEffect(() => { load().catch(() => {}); }, []);

  function addToCart() {
    const product = products.find((p) => String(p.id) === pickProduct);
    if (!product) return;
    const qty = Number(pickQty) || 1;
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) {
        return prev.map((c) => c.productId === product.id ? { ...c, qty: c.qty + qty } : c);
      }
      return [...prev, {
        productId: product.id, name: product.name, unit: product.unit,
        price: product.selling_price, qty, available: product.quantity,
      }];
    });
    setPickProduct('');
    setPickQty(1);
  }

  function updateQty(productId, qty) {
    setCart((prev) => prev.map((c) => c.productId === productId ? { ...c, qty: Number(qty) || 1 } : c));
  }
  function removeFromCart(productId) {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  async function submitSale(e) {
    e.preventDefault();
    setErrorCode(null);
    setErrorDetails(null);
    setSaved(false);
    if (cart.length === 0) return;
    setBusy(true);
    try {
      await api('/sales', {
        method: 'POST',
        body: {
          items: cart.map((c) => ({ productId: c.productId, quantity: c.qty })),
          paymentMethod,
          note,
        },
      });
      setCart([]);
      setNote('');
      setSaved(true);
      await load();
    } catch (err) {
      setErrorCode(err.code || 'GENERIC');
      setErrorDetails(err.details);
    } finally {
      setBusy(false);
    }
  }

  async function voidSale(id) {
    try {
      await api(`/sales/${id}/void`, { method: 'PUT' });
      await load();
    } catch (err) {
      setErrorCode(err.code || 'GENERIC');
    }
  }

  return (
    <div className="stack">
      <form className="card" onSubmit={submitSale}>
        <h2>{t('sell.title')}</h2>

        <div className="row">
          <select value={pickProduct} onChange={(e) => setPickProduct(e.target.value)}>
            <option value="">{t('stock.selectProduct')}</option>
            {products.filter((p) => p.quantity > 0).map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.quantity} {t(`units.${p.unit}`)})</option>
            ))}
          </select>
          <input type="number" min="1" value={pickQty} onChange={(e) => setPickQty(e.target.value)} style={{ width: 90 }} />
          <button type="button" className="btn-outline" onClick={addToCart} disabled={!pickProduct}>
            {t('sell.addItem')}
          </button>
        </div>

        <h3>{t('sell.cart')}</h3>
        {cart.length === 0 ? (
          <p>{t('sell.emptyCart')}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>{t('products.name')}</th><th>{t('sell.qty')}</th><th>{t('inventory.price')}</th><th>{t('common.total')}</th><th></th></tr>
              </thead>
              <tbody>
                {cart.map((c) => (
                  <tr key={c.productId}>
                    <td>{c.name}</td>
                    <td>
                      <input type="number" min="1" max={c.available} value={c.qty}
                             onChange={(e) => updateQty(c.productId, e.target.value)} style={{ width: 70 }} />
                    </td>
                    <td>{formatMoney(c.price)}</td>
                    <td>{formatMoney(c.price * c.qty)}</td>
                    <td><button type="button" className="btn-outline" onClick={() => removeFromCart(c.productId)}>{t('sell.remove')}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <label>
          {t('sell.paymentMethod')}
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="cash">{t('common.cash')}</option>
            <option value="account">{t('common.account')}</option>
          </select>
        </label>

        <label>
          {t('sell.note')}
          <input value={note} onChange={(e) => setNote(e.target.value)} />
        </label>

        <div className="preview">
          <b>{t('sell.total')}: {formatMoney(total)} {t('common.etb')}</b>
        </div>

        {errorCode === 'INSUFFICIENT_STOCK' && errorDetails && (
          <p className="error">{t('sell.insufficientStock', { name: errorDetails.name, available: errorDetails.available })}</p>
        )}
        {errorCode && errorCode !== 'INSUFFICIENT_STOCK' && (
          <p className="error">{t(`errors.${errorCode}`, t('errors.GENERIC'))}</p>
        )}
        {saved && <p className="success">{t('sell.saved')}</p>}

        <button className="btn" disabled={busy || cart.length === 0}>{t('sell.submit')}</button>
      </form>

      <div className="card">
        <h2>{t('sell.recentSales')}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('common.date')}</th><th>{t('products.name')}</th><th>{t('common.total')}</th>
                <th>{t('sell.paymentMethod')}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className={s.status === 'voided' ? 'row-voided' : ''}>
                  <td>{s.sold_on} {s.sold_at}</td>
                  <td>{s.items.map((it) => `${it.product_name} x${it.quantity}`).join(', ')}</td>
                  <td>{formatMoney(s.total_amount)}</td>
                  <td>{s.payment_method === 'cash' ? t('common.cash') : t('common.account')}</td>
                  <td>
                    {s.status === 'voided' ? (
                      <span className="badge-low">{t('sell.voided')}</span>
                    ) : user.role === 'owner' ? (
                      <button className="btn-outline" onClick={() => voidSale(s.id)}>{t('sell.void')}</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
