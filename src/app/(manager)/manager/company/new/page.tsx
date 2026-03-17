import { requireManager } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CompanySetupForm } from "@/components/manager/CompanySetupForm"

export default async function CompanySetupPage() {
  const session = await requireManager()
  const userId = (session.user as any).id

  const existing = await prisma.company.findUnique({ where: { managerId: userId } })
  if (existing) redirect("/manager/dashboard")

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Set Up Your Company</h1>
        <p className="text-slate-500 mt-1">Create your company profile to start managing teams and bookings</p>
      </div>
      <CompanySetupForm />
    </div>
  )
}
