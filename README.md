# Stationery Management & Sales Analytics System

A complete, working system for a stationery shop: products, stock, sales
(cash and credit), printing/photocopy/lamination services, a dashboard,
reports, and rule-based AI insights — in Amharic by default, switchable to
English.

This zip contains **source code only** (no `node_modules`), so it's small
and safe to copy anywhere. You install dependencies yourself in Step 2.

---

## 1. Requirements

- **Node.js 20 or newer.** Check with `node -v`. Get it from nodejs.org if needed.
- No database server to install — it uses SQLite, a single file.

## 2. Setup

Open **two terminals**.

**Terminal 1 — backend**
```bash
cd backend
npm install
npm run dev
```
Wait for `API running on http://localhost:4000`.

**Terminal 2 — frontend**
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173**.

First visit shows **"የባለቤት መለያ ይፍጠሩ" (create the owner account)**. Fill it
in — this becomes your login going forward.

## 3. What each folder is

```
stationery/
├── backend/        Node.js + Express API, SQLite database, all business logic
│   └── src/
│       ├── db/schema.sql       the full database design, with comments
│       ├── middleware/         auth check, validation, error formatting
│       └── modules/            one folder per feature (see table below)
└── frontend/        React app (Vite), Amharic-first with English toggle
    └── src/
        ├── i18n/locales/       am.json and en.json — every UI string
        ├── pages/              one file per screen
        └── components/         shared layout, nav, language switcher
```

## 4. Navigation (kept deliberately simple)

The app has **4 things in the main menu**, plus a floating 🤖 button:

| Nav item | What's inside |
|---|---|
| 📊 **Dashboard** | Today's numbers, low-stock warnings |
| 📦 **Manage** | Tabs: Sell · Add Stock · Services · Products · Stock List |
| 📄 **Reports** | Tabs: Daily · History (+ CSV export) · Trends |
| ⚙️ **Settings** | Add staff accounts |
| 🤖 (floating button, bottom-right, every screen) | AI insights panel |

On phones, the left menu becomes a bottom tab bar automatically.

There is **no customer or debt tracking** by design — every sale and
service is simply tagged **cash** (received now) or **account** (not yet
received), as a running total only. No names, no per-person balances.

## 5. Feature map (backend module → what it powers)

| Area | Backend module | Frontend |
|---|---|---|
| Login / owner setup / staff accounts | `modules/auth` | `Login.jsx`, `Settings.jsx` |
| Categories & products | `modules/categories`, `modules/products` | `Products.jsx` (tab in **Manage**) |
| Stock purchases | `modules/stock` | `AddStock.jsx` (tab in **Manage**) |
| Inventory & low-stock alerts | `modules/inventory` | `Inventory.jsx` (tab in **Manage**) |
| Sales — cash/account, stock deduction, voiding | `modules/sales` | `Sell.jsx` (tab in **Manage**) |
| Printing/photocopy/lamination services | `modules/services` | `Services.jsx` (tab in **Manage**) |
| Daily business record | `modules/daily` | `Daily.jsx` (tab in **Reports**) |
| Sales history & CSV export | `modules/analytics`, `modules/reports` | `Reports.jsx` (tab in **Reports**) |
| Revenue/profit trend charts | `modules/analytics` | `Analytics.jsx` (tab in **Reports**) |
| Dashboard summary | `modules/analytics` | `Dashboard.jsx` |
| AI-style insights | `modules/analytics` (`getInsights`) | `AIPanel.jsx` (floating button) |

## 5. Key engineering decisions (so you understand the "why")

- **Money is stored as integers in santim** (1 ETB = 100 santim), never as
  a decimal, so rounding errors can't creep into totals.
- **Every sale locks in the product's cost at that moment** (`unit_cost` on
  `sale_items`). If you later change a product's purchase price, old sales'
  recorded profit does not change.
