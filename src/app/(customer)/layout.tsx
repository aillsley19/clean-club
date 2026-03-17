import { requireCustomer } from "@/lib/auth-utils"
import Link from "next/link"
import { CustomerNav } from "@/components/layout/CustomerNav"

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCustomer()

  return (
    <div className="min-h-screen bg-slate-50">
      <CustomerNav userName={(session.user as any).name || session.user?.email || ""} />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
