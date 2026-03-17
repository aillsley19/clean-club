import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(_: Request, { params }: { params: { teamId: string; memberId: string } }) {
  const { teamId, memberId } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { company: true } })
  if (!team || team.company.managerId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.teamMember.delete({ where: { id: memberId } })
  return NextResponse.json({ ok: true })
}
