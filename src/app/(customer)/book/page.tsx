import { requireCustomer } from "@/lib/auth-utils"
import { BookingWizard } from "@/components/booking/BookingWizard"

export default async function BookPage() {
  await requireCustomer()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Book a Clean</h1>
        <p className="text-slate-500 mt-1">Select your rooms and find an available team</p>
      </div>
      <BookingWizard />
    </div>
  )
}
