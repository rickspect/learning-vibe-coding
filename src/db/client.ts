import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as schema from "./schema";

const pool = Bun.env.DATABASE_URL
  ? mysql.createPool(Bun.env.DATABASE_URL)
  : mysql.createPool({
      host: Bun.env.DB_HOST ?? "localhost",
      port: Number(Bun.env.DB_PORT ?? 3306),
      user: Bun.env.DB_USER ?? "root",
      password: Bun.env.DB_PASSWORD ?? "",
      database: Bun.env.DB_NAME ?? "learning_vibe_coding",
      waitForConnections: true,
      connectionLimit: 10,
    });

export const db = drizzle(pool, { schema, mode: "default" });
