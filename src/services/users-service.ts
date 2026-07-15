import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "../db/client";
import { sessions, users } from "../db/schema";

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginUserInput = {
  email: string;
  password: string;
};

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("Email sudah terdaftar");
  }
}

export class InvalidLoginError extends Error {
  constructor() {
    super("Email atau password salah");
  }
}

export async function registerUser(input: RegisterUserInput) {
  const existingUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existingUsers.length > 0) {
    throw new EmailAlreadyRegisteredError();
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  await db.insert(users).values({
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });
}

export async function loginUser(input: LoginUserInput) {
  const foundUsers = await db
    .select({
      id: users.id,
      password: users.password,
    })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  const user = foundUsers[0];

  if (!user) {
    throw new InvalidLoginError();
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new InvalidLoginError();
  }

  const token = crypto.randomUUID();

  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
}
