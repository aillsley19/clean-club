type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "purple"

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function statusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    PENDING: "warning",
    CONFIRMED: "info",
    COMPLETED: "success",
    CANCELLED: "danger",
  }
  return map[status] || "default"
}
