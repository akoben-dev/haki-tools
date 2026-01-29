// app/services/follow-up/page.tsx
import { Section } from "@/components/Section";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

const faqs = [
  {
    q: "Who is this for?",
    a: "Local service businesses that get a decent number of inquiries, but know too many of them slip through the cracks because follow‑up is inconsistent.",
  },
  {
    q: "Do I need an email or SMS tool already?",
    a: "Not necessarily. If you have one, I’ll use it. If not, I’ll recommend a simple tool that fits your budget and set it up for you.",
  },
  {
    q: "Will this feel spammy to my customers?",
    a: "No. Messages are spaced out and written in a friendly, human tone. People generally appreciate a quick confirmation and a reminder when they’ve asked for a quote.",
  },
  {
    q: "Can I change the messages later?",
    a: "Yes. I’ll show you exactly where the messages live so you can edit them anytime—or I can handle changes as part of ongoing support.",
  },
  {
    q: "How will I know if it’s working?",
    a: "We’ll track how many people hit your page, how many fill out the form, and how many actually book. I’ll walk you through the numbers in plain language.",
  },
];

export default function FollowUpPage() {
  return (
    <main className="bg-background text-foreground">
      <Section className="pt-20 md:pt-24">
        <Container>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
            Service
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Follow‑Up That Actually Happens
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Set up simple pages and follow‑ups so when someone asks for a quote,
            they don’t slip through the cracks—you stay in front of them until
            they’re ready to book.
          </p>
        </Container>
      </Section>

      {/* Who it’s for + outcomes */}
      <Section>
        <div className="grid gap-8 md:grid-cols-[1.5fr_minmax(0,1fr)]">
          <div>
            <SectionHeading
              title="For businesses that hate losing warm leads"
              kicker="If you’re busy enough that you sometimes forget to reply or follow up, this system keeps the conversation going for you."
            />
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>• People request quotes but never hear back quickly.</li>
              <li>• You mean to follow up, but jobs and life get in the way.</li>
              <li>• You’re not sure which ads, posts, or directories are worth paying for.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <h3 className="text-[13px] font-semibold">
              What this system focuses on
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-muted">
              <li>• Capturing the right details the first time.</li>
              <li>• Confirming quickly so people know you got their request.</li>
              <li>• Sending gentle reminders so good jobs don’t quietly disappear.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* What you get */}
      <Section>
        <SectionHeading
          title="What you get"
          kicker="A focused funnel and follow‑up flow that keeps you in touch without adding more work."
        />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <h3 className="text-[13px] font-semibold">Quote / booking page</h3>
            <p className="mt-2 text-xs text-muted">
              A clean “Get a quote” or “Book now” page that collects just the
              details you need to say yes, no, or give a clear estimate.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <h3 className="text-[13px] font-semibold">Automatic follow‑ups</h3>
            <p className="mt-2 text-xs text-muted">
              Confirmation messages and reminders by email or text so people
              don’t forget about you while they shop around.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <h3 className="text-[13px] font-semibold">Simple reporting</h3>
            <p className="mt-2 text-xs text-muted">
              Basic numbers that show how many leads come in, how many reply,
              and which sources drive real jobs—not just clicks.
            </p>
          </div>
        </div>
      </Section>

      {/* Process */}
      <Section>
        <SectionHeading
          title="How the project works"
          kicker="We plug into how people already find you, then tighten up the path to a booked job."
        />
        <ol className="space-y-4 text-sm text-muted">
          <li>
            <strong className="font-medium text-foreground">
              1. Map your current flow
            </strong>
            <p className="mt-1 text-xs">
              We look at how leads reach you now—website, phone, DMs, ads, or
              directories—and where they tend to drop off.
            </p>
          </li>
          <li>
            <strong className="font-medium text-foreground">
              2. Design the funnel
            </strong>
            <p className="mt-1 text-xs">
              I sketch the simplest path from “interested” to “booked,” focused
              on one main offer or booking action.
            </p>
          </li>
          <li>
            <strong className="font-medium text-foreground">
              3. Build & connect
            </strong>
            <p className="mt-1 text-xs">
              I build the page, set up the form, and connect everything to your
              email or SMS tool so confirmations and reminders are automatic.
            </p>
          </li>
          <li>
            <strong className="font-medium text-foreground">
              4. Test & refine
            </strong>
            <p className="mt-1 text-xs">
              We run through real examples together, adjust wording and timing,
              and make sure notifications land where you want them.
            </p>
          </li>
          <li>
            <strong className="font-medium text-foreground">
              5. 30‑day review
            </strong>
            <p className="mt-1 text-xs">
              After a month, we review the numbers and decide if we should tweak
              pages, messages, or where you send traffic.
            </p>
          </li>
        </ol>
      </Section>

      {/* Pricing band */}
      <Section>
        <SectionHeading
          title="Pricing for this system"
          kicker="Most clients start here and then add monthly tuning once they see it working."
        />
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 text-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Typical range
            </p>
            <p className="mt-1 text-xl font-semibold">$600 – $1,500</p>
          </div>
          <p className="max-w-md text-xs text-muted">
            Pricing depends on whether we’re adding a simple follow‑up to your
            existing site or building a more complete funnel with multiple
            messages and reports. After our call, you’ll get a clear, fixed quote.
          </p>
        </div>
      </Section>

      {/* FAQs */}
      <Section>
        <SectionHeading title="Questions about Follow‑Up That Actually Happens" />
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
