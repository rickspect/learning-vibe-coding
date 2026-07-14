import { Elysia, t } from "elysia";

import {
  EmailAlreadyRegisteredError,
  registerUser,
} from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" }).post(
  "/",
  async ({ body, set }) => {
    try {
      await registerUser(body);

      return {
        data: "OK",
      };
    } catch (error) {
      if (error instanceof EmailAlreadyRegisteredError) {
        set.status = 400;

        return {
          error: error.message,
        };
      }

      throw error;
    }
  },
  {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      email: t.String({ minLength: 1 }),
      password: t.String({ minLength: 1 }),
    }),
  },
);
