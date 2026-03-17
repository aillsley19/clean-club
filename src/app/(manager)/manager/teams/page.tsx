import { requireManager } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default async function TeamsPage() {
  const session = await requireManager()
  const userId = (session.user as any).id

  const company = await prisma.company.findUnique({
    where: { managerId: userId },
    include: {
      teams: {
        include: {
          members: true,
          _count: { select: { bookings: true, availability: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
  })

  if (!company) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Teams</h1>
        <Card className="text-center py-12">
          <p className="text-slate-500 mb-4">You haven&apos;t set up a company yet.</p>
          <Link href="/manager/dashboard"><Button>Go to Dashboard</Button></Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teams</h1>
          <p className="text-slate-500 mt-0.5">{company.name}</p>
        </div>
        <Link href="/manager/teams/new">
          <Button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New team
          </Button>
        </Link>
      </div>

      {company.teams.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-slate-600 font-medium text-lg">No teams yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-6">Create your first team to start accepting bookings</p>
          <Link href="/manager/teams/new"><Button size="lg">Create a team</Button></Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {company.teams.map((team) => {
            const avgRating = team.reviews.length
              ? (team.reviews.reduce((a, b) => a + b.rating, 0) / team.reviews.length).toFixed(1)
              : null

            return (
              <Card key={team.id} padding="none" className="hover:shadow-md transition-all">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{team.name}</h3>
                      <p className="text-sm text-slate-400">📍 Covers {team.areaRadiusKm}km radius</p>
                    </div>
                    {avgRating && (
                      <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                        ★ {avgRating}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-slate-800">{team.members.length}</p>
                      <p className="text-xs text-slate-400">Members</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-slate-800">{team._count.bookings}</p>
                      <p className="text-xs text-slate-400">Bookings</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-slate-800">{team.reviews.length}</p>
                      <p className="text-xs text-slate-400">Reviews</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-100 flex">
                  {[
                    { href: `/manager/teams/${team.id}`, label: "Edit" },
                    { href: `/manager/teams/${team.id}/members`, label: "Members" },
                    { href: `/manager/teams/${team.id}/availability`, label: "Availability" },
                    { href: `/manager/teams/${team.id}/calendar`, label: "Calendar" },
                  ].map((link, i) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex-1 py-2.5 text-xs font-medium text-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors ${
                        i < 3 ? "border-r border-slate-100" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
