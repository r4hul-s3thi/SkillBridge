import { useState } from 'react';
import { Star, Send, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { StarRating } from '@/components/shared/StarRating';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { ratingService } from '@/services/ratingService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Rating } from '@/types';

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
const ratingColors = ['', 'text-rose-500', 'text-orange-500', 'text-amber-500', 'text-lime-500', 'text-emerald-500'];

export default function Ratings() {
  const { ratings, setRatings, matches } = useAppStore();
  const { user } = useAuthStore();
  const [ratingForm, setRatingForm] = useState({ toUserId: '', rating: 0, feedback: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!ratingForm.toUserId || ratingForm.rating === 0) {
      toast.error('Please select a user and give a rating');
      return;
    }
    setSubmitting(true);
    try {
      const res = await ratingService.submitRating(parseInt(ratingForm.toUserId), ratingForm.rating, ratingForm.feedback);
      setRatings([...ratings, res.data]);
      setRatingForm({ toUserId: '', rating: 0, feedback: '' });
      toast.success('Rating submitted! ⭐');
    } catch (err: unknown) {
      type ApiError = { response?: { data?: { message?: string } } };
      toast.error((err as ApiError).response?.data?.message ?? 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const receivedRatings = ratings.filter((r) => r.toUserId === user?.id);
  const avgRating = receivedRatings.length
    ? (receivedRatings.reduce((s, r) => s + r.rating, 0) / receivedRatings.length).toFixed(1)
    : '—';
  const allRatableUsers = matches.map((m) => m.matchedUser);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            Ratings & Feedback
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Rate your collaborators and view feedback received.</p>
        </div>
        {receivedRatings.length > 0 && (
          <div className="text-center px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-200/50 dark:border-amber-800/30 w-fit">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{avgRating}</p>
            <p className="text-xs text-muted-foreground">Avg rating</p>
          </div>
        )}
      </div>

      <Tabs defaultValue="rate">
        <TabsList className="h-9 rounded-xl">
          <TabsTrigger value="rate" className="text-xs rounded-lg">Rate Someone</TabsTrigger>
          <TabsTrigger value="received" className="text-xs rounded-lg">
            Received ({receivedRatings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rate" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Rating Form */}
            <div className="dashboard-card dashboard-panel rounded-[22px] border-0 p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Rate Your Experience</h3>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Select Peer</Label>
                <Select value={ratingForm.toUserId} onValueChange={(v) => setRatingForm((p) => ({ ...p, toUserId: v ?? '' }))}>
                  <SelectTrigger className="h-10 text-sm rounded-xl">
                    <SelectValue placeholder="Choose a peer to rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {allRatableUsers.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)} className="text-sm">
                        <div className="flex items-center gap-2">
                          <UserAvatar name={u.name} avatar={u.avatar} size="sm" />
                          {u.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Rating</Label>
                <div className="bg-muted/40 rounded-xl p-3 flex flex-col items-center gap-2">
                  <StarRating value={ratingForm.rating} onChange={(v) => setRatingForm((p) => ({ ...p, rating: v }))} size="lg" />
                  {ratingForm.rating > 0 && (
                    <span className={`text-sm font-semibold ${ratingColors[ratingForm.rating]}`}>
                      {ratingLabels[ratingForm.rating]}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Feedback (optional)</Label>
                <Textarea
                  placeholder="Share your experience with this peer..."
                  value={ratingForm.feedback}
                  onChange={(e) => setRatingForm((p) => ({ ...p, feedback: e.target.value }))}
                  className="resize-none text-sm rounded-xl"
                  rows={3}
                />
              </div>

              <Button
                className="w-full h-10 rounded-xl"
                onClick={handleSubmit}
                disabled={submitting || ratingForm.rating === 0 || !ratingForm.toUserId}
              >
                <Send className="w-4 h-4 mr-1.5" />
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </div>

            {/* Stats */}
            <div className="dashboard-card dashboard-panel rounded-[22px] border-0 p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">My Rating Stats</h3>
              </div>

              <div className="text-center py-4 bg-gradient-to-b from-amber-500/10 to-transparent rounded-xl">
                <p className="text-5xl font-bold">{avgRating}</p>
                <StarRating value={Math.round(Number(avgRating) || 0)} readonly size="lg" />
                <p className="text-sm text-muted-foreground mt-1">
                  {receivedRatings.length} rating{receivedRatings.length !== 1 ? 's' : ''} received
                </p>
              </div>

              <Separator />

              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = receivedRatings.filter((r) => r.rating === star).length;
                  const pct = receivedRatings.length ? (count / receivedRatings.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-muted-foreground w-3">{star}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="received" className="mt-5 space-y-3">
          {receivedRatings.map((rating) => <RatingCard key={rating.id} rating={rating} />)}
          {receivedRatings.length === 0 && (
            <div className="py-16 text-center">
              <Star className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No ratings yet. Complete sessions to get feedback!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RatingCard({ rating }: { rating: Rating }) {
  return (
    <div className="dashboard-card dashboard-card-hover dashboard-panel rounded-[20px] border-0 p-4">
      <div className="flex items-start gap-3">
        <UserAvatar name={rating.fromUser.name} avatar={rating.fromUser.avatar} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm">{rating.fromUser.name}</p>
            <span className="text-xs text-muted-foreground">{format(new Date(rating.createdAt), 'MMM d, yyyy')}</span>
          </div>
          <StarRating value={rating.rating} readonly size="sm" />
          {rating.feedback && (
            <p className="text-sm text-muted-foreground mt-2 italic bg-muted/40 rounded-xl px-3 py-2">
              "{rating.feedback}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
