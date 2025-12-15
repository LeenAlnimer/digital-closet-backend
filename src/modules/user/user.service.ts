import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../../common/utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../common/utils/jwt";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
const prisma = new PrismaClient();

export async function registerUser(email: string, name: string, password: string) {
  // check existing
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, name, passwordHash: hashed },
  });

  // tokens
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });

  // store hashed refresh token
  const refreshHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const expiresAt = new Date();
  // parse REFRESH_TOKEN_EXPIRES_IN => rough: if 30d => add 30 days
  const days = process.env.REFRESH_TOKEN_EXPIRES_IN?.endsWith("d")
    ? parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN!.slice(0, -1))
    : 30;
  expiresAt.setDate(expiresAt.getDate() + days);

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshHash,
      userId: user.id,
      expiresAt,
    },
  });

  return { user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("INVALID_CREDENTIALS");
  const match = await comparePassword(password, user.passwordHash);
  if (!match) throw new Error("INVALID_CREDENTIALS");

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });

  const refreshHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const expiresAt = new Date();
  const days = process.env.REFRESH_TOKEN_EXPIRES_IN?.endsWith("d")
    ? parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN!.slice(0, -1))
    : 30;
  expiresAt.setDate(expiresAt.getDate() + days);

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshHash,
      userId: user.id,
      expiresAt,
    },
  });

  return { user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken };
}

export async function refreshTokens(oldRefreshToken: string) {
  try {
    const payload: any = verifyRefreshToken(oldRefreshToken) as any;
    const userId = payload.sub;
    // check db for hashed token
    const hash = crypto.createHash("sha256").update(oldRefreshToken).digest("hex");
    const stored = await prisma.refreshToken.findFirst({
      where: { userId: String(userId), tokenHash: hash },
    });
    if (!stored) throw new Error("INVALID_REFRESH");

    // create new tokens
    const accessToken = signAccessToken({ sub: userId });
    const refreshToken = signRefreshToken({ sub: userId });

    const newHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const expiresAt = new Date();
    const days = process.env.REFRESH_TOKEN_EXPIRES_IN?.endsWith("d")
      ? parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN!.slice(0, -1))
      : 30;
    expiresAt.setDate(expiresAt.getDate() + days);

    // delete old and save new
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    await prisma.refreshToken.create({
      data: { tokenHash: newHash, userId: String(userId), expiresAt },
    });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new Error("INVALID_REFRESH");
  }
}

export async function logoutUser(refreshToken: string) {
  const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await prisma.refreshToken.deleteMany({ where: { tokenHash: hash } });
  return true;
}
