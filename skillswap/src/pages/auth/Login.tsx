import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Github, Sparkles, ArrowRight } from "lucide-react"
import { SkillSwapLogo } from "@/components/shared/SkillSwapLogo"
import { OAuthModal } from "@/components/shared/OAuthModal"
import type { OAuthAccount } from "@/components/shared/OAuthModal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/authStore"
import { authService } from "@/services/authService"
import { toast } from "sonner"
import type { AuthUser } from "@/types"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.35 11.1H12v2.8h5.35c-.23 1.36-1.22 2.59-2.72 3.34l2.2 1.75c1.62-1.5 2.56-3.69 2.56-6.24 0-.42-.04-.84-.09-1.25z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.95-.9 6.6-2.45l-2.2-1.75c-1.05.7-2.4 1.1-4.4 1.1-3.4 0-6.26-2.3-7.29-5.4L2 14.9C3.75 18.8 7.6 22 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M4.71 13.25a7.92 7.92 0 010-2.5L2 9.1a11.98 11.98 0 000 5.8l2.71-1.65z"
      />
      <path
        fill="#EA4335"
        d="M12 6.5c1.56 0 2.97.55 4.08 1.63l3.06-3.06C16.9 3.2 14.7 2 12 2 7.6 2 3.75 5.2 2 9.1l2.71 1.65C5.74 8.8 8.6 6.5 12 6.5z"
      />
    </svg>
  )
}

async function loginUser(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string }> {
  const response = await authService.login(email, password)
  return response.data
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
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
      const res = await authService.loginWithGoogle({
        name: account.name,
        email: account.email,
        avatar: account.avatar,
      })
      setAuth(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      await wait(1200)
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
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const result = await loginUser(email, password)
      setAuth(result.user, result.token)
      toast.success(`Welcome back, ${result.user.name}!`)
      await wait(1200)
      navigate("/dashboard")
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message ?? "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-cosmos flex min-h-screen">
      <div className="login-beam animate-beam-pulse top-[10%] left-[-8rem] -rotate-12 bg-cyan-400/30" />
      <div className="login-beam animate-beam-pulse top-[28%] right-[-10rem] rotate-12 bg-orange-400/25 [animation-delay:1.6s]" />
      <div className="login-orbit-ring animate-slow-spin top-[12%] left-[8%] h-[26rem] w-[26rem]" />
      <div className="login-orbit-ring animate-slow-spin top-[46%] right-[12%] h-[18rem] w-[18rem] [animation-direction:reverse]" />
      <div className="gradient-bg-animated absolute inset-0 opacity-15" />

      <div className="hero-mesh relative hidden flex-1 flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="animate-drift absolute top-14 right-12 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="animate-float-slow absolute bottom-16 left-10 h-64 w-64 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="animate-float-delayed absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-emerald-300/15 blur-2xl" />

        <div className="animate-fade-right relative z-10">
          <div className="flex items-center gap-3">
            <SkillSwapLogo size={44} />
            <span className="text-xl font-bold tracking-tight text-white">
              SkillBridge
            </span>
          </div>
        </div>

        <div className="animate-fade-right relative z-10 space-y-8 [animation-delay:120ms]">
          <div className="space-y-4">
            <div className="glass mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-cyan-200">
              <Sparkles className="h-3 w-3" />
              Skill-based collaboration
            </div>
            <h2 className="text-5xl leading-tight font-bold text-white">
              Find your missing
              <br />
              <span className="gradient-text">co-builder.</span>
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-slate-300/[0.8]">
              You know Frontend, need a Backend dev? Post your project, get matched by skills, and build together — for free.
            </p>
          </div>

          <div className="flex items-center gap-8">
            {[
              { val: "2K+", label: "Builders" },
              { val: "500+", label: "Skills" },
              { val: "4.8+", label: "Avg Rating" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="mt-0.5 text-xs tracking-widest text-white/40 uppercase">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "Smart Matching",
              "Real-time Chat",
              "Collab Board",
              "Peer Ratings",
            ].map((feature) => (
              <span
                key={feature}
                className="glass rounded-full px-3 py-1.5 text-xs text-slate-100/[0.75]"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="animate-scale-in relative z-10 [animation-delay:240ms]">
          <div className="glow-sweep glass flex max-w-xs items-center gap-3 rounded-2xl p-4">
            <div className="gradient-bg-animated flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-slate-950">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Aarav & Priya just shipped v1.0
              </p>
              <p className="text-xs text-white/40">React + UI/UX collab - 2 min ago</p>
            </div>
            <div className="ml-auto h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-300" />
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#08111d]/40 via-[#10233d]/30 to-[#09101b]/40" />
        <div className="animate-drift absolute top-[20%] left-[10%] h-72 w-72 rounded-full bg-cyan-500/[0.12] blur-3xl" />
        <div className="animate-float absolute right-[8%] bottom-[8%] h-80 w-80 rounded-full bg-orange-500/[0.08] blur-3xl" />
        <div
          className="animate-pan-grid absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(circle at center, black, transparent 82%)",
          }}
        />

        <div className="relative z-10 w-full max-w-sm">
          <div className="animate-fade-up mb-8 flex items-center gap-2 lg:hidden">
            <SkillSwapLogo size={32} />
            <span className="text-lg font-bold text-white">SkillBridge</span>
          </div>

          <div className="animate-scale-in animate-card-breath glass rounded-[28px] border-white/[0.12] p-8 shadow-2xl shadow-cyan-950/30">
            <div className="mb-6">
              <h1 className="animate-fade-up text-2xl font-bold text-white">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-slate-300/[0.7]">
                Sign in to find your co-builder
              </p>
            </div>

            <div className="animate-fade-up-1 mb-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOauthModal("google")}
                disabled={oauthLoading}
                className="touch-surface touch-feedback animate-border-glow flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] text-sm font-medium text-white/80 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/10 disabled:opacity-50"
              >
                <GoogleIcon className="h-4 w-4" />
                Google
              </button>
              <button
                type="button"
                onClick={() => setOauthModal("github")}
                disabled={oauthLoading}
                className="touch-surface touch-feedback flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] text-sm font-medium text-white/80 transition-all duration-200 hover:-translate-y-1 hover:border-orange-300/30 hover:bg-orange-300/10 disabled:opacity-50"
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
                <span
                  className="px-2 text-white/30"
                  style={{ background: "transparent" }}
                >
                  or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="animate-fade-up-2 space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium tracking-wide text-white/60 uppercase"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="animate-border-glow touch-feedback h-11 rounded-xl border-white/10 bg-white/5 text-white transition-all placeholder:text-white/25 focus:border-cyan-300/60 focus:bg-white/8"
                />
              </div>

              <div className="animate-fade-up-3 space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium tracking-wide text-white/60 uppercase"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="........"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="animate-border-glow touch-feedback h-11 rounded-xl border-white/10 bg-white/5 pr-10 text-white transition-all placeholder:text-white/25 focus:border-cyan-300/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 transition-colors hover:text-white/70"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="touch-surface touch-feedback gradient-bg-animated animate-pulse-glow animate-fade-up-4 mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-950 transition-all duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/20 border-t-slate-900" />
                    Logging you in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight className="animate-float-x h-4 w-4" />
                  </span>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-white/40">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-cyan-300 transition-colors hover:text-orange-200"
              >
                Sign Up
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
  )
}
