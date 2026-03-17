"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { WizardState, TeamWithSlots, AvailabilitySlot } from "@/types"
import { Step1Services, type Step1Output } from "./steps/Step1Services"
import { Step2Address } from "./steps/Step2Address"
import { Step3Teams } from "./steps/Step3Teams"
import { Step4Confirm } from "./steps/Step4Confirm"

const STEPS = ["Rooms", "Address", "Choose Team", "Confirm"]

export function BookingWizard() {
  const router = useRouter()
  const [state, setState] = useState<WizardState>({
    step: 1,
    selectedServices: [],
    totalMinutes: 0,
    roomNotes: "",
    isRoutine: false,
    routineFrequency: null,
    address: "",
    addressLat: 51.5074, // default London
    addressLng: -0.1278,
    selectedTeamId: null,
    selectedAvailabilityId: null,
    selectedSlot: null,
    selectedTeam: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  function setStep(step: 1 | 2 | 3 | 4) {
    setState((s) => ({ ...s, step }))
  }

  function handleStep1(output: Step1Output) {
    // Convert room selections to service entries for the booking API
    const selectedServices = output.rooms.map((r) => ({
      serviceId: r.serviceId,
      quantity: r.count,
    }))
    setState((s) => ({
      ...s,
      step: 2,
      selectedServices,
      totalMinutes: output.totalMinutes,
      roomNotes: output.notes,
      isRoutine: output.isRoutine,
      routineFrequency: output.routineFrequency,
    }))
  }

  function updateAddress(address: string, lat?: number, lng?: number) {
    setState((s) => ({
      ...s,
      address,
      addressLat: lat ?? s.addressLat,
      addressLng: lng ?? s.addressLng,
    }))
  }

  function selectSlot(team: TeamWithSlots, slot: AvailabilitySlot) {
    setState((s) => ({
      ...s,
      selectedTeamId: team.id,
      selectedAvailabilityId: slot.id,
      selectedSlot: slot,
      selectedTeam: team,
    }))
  }

  async function handleSubmit(extraNotes: string) {
    setSubmitting(true)
    setSubmitError("")

    // Combine room notes with any extra notes from confirm page
    const notes = [state.roomNotes, extraNotes].filter(Boolean).join("\n\n") || undefined
    const routineNote = state.isRoutine
      ? `[Routine: ${state.routineFrequency}]`
      : undefined

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId: state.selectedTeamId,
        availabilityId: state.selectedAvailabilityId,
        address: state.address,
        totalMinutes: state.totalMinutes,
        notes: [routineNote, notes].filter(Boolean).join(" ") || undefined,
        services: state.selectedServices,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setSubmitError(data.error || "Booking failed. Please try again.")
      setSubmitting(false)
      return
    }

    const booking = await res.json()
    router.push(`/bookings/${booking.id}`)
  }

  return (
    <div className="max-w-2xl">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => {
          const stepNum = (i + 1) as 1 | 2 | 3 | 4
          const active = state.step === stepNum
          const done = state.step > stepNum

          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => done && setStep(stepNum)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    active ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                    done ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-700" :
                    "bg-slate-200 text-slate-400 cursor-default"
                  }`}
                >
                  {done ? "✓" : stepNum}
                </button>
                <p className={`text-xs mt-1 whitespace-nowrap ${active ? "text-blue-600 font-semibold" : done ? "text-blue-600" : "text-slate-400"}`}>
                  {label}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mb-4 ${done ? "bg-blue-600" : "bg-slate-200"}`} />
              )}
            </div>
          )
        })}
      </div>

      {state.step === 1 && <Step1Services onNext={handleStep1} />}

      {state.step === 2 && (
        <Step2Address
          address={state.address}
          onUpdate={updateAddress}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {state.step === 3 && (
        <Step3Teams
          addressLat={state.addressLat!}
          addressLng={state.addressLng!}
          totalMinutes={state.totalMinutes}
          selectedAvailabilityId={state.selectedAvailabilityId}
          onSelect={selectSlot}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {state.step === 4 && (
        <Step4Confirm
          state={state}
          onSubmit={handleSubmit}
          onBack={() => setStep(3)}
          submitting={submitting}
          submitError={submitError}
        />
      )}
    </div>
  )
}
