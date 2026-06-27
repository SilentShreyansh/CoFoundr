import Link from "next/link";
import { ArrowRight, Rocket, Users, Lightbulb, MessagesSquare } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: Lightbulb,
    title: "Share Startup Ideas",
    body: "Post your vision, the skills you need, and the stage you're at. Get discovered by builders.",
  },
  {
    icon: Users,
    title: "Find Co-Founders",
    body: "Match with developers, designers, marketers, and operators who complement your strengths.",
  },
  {
    icon: MessagesSquare,
    title: "Collaborate in Real Time",
    body: "Chat, form teams, manage applications, and move from idea to MVP together.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold">
          <Rocket className="h-5 w-5 text-primary" />
          <span className="text-lg">CoFoundr</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
        <span className="inline-block rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-muted-foreground">
          Where startups are born together
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Find your co-founder. <br className="hidden sm:block" />
          Build your startup.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          CoFoundr connects entrepreneurs, developers, designers, and investors
          to discover ideas, form teams, and launch companies — together.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start building <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            Explore ideas
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 text-card-foreground"
            >
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} CoFoundr. Built for founders.
        </div>
      </footer>
    </main>
  );
}
