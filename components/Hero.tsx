// components/Hero.tsx
import { Section } from "./Section";

export function Hero() {
  return (
    <Section className="pt-24 md:pt-32">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
          Haki Tools
        </h1>

        <p className="mt-4 text-sm text-muted md:text-base">
         Technology to better your business.
        </p>

        {/* Optional: subtle placeholder for a future 3D/2D visual */}
        <div className="mt-12 h-60 w-60 rounded-full border border-border relative">
  <div className="absolute inset-2 rounded-full bg-[conic-gradient(from_0deg,_rgba(159,226,191,0.85),_rgba(159,226,191,0.08),_rgba(159,226,191,0.85))] animate-spin-slow" />
  <div className="absolute inset-5 rounded-full border border-accent/40 animate-pulse-soft" />
  <div className="absolute inset-8 rounded-full bg-surface" />
</div>

      </div>
    </Section>
  );
}
