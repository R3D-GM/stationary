import { db } from '../../db/connection.js';

// Nothing here is a stored total. Every number is computed fresh from
// real transactions, so it can never drift or disagree with history.
export function getDailyRecord(date) {
  const productRow = db.prepare(
    `SELECT COALESCE(SUM(si.line_total),0) AS revenue,
            COALESCE(SUM(si.unit_cost*si.quantity),0) AS cost
     FROM sale_items si JOIN sales s ON s.id = si.sale_id
     WHERE s.sold_on = ? AND s.status='completed'`
  ).get(date);

  const cashSalesProducts = db.prepare(
    `SELECT COALESCE(SUM(total_amount),0) AS t FROM sales WHERE sold_on=? AND status='completed' AND payment_method='cash'`
  ).get(date).t;
  const accountSalesProducts = db.prepare(
    `SELECT COALESCE(SUM(total_amount),0) AS t FROM sales WHERE sold_on=? AND status='completed' AND payment_method='account'`
  ).get(date).t;

  const servicesByType = db.prepare(
    `SELECT t.code, t.name_am, t.name_en, COALESCE(SUM(st.total_amount),0) AS revenue
     FROM service_transactions st JOIN service_types t ON t.id = st.service_type_id
     WHERE st.done_on = ? AND st.status='completed'
     GROUP BY t.code`
  ).all(date);

  const serviceCash = db.prepare(
    `SELECT COALESCE(SUM(total_amount),0) AS t FROM service_transactions WHERE done_on=? AND status='completed' AND payment_method='cash'`
  ).get(date).t;
  const serviceAccount = db.prepare(
    `SELECT COALESCE(SUM(total_amount),0) AS t FROM service_transactions WHERE done_on=? AND status='completed' AND payment_method='account'`
  ).get(date).t;

  const serviceRevenue = servicesByType.reduce((sum, s) => sum + s.revenue, 0);
  const productProfit = productRow.revenue - productRow.cost;

  const soldProducts = db.prepare(
    `SELECT p.name, SUM(si.quantity) AS qty, SUM(si.line_total) AS revenue
     FROM sale_items si JOIN sales s ON s.id=si.sale_id JOIN products p ON p.id = si.product_id
     WHERE s.sold_on=? AND s.status='completed' GROUP BY p.id ORDER BY revenue DESC`
  ).all(date);

  return {
    date,
    productRevenue: productRow.revenue,
    productCost: productRow.cost,
    productProfit,
    cashSales: cashSalesProducts + serviceCash,
    accountSales: accountSalesProducts + serviceAccount,
    serviceRevenue,
    servicesByType,
    totalRevenue: productRow.revenue + serviceRevenue,
    // Services have no recorded material cost, so their revenue counts as profit.
    totalProfit: productProfit + serviceRevenue,
    soldProducts,
  };
}
