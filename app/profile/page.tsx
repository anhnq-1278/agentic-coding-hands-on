import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Profile — Sun Annual Awards 2025",
};

/** Placeholder Profile page. Auth-required. */
export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-saa-bg px-6 py-16 text-saa-text-primary">
      <div className="flex max-w-xl flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-base text-saa-text-muted">
          Signed in as {user.displayName ?? user.email}.
        </p>
        <Link
          href="/"
          className="rounded-md bg-saa-cta-bg px-5 py-2 text-base font-bold text-saa-cta-text"
        >
          Back to homepage
        </Link>
      </div>
    </main>
  );
}
