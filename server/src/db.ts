import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";

let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initDb() {
  db = await open({
    filename: path.join(process.cwd(), "husk.db"),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS coconut_inputs (
      id TEXT PRIMARY KEY,
      date TEXT,
      count INTEGER,
      price_per_unit REAL,
      total_price REAL,
      client TEXT,
      payment_status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS labour_wages (
      id TEXT PRIMARY KEY,
      date TEXT,
      worker_name TEXT,
      days REAL,
      rate_per_day REAL,
      total_wage REAL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE
    );
  `);
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}
