import { requireCustomer } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Badge, statusBadge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`
}

export default async function CustomerDashboard() {
  const session = await requireCustomer()
  const userId = (session.user as any).id

  const bookings = await prisma.booking.findMany({
    where: { customerId: userId },
    include: {
      team: { include: { company: true } },
      services: { include: { service: true } },
      availability: true,
      review: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  const activeCount = bookings.filter((b) => ["PENDING", "CONFIRMED"].includes(b.status)).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Hello, {(session.user as any).name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-slate-500 mt-1">Manage your cleaning bookings</p>
        </div>
        <Link href="/book">
          <Button size="lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Book a clean
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card padding="sm">
          <p className="text-sm text-slate-500">Total bookings</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{bookings.length}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-slate-500">Active</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{activeCount}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {bookings.filter((b) => b.status === "COMPLETED").length}
          </p>
        </Card>
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Recent bookings</h2>
          <Link href="/bookings" className="text-sm text-blue-600 hover:text-blue-700">View all →</Link>
        </div>

        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-4xl mb-3">🧹</p>
            <p className="text-slate-600 font-medium">No bookings yet</p>
            <p className="text-slate-400 text-sm mt-1 mb-4">Book your first clean to get started</p>
            <Link href="/book"><Button>Book now</Button></Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Link key={b.id} href={`/bookings/${b.id}`}>
                <Card padding="sm" className="hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-800 truncate">{b.team.name}</p>
                        <Badge variant={statusBadge(b.status)}>{b.status}</Badge>
                        {b.status === "COMPLETED" && !b.review && (
                          <Badge variant="purple">Review pending</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {b.availability.date} · {b.availability.startTime}–{b.availability.endTime}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {b.services.map((s) => `${s.quantity > 1 ? `${s.quantity}× ` : ""}${s.service.name}`).join(", ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-slate-600">{formatMinutes(b.totalMinutes)}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
