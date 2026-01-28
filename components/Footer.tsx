// components/Footer.tsx
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/90" id="contact">
      <Container>
        <div className="flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium">Ready to book more of the right jobs?</p>
            <p className="mt-1 text-xs text-muted">
              Tell me a bit about your business and I’ll follow up with next steps.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 text-xs text-muted md:items-end">
            <a
              href="mailto:you@haki.tools"
              className="text-sm text-foreground hover:text-accent"
            >
              you@haki.tools
            </a>
            <span>Charleston, South Carolina</span>
          </div>
        </div>
        <div className="border-t border-border/60 py-4 text-[11px] text-muted">
          © {new Date().getFullYear()} Haki Tools. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
