import { useEffect, useState } from 'react';
import { Trophy, Medal, Star, BookOpen, CalendarClock, Crown, TrendingUp, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { leaderboardService } from '@/services/leaderboardService';
import { useAuthStore } from '@/store/authStore';

interface LeaderEntry {
  id: number;
  name: string;
  avatar?: string;
  location?: string;
  rating: number;
  totalSessions: number;
  skillCount: number;
  score: number;
}

const podiumConfig = [
  { icon: Crown, color: 'text-yellow-500', ring: 'ring-yellow-400/60', bg: 'from-yellow-500/20 to-amber-500/10', label: '1st', size: 'lg' as const },
  { icon: Medal, color: 'text-slate-400', ring: 'ring-slate-400/50', bg: 'from-slate-400/15 to-slate-300/5', label: '2nd', size: 'md' as const },
  { icon: Medal, color: 'text-amber-600', ring: 'ring-amber-500/50', bg: 'from-amber-600/15 to-amber-400/5', label: '3rd', size: 'md' as const },
];

export default function Leaderboard() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaderboardService.get()
      .then((r) => setEntries(r.data))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const myRank = entries.findIndex((e) => e.id === user?.id) + 1;
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/15 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Top collaborators ranked by sessions completed and rating.</p>
        </div>
        {myRank > 0 && (
          <div className="text-center px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 w-fit">
            <p className="text-xl font-bold text-primary">#{myRank}</p>
            <p className="text-xs text-muted-foreground">Your rank</p>
          </div>
        )}
      </div>

      {myRank > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <Zap className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm">You are ranked <span className="font-bold text-primary">#{myRank}</span> — complete more collaboration sessions to climb higher!</span>
        </div>
      )}

      {loading && (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
        </div>
      )}

      {/* Podium top 3 */}
      {!loading && top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {top3.map((entry, i) => {
            const cfg = podiumConfig[i];
            const RankIcon = cfg.icon;
            return (
              <div key={entry.id} className={`dashboard-card dashboard-panel rounded-[22px] border-0 p-4 text-center bg-gradient-to-b ${cfg.bg} ${i === 0 ? 'scale-105 shadow-lg' : ''}`}>
                <div className="flex justify-center mb-3">
                  <div className={`relative ring-2 ${cfg.ring} rounded-full`}>
                    <UserAvatar name={entry.name} avatar={entry.avatar} size={i === 0 ? 'xl' : 'lg'} />
                    <span className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-background border-2 border-border`}>
                      {i + 1}
                    </span>
                  </div>
                </div>
                <RankIcon className={`w-5 h-5 mx-auto mb-1.5 ${cfg.color}`} />
                <p className="font-bold text-sm truncate">{entry.name}</p>
                <p className="text-xs text-muted-foreground truncate mb-2">{entry.location ?? '—'}</p>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-semibold">{entry.rating.toFixed(1)}</span>
                </div>
                <Badge className="text-xs bg-primary/15 text-primary border-primary/20 border">
                  {entry.score} pts
                </Badge>
                <div className="flex justify-center gap-3 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" />{entry.totalSessions}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{entry.skillCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rest of rankings */}
      {!loading && rest.length > 0 && (
        <div className="dashboard-card dashboard-panel rounded-[22px] border-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-border/40 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Full Rankings</span>
          </div>
          {rest.map((entry, i) => {
            const rank = i + 4;
            const isMe = entry.id === user?.id;
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-5 py-3.5 border-b border-border/30 last:border-0 transition-colors ${isMe ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
              >
                <span className="w-7 text-center text-sm font-bold text-muted-foreground shrink-0">#{rank}</span>
                <UserAvatar name={entry.name} avatar={entry.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate flex items-center gap-1.5">
                    {entry.name}
                    {isMe && <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-primary border-primary/30">You</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.location ?? '—'}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{entry.rating.toFixed(1)}</span>
                  <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" />{entry.totalSessions}</span>
                  <Badge variant="secondary" className="text-xs">{entry.score} pts</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="py-16 text-center">
          <Trophy className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No data yet. Complete sessions to appear here!</p>
        </div>
      )}
    </div>
  );
}
