import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createMemberSchema } from "@/lib/validations"

async function verifyOwnership(teamId: string, userId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { company: true } })
  return team && team.company.managerId === userId ? team : null
}

export async function GET(_: Request, { params }: { params: { teamId: string } }) {
  const { teamId } = await params
  const members = await prisma.teamMember.findMany({ where: { teamId }, orderBy: { createdAt: "asc" } })
  return NextResponse.json(members)
}

export async function POST(req: Request, { params }: { params: { teamId: string } }) {
  const { teamId } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const team = await verifyOwnership(teamId, (session.user as any).id)
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const body = await req.json()
    const data = createMemberSchema.parse(body)
    const member = await prisma.teamMember.create({ data: { teamId, ...data } })
    return NextResponse.json(member, { status: 201 })
  } catch (err: any) {
    if (err?.name === "ZodError") return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
