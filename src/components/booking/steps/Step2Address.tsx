"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"

interface Props {
  address: string
  onUpdate: (address: string, lat?: number, lng?: number) => void
  onNext: () => void
  onBack: () => void
}

export function Step2Address({ address, onUpdate, onNext, onBack }: Props) {
  const [value, setValue] = useState(address)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState("")

  async function handleNext() {
    if (!value.trim()) return
    setGeocoding(true)
    setGeocodeError("")

    try {
      const encoded = encodeURIComponent(value)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
        { headers: { "User-Agent": "SparkleCleanApp/1.0" } }
      )
      const results = await res.json()

      if (results.length > 0) {
        const { lat, lon } = results[0]
        onUpdate(value, parseFloat(lat), parseFloat(lon))
      } else {
        // Use default London coords if geocoding fails
        onUpdate(value)
      }
    } catch {
      onUpdate(value)
    }

    setGeocoding(false)
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Where is the property?</h2>
        <p className="text-slate-500 text-sm mt-1">Enter the address where you need cleaning</p>
      </div>

      <Card>
        <Input
          label="Property address"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 12 Baker Street, London W1U 3BN"
          error={geocodeError}
          onKeyDown={(e) => e.key === "Enter" && handleNext()}
        />

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            📍 We'll use your address to find cleaning teams that cover your area.
          </p>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={handleNext} disabled={!value.trim()} loading={geocoding}>
          Find available teams →
        </Button>
      </div>
    </div>
  )
}
