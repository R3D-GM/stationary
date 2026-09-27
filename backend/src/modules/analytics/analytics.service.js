import { db } from '../../db/connection.js';
import { getDailyRecord } from '../daily/daily.service.js';
import { getInventory } from '../inventory/inventory.service.js';
import { today, daysAgo } from '../../utils/date.js';

export function getDashboardSummary() {
  const record = getDailyRecord(today());
  const inventory = getInventory();
  const lowStock = inventory.filter((i) => i.is_low);
  const totalStockQty = inventory.reduce((s, i) => s + i.remaining, 0);

  // Lifetime total of money not yet received in cash. There is no
  // per-customer debt list — this is a single aggregate figure only.
  const outstandingAccount = db.prepare(
    `SELECT
       (SELECT COALESCE(SUM(total_amount),0) FROM sales WHERE payment_method='account' AND status='completed') +
       (SELECT COALESCE(SUM(total_amount),0) FROM service_transactions WHERE payment_method='account' AND status='completed')
       AS total`
  ).get().total;

  return {
    today: record,
    totalProducts: inventory.length,
    totalStockQty,
    lowStockCount: lowStock.length,
    outstandingAccount,
  };
}

export function getTrends(days = 14) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgo(i);
    const r = getDailyRecord(date);
    out.push({ date, revenue: r.totalRevenue, profit: r.totalProfit });
  }
  return out;
}

export function getSalesHistory({ from, to, paymentMethod, productId, limit = 200 }) {
  let sql = `
    SELECT s.id, 'product' AS type, s.sold_on AS date, s.sold_at AS time, s.payment_method,
           s.total_amount, s.status,
           GROUP_CONCAT(p.name || ' x' || si.quantity, ', ') AS description
    FROM sales s
    JOIN sale_items si ON si.sale_id = s.id
    JOIN products p ON p.id = si.product_id
    WHERE 1=1`;
  const params = [];
  if (from) { sql += ' AND s.sold_on >= ?'; params.push(from); }
  if (to) { sql += ' AND s.sold_on <= ?'; params.push(to); }
  if (paymentMethod) { sql += ' AND s.payment_method = ?'; params.push(paymentMethod); }
  if (productId) { sql += ' AND si.product_id = ?'; params.push(Number(productId)); }
  sql += ' GROUP BY s.id ORDER BY s.id DESC LIMIT ?';
  params.push(Number(limit));
  const sales = db.prepare(sql).all(...params);

  let services = [];
  if (!productId) {
    let sSql = `
      SELECT st.id, 'service' AS type, st.done_on AS date, st.done_at AS time, st.payment_method,
             st.total_amount, st.status,
             (t.name_am || ' x' || st.quantity) AS description
      FROM service_transactions st
      JOIN service_types t ON t.id = st.service_type_id
      WHERE 1=1`;
    const sParams = [];
    if (from) { sSql += ' AND st.done_on >= ?'; sParams.push(from); }
    if (to) { sSql += ' AND st.done_on <= ?'; sParams.push(to); }
    if (paymentMethod) { sSql += ' AND st.payment_method = ?'; sParams.push(paymentMethod); }
    sSql += ' ORDER BY st.id DESC LIMIT ?';
    sParams.push(Number(limit));
    services = db.prepare(sSql).all(...sParams);
  }

  return [...sales, ...services]
    .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1))
    .slice(0, Number(limit));
}

// Rule-based insights computed only from stored transactions.
// This is deliberately NOT a generative model: nothing here is invented,
// every number traces back to a real row in the database.
export function getInsights() {
  const since30 = daysAgo(30);

  const topSellers = db.prepare(
    `SELECT p.name, SUM(si.quantity) AS qty, SUM(si.line_total) AS revenue,
            SUM(si.line_total - si.unit_cost*si.quantity) AS profit
     FROM sale_items si JOIN sales s ON s.id=si.sale_id JOIN products p ON p.id=si.product_id
     WHERE s.status='completed' AND s.sold_on >= ?
     GROUP BY p.id ORDER BY qty DESC LIMIT 5`
  ).all(since30);

  const profitLeaders = [...topSellers].sort((a, b) => b.profit - a.profit).slice(0, 5);

  const slowMovers = db.prepare(
    `SELECT p.id, p.name, p.quantity,
            (SELECT MAX(s.sold_on) FROM sale_items si JOIN sales s ON s.id=si.sale_id
             WHERE si.product_id = p.id AND s.status='completed') AS last_sold
     FROM products p WHERE p.is_active = 1`
  ).all().filter((p) => !p.last_sold || p.last_sold < since30);

  const restockSuggestions = db.prepare(
    `SELECT p.id, p.name, p.quantity, p.low_stock_threshold,
            COALESCE((SELECT SUM(si.quantity) FROM sale_items si JOIN sales s ON s.id=si.sale_id
              WHERE si.product_id=p.id AND s.status='completed' AND s.sold_on >= ?), 0) AS sold_last_30
     FROM products p WHERE p.is_active = 1`
  ).all(since30).filter((p) => p.sold_last_30 > 0 && p.quantity <= (p.sold_last_30 / 30) * 7);

  return { topSellers, profitLeaders, slowMovers, restockSuggestions, generatedOn: today() };
}
