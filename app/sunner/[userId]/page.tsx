import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sunner Profile — Sun* Kudos",
};

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function SunnerProfilePlaceholder({ params }: Props) {
  const { userId } = await params;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-saa-bg px-6 py-16 text-saa-text-primary">
      <div className="flex max-w-xl flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ Sunner</h1>
        <p className="text-base text-saa-text-muted">
          Hồ sơ <code className="font-mono">{userId}</code> đang được phát triển
          ở spec riêng.
        </p>
        <Link
          href="/sun-kudos"
          className="rounded-md bg-saa-cta-bg px-5 py-2 text-base font-bold text-[#00101A]"
        >
          ← Quay lại Sun* Kudos
        </Link>
      </div>
    </main>
  );
}
