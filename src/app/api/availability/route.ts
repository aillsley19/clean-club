import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isWithinRadius } from "@/lib/geo"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get("lat") || "")
  const lng = parseFloat(searchParams.get("lng") || "")
  const totalMinutes = parseInt(searchParams.get("totalMinutes") || "0")
  const date = searchParams.get("date") // optional: "YYYY-MM-DD"

  const today = new Date().toISOString().split("T")[0]

  const teams = await prisma.team.findMany({
    include: {
      company: { select: { name: true } },
      members: { select: { id: true, name: true } },
      reviews: { select: { rating: true } },
      availability: {
        where: {
          isBooked: false,
          date: date ? { equals: date } : { gte: today },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      },
    },
  })

  // Filter teams by area if coordinates provided
  const filtered = (!isNaN(lat) && !isNaN(lng))
    ? teams.filter((t) => isWithinRadius(lat, lng, t.areaLat, t.areaLng, t.areaRadiusKm))
    : teams

  // Build result with availability + ratings
  const result = filtered
    .map((team) => {
      const avgRating = team.reviews.length
        ? team.reviews.reduce((s, r) => s + r.rating, 0) / team.reviews.length
        : null

      return {
        id: team.id,
        name: team.name,
        postcode: team.postcode,
        areaLat: team.areaLat,
        areaLng: team.areaLng,
        areaRadiusKm: team.areaRadiusKm,
        hourlyRate: team.hourlyRate,
        company: team.company,
        members: team.members,
        availableSlots: team.availability,
        avgRating,
        reviewCount: team.reviews.length,
      }
    })
    .filter((t) => t.availableSlots.length > 0) // only show teams with open slots

  return NextResponse.json(result)
}
