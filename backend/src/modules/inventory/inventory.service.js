import { db } from '../../db/connection.js';

export function getInventory() {
  const rows = db
    .prepare(
      `SELECT p.id, p.name, p.unit, p.cost_price, p.selling_price,
              p.quantity AS remaining, p.low_stock_threshold,
              c.name_am AS category_am, c.name_en AS category_en,
              COALESCE((SELECT SUM(quantity) FROM stock_purchases
                        WHERE product_id = p.id), 0) AS total_purchased,
              COALESCE((SELECT SUM(si.quantity) FROM sale_items si
                        JOIN sales s ON s.id = si.sale_id
                        WHERE si.product_id = p.id AND s.status = 'completed'), 0) AS total_sold,
              COALESCE((SELECT SUM(si.line_total - si.unit_cost * si.quantity) FROM sale_items si
                        JOIN sales s ON s.id = si.sale_id
                        WHERE si.product_id = p.id AND s.status = 'completed'), 0) AS actual_profit
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = 1
       ORDER BY p.name`
    )
    .all();

  return rows.map((r) => ({
    ...r,
    potential_profit: r.remaining * (r.selling_price - r.cost_price),
    is_low: r.remaining <= r.low_stock_threshold,
  }));
}

export const getLowStock = () => getInventory().filter((r) => r.is_low);
