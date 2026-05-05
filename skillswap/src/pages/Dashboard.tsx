import {
  Users2, CalendarClock, Star, BookOpen,
  ArrowRight, CheckCircle2, Clock, Zap,
  TrendingUp, Activity, Plus, MessageSquare,
  Handshake, ChevronRight, Flame,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/shared/StatCard"
import { SkillBadge } from "@/components/shared/SkillBadge"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { StarRating } from "@/components/shared/StarRating"
import { useAuthStore } from "@/store/authStore"
import { useAppStore } from "@/store/appStore"
import { format } from "date-fns"

const statusConfig = {
  pending:   { label: "Pending",   icon: Clock,         color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800/50" },
  accepted:  { label: "Confirmed", icon: CheckCircle2,  color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800/50" },
  completed: { label: "Done",      icon: CheckCircle2,  color: "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/50 dark:border-sky-800/50" },
  rejected:  { label: "Rejected",  icon: Clock,         color: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:border-rose-800/50" },
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { matches, sessions, skills, ratings } = useAppStore()
  const navigate = useNavigate()

  const activeMatches = matches.filter((m) => m.status === "active").slice(0, 4)
  const upcomingSessions = sessions.filter((s) => s.status === "pending" || s.status === "accepted").slice(0, 3)
  const offeredSkills = skills.filter((s) => s.type === "offer")
  const wantedSkills = skills.filter((s) => s.type === "want")
  const completedSessions = sessions.filter((s) => s.status === "completed")

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const greetingEmoji = hour < 12 ? "☀️" : hour < 18 ? "👋" : "🌙"

  const recentActivity = [
    ...sessions.slice(0, 3).map((s) => ({
      id: `s-${s.id}`, text: `${s.topic}`, sub: `with ${s.participant.name}`,
      time: s.date, icon: CalendarClock,
      color: s.status === "completed" ? "bg-emerald-500" : s.status === "accepted" ? "bg-primary" : "bg-amber-500",
    })),
    ...ratings.slice(0, 2).map((r) => ({
      id: `r-${r.id}`, text: `${r.fromUser.name} rated you ${r.rating}★`,
      sub: r.feedback ? `"${r.feedback.slice(0, 35)}..."` : "No feedback",
      time: r.createdAt, icon: Star, color: "bg-amber-400",
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4)

  const completionItems = [
    { label: "Profile info", done: !!(user?.name && user?.email), link: "/profile" },
    { label: "Skills I have", done: offeredSkills.length > 0, link: "/profile" },
    { label: "Skills I need", done: wantedSkills.length > 0, link: "/profile" },
    { label: "First collab session", done: completedSessions.length > 0, link: "/sessions" },
  ]
  const completionPct = Math.round((completionItems.filter((i) => i.done).length / completionItems.length) * 100)

  const quickActions = [
    { label: "Find Co-builders", icon: Users2, to: "/matches", color: "from-cyan-500 to-blue-600", desc: "Browse matches" },
    { label: "Post a Project", icon: Handshake, to: "/collabs", color: "from-violet-500 to-purple-600", desc: "Collab board" },
    { label: "Schedule Session", icon: CalendarClock, to: "/sessions", color: "from-emerald-500 to-teal-600", desc: "Book time" },
    { label: "Send Message", icon: MessageSquare, to: "/messages", color: "from-orange-500 to-rose-600", desc: "Chat now" },
  ]

  return (
    <div className="space-y-5 max-w-7xl">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(42,199,182,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-white/50 mb-1">{greetingEmoji} {greeting}</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {user?.name ?? "there"}
            </h1>
            <p className="mt-1.5 text-sm text-white/60 max-w-md">
              {completionPct < 75
                ? "Complete your profile to unlock better co-builder matches."
                : activeMatches.length > 0
                ? `You have ${activeMatches.length} co-builder match${activeMatches.length > 1 ? "es" : ""} waiting.`
                : "Post a project or add skills to find your co-builder."}
            </p>
          </div>

          {/* Mini stats */}
          <div className="flex gap-3 shrink-0">
            {[
              { val: activeMatches.length, label: "Matches", color: "text-cyan-400" },
              { val: user?.totalSessions ?? completedSessions.length, label: "Sessions", color: "text-violet-400" },
              { val: `${completionPct}%`, label: "Profile", color: "text-emerald-400" },
            ].map(({ val, label, color }) => (
              <div key={label} className="text-center rounded-xl bg-white/8 border border-white/10 px-4 py-2.5 backdrop-blur-sm">
                <p className={`text-xl font-bold ${color}`}>{val}</p>
                <p className="text-[11px] text-white/40 uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Profile completion bar */}
        {completionPct < 100 && (
          <div className="relative z-10 mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50">Profile completion</span>
              <span className="text-xs font-semibold text-white/70">{completionPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-1000"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map(({ label, icon: Icon, to, color, desc }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 active:scale-95"
          >
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 transition-all duration-200 group-hover:right-2 group-hover:text-primary" />
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <StatCard label="Co-builders" value={activeMatches.length} icon={Users2} trend="matched" trendUp color="blue" />
        <StatCard label="Sessions" value={user?.totalSessions ?? completedSessions.length} icon={CalendarClock} trend="completed" trendUp color="teal" />
        <StatCard label="Rating" value={user?.rating ? Number(user.rating).toFixed(1) : "—"} icon={Star} trend="avg score" trendUp color="amber" />
        <StatCard label="Skills" value={skills.length} icon={BookOpen} trend={`${offeredSkills.length} have · ${wantedSkills.length} need`} color="green" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left col */}
        <div className="lg:col-span-2 space-y-5">

          {/* Matches */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div>
                <h2 className="font-semibold text-sm">Co-builder Matches</h2>
                <p className="text-xs text-muted-foreground mt-0.5">People with complementary skills</p>
              </div>
              <Link to="/matches" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {activeMatches.slice(0, 3).map((match) => (
                <div key={match.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors group">
                  <UserAvatar name={match.matchedUser.name} avatar={match.matchedUser.avatar} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{match.matchedUser.name}</p>
                      <span className="shrink-0 text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                        {match.compatibilityScore}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {[...match.matchedSkills.offer.slice(0, 2), ...match.matchedSkills.want.slice(0, 1)].map((s, i) => (
                        <SkillBadge key={s} skill={s} type={i < match.matchedSkills.offer.length ? "offer" : "want"} size="sm" />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/messages")}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-primary/10 text-primary"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {activeMatches.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                    <Users2 className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No matches yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Add skills to your profile to get matched</p>
                  <Link to="/profile" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    Add skills <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sessions */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div>
                <h2 className="font-semibold text-sm">Upcoming Sessions</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Your scheduled build sessions</p>
              </div>
              <Link to="/sessions" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {upcomingSessions.map((session) => {
                const cfg = statusConfig[session.status]
                const StatusIcon = cfg.icon
                return (
                  <div key={session.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                    <UserAvatar name={session.participant.name} avatar={session.participant.avatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{session.topic}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {session.participant.name} · {format(new Date(session.date), "MMM d, h:mm a")} · {session.duration}min
                      </p>
                    </div>
                    <Badge variant="outline" className={`shrink-0 text-xs border ${cfg.color}`}>
                      <StatusIcon className="mr-1 h-3 w-3" />{cfg.label}
                    </Badge>
                  </div>
                )
              })}
              {upcomingSessions.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                    <CalendarClock className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No sessions yet</p>
                  <button onClick={() => navigate("/sessions")} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    <Plus className="h-3 w-3" /> Schedule one
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-5">

          {/* Profile strength */}
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Profile Strength
              </h2>
              <span className="text-lg font-bold text-primary">{completionPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-1000"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="space-y-2.5">
              {completionItems.map(({ label, done, link }) => (
                <Link key={label} to={done ? "#" : link} className={`flex items-center gap-2.5 group ${done ? "pointer-events-none" : ""}`}>
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all ${done ? "bg-emerald-500" : "bg-muted border-2 border-border group-hover:border-primary"}`}>
                    {done && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <span className={`text-xs ${done ? "text-muted-foreground line-through" : "text-foreground group-hover:text-primary transition-colors"}`}>
                    {label}
                  </span>
                  {!done && <ChevronRight className="h-3 w-3 text-muted-foreground/40 ml-auto group-hover:text-primary transition-colors" />}
                </Link>
              ))}
            </div>
          </div>

          {/* My Skills */}
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                My Skills
              </h2>
              <Link to="/profile" className="text-xs text-primary hover:underline flex items-center gap-1">
                Edit <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {skills.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">No skills added yet</p>
                <Link to="/profile" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  <Plus className="h-3 w-3" /> Add skills
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {offeredSkills.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">I Have</p>
                    <div className="flex flex-wrap gap-1.5">
                      {offeredSkills.slice(0, 5).map((s) => <SkillBadge key={s.id} skill={s.skillName} type="offer" level={s.level} size="sm" />)}
                    </div>
                  </div>
                )}
                {wantedSkills.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">I Need</p>
                    <div className="flex flex-wrap gap-1.5">
                      {wantedSkills.slice(0, 5).map((s) => <SkillBadge key={s.id} skill={s.skillName} type="want" level={s.level} size="sm" />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <h2 className="font-semibold text-sm flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              My Rating
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-2xl font-bold shadow-lg">
                {user?.rating ? Number(user.rating).toFixed(1) : "—"}
              </div>
              <div>
                <StarRating value={Math.round(user?.rating ?? 0)} readonly size="sm" />
                <p className="text-xs text-muted-foreground mt-1">
                  {user?.totalSessions ?? completedSessions.length} sessions completed
                </p>
              </div>
            </div>
          </div>

          {/* Activity */}
          {recentActivity.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <h2 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-primary" />
                Recent Activity
              </h2>
              <div className="space-y-3">
                {recentActivity.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`mt-0.5 h-6 w-6 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium leading-snug truncate">{item.text}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.sub}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
