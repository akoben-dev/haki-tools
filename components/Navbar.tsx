// components/Navbar.tsx
import { Container } from "./Container";

export function Navbar() {
  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Left: Haki Tools logo */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-2xl bg-accent shadow-soft" />
            <span className="text-sm font-medium tracking-[0.18em] uppercase text-foreground">
              Haki Tools
            </span>
          </div>

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
