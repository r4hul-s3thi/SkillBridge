import {
  Users2,
  CalendarClock,
  Star,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  TrendingUp,
  Rocket,
  Waves,
  Activity,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  pending: {
    label: "Pending",
    icon: Clock,
    color:
      "text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-200 dark:bg-amber-400/[0.15] dark:border-amber-300/20",
  },
  accepted: {
    label: "Confirmed",
    icon: CheckCircle2,
    color:
      "text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-200 dark:bg-emerald-400/[0.15] dark:border-emerald-300/20",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color:
      "text-cyan-700 bg-cyan-100 border-cyan-200 dark:text-cyan-100 dark:bg-cyan-400/[0.15] dark:border-cyan-300/20",
  },
  rejected: {
    label: "Rejected",
    icon: Clock,
    color:
      "text-rose-700 bg-rose-100 border-rose-200 dark:text-rose-200 dark:bg-rose-400/[0.15] dark:border-rose-300/20",
  },
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { matches, sessions, skills, ratings } = useAppStore()

  const activeMatches = matches.filter((m) => m.status === "active").slice(0, 4)
  const upcomingSessions = sessions
    .filter((s) => s.status === "pending" || s.status === "accepted")
    .slice(0, 4)
  const offeredSkills = skills.filter((s) => s.type === "offer")
  const wantedSkills = skills.filter((s) => s.type === "want")
  const completedSessions = sessions.filter((s) => s.status === "completed")

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  // Build a simple activity feed from sessions + ratings
  const recentActivity = [
    ...sessions.slice(0, 3).map((s) => ({
      id: `s-${s.id}`,
      text: `Session "${s.topic}" with ${s.participant.name}`,
      sub: s.status,
      time: s.date,
      icon: CalendarClock,
      color: s.status === 'completed' ? 'text-emerald-500' : s.status === 'accepted' ? 'text-primary' : 'text-amber-500',
    })),
    ...ratings.slice(0, 2).map((r) => ({
      id: `r-${r.id}`,
      text: `${r.fromUser.name} rated you ${r.rating}★`,
      sub: r.feedback ? `"${r.feedback.slice(0, 40)}..."` : '',
      time: r.createdAt,
      icon: Star,
      color: 'text-amber-400',
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);

  const completionItems = [
    { label: "Profile info", done: !!(user?.name && user?.email) },
    { label: "Skills I have", done: offeredSkills.length > 0 },
    { label: "Skills I need", done: wantedSkills.length > 0 },
    { label: "First collab session", done: completedSessions.length > 0 },
  ]
  const completionPct = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) *
      100
  )

  return (
    <div className="dashboard-shell max-w-7xl space-y-6 rounded-[32px]">
      <section className="dashboard-hero-shell animate-fade-up relative overflow-hidden rounded-[30px] border border-cyan-200/60 bg-[linear-gradient(135deg,rgba(239,252,250,0.98),rgba(245,250,255,0.96),rgba(238,246,255,0.96))] px-6 py-7 text-slate-900 shadow-[0_30px_80px_rgba(145,182,210,0.24)] lg:px-8 dark:border-white/10 dark:bg-[#081524] dark:text-white dark:shadow-[0_30px_80px_rgba(8,14,28,0.35)]">
        <div className="gradient-bg-animated absolute inset-0 opacity-10 dark:opacity-20" />
        <div className="dashboard-hero-grid" />
        <div className="absolute top-0 -right-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="animate-float-slow absolute bottom-0 left-0 h-44 w-44 rounded-full bg-sky-400/[0.12] blur-3xl" />
        <div className="animate-ambient-pulse absolute top-[22%] right-[28%] h-24 w-24 rounded-full bg-cyan-300/[0.14] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.04),rgba(255,255,255,0.08))] dark:bg-[linear-gradient(135deg,rgba(8,21,36,0.96),rgba(10,33,54,0.92),rgba(16,32,55,0.95))]" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/70 bg-white/70 px-3 py-1.5 text-xs font-medium text-cyan-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/8 dark:text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" />
              {activeMatches.length > 0 ? `${activeMatches.length} active matches` : "Welcome to SkillBridge"}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                <span>{greeting}, </span>
                <span className="gradient-text">{user?.name ?? "there"}</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-700 sm:text-base dark:text-slate-200/[0.75]">
                {completionPct < 100
                  ? "Add your skills and post a project to start finding co-builders."
                  : "Find collaborators, schedule build sessions, and ship projects together."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="dashboard-panel animate-scale-in rounded-2xl border border-white/60 bg-white/72 px-4 py-3 shadow-[0_18px_35px_rgba(150,185,210,0.18)] backdrop-blur-xl [animation-delay:80ms] dark:border-white/10 dark:bg-white/8">
              <p className="text-xs tracking-[0.22em] text-slate-500 uppercase dark:text-white/[0.45]">
                Matches
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {activeMatches.length}
              </p>
            </div>
            <div className="dashboard-panel animate-scale-in rounded-2xl border border-white/60 bg-white/72 px-4 py-3 shadow-[0_18px_35px_rgba(150,185,210,0.18)] backdrop-blur-xl [animation-delay:160ms] dark:border-white/10 dark:bg-white/8">
              <p className="text-xs tracking-[0.22em] text-slate-500 uppercase dark:text-white/[0.45]">
                Sessions
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {user?.totalSessions ?? completedSessions.length}
              </p>
            </div>
            <div className="dashboard-panel animate-scale-in rounded-2xl border border-white/60 bg-white/72 px-4 py-3 shadow-[0_18px_35px_rgba(150,185,210,0.18)] backdrop-blur-xl [animation-delay:240ms] dark:border-white/10 dark:bg-white/8">
              <p className="text-xs tracking-[0.22em] text-slate-500 uppercase dark:text-white/[0.45]">
                Progress
              </p>
              <p className="mt-1 text-2xl font-semibold">{completionPct}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-fade-up-1 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="dashboard-card dashboard-card-hover dashboard-panel relative overflow-hidden rounded-[28px] border-0 p-5">
          <div className="animate-float absolute top-1/2 -right-8 h-28 w-28 -translate-y-1/2 rounded-full bg-cyan-400/[0.12] blur-3xl" />
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.12] px-3 py-1 text-xs font-semibold text-primary">
                <Rocket className="h-3.5 w-3.5" />
                Build momentum
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                You have active matches — reach out and start building.
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Your skill profile is attracting matches. Message a collaborator, schedule a build session, or post a new project on the Collab Board.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[250px]">
              <div className="rounded-2xl bg-background/[0.58] p-4 shadow-sm">
                <p className="text-muted-foreground">Completed</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {completedSessions.length}
                </p>
              </div>
              <div className="rounded-2xl bg-background/[0.58] p-4 shadow-sm">
                <p className="text-muted-foreground">Skills needed</p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {wantedSkills.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card dashboard-card-hover dashboard-panel relative overflow-hidden rounded-[28px] border-0 p-5">
          <div className="animate-drift absolute -top-10 -left-8 h-24 w-24 rounded-full bg-sky-400/[0.14] blur-3xl" />
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800 dark:bg-accent/[0.14] dark:text-accent-foreground">
              <Waves className="h-3.5 w-3.5" />
              Skill coverage
            </div>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs tracking-wide text-muted-foreground uppercase">
                  <span>I Have</span>
                  <span>{offeredSkills.length}</span>
                </div>
                <Progress
                  value={
                    skills.length === 0
                      ? 0
                      : (offeredSkills.length / skills.length) * 100
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs tracking-wide text-muted-foreground uppercase">
                  <span>I Need</span>
                  <span>{wantedSkills.length}</span>
                </div>
                <Progress
                  value={
                    skills.length === 0
                      ? 0
                      : (wantedSkills.length / skills.length) * 100
                  }
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="animate-fade-up-2 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Co-builders Matched"
          value={activeMatches.length}
          icon={Users2}
          trend="2 new"
          trendUp
          color="blue"
        />
        <StatCard
          label="Build Sessions"
          value={user?.totalSessions ?? completedSessions.length}
          icon={CalendarClock}
          trend="this month"
          trendUp
          color="teal"
        />
        <StatCard
          label="Average Rating"
          value={user?.rating ? `${user.rating}` : "-"}
          icon={Star}
          trend="steady"
          trendUp
          color="amber"
        />
        <StatCard
          label="Skills Listed"
          value={skills.length}
          icon={BookOpen}
          trend={`${offeredSkills.length} offer - ${wantedSkills.length} want`}
          color="green"
        />
      </div>

      <div className="animate-fade-up-3 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="dashboard-card dashboard-card-hover dashboard-panel border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Your Co-builder Matches
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  People whose skills complement yours — potential collaborators.
                </p>
              </div>
              <Link
                to="/matches"
                className="flex h-8 items-center gap-1 rounded-full border border-primary/20 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeMatches.slice(0, 3).map((match, index) => (
                <div
                  key={match.id}
                  className="dashboard-card-hover dashboard-panel rounded-2xl border border-border/60 bg-background/[0.55] p-4 backdrop-blur-sm"
                  style={{
                    animation: `fadeUp 0.55s ease-out ${index * 80}ms both`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={match.matchedUser.name}
                      avatar={match.matchedUser.avatar}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">
                          {match.matchedUser.name}
                        </p>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                          {match.compatibilityScore}% match
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {match.matchedSkills.offer.slice(0, 2).map((skill) => (
                          <SkillBadge
                            key={skill}
                            skill={skill}
                            type="offer"
                            size="sm"
                          />
                        ))}
                        {match.matchedSkills.want.slice(0, 1).map((skill) => (
                          <SkillBadge
                            key={skill}
                            skill={skill}
                            type="want"
                            size="sm"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={match.compatibilityScore}
                    className="mt-3 h-1.5"
                  />
                </div>
              ))}
              {activeMatches.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No active matches yet. Complete your profile to find matches.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="dashboard-card dashboard-card-hover dashboard-panel border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Upcoming Build Sessions
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Scheduled collaboration sessions with your co-builders.
                </p>
              </div>
              <Link
                to="/sessions"
                className="flex h-8 items-center gap-1 rounded-full border border-primary/20 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingSessions.map((session, index) => {
                const cfg = statusConfig[session.status]
                const StatusIcon = cfg.icon

                return (
                  <div
                    key={session.id}
                    className="dashboard-card-hover dashboard-panel rounded-2xl border border-border/60 bg-background/[0.6] p-4 backdrop-blur-sm"
                    style={{
                      animation: `fadeUp 0.55s ease-out ${index * 90}ms both`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={session.participant.name}
                        avatar={session.participant.avatar}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">
                            {session.topic}
                          </p>
                          <Badge
                            variant="outline"
                            className={`shrink-0 border text-xs ${cfg.color}`}
                          >
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          with {session.participant.name} -{" "}
                          {format(new Date(session.date), "MMM d, h:mm a")} -{" "}
                          {session.duration}min
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              {upcomingSessions.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No sessions scheduled.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="dashboard-card dashboard-card-hover dashboard-panel glow-sweep border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Zap className="h-4 w-4 text-accent" />
                Profile Strength
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-primary/[0.08] px-3 py-3">
                <div>
                  <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                    Completion
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-primary">
                    {completionPct}%
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/[0.15] text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <Progress value={completionPct} className="h-2" />
              <div className="space-y-2 pt-1">
                {completionItems.map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <CheckCircle2
                      className={`h-3.5 w-3.5 ${done ? "text-emerald-500" : "text-muted-foreground/40"}`}
                    />
                    <span
                      className={
                        done ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card dashboard-card-hover dashboard-panel border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">
                My Skills
              </CardTitle>
              <Link
                to="/profile"
                className="flex h-8 items-center gap-1 rounded-full border border-primary/20 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-background/[0.5] p-3">
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  I Have
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {offeredSkills.map((skill) => (
                    <SkillBadge
                      key={skill.id}
                      skill={skill.skillName}
                      type="offer"
                      level={skill.level}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-background/[0.5] p-3">
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  I Need
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {wantedSkills.map((skill) => (
                    <SkillBadge
                      key={skill.id}
                      skill={skill.skillName}
                      type="want"
                      level={skill.level}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card dashboard-card-hover dashboard-panel border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                My Collaborator Rating
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent/[0.15] text-3xl font-bold text-accent-foreground">
                {user?.rating ?? "-"}
              </div>
              <div>
                <StarRating
                  value={Math.round(user?.rating ?? 0)}
                  readonly
                  size="sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on {user?.totalSessions ?? completedSessions.length}{" "}
                  build sessions
                </p>
              </div>
            </CardContent>
          </Card>

          {recentActivity.length > 0 && (
            <Card className="dashboard-card dashboard-card-hover dashboard-panel border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Activity className="h-4 w-4 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-2.5">
                      <div className={`mt-0.5 shrink-0 ${item.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium leading-snug">{item.text}</p>
                        {item.sub && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.sub}</p>}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
