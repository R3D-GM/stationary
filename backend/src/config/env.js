import 'dotenv/config';

// Fail immediately if a required secret is missing, instead of
// running insecurely.
if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in .env');
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  dbPath: process.env.DB_PATH || './data/stationery.db',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};