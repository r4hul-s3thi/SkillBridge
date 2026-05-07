import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Github, ArrowRight, Zap, Users, Star, Code2 } from "lucide-react"
import { SkillSwapLogo } from "@/components/shared/SkillSwapLogo"
import { OAuthModal } from "@/components/shared/OAuthModal"
import type { OAuthAccount } from "@/components/shared/OAuthModal"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/store/authStore"
import { authService } from "@/services/authService"
import { toast } from "sonner"
import type { AuthUser } from "@/types"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M21.35 11.1H12v2.8h5.35c-.23 1.36-1.22 2.59-2.72 3.34l2.2 1.75c1.62-1.5 2.56-3.69 2.56-6.24 0-.42-.04-.84-.09-1.25z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.95-.9 6.6-2.45l-2.2-1.75c-1.05.7-2.4 1.1-4.4 1.1-3.4 0-6.26-2.3-7.29-5.4L2 14.9C3.75 18.8 7.6 22 12 22z" />
      <path fill="#FBBC05" d="M4.71 13.25a7.92 7.92 0 010-2.5L2 9.1a11.98 11.98 0 000 5.8l2.71-1.65z" />
      <path fill="#EA4335" d="M12 6.5c1.56 0 2.97.55 4.08 1.63l3.06-3.06C16.9 3.2 14.7 2 12 2 7.6 2 3.75 5.2 2 9.1l2.71 1.65C5.74 8.8 8.6 6.5 12 6.5z" />
    </svg>
  )
}

async function loginUser(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const response = await authService.login(email, password)
  return response.data
}

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthModal, setOauthModal] = useState<"google" | "github" | null>(null)
  const [oauthLoading, setOauthLoading] = useState(false)

  const handleOAuthSelect = async (account: OAuthAccount) => {
    setOauthLoading(true)
    try {
      const res = await authService.loginWithGoogle({ name: account.name, email: account.email, avatar: account.avatar })
      setAuth(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate("/dashboard")
    } catch {
      toast.error("Sign in failed. Please try again.")
    } finally {
      setOauthLoading(false)
      setOauthModal(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error("Please fill in all fields"); return }
    setLoading(true)
    try {
      const result = await loginUser(email, password)
      setAuth(result.user, result.token)
      toast.success(`Welcome back, ${result.user.name}!`)
      navigate("/dashboard")
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message ?? "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: Users, text: "Get matched with devs who have skills you need", color: "text-cyan-400" },
    { icon: Code2, text: "Post your project and find the perfect co-builder", color: "text-violet-400" },
    { icon: Zap, text: "Real-time chat and session scheduling", color: "text-amber-400" },
    { icon: Star, text: "Build reputation through peer ratings", color: "text-emerald-400" },
  ]

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-14 relative overflow-hidden border-r border-white/[0.06]">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <SkillSwapLogo size={36} />
          <span className="text-white font-semibold text-lg tracking-tight">SkillBridge</span>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Skill-based collaboration platform
            </div>
            <h1 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Find your<br />
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                missing piece.
              </span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              You build the frontend. Someone else handles the backend. Together you ship something real.
            </p>
          </div>

          <div className="space-y-3">
            {features.map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="text-sm text-white/60">{text}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-2 border-t border-white/8">
            {[
              { val: "2K+", label: "Builders" },
              { val: "500+", label: "Skills" },
              { val: "4.8★", label: "Avg Rating" },
            ].map(({ val, label }) => (
              <div key={label}>
                <p className="text-xl font-bold text-white">{val}</p>
                <p className="text-xs text-white/30 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom card */}
        <div className="relative z-10">
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white shrink-0">R</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Rahul just connected with Priya</p>
                <p className="text-xs text-white/40 mt-0.5">React + UI/UX collab · 2 min ago</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(99,102,241,0.06),transparent)]" />

        <div className="relative z-10 w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <SkillSwapLogo size={28} />
            <span className="font-semibold text-white">SkillBridge</span>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Sign in</h2>
              <p className="text-sm text-white/40 mt-1">New here? <Link to="/register" className="text-violet-400 hover:text-violet-300 transition-colors">Create an account</Link></p>
            </div>

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOauthModal("google")}
                disabled={oauthLoading}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-white/80 transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-50 active:scale-95"
              >
                <GoogleIcon className="h-4 w-4" />
                Google
              </button>
              <button
                type="button"
                onClick={() => setOauthModal("github")}
                disabled={oauthLoading}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-white/80 transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-50 active:scale-95"
              >
                <Github className="h-4 w-4" />
                GitHub
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-white/25">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-violet-500/60 focus:bg-white/8 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-11 rounded-lg border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/20 focus:border-violet-500/60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-white/20">
              By signing in, you agree to our terms of service
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
  )
}
