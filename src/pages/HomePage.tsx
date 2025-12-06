import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Camera, Heart, Users, ImageIcon } from "lucide-react";

export function HomePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/gallery", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-12%] top-[-15%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,var(--primary-soft),transparent_70%)] blur-3xl" />
        <div className="absolute right-[-20%] top-1/3 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,var(--accent-soft),transparent_75%)] blur-3xl" />
        <div className="absolute left-1/2 top-[72%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,222,205,0.35),transparent_70%)] blur-3xl" />
      </div>

      <header className="relative">
        <nav className="mx-auto mt-10 flex max-w-6xl items-center justify-between rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel)] px-6 py-4 shadow-[0_18px_40px_-28px_var(--shadow-glow)] backdrop-blur-lg lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl">
              <img
                src="/familygallerylogonowords.png"
                alt="Photo Bomb"
                className="h-full w-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Family
              </span>
              <h4 className="text-xl font-semibold tracking-wide">
                Photo Bomb
              </h4>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="rounded-full px-5">
                Enter Now
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="rounded-full px-6">
                Request Access
              </Button>
            </Link>
          </div>
        </nav>

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 lg:px-8 lg:pt-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-8">
              <div className="space-y-6">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--panel-border)] bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary shadow-[0_12px_26px_-24px_var(--shadow-glow)] backdrop-blur">
                  <span className="size-2 rounded-full bg-primary" />
                  Private family vault
                </span>
                <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Keep every{" "}
                  <span className="bg-gradient-to-r from-primary via-[#ff8f70] to-[#ffb27a] bg-clip-text text-transparent">
                    memory aglow
                  </span>{" "}
                  for the Family.
                </h1>
                <p className="max-w-xl text-lg text-gray-300">
                  Photo Bomb gathers our day-to-day snapshots and the big
                  milestone moments into one warm, secure space—so the people we
                  love can relive them from anywhere.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/register" className="flex-1 sm:flex-initial">
                  <Button size="lg" className="w-full rounded-full px-10">
                    Request Access
                  </Button>
                </Link>
                <Link to="/login" className="flex-1 sm:flex-initial">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full border-primary/30 bg-transparent px-10 backdrop-blur-none"
                  >
                    Enter the Gallery
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div
                className="absolute -inset-10 -z-10 rounded-[3rem] bg-[linear-gradient(135deg,rgba(255,111,97,0.18),rgba(78,205,196,0.16))] blur-2xl"
                aria-hidden
              />
              <img
                src="/familygallerylogonowords.png"
                alt="Family picnic"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <section className="relative border-t border-[color:var(--panel-border)]/60 bg-white/60 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-[color:var(--panel-border)] bg-primary-soft px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Why I built it
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for the way our family loves, shares, and remembers
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every feature is infused with warmth so the app feels like a
              living scrapbook—easy enough for the kids and comforting for our
              grandparents.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Share with ease",
                description:
                  "Drag-and-drop uploads, instant sync, and automatic organization keep every moment ready to revisit.",
                icon: ImageIcon,
              },
              {
                title: "Albums for every chapter",
                description:
                  "Curate holidays, birthdays, and tiny milestones into albums that feel like hand-bound keepsakes.",
                icon: Heart,
              },
              {
                title: "Private to the family",
                description:
                  "Protected behind our shared passphrase so the stories stay where they belong—with us.",
                icon: Users,
              },
            ].map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="group rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel)] px-6 py-8 shadow-[0_22px_45px_-34px_var(--shadow-glow)] backdrop-blur transition-transform duration-300 hover:-translate-y-1 hover:border-primary/45"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary shadow-[0_12px_26px_-24px_var(--shadow-glow)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-wide">
                  {title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 rounded-3xl border border-[color:var(--panel-border)] bg-[linear-gradient(135deg,rgba(255,111,97,0.14),rgba(78,205,196,0.14))] px-6 py-16 text-center shadow-[0_28px_60px_-32px_var(--shadow-glow)] backdrop-blur lg:px-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            From our family to yours
          </div>
          <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to add the next chapter to our gallery?
          </h3>
          <p className="max-w-2xl text-base text-gray-300">
            Request an invite to join the family space. Upload a memory, react
            to your favorites, and stay close even when life gets busy.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link to="/register">
              <Button size="lg" className="w-full rounded-full px-12">
                Request access
              </Button>
            </Link>
            <Link to="/gallery">
              <Button
                size="lg"
                variant="ghost"
                className="w-full rounded-full px-12 text-foreground hover:text-foreground"
              >
                Peek at the gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[color:var(--panel-border)]/70 bg-white/70 py-8 backdrop-blur">
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
