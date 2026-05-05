import { useState } from 'react';
import { CalendarClock, CheckCircle2, XCircle, Clock, Plus, Video, Timer } from 'lucide-react';
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

const statusConfig: Record<SessionStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string; dot: string }> = {
  pending:   { label: 'Pending',   icon: Clock,         className: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',   dot: 'bg-amber-500' },
  accepted:  { label: 'Confirmed', icon: CheckCircle2,  className: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800', dot: 'bg-emerald-500' },
  rejected:  { label: 'Rejected',  icon: XCircle,       className: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-800',         dot: 'bg-rose-500' },
  completed: { label: 'Completed', icon: CheckCircle2,  className: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-700',    dot: 'bg-slate-400' },
};

function SessionCard({ session, onAccept, onReject, onComplete }: {
  session: Session;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onComplete?: (id: number) => void;
}) {
  const cfg = statusConfig[session.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="dashboard-card dashboard-card-hover dashboard-panel rounded-[20px] border-0 p-4">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <UserAvatar name={session.participant.name} avatar={session.participant.avatar} size="md" />
          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${cfg.dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{session.topic}</p>
              <p className="text-xs text-muted-foreground">with {session.participant.name}</p>
            </div>
            <Badge variant="outline" className={`text-xs border shrink-0 ${cfg.className}`}>
              <StatusIcon className="w-3 h-3 mr-1" />{cfg.label}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs bg-muted/60 rounded-lg px-2 py-1">
              <CalendarClock className="w-3 h-3 text-primary" />
              {format(new Date(session.date), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1 text-xs bg-muted/60 rounded-lg px-2 py-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              {format(new Date(session.date), 'h:mm a')}
            </span>
            <span className="flex items-center gap-1 text-xs bg-muted/60 rounded-lg px-2 py-1">
              <Timer className="w-3 h-3 text-muted-foreground" />
              {session.duration} min
            </span>
          </div>

          {session.status === 'pending' && onAccept && onReject && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => onAccept(session.id)}>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Accept
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950" onClick={() => onReject(session.id)}>
                <XCircle className="w-3.5 h-3.5 mr-1" />Reject
              </Button>
            </div>
          )}
          {session.status === 'accepted' && onComplete && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="h-7 text-xs" onClick={() => onComplete(session.id)}>
                <Video className="w-3.5 h-3.5 mr-1" />Mark Complete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Sessions() {
  const { sessions, setSessions, matches } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ matchId: '', topic: '', duration: '60' });

  const updateStatus = async (id: number, status: SessionStatus) => {
    try { await sessionService.updateSessionStatus(id, status); } catch {}
    setSessions(sessions.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleAccept   = (id: number) => { updateStatus(id, 'accepted');  toast.success('Session accepted! 🎉'); };
  const handleReject   = (id: number) => { updateStatus(id, 'rejected');  toast.info('Session rejected.'); };
  const handleComplete = (id: number) => { updateStatus(id, 'completed'); toast.success('Session completed! 🎉'); };

  const handleSchedule = async () => {
    if (!form.matchId || !form.topic || !selectedDate) { toast.error('Please fill in all fields'); return; }
    const match = matches.find((m) => m.id === parseInt(form.matchId));
    if (!match) return;
    try {
      const res = await sessionService.createSession(match.id, selectedDate.toISOString(), form.topic, parseInt(form.duration));
      setSessions([...sessions, res.data]);
    } catch {
      setSessions([...sessions, { id: Date.now(), matchId: match.id, date: selectedDate.toISOString(), status: 'pending', participant: match.matchedUser, topic: form.topic, duration: parseInt(form.duration) }]);
    }
    setDialogOpen(false);
    setForm({ matchId: '', topic: '', duration: '60' });
    toast.success('Session request sent!');
  };

  const upcoming  = sessions.filter((s) => s.status === 'pending' || s.status === 'accepted');
  const completed = sessions.filter((s) => s.status === 'completed' || s.status === 'rejected');
  const sessionDates = sessions.map((s) => new Date(s.date));

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <CalendarClock className="w-4 h-4 text-primary" />
            </div>
            Sessions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule and manage your collaboration sessions.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-center px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-200/50 dark:border-amber-800/30">
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{upcoming.length}</p>
            <p className="text-[11px] text-muted-foreground">Upcoming</p>
          </div>
          <div className="text-center px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-800/30">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{completed.filter(s => s.status === 'completed').length}</p>
            <p className="text-[11px] text-muted-foreground">Done</p>
          </div>
          <Button size="sm" className="h-9 text-xs" onClick={() => setDialogOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />Schedule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* Calendar */}
        <Card className="dashboard-card border-0 shadow-none h-fit">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-primary" />Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ session: sessionDates }}
              modifiersClassNames={{ session: 'bg-primary/15 text-primary font-bold rounded-lg' }}
              className="rounded-xl w-full"
            />
          </CardContent>
        </Card>

        {/* Sessions list */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="upcoming">
            <TabsList className="h-9 rounded-xl mb-4">
              <TabsTrigger value="upcoming" className="text-xs rounded-lg">
                Upcoming <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{upcoming.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs rounded-lg">
                History <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{completed.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-3">
              {upcoming.map((s) => (
                <SessionCard key={s.id} session={s} onAccept={handleAccept} onReject={handleReject} onComplete={handleComplete} />
              ))}
              {upcoming.length === 0 && (
                <div className="py-16 text-center">
                  <CalendarClock className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No upcoming sessions. Schedule a build session!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-3">
              {completed.map((s) => <SessionCard key={s.id} session={s} />)}
              {completed.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-sm text-muted-foreground">No session history yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" />Schedule a Session
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Match</Label>
              <Select value={form.matchId} onValueChange={(v) => setForm((p) => ({ ...p, matchId: v ?? '' }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select a match" /></SelectTrigger>
                <SelectContent>
                  {matches.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)} className="text-sm">{m.matchedUser.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Topic</Label>
              <Input placeholder="e.g. React Hooks Deep Dive" value={form.topic} onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Duration</Label>
              <Select value={form.duration} onValueChange={(v) => setForm((p) => ({ ...p, duration: v ?? '60' }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['30', '45', '60', '90', '120'].map((d) => (
                    <SelectItem key={d} value={d} className="text-sm">{d} minutes</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Date</Label>
              <div className="flex justify-center border border-border/60 rounded-xl p-2">
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
