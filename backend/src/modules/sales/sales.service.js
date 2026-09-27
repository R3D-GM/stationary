import { db } from '../../db/connection.js';
import { AppError } from '../../utils/AppError.js';
import { logAudit } from '../../utils/audit.js';
import { toSantim } from '../../utils/money.js';
import { nowParts } from '../../utils/date.js';

// Everything below runs inside ONE database transaction: either every
// stock deduction and every row insert succeeds, or none of it does.
const createSaleTx = db.transaction((data, userId) => {
  let totalAmount = 0;
  let totalCost = 0;
  const lineData = [];

  for (const item of data.items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.productId);
    if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND');
    if (product.quantity < item.quantity) {
      // Rule #1: never allow selling more than what's in stock.
      throw new AppError(409, 'INSUFFICIENT_STOCK', {
        productId: product.id, name: product.name, available: product.quantity,
      });
    }
    const unitPrice = item.unitPrice != null ? toSantim(item.unitPrice) : product.selling_price;
    const unitCost = product.cost_price; // snapshot: locked in forever, even if prices change later
    const lineTotal = unitPrice * item.quantity;
    totalAmount += lineTotal;
    totalCost += unitCost * item.quantity;
    lineData.push({ product, unitPrice, unitCost, lineTotal, quantity: item.quantity });
  }

  const { date, time } = nowParts();
  const info = db.prepare(
    `INSERT INTO sales (payment_method, total_amount, total_cost, sold_on, sold_at, note, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(data.paymentMethod, totalAmount, totalCost, date, time, data.note || null, userId);

  const saleId = info.lastInsertRowid;
  const insertItem = db.prepare(
    `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, unit_cost, line_total) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const deductStock = db.prepare(`UPDATE products SET quantity = quantity - ? WHERE id = ?`);

  for (const line of lineData) {
    insertItem.run(saleId, line.product.id, line.quantity, line.unitPrice, line.unitCost, line.lineTotal);
    deductStock.run(line.quantity, line.product.id);
  }

  logAudit({ userId, action: 'CREATE', entity: 'sale', entityId: saleId, details: { totalAmount, items: data.items.length } });
  return saleId;
});

export const createSale = (data, userId) => createSaleTx(data, userId);

export function listSales({ limit = 50 } = {}) {
  const sales = db.prepare(
    `SELECT s.id, s.payment_method, s.total_amount, s.total_cost, s.status, s.sold_on, s.sold_at, s.note
     FROM sales s ORDER BY s.id DESC LIMIT ?`
  ).all(limit);

  const itemStmt = db.prepare(
    `SELECT si.product_id, p.name AS product_name, si.quantity, si.unit_price, si.unit_cost, si.line_total
     FROM sale_items si JOIN products p ON p.id = si.product_id WHERE si.sale_id = ?`
  );
  return sales.map((s) => ({ ...s, items: itemStmt.all(s.id) }));
}

const voidSaleTx = db.transaction((id, userId) => {
  const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
  if (!sale) throw new AppError(404, 'SALE_NOT_FOUND');
  if (sale.status === 'voided') throw new AppError(409, 'ALREADY_VOIDED');

  const items = db.prepare('SELECT product_id, quantity FROM sale_items WHERE sale_id = ?').all(id);
  const restock = db.prepare('UPDATE products SET quantity = quantity + ? WHERE id = ?');
  for (const item of items) restock.run(item.quantity, item.product_id);

  db.prepare(`UPDATE sales SET status = 'voided' WHERE id = ?`).run(id);
  logAudit({ userId, action: 'VOID', entity: 'sale', entityId: id });
});

export const voidSale = (id, userId) => voidSaleTx(id, userId);
