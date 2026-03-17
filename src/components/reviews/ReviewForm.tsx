"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { StarRating } from "@/components/ui/StarRating"

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!rating) {
      setError("Please select a rating")
      return
    }
    setLoading(true)
    setError("")

    const res = await fetch(`/api/bookings/${bookingId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Failed to submit review")
      return
    }

    setSubmitted(true)
    router.refresh()
  }

  if (submitted) {
    return (
      <Card className="text-center py-8">
        <p className="text-4xl mb-3">🌟</p>
        <p className="font-semibold text-slate-800">Thank you for your review!</p>
        <p className="text-slate-500 text-sm mt-1">Your feedback helps maintain our quality standards.</p>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="font-semibold text-slate-800 mb-1">Leave a Review</h2>
      <p className="text-sm text-slate-500 mb-4">How was the cleaning service?</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm font-medium text-slate-700 mb-2">Rating</p>
        <StarRating value={rating} onChange={setRating} size="lg" />
        <p className="text-xs text-slate-400 mt-1">
          {rating === 0 ? "Select a rating" : ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
        </p>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-slate-700 block mb-1">
          Comment <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <Button onClick={handleSubmit} loading={loading} disabled={!rating}>
        Submit review
      </Button>
    </Card>
  )
}
