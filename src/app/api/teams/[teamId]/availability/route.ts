import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAvailabilitySchema } from "@/lib/validations"

async function verifyOwnership(teamId: string, userId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { company: true } })
  return team && team.company.managerId === userId ? team : null
}

export async function GET(req: Request, { params }: { params: { teamId: string } }) {
  const { teamId } = await params
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const where: any = { teamId }
  if (from) where.date = { gte: from }
  if (to) where.date = { ...where.date, lte: to }

  const slots = await prisma.teamAvailability.findMany({
    where,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  })
  return NextResponse.json(slots)
}

export async function POST(req: Request, { params }: { params: { teamId: string } }) {
  const { teamId } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const team = await verifyOwnership(teamId, (session.user as any).id)
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const body = await req.json()
    const data = createAvailabilitySchema.parse(body)

    if (data.startTime >= data.endTime) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 })
    }

    const slot = await prisma.teamAvailability.create({ data: { teamId, ...data } })
    return NextResponse.json(slot, { status: 201 })
  } catch (err: any) {
    if (err?.name === "ZodError") return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
