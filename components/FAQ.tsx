// components/FAQ.tsx
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";

const faqs = [
  {
    q: "How do projects usually start?",
    a: "We start with a free 20‑minute call where you tell me about your business, what’s working, and what isn’t. If I’m a good fit, I’ll send a simple proposal with scope, price, and timeline.",
  },
  {
    q: "How do payments work?",
    a: "Most projects are 50% to start and 50% on launch. For larger or ongoing work, we can break payments into milestones or monthly retainers.",
  },
  {
    q: "How long will my project take?",
    a: "Smaller projects can be done in 1–2 weeks. Full website systems or AI setups are usually 2–4 weeks once I have the info and decisions I need from you.",
  },
  {
    q: "Will I be stuck relying on you forever?",
    a: "No. My goal is to leave you with systems you understand and can run without me. If you want ongoing help, the Haki Care Plan is there—but it’s optional.",
  },
  {
    q: "Do you work with businesses outside Charleston?",
    a: "Yes. I’m based in Charleston, but I work remotely with local service businesses across the US via video calls and shared tools.",
  },
  {
    q: "What if I’m not very “techy”?",
    a: "That’s exactly who I build for. I keep the tech under the hood and explain what you need to know in normal language, step by step.",
  },
];

export function FAQ() {
  return (
    <Section id="faq">
      <SectionHeading
        eyebrow="FAQ"
        title="Common questions about working together"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {faqs.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-border bg-surface/80 p-4 text-sm"
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
  );
}
