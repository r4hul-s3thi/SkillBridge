import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  color?: "blue" | "teal" | "green" | "amber"
}

const colorMap = {
  blue: {
    gradient: "from-cyan-400 via-sky-400 to-blue-500",
    glow: "hover:shadow-cyan-500/20",
    value: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-500/[0.12]",
  },
  teal: {
    gradient: "from-teal-300 via-emerald-400 to-teal-500",
    glow: "hover:shadow-emerald-500/20",
    value: "text-teal-700 dark:text-teal-300",
    bg: "bg-emerald-500/[0.12]",
  },
  green: {
    gradient: "from-emerald-300 via-lime-300 to-green-500",
    glow: "hover:shadow-green-500/20",
    value: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/[0.12]",
  },
  amber: {
    gradient: "from-amber-300 via-orange-300 to-rose-400",
    glow: "hover:shadow-orange-500/20",
    value: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-500/[0.12]",
  },
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  color = "blue",
}: StatCardProps) {
  const colors = colorMap[color]

  return (
    <Card
      className={`dashboard-card dashboard-card-hover dashboard-panel border-0 ${colors.glow} group relative cursor-default overflow-hidden`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)",
        }}
      />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {label}
            </p>
            <p className={`text-2xl font-bold ${colors.value}`}>{value}</p>
            {trend && (
              <p
                className={`text-xs font-medium ${trendUp ? "text-emerald-500" : "text-muted-foreground"}`}
              >
                {trendUp ? "Up" : "Down"} {trend}
              </p>
            )}
          </div>
          <div
            className={`rounded-2xl bg-gradient-to-br ${colors.gradient} p-3 text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className={`mt-4 h-1.5 rounded-full ${colors.bg}`}>
          <div
            className={`gradient-bg-animated h-full w-2/3 rounded-full bg-gradient-to-r ${colors.gradient}`}
          />
        </div>
      </CardContent>
    </Card>
  )
}
