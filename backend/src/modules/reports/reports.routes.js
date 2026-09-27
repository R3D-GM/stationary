import { Router } from 'express';
import { getInventory } from '../inventory/inventory.service.js';
import { getSalesHistory } from '../analytics/analytics.service.js';
import { toCsv } from './csv.js';

const router = Router();

router.get('/inventory.csv', (req, res) => {
  const rows = getInventory().map((i) => ({
    Product: i.name,
    Category: i.category_am,
    Remaining: i.remaining,
    CostPrice: (i.cost_price / 100).toFixed(2),
    SellingPrice: (i.selling_price / 100).toFixed(2),
    PotentialProfit: (i.potential_profit / 100).toFixed(2),
    ActualProfit: (i.actual_profit / 100).toFixed(2),
  }));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
  res.send('\uFEFF' + toCsv(rows)); // BOM so Amharic text opens correctly in Excel
});

router.get('/sales-history.csv', (req, res) => {
  const rows = getSalesHistory(req.query).map((t) => ({
    Date: t.date,
    Time: t.time,
    Type: t.type,
    Description: t.description,
    PaymentMethod: t.payment_method,
    Amount: (t.total_amount / 100).toFixed(2),
    Status: t.status,
  }));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="sales-history.csv"');
  res.send('\uFEFF' + toCsv(rows));
});

export default router;
