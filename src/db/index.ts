import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use a placeholder URL during build if DATABASE_URL is not set
// This allows the build to complete without a database connection
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:password@placeholder.neon.tech/dbname';

const db = drizzle(databaseUrl, { schema });

export { db };