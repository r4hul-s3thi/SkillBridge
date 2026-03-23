import { useState } from 'react';
import { CalendarClock, CheckCircle2, XCircle, Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { useAppStore } from '@/store/appStore';
import { sessionService } from '@/services/sessionService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Session, SessionStatus } from '@/types';

const statusConfig: Record<SessionStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  pending: { label: 'Pending', icon: Clock, className: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800' },
  accepted: { label: 'Accepted', icon: CheckCircle2, className: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'text-destructive bg-destructive/10 border-destructive/20' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'text-muted-foreground bg-muted border-border' },
};

function SessionCard({ session, onAccept, onReject }: { session: Session; onAccept?: (id: number) => void; onReject?: (id: number) => void }) {
  const cfg = statusConfig[session.status];
  const StatusIcon = cfg.icon;

  return (
    <Card className="border border-border/60 shadow-xs hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <UserAvatar name={session.participant.name} avatar={session.participant.avatar} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm">{session.topic}</p>
                <p className="text-xs text-muted-foreground">with {session.participant.name}</p>
              </div>
              <Badge variant="outline" className={`text-xs border shrink-0 ${cfg.className}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {cfg.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{format(new Date(session.date), 'MMM d, yyyy')}</span>
              <span>·</span>
              <span>{format(new Date(session.date), 'h:mm a')}</span>
              <span>·</span>
              <span>{session.duration} min</span>
            </div>
            {session.status === 'pending' && onAccept && onReject && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="h-7 text-xs" onClick={() => onAccept(session.id)}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Accept
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => onReject(session.id)}>
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Sessions() {
  const { sessions, setSessions, matches } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ matchId: '', topic: '', duration: '60' });

  const updateStatus = async (id: number, status: SessionStatus) => {
    try {
      await sessionService.updateSessionStatus(id, status);
    } catch {
      // fall through
    }
    setSessions(sessions.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleAccept = (id: number) => {
    updateStatus(id, 'accepted');
    toast.success('Session accepted!');
  };

  const handleReject = (id: number) => {
    updateStatus(id, 'rejected');
    toast.info('Session rejected.');
  };

  const handleSchedule = async () => {
    if (!form.matchId || !form.topic || !selectedDate) {
      toast.error('Please fill in all fields');
      return;
    }
    const match = matches.find((m) => m.id === parseInt(form.matchId));
    if (!match) return;
    try {
      const res = await sessionService.createSession(
        match.id,
        selectedDate.toISOString(),
        form.topic,
        parseInt(form.duration)
      );
      setSessions([...sessions, res.data]);
    } catch {
      const newSession: Session = {
        id: Date.now(),
        matchId: match.id,
        date: selectedDate.toISOString(),
        status: 'pending',
        participant: match.matchedUser,
        topic: form.topic,
        duration: parseInt(form.duration),
      };
      setSessions([...sessions, newSession]);
    }
    setDialogOpen(false);
    setForm({ matchId: '', topic: '', duration: '60' });
    toast.success('Session request sent!');
  };

  const upcoming = sessions.filter((s) => s.status === 'pending' || s.status === 'accepted');
  const completed = sessions.filter((s) => s.status === 'completed' || s.status === 'rejected');

  const sessionDates = sessions.map((s) => new Date(s.date));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-primary" />
            Sessions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Schedule and manage your learning sessions.</p>
        </div>
        <Button size="sm" className="h-8 text-xs" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Schedule Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="border border-border/60 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ session: sessionDates }}
              modifiersClassNames={{ session: 'bg-primary/10 text-primary font-semibold rounded' }}
              className="rounded-lg"
            />
          </CardContent>
        </Card>

        {/* Sessions List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="upcoming">
            <TabsList className="h-8 mb-4">
              <TabsTrigger value="upcoming" className="text-xs">
                Upcoming <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{upcoming.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                History <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{completed.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-3">
              {upcoming.map((s) => (
                <SessionCard key={s.id} session={s} onAccept={handleAccept} onReject={handleReject} />
              ))}
              {upcoming.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">No upcoming sessions. Schedule one!</p>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-3">
              {completed.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
              {completed.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">No session history yet.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule a Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Match</Label>
              <Select value={form.matchId} onValueChange={(v) => setForm((p) => ({ ...p, matchId: v ?? '' }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select a match" />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)} className="text-sm">
                      {m.matchedUser.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Topic</Label>
              <Input
                placeholder="e.g. React Hooks Deep Dive"
                value={form.topic}
                onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Duration (minutes)</Label>
              <Select value={form.duration} onValueChange={(v) => setForm((p) => ({ ...p, duration: v ?? '60' }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['30', '45', '60', '90', '120'].map((d) => (
                    <SelectItem key={d} value={d} className="text-sm">{d} minutes</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Date</Label>
              <div className="flex justify-center border border-border/60 rounded-lg p-2">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSchedule}>Schedule Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
