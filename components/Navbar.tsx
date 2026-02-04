// components/Navbar.tsx
import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";

export function Navbar() {
  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Left: Haki Tools logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/haki-logo-horizontal.png"
              alt="Haki Tools"
              width={140}   // adjust after you see it
              height={32}
              priority
            />
          </Link>

          {/* Center: nav links */}
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#services" className="hover:text-foreground transition-colors">
              Services
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right: CTA */}
          <div className="flex items-center">
            <a
              href="#contact"
              className="rounded-full bg-foreground px-5 py-2 text-xs font-medium text-background hover:bg-accent hover:text-foreground transition-colors"
            >
              Free 20‑min call
            </a>
          </div>
        </div>
      </Container>
    </header>
  );
}
