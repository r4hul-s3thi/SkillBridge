import { useEffect, useRef, useState } from "react"
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
    gradient: "from-cyan-400 to-blue-500",
    glow: "hover:shadow-cyan-500/25",
    value: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "hover:border-cyan-400/40",
    shine: "from-cyan-400/20",
  },
  teal: {
    gradient: "from-teal-400 to-emerald-500",
    glow: "hover:shadow-emerald-500/25",
    value: "text-teal-700 dark:text-teal-300",
    bg: "bg-emerald-500/10",
    border: "hover:border-teal-400/40",
    shine: "from-teal-400/20",
  },
  green: {
    gradient: "from-emerald-400 to-green-500",
    glow: "hover:shadow-green-500/25",
    value: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "hover:border-emerald-400/40",
    shine: "from-emerald-400/20",
  },
  amber: {
    gradient: "from-amber-400 to-orange-500",
    glow: "hover:shadow-orange-500/25",
    value: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-500/10",
    border: "hover:border-amber-400/40",
    shine: "from-amber-400/20",
  },
}

function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0)
  const raf = useRef<number>(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(ease * target))
      if (progress < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return count
}

export function StatCard({ label, value, icon: Icon, trend, trendUp, color = "blue" }: StatCardProps) {
  const colors = colorMap[color]
  const isNumber = typeof value === "number"
  const animated = useCountUp(isNumber ? value : 0)
  const displayValue = isNumber ? animated : value
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    card.style.setProperty("--mouse-x", `${x}%`)
    card.style.setProperty("--mouse-y", `${y}%`)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`stat-card group relative cursor-default overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${colors.glow} ${colors.border}`}
    >
      {/* Mouse follow glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle 80px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.08), transparent)`,
        }}
      />
      {/* Top shine line */}
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${colors.shine} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">{label}</p>
          <p className={`text-3xl font-bold tabular-nums ${colors.value} transition-all duration-300 group-hover:scale-105 origin-left`}>
            {displayValue}
          </p>
          {trend && (
            <p className={`text-xs font-medium flex items-center gap-1 ${trendUp ? "text-emerald-500" : "text-muted-foreground"}`}>
              {trendUp && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {trend}
            </p>
          )}
        </div>
        <div className={`shrink-0 rounded-2xl bg-gradient-to-br ${colors.gradient} p-3 text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className={`mt-4 h-1 rounded-full ${colors.bg} overflow-hidden`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-1000`}
          style={{ width: isNumber && value > 0 ? `${Math.min((value / 30) * 100, 100)}%` : "30%" }}
        />
      </div>
    </div>
  )
}
