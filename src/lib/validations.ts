import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["CUSTOMER", "COMPANY_MANAGER"]),
})

export const createCompanySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
})

export const createTeamSchema = z.object({
  name: z.string().min(2),
  postcode: z.string().optional(),
  areaLat: z.number().min(-90).max(90),
  areaLng: z.number().min(-180).max(180),
  areaRadiusKm: z.number().min(0.5).max(100),
  hourlyRate: z.number().min(1).max(500).optional(),
})

export const createMemberSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export const createAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
})

export const createBookingSchema = z.object({
  teamId: z.string(),
  availabilityId: z.string(),
  address: z.string().min(5),
  totalMinutes: z.number().min(1),
  notes: z.string().optional(),
  services: z.array(z.object({ serviceId: z.string(), quantity: z.number().min(1) })).min(1),
})

export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})
