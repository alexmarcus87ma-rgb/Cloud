import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(process.cwd(), process.env.DB_PATH ?? "data/app.db");

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS score (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    userName TEXT NOT NULL,
    game TEXT NOT NULL,
    score INTEGER NOT NULL,
    createdAt INTEGER NOT NULL
  )
`);

export default db;
