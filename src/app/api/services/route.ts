import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] })
  return NextResponse.json(services)
}
