import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";

import { db } from "./db/client";
import { todos } from "./db/schema";
import { usersRoute } from "./routes/users-route";

export const app = new Elysia()
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Learning Vibe Coding API",
          version: "0.1.0",
          description:
            "API sederhana menggunakan Bun, ElysiaJS, Drizzle ORM, dan MySQL.",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "UUID",
              description: "Gunakan token dari response login.",
            },
          },
        },
      },
    }),
  )
  .get(
    "/health",
    () => ({
      status: "ok",
    }),
    {
      detail: {
        tags: ["Health"],
        summary: "Health check",
        description: "Memastikan aplikasi berjalan.",
      },
      response: {
        200: t.Object({
          status: t.String(),
        }),
      },
    },
  )
  .get(
    "/todos",
    async () => {
      return db.select().from(todos).limit(20);
    },
    {
      detail: {
        tags: ["Todos"],
        summary: "List todos",
        description: "Mengambil daftar todo.",
      },
      response: {
        200: t.Array(
          t.Object({
            id: t.Number(),
            title: t.String(),
            createdAt: t.Date(),
          }),
        ),
      },
    },
  )
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
      detail: {
        tags: ["Todos"],
        summary: "Create todo",
        description: "Membuat todo baru.",
      },
      body: t.Object({
        title: t.String({ minLength: 1 }),
      }),
      response: {
        201: t.Object({
          success: t.Boolean(),
        }),
      },
    },
  )
  .use(usersRoute);
