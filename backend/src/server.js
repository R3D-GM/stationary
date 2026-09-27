import app from './app.js';
import { env } from './config/env.js';
import { runMigrations } from './db/migrate.js';

runMigrations();
app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
});
