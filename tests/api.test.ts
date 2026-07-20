import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

Bun.env.DB_PASSWORD ??= "root";

let app: typeof import("../src/app").app;
let db: typeof import("../src/db/client").db;
let schema: typeof import("../src/db/schema");

beforeAll(async () => {
  app = (await import("../src/app")).app;
  db = (await import("../src/db/client")).db;
  schema = await import("../src/db/schema");
});

beforeEach(async () => {
  await cleanupDatabase();
});

async function cleanupDatabase() {
  await db.delete(schema.sessions);
  await db.delete(schema.users);
  await db.delete(schema.todos);
}

function request(path: string, init?: RequestInit) {
  return app.handle(new Request(`http://localhost${path}`, init));
}

async function requestJson(path: string, init?: RequestInit) {
  const response = await request(path, init);
  const body = await response.json().catch(() => null);

  return {
    response,
    body,
  };
}

function jsonRequest(method: string, body: unknown, headers?: HeadersInit) {
  return {
    method,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

function uniqueEmail(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}@localhost`;
}

async function registerUser(overrides: Partial<{ name: string; email: string; password: string }> = {}) {
  const payload = {
    name: "Eko",
    email: uniqueEmail("user"),
    password: "rahasia",
    ...overrides,
  };

  const result = await requestJson("/api/users", jsonRequest("POST", payload));

  return {
    ...result,
    payload,
  };
}

async function loginUser(email: string, password = "rahasia") {
  return requestJson(
    "/api/users/login",
    jsonRequest("POST", {
      email,
      password,
    }),
  );
}

describe("GET /health", () => {
  it("returns application status", async () => {
    const { response, body } = await requestJson("/health");

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: "ok",
    });
  });
});

describe("Swagger documentation", () => {
  it("serves Swagger UI", async () => {
    const response = await request("/swagger");
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(body).toContain("Learning Vibe Coding API");
  });

  it("serves OpenAPI JSON with available API paths", async () => {
    const { response, body } = await requestJson("/swagger/json");

    expect(response.status).toBe(200);
    expect(body.info.title).toBe("Learning Vibe Coding API");
    expect(body.paths).toHaveProperty("/health");
    expect(body.paths).toHaveProperty("/todos");
    expect(body.paths).toHaveProperty("/api/users");
    expect(body.paths).toHaveProperty("/api/users/login");
    expect(body.paths).toHaveProperty("/api/users/current");
    expect(body.paths).toHaveProperty("/api/users/logout");
  });
});

describe("todos API", () => {
  it("creates a todo", async () => {
    const { response, body } = await requestJson(
      "/todos",
      jsonRequest("POST", {
        title: "Learn Bun",
      }),
    );

    expect(response.status).toBe(201);
    expect(body).toEqual({
      success: true,
    });
  });

  it("returns todos", async () => {
    await requestJson(
      "/todos",
      jsonRequest("POST", {
        title: "Read docs",
      }),
    );

    const { response, body } = await requestJson("/todos");

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Read docs",
        }),
      ]),
    );
  });

  it("rejects invalid todo request body", async () => {
    const { response } = await requestJson("/todos", jsonRequest("POST", {}));

    expect(response.status).toBe(422);
  });
});

describe("POST /api/users", () => {
  it("registers a user", async () => {
    const { response, body } = await registerUser();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      data: "OK",
    });
  });

  it("rejects duplicate email", async () => {
    const email = uniqueEmail("duplicate");

    await registerUser({ email });
    const { response, body } = await registerUser({ email });

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "Email sudah terdaftar",
    });
  });

  it("rejects empty registration fields", async () => {
    const cases = [
      { name: "", email: uniqueEmail("empty-name"), password: "rahasia" },
      { name: "Eko", email: "", password: "rahasia" },
      { name: "Eko", email: uniqueEmail("empty-password"), password: "" },
    ];

    for (const payload of cases) {
      const { response } = await requestJson("/api/users", jsonRequest("POST", payload));

      expect(response.status).toBe(422);
    }
  });

  it("rejects registration fields longer than 255 characters", async () => {
    const longValue = "A".repeat(256);
    const cases = [
      { name: longValue, email: uniqueEmail("long-name"), password: "rahasia" },
      { name: "Eko", email: `${longValue}@localhost`, password: "rahasia" },
      { name: "Eko", email: uniqueEmail("long-password"), password: longValue },
    ];

    for (const payload of cases) {
      const { response } = await requestJson("/api/users", jsonRequest("POST", payload));

      expect(response.status).toBe(422);
    }
  });

  it("stores password as a hash", async () => {
    const password = "rahasia";
    const { payload } = await registerUser({ password });
    const savedUsers = await db
      .select({ password: schema.users.password })
      .from(schema.users)
      .where(eq(schema.users.email, payload.email))
      .limit(1);

    expect(savedUsers[0]?.password).toBeTruthy();
    expect(savedUsers[0]?.password).not.toBe(password);
    expect(await bcrypt.compare(password, savedUsers[0].password)).toBe(true);
  });
});

describe("POST /api/users/login", () => {
  it("logs in with valid credentials and stores session token", async () => {
    const { payload } = await registerUser();
    const { response, body } = await loginUser(payload.email, payload.password);

    expect(response.status).toBe(200);
    expect(typeof body.data).toBe("string");

    const savedSessions = await db
      .select({ token: schema.sessions.token })
      .from(schema.sessions)
      .where(eq(schema.sessions.token, body.data))
      .limit(1);

    expect(savedSessions).toHaveLength(1);
  });

  it("rejects unknown email", async () => {
    const { response, body } = await loginUser(uniqueEmail("unknown"));

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "Email atau password salah",
    });
  });

  it("rejects wrong password", async () => {
    const { payload } = await registerUser();
    const { response, body } = await loginUser(payload.email, "salah");

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "Email atau password salah",
    });
  });

  it("rejects invalid login request body", async () => {
    const { response } = await requestJson("/api/users/login", jsonRequest("POST", {}));

    expect(response.status).toBe(422);
  });
});

describe("GET /api/users/current", () => {
  it("returns current user for valid token without password", async () => {
    const { payload } = await registerUser();
    const login = await loginUser(payload.email, payload.password);
    const token = login.body.data;

    const { response, body } = await requestJson("/api/users/current", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.status).toBe(200);
    expect(body.data).toEqual(
      expect.objectContaining({
        name: payload.name,
        email: payload.email,
      }),
    );
    expect(body.data.password).toBeUndefined();
  });

  it("rejects missing authorization header", async () => {
    const { response, body } = await requestJson("/api/users/current");

    expect(response.status).toBe(401);
    expect(body).toEqual({
      error: "Unauthorized",
    });
  });

  it("rejects invalid authorization format", async () => {
    const { response, body } = await requestJson("/api/users/current", {
      headers: {
        authorization: "Token salah",
      },
    });

    expect(response.status).toBe(401);
    expect(body).toEqual({
      error: "Unauthorized",
    });
  });

  it("rejects unknown token", async () => {
    const { response, body } = await requestJson("/api/users/current", {
      headers: {
        authorization: `Bearer ${crypto.randomUUID()}`,
      },
    });

    expect(response.status).toBe(401);
    expect(body).toEqual({
      error: "Unauthorized",
    });
  });
});

describe("DELETE /api/users/logout", () => {
  it("logs out with valid token and deletes session", async () => {
    const { payload } = await registerUser();
    const login = await loginUser(payload.email, payload.password);
    const token = login.body.data;

    const { response, body } = await requestJson("/api/users/logout", {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.status).toBe(200);
    expect(body).toEqual({
      data: "OK",
    });

    const savedSessions = await db
      .select({ id: schema.sessions.id })
      .from(schema.sessions)
      .where(eq(schema.sessions.token, token))
      .limit(1);

    expect(savedSessions).toHaveLength(0);
  });

  it("prevents current user lookup after logout", async () => {
    const { payload } = await registerUser();
    const login = await loginUser(payload.email, payload.password);
    const token = login.body.data;

    await requestJson("/api/users/logout", {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const { response } = await requestJson("/api/users/current", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.status).toBe(401);
  });

  it("rejects missing authorization header", async () => {
    const { response, body } = await requestJson("/api/users/logout", {
      method: "DELETE",
    });

    expect(response.status).toBe(401);
    expect(body).toEqual({
      error: "Unauthorized",
    });
  });

  it("rejects invalid authorization format", async () => {
    const { response, body } = await requestJson("/api/users/logout", {
      method: "DELETE",
      headers: {
        authorization: "Token salah",
      },
    });

    expect(response.status).toBe(401);
    expect(body).toEqual({
      error: "Unauthorized",
    });
  });

  it("rejects unknown token", async () => {
    const { response, body } = await requestJson("/api/users/logout", {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${crypto.randomUUID()}`,
      },
    });

    expect(response.status).toBe(401);
    expect(body).toEqual({
      error: "Unauthorized",
    });
  });
});
