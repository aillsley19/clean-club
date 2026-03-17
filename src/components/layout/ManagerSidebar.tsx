"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

const NAV = [
  { href: "/manager/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/manager/teams", label: "Teams", icon: "👥" },
  { href: "/manager/bookings", label: "Bookings", icon: "📋" },
  { href: "/manager/reviews", label: "Reviews", icon: "⭐" },
]

export function ManagerSidebar({ userName }: { userName: string }) {
  const pathname = usePathname()

  return (
    <div className="w-56 shrink-0 bg-slate-900 min-h-screen flex flex-col">
      <div className="p-5 border-b border-slate-800">
        <Link href="/manager/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <span className="font-bold text-white">SparkleClean</span>
        </Link>
        <p className="text-xs text-slate-500 mt-1">Manager Portal</p>
      </div>

      <nav className="p-3 flex-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="text-sm text-slate-300 truncate font-medium">{userName}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors"
        >
          <span>↩</span>
          Sign out
        </button>
      </div>
    </div>
  )
}
