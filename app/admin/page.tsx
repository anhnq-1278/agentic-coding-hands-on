import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/auth/admin-roles";

export const metadata: Metadata = {
  title: "Admin Dashboard — Sun Annual Awards 2025",
};

/**
 * Placeholder Admin Dashboard. Visible only to users whose email is in
 * `ADMIN_EMAILS`. Non-admins are redirected to `/`.
 */
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!isAdminEmail(user.email)) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-saa-bg px-6 py-16 text-saa-text-primary">
      <div className="flex max-w-xl flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-base text-saa-text-muted">
          Coming soon. Admin tooling will live here.
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
