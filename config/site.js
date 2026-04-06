/**
 * ============================================================
 * HAKI TOOLS — Site Configuration (Revised v2)
 * ============================================================
 * Edit this file to update copy, settings, and the form endpoint.
 * No other files need to be touched for basic customization.
 *
 * Brand green: #86D4A3 (from uploaded logo assets)
 * ============================================================
 */

const SITE_CONFIG = {

  // ── Brand ──────────────────────────────────────────────────
  brandName:        "Haki Tools",
  tagline:          "Technology to better your business.",
  location:         "Charleston, South Carolina",
  serviceArea:      "Charleston and surrounding South Carolina",

  // ── Colors (CSS custom properties — also in css/tokens.css) ─
  // To change the accent color, update --color-green in css/tokens.css
  // Brand green is derived from the uploaded Haki Tools logo assets.
  accentGreen:      "#86D4A3",   // brand green from logo
  accentGreenDark:  "#6ec490",   // hover/darker variant
  bgDark:           "#080e0b",   // near-black background with green tint
  bgSurface:        "#0c1410",   // card/section background

  // ── SEO ────────────────────────────────────────────────────
  seo: {
    title:       "Haki Tools | Technology to Better Your Business | Charleston, SC",
    description: "Haki Tools helps Charleston-area small businesses launch websites, upgrade their online presence, and automate workflows. Built for local SC business owners.",
    ogImage:     "assets/images/og-image.svg",
    canonical:   "https://hakitools.com",  // ← Update to your real domain
  },

  // ── Navigation ─────────────────────────────────────────────
  nav: {
    links: [
      { label: "Services",       href: "#services"  },
      { label: "Why it matters", href: "#outcomes"  },
      { label: "Process",        href: "#process"   },
      { label: "FAQ",            href: "#faq"       },
    ],
    cta: { label: "Tell me what you're building", href: "#contact" }
  },

  // ── Hero ───────────────────────────────────────────────────
  hero: {
    heading:    "Technology to better your business.",
    subheading: "Haki Tools helps Charleston-area businesses launch websites, upgrade their online presence, and automate the busy work — so you can focus on what actually matters.",
    cta:        { label: "Tell me what you're building", href: "#contact" },
    secondaryCta: { label: "See what we build ↓", href: "#services" },
  },

  // ── Services ───────────────────────────────────────────────
  services: {
    intro: "Every project starts with a conversation. These are the ways most businesses work with us.",
    // Copy note: headings intentionally omit trailing periods
    lanes: [
      {
        id:    "launch",
        icon:  "rocket",
        label: "Launch",
        who:   "For businesses starting something new and needing a website or lightweight web app.",
        bullets: [
          "A site that makes the right first impression, every time",
          "Clear next steps so customers know exactly how to reach you",
          "Simple intake so people actually contact you",
        ],
      },
      {
        id:    "upgrade",
        icon:  "sparkles",
        label: "Upgrade",
        who:   "For businesses whose current site no longer fits where they're headed.",
        bullets: [
          "A site that matches the quality of your work",
          "Better conversion — more visitors become real leads",
          "Ready to support the next stage of your business",
        ],
      },
      {
        id:    "automate",
        icon:  "cpu",
        label: "Automate",
        who:   "For businesses that want AI or smart workflows integrated into their existing operations.",
        bullets: [
          "Follow-ups that don't get lost in your inbox",
          "Workflows that keep running even when you're not",
          "AI tools integrated into what you already use",
        ],
      },
      {
        id:    "customization",
        icon:  "edit",
        label: "Customization",
        who:   "For businesses with a specific challenge that doesn't fit neatly into one category — but still has a clear goal.",
        bullets: [
          "Flexible problem-solving shaped around your situation",
          "A plan built from your actual needs, not a template",
          "The right outcome — however we need to get there",
        ],
      },
    ]
  },

  // ── Outcomes ───────────────────────────────────────────────
  outcomes: {
    // Note: no trailing period on heading per brand revision
    heading: "What good technology actually does for your business",
    subheading: "The right tools don't just look good — they do real work while you're busy running things.",
    items: [
      {
        icon: "eye",
        title: "A stronger first impression",
        body: "Your website is often the first thing a potential customer sees. It should immediately reflect the quality you deliver in person.",
      },
      {
        icon: "target",
        title: "More clarity for customers",
        body: "When visitors understand what you do and what to do next, they reach out. Clear sites bring in more of the right people.",
      },
      {
        icon: "bell-off",
        title: "Fewer missed opportunities",
        body: "A well-built site and smart follow-up system means leads don't slip away when you're busy running the business.",
      },
      {
        icon: "zap",
        title: "Less manual back-and-forth",
        body: "Smart systems take care of the repetitive tasks — so you spend your time on work that actually needs you.",
      },
    ]
  },

  // ── Process ────────────────────────────────────────────────
  process: {
    // Note: no trailing period on heading per brand revision
    heading: "How we build it together",
    subheading: "This isn't something we throw over the wall. Every step involves you — from the first conversation to the day you launch.",
    steps: [
      {
        number: "01",
        title:  "Tell me what you're building",
        body:   "Fill out the intake form and we'll set up a quick call to go over what you want to build. No pressure — just a conversation.",
      },
      {
        number: "02",
        title:  "Shape the plan",
        body:   "We map out scope, milestones, and pricing together. Nothing surprises you. You know exactly what you're getting before any work starts.",
      },
      {
        number: "03",
        title:  "Build, review, and refine",
        // "staging" replaced with "functioning demo" for non-technical audience
        body:   "You see the work in progress in a functioning demo and give feedback before anything goes live. Your input shapes the final product.",
      },
      {
        number: "04",
        title:  "Launch, hand off, and support",
        body:   "We launch when you're ready. Maintain it yourself, hand it off clean, or have us keep it running — whatever works for you.",
      },
    ]
  },

  // ── FAQ ────────────────────────────────────────────────────
  faq: {
    heading: "Questions you probably have.",
    items: [
      {
        q: "How fast can we get started?",
        a: "Once you submit the intake form, you'll hear back within 24–48 hours to set up a call. We'll go over what you want to build, answer any questions, and figure out if we're a good fit — before committing to anything.",
      },
      {
        q: "How does pricing work?",
        // "staging" replaced with "working demo"
        a: "Everything is project-based with milestone payments. Typically: 40% upfront to reserve the project and start planning, 40% when the core build is ready in a working demo for your review, and 20% before final launch or handoff. No hidden fees, no surprises.",
      },
      {
        q: "What will I actually get at the end?",
        a: "That's up to you. Some clients want to manage things themselves — we'll walk you through everything. Some want us to maintain it ongoing. Others want a clean handoff to their own team or a future hire. We build it so any of those paths works.",
      },
      {
        q: "Do you only work with Charleston businesses?",
        a: "Charleston and the greater South Carolina area are home base, but the work is fully remote-friendly. If you're in SC and want to build something, let's talk. If you're outside SC and found us — reach out anyway and we'll see if it's a fit.",
      },
      {
        q: "Do you use AI in every project?",
        a: "Only where it actually makes sense. AI is a tool — not a buzzword. For some businesses it's genuinely powerful: automating follow-ups, building smart contact forms, sorting through your inbox. For others, a clean, fast website does the job perfectly well. We'll be honest about what helps and what doesn't.",
      },
    ]
  },

  // ── Contact / Intake Form ──────────────────────────────────
  contact: {
    heading:    "Tell me what you're building.",
    subheading: "Fill in what you can. This is low-pressure — we'll figure out the details together on a short call. No commitment required.",
    ctaLabel:   "Tell me what you're building",
    successMessage: "You're in. Expect a reply within 24–48 hours to set up a quick call.",
    successDetail:  "We'll go over what you want to build and see if it's a good fit. No commitment required.",
    errorMessage:   "Something went wrong sending your message. Try refreshing and submitting again.",
    trustItems: [
      "Reply within 24–48 hours",
      "No sales pressure, just a conversation",
      "Based in Charleston, SC",
    ],
  },

  // ── Footer ─────────────────────────────────────────────────
  footer: {
    brand:     "Haki Tools",
    location:  "Charleston, South Carolina",
    copyright: `© ${new Date().getFullYear()} Haki Tools. All rights reserved.`,
    // To add social links, uncomment and fill in:
    // socials: [
    //   { label: "Instagram", href: "https://instagram.com/hakitools" },
    //   { label: "LinkedIn",  href: "https://linkedin.com/company/hakitools" },
    // ]
    socials: []
  },

  // ── Form Provider (Formspree) ──────────────────────────────
  // HOW TO SET UP FORMSPREE:
  //   1. Go to https://formspree.io and create a free account.
  //   2. Click "New Form" and give it a name (e.g. "Haki Tools Contact").
  //   3. Copy the form endpoint — it looks like: https://formspree.io/f/xabcdefg
  //   4. Paste it below as the value of formEndpoint.
  //   5. Save this file and re-upload to your VPS. Done.
  form: {
    provider:          "formspree",
    formEndpoint:      "https://formspree.io/f/maqlazjq",  // ← Replace this
    notificationEmail: "robbie.robinson@akoben.ai",     // ← Where replies go
  },

};

window.SITE_CONFIG = SITE_CONFIG;
