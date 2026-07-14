import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const todos = mysqlTable("todos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
