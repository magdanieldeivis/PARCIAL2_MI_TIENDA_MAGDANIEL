import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

export const expoDb = openDatabaseSync('mi_tienda.db');

// Asegura que la tabla SQLite esté disponible inmediatamente
expoDb.execSync(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    client_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    synced_at INTEGER
  );
`);

export const db = drizzle(expoDb, { schema });
