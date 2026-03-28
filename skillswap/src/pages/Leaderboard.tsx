import { useEffect, useState } from 'react';
import { Trophy, Medal, Star, BookOpen, CalendarClock, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { StarRating } from '@/components/shared/StarRating';
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

const rankConfig = [
  { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/40', border: 'border-yellow-200 dark:border-yellow-800', label: '1st' },
  { icon: Medal, color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/40', border: 'border-slate-200 dark:border-slate-700', label: '2nd' },
  { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800', label: '3rd' },
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
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Top skill exchangers ranked by sessions completed and rating.
        </p>
      </div>

      {myRank > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm flex items-center gap-3">
          <Trophy className="w-4 h-4 text-primary shrink-0" />
          <span>You are ranked <span className="font-bold text-primary">#{myRank}</span> on the leaderboard!</span>
        </div>
      )}

      {loading && <p className="text-sm text-muted-foreground py-8 text-center">Loading leaderboard...</p>}

      {/* Top 3 podium */}
      {!loading && top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {top3.map((entry, i) => {
            const cfg = rankConfig[i];
            const RankIcon = cfg.icon;
            return (
              <Card key={entry.id} className={`border ${cfg.border} ${cfg.bg} text-center`}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-center">
                    <div className="relative">
                      <UserAvatar name={entry.name} avatar={entry.avatar} size="lg" />
                      <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-background border ${cfg.border}`}>
                        {i + 1}
                      </span>
                    </div>
                  </div>
                  <RankIcon className={`w-5 h-5 mx-auto ${cfg.color}`} />
                  <p className="font-semibold text-sm truncate">{entry.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{entry.location ?? '—'}</p>
                  <div className="flex justify-center">
                    <StarRating value={Math.round(entry.rating)} readonly size="sm" />
                  </div>
                  <Badge variant="secondary" className="text-xs">{entry.score} pts</Badge>
                  <div className="flex justify-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" />{entry.totalSessions}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{entry.skillCount}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Rest of leaderboard */}
      {!loading && rest.length > 0 && (
        <Card className="border border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Rankings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {rest.map((entry, i) => {
              const rank = i + 4;
              const isMe = entry.id === user?.id;
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 transition-colors ${isMe ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                >
                  <span className="w-6 text-center text-sm font-bold text-muted-foreground shrink-0">#{rank}</span>
                  <UserAvatar name={entry.name} avatar={entry.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate flex items-center gap-1.5">
                      {entry.name}
                      {isMe && <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-primary border-primary/30">You</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.location ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{entry.rating.toFixed(1)}</span>
                    <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" />{entry.totalSessions}</span>
                    <Badge variant="secondary" className="text-xs">{entry.score} pts</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {!loading && entries.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">No data yet. Complete sessions to appear here!</p>
      )}
    </div>
  );
}
