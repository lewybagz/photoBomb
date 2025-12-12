import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, ImageIcon } from "lucide-react";
import logoImage from "@/assets/images/familygallerylogonowords.png";

export function NotFoundPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-12%] top-[-15%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,var(--primary-soft),transparent_70%)] blur-3xl" />
        <div className="absolute right-[-20%] top-1/3 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,var(--accent-soft),transparent_75%)] blur-3xl" />
        <div className="absolute left-1/2 top-[72%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,222,205,0.35),transparent_70%)] blur-3xl" />
      </div>

      <header className="relative">
        <nav className="mx-auto mt-10 flex max-w-[95vw] sm:max-w-6xl items-center justify-between rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel)] px-4 py-3 shadow-[0_18px_40px_-28px_var(--shadow-glow)] backdrop-blur-lg sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl">
              <img src={logoImage} alt="Photo Bomb" className="h-full w-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-muted-foreground">
                Family
              </span>
              <h4 className="text-lg sm:text-xl font-semibold tracking-wide">
                Photo Bomb
              </h4>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full px-3 sm:px-5 text-sm bg-white/90 text-black"
              >
                Enter <span className="hidden sm:inline">Now</span>
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="rounded-full px-4 sm:px-6 text-sm">
                Request Access
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
        <div className="space-y-8">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl" />
            <div className="relative rounded-full bg-white/90 p-8 shadow-[0_20px_40px_-20px_var(--shadow-glow)] backdrop-blur">
              <ImageIcon className="h-16 w-16 text-primary" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-primary sm:text-8xl">404</h1>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Oops! This is awkward...
            </h2>
            <p className="mx-auto max-w-md text-lg text-grey-300">
              The page you're looking for might have been moved, deleted, or
              family member Lewis is bad at coding. Let's get you back to the
              family memories.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/">
              <Button size="lg" className="w-full rounded-full px-8 sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link to="/gallery">
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full border-primary/30 bg-white/80 px-8 backdrop-blur-none sm:w-auto"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                View Gallery
              </Button>
            </Link>
            <Button
              size="lg"
              variant="ghost"
              className="w-full rounded-full px-8 sm:w-auto"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </main>

      <footer className="relative border-t border-[color:var(--panel-border)]/70 bg-white/70 py-8 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 text-center text-sm text-muted-foreground sm:flex-row sm:text-left lg:px-8">
          <p>Photo Bomb — made with love by the family.</p>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-primary hover:text-primary/80"
            >
              Enter
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-primary hover:text-primary/80"
            >
              Request invite
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
