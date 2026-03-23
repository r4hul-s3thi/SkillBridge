import { Users2, CalendarClock, Star, BookOpen, ArrowRight, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/shared/StatCard';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { StarRating } from '@/components/shared/StarRating';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { format } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800' },
  accepted: { label: 'Confirmed', icon: CheckCircle2, color: 'text-green-600 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-muted-foreground bg-muted border-border' },
  rejected: { label: 'Rejected', icon: Clock, color: 'text-destructive bg-destructive/10 border-destructive/20' },
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const { matches, sessions, skills } = useAppStore();

  const activeMatches = matches.filter((m) => m.status === 'active').slice(0, 4);
  const upcomingSessions = sessions.filter((s) => s.status === 'pending' || s.status === 'accepted').slice(0, 4);
  const offeredSkills = skills.filter((s) => s.type === 'offer');
  const wantedSkills = skills.filter((s) => s.type === 'want');
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const completionItems = [
    { label: 'Profile info', done: !!(user?.name && user?.email) },
    { label: 'Skills offered', done: offeredSkills.length > 0 },
    { label: 'Skills wanted', done: wantedSkills.length > 0 },
    { label: 'First session', done: completedSessions.length > 0 },
  ];
  const completionPct = Math.round((completionItems.filter((i) => i.done).length / completionItems.length) * 100);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}, {user?.name ?? 'there'} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here's what's happening with your learning journey today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Matches" value={activeMatches.length} icon={Users2} trend="2 new" trendUp color="blue" />
        <StatCard label="Total Sessions" value={user?.totalSessions ?? completedSessions.length} icon={CalendarClock} trend="this month" trendUp color="teal" />
        <StatCard label="Average Rating" value={user?.rating ? `${user.rating}★` : '—'} icon={Star} color="amber" />
        <StatCard label="Skills Listed" value={skills.length} icon={BookOpen} trend={`${offeredSkills.length} offer · ${wantedSkills.length} want`} color="green" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matches */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Your Matches</CardTitle>
              <Link to="/matches" className="flex items-center gap-1 text-xs text-primary h-7 px-2 hover:underline font-medium">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeMatches.slice(0, 3).map((match) => (
                <div
                  key={match.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors"
                >
                  <UserAvatar name={match.matchedUser.name} avatar={match.matchedUser.avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{match.matchedUser.name}</p>
                      <span className="text-xs font-semibold text-primary shrink-0">{match.compatibilityScore}% match</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {match.matchedSkills.offer.slice(0, 2).map((s) => (
                        <SkillBadge key={s} skill={s} type="offer" size="sm" />
                      ))}
                      {match.matchedSkills.want.slice(0, 1).map((s) => (
                        <SkillBadge key={s} skill={s} type="want" size="sm" />
                      ))}
                    </div>
                    <Progress value={match.compatibilityScore} className="h-1 mt-2" />
                  </div>
                </div>
              ))}
              {activeMatches.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No active matches yet. Complete your profile to find matches.</p>
              )}
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Upcoming Sessions</CardTitle>
              <Link to="/sessions" className="flex items-center gap-1 text-xs text-primary h-7 px-2 hover:underline font-medium">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingSessions.map((session) => {
                const cfg = statusConfig[session.status];
                const StatusIcon = cfg.icon;
                return (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60">
                    <UserAvatar name={session.participant.name} avatar={session.participant.avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{session.topic}</p>
                        <Badge variant="outline" className={`text-xs border ${cfg.color} shrink-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        with {session.participant.name} · {format(new Date(session.date), 'MMM d, h:mm a')} · {session.duration}min
                      </p>
                    </div>
                  </div>
                );
              })}
              {upcomingSessions.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No sessions scheduled.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Profile Completion */}
          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Profile Strength
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completion</span>
                <span className="text-sm font-semibold text-primary">{completionPct}%</span>
              </div>
              <Progress value={completionPct} className="h-2" />
              <div className="space-y-1.5 pt-1">
                {completionItems.map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${done ? 'text-green-500' : 'text-muted-foreground/40'}`} />
                    <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* My Skills Summary */}
          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">My Skills</CardTitle>
              <Link to="/profile" className="flex items-center gap-1 text-xs text-primary h-7 px-2 hover:underline font-medium">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">I Offer</p>
                <div className="flex flex-wrap gap-1.5">
                  {offeredSkills.map((s) => (
                    <SkillBadge key={s.id} skill={s.skillName} type="offer" level={s.level} size="sm" />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">I Want</p>
                <div className="flex flex-wrap gap-1.5">
                  {wantedSkills.map((s) => (
                    <SkillBadge key={s.id} skill={s.skillName} type="want" level={s.level} size="sm" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Rating */}
          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">My Rating</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <div className="text-3xl font-bold text-foreground">{user?.rating ?? '—'}</div>
              <div>
                <StarRating value={Math.round(user?.rating ?? 0)} readonly size="sm" />
                <p className="text-xs text-muted-foreground mt-1">Based on {user?.totalSessions ?? completedSessions.length} sessions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
