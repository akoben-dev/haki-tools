// components/Hero.tsx
import Image from "next/image";
import { Section } from "./Section";

export function Hero() {
  return (
    <Section className="pt-24 md:pt-32">
      <div className="flex flex-col items-center text-center">
        <Image
          src="/haki-logo-text.png"
          alt="Haki Tools Text"
          width={400}
          height={400}
        />

        <p className="mt-4 text-sm text-muted md:text-base">
          Technology to better your business.
        </p>

        {/* Icon in hero */}
        <div className="mt-12">
          <Image
            src="/haki-icon.png" // file placed in /public
            alt="Haki Tools icon"
            width={220}
            height={220}
            priority
          />
        </div>
      </div>
    </Section>
  );
}
