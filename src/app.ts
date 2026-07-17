import { Elysia, t } from "elysia";

import { db } from "./db/client";
import { todos } from "./db/schema";
import { usersRoute } from "./routes/users-route";

export const app = new Elysia()
  .get("/health", () => ({
    status: "ok",
  }))
  .get("/todos", async () => {
    return db.select().from(todos).limit(20);
  })
  .post(
    "/todos",
    async ({ body, set }) => {
      await db.insert(todos).values({
        title: body.title,
      });

      set.status = 201;

      return {
        success: true,
      };
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1 }),
      }),
    },
  )
  .use(usersRoute);
