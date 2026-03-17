import { requireManager } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Badge, statusBadge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

export default async function ManagerDashboard() {
  const session = await requireManager()
  const userId = (session.user as any).id

  const company = await prisma.company.findUnique({
    where: { managerId: userId },
    include: {
      teams: {
        include: {
          _count: { select: { members: true, bookings: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
  })

  if (!company) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Welcome to SparkleClean</h1>
        <Card>
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🏢</p>
            <p className="font-semibold text-slate-700 mb-1">Set up your company</p>
            <p className="text-slate-400 text-sm mb-4">Create your company profile to start managing teams and bookings</p>
            <CreateCompanyForm />
          </div>
        </Card>
      </div>
    )
  }

  // Recent bookings
  const bookings = await prisma.booking.findMany({
    where: { team: { companyId: company.id } },
    include: {
      team: { select: { name: true } },
      customer: { select: { name: true } },
      availability: true,
      services: { include: { service: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  })

  const totalBookings = await prisma.booking.count({ where: { team: { companyId: company.id } } })
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length
  const allRatings = company.teams.flatMap((t) => t.reviews.map((r) => r.rating))
  const avgRating = allRatings.length > 0 ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1) : null

  const today = new Date().toISOString().split("T")[0]
  const upcomingSlots = await prisma.teamAvailability.count({
    where: { team: { companyId: company.id }, date: { gte: today }, isBooked: false },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
          <p className="text-slate-500 mt-0.5">Manager Dashboard</p>
        </div>
        <Link href="/manager/teams/new">
          <Button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New team
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="sm">
          <p className="text-sm text-slate-500">Teams</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{company.teams.length}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-slate-500">Total bookings</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalBookings}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-slate-500">Avg rating</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{avgRating ? `${avgRating}★` : "—"}</p>
        </Card>
      </div>

      {/* Teams */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Your Teams</h2>
          <Link href="/manager/teams" className="text-sm text-blue-600 hover:text-blue-700">Manage →</Link>
        </div>
        {company.teams.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-slate-500 mb-3">No teams yet</p>
            <Link href="/manager/teams/new"><Button variant="secondary">Create first team</Button></Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {company.teams.map((team) => {
              const avg = team.reviews.length
                ? (team.reviews.reduce((a, b) => a + b.rating, 0) / team.reviews.length).toFixed(1)
                : null
              return (
                <Link key={team.id} href={`/manager/teams/${team.id}`}>
                  <Card padding="sm" className="hover:border-blue-200 hover:shadow-md transition-all cursor-pointer h-full">
                    <p className="font-semibold text-slate-800 mb-2">{team.name}</p>
                    <p className="text-xs text-slate-400 mb-2">📍 {team.areaRadiusKm}km coverage area</p>
                    <div className="flex gap-3 text-xs text-slate-500">
                      <span>👥 {team._count.members} members</span>
                      <span>📋 {team._count.bookings} bookings</span>
                      {avg && <span>⭐ {avg}</span>}
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Recent Bookings</h2>
          <Link href="/manager/bookings" className="text-sm text-blue-600 hover:text-blue-700">View all →</Link>
        </div>
        {bookings.length === 0 ? (
          <Card className="text-center py-8 text-slate-400">No bookings yet</Card>
        ) : (
          <div className="space-y-2">
            {bookings.slice(0, 5).map((b) => (
              <Card key={b.id} padding="sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-slate-700">{b.customer.name}</p>
                      <span className="text-slate-300">·</span>
                      <p className="text-sm text-slate-500">{b.team.name}</p>
                      <Badge variant={statusBadge(b.status)}>{b.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">{b.availability.date} · {b.availability.startTime}–{b.availability.endTime}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CreateCompanyForm() {
  return (
    <Link href="/manager/company/new">
      <Button>Set up company profile</Button>
    </Link>
  )
}
