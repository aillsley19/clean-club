"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

interface Props {
  initialData?: {
    name: string
    postcode?: string | null
    areaLat: number
    areaLng: number
    areaRadiusKm: number
    hourlyRate?: number
  }
  teamId?: string
}

export function TeamForm({ initialData, teamId }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initialData?.name || "")
  const [postcode, setPostcode] = useState(initialData?.postcode || "")
  const [areaLat, setAreaLat] = useState(String(initialData?.areaLat || "51.5074"))
  const [areaLng, setAreaLng] = useState(String(initialData?.areaLng || "-0.1278"))
  const [areaRadiusKm, setAreaRadiusKm] = useState(String(initialData?.areaRadiusKm || "5"))
  const [hourlyRate, setHourlyRate] = useState(String(initialData?.hourlyRate ?? "20"))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const body = {
      name,
      postcode: postcode || undefined,
      areaLat: parseFloat(areaLat),
      areaLng: parseFloat(areaLng),
      areaRadiusKm: parseFloat(areaRadiusKm),
      hourlyRate: parseFloat(hourlyRate),
    }

    const res = await fetch(teamId ? `/api/teams/${teamId}` : "/api/teams", {
      method: teamId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Failed to save team")
      return
    }

    const team = await res.json()
    router.push(`/manager/teams/${team.id}`)
    router.refresh()
  }

  async function handleDelete() {
    if (!teamId) return
    setLoading(true)
    await fetch(`/api/teams/${teamId}`, { method: "DELETE" })
    router.push("/manager/teams")
    router.refresh()
  }

  const presets = [
    { label: "Central London", lat: 51.5074, lng: -0.1278, postcode: "WC2N 5DU" },
    { label: "East London", lat: 51.5155, lng: -0.0702, postcode: "E1 6RF" },
    { label: "North London", lat: 51.56, lng: -0.12, postcode: "N1 9GU" },
    { label: "South London", lat: 51.4614, lng: -0.1188, postcode: "SE1 7PB" },
    { label: "West London", lat: 51.4994, lng: -0.1773, postcode: "W6 0NE" },
  ]

  const radiusOptions = [1, 2, 3, 5, 7, 10, 15, 20]

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Team name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Team Lindfield, Team Alpha"
          required
        />

        {/* Hourly rate */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Hourly rate (£)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">£</span>
            <input
              type="number"
              step="0.50"
              min="1"
              max="500"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="20.00"
              required
              className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Shown to customers as:{" "}
            <span className="font-semibold text-green-700">
              £{hourlyRate ? parseFloat(hourlyRate).toFixed(2) : "0.00"}/hr
            </span>
          </p>
        </div>

        {/* Coverage area */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Coverage area</label>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setAreaLat(String(p.lat))
                  setAreaLng(String(p.lng))
                  setPostcode(p.postcode)
                }}
                className="px-3 py-1 text-xs rounded-full border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mb-3">
            <Input
              label="Base postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. SW1A 1AA"
            />
            <p className="text-xs text-slate-400 mt-1">
              Where your team is based — customers nearby will be matched to you.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={areaLat}
              onChange={(e) => setAreaLat(e.target.value)}
              placeholder="51.5074"
              required
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={areaLng}
              onChange={(e) => setAreaLng(e.target.value)}
              placeholder="-0.1278"
              required
            />
          </div>
        </div>

        {/* Radius */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Coverage radius — <span className="text-blue-600">{areaRadiusKm}km</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {radiusOptions.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setAreaRadiusKm(String(r))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  areaRadiusKm === String(r)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
          <input
            type="range"
            min="0.5"
            max="25"
            step="0.5"
            value={areaRadiusKm}
            onChange={(e) => setAreaRadiusKm(e.target.value)}
            className="w-full accent-blue-600"
          />
          <p className="text-xs text-slate-400 mt-1">
            Customers within {areaRadiusKm}km of your base can book this team.
          </p>
        </div>

        <div className="flex justify-between items-center pt-2">
          {teamId && !deleteConfirm && (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Delete team
            </button>
          )}
          {deleteConfirm && (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-red-600">Confirm delete?</span>
              <Button variant="danger" size="sm" onClick={handleDelete} loading={loading}>Yes, delete</Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
            </div>
          )}
          {!teamId && <div />}
          <Button type="submit" loading={loading}>
            {teamId ? "Save changes" : "Create team"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
