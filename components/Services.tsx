// components/Services.tsx
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";

const services = [
  {
    name: "Always‑On Booking Website System",
    blurb:
      "Turn your website into a simple booking system so people can see what you do, trust you, and reach you fast—without you needing to sit by the phone.",
    points: [
      "Clean, mobile‑friendly site that makes what you do and where you work instantly clear.",
      "Buttons to call, text, or book from anywhere on the site.",
      "Photos, FAQs, and reviews so people feel comfortable choosing you.",
    ],
  },
  {
    name: "Follow‑Up That Actually Happens",
    blurb:
      "Set up simple pages and follow‑ups so when someone asks for a quote, they don’t slip through the cracks.",
    points: [
      "Focused “Get a quote” or “Book now” page that collects the info you need.",
      "Automatic confirmations and reminders by email or text.",
      "Basic stats so you can see what’s bringing in real jobs, not just clicks.",
    ],
  },
  {
    name: "AI‑Powered Inbox & Workflow Setup",
    blurb:
      "Add an AI helper that answers common questions, gathers job details, and sends the right replies so you’re not stuck answering the same messages all day.",
    points: [
      "AI that can answer common questions and collect job details before you jump in.",
      "Smart routing so emergencies, quotes, and quick questions go to the right place.",
      "Training so you and your team know how to tweak what it says.",
    ],
  },
];

export function Services() {
  return (
    <Section id="services">
      <SectionHeading
        eyebrow="Services"
        title="Three ways I help"
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
          </div>
        ))}
      </div>
    </Section>
  );
}
