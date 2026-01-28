// components/SectionHeading.tsx
import { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  kicker,
}: {
  eyebrow?: string;
  title: string;
  kicker?: ReactNode;
}) {
  return (
    <div className="mb-8 max-w-2xl">
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
        {title}
      </h2>
      {kicker && (
        <p className="mt-3 text-sm leading-relaxed text-muted">{kicker}</p>
      )}
    </div>
  );
}
