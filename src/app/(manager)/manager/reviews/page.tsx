import { requireManager } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/Card"
import { StarRating } from "@/components/ui/StarRating"

export default async function ReviewsPage() {
  const session = await requireManager()
  const userId = (session.user as any).id

  const company = await prisma.company.findUnique({
    where: { managerId: userId },
    include: { teams: { select: { id: true, name: true } } },
  })

  if (!company) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Reviews</h1>
        <Card className="text-center py-12 text-slate-400">Set up your company first</Card>
      </div>
    )
  }

  const reviews = await prisma.review.findMany({
    where: { team: { companyId: company.id } },
    include: {
      customer: { select: { name: true } },
      team: { select: { name: true } },
      booking: { select: { availability: { select: { date: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: reviews.filter((rev) => rev.rating === r).length,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>

      {reviews.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-slate-600 font-medium">No reviews yet</p>
          <p className="text-slate-400 text-sm mt-1">Reviews will appear here after customers complete bookings</p>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <Card>
            <div className="flex gap-8 items-center">
              <div className="text-center">
                <p className="text-5xl font-bold text-slate-900">{avgRating}</p>
                <StarRating value={Math.round(parseFloat(avgRating!))} />
                <p className="text-xs text-slate-400 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {ratingDist.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-4">{star}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-amber-400 h-2 rounded-full transition-all"
                        style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-4">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Review list */}
          <div className="space-y-3">
            {reviews.map((r) => (
              <Card key={r.id} padding="sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-800 text-sm">{r.customer.name}</p>
                      <span className="text-slate-300">·</span>
                      <p className="text-xs text-slate-500">{r.team.name}</p>
                    </div>
                    <StarRating value={r.rating} size="sm" />
                    {r.comment && (
                      <p className="text-sm text-slate-600 mt-2">{r.comment}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1.5">
                      {r.booking.availability.date}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
