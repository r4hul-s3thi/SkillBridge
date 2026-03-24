import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Github } from 'lucide-react';
import { SkillSwapLogo } from '@/components/shared/SkillSwapLogo';
import { OAuthModal } from '@/components/shared/OAuthModal';
import type { OAuthAccount } from '@/components/shared/OAuthModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

async function loginUser(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const response = await authService.login(email, password);
  return response.data;
}

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('aarav.patel@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthModal, setOauthModal] = useState<'google' | 'github' | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleOAuthSelect = async (account: OAuthAccount) => {
    setOauthLoading(true);
    try {
      const res = await authService.loginWithGoogle({ name: account.name, email: account.email, avatar: account.avatar });
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch {
      toast.error('Sign in failed. Please try again.');
    } finally {
      setOauthLoading(false);
      setOauthModal(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      setAuth(result.user, result.token);
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message ?? 'Invalid email or password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-[#0F1A2E] p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/10 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <SkillSwapLogo size={42} />
            <span className="text-white font-bold text-xl tracking-tight">SkillBridge</span>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Exchange skills,<br />grow together.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-sm">
              Connect with peers, teach what you know, and learn what you want — all in one place.
            </p>
          </div>
          <div className="flex items-center gap-6 pt-4">
            {[{ val: '2K+', label: 'Learners' }, { val: '500+', label: 'Skills' }, { val: '4.8★', label: 'Avg Rating' }].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-xs text-white/50 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-20 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-48 h-48 bg-accent/20 rounded-full blur-2xl" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <SkillSwapLogo size={32} />
            <span className="font-bold text-lg text-foreground">SkillBridge</span>
          </div>

          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-bold">Sign In</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOauthModal('google')}
                    disabled={oauthLoading}
                    className="h-9 flex items-center justify-center gap-2"
                  >
                    <GoogleIcon className="h-4 w-4" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOauthModal('github')}
                    disabled={oauthLoading}
                    className="h-9 flex items-center justify-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-9 font-medium" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Sign Up
                </Link>
              </p>
            </CardFooter>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Demo: <span className="font-mono bg-muted px-1 rounded">aarav.patel@example.com</span> / password123
          </p>
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
