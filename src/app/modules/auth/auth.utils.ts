import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env, isProduction } from "@/app/config/env";
import type { JwtPayload } from "@/app/modules/auth/auth.interface";

export const refreshTokenCookieName = "refreshToken";
export const accessTokenCookieName = "accessToken";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function createRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as JwtPayload;
}

export const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  domain: isProduction ? env.COOKIE_DOMAIN : undefined,
} as const;
