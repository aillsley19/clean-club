import { requireManager } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Badge, statusBadge } from "@/components/ui/Badge"
import { BookingStatusUpdater } from "@/components/manager/BookingStatusUpdater"

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`
}

export default async function ManagerBookingsPage() {
  const session = await requireManager()
  const userId = (session.user as any).id

  const company = await prisma.company.findUnique({ where: { managerId: userId } })

  if (!company) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Bookings</h1>
        <Card className="text-center py-12 text-slate-400">Set up your company first</Card>
      </div>
    )
  }

  const bookings = await prisma.booking.findMany({
    where: { team: { companyId: company.id } },
    include: {
      team: { select: { name: true } },
      customer: { select: { name: true, email: true } },
      services: { include: { service: true } },
      availability: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const pending = bookings.filter((b) => b.status === "PENDING")
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED")
  const completed = bookings.filter((b) => b.status === "COMPLETED")
  const cancelled = bookings.filter((b) => b.status === "CANCELLED")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 flex-wrap">
        <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">{pending.length} Pending</span>
        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{confirmed.length} Confirmed</span>
        <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">{completed.length} Completed</span>
        <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">{cancelled.length} Cancelled</span>
      </div>

      {bookings.length === 0 ? (
        <Card className="text-center py-16 text-slate-400">No bookings yet</Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} padding="sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-slate-800">{b.customer.name}</p>
                    <span className="text-slate-300">·</span>
                    <p className="text-sm text-slate-500">{b.team.name}</p>
                    <Badge variant={statusBadge(b.status)}>{b.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    📅 {b.availability.date} · {b.availability.startTime}–{b.availability.endTime}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ⏱ {formatMinutes(b.totalMinutes)} · {b.services.map((s) => `${s.quantity > 1 ? `${s.quantity}× ` : ""}${s.service.name}`).join(", ")}
                  </p>
                  <p className="text-xs text-slate-400">📍 {b.address}</p>
                </div>
                <BookingStatusUpdater bookingId={b.id} currentStatus={b.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
