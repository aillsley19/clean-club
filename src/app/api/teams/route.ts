import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createTeamSchema } from "@/lib/validations"
import { isWithinRadius } from "@/lib/geo"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get("lat") || "")
  const lng = parseFloat(searchParams.get("lng") || "")

  const teams = await prisma.team.findMany({
    include: {
      company: { select: { name: true } },
      members: { select: { id: true, name: true } },
      reviews: { select: { rating: true } },
    },
  })

  if (!isNaN(lat) && !isNaN(lng)) {
    const filtered = teams.filter((t) => isWithinRadius(lat, lng, t.areaLat, t.areaLng, t.areaRadiusKm))
    return NextResponse.json(filtered)
  }

  return NextResponse.json(teams)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "COMPANY_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = (session.user as any).id

  const company = await prisma.company.findUnique({ where: { managerId: userId } })
  if (!company) return NextResponse.json({ error: "Create a company first" }, { status: 400 })

  try {
    const body = await req.json()
    const data = createTeamSchema.parse(body)
    const team = await prisma.team.create({
      data: { ...data, companyId: company.id },
    })
    return NextResponse.json(team, { status: 201 })
  } catch (err: any) {
    if (err?.name === "ZodError") return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
