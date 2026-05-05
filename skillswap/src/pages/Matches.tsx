import { useState } from 'react';
import { MessageSquare, UserPlus, TrendingUp, Sparkles, Search, MapPin, Star, Zap, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { useAppStore } from '@/store/appStore';
import { usePresenceStore } from '@/store/presenceStore';
import { matchService } from '@/services/matchService';
import { toast } from 'sonner';
import type { Match } from '@/types';

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? 'from-emerald-400 to-teal-500' : score >= 75 ? 'from-cyan-400 to-blue-500' : 'from-amber-400 to-orange-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold text-foreground shrink-0">{score}%</span>
    </div>
  )
}

function MatchCard({ match }: { match: Match }) {
  const navigate = useNavigate();
  const { updateMatchStatus } = useAppStore();
  const { isOnline } = usePresenceStore();
  const online = isOnline(match.matchedUser.id);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try { await matchService.updateMatchStatus(match.id, 'active'); } catch {}
    updateMatchStatus(match.id, 'active');
    toast.success(`Connected with ${match.matchedUser.name}! 🎉`);
    setConnecting(false);
  };

  const hasSkills = match.matchedSkills.offer.length > 0 || match.matchedSkills.want.length > 0;

  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 hover:shadow-primary/5">
      {/* Online indicator */}
      {online && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pr-16">
        <div className="relative shrink-0">
          <UserAvatar name={match.matchedUser.name} avatar={match.matchedUser.avatar} size="lg" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm">{match.matchedUser.name}</h3>
          {match.matchedUser.location && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />{match.matchedUser.location}
            </p>
          )}
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold">{match.matchedUser.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">· {match.matchedUser.totalSessions} sessions</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {match.matchedUser.bio && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 bg-muted/40 rounded-xl px-3 py-2 border border-border/40">
          {match.matchedUser.bio}
        </p>
      )}

      {/* Compatibility */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Compatibility</span>
        </div>
        <ScoreBar score={match.compatibilityScore} />
      </div>

      {/* Skills overlap */}
      {hasSkills && (
        <div className="space-y-2">
          {match.matchedSkills.want.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 w-12">Has:</span>
              {match.matchedSkills.want.slice(0, 3).map((s) => <SkillBadge key={s} skill={s} type="offer" size="sm" />)}
            </div>
          )}
          {match.matchedSkills.offer.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 w-12">Needs:</span>
              {match.matchedSkills.offer.slice(0, 3).map((s) => <SkillBadge key={s} skill={s} type="want" size="sm" />)}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {match.status !== 'active' ? (
          <Button
            size="sm"
            className="h-9 text-xs flex-1 rounded-xl font-semibold"
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? (
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />Connecting...</span>
            ) : (
              <span className="flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5" />Connect</span>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-3 py-2 flex-1 justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" /> Connected
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs rounded-xl"
          onClick={() => navigate('/messages')}
        >
          <MessageSquare className="w-3.5 h-3.5" />
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
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            Smart Matches
          </h1>
          <p className="text-sm text-muted-foreground mt-1">People with complementary skills — your potential co-builders.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="text-center px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-lg font-bold text-primary">{activeMatches.length}</p>
            <p className="text-[11px] text-muted-foreground">Active</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-200/50 dark:border-amber-800/30">
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{pendingMatches.length}</p>
            <p className="text-[11px] text-muted-foreground">Suggested</p>
          </div>
        </div>
      </div>

      {!hasSkills && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/50 px-4 py-3.5">
          <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Add skills to unlock matches</p>
            <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5">
              Go to <a href="/profile" className="underline font-semibold">Profile</a> and add what you know and what you need — the system will find your co-builders.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <Input
          placeholder="Search by name, location, or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl text-sm bg-card border-border/60"
        />
      </div>

      <Tabs defaultValue={activeMatches.length > 0 ? 'active' : 'pending'}>
        <TabsList className="h-10 rounded-xl p-1 bg-muted/60">
          <TabsTrigger value="active" className="rounded-lg text-xs font-semibold px-4">
            Connected
            {filter(activeMatches).length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1.5 bg-primary/15 text-primary border-0">
                {filter(activeMatches).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg text-xs font-semibold px-4">
            <Sparkles className="w-3 h-3 mr-1" />Suggested
            {filter(pendingMatches).length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1.5 bg-amber-500/15 text-amber-600 border-0">
                {filter(pendingMatches).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filter(activeMatches).map((m) => <MatchCard key={m.id} match={m} />)}
            {filter(activeMatches).length === 0 && (
              <div className="col-span-2 py-16 text-center rounded-2xl border border-dashed border-border/60">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <TrendingUp className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">{search ? 'No matches found for that search.' : 'No active co-builders yet.'}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Connect with someone from the Suggested tab</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filter(pendingMatches).map((m) => <MatchCard key={m.id} match={m} />)}
            {filter(pendingMatches).length === 0 && (
              <div className="col-span-2 py-16 text-center rounded-2xl border border-dashed border-border/60">
                <p className="text-sm text-muted-foreground">{search ? 'No matches found.' : 'No suggestions yet. Add more skills to get matched.'}</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
