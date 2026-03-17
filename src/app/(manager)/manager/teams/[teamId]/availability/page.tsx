import { requireManager } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { AvailabilityManager } from "@/components/manager/AvailabilityManager"

export default async function AvailabilityPage({ params }: { params: { teamId: string } }) {
  const session = await requireManager()
  const { teamId } = await params
  const userId = (session.user as any).id

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      company: true,
      availability: {
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      },
    },
  })

  if (!team || team.company.managerId !== userId) notFound()

  const today = new Date().toISOString().split("T")[0]
  const upcoming = team.availability.filter((s) => s.date >= today)

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/manager/teams/${teamId}`} className="text-slate-400 hover:text-slate-600">← {team.name}</Link>
        <h1 className="text-2xl font-bold text-slate-900">Availability</h1>
      </div>
      <AvailabilityManager teamId={teamId} initialSlots={upcoming} />
    </div>
  )
}
