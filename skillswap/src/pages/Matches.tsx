import { useState } from 'react';
import { MessageSquare, UserPlus, TrendingUp, Sparkles, Search, MapPin, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { useAppStore } from '@/store/appStore';
import { usePresenceStore } from '@/store/presenceStore';
import { matchService } from '@/services/matchService';
import { toast } from 'sonner';
import type { Match } from '@/types';

function ScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? '#2ac7b6' : score >= 75 ? '#6366f1' : '#f4b942';
  const r = 20, c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-border/40" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{score}%</span>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const navigate = useNavigate();
  const { updateMatchStatus } = useAppStore();
  const { isOnline } = usePresenceStore();
  const online = isOnline(match.matchedUser.id);

  const handleConnect = async () => {
    try { await matchService.updateMatchStatus(match.id, 'active'); } catch {}
    updateMatchStatus(match.id, 'active');
    toast.success(`Connected with ${match.matchedUser.name}!`);
  };

  return (
    <div className="dashboard-card dashboard-card-hover dashboard-panel rounded-[22px] border-0 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <UserAvatar name={match.matchedUser.name} avatar={match.matchedUser.avatar} size="lg" />
          <span className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-background ${online ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-sm leading-tight">{match.matchedUser.name}</h3>
              {match.matchedUser.location && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3" />{match.matchedUser.location}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium">{match.matchedUser.rating.toFixed(1)}</span>
                <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${online ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                  {online ? '● Online' : '○ Offline'}
                </span>
              </div>
            </div>
            <ScoreRing score={match.compatibilityScore} />
          </div>
        </div>
      </div>

      {match.matchedUser.bio && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 bg-muted/40 rounded-xl px-3 py-2">
          {match.matchedUser.bio}
        </p>
      )}

      <Progress value={match.compatibilityScore} className="h-1.5" />

      {/* Skills */}
      <div className="space-y-2">
        {match.matchedSkills.want.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Teaches:</span>
            {match.matchedSkills.want.slice(0, 3).map((s) => <SkillBadge key={s} skill={s} type="offer" size="sm" />)}
          </div>
        )}
        {match.matchedSkills.offer.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Wants:</span>
            {match.matchedSkills.offer.slice(0, 3).map((s) => <SkillBadge key={s} skill={s} type="want" size="sm" />)}
          </div>
        )}
        {match.matchedSkills.want.length === 0 && match.matchedSkills.offer.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Add skills to see overlap</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {match.status !== 'active' ? (
          <Button size="sm" className="h-8 text-xs flex-1" onClick={handleConnect}>
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />Connect
          </Button>
        ) : (
          <Badge className="text-xs px-3 py-1.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 border">
            ✓ Connected
          </Badge>
        )}
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate('/messages')}>
          <MessageSquare className="w-3.5 h-3.5 mr-1.5" />Message
        </Button>
      </div>
    </div>
  );
}

export default function Matches() {
  const { matches, skills } = useAppStore();
  const [search, setSearch] = useState('');
  const hasSkills = skills.length > 0;

  const activeMatches = matches.filter((m) => m.status === 'active');
  const pendingMatches = matches.filter((m) => m.status === 'pending');

  const filter = (list: Match[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (m) =>
        m.matchedUser.name.toLowerCase().includes(q) ||
        m.matchedUser.location?.toLowerCase().includes(q) ||
        m.matchedSkills.offer.some((s) => s.toLowerCase().includes(q)) ||
        m.matchedSkills.want.some((s) => s.toLowerCase().includes(q))
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="dashboard-card dashboard-panel rounded-[24px] border-0 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              Smart Matches
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Intelligently matched based on your skill exchange profile.</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 rounded-xl bg-primary/10">
              <p className="text-xl font-bold text-primary">{activeMatches.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-amber-500/10">
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{pendingMatches.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {!hasSkills && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Add skills on your <a href="/profile" className="underline font-semibold">Profile</a> to unlock skill-based matching.
          </p>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
        <Input
          placeholder="Search by name, location, or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 rounded-xl text-sm"
        />
      </div>

      <Tabs defaultValue={activeMatches.length > 0 ? 'active' : 'pending'}>
        <TabsList className="h-9 rounded-xl">
          <TabsTrigger value="active" className="text-xs rounded-lg">
            Active
            <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{filter(activeMatches).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs rounded-lg">
            <Sparkles className="w-3 h-3 mr-1" />Suggested
            <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{filter(pendingMatches).length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filter(activeMatches).map((m) => <MatchCard key={m.id} match={m} />)}
            {filter(activeMatches).length === 0 && (
              <div className="col-span-2 py-16 text-center">
                <Users className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">{search ? 'No matches found.' : 'No active matches yet. Connect with someone!'}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filter(pendingMatches).map((m) => <MatchCard key={m.id} match={m} />)}
            {filter(pendingMatches).length === 0 && (
              <div className="col-span-2 py-16 text-center">
                <p className="text-sm text-muted-foreground">{search ? 'No matches found.' : 'No pending matches.'}</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return <TrendingUp className={className} />;
}
