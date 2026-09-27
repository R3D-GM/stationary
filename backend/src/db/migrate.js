import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function runMigrations() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(sql);
  seedServiceTypes();
  seedCategories();
}

function seedServiceTypes() {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO service_types (code, name_am, name_en, default_price)
     VALUES (?, ?, ?, ?)`
  );
  insert.run('bw_print',    'ጥቁር እና ነጭ ህትመት', 'Black & White Printing', 200);
  insert.run('color_print', 'ቀለም ህትመት',        'Color Printing',         1000);
  insert.run('photocopy',   'ፎቶ ኮፒ',            'Photocopy',              100);
  insert.run('lamination',  'ላሚኔሽን',           'Lamination',             2000);
}

function seedCategories() {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO categories (name_am, name_en) VALUES (?, ?)`
  );
  insert.run('የመጻፊያ እቃዎች', 'Writing Materials');
  insert.run('የትምህርት ቤት እቃዎች', 'School Supplies');
  insert.run('ወረቀት', 'Paper');
  insert.run('የቢሮ እቃዎች', 'Office Supplies');
  insert.run('ሌሎች', 'Other');
}
