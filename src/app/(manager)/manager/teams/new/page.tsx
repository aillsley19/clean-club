import { requireManager } from "@/lib/auth-utils"
import Link from "next/link"
import { TeamForm } from "@/components/manager/TeamForm"

export default async function NewTeamPage() {
  await requireManager()

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/manager/teams" className="text-slate-400 hover:text-slate-600">← Back</Link>
        <h1 className="text-2xl font-bold text-slate-900">Create Team</h1>
      </div>
      <TeamForm />
    </div>
  )
}
