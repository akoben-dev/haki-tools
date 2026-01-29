// app/services/ai-inbox/page.tsx
import { Section } from "@/components/Section";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

const faqs = [
  {
    q: "Who is this for?",
    a: "Local businesses that get lots of calls, emails, or DMs with the same kinds of questions and want help handling the routine parts.",
  },
  {
    q: "Will the AI sound like a robot?",
    a: "I train it on your services, policies, and tone, then we test and tweak together. The goal is a smart helper that sounds like your business, not a script.",
  },
  {
    q: "Can the AI give wrong answers?",
    a: "It can if set up poorly. I limit what it’s allowed to say, feed it your exact info, and set clear rules for when it should hand off to you.",
  },
  {
    q: "Where does the AI live?",
    a: "Usually as a chat on your website, an assistant that helps with email replies, or a helper tied to your contact form. We’ll pick what fits how you work.",
  },
  {
    q: "Can we start small and expand later?",
    a: "Yes. Many clients start with one helper and add more channels or rules once they’re comfortable.",
  },
];

export default function AiInboxPage() {
  return (
    <main className="bg-background text-foreground">
      <Section className="pt-20 md:pt-24">
        <Container>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
            Service
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            AI‑Powered Inbox & Workflow Setup
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Add an AI helper that answers common questions, gathers job details,
            and sends the right replies so you’re not stuck answering the same
            messages all day.
          </p>
        </Container>
      </Section>

      {/* Who it’s for + outcomes */}
      <Section>
        <div className="grid gap-8 md:grid-cols-[1.5fr_minmax(0,1fr)]">
          <div>
            <SectionHeading
              title="For teams drowning in repeat questions"
              kicker="If your phone, inbox, or DMs are full of the same things over and over, this system takes the first pass so you can focus on real work."
            />
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>• You answer “Do you do X?” and “How much is Y?” all day long.</li>
              <li>• You want better info from leads before you jump on the phone.</li>
              <li>• You’re curious about AI, but don’t want something weird or risky.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <h3 className="text-[13px] font-semibold">
              What this system focuses on
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-muted">
              <li>• Fast, accurate answers to common questions.</li>
              <li>• Collecting job details before you get involved.</li>
              <li>• Routing the right requests to the right place or person.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* What you get */}
      <Section>
        <SectionHeading
          title="What you get"
          kicker="A practical AI assistant, wired into your real‑world tools and ways of working."
        />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <h3 className="text-[13px] font-semibold">AI helper setup</h3>
            <p className="mt-2 text-xs text-muted">
              An AI assistant trained on your services, service area, policies,
              and FAQs—ready to handle the most common questions.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <h3 className="text-[13px] font-semibold">Smart routing</h3>
            <p className="mt-2 text-xs text-muted">
              Rules for where different requests go: emergencies, quotes, and
              quick questions each follow a different path.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <h3 className="text-[13px] font-semibold">Control & training</h3>
            <p className="mt-2 text-xs text-muted">
              A short training session and guide so you can review conversations,
              adjust what the AI knows, and turn it off anytime.
            </p>
          </div>
        </div>
      </Section>

      {/* Process */}
      <Section>
        <SectionHeading
          title="How the project works"
          kicker="We start from your real messages, then design an assistant that feels like part of your team."
        />
        <ol className="space-y-4 text-sm text-muted">
          <li>
            <strong className="font-medium text-foreground">
              1. Message audit
            </strong>
            <p className="mt-1 text-xs">
              We look at recent calls, emails, and DMs to see what people
              actually ask and how you like to respond.
            </p>
          </li>
          <li>
            <strong className="font-medium text-foreground">
              2. Assistant design
            </strong>
            <p className="mt-1 text-xs">
              I choose the right place for the AI (site chat, email helper, form
              assistant) and outline exactly what it should handle and what it
              should leave to you.
            </p>
          </li>
          <li>
            <strong className="font-medium text-foreground">
              3. Setup & routing
            </strong>
            <p className="mt-1 text-xs">
              I connect the AI to your tools, set up routing rules, and make
              sure notifications go where you want them.
            </p>
          </li>
          <li>
            <strong className="font-medium text-foreground">
              4. Testing with real scenarios
            </strong>
            <p className="mt-1 text-xs">
              We run through real‑world examples and refine answers, hand‑off
              rules, and tone until it feels right.
            </p>
          </li>
          <li>
            <strong className="font-medium text-foreground">
              5. Training & handover
            </strong>
            <p className="mt-1 text-xs">
              You get a walkthrough and a simple guide so you can monitor,
              adjust, or pause the assistant whenever you want.
            </p>
          </li>
        </ol>
      </Section>

      {/* Pricing band */}
      <Section>
        <SectionHeading
          title="Pricing for this system"
          kicker="Most small businesses land between these ranges for a full setup."
        />
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 text-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Typical range
            </p>
            <p className="mt-1 text-xl font-semibold">$1,600 – $2,500</p>
          </div>
          <p className="max-w-md text-xs text-muted">
            Pricing depends on how many channels you want the AI to help with,
            how complex your routing rules are, and what tools we connect to.
            After our first call, you’ll get a fixed price for your setup.
          </p>
        </div>
      </Section>

      {/* FAQs */}
      <Section>
        <SectionHeading title="Questions about the AI‑Powered Inbox & Workflow Setup" />
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
