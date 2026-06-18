import { Database } from "bun:sqlite";
import fs from "node:fs";
import path from "node:path";
import { initializeDatabase } from "./schema";

const databasePath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "puzzle.sqlite");
const databaseDir = path.dirname(databasePath);

fs.mkdirSync(databaseDir, { recursive: true });

const db = new Database(databasePath, { create: true });

db.run("PRAGMA busy_timeout = 10000;");
db.run("PRAGMA journal_mode = WAL;");
initializeDatabase(db);

export default db;
