import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createTeamSchema } from "@/lib/validations"

async function verifyOwnership(teamId: string, userId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { company: true },
  })
  if (!team || team.company.managerId !== userId) return null
  return team
}

export async function GET(_: Request, { params }: { params: { teamId: string } }) {
  const { teamId } = await params
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      company: { select: { name: true } },
      members: true,
      reviews: { include: { customer: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      _count: { select: { bookings: true } },
    },
  })
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const avgRating = team.reviews.length
    ? team.reviews.reduce((s, r) => s + r.rating, 0) / team.reviews.length
    : null

  return NextResponse.json({ ...team, avgRating })
}

export async function PUT(req: Request, { params }: { params: { teamId: string } }) {
  const { teamId } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as any).id
  const team = await verifyOwnership(teamId, userId)
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const body = await req.json()
    const data = createTeamSchema.parse(body)
    const updated = await prisma.team.update({ where: { id: teamId }, data })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === "ZodError") return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { teamId: string } }) {
  const { teamId } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as any).id
  const team = await verifyOwnership(teamId, userId)
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.team.delete({ where: { id: teamId } })
  return NextResponse.json({ ok: true })
}
