import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createBookingSchema } from "@/lib/validations"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as any).id
  const role = (session.user as any).role

  if (role === "COMPANY_MANAGER") {
    const company = await prisma.company.findUnique({ where: { managerId: userId } })
    if (!company) return NextResponse.json([])

    const bookings = await prisma.booking.findMany({
      where: { team: { companyId: company.id } },
      include: {
        customer: { select: { name: true, email: true } },
        team: { select: { name: true } },
        services: { include: { service: true } },
        review: true,
        availability: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(bookings)
  }

  // Customer
  const bookings = await prisma.booking.findMany({
    where: { customerId: userId },
    include: {
      team: { select: { name: true }, include: { company: { select: { name: true } } } as any },
      services: { include: { service: true } },
      review: { select: { id: true, rating: true } },
      availability: true,
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(bookings)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any).id

  try {
    const body = await req.json()
    const data = createBookingSchema.parse(body)

    const booking = await prisma.$transaction(async (tx) => {
      const slot = await tx.teamAvailability.findUnique({ where: { id: data.availabilityId } })
      if (!slot || slot.isBooked) throw new Error("Slot unavailable")
      if (slot.teamId !== data.teamId) throw new Error("Slot does not belong to team")

      await tx.teamAvailability.update({
        where: { id: data.availabilityId },
        data: { isBooked: true },
      })

      const booking = await tx.booking.create({
        data: {
          customerId: userId,
          teamId: data.teamId,
          availabilityId: data.availabilityId,
          address: data.address,
          totalMinutes: data.totalMinutes,
          notes: data.notes,
        },
      })

      await tx.bookingService.createMany({
        data: data.services.map((s) => ({
          bookingId: booking.id,
          serviceId: s.serviceId,
          quantity: s.quantity,
        })),
      })

      return booking
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (err: any) {
    if (err?.message === "Slot unavailable") {
      return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 })
    }
    if (err?.name === "ZodError") return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
