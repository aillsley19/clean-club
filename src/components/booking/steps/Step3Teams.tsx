"use client"

import { useState, useEffect } from "react"
import type { TeamWithSlots, AvailabilitySlot } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { StarRating } from "@/components/ui/StarRating"
import { Spinner } from "@/components/ui/Spinner"

interface Props {
  addressLat: number
  addressLng: number
  totalMinutes: number
  selectedAvailabilityId: string | null
  onSelect: (team: TeamWithSlots, slot: AvailabilitySlot) => void
  onNext: () => void
  onBack: () => void
}

export function Step3Teams({ addressLat, addressLng, totalMinutes, selectedAvailabilityId, onSelect, onNext, onBack }: Props) {
  const [teams, setTeams] = useState<TeamWithSlots[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)

  useEffect(() => {
    const url = `/api/availability?lat=${addressLat}&lng=${addressLng}&totalMinutes=${totalMinutes}`
    setLoading(true)
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setTeams(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [addressLat, addressLng, totalMinutes])

  function groupSlotsByDate(slots: AvailabilitySlot[]) {
    const groups: Record<string, AvailabilitySlot[]> = {}
    for (const slot of slots) {
      if (!groups[slot.date]) groups[slot.date] = []
      groups[slot.date].push(slot)
    }
    return groups
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00")
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Choose a team & time slot</h2>
        <p className="text-slate-500 text-sm mt-1">Teams available in your area with open slots</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <Spinner />
          <span className="text-slate-500">Finding available teams...</span>
        </div>
      ) : teams.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-slate-700">No teams available right now</p>
          <p className="text-slate-400 text-sm mt-1">Try a different address or check back later</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => {
            const slotsByDate = groupSlotsByDate(team.availableSlots)
            const isExpanded = expandedTeam === team.id

            return (
              <Card key={team.id} padding="none" className={`overflow-hidden ${isExpanded ? "border-blue-300" : ""}`}>
                <button
                  className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-800">{team.name}</p>
                        <span className="text-xs text-slate-400">·</span>
                        <p className="text-sm text-slate-500">{team.company.name}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {team.avgRating !== null && (
                          <div className="flex items-center gap-1">
                            <StarRating value={Math.round(team.avgRating)} size="sm" />
                            <span className="text-xs text-slate-500">({team.reviewCount})</span>
                          </div>
                        )}
                        <span className="text-xs text-slate-400">
                          👥 {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-slate-400">
                          📅 {team.availableSlots.length} slot{team.availableSlots.length !== 1 ? "s" : ""} available
                        </span>
                        <span className="text-xs text-slate-400">
                          🗺 Covers {team.areaRadiusKm}km radius
                        </span>
                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          £{team.hourlyRate.toFixed(2)}/hr
                        </span>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform shrink-0 mt-0.5 ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
                    {Object.entries(slotsByDate).map(([date, slots]) => (
                      <div key={date}>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{formatDate(date)}</p>
                        <div className="flex flex-wrap gap-2">
                          {slots.map((slot) => {
                            const isSelected = selectedAvailabilityId === slot.id
                            return (
                              <button
                                key={slot.id}
                                onClick={() => onSelect(team, slot)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                  isSelected
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                                }`}
                              >
                                {slot.startTime} – {slot.endTime}
                                {isSelected && " ✓"}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={!selectedAvailabilityId}>
          Confirm selection →
        </Button>
      </div>
    </div>
  )
}
