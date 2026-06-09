"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

const NAV_LINKS = [
  { href: "/", label: "Portfolio" },
  { href: "/explore", label: "Explore" },
  { href: "/settings", label: "Settings" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, signIn, signOut } = useAuth();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 focus:outline-none"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span className={`h-0.5 w-5 bg-gray-700 transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`h-0.5 w-5 bg-gray-700 transition-all duration-200 ${open ? "scale-x-0 opacity-0" : ""}`} />
        <span className={`h-0.5 w-5 bg-gray-700 transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {/* Backdrop — rendered via a portal-like top-level fixed div */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.45)", pointerEvents: open ? "auto" : "none", opacity: open ? 1 : 0, transition: "opacity 0.25s" }}
      />

      {/* Slide-in drawer — flex column so footer naturally stays at bottom */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "288px",
          zIndex: 50,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out",
        }}
        className="flex flex-col bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <span className="font-bold text-gray-900">Ledger</span>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links — flex-1 fills space between header and footer */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User info footer */}
        <div className="flex-shrink-0 border-t border-gray-100 p-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full" referrerPolicy="no-referrer" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{user.displayName}</p>
                <p className="truncate text-xs text-gray-400">{user.email}</p>
              </div>
              <button onClick={signOut} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </>
  );
}
