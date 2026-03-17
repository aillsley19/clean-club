import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCompanySchema } from "@/lib/validations"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as any).id
  const company = await prisma.company.findUnique({
    where: { managerId: userId },
    include: { teams: { include: { members: true, _count: { select: { bookings: true } } } } },
  })
  return NextResponse.json(company)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "COMPANY_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = (session.user as any).id

  const existing = await prisma.company.findUnique({ where: { managerId: userId } })
  if (existing) return NextResponse.json({ error: "Company already exists" }, { status: 400 })

  try {
    const body = await req.json()
    const data = createCompanySchema.parse(body)
    const company = await prisma.company.create({
      data: { name: data.name, description: data.description, managerId: userId },
    })
    return NextResponse.json(company, { status: 201 })
  } catch (err: any) {
    if (err?.name === "ZodError") return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