- **Stock changes happen inside one database transaction.** Recording a
  sale checks stock, deducts it, and writes the sale rows together — if
  anything fails partway, all of it rolls back, so stock and history can
  never disagree.
- **A sale is never deleted, only voided.** Voiding restores the stock and
  marks the sale `voided`, but the row (and the fact it happened) stays
  forever, for audit purposes.
- **Nothing is a stored daily total.** The Daily Records page and Dashboard
  are calculated live from the actual `sales` / `sale_items` /
  `service_transactions` tables every time you open them, so they can never
  drift out of sync.
- **The "AI" insights are rule-based, not generative.** Top sellers, slow
  movers, and restock suggestions are computed with plain SQL from your
  real transactions — nothing is invented, and there's no external AI
  service or API key needed. This matches the spec's requirement that the
  AI "must not invent business data."
- **CSV export, not PDF/Excel yet.** CSV needs no extra library and opens
  fine in Excel (a BOM is included so Amharic text displays correctly).
  PDF/Excel were marked as a "later feature" in the spec — see Section 8.

## 6. Trying it out — a suggested first walkthrough

1. Create the owner account, then go to **Manage → Products** and add
   "Notebook" (category: School Supplies, threshold 5).
2. Switch to the **Add Stock** tab: 10 notebooks, cost 20 ETB, price 40 ETB.
3. Switch to the **Sell** tab: add 2 notebooks to the cart, pay **cash**,
   complete the sale.
4. Try selling 100 notebooks — you'll get a clear "not enough stock" error.
5. Sell 3 more notebooks with payment method **account** — no extra
   information needed, it's just tagged as not-yet-received.
6. Switch to the **Services** tab, record 50 pages of black & white
   printing.
7. Check **Dashboard** for today's numbers, then **Reports → Daily** for
   the same day broken down, and **Reports → Trends** for the 14-day chart.
8. Tap the floating **🤖** button (bottom-right) for AI insights — top
   sellers, slow movers, restock suggestions.
9. Go to **Reports → History** and download the inventory or
   sales-history CSV.
10. Switch language with the 🇪🇹/🇬🇧 buttons at any point — everything
    changes, including the AI insight labels.

## 7. Security included

- Passwords are hashed with bcrypt, never stored in plain text.
- All routes except `/auth/*` require a valid JWT token.
- Voiding a sale requires the **owner** role (staff cannot).
- All input is validated on the server with Zod — the frontend's checks
  are only for a nicer experience, not the real protection.
- `better-sqlite3` uses parameterized queries everywhere, so there is no
  SQL injection surface.
- Secrets (`JWT_SECRET`) live in `.env`, not in code. **Change the default
  value in `backend/.env` before using this for real**, and keep `.env`
  out of version control (already in `.gitignore`).
- Every create/update/void writes a row to `audit_logs` with who did it
  and when.

## 8. Deliberately left for later (keeps the app simple for its size)

- PDF and Excel report export (CSV covers the same data today).
- Multi-shop / multi-branch support.
- Password reset flow (an owner can create staff accounts from Settings,
  but there's no "forgot password" email flow — add one if you deploy
  this for real use, since it requires an email/SMS service).
- Fully automated test suite (the walkthrough in Section 6 covers the
  main paths by hand; testing was Day 9 in the original 7-day plan and
  is worth adding before trusting this with real money long-term).

## 9. Deploying it for real use

For actual shop use (not just testing on your laptop):
1. Put the backend on a small VM or a host that supports Node (a Raspberry
   Pi in the shop works fine, since SQLite needs no separate database
   server).
2. Run `npm run build` in `frontend/` and serve the resulting `dist/`
   folder as static files (any static host, or the same machine via
   nginx).
3. **Back up `backend/data/stationery.db` regularly** — copying that one
   file IS your backup. Put it on a USB drive or cloud folder daily.
4. Change `JWT_SECRET` in `.env` to a long random value, and set
   `CLIENT_ORIGIN` to your real frontend URL.
