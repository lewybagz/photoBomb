import { RegisterForm } from "@/components/auth/register-form";
import { Camera } from "lucide-react";
import { Link } from "react-router-dom";

export function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8%] top-[-12%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,var(--primary-soft),transparent_70%)] blur-3xl" />
        <div className="absolute right-[-18%] top-[40%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,var(--accent-soft),transparent_70%)] blur-3xl" />
      </div>

      <Link
        to="/"
        className="mb-10 flex items-center gap-3 rounded-full border border-[color:var(--panel-border)] bg-white/70 px-6 py-3 shadow-[0_18px_40px_-28px_var(--shadow-glow)] backdrop-blur"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl">
          <img
            src="/familygallerylogonopadding.png"
            alt="Photo Bomb"
            className="h-full w-full"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Family
          </span>
          <span className="text-xl font-semibold tracking-wide">
            Photo Bomb
          </span>
        </div>
      </Link>

      <RegisterForm />
    </div>
  );
}
