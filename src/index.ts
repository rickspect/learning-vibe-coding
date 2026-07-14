import { Elysia, t } from "elysia";

import { db } from "./db/client";
import { todos } from "./db/schema";
import { usersRoute } from "./routes/users-route";

const port = Number(Bun.env.PORT ?? 3000);

const app = new Elysia()
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
  .use(usersRoute)
  .listen(port);

console.log(`Server running at http://${app.server?.hostname}:${app.server?.port}`);
