// Content layer: all page copy lives in src/content and is validated here.
// Motion code never reads these strings; it only reads section ids and
// particle target names, so copy can change without touching animation logic.
import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const particleTarget = z.enum(['field', 'logo', 'web', 'growth', 'network', 'rings']);

const link = z.object({ label: z.string(), href: z.string() });

// Section copy, keyed by section id (hero, statement, services, outcomes, ...).
const copy = defineCollection({
  loader: file('src/content/copy.json'),
  schema: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    body: z.string().optional(),
    // Statement text: wrap a word in *asterisks* to set it in the accent colour.
    statement: z.string().optional(),
    cta: link.optional(),
    secondaryCta: link.optional(),
    trust: z.array(z.string()).optional(),
    success: z.object({ heading: z.string(), body: z.string() }).optional(),
    privacyNote: z.string().optional(),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '*.md', base: 'src/content/services' }),
  schema: z.object({
    order: z.number(),
    lane: z.string(),
    title: z.string(),
    who: z.string(),
    bullets: z.array(z.string()).min(1),
    particle: particleTarget,
  }),
});

const outcomes = defineCollection({
  loader: file('src/content/outcomes.json'),
  schema: z.object({ order: z.number(), title: z.string(), body: z.string() }),
});

const process = defineCollection({
  loader: file('src/content/process.json'),
  schema: z.object({ order: z.number(), title: z.string(), body: z.string() }),
});

const faq = defineCollection({
  loader: file('src/content/faq.json'),
  schema: z.object({ order: z.number(), question: z.string(), answer: z.string() }),
});

export const collections = { copy, services, outcomes, process, faq };
