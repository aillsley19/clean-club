import { requireManager } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { BookingCalendar } from "@/components/manager/BookingCalendar"

export default async function CalendarPage({ params }: { params: { teamId: string } }) {
  const session = await requireManager()
  const { teamId } = await params
  const userId = (session.user as any).id

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { company: true },
  })

  if (!team || team.company.managerId !== userId) notFound()

  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString().split("T")[0]

  const [slots, bookings] = await Promise.all([
    prisma.teamAvailability.findMany({
      where: { teamId, date: { gte: startOfMonth, lte: endOfMonth } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.booking.findMany({
      where: {
        teamId,
        availability: { date: { gte: startOfMonth, lte: endOfMonth } },
      },
      include: {
        customer: { select: { name: true } },
        services: { include: { service: { select: { name: true } } } },
        availability: true,
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/manager/teams/${teamId}`} className="text-slate-400 hover:text-slate-600">← {team.name}</Link>
        <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
      </div>
      <BookingCalendar slots={slots} bookings={bookings} />
    </div>
  )
}
