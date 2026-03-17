"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

// ─── Room definitions ────────────────────────────────────────────────
interface TaskDef {
  id: string
  label: string
  minutes: number
}

interface RoomDef {
  id: string
  serviceId: string // maps to DB service for booking submission
  label: string
  icon: string
  baseMinutes: number
  tasks: TaskDef[]
}

const ROOMS: RoomDef[] = [
  {
    id: "bathroom",
    serviceId: "svc-bathroom",
    label: "Bathroom",
    icon: "🛁",
    baseMinutes: 5,
    tasks: [
      { id: "sink", label: "Sink", minutes: 5 },
      { id: "toilet", label: "Toilet", minutes: 5 },
      { id: "shower", label: "Shower", minutes: 8 },
      { id: "bath", label: "Bath", minutes: 8 },
      { id: "hoover", label: "Hoover", minutes: 5 },
      { id: "mop", label: "Mop", minutes: 5 },
    ],
  },
  {
    id: "kitchen",
    serviceId: "svc-kitchen",
    label: "Kitchen",
    icon: "🍳",
    baseMinutes: 5,
    tasks: [
      { id: "sink", label: "Sink", minutes: 5 },
      { id: "surfaces", label: "Surfaces & cupboards", minutes: 10 },
      { id: "hoover", label: "Hoover", minutes: 5 },
      { id: "mop", label: "Mop", minutes: 5 },
    ],
  },
  {
    id: "living",
    serviceId: "svc-living",
    label: "Living Room",
    icon: "🛋️",
    baseMinutes: 5,
    tasks: [
      { id: "sofas", label: "Sofas", minutes: 10 },
      { id: "hoover", label: "Hoover", minutes: 5 },
      { id: "mop", label: "Mop", minutes: 5 },
    ],
  },
  {
    id: "bedroom",
    serviceId: "svc-bedroom",
    label: "Bedroom",
    icon: "🛏️",
    baseMinutes: 5,
    tasks: [
      { id: "hoover", label: "Hoover", minutes: 5 },
      { id: "mop", label: "Mop", minutes: 5 },
    ],
  },
  {
    id: "utility",
    serviceId: "svc-vacuum",
    label: "Utility Room",
    icon: "🧺",
    baseMinutes: 5,
    tasks: [
      { id: "hoover", label: "Hoover", minutes: 5 },
      { id: "mop", label: "Mop", minutes: 5 },
    ],
  },
]

// ─── Types ───────────────────────────────────────────────────────────
export interface RoomSelection {
  roomId: string
  serviceId: string
  count: number
  tasks: string[] // task ids selected
}

export interface Step1Output {
  rooms: RoomSelection[]
  totalMinutes: number
  notes: string
  isRoutine: boolean
  routineFrequency: "weekly" | "fortnightly" | "monthly" | null
}

interface Props {
  onNext: (output: Step1Output) => void
}

