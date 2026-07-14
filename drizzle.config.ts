import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl =
  process.env.DATABASE_URL ??
  `mysql://${process.env.DB_USER ?? "root"}:${process.env.DB_PASSWORD ?? "root"}@${
    process.env.DB_HOST ?? "localhost"
  }:${process.env.DB_PORT ?? "3306"}/${
    process.env.DB_NAME ?? "learning_vibe_coding"
  }`;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
