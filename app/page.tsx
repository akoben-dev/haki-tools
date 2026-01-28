// app/page.tsx
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Services } from "@/components/Services";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";

export default function HomePage() {
  return (
    <main className="bg-background text-foreground">
      <Navbar />
      <Hero />
      <Services />
      <Pricing />
      <FAQ />
    </main>
  );
}
