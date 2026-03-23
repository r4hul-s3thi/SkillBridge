import { useState } from 'react';
import { Star, Send } from 'lucide-react';
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

export default function Ratings() {
  const { ratings, setRatings, matches, sessions } = useAppStore();
  const { user } = useAuthStore();
  const [ratingForm, setRatingForm] = useState({ toUserId: '', rating: 0, feedback: '' });
  const [submitting, setSubmitting] = useState(false);

  // Users from completed sessions that haven't been rated
  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const ratedUserIds = ratings.map((r) => r.fromUser.id === user?.id ? r.toUserId : null).filter(Boolean);
  void completedSessions;
  void ratedUserIds;

  const handleSubmit = async () => {
    if (!ratingForm.toUserId || ratingForm.rating === 0) {
      toast.error('Please select a user and give a rating');
      return;
    }
    setSubmitting(true);
    try {
      const res = await ratingService.submitRating(
        parseInt(ratingForm.toUserId),
        ratingForm.rating,
        ratingForm.feedback
      );
      setRatings([...ratings, res.data]);
    } catch (err: unknown) {
      type ApiError = { response?: { data?: { message?: string } } };
      const message = (err as ApiError).response?.data?.message ?? 'Failed to submit rating';
      toast.error(message);
      setSubmitting(false);
      return;
    }
    setRatingForm({ toUserId: '', rating: 0, feedback: '' });
    toast.success('Rating submitted successfully!');
    setSubmitting(false);
  };

  const receivedRatings = ratings.filter((r) => r.toUserId === user?.id);
  const avgRating = receivedRatings.length
    ? (receivedRatings.reduce((s, r) => s + r.rating, 0) / receivedRatings.length).toFixed(1)
    : '—';

  const allRatableUsers = matches.map((m) => m.matchedUser);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          Ratings & Feedback
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Rate your peers and view feedback received.
        </p>
      </div>

      <Tabs defaultValue="rate">
        <TabsList className="h-8">
          <TabsTrigger value="rate" className="text-xs">Rate Someone</TabsTrigger>
          <TabsTrigger value="received" className="text-xs">
            Received ({receivedRatings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rate" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Form */}
            <Card className="border border-border/60 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Rate Your Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Select User</Label>
                  <Select
                    value={ratingForm.toUserId}
                    onValueChange={(v) => setRatingForm((p) => ({ ...p, toUserId: v ?? '' }))}
                  >
                    <SelectTrigger className="h-9 text-sm">
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
                  <Label className="text-sm font-medium">Your Rating</Label>
                  <StarRating
                    value={ratingForm.rating}
                    onChange={(v) => setRatingForm((p) => ({ ...p, rating: v }))}
                    size="lg"
                  />
                  {ratingForm.rating > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][ratingForm.rating]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Feedback (optional)</Label>
                  <Textarea
                    placeholder="Share your experience with this peer..."
                    value={ratingForm.feedback}
                    onChange={(e) => setRatingForm((p) => ({ ...p, feedback: e.target.value }))}
                    className="resize-none text-sm"
                    rows={4}
                  />
                </div>

                <Button
                  className="w-full h-9"
                  onClick={handleSubmit}
                  disabled={submitting || ratingForm.rating === 0 || !ratingForm.toUserId}
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  {submitting ? 'Submitting...' : 'Submit Rating'}
                </Button>
              </CardContent>
            </Card>

            {/* My Stats */}
            <Card className="border border-border/60 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">My Rating Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-foreground">{avgRating}</p>
                  <StarRating value={Math.round(Number(avgRating) || 0)} readonly size="lg" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {receivedRatings.length} rating{receivedRatings.length !== 1 ? 's' : ''} received
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = receivedRatings.filter((r) => r.rating === star).length;
                    const pct = receivedRatings.length ? (count / receivedRatings.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-sm">
                        <span className="text-xs text-muted-foreground w-4">{star}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-4">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="received" className="mt-4">
          <div className="space-y-3">
            {receivedRatings.map((rating) => (
              <RatingCard key={rating.id} rating={rating} />
            ))}
            {receivedRatings.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No ratings received yet. Complete some sessions to get feedback!
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RatingCard({ rating }: { rating: Rating }) {
  return (
    <Card className="border border-border/60 shadow-xs">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <UserAvatar name={rating.fromUser.name} avatar={rating.fromUser.avatar} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm">{rating.fromUser.name}</p>
              <span className="text-xs text-muted-foreground">{format(new Date(rating.createdAt), 'MMM d, yyyy')}</span>
            </div>
            <StarRating value={rating.rating} readonly size="sm" />
            {rating.feedback && (
              <p className="text-sm text-muted-foreground mt-1.5 italic">"{rating.feedback}"</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
