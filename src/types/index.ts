export type Role = "CUSTOMER" | "COMPANY_MANAGER"
export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

export interface ServiceItem {
  id: string
  name: string
  estimatedMinutes: number
  category: string
}

export interface WizardService {
  serviceId: string
  quantity: number
}

export interface WizardState {
  step: 1 | 2 | 3 | 4
  selectedServices: WizardService[]
  totalMinutes: number
  roomNotes: string
  isRoutine: boolean
  routineFrequency: "weekly" | "fortnightly" | "monthly" | null
  address: string
  addressLat: number | null
  addressLng: number | null
  selectedTeamId: string | null
  selectedAvailabilityId: string | null
  selectedSlot: AvailabilitySlot | null
  selectedTeam: TeamWithSlots | null
}

export interface AvailabilitySlot {
  id: string
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
}

export interface TeamWithSlots {
  id: string
  name: string
  postcode: string | null
  areaLat: number
  areaLng: number
  areaRadiusKm: number
  hourlyRate: number
  company: { name: string }
  members: { id: string; name: string }[]
  availableSlots: AvailabilitySlot[]
  avgRating: number | null
  reviewCount: number
}
