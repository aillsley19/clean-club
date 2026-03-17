import { requireManager } from "@/lib/auth-utils"
import { ManagerSidebar } from "@/components/layout/ManagerSidebar"

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireManager()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <ManagerSidebar userName={(session.user as any).name || ""} />
      <main className="flex-1 p-6 md:p-8 max-w-5xl">{children}</main>
    </div>
  )
}
