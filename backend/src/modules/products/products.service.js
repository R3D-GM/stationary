import { db } from '../../db/connection.js';
import { AppError } from '../../utils/AppError.js';
import { logAudit } from '../../utils/audit.js';

const SELECT = `
  SELECT p.id, p.name, p.category_id, p.description, p.unit,
         p.cost_price, p.selling_price, p.quantity, p.low_stock_threshold,
         c.name_am AS category_am, c.name_en AS category_en
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id`;

export function listProducts() {
  return db.prepare(`${SELECT} WHERE p.is_active = 1 ORDER BY p.name`).all();
}

function getProduct(id) {
  return db.prepare(`${SELECT} WHERE p.id = ?`).get(id);
}

function checkCategory(categoryId) {
  if (categoryId == null) return;
  const c = db.prepare('SELECT id FROM categories WHERE id = ?').get(categoryId);
  if (!c) throw new AppError(400, 'CATEGORY_NOT_FOUND');
}

function checkDuplicateName(name, exceptId = 0) {
  const dup = db
    .prepare('SELECT id FROM products WHERE lower(name) = lower(?) AND is_active = 1 AND id != ?')
    .get(name, exceptId);
  if (dup) throw new AppError(409, 'PRODUCT_EXISTS');
}

export function createProduct(data, userId) {
  checkCategory(data.categoryId);
  checkDuplicateName(data.name);
  const info = db
    .prepare(
      `INSERT INTO products (name, category_id, description, unit, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(data.name, data.categoryId ?? null, data.description || null, data.unit, data.lowStockThreshold);
  logAudit({ userId, action: 'CREATE', entity: 'product', entityId: info.lastInsertRowid });
  return getProduct(info.lastInsertRowid);
}

export function updateProduct(id, data, userId) {
  if (!getProduct(id)) throw new AppError(404, 'PRODUCT_NOT_FOUND');
  checkCategory(data.categoryId);
  checkDuplicateName(data.name, id);
  db.prepare(
    `UPDATE products
     SET name = ?, category_id = ?, description = ?, unit = ?, low_stock_threshold = ?
     WHERE id = ?`
  ).run(data.name, data.categoryId ?? null, data.description || null, data.unit, data.lowStockThreshold, id);
  logAudit({ userId, action: 'UPDATE', entity: 'product', entityId: id, details: data });
  return getProduct(id);
}
