import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "./auth"

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}

export async function requireRole(role: string) {
  const session = await requireAuth()
  if ((session.user as any).role !== role) {
    redirect((session.user as any).role === "COMPANY_MANAGER" ? "/manager/dashboard" : "/dashboard")
  }
  return session
}

export async function requireCustomer() {
  return requireRole("CUSTOMER")
}

export async function requireManager() {
  return requireRole("COMPANY_MANAGER")
}
