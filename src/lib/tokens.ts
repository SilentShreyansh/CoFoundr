import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export type TokenType = "EMAIL_VERIFY" | "PASSWORD_RESET";

const TTL_MS = {
  EMAIL_VERIFY: 1000 * 60 * 60 * 24, // 24h
  PASSWORD_RESET: 1000 * 60 * 60, // 1h
} as const;

export async function createToken(userId: string, type: TokenType) {
  // Invalidate previous tokens of the same type for this user.
  await prisma.token.deleteMany({ where: { userId, type } });

  const token = randomBytes(32).toString("hex");
  await prisma.token.create({
    data: {
      userId,
      token,
      type,
      expires: new Date(Date.now() + TTL_MS[type]),
    },
  });
  return token;
}

export async function consumeToken(token: string, type: TokenType) {
  const record = await prisma.token.findUnique({ where: { token } });
  if (!record || record.type !== type) return null;
  if (record.expires < new Date()) {
    await prisma.token.delete({ where: { id: record.id } });
    return null;
  }
  await prisma.token.delete({ where: { id: record.id } });
  return record.userId;
}
