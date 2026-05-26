import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { AuthSession } from "@/types/auth";

export const SESSION_COOKIE_NAME = "saa-session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const OAUTH_STATE_COOKIE = "saa-oauth-state";
export const OAUTH_VERIFIER_COOKIE = "saa-oauth-verifier";
export const OAUTH_FLOW_TTL_SECONDS = 60 * 10; // 10 minutes

const JWT_ALG = "HS256";

function getSecret(): Uint8Array {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set to a random string of at least 32 characters.",
    );
  }
  return new TextEncoder().encode(value);
}

export type SessionUser = Pick<
  AuthSession,
  "userId" | "email" | "displayName" | "avatarUrl" | "domain"
>;

export async function createSessionJwt(user: SessionUser): Promise<string> {
  return await new SignJWT({
    email: user.email,
    name: user.displayName,
    picture: user.avatarUrl,
    hd: user.domain,
  })
    .setProtectedHeader({ alg: JWT_ALG })
    .setSubject(user.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function readSessionJwt(jwt: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(jwt, getSecret());
    if (!payload.sub || typeof payload.email !== "string") {
      return null;
    }
    return {
      userId: payload.sub,
      email: payload.email,
      displayName: typeof payload.name === "string" ? payload.name : null,
      avatarUrl: typeof payload.picture === "string" ? payload.picture : null,
      domain: typeof payload.hd === "string" ? payload.hd : "",
    };
  } catch {
    return null;
  }
}

/**
 * Server-only: read the session JWT from cookies and return the verified
 * user, or `null` when the cookie is missing or invalid.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE_NAME)?.value;
  if (!value) {
    return null;
  }
  return readSessionJwt(value);
}
