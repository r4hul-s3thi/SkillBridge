import { MessageSquare, UserPlus, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { StarRating } from '@/components/shared/StarRating';
import { useAppStore } from '@/store/appStore';
import { matchService } from '@/services/matchService';
import { toast } from 'sonner';
import type { Match } from '@/types';

function MatchCard({ match }: { match: Match }) {
  const navigate = useNavigate();
  const { updateMatchStatus } = useAppStore();

  const handleConnect = async () => {
    try {
      await matchService.updateMatchStatus(match.id, 'active');
    } catch {
      // fall through
    }
    updateMatchStatus(match.id, 'active');
    toast.success(`Connected with ${match.matchedUser.name}!`);
  };

  const handleMessage = () => {
    navigate('/messages');
  };

  const scoreColor =
    match.compatibilityScore >= 90 ? 'text-green-600' :
    match.compatibilityScore >= 75 ? 'text-primary' :
    'text-amber-600';

  return (
    <Card className="border border-border/60 shadow-xs hover:shadow-sm transition-all group">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <UserAvatar name={match.matchedUser.name} avatar={match.matchedUser.avatar} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm">{match.matchedUser.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{match.matchedUser.location}</p>
                <StarRating value={Math.round(match.matchedUser.rating)} readonly size="sm" />
              </div>
              <div className="text-right shrink-0">
                <span className={`text-lg font-bold ${scoreColor}`}>{match.compatibilityScore}%</span>
                <p className="text-xs text-muted-foreground">match</p>
              </div>
            </div>

            {match.matchedUser.bio && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{match.matchedUser.bio}</p>
            )}

            {/* Compatibility bar */}
            <div className="mt-3">
              <Progress value={match.compatibilityScore} className="h-1.5" />
            </div>

            {/* Skills exchange */}
            <div className="mt-3 space-y-1.5">
              {match.matchedSkills.want.length === 0 && match.matchedSkills.offer.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Add skills to your profile to see skill overlap.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground shrink-0">teaches:</span>
                    {match.matchedSkills.want.map((s) => (
                      <SkillBadge key={s} skill={s} type="offer" size="sm" />
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground shrink-0">wants to learn:</span>
                    {match.matchedSkills.offer.map((s) => (
                      <SkillBadge key={s} skill={s} type="want" size="sm" />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              {match.status !== 'active' ? (
                <Button size="sm" className="h-7 text-xs" onClick={handleConnect}>
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Connect
                </Button>
              ) : (
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                  Connected
                </Badge>
              )}
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleMessage}>
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Matches() {
  const { matches, skills } = useAppStore();
  const activeMatches = matches.filter((m) => m.status === 'active');
  const pendingMatches = matches.filter((m) => m.status === 'pending');
  const hasSkills = skills.length > 0;

  // Matches with no skill overlap — show as suggestions
  const suggestedMatches = pendingMatches.filter(
    (m) => m.matchedSkills.offer.length === 0 && m.matchedSkills.want.length === 0
  );
  const realPendingMatches = pendingMatches.filter(
    (m) => m.matchedSkills.offer.length > 0 || m.matchedSkills.want.length > 0
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Smart Matches
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Users intelligently matched based on your skill exchange profile.
        </p>
      </div>

      {!hasSkills && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          Add skills on your <a href="/profile" className="underline font-medium">Profile</a> to unlock skill-based matching.
        </div>
      )}

      <Tabs defaultValue={activeMatches.length > 0 ? 'active' : suggestedMatches.length > 0 ? 'suggested' : 'pending'}>
        <TabsList className="h-8">
          <TabsTrigger value="active" className="text-xs">
            Active <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{activeMatches.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">
            Pending <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{realPendingMatches.length}</Badge>
          </TabsTrigger>
          {suggestedMatches.length > 0 && (
            <TabsTrigger value="suggested" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Suggested <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{suggestedMatches.length}</Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
            {activeMatches.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2 py-8 text-center">
                No active matches yet. Send a request to connect with someone.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {realPendingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
            {realPendingMatches.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2 py-8 text-center">
                No skill-based matches yet. Add skills to your profile to get matched.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="suggested" className="mt-4">
          <p className="text-xs text-muted-foreground mb-4">
            These users are on SkillSwap. Add skills to your profile to see how well you match — or send a request now!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
