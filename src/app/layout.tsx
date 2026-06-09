import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import AuthGate from "@/components/AuthGate";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ledger",
  description: "Portfolio dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <AuthGate>
          <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-6 px-4 sm:px-6 lg:px-8 py-3">
              <span className="font-bold text-gray-900">Ledger</span>

              <div className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Portfolio
                </Link>
                <Link href="/explore" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Explore
                </Link>
                <Link href="/settings" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Settings
                </Link>
              </div>

              <div className="ml-auto hidden md:block">
                <AuthButton />
              </div>

              <div className="ml-auto md:hidden">
                <MobileNav />
              </div>
            </div>
          </nav>
          {children}
        </AuthGate>
      </body>
    </html>
  );
}
