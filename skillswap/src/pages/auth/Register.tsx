import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Github, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SkillSwapLogo } from '@/components/shared/SkillSwapLogo';
import { OAuthModal } from '@/components/shared/OAuthModal';
import type { OAuthAccount } from '@/components/shared/OAuthModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import type { AuthUser } from '@/types';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M21.35 11.1H12v2.8h5.35c-.23 1.36-1.22 2.59-2.72 3.34l2.2 1.75c1.62-1.5 2.56-3.69 2.56-6.24 0-.42-.04-.84-.09-1.25z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.95-.9 6.6-2.45l-2.2-1.75c-1.05.7-2.4 1.1-4.4 1.1-3.4 0-6.26-2.3-7.29-5.4L2 14.9C3.75 18.8 7.6 22 12 22z" />
      <path fill="#FBBC05" d="M4.71 13.25a7.92 7.92 0 010-2.5L2 9.1a11.98 11.98 0 000 5.8l2.71-1.65z" />
      <path fill="#EA4335" d="M12 6.5c1.56 0 2.97.55 4.08 1.63l3.06-3.06C16.9 3.2 14.7 2 12 2 7.6 2 3.75 5.2 2 9.1l2.71 1.65C5.74 8.8 8.6 6.5 12 6.5z" />
    </svg>
  );
}

async function registerUser(name: string, email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const response = await authService.register(name, email, password);
  return response.data;
}

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthModal, setOauthModal] = useState<'google' | 'github' | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleChange = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOAuthSelect = async (account: OAuthAccount) => {
    setOauthLoading(true);
    try {
      const res = await authService.loginWithGoogle({ name: account.name, email: account.email, avatar: account.avatar });
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome to SkillBridge, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch {
      toast.error('Sign up failed. Please try again.');
    } finally {
      setOauthLoading(false);
      setOauthModal(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const result = await registerUser(form.name, form.email, form.password);
      setAuth(result.user, result.token);
      toast.success(`Welcome to SkillBridge, ${result.user.name}!`);
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: '🎯', text: 'Get matched with devs who have the skills you need' },
    { icon: '🚀', text: 'Post your project on the Collab Board and find co-builders' },
    { icon: '⭐', text: 'Rate collaborators and build your reputation' },
  ];

  return (
    <div className="min-h-screen flex bg-[#080c14]">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg-animated opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1526] via-[#0a1020] to-[#080c14]" />

        <div className="absolute top-16 right-16 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-indigo-600/15 blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl animate-float-delayed" />

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 animate-fade-up">
          <div className="flex items-center gap-3">
            <SkillSwapLogo size={44} />
            <span className="text-white font-bold text-xl tracking-tight">SkillBridge</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8 animate-fade-up-2">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Build something<br />
              <span className="gradient-text">together.</span>
            </h2>
            <p className="text-white/50 text-base max-w-sm">
              You have skills. Others have what you need. Post your project, get matched, and ship it together.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                <span className="text-xl">{icon}</span>
                <p className="text-white/70 text-sm">{text}</p>
                <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 animate-fade-up-3">
          <div className="glass rounded-2xl p-4 max-w-xs">
            <p className="text-white/50 text-xs mb-3 uppercase tracking-widest">Active builders</p>
            <div className="flex -space-x-2">
              {['A', 'P', 'R', 'N', 'V'].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full gradient-bg-animated border-2 border-[#0d1526] flex items-center justify-center text-white text-xs font-bold" style={{ animationDelay: `${i * 0.5}s` }}>{l}</div>
              ))}
              <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#0d1526] flex items-center justify-center text-white/60 text-xs">+2k</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1120] to-[#080c14]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-violet-900/20 blur-3xl" />

        <div className="relative z-10 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden animate-fade-up">
            <SkillSwapLogo size={32} />
            <span className="font-bold text-lg text-white">SkillBridge</span>
          </div>

          <div className="animate-fade-up-1 glass rounded-2xl p-8 shadow-2xl shadow-black/50">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Create account</h1>
              <p className="text-white/40 text-sm mt-1">Join the SkillBridge community</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setOauthModal('google')}
                disabled={oauthLoading}
                className="flex items-center justify-center gap-2 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium transition-all duration-200 hover:border-white/20 disabled:opacity-50"
              >
                <GoogleIcon className="h-4 w-4" />
                Google
              </button>
              <button
                type="button"
                onClick={() => setOauthModal('github')}
                disabled={oauthLoading}
                className="flex items-center justify-center gap-2 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium transition-all duration-200 hover:border-white/20 disabled:opacity-50"
              >
                <Github className="h-4 w-4" />
                GitHub
              </button>
            </div>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 text-white/30">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {[
                { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', field: 'name' },
                { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', field: 'email' },
              ].map(({ id, label, type, placeholder, field }) => (
                <div key={id} className="space-y-1.5">
                  <Label htmlFor={id} className="text-xs font-medium text-white/60 uppercase tracking-wide">{label}</Label>
                  <Input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={form[field as keyof typeof form]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required
                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-indigo-500/60 rounded-xl transition-all"
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-white/60 uppercase tracking-wide">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-indigo-500/60 rounded-xl pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-xs font-medium text-white/60 uppercase tracking-wide">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={(e) => handleChange('confirm', e.target.value)}
                  required
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-indigo-500/60 rounded-xl transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl gradient-bg-animated text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {oauthModal && (
        <OAuthModal
          provider={oauthModal}
          onSelect={handleOAuthSelect}
          onClose={() => setOauthModal(null)}
          loading={oauthLoading}
        />
      )}
    </div>
  );
}
