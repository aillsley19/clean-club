import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    const role = (session.user as any).role
    redirect(role === "COMPANY_MANAGER" ? "/manager/dashboard" : "/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <span className="font-bold text-xl text-slate-800">CleanClub</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
          <span>🏠</span>
          <span>Professional cleaning, on your schedule</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight mb-6">
          Book a spotless clean<br />
          <span className="text-blue-600">in minutes</span>
        </h1>

        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12">
          Select exactly what needs cleaning, get an instant time estimate, and connect with professional cleaning teams in your area.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            Book a cleaning
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link href="/register?role=COMPANY_MANAGER" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            Register your company
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24">
          {[
            { icon: "🧹", title: "Choose your clean", desc: "Select rooms and services. We calculate the exact time needed." },
            { icon: "📅", title: "Pick a slot", desc: "Browse available teams in your area and pick a time that works for you." },
            { icon: "⭐", title: "Rate & review", desc: "Leave feedback after every clean to help maintain quality standards." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-left">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-slate-800 text-lg mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* For companies */}
        <div className="mt-16 bg-slate-900 rounded-3xl p-12 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Running a cleaning company?</h2>
              <p className="text-slate-400">Create teams, set coverage areas, manage availability and view all your bookings in one place.</p>
            </div>
            <Link href="/register?role=COMPANY_MANAGER" className="shrink-0 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors">
              Join as a company →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
