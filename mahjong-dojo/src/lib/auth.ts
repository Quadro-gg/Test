import { prisma } from "./db";
import { createHash, randomBytes } from "crypto";

/** Simple hash for prototype — swap to bcrypt for production */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const attempt = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return attempt === hash;
}

export async function createUser(email: string, password: string, name?: string) {
  return prisma.user.create({
    data: {
      email,
      name,
      hashedPassword: hashPassword(password),
    },
  });
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  if (!verifyPassword(password, user.hashedPassword)) return null;
  return user;
}
