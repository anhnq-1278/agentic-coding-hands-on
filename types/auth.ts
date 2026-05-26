export type AuthSession = {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  domain: string;
  issuedAt: number;
  expiresAt: number;
};

export type LoginButtonState = "idle" | "loading" | "error";

export type Locale = "vi" | "en";
