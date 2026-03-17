"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"

interface Member {
  id: string
  name: string
  email: string
}

interface Props {
  teamId: string
  initialMembers: Member[]
}

export function MemberManager({ teamId, initialMembers }: Props) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd() {
    if (!name.trim() || !email.trim()) return
    setAdding(true)
    setError("")

    const res = await fetch(`/api/teams/${teamId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    })

    setAdding(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Failed to add member")
      return
    }

    const member = await res.json()
    setMembers((prev) => [...prev, member])
    setName("")
    setEmail("")
  }

  async function handleDelete(memberId: string) {
    setDeletingId(memberId)
    await fetch(`/api/teams/${teamId}/members/${memberId}`, { method: "DELETE" })
    setMembers((prev) => prev.filter((m) => m.id !== memberId))
    setDeletingId(null)
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-semibold text-slate-800 mb-4">
          Team Members ({members.length})
        </h2>
        {members.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No members yet. Add your first team member below.</p>
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-medium text-slate-700 text-sm">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.email}</p>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={deletingId === m.id}
                  className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
                >
                  {deletingId === m.id ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-800 mb-4">Add Member</h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm mb-3">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah Jones"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah@example.com"
          />
          <Button onClick={handleAdd} loading={adding} disabled={!name.trim() || !email.trim()}>
            Add member
          </Button>
        </div>
      </Card>
    </div>
  )
}
