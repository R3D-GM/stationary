import { db } from '../db/connection.js';

export function logAudit({ userId = null, action, entity, entityId = null, details = null }) {
  db.prepare(
    `INSERT INTO audit_logs (user_id, action, entity, entity_id, details)
     VALUES (?, ?, ?, ?, ?)`
  ).run(userId, action, entity, entityId, details ? JSON.stringify(details) : null);
}
