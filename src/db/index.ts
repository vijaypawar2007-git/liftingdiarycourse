import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use a placeholder URL during build time when DATABASE_URL is not available
const connectionString = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

const db = drizzle(connectionString, { schema });

export { db };