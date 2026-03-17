import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_: Request, { params }: { params: { bookingId: string } }) {
  const { bookingId } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { select: { name: true, email: true } },
      team: {
        include: {
          company: { select: { name: true } },
          members: true,
        },
      },
      services: { include: { service: true } },
      availability: true,
      review: { include: { customer: { select: { name: true } } } },
    },
  })

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const userId = (session.user as any).id
  const role = (session.user as any).role

  // Only the customer or the company manager can see this booking
  if (role === "CUSTOMER" && booking.customerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(booking)
}

export async function PUT(req: Request, { params }: { params: { bookingId: string } }) {
  const { bookingId } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as any).id
  const role = (session.user as any).role

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { status } = await req.json()

  // Customers can only cancel their own PENDING bookings
  if (role === "CUSTOMER") {
    if (booking.customerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (status !== "CANCELLED" || booking.status !== "PENDING") {
      return NextResponse.json({ error: "Customers can only cancel pending bookings" }, { status: 400 })
    }
  }

  // Managers can confirm or complete bookings for their teams
  if (role === "COMPANY_MANAGER") {
    const team = await prisma.team.findUnique({ where: { id: booking.teamId }, include: { company: true } })
    if (!team || team.company.managerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (!["CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
  }

  const updated = await prisma.booking.update({ where: { id: bookingId }, data: { status } })

  // If cancelled, free the slot
  if (status === "CANCELLED") {
    await prisma.teamAvailability.update({
      where: { id: booking.availabilityId },
      data: { isBooked: false },
    })
  }

  return NextResponse.json(updated)
}
