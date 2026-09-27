import { db } from '../../db/connection.js';
import { AppError } from '../../utils/AppError.js';
import { logAudit } from '../../utils/audit.js';
import { toSantim } from '../../utils/money.js';
import { nowParts } from '../../utils/date.js';

export function listServiceTypes() {
  return db.prepare('SELECT * FROM service_types WHERE is_active = 1').all();
}

export function createServiceTransaction(data, userId) {
  const type = db.prepare('SELECT * FROM service_types WHERE id = ? AND is_active = 1').get(data.serviceTypeId);
  if (!type) throw new AppError(404, 'SERVICE_TYPE_NOT_FOUND');

  const unitPrice = toSantim(data.unitPrice);
  const total = unitPrice * data.quantity;
  const { date, time } = nowParts();

  const info = db.prepare(
    `INSERT INTO service_transactions
       (service_type_id, quantity, unit_price, total_amount, payment_method, done_on, done_at, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(data.serviceTypeId, data.quantity, unitPrice, total, data.paymentMethod, date, time, userId);

  logAudit({ userId, action: 'CREATE', entity: 'service_transaction', entityId: info.lastInsertRowid });
  return info.lastInsertRowid;
}

export function listServiceTransactions({ limit = 50 } = {}) {
  return db.prepare(
    `SELECT st.id, st.quantity, st.unit_price, st.total_amount, st.payment_method, st.status,
            st.done_on, st.done_at, t.name_am, t.name_en, t.code
     FROM service_transactions st
     JOIN service_types t ON t.id = st.service_type_id
     ORDER BY st.id DESC LIMIT ?`
  ).all(limit);
}
