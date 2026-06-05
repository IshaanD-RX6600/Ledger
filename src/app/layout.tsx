import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ledger",
  description: "Portfolio dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-3">
            <span className="font-bold text-gray-900">Ledger</span>
            <Link href="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
              Portfolio
            </Link>
            <Link href="/explore" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
              Explore
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
