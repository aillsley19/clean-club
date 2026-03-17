"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

interface Slot {
  id: string
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
}

interface Props {
  teamId: string
  initialSlots: Slot[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
}

export function AvailabilityManager({ teamId, initialSlots }: Props) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const today = new Date().toISOString().split("T")[0]

  async function handleAdd() {
    if (!date || !startTime || !endTime) return
    setAdding(true)
    setError("")

    const res = await fetch(`/api/teams/${teamId}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, startTime, endTime }),
    })

    setAdding(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Failed to add slot")
      return
    }

    const slot = await res.json()
    setSlots((prev) => [...prev, slot].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)))
    setDate("")
  }

  async function handleDelete(slotId: string) {
    setDeletingId(slotId)
    const res = await fetch(`/api/teams/${teamId}/availability/${slotId}`, { method: "DELETE" })
    if (res.ok) {
      setSlots((prev) => prev.filter((s) => s.id !== slotId))
    }
    setDeletingId(null)
  }

  // Group slots by date
  const grouped: Record<string, Slot[]> = {}
  for (const slot of slots) {
    if (!grouped[slot.date]) grouped[slot.date] = []
    grouped[slot.date].push(slot)
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <Card>
        <h2 className="font-semibold text-slate-800 mb-4">Add Availability Window</h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm mb-3">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              label="End time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <Button onClick={handleAdd} loading={adding} disabled={!date}>
            Add slot
          </Button>
        </div>
      </Card>

      {/* Existing slots */}
      <Card>
        <h2 className="font-semibold text-slate-800 mb-4">
          Upcoming Slots ({slots.length})
        </h2>
        {slots.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No upcoming availability. Add a slot above.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([dateKey, daySlots]) => (
              <div key={dateKey}>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">{formatDate(dateKey)}</p>
                <div className="space-y-2">
                  {daySlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        {slot.isBooked ? (
                          <Badge variant="info">Booked</Badge>
                        ) : (
                          <Badge variant="success">Available</Badge>
                        )}
                      </div>
                      {!slot.isBooked && (
                        <button
                          onClick={() => handleDelete(slot.id)}
                          disabled={deletingId === slot.id}
                          className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
                        >
                          {deletingId === slot.id ? "Removing..." : "Remove"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