// ─── Helpers ─────────────────────────────────────────────────────────
function calcMinutesForRoom(room: RoomDef, tasks: string[]): number {
  const taskMins = tasks.reduce((sum, tid) => {
    const t = room.tasks.find((t) => t.id === tid)
    return sum + (t ? t.minutes : 0)
  }, 0)
  return room.baseMinutes + taskMins
}

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`
}

// ─── Component ───────────────────────────────────────────────────────
export function Step1Services({ onNext }: Props) {
  // roomId → { count, tasks }
  const [roomStates, setRoomStates] = useState<
    Record<string, { count: number; tasks: string[] }>
  >({})
  const [notes, setNotes] = useState("")
  const [isRoutine, setIsRoutine] = useState(false)
  const [routineFrequency, setRoutineFrequency] = useState<"weekly" | "fortnightly" | "monthly">("weekly")
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)

  function getState(roomId: string) {
    return roomStates[roomId] ?? { count: 0, tasks: [] }
  }

  function setCount(roomId: string, delta: number) {
    setRoomStates((prev) => {
      const cur = prev[roomId] ?? { count: 0, tasks: [] }
      const newCount = Math.max(0, cur.count + delta)
      if (newCount === 0) {
        const { [roomId]: _, ...rest } = prev
        return rest
      }
      // Auto-expand when first added
      if (cur.count === 0 && delta > 0) setExpandedRoom(roomId)
      return { ...prev, [roomId]: { ...cur, count: newCount } }
    })
  }

  function toggleTask(roomId: string, taskId: string) {
    setRoomStates((prev) => {
      const cur = prev[roomId] ?? { count: 1, tasks: [] }
      const tasks = cur.tasks.includes(taskId)
        ? cur.tasks.filter((t) => t !== taskId)
        : [...cur.tasks, taskId]
      return { ...prev, [roomId]: { ...cur, tasks } }
    })
  }

  // Total minutes across all selected rooms
  const totalMinutes = ROOMS.reduce((sum, room) => {
    const s = getState(room.id)
    if (s.count === 0) return sum
    return sum + s.count * calcMinutesForRoom(room, s.tasks)
  }, 0)

  const selectedRoomCount = Object.values(roomStates).filter((s) => s.count > 0).length

  function handleNext() {
    const rooms: RoomSelection[] = ROOMS.filter((r) => (roomStates[r.id]?.count ?? 0) > 0).map(
      (r) => ({
        roomId: r.id,
        serviceId: r.serviceId,
        count: roomStates[r.id].count,
        tasks: roomStates[r.id].tasks,
      })
    )
    onNext({
      rooms,
      totalMinutes,
      notes,
      isRoutine,
      routineFrequency: isRoutine ? routineFrequency : null,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Select your clean</h2>
        <p className="text-slate-500 text-sm mt-1">
          Add rooms and tick what needs doing. We&apos;ll estimate the time automatically.
        </p>
      </div>

      {/* Room cards */}
      <div className="space-y-3">
        {ROOMS.map((room) => {
          const s = getState(room.id)
          const isAdded = s.count > 0
          const isExpanded = expandedRoom === room.id && isAdded
          const roomMins = isAdded ? s.count * calcMinutesForRoom(room, s.tasks) : 0

          return (
            <Card
              key={room.id}
              padding="none"
              className={`overflow-hidden transition-all ${
                isAdded ? "border-blue-300 shadow-sm" : ""
              }`}
            >
              {/* Header row */}
              <div className="flex items-center gap-3 p-4">
                <span className="text-2xl">{room.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${isAdded ? "text-blue-800" : "text-slate-700"}`}>
                      {room.label}
                    </p>
                    {isAdded && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {formatMinutes(roomMins)}
                      </span>
                    )}
                  </div>
                  {isAdded && s.tasks.length > 0 && (
                    <p className="text-xs text-blue-600 mt-0.5">
                      {s.tasks.length} task{s.tasks.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>

                {/* Count controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {isAdded && (
                    <>
                      <button
                        onClick={() => setCount(room.id, -1)}
                        className="w-8 h-8 rounded-full bg-white border border-slate-300 text-slate-600 text-xl font-bold flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold text-blue-700 text-sm">
                        {s.count}
                      </span>
                    </>
                  )}
                  <button
                    onClick={() => setCount(room.id, 1)}
                    className={`w-8 h-8 rounded-full text-white text-xl font-bold flex items-center justify-center transition-colors ${
                      isAdded
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    +
                  </button>
                </div>

                {/* Expand toggle */}
                {isAdded && (
                  <button
                    onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Task checkboxes */}
              {isExpanded && (
                <div className="border-t border-blue-100 bg-blue-50 px-4 pb-4 pt-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    What needs doing?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {room.tasks.map((task) => {
                      const checked = s.tasks.includes(task.id)
                      return (
                        <label
                          key={task.id}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            checked
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTask(room.id, task.id)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{task.label}</span>
                          <span className={`text-xs ml-auto ${checked ? "text-blue-200" : "text-slate-400"}`}>
                            +{task.minutes}m
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Notes */}
      {selectedRoomCount > 0 && (
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Notes for the cleaners <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Key under mat, pet in the house, focus on kitchen..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Routine clean toggle */}
      {selectedRoomCount > 0 && (
        <Card padding="sm" className={isRoutine ? "border-green-300 bg-green-50" : ""}>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsRoutine((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isRoutine ? "bg-green-500" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isRoutine ? "translate-x-5" : ""
                }`}
              />
            </div>
            <div>
              <p className={`text-sm font-medium ${isRoutine ? "text-green-800" : "text-slate-700"}`}>
                Make this a routine clean
              </p>
              <p className="text-xs text-slate-400">Set a recurring schedule</p>
            </div>
          </label>
          {isRoutine && (
            <div className="flex gap-2 mt-3 ml-14">
              {(["weekly", "fortnightly", "monthly"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setRoutineFrequency(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                    routineFrequency === f
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-green-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Bottom bar */}
      <div className="sticky bottom-4">
        <Card
          padding="sm"
          className={`transition-all ${totalMinutes > 0 ? "border-blue-300 bg-blue-50" : ""}`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              {totalMinutes > 0 ? (
                <>
                  <p className="text-sm font-semibold text-blue-800">
                    Estimated clean time: {formatMinutes(totalMinutes)}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    {selectedRoomCount} room{selectedRoomCount !== 1 ? "s" : ""} selected
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500">Add rooms to see time estimate</p>
              )}
            </div>
            <Button onClick={handleNext} disabled={totalMinutes === 0}>
              Next →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
