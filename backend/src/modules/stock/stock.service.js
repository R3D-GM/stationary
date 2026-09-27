import { db } from '../../db/connection.js';
import { AppError } from '../../utils/AppError.js';
import { logAudit } from '../../utils/audit.js';
import { toSantim } from '../../utils/money.js';

const addStockTx = db.transaction((data, userId) => {
  const product = db
    .prepare('SELECT id FROM products WHERE id = ? AND is_active = 1')
    .get(data.productId);
  if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND');

  const unitCost = toSantim(data.unitCost);
  const sellingPrice = toSantim(data.sellingPrice);

  const info = db
    .prepare(
      `INSERT INTO stock_purchases
         (product_id, quantity, unit_cost, selling_price, supplier, purchased_on, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(data.productId, data.quantity, unitCost, sellingPrice, data.supplier || null, data.purchasedOn, userId);

  db.prepare(
    `UPDATE products
     SET quantity = quantity + ?, cost_price = ?, selling_price = ?
     WHERE id = ?`
  ).run(data.quantity, unitCost, sellingPrice, data.productId);

  logAudit({
    userId, action: 'CREATE', entity: 'stock_purchase',
    entityId: info.lastInsertRowid, details: { ...data },
  });
  return info.lastInsertRowid;
});

export const addStock = (data, userId) => addStockTx(data, userId);

export function listPurchases() {
  return db
    .prepare(
      `SELECT sp.id, sp.quantity, sp.unit_cost, sp.selling_price, sp.supplier,
              sp.purchased_on, p.name AS product_name, p.unit
       FROM stock_purchases sp
       JOIN products p ON p.id = sp.product_id
       ORDER BY sp.id DESC LIMIT 20`
    )
    .all();
}
