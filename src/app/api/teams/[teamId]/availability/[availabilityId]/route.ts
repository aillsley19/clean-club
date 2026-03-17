import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(_: Request, { params }: { params: { teamId: string; availabilityId: string } }) {
  const { teamId, availabilityId } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const slot = await prisma.teamAvailability.findUnique({ where: { id: availabilityId } })
  if (!slot || slot.teamId !== teamId) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (slot.isBooked) return NextResponse.json({ error: "Cannot delete a booked slot" }, { status: 400 })

  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { company: true } })
  if (!team || team.company.managerId !== (session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  await prisma.teamAvailability.delete({ where: { id: availabilityId } })
  return NextResponse.json({ ok: true })
}
