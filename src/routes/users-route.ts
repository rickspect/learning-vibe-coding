import { Elysia, t } from "elysia";

import {
  EmailAlreadyRegisteredError,
  InvalidLoginError,
  UnauthorizedError,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/users-service";

function getBearerToken(authorization: string | undefined) {
  const [type, token] = authorization?.split(" ") ?? [];

  if (type !== "Bearer" || !token) {
    throw new UnauthorizedError();
  }

  return token;
}

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .get("/current", async ({ headers, set }) => {
    try {
      const token = getBearerToken(headers.authorization);
      const user = await getCurrentUser(token);

      return {
        data: user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        set.status = 401;

        return {
          error: error.message,
        };
      }

      throw error;
    }
  })
  .delete("/logout", async ({ headers, set }) => {
    try {
      const token = getBearerToken(headers.authorization);

      await logoutUser(token);

      return {
        data: "OK",
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        set.status = 401;

        return {
          error: error.message,
        };
      }

      throw error;
    }
  })
  .post(
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
        name: t.String({ minLength: 1, maxLength: 255 }),
        email: t.String({ minLength: 1, maxLength: 255 }),
        password: t.String({ minLength: 1, maxLength: 255 }),
      }),
    },
  )
  .post(
    "/login",
    async ({ body, set }) => {
      try {
        const token = await loginUser(body);

        return {
          data: token,
        };
      } catch (error) {
        if (error instanceof InvalidLoginError) {
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
        email: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
      }),
    },
  );
