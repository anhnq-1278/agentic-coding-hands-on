import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Montserrat,
  Montserrat_Alternates,
  Orbitron,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
});

const montserratAlternates = Montserrat_Alternates({
  variable: "--font-montserrat-alternates",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
});

/**
 * Orbitron — closest Google-hosted fallback for the Figma "Digital Numbers"
 * face used by the Countdown takeover. For full pixel-fidelity the
 * "Digital Numbers" font should be self-hosted; until then Orbitron renders
 * a similarly geometric digit shape.
 */
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Sun Annual Awards 2025",
  description: "Sun Annual Awards 2025 application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${montserratAlternates.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
