"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"

const TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
}

const LABELS: Record<string, string> = {
  CONFIRMED: "Confirm",
  COMPLETED: "Mark Complete",
  CANCELLED: "Cancel",
}

const VARIANTS: Record<string, "primary" | "secondary" | "danger"> = {
  CONFIRMED: "primary",
  COMPLETED: "secondary",
  CANCELLED: "danger",
}

export function BookingStatusUpdater({ bookingId, currentStatus }: { bookingId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const next = TRANSITIONS[currentStatus] || []
  if (next.length === 0) return null

  async function update(status: string) {
    setLoading(status)
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="flex gap-2 shrink-0">
      {next.map((status) => (
        <Button
          key={status}
          variant={VARIANTS[status] || "secondary"}
          size="sm"
          onClick={() => update(status)}
          loading={loading === status}
        >
          {LABELS[status] || status}
        </Button>
      ))}
    </div>
  )
}
