import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"
import path from "path"

const dbUrl = process.env["DATABASE_URL"] || "file:./prisma/dev.db"
const filePath = dbUrl.replace("file:", "")
const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
const adapter = new PrismaBetterSqlite3({ url: `file:${absolutePath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // Services
  const services = await Promise.all([
    prisma.service.upsert({ where: { id: "svc-bathroom" }, update: {}, create: { id: "svc-bathroom", name: "Bathroom", estimatedMinutes: 20, category: "Rooms" } }),
    prisma.service.upsert({ where: { id: "svc-kitchen" }, update: {}, create: { id: "svc-kitchen", name: "Kitchen", estimatedMinutes: 30, category: "Rooms" } }),
    prisma.service.upsert({ where: { id: "svc-living" }, update: {}, create: { id: "svc-living", name: "Living Room", estimatedMinutes: 25, category: "Rooms" } }),
    prisma.service.upsert({ where: { id: "svc-bedroom" }, update: {}, create: { id: "svc-bedroom", name: "Bedroom", estimatedMinutes: 20, category: "Rooms" } }),
    prisma.service.upsert({ where: { id: "svc-dusting" }, update: {}, create: { id: "svc-dusting", name: "Dusting", estimatedMinutes: 15, category: "Add-ons" } }),
    prisma.service.upsert({ where: { id: "svc-vacuum" }, update: {}, create: { id: "svc-vacuum", name: "Vacuuming", estimatedMinutes: 20, category: "Add-ons" } }),
    prisma.service.upsert({ where: { id: "svc-windows" }, update: {}, create: { id: "svc-windows", name: "Windows", estimatedMinutes: 15, category: "Add-ons" } }),
    prisma.service.upsert({ where: { id: "svc-oven" }, update: {}, create: { id: "svc-oven", name: "Oven Cleaning", estimatedMinutes: 45, category: "Add-ons" } }),
  ])
  console.log(`Created ${services.length} services`)

  // Users
  const hash = await bcrypt.hash("password123", 10)

  const manager = await prisma.user.upsert({
    where: { email: "manager@sparkle.com" },
    update: {},
    create: { id: "user-manager", name: "Sarah Manager", email: "manager@sparkle.com", passwordHash: hash, role: "COMPANY_MANAGER" },
  })

  const alice = await prisma.user.upsert({
    where: { email: "alice@email.com" },
    update: {},
    create: { id: "user-alice", name: "Alice Johnson", email: "alice@email.com", passwordHash: hash, role: "CUSTOMER" },
  })

  const bob = await prisma.user.upsert({
    where: { email: "bob@email.com" },
    update: {},
    create: { id: "user-bob", name: "Bob Smith", email: "bob@email.com", passwordHash: hash, role: "CUSTOMER" },
  })

  const carol = await prisma.user.upsert({
    where: { email: "carol@email.com" },
    update: {},
    create: { id: "user-carol", name: "Carol Davis", email: "carol@email.com", passwordHash: hash, role: "CUSTOMER" },
  })
  console.log("Created users")

  // Company
  const company = await prisma.company.upsert({
    where: { managerId: manager.id },
    update: {},
    create: {
      id: "company-sparkle",
      name: "Sparkle Clean Co.",
      description: "Professional cleaning services across London",
      managerId: manager.id,
    },
  })
  console.log("Created company")

  // Teams
  const teamAlpha = await prisma.team.upsert({
    where: { id: "team-alpha" },
    update: { hourlyRate: 20.0, postcode: "W1U 3BN" },
    create: { id: "team-alpha", companyId: company.id, name: "Team Alpha", postcode: "W1U 3BN", areaLat: 51.5074, areaLng: -0.1278, areaRadiusKm: 5, hourlyRate: 20.0 },
  })

  const teamBeta = await prisma.team.upsert({
    where: { id: "team-beta" },
    update: { hourlyRate: 18.0, postcode: "E1 1LP" },
    create: { id: "team-beta", companyId: company.id, name: "Team Beta", postcode: "E1 1LP", areaLat: 51.5155, areaLng: -0.0702, areaRadiusKm: 7, hourlyRate: 18.0 },
  })

  const teamGamma = await prisma.team.upsert({
    where: { id: "team-gamma" },
    update: { hourlyRate: 22.0, postcode: "N19 5NQ" },
    create: { id: "team-gamma", companyId: company.id, name: "Team Gamma", postcode: "N19 5NQ", areaLat: 51.56, areaLng: -0.12, areaRadiusKm: 6, hourlyRate: 22.0 },
  })
  console.log("Created teams")

  // Team members
  const members = [
    { id: "member-1", teamId: teamAlpha.id, name: "Alice Smith", email: "asmith@sparkle.com" },
    { id: "member-2", teamId: teamAlpha.id, name: "Bob Jones", email: "bjones@sparkle.com" },
    { id: "member-3", teamId: teamAlpha.id, name: "Carlos Diaz", email: "cdiaz@sparkle.com" },
    { id: "member-4", teamId: teamBeta.id, name: "Diana Lee", email: "dlee@sparkle.com" },
    { id: "member-5", teamId: teamBeta.id, name: "Edward Park", email: "epark@sparkle.com" },
    { id: "member-6", teamId: teamGamma.id, name: "Fiona Green", email: "fgreen@sparkle.com" },
    { id: "member-7", teamId: teamGamma.id, name: "George Hall", email: "ghall@sparkle.com" },
  ]
  for (const m of members) {
    await prisma.teamMember.upsert({ where: { id: m.id }, update: {}, create: m })
  }
  console.log("Created team members")

  // Availability windows (next 7 days)
  const today = new Date()
  const slots = []
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split("T")[0]

    if (i <= 3) {
      slots.push({ id: `slot-alpha-${i}a`, teamId: teamAlpha.id, date: dateStr, startTime: "09:00", endTime: "13:00", isBooked: i === 1 })
      slots.push({ id: `slot-alpha-${i}b`, teamId: teamAlpha.id, date: dateStr, startTime: "14:00", endTime: "18:00", isBooked: false })
    }
    if (i <= 3) {
      slots.push({ id: `slot-beta-${i}a`, teamId: teamBeta.id, date: dateStr, startTime: "09:00", endTime: "17:00", isBooked: i === 2 })
    }
    if (i <= 4) {
      slots.push({ id: `slot-gamma-${i}a`, teamId: teamGamma.id, date: dateStr, startTime: "10:00", endTime: "16:00", isBooked: i === 3 })
    }
  }

  for (const s of slots) {
    await prisma.teamAvailability.upsert({ where: { id: s.id }, update: {}, create: s })
  }
  console.log(`Created ${slots.length} availability slots`)

  // Bookings
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]

  const dayAfter = new Date(today)
  dayAfter.setDate(today.getDate() + 2)
  const dayAfterStr = dayAfter.toISOString().split("T")[0]

  const dayThree = new Date(today)
  dayThree.setDate(today.getDate() + 3)
  const dayThreeStr = dayThree.toISOString().split("T")[0]

  // Alice's completed booking (slot-alpha-1a is booked)
  const aliceBooking = await prisma.booking.upsert({
    where: { id: "booking-alice" },
    update: {},
    create: {
      id: "booking-alice",
      customerId: alice.id,
      teamId: teamAlpha.id,
      availabilityId: "slot-alpha-1a",
      address: "12 Baker Street, London W1U 3BN",
      status: "COMPLETED",
      totalMinutes: 65,
    },
  })

  await prisma.bookingService.upsert({
    where: { bookingId_serviceId: { bookingId: aliceBooking.id, serviceId: "svc-bathroom" } },
    update: {},
    create: { bookingId: aliceBooking.id, serviceId: "svc-bathroom", quantity: 2 },
  })
  await prisma.bookingService.upsert({
    where: { bookingId_serviceId: { bookingId: aliceBooking.id, serviceId: "svc-kitchen" } },
    update: {},
    create: { bookingId: aliceBooking.id, serviceId: "svc-kitchen", quantity: 1 },
  })

  // Bob's confirmed booking (slot-beta-2a is booked)
  const bobBooking = await prisma.booking.upsert({
    where: { id: "booking-bob" },
    update: {},
    create: {
      id: "booking-bob",
      customerId: bob.id,
      teamId: teamBeta.id,
      availabilityId: "slot-beta-2a",
      address: "45 Commercial Road, London E1 1LP",
      status: "CONFIRMED",
      totalMinutes: 80,
    },
  })

  await prisma.bookingService.upsert({
    where: { bookingId_serviceId: { bookingId: bobBooking.id, serviceId: "svc-living" } },
    update: {},
    create: { bookingId: bobBooking.id, serviceId: "svc-living", quantity: 1 },
  })
  await prisma.bookingService.upsert({
    where: { bookingId_serviceId: { bookingId: bobBooking.id, serviceId: "svc-bedroom" } },
    update: {},
    create: { bookingId: bobBooking.id, serviceId: "svc-bedroom", quantity: 2 },
  })
  await prisma.bookingService.upsert({
    where: { bookingId_serviceId: { bookingId: bobBooking.id, serviceId: "svc-dusting" } },
    update: {},
    create: { bookingId: bobBooking.id, serviceId: "svc-dusting", quantity: 1 },
  })

  // Carol's pending booking (slot-gamma-3a is booked)
  const carolBooking = await prisma.booking.upsert({
    where: { id: "booking-carol" },
    update: {},
    create: {
      id: "booking-carol",
      customerId: carol.id,
      teamId: teamGamma.id,
      availabilityId: "slot-gamma-3a",
      address: "78 Highgate Road, London N19 5NQ",
      status: "PENDING",
      totalMinutes: 45,
    },
  })

  await prisma.bookingService.upsert({
    where: { bookingId_serviceId: { bookingId: carolBooking.id, serviceId: "svc-oven" } },
    update: {},
    create: { bookingId: carolBooking.id, serviceId: "svc-oven", quantity: 1 },
  })
  console.log("Created bookings")

  // Review for Alice's completed booking
  await prisma.review.upsert({
    where: { bookingId: aliceBooking.id },
    update: {},
    create: {
      bookingId: aliceBooking.id,
      customerId: alice.id,
      teamId: teamAlpha.id,
      rating: 5,
      comment: "Fantastic job! The team was punctual, thorough, and incredibly professional. Would highly recommend!",
    },
  })
  console.log("Created review")

  console.log("\n✅ Database seeded successfully!")
  console.log("\nTest accounts:")
  console.log("  Manager:  manager@sparkle.com / password123")
  console.log("  Customer: alice@email.com / password123")
  console.log("  Customer: bob@email.com / password123")
  console.log("  Customer: carol@email.com / password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
