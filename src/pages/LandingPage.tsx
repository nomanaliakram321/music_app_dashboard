import { Button } from "@/components/ui/button";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { value: "365", label: "days of releases" },
  { value: "12", label: "monthly collections" },
  { value: "24/7", label: "artist discovery" },
];

const features = [
  {
    icon: CalendarDays,
    title: "Release-date calendar",
    description:
      "Browse hip-hop albums by month and day, built for quick anniversary checks and music discovery.",
  },
  {
    icon: Disc3,
    title: "Album-first browsing",
    description:
      "Surface classic records, artist names, cover art, and release metadata in one clean experience.",
  },
  {
    icon: Bell,
    title: "Smart reminders",
    description:
      "Keep fans close to meaningful drops with notifications around albums, events, and updates.",
  },
  {
    icon: ShieldCheck,
    title: "Curated admin tools",
    description:
      "Manage uploads, events, albums, and content quality from a protected dashboard.",
  },
];

const albums = [
  "All Eyez On Me",
  "The Miseducation",
  "Luv Is Rage 2",
  "Prima Donna",
  "17",
];

const calendarCounts = [
  20, 12, 15, 5, 11, 11, 12, 21, 12, 14, 9, 19, 9, 10, 22, 15, 14, 8, 14,
  13, 17, 19, 22, 25, 14, 14, 11,
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-white">
      <section className="relative isolate min-h-screen">
        <img
          src="/hiphop-pvc-img.jpg"
          alt="Hip Hop Calendar vinyl artwork"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,8,8,0.96)_0%,rgba(8,8,8,0.84)_44%,rgba(8,8,8,0.42)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#080808] to-transparent" />

        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Hip Hop Calendar"
              className="h-10 w-10 rounded-lg object-contain"
            />
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              Hip Hop Calendar
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-white/72 md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#preview" className="transition hover:text-white">
              Preview
            </a>
            <a href="#mobile" className="transition hover:text-white">
              Mobile app
            </a>
            <Link to="/privacy-policy" className="transition hover:text-white">
              Privacy Policy
            </Link>
          </nav>

          <Button
            asChild
            className="rounded-full bg-white px-5 text-black hover:bg-white/90"
          >
            <Link to="/login">Admin login</Link>
          </Button>
        </header>

        <div className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-10 px-5 pb-10 pt-4 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/9 px-4 py-2 text-sm text-white/78 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#7d77ff]" />
              Album anniversaries, events, and culture in one place
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.94] tracking-tight sm:text-6xl lg:text-7xl">
              Never miss a hip-hop release date again.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
              Hip Hop Calendar turns album history into a daily discovery app:
              releases, anniversaries, cover art, events, and reminders built
              around the music fans already care about.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-[#2c2948] px-7 text-white shadow-[0_16px_40px_rgba(44,41,72,0.44)] hover:bg-[#37345b]"
              >
                <a href="#preview">
                  Explore the experience
                  <ChevronRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/18 bg-white/8 px-7 text-white hover:bg-white/14 hover:text-white"
              >
                <Link to="/login">Open admin dashboard</Link>
              </Button>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-white/10 bg-white/8 p-4 backdrop-blur"
                >
                  <p className="text-2xl font-black">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/48">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            id="preview"
            className="relative mx-auto w-full max-w-sm lg:ml-auto"
          >
            <div className="rounded-[2rem] border border-white/12 bg-white/10 p-2.5 shadow-2xl backdrop-blur-xl">
              <div className="overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#0f0f10] p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black tracking-tight">
                    Calendar
                  </h2>
                  <div className="flex items-center gap-4 text-white">
                    <Search className="h-6 w-6" />
                    <Star className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-white hover:bg-white/10 hover:text-white"
                    aria-label="Previous month preview"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <p className="text-xl font-black">June</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-white hover:bg-white/10 hover:text-white"
                    aria-label="Next month preview"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>

                <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
                  <div className="grid grid-cols-7 bg-white/[0.04] text-center text-xs font-bold uppercase text-white">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <span key={day} className="py-2.5">
                          {day}
                        </span>
                      ),
                    )}
                  </div>
                  <div className="grid grid-cols-7 bg-[#121212]">
                    {Array.from({ length: 28 }).map((_, index) => {
                      const day = index + 1;
                      const isSelected = day === 5;

                      return (
                        <div
                          key={day}
                          className={`min-h-[54px] border-r border-t border-white/[0.07] px-1.5 py-2 text-center last:border-r-0 ${
                            isSelected ? "bg-[#2c2948]" : "bg-[#141414]"
                          }`}
                        >
                          <p className="text-xl font-black leading-none">
                            {day}
                          </p>
                          <p className="mt-2 text-[11px] font-bold text-white/86">
                            +{calendarCounts[index]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {albums.map((album, index) => (
                    <div
                      key={album}
                      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-2.5"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#2c2948] text-[#b8b4ff]">
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {album}
                        </p>
                        <p className="text-xs text-white/48">
                          Featured release #{index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white px-5 py-20 text-black sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#4a456f]">
              Built for fans and admins
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
              A culture calendar with real utility.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-lg border border-black/10 bg-[#fafafa] p-6"
              >
                <feature.icon className="h-7 w-7 text-[#4a456f]" />
                <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-black/62">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="mobile" className="bg-[#080808] px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="overflow-hidden rounded-lg border border-white/12">
            <img
              src="/hiphop-pvc-img.jpg"
              alt="Hip-hop album calendar app preview"
              className="h-full min-h-[360px] w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b96ff]">
              Public by default
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
              Anyone can land here. Admin work stays protected.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
              The landing page is intentionally outside the auth guard, while
              content management routes remain behind login. That gives you a
              public marketing surface without weakening dashboard security.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 h-12 rounded-full bg-white px-7 text-black hover:bg-white/90"
            >
              <Link to="/login">Manage content</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#080808] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Hip Hop Calendar"
              className="h-9 w-9 rounded-lg object-contain"
            />
            <div>
              <p className="font-semibold tracking-tight">Hip Hop Calendar</p>
              <p className="text-sm text-white/48">
                &copy; {new Date().getFullYear()} Mousike Chron, LLC.
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              variant="ghost"
              className="justify-start rounded-full px-0 text-white/68 hover:bg-transparent hover:text-white sm:px-4"
            >
              <Link to="/privacy-policy">Privacy Policy</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="justify-start rounded-full px-0 text-white/68 hover:bg-transparent hover:text-white sm:px-4"
              onClick={() => undefined}
            >
              Terms & Conditions
            </Button>
          </div>
        </div>
      </footer>
    </main>
  );
}
