// components/Pricing.tsx
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";

const rows = [
  {
    service: "Always‑On Booking Website System",
    purpose: "Turn your website into a 24/7 front desk that books jobs.",
    range: "$1,500 – $2,500",
  },
  {
    service: "Follow‑Up That Actually Happens",
    purpose: "Stop warm leads going cold with simple funnels and reminders.",
    range: "$600 – $1,500",
  },
  {
    service: "AI‑Powered Inbox & Workflow Setup",
    purpose: "Add an AI helper to answer questions and sort leads.",
    range: "$1,600 – $2,500",
  },
  {
    service: "Haki Care Plan (monthly add‑on)",
    purpose: "Keep your site and automations healthy and up‑to‑date.",
    range: "from $150 / month",
  },
];

export function Pricing() {
  return (
    <Section id="pricing">
      <SectionHeading
        eyebrow="Pricing"
        title="Clear, simple ranges for your business"
        kicker="Most clients land in these ranges. After a quick call, you’ll get a fixed quote so there are no surprises."
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface/80">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1.2fr)] bg-subtle px-4 py-3 text-xs font-medium text-muted md:px-6">
          <span>Service system</span>
          <span>What it’s for</span>
          <span className="text-right">Typical range*</span>
        </div>
        <div className="divide-y divide-border/70">
          {rows.map((row) => (
            <div
              key={row.service}
              className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1.2fr)] items-start gap-3 px-4 py-4 text-xs md:px-6"
            >
              <span className="font-medium text-foreground">{row.service}</span>
              <span className="text-muted">{row.purpose}</span>
              <span className="text-right text-foreground">{row.range}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-muted">
        *Final pricing depends on scope, tools, and how many moving parts you
        need. We’ll agree on a fixed price before any work starts.
      </p>
    </Section>
  );
}
