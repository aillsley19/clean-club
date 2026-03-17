import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_: Request, { params }: { params: { teamId: string } }) {
  const { teamId } = await params
  const reviews = await prisma.review.findMany({
    where: { teamId },
    include: { customer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null

  return NextResponse.json({ reviews, avgRating, count: reviews.length })
}
