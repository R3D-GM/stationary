import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';

const dbPath = path.resolve(env.dbPath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');   // safer + faster writes
db.pragma('foreign_keys = ON');    // enforce relationships (off by default in SQLite!)