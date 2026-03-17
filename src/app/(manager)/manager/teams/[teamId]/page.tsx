import { requireManager } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { TeamForm } from "@/components/manager/TeamForm"

export default async function EditTeamPage({ params }: { params: { teamId: string } }) {
  const session = await requireManager()
  const { teamId } = await params
  const userId = (session.user as any).id

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { company: true },
  })

  if (!team || team.company.managerId !== userId) notFound()

  const subpages = [
    { href: `/manager/teams/${teamId}/members`, label: "👥 Members" },
    { href: `/manager/teams/${teamId}/availability`, label: "📅 Availability" },
    { href: `/manager/teams/${teamId}/calendar`, label: "🗓 Calendar" },
  ]

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/manager/teams" className="text-slate-400 hover:text-slate-600">← Teams</Link>
        <h1 className="text-2xl font-bold text-slate-900">{team.name}</h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {subpages.map((p) => (
          <Link key={p.href} href={p.href} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
            {p.label}
          </Link>
        ))}
      </div>

      <TeamForm
        initialData={{
          name: team.name,
          areaLat: team.areaLat,
          areaLng: team.areaLng,
          areaRadiusKm: team.areaRadiusKm,
        }}
        teamId={teamId}
      />
    </div>
  )
}
