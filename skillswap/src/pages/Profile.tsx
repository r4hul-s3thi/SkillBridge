import { useState } from 'react';
import { User, MapPin, Mail, Edit2, Check, X, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { StarRating } from '@/components/shared/StarRating';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { authService } from '@/services/authService';
import { skillService } from '@/services/skillService';
import { toast } from 'sonner';
import type { SkillType } from '@/types';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const { skills, addSkill, removeSkill, ratings } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    bio: user?.bio ?? '',
    location: user?.location ?? '',
    avatar: user?.avatar ?? '',
  });
  const [newSkill, setNewSkill] = useState({ skillName: '', level: 'Intermediate' });

  const offeredSkills = skills.filter((s) => s.type === 'offer');
  const wantedSkills = skills.filter((s) => s.type === 'want');
  const receivedRatings = ratings.filter((r) => r.toUserId === user?.id);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setProfileForm((p) => ({ ...p, avatar: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setProfileForm((p) => ({ ...p, avatar: '' }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateProfile({
        name: profileForm.name,
        bio: profileForm.bio,
        location: profileForm.location,
        avatar: profileForm.avatar || undefined,
      });
    } catch {
      // fall through
    }
    updateUser({ name: profileForm.name, bio: profileForm.bio, location: profileForm.location, avatar: profileForm.avatar || undefined });
    setAvatarPreview(null);
    setEditing(false);
    setSaving(false);
    toast.success('Profile updated!');
  };

  const handleAddSkill = async (type: SkillType) => {
    if (!newSkill.skillName.trim()) {
      toast.error('Please enter a skill name');
      return;
    }
    try {
      const res = await skillService.addSkill(newSkill.skillName.trim(), type, newSkill.level);
      addSkill(res.data);
    } catch {
      addSkill({
        id: Date.now(),
        userId: user?.id ?? 1,
        skillName: newSkill.skillName.trim(),
        type,
        level: newSkill.level,
      });
    }
    setNewSkill({ skillName: '', level: 'Intermediate' });
    toast.success('Skill added!');
  };

  const handleRemoveSkill = async (id: number) => {
    try {
      await skillService.deleteSkill(id);
    } catch {
      // fall through
    }
    removeSkill(id);
    toast.info('Skill removed.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your profile, skills and collaboration history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border border-border/60 shadow-xs lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="relative">
              <UserAvatar name={user?.name ?? 'User'} avatar={avatarPreview ?? user?.avatar} size="xl" />
              {!editing && (
                <button
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors"
                  onClick={() => setEditing(true)}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {editing ? (
              <div className="w-full space-y-3 text-left">
                {/* Avatar upload */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Profile Picture</Label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="h-8 text-xs border border-input rounded-md px-3 flex items-center gap-2 hover:bg-accent transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                    </label>
                    {(avatarPreview || user?.avatar) && (
                      <Button variant="outline" size="sm" className="h-8 text-xs text-destructive hover:text-destructive" onClick={handleRemoveAvatar}>
                        <X className="w-3.5 h-3.5 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Name</Label>
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Bio</Label>
                  <Textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell others about yourself..."
                    className="text-sm resize-none"
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Location</Label>
                  <Input
                    value={profileForm.location}
                    onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="City, Country"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                    Save
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setEditing(false); setAvatarPreview(null); }}>
                    <X className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="font-bold text-lg">{user?.name}</h2>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user?.email}</span>
                  </div>
                  {profileForm.location && (
                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{profileForm.location}</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs w-full" onClick={() => setEditing(true)}>
                  <Edit2 className="w-3 h-3 mr-1.5" />
                  Edit Profile
                </Button>
              </>
            )}

            <Separator className="w-full" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 w-full text-center">
              {[
                { val: skills.length, label: 'Skills' },
                { val: user?.totalSessions ?? 0, label: 'Collabs' },
                { val: `${user?.rating ?? 4.8}★`, label: 'Rating' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p className="font-bold text-foreground">{val}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="offer">
            <TabsList className="h-8">
              <TabsTrigger value="offer" className="text-xs">
                Skills I Have ({offeredSkills.length})
              </TabsTrigger>
              <TabsTrigger value="want" className="text-xs">
                Skills I Need ({wantedSkills.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs">
                Reviews ({receivedRatings.length})
              </TabsTrigger>
            </TabsList>

            {(['offer', 'want'] as SkillType[]).map((type) => (
              <TabsContent key={type} value={type} className="mt-4 space-y-4">
                {/* Add Skill */}
                <Card className="border border-border/60 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Add a Skill</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder={`e.g. ${type === 'offer' ? 'React, Node.js, Figma' : 'Machine Learning, Backend, DevOps'}`}
                        value={newSkill.skillName}
                        onChange={(e) => setNewSkill((p) => ({ ...p, skillName: e.target.value }))}
                        className="h-8 text-sm flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(type)}
                      />
                      <Select
                        value={newSkill.level}
                        onValueChange={(v) => setNewSkill((p) => ({ ...p, level: v ?? 'Intermediate' }))}
                      >
                        <SelectTrigger className="h-8 text-xs w-32 shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SKILL_LEVELS.map((l) => (
                            <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        className="h-8 text-xs shrink-0"
                        onClick={() => handleAddSkill(type)}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills List */}
                <Card className="border border-border/60 shadow-xs">
                  <CardContent className="p-4">
                    {(type === 'offer' ? offeredSkills : wantedSkills).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {(type === 'offer' ? offeredSkills : wantedSkills).map((s) => (
                          <SkillBadge
                            key={s.id}
                            skill={s.skillName}
                            type={s.type}
                            level={s.level}
                            onRemove={() => handleRemoveSkill(s.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No skills added yet. Add skills above to get matched with co-builders!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}

            <TabsContent value="reviews" className="mt-4 space-y-3">
              {receivedRatings.map((rating) => (
                <Card key={rating.id} className="border border-border/60 shadow-xs">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <UserAvatar name={rating.fromUser.name} avatar={rating.fromUser.avatar} size="md" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{rating.fromUser.name}</p>
                        </div>
                        <StarRating value={rating.rating} readonly size="sm" />
                        {rating.feedback && (
                          <p className="text-sm text-muted-foreground mt-1.5 italic">"{rating.feedback}"</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {receivedRatings.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No reviews yet. Complete collaboration sessions to receive feedback.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
