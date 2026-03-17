"use client"

import { useState } from "react"
import type { WizardState } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

interface Props {
  state: WizardState
  onSubmit: (notes: string) => void
  onBack: () => void
  submitting: boolean
  submitError: string
}

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`
}

export function Step4Confirm({ state, onSubmit, onBack, submitting, submitError }: Props) {
  const [notes, setNotes] = useState("")

  const { selectedSlot, selectedTeam, address, totalMinutes, isRoutine, routineFrequency, roomNotes } = state

  const hourlyRate = selectedTeam?.hourlyRate ?? 0
  const totalHours = totalMinutes / 60
  const totalPrice = totalHours * hourlyRate

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Confirm your booking</h2>
        <p className="text-slate-500 text-sm mt-1">Review your details before confirming</p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {submitError}
        </div>
      )}

      {/* Team & Slot */}
      <Card>
        <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Cleaning Team</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Team</span>
            <span className="text-sm font-medium">{selectedTeam?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Company</span>
            <span className="text-sm font-medium">{selectedTeam?.company.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Date</span>
            <span className="text-sm font-medium">{selectedSlot?.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Time slot</span>
            <span className="text-sm font-medium">{selectedSlot?.startTime} – {selectedSlot?.endTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Address</span>
            <span className="text-sm font-medium text-right max-w-56">{address}</span>
          </div>
          {isRoutine && routineFrequency && (
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Schedule</span>
              <span className="text-sm font-medium text-green-700 capitalize">Routine — {routineFrequency}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Price breakdown */}
      <Card>
        <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Price</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Estimated time</span>
            <span className="text-sm">{formatMinutes(totalMinutes)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Hourly rate</span>
            <span className="text-sm">£{hourlyRate.toFixed(2)}/hr</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <span className="font-semibold text-slate-800">Total estimated cost</span>
            <span className="text-xl font-bold text-blue-600">
              £{totalPrice.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Final cost may vary if the clean takes longer than estimated.
          </p>
        </div>
      </Card>

      {/* Notes */}
      <Card>
        <h3 className="font-semibold text-slate-700 mb-2 text-sm uppercase tracking-wide">
          Additional instructions <span className="font-normal text-slate-400">(optional)</span>
        </h3>
        {roomNotes && (
          <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-0.5">Notes from room selection:</p>
            <p className="text-sm text-slate-600">{roomNotes}</p>
          </div>
        )}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Key under the mat, allergic to certain products..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} disabled={submitting}>← Back</Button>
        <Button onClick={() => onSubmit(notes)} loading={submitting} size="lg">
          ✓ Confirm Booking — £{totalPrice.toFixed(2)}
        </Button>
      </div>
    </div>
  )
}
