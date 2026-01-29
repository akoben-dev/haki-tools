// components/ContactSection.tsx
"use client";

import { useState } from "react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";

export function ContactSection() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <Section id="contact">
      <SectionHeading
        title="Tell me about your business"
        kicker="Share a few details and I’ll reply within one business day with next steps."
      />

      <form
        onSubmit={handleSubmit}
        className="mt-4 max-w-xl space-y-4 rounded-2xl border border-border bg-surface p-5 text-sm"
      >
        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-medium text-foreground">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="business" className="text-xs font-medium text-foreground">
            Business name (optional)
          </label>
          <input
            id="business"
            name="business"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="message" className="text-xs font-medium text-foreground">
            What do you need help with?
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center rounded-full bg-foreground px-5 py-2 text-xs font-medium text-background hover:bg-accent hover:text-foreground transition-colors disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>

        {status === "success" && (
          <p className="text-xs text-accent mt-2">
            Thanks—your message was sent. I’ll get back to you soon.
          </p>
        )}
        {status === "error" && (
          <p className="text-xs text-red-600 mt-2">
            Something went wrong. Please try again in a minute.
          </p>
        )}
      </form>
    </Section>
  );
}
