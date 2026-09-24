-- MONEY RULE: all money columns are INTEGER santim (100 santim = 1 ETB).
-- DATE RULE: dates are TEXT 'YYYY-MM-DD', times are TEXT 'HH:MM:SS'.

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner','staff')),
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  name_am TEXT NOT NULL UNIQUE,
  name_en TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  name                TEXT NOT NULL,
  category_id         INTEGER REFERENCES categories(id),
  description         TEXT,
  unit                TEXT NOT NULL DEFAULT 'piece',
  cost_price          INTEGER NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
  selling_price       INTEGER NOT NULL DEFAULT 0 CHECK (selling_price >= 0),
  quantity            INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0), -- DB itself blocks negative stock
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  is_active           INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- History of every stock entry (what came into the shop).
CREATE TABLE IF NOT EXISTS stock_purchases (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id   INTEGER NOT NULL REFERENCES products(id),
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost    INTEGER NOT NULL CHECK (unit_cost >= 0),
  selling_price INTEGER NOT NULL CHECK (selling_price >= 0),
  supplier     TEXT,
  purchased_on TEXT NOT NULL,
  created_by   INTEGER NOT NULL REFERENCES users(id),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS customers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  phone      TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sales (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id    INTEGER REFERENCES customers(id),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash','credit')),
  total_amount   INTEGER NOT NULL CHECK (total_amount >= 0),
  total_cost     INTEGER NOT NULL CHECK (total_cost >= 0),
  status         TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','voided')),
  sold_on        TEXT NOT NULL,
  sold_at        TEXT NOT NULL,
  note           TEXT,
  created_by     INTEGER NOT NULL REFERENCES users(id),
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  -- a credit sale must say who owes the money
  CHECK (payment_method = 'cash' OR customer_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS sale_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id    INTEGER NOT NULL REFERENCES sales(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  unit_cost  INTEGER NOT NULL CHECK (unit_cost >= 0),  -- snapshot of cost at time of sale
  line_total INTEGER NOT NULL CHECK (line_total >= 0)
);

CREATE TABLE IF NOT EXISTS service_types (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  code          TEXT NOT NULL UNIQUE,
  name_am       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  default_price INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS service_transactions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  service_type_id INTEGER NOT NULL REFERENCES service_types(id),
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price      INTEGER NOT NULL CHECK (unit_price >= 0),
  total_amount    INTEGER NOT NULL CHECK (total_amount >= 0),
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('cash','credit')),
  customer_id     INTEGER REFERENCES customers(id),
  status          TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','voided')),
  done_on         TEXT NOT NULL,
  done_at         TEXT NOT NULL,
  created_by      INTEGER NOT NULL REFERENCES users(id),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (payment_method = 'cash' OR customer_id IS NOT NULL)
);

-- Money received later for a credit sale OR credit service.
CREATE TABLE IF NOT EXISTS payments (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id                INTEGER REFERENCES sales(id),
  service_transaction_id INTEGER REFERENCES service_transactions(id),
  amount                 INTEGER NOT NULL CHECK (amount > 0),
  paid_on                TEXT NOT NULL,
  created_by             INTEGER NOT NULL REFERENCES users(id),
  created_at             TEXT NOT NULL DEFAULT (datetime('now')),
  -- exactly one of the two must be set
  CHECK ((sale_id IS NOT NULL) + (service_transaction_id IS NOT NULL) = 1)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id),
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  INTEGER,
  details    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sales_date      ON sales(sold_on);
CREATE INDEX IF NOT EXISTS idx_sale_items_prod ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_services_date   ON service_transactions(done_on);
CREATE INDEX IF NOT EXISTS idx_purchases_prod  ON stock_purchases(product_id);