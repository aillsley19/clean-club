import { requireCustomer } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Badge, statusBadge } from "@/components/ui/Badge"
import { ReviewForm } from "@/components/reviews/ReviewForm"
import { StarRating } from "@/components/ui/StarRating"

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`
}

export default async function BookingDetailPage({ params }: { params: { bookingId: string } }) {
  const session = await requireCustomer()
  const userId = (session.user as any).id
  const { bookingId } = await params

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      team: { include: { company: true, members: true } },
      services: { include: { service: true } },
      availability: true,
      review: true,
    },
  })

  if (!booking || booking.customerId !== userId) notFound()

  const steps = [
    { key: "PENDING", label: "Pending" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "COMPLETED", label: "Completed" },
  ]
  const statusIndex = steps.findIndex((s) => s.key === booking.status)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/bookings" className="text-slate-400 hover:text-slate-600">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Booking Details</h1>
      </div>

      {/* Status */}
      {booking.status !== "CANCELLED" && (
        <Card padding="sm">
          <div className="flex items-center gap-0">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i <= statusIndex ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"
                  }`}>
                    {i < statusIndex ? "✓" : i + 1}
                  </div>
                  <p className={`text-xs mt-1 ${i <= statusIndex ? "text-blue-600 font-medium" : "text-slate-400"}`}>
                    {step.label}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mb-4 ${i < statusIndex ? "bg-blue-600" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {booking.status === "CANCELLED" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          This booking was cancelled.
        </div>
      )}

      {/* Details */}
      <Card>
        <h2 className="font-semibold text-slate-800 mb-4">Booking Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Status</span>
            <Badge variant={statusBadge(booking.status)}>{booking.status}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Date</span>
            <span className="text-sm font-medium">{booking.availability.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Time slot</span>
            <span className="text-sm font-medium">{booking.availability.startTime} – {booking.availability.endTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Address</span>
            <span className="text-sm font-medium text-right max-w-48">{booking.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Total time</span>
            <span className="text-sm font-medium">{formatMinutes(booking.totalMinutes)}</span>
          </div>
          {booking.notes && (
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Notes</span>
              <span className="text-sm font-medium text-right max-w-48">{booking.notes}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Services */}
      <Card>
        <h2 className="font-semibold text-slate-800 mb-4">Services Booked</h2>
        <div className="space-y-2">
          {booking.services.map((s) => (
            <div key={s.id} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-slate-700">{s.service.name}</span>
                {s.quantity > 1 && <span className="text-sm text-slate-400"> × {s.quantity}</span>}
              </div>
              <span className="text-sm text-slate-500">{s.service.estimatedMinutes * s.quantity} min</span>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-100 flex justify-between">
            <span className="text-sm font-semibold text-slate-700">Total estimated time</span>
            <span className="text-sm font-semibold text-blue-600">{formatMinutes(booking.totalMinutes)}</span>
          </div>
        </div>
      </Card>

      {/* Team */}
      <Card>
        <h2 className="font-semibold text-slate-800 mb-4">Cleaning Team</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Team</span>
            <span className="text-sm font-medium">{booking.team.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Company</span>
            <span className="text-sm font-medium">{booking.team.company.name}</span>
          </div>
          {booking.team.members.length > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Members</span>
              <span className="text-sm font-medium text-right">
                {booking.team.members.map((m) => m.name).join(", ")}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Review */}
      {booking.status === "COMPLETED" && (
        <div>
          {booking.review ? (
            <Card>
              <h2 className="font-semibold text-slate-800 mb-3">Your Review</h2>
              <StarRating value={booking.review.rating} />
              {booking.review.comment && (
                <p className="text-slate-600 text-sm mt-2">{booking.review.comment}</p>
              )}
            </Card>
          ) : (
            <ReviewForm bookingId={booking.id} />
          )}
        </div>
      )}
    </div>
  )
}
