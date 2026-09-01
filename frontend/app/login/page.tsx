"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { queryClient } from "@/components/providers";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
  User,
} from "lucide-react";

const features = [
  { icon: Target, text: "Find and organize high-value PR leads" },
  { icon: Sparkles, text: "Generate personalized outreach with AI" },
  { icon: Zap, text: "Track follow-ups without losing momentum" },
];

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "register") {
        await authApi.register({ name, email, password });
        // Auto-login after registration
        const data = await authApi.login({ username: email, password });
        setToken(data.access_token);
        queryClient.clear(); // Clear any stale data from previous session
        router.push("/dashboard");
      } else {
        const data = await authApi.login({ username: email, password });
        setToken(data.access_token);
        queryClient.clear(); // Clear any stale data from previous session
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(
        err?.message ||
        (mode === "register"
          ? "Registration failed. Please try again."
          : "Unable to sign in. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] lg:h-screen lg:overflow-hidden bg-[#f8fafc] text-[#0f172a] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)] relative">
      {/* Brand panel (Desktop only) */}
      <section className="relative hidden h-full overflow-hidden bg-[#15102a] lg:flex flex-col justify-between p-8 xl:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(99,75,255,0.42),transparent_34%),radial-gradient(circle_at_85%_82%,rgba(76,201,240,0.16),transparent_28%)]" />
        <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur shadow-sm">
            <Bot className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-[18px] font-bold tracking-tight text-white">PRFlow AI</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">PR outreach OS</div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg py-4">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-[#b8adff]" />
            AI-powered public relations
          </div>

          <h1 className="text-3xl font-bold leading-[1.15] tracking-[-0.03em] text-white xl:text-4xl 2xl:text-5xl">
            Turn every PR opportunity into a conversation.
          </h1>
          <p className="mt-4 text-[14px] xl:text-[15px] leading-relaxed text-white/65">
            Research prospects, create sharper pitches, manage outreach, and stay on top of every follow-up from one focused workspace.
          </p>

          <div className="mt-6 space-y-2.5">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-[13px] font-medium text-white/80">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] ring-1 ring-white/10">
                  <Icon className="h-3.5 w-3.5 text-[#b8adff]" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/45">
          <span>Built for modern PR teams & consultants</span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-[#7dd3fc]" /> Secure workspace
          </span>
        </div>
      </section>

      {/* Login/Register panel */}
      <section className="flex flex-col min-h-[100dvh] lg:min-h-0 lg:h-full items-center justify-start pt-16 lg:justify-center lg:pt-8 px-5 pb-8 sm:px-8 lg:px-12 overflow-y-auto bg-gradient-to-b from-indigo-50/50 to-[#f8fafc] lg:bg-none lg:bg-[#f8fafc]">
        <div className="w-full max-w-[400px]">
          {/* Mobile Top Branding */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] shadow-md shadow-indigo-500/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-base font-bold tracking-tight text-[#0f172a]">PRFlow AI</div>
                <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#64748b]">PR outreach OS</div>
              </div>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4f46e5] bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/80">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure
            </div>
          </div>

          {/* Heading */}
          <div className="mb-5 text-left">
            <div className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#4f46e5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4f46e5] animate-pulse" />
              {mode === "login" ? "Welcome back" : "Get started"}
            </div>
            <h2 className="text-2xl font-bold tracking-[-0.025em] text-[#0f172a] sm:text-[26px]">
              {mode === "login" ? "Sign in to your workspace" : "Create your account"}
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-[#64748b]">
              {mode === "login" ? "Continue managing your leads, outreach, and PR pipeline." : "Start managing your PR pipeline with AI-powered outreach."}
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_12px_36px_-10px_rgba(15,23,42,0.08)] sm:p-6 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-[12px] font-semibold text-[#334155]">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#94a3b8]" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="h-11 w-full rounded-xl border border-[#cbd5e1] bg-white pl-10 pr-4 text-[13.5px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] hover:border-[#94a3b8] focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 shadow-xs font-medium"
                    />
                  </div>
                </div>
              )}



              <div>                  <label htmlFor="email" className="mb-1.5 block text-[12px] font-semibold text-[#334155]">
                  Work email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#94a3b8]" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-11 w-full rounded-xl border border-[#cbd5e1] bg-white pl-10 pr-4 text-[13.5px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] hover:border-[#94a3b8] focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 shadow-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-[12px] font-semibold text-[#334155]">
                    Password
                  </label>
                  {mode === "login" && (
                    <button type="button" className="text-xs font-semibold text-[#4f46e5] transition hover:text-[#4338ca]">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#94a3b8]" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    required
                    minLength={mode === "register" ? 8 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "register" ? "Min. 8 characters" : "Enter your password"}
                    className="h-11 w-full rounded-xl border border-[#cbd5e1] bg-white pl-10 pr-10 text-[13.5px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] hover:border-[#94a3b8] focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 shadow-xs font-medium"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#94a3b8] transition hover:bg-slate-100 hover:text-[#475569]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2.5 text-[12px] font-medium leading-5 text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-4 text-[13.5px] font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-[#4f46e5]/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign in to PRFlow" : "Create Account"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 pt-1">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] font-bold tracking-wider text-[#94a3b8]">SECURE WORKSPACE</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748b] font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" />
                Your account session is protected
              </div>
            </form>
          </div>

          {/* Toggle login/register */}
          <p className="mt-5 text-center text-[12.5px] text-[#64748b]">
            {mode === "login" ? (
              <>
                New to PRFlow?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(""); }}
                  className="font-semibold text-[#4f46e5] hover:text-[#4338ca]"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className="font-semibold text-[#4f46e5] hover:text-[#4338ca]"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="mt-3 text-center text-[11px] leading-4 text-[#94a3b8]">
            By continuing, you agree to the PRFlow AI terms and privacy policy.
          </p>
        </div>
      </section>
    </main>
  );
}
