"use client"

import { useState } from "react"
import { Badge, statusBadge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"

interface Slot {
  id: string
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
}

interface Booking {
  id: string
  status: string
  availability: { date: string; startTime: string; endTime: string }
  customer: { name: string }
  services: { service: { name: string } }[]
}

interface Props {
  slots: Slot[]
  bookings: Booking[]
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function BookingCalendar({ slots, bookings }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow = firstDay.getDay()

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const slotsByDate: Record<string, Slot[]> = {}
  for (const s of slots) {
    if (!slotsByDate[s.date]) slotsByDate[s.date] = []
    slotsByDate[s.date].push(s)
  }

  const bookingsByDate: Record<string, Booking[]> = {}
  for (const b of bookings) {
    const d = b.availability.date
    if (!bookingsByDate[d]) bookingsByDate[d] = []
    bookingsByDate[d].push(b)
  }

  const selectedDaySlots = selected ? (slotsByDate[selected] || []) : []
  const selectedDayBookings = selected ? (bookingsByDate[selected] || []) : []

  return (
    <div className="space-y-4">
      <Card padding="none">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <button onClick={prevMonth} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-semibold text-slate-800">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 border-b border-r border-slate-50" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const ds = dateStr(day)
            const daySlots = slotsByDate[ds] || []
            const dayBookings = bookingsByDate[ds] || []
            const isToday = ds === today.toISOString().split("T")[0]
            const isSelected = ds === selected

            return (
              <button
                key={day}
                onClick={() => setSelected(isSelected ? null : ds)}
                className={`h-16 border-b border-r border-slate-100 p-1 text-left hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50 border-blue-200" : ""}`}
              >
                <span className={`text-xs font-medium block mb-1 ${isToday ? "text-blue-600 font-bold" : "text-slate-500"}`}>
                  {day}
                </span>
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 1).map((b) => (
                    <div key={b.id} className="w-full h-1.5 rounded-full bg-blue-400" />
                  ))}
                  {daySlots.filter((s) => !s.isBooked).length > 0 && (
                    <div className="w-full h-1.5 rounded-full bg-green-400" />
                  )}
                </div>
                {(dayBookings.length > 0 || daySlots.length > 0) && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {dayBookings.length > 0 && `${dayBookings.length}b`}
                    {daySlots.filter((s) => !s.isBooked).length > 0 && ` ${daySlots.filter((s) => !s.isBooked).length}a`}
                  </p>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 px-4 py-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-3 h-1.5 rounded-full bg-blue-400" /> Bookings
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-3 h-1.5 rounded-full bg-green-400" /> Available
          </div>
        </div>
      </Card>

      {/* Selected day detail */}
      {selected && (selectedDaySlots.length > 0 || selectedDayBookings.length > 0) && (
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">
            {new Date(selected + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </h3>

          {selectedDayBookings.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Bookings</p>
              <div className="space-y-2">
                {selectedDayBookings.map((b) => (
                  <div key={b.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{b.customer.name}</span>
                      <Badge variant={statusBadge(b.status)}>{b.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{b.availability.startTime}–{b.availability.endTime}</p>
                    <p className="text-xs text-slate-400">{b.services.map((s) => s.service.name).join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedDaySlots.filter((s) => !s.isBooked).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Available slots</p>
              <div className="flex flex-wrap gap-2">
                {selectedDaySlots.filter((s) => !s.isBooked).map((s) => (
                  <span key={s.id} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                    {s.startTime} – {s.endTime}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
