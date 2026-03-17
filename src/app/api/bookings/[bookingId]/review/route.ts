import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createReviewSchema } from "@/lib/validations"

export async function POST(req: Request, { params }: { params: { bookingId: string } }) {
  const { bookingId } = await params
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any).id

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  })

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (booking.customerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (booking.status !== "COMPLETED") return NextResponse.json({ error: "Booking not completed" }, { status: 400 })
  if (booking.review) return NextResponse.json({ error: "Review already submitted" }, { status: 400 })

  try {
    const body = await req.json()
    const data = createReviewSchema.parse(body)

    const review = await prisma.review.create({
      data: {
        bookingId,
        customerId: userId,
        teamId: booking.teamId,
        rating: data.rating,
        comment: data.comment,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (err: any) {
    if (err?.name === "ZodError") return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
