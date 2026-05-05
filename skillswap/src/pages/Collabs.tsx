import { useEffect, useState } from 'react';
import { Handshake, Plus, X, Send, CheckCircle2, XCircle, Trash2, ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { useAuthStore } from '@/store/authStore';
import { collabService } from '@/services/collabService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { CollabPost, CollabRequest } from '@/types';

const PROJECT_TYPES = ['Full Stack', 'Mobile App', 'AI/ML', 'DevOps', 'Design', 'Open Source', 'Startup', 'Other'];

function SkillTag({ skill, variant = 'have' }: { skill: string; variant?: 'have' | 'need' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
      variant === 'have'
        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800'
        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
    }`}>
      {variant === 'have' ? '✓' : '+'} {skill}
    </span>
  );
}

function RequestsPanel({ post, onClose }: { post: CollabPost; onClose: () => void }) {
  const [requests, setRequests] = useState<CollabRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    collabService.getRequests(post.id)
      .then((r) => setRequests(r.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [post.id]);

  const handle = async (id: number, status: 'accepted' | 'rejected') => {
    try {
      await collabService.updateRequest(id, status);
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      toast.success(status === 'accepted' ? 'Request accepted!' : 'Request rejected.');
    } catch {
      toast.error('Failed to update request.');
    }
  };

  return (
    <div className="mt-4 border-t border-border/60 pt-4 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Join Requests ({requests.length})
      </p>
      {loading && <p className="text-xs text-muted-foreground">Loading...</p>}
      {!loading && requests.length === 0 && (
        <p className="text-xs text-muted-foreground">No requests yet.</p>
      )}
      {requests.map((req) => (
        <div key={req.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
          <UserAvatar name={req.requester.name} avatar={req.requester.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{req.requester.name}</p>
            {req.message && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">"{req.message}"</p>}
            {req.status === 'pending' ? (
              <div className="flex gap-2 mt-2">
                <Button size="sm" className="h-6 text-xs px-2" onClick={() => handle(req.id, 'accepted')}>
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Accept
                </Button>
                <Button variant="outline" size="sm" className="h-6 text-xs px-2 text-destructive border-destructive/30" onClick={() => handle(req.id, 'rejected')}>
                  <XCircle className="w-3 h-3 mr-1" /> Reject
                </Button>
              </div>
            ) : (
              <Badge variant="outline" className={`mt-1.5 text-xs ${req.status === 'accepted' ? 'text-green-600 border-green-300' : 'text-destructive border-destructive/30'}`}>
                {req.status}
              </Badge>
            )}
          </div>
        </div>
      ))}
      <Button variant="ghost" size="sm" className="text-xs h-7 w-full" onClick={onClose}>Hide requests</Button>
    </div>
  );
}

function PostCard({ post, currentUserId, onDelete, onToggleStatus, onRequest }: {
  post: CollabPost;
  currentUserId: number;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, status: 'open' | 'closed') => void;
  onRequest: (post: CollabPost) => void;
}) {
  const isOwner = post.author.id === currentUserId;
  const [showRequests, setShowRequests] = useState(false);

  return (
    <Card className="border border-border/60 shadow-xs hover:shadow-sm transition-shadow">
      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <UserAvatar name={post.author.name} avatar={post.author.avatar} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {post.projectType && (
              <Badge variant="secondary" className="text-xs">{post.projectType}</Badge>
            )}
            <Badge variant="outline" className={`text-xs ${post.status === 'open' ? 'text-green-600 border-green-300 bg-green-50 dark:bg-green-950' : 'text-muted-foreground'}`}>
              {post.status}
            </Badge>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-semibold text-sm">{post.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-3">{post.description}</p>
        </div>

        {/* Skills */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-muted-foreground shrink-0">I have:</span>
            {post.skillsHave.map((s) => <SkillTag key={s} skill={s} variant="have" />)}
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-muted-foreground shrink-0">I need:</span>
            {post.skillsNeeded.map((s) => <SkillTag key={s} skill={s} variant="need" />)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {isOwner ? (
            <>
              <Button
                variant="outline" size="sm" className="h-7 text-xs"
                onClick={() => setShowRequests((v) => !v)}
              >
                {showRequests ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                Requests
              </Button>
              <Button
                variant="outline" size="sm" className="h-7 text-xs"
                onClick={() => onToggleStatus(post.id, post.status === 'open' ? 'closed' : 'open')}
              >
                {post.status === 'open'
                  ? <><Lock className="w-3 h-3 mr-1" />Close</>
                  : <><Unlock className="w-3 h-3 mr-1" />Reopen</>}
              </Button>
              <Button
                variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:bg-destructive/10 ml-auto"
                onClick={() => onDelete(post.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          ) : (
            post.status === 'open' && (
              <Button size="sm" className="h-7 text-xs" onClick={() => onRequest(post)}>
                <Send className="w-3 h-3 mr-1.5" />
                Request to Join
              </Button>
            )
          )}
        </div>

        {isOwner && showRequests && (
          <RequestsPanel post={post} onClose={() => setShowRequests(false)} />
        )}
      </CardContent>
    </Card>
  );
}

export default function Collabs() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<CollabPost[]>([]);
  const [myPosts, setMyPosts] = useState<CollabPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [requestPost, setRequestPost] = useState<CollabPost | null>(null);
  const [requestMsg, setRequestMsg] = useState('');
  const [skillInput, setSkillInput] = useState({ have: '', need: '' });
  const [form, setForm] = useState({
    title: '', description: '', projectType: '', skillsHave: [] as string[], skillsNeeded: [] as string[],
  });

  const load = async () => {
    try {
      const [all, mine] = await Promise.all([collabService.getPosts(), collabService.getMyPosts()]);
      setPosts(all.data);
      setMyPosts(mine.data);
    } catch {
      // backend not reachable
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addSkill = (type: 'have' | 'need') => {
    const val = skillInput[type].trim();
    if (!val) return;
    if (type === 'have') {
      setForm((p) => ({ ...p, skillsHave: [...new Set([...p.skillsHave, val])] }));
      setSkillInput((p) => ({ ...p, have: '' }));
    } else {
      setForm((p) => ({ ...p, skillsNeeded: [...new Set([...p.skillsNeeded, val])] }));
      setSkillInput((p) => ({ ...p, need: '' }));
    }
  };

  const removeSkill = (type: 'have' | 'need', skill: string) => {
    if (type === 'have') setForm((p) => ({ ...p, skillsHave: p.skillsHave.filter((s) => s !== skill) }));
    else setForm((p) => ({ ...p, skillsNeeded: p.skillsNeeded.filter((s) => s !== skill) }));
  };

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.skillsHave.length || !form.skillsNeeded.length) {
      toast.error('Please fill all fields and add at least one skill in each section.');
      return;
    }
    try {
      const res = await collabService.createPost({ ...form, projectType: form.projectType || undefined });
      setPosts((p) => [res.data, ...p]);
      setMyPosts((p) => [res.data, ...p]);
      setCreateOpen(false);
      setForm({ title: '', description: '', projectType: '', skillsHave: [], skillsNeeded: [] });
      toast.success('Post created!');
    } catch {
      toast.error('Failed to create post.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await collabService.deletePost(id);
      setPosts((p) => p.filter((x) => x.id !== id));
      setMyPosts((p) => p.filter((x) => x.id !== id));
      toast.success('Post deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleToggleStatus = async (id: number, status: 'open' | 'closed') => {
    try {
      await collabService.toggleStatus(id, status);
      const update = (list: CollabPost[]) => list.map((p) => p.id === id ? { ...p, status } : p);
      setPosts(update);
      setMyPosts(update);
    } catch {
      toast.error('Failed to update.');
    }
  };

  const handleSendRequest = async () => {
    if (!requestPost) return;
    try {
      await collabService.sendRequest(requestPost.id, requestMsg.trim() || undefined);
      toast.success(`Request sent to ${requestPost.author.name}!`);
      setRequestPost(null);
      setRequestMsg('');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr?.response?.data?.message === 'Already requested' ? 'You already sent a request for this post.' : 'Failed to send request.');
    }
  };

  const otherPosts = posts.filter((p) => p.author.id !== user?.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Handshake className="w-4 h-4 text-primary" />
            </div>
            Collab Board
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Post your project, find collaborators, build together.
          </p>
        </div>
        <Button size="sm" className="h-9 text-xs w-fit" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Post a Project
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="h-8">
          <TabsTrigger value="all" className="text-xs">
            All Posts <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{otherPosts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="mine" className="text-xs">
            My Posts <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1.5">{myPosts.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {loading && otherPosts.length === 0 && (
            <div className="py-12 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading posts...</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherPosts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user?.id ?? 0}
                onDelete={handleDelete} onToggleStatus={handleToggleStatus} onRequest={setRequestPost} />
            ))}
            {!loading && otherPosts.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2 py-8 text-center">
                No posts yet. Be the first to post a project!
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="mine" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPosts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user?.id ?? 0}
                onDelete={handleDelete} onToggleStatus={handleToggleStatus} onRequest={setRequestPost} />
            ))}
            {myPosts.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2 py-8 text-center">
                You haven't posted any projects yet.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Post Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a Collab Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Project Title</Label>
              <Input placeholder="e.g. Building a full-stack e-commerce app" className="h-9"
                value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea placeholder="Describe your project, what you're building, and what kind of collaborator you're looking for..."
                className="resize-none text-sm" rows={3}
                value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Project Type</Label>
              <div className="flex flex-wrap gap-1.5">
                {PROJECT_TYPES.map((t) => (
                  <button key={t} type="button"
                    onClick={() => setForm((p) => ({ ...p, projectType: p.projectType === t ? '' : t }))}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                      form.projectType === t
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border/60 hover:border-primary/50 text-muted-foreground'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Skills I Have</Label>
              <div className="flex gap-2">
                <Input placeholder="e.g. React, TypeScript" className="h-8 text-sm"
                  value={skillInput.have}
                  onChange={(e) => setSkillInput((p) => ({ ...p, have: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('have'))} />
                <Button type="button" size="sm" className="h-8 px-3 shrink-0" onClick={() => addSkill('have')}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {form.skillsHave.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                    {s} <button onClick={() => removeSkill('have', s)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Skills I Need</Label>
              <div className="flex gap-2">
                <Input placeholder="e.g. Node.js, MySQL" className="h-8 text-sm"
                  value={skillInput.need}
                  onChange={(e) => setSkillInput((p) => ({ ...p, need: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('need'))} />
                <Button type="button" size="sm" className="h-8 px-3 shrink-0" onClick={() => addSkill('need')}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {form.skillsNeeded.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                    {s} <button onClick={() => removeSkill('need', s)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate}>Post Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request to Join Dialog */}
      <Dialog open={!!requestPost} onOpenChange={() => { setRequestPost(null); setRequestMsg(''); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request to Join</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {requestPost && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
                <p className="text-sm font-medium">{requestPost.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">by {requestPost.author.name}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Message (optional)</Label>
              <Textarea
                placeholder="Introduce yourself and explain why you'd be a great collaborator..."
                className="resize-none text-sm" rows={3}
                value={requestMsg} onChange={(e) => setRequestMsg(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setRequestPost(null); setRequestMsg(''); }}>Cancel</Button>
            <Button size="sm" onClick={handleSendRequest}>
              <Send className="w-3.5 h-3.5 mr-1.5" /> Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
