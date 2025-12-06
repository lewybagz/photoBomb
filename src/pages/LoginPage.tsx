import { LoginForm } from "@/components/auth/login-form";
import { Camera } from "lucide-react";
import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-15%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,var(--primary-soft),transparent_70%)] blur-3xl" />
        <div className="absolute right-[-12%] top-[35%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,var(--accent-soft),transparent_70%)] blur-3xl" />
      </div>

      <Link to="/" className="mb-10 flex items-center gap-3 rounded-full border border-[color:var(--panel-border)] bg-white/70 px-6 py-3 shadow-[0_18px_40px_-28px_var(--shadow-glow)] backdrop-blur">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--primary),#ff9f68)] shadow-[0_12px_24px_-18px_var(--shadow-glow)]">
          <Camera className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Lewis family
          </span>
          <span className="text-xl font-semibold tracking-wide">
            Photo Bomb
          </span>
        </div>
      </Link>

      <LoginForm />
    </div>
  );
}
