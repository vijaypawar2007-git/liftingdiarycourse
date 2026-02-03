import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use a fallback URL during build to prevent errors when DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname';

const db = drizzle(databaseUrl, { schema });

export { db };