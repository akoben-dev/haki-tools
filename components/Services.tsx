// components/Services.tsx
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";

const services = [
  {
    name: "Always‑On Booking Website System",
    blurb:
      "Turn your website into a simple booking system so people can see what you do, trust you, and reach you fast—without you needing to sit by the phone.",
    points: [/* ... */],
    href: "/services/booking-system",
  },
  {
    name: "Follow‑Up That Actually Happens",
    blurb:
      "Set up simple pages and follow‑ups so when someone asks for a quote, they don’t slip through the cracks.",
    points: [/* ... */],
    href: "/services/follow-up",
  },
  {
    name: "AI‑Powered Inbox & Workflow Setup",
    blurb:
      "Add an AI helper that answers common questions, gathers job details, and sends the right replies so you’re not stuck answering the same messages all day.",
    points: [/* ... */],
    href: "/services/ai-inbox",
  },
];


export function Services() {
  return (
    <Section id="services">
      <SectionHeading
        eyebrow="Services"
        title="Three ways to serve"
        kicker="Pick the system that fits where your business is today. We can always combine pieces if you need a mix."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.name}
            className="flex flex-col rounded-2xl border border-border bg-surface/80 p-5 shadow-soft/40 transition-transform hover:-translate-y-1 hover:shadow-soft"
          >
            <h3 className="text-sm font-semibold">{service.name}</h3>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {service.blurb}
            </p>
            <ul className="mt-4 space-y-2 text-xs text-muted">
              {service.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <a
                href={service.href}
                className="mt-4 inline-flex items-center text-xs font-medium text-muted hover:text-foreground"
            >
    Learn more →
  </a>
          </div>
        ))}
      </div>
    </Section>
  );
}
