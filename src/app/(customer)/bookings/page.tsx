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

export default async function BookingsPage() {
  const session = await requireCustomer()
  const userId = (session.user as any).id

  const bookings = await prisma.booking.findMany({
    where: { customerId: userId },
    include: {
      team: { include: { company: true } },
      services: { include: { service: true } },
      availability: true,
      review: { select: { id: true, rating: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        <Link href="/book"><Button>New booking</Button></Link>
      </div>

      {bookings.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-slate-600 font-medium text-lg">No bookings yet</p>
          <p className="text-slate-400 mt-1 mb-6">Your bookings will appear here once you book a clean</p>
          <Link href="/book"><Button size="lg">Book your first clean</Button></Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link key={b.id} href={`/bookings/${b.id}`}>
              <Card padding="sm" className="hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800">{b.team.name}</p>
                      <span className="text-slate-400 text-sm">·</span>
                      <p className="text-sm text-slate-500">{b.team.company.name}</p>
                      <Badge variant={statusBadge(b.status)}>{b.status}</Badge>
                      {b.status === "COMPLETED" && !b.review && (
                        <Badge variant="purple">Leave a review</Badge>
                      )}
                      {b.review && (
                        <span className="text-xs text-amber-600">★ {b.review.rating}/5 reviewed</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      📅 {b.availability.date} · {b.availability.startTime}–{b.availability.endTime}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      {b.services.map((s) => `${s.quantity > 1 ? `${s.quantity}× ` : ""}${s.service.name}`).join(", ")}
                    </p>
                    <p className="text-xs text-slate-400 truncate">📍 {b.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-slate-700">{formatMinutes(b.totalMinutes)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">estimated</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
