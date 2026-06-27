"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { uniqueUsername } from "@/lib/username";
import { createToken, consumeToken } from "@/lib/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mail";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import {
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

type ActionResult = { success?: string; error?: string };

export async function registerUser(values: unknown): Promise<ActionResult> {
  const ip = await clientIp();
  if (!rateLimit(`register:${ip}`, 5, 60_000).success) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists" };

  const passwordHash = await bcrypt.hash(password, 10);
  const username = await uniqueUsername(email);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      username,
      passwordHash,
      profile: { create: {} },
    },
  });

  const token = await createToken(user.id, "EMAIL_VERIFY");
  await sendVerificationEmail(email, token);

  return { success: "Account created. Check your email to verify your address." };
}

export async function requestPasswordReset(values: unknown): Promise<ActionResult> {
  const ip = await clientIp();
  if (!rateLimit(`reset:${ip}`, 5, 60_000).success) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: "Enter a valid email" };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  // Always return success to avoid leaking which emails are registered.
  if (user) {
    const token = await createToken(user.id, "PASSWORD_RESET");
    await sendPasswordResetEmail(user.email, token);
  }
  return { success: "If that email is registered, a reset link is on its way." };
}

export async function resetPassword(values: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { token, password } = parsed.data;

  const userId = await consumeToken(token, "PASSWORD_RESET");
  if (!userId) return { error: "This reset link is invalid or has expired." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { success: "Your password has been reset. You can now log in." };
}

export async function verifyEmail(token: string): Promise<ActionResult> {
  if (!token) return { error: "Missing verification token." };

  const userId = await consumeToken(token, "EMAIL_VERIFY");
  if (!userId) return { error: "This verification link is invalid or has expired." };

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });
  return { success: "Email verified! You can now log in." };
}
