// app/services/booking-system/page.tsx
import { Section } from "@/components/Section";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

const faqs = [
  {
    q: "Who is this for?",
    a: "Local service businesses like plumbers, contractors, stylists, and cleaners who spend most of the day in the field and want their website to act like a simple front desk that books work.",
  },
  {
    q: "How long does it take?",
    a: "Most sites take 2–4 weeks once I have your content and decisions. Simple one‑page sites can be quicker; larger builds take a bit longer.",
  },
  {
    q: "Do I have to write all the text?",
    a: "No. I’ll ask you some questions, look at what you already have, and then draft the copy in plain language for your approval.",
  },
  {
    q: "Can you use my existing domain and email?",
    a: "Yes. I’ll connect your new site to your current domain and keep your email working as‑is.",
  },
  {
    q: "What platform will you use?",
    a: "I choose a platform that fits how you want to work and how comfortable you are with updates. The goal is something you can edit without needing me for every tiny change.",
  },
];

export default function BookingSystemPage() {
  return (
    <main className="bg-background text-foreground">
      <Section className="pt-20 md:pt-24">
        <Container>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
            Service
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Always‑On Booking Website System
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Turn your website into a simple booking system so people can see what
            you do, trust you, and reach you fast—without you needing to sit by
            the phone.
          </p>
        </Container>
      </Section>

      {/* Who it’s for + outcomes */}
      <Section>
        <div className="grid gap-8 md:grid-cols-[1.5fr_minmax(0,1fr)]">
          <div>
            <SectionHeading
              title="For local businesses that need their website to pull its weight"
              kicker="If most of your work comes from calls, messages, and referrals, this system helps you look more professional and makes it easier for people to book you."
            />
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>• Your current website is old, basic, or built by “a friend.”</li>
              <li>• People say they couldn’t figure out how to contact you.</li>
              <li>• You’re not sure what to put on your site to build trust.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <h3 className="text-[13px] font-semibold">
              What this system focuses on
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-muted">
              <li>• Clear services, areas you cover, and who you’re a good fit for.</li>
              <li>• Simple paths to call, text, or request a quote from any page.</li>
              <li>• Pages that feel like your business, not a generic template.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* What you get */}
      <Section>
        <SectionHeading
          title="What you get"
          kicker="A modern, mobile‑friendly website built to book jobs, not just sit there."
        />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <h3 className="text-[13px] font-semibold">Clear structure</h3>
            <p className="mt-2 text-xs text-muted">
              A simple set of pages—home, services, about, FAQs, contact—so people
              can quickly see what you do and where you work.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <h3 className="text-[13px] font-semibold">Booking built‑in</h3>
            <p className="mt-2 text-xs text-muted">
              Prominent call, text, and “request a quote” options wired to the
              channels you actually use: phone, SMS, WhatsApp, or email.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <h3 className="text-[13px] font-semibold">Trust elements</h3>
            <p className="mt-2 text-xs text-muted">
              Photos, FAQs, and reviews so site visitors feel comfortable choosing
              you before they ever speak to you.
            </p>
          </div>
        </div>
      </Section>

      {/* Process */}
      <Section>
        <SectionHeading
          title="How the project works"
          kicker="A simple, guided process so you don’t get stuck making a hundred tiny decisions."
        />
        <ol className="space-y-4 text-sm text-muted">
          <li>
            <strong className="font-medium text-foreground">
              1. Quick discovery call
            </strong>
            <p className="mt-1 text-xs">
              We talk about your business, your best customers, and what’s
              currently happening with your website or online presence.
            </p>
          </li>
          <li>
            <strong className="font-medium text-foreground">
              2. Content & structure
            </strong>
            <p className="mt-1 text-xs">
              I map out the pages you actually need and help you gather or write
              simple content: services, service areas, photos, and reviews.
            </p>
          </li>
          <li>
            <strong className="font-medium text-foreground">
              3. Design & build
            </strong>
            <p className="mt-1 text-xs">
              I design and build the site on a platform that matches how hands‑on
              you want to be. You see a working preview before anything goes live.
            </p>
          </li>
          <li>
            <strong className="font-medium text-foreground">
              4. Launch & connect
            </strong>
            <p className="mt-1 text-xs">
              I connect your domain, wire up forms and buttons to your preferred
              contact methods, and test everything on mobile.
            </p>
          </li>
          <li>
            <strong className="font-medium text-foreground">
              5. Walkthrough & handoff
            </strong>
            <p className="mt-1 text-xs">
              We hop on a call where I walk you through how your new site works
              and how to make small edits on your own.
            </p>
          </li>
        </ol>
      </Section>

      {/* Pricing band */}
      <Section>
        <SectionHeading
          title="Pricing for this system"
          kicker="Most clients investing in this system fall between these ranges."
        />
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 text-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Typical range
            </p>
            <p className="mt-1 text-xl font-semibold">$1,500 – $2,500</p>
          </div>
          <p className="max-w-md text-xs text-muted">
            Final pricing depends on how many pages you need, whether we’re
            starting from scratch or rebuilding an existing site, and any extra
            integrations. After our first call, you’ll get a fixed project price.
          </p>
        </div>
      </Section>

      {/* FAQs */}
      <Section>
        <SectionHeading title="Questions about the Booking Website System" />
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border bg-surface p-4 text-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-[13px] font-medium">{item.q}</span>
                <span className="text-xs text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </main>
  );
}
