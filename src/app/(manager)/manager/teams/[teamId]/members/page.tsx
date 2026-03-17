import { requireManager } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { MemberManager } from "@/components/manager/MemberManager"

export default async function MembersPage({ params }: { params: { teamId: string } }) {
  const session = await requireManager()
  const { teamId } = await params
  const userId = (session.user as any).id

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { company: true, members: { orderBy: { createdAt: "asc" } } },
  })

  if (!team || team.company.managerId !== userId) notFound()

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/manager/teams/${teamId}`} className="text-slate-400 hover:text-slate-600">← {team.name}</Link>
        <h1 className="text-2xl font-bold text-slate-900">Members</h1>
      </div>
      <MemberManager teamId={teamId} initialMembers={team.members} />
    </div>
  )
}
