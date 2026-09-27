import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../db/connection.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { logAudit } from '../../utils/audit.js';

export function needsSetup() {
  return db.prepare('SELECT COUNT(*) AS c FROM users').get().c === 0;
}

export async function createOwner({ username, password, fullName }) {
  if (!needsSetup()) throw new AppError(403, 'SETUP_ALREADY_DONE');
  const hash = await bcrypt.hash(password, 10);
  const info = db
    .prepare(`INSERT INTO users (username, password_hash, full_name, role)
              VALUES (?, ?, ?, 'owner')`)
    .run(username, hash, fullName);
  logAudit({ userId: info.lastInsertRowid, action: 'CREATE', entity: 'user', entityId: info.lastInsertRowid });
  return { id: info.lastInsertRowid, username, full_name: fullName, role: 'owner' };
}

export async function createStaff({ username, password, fullName }, creatorId) {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) throw new AppError(409, 'USERNAME_TAKEN');
  const hash = await bcrypt.hash(password, 10);
  const info = db
    .prepare(`INSERT INTO users (username, password_hash, full_name, role)
              VALUES (?, ?, ?, 'staff')`)
    .run(username, hash, fullName);
  logAudit({ userId: creatorId, action: 'CREATE', entity: 'user', entityId: info.lastInsertRowid });
  return { id: info.lastInsertRowid, username, full_name: fullName, role: 'staff' };
}

export function listUsers() {
  return db.prepare('SELECT id, username, full_name, role, is_active FROM users ORDER BY id').all();
}

export async function login({ username, password }) {
  const user = db
    .prepare('SELECT * FROM users WHERE username = ? AND is_active = 1')
    .get(username);
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) throw new AppError(401, 'INVALID_CREDENTIALS');

  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
  return {
    token,
    user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role },
  };
}
