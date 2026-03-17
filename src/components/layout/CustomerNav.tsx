"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

export function CustomerNav({ userName }: { userName: string }) {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Home" },
    { href: "/book", label: "Book a Clean" },
    { href: "/bookings", label: "My Bookings" },
  ]

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-800">
            <span>✨</span>
            <span>SparkleClean</span>
          </Link>
          <div className="hidden sm:flex gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === l.href || pathname.startsWith(l.href + "/")
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 hidden sm:block">Hi, {userName.split(" ")[0]}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
