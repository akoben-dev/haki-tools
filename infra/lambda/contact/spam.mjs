// Extra spam heuristics (no CAPTCHA). spamReason() returns a short reason string
// such as 'repeat-fields', or null for a submission that looks human.
import { PROJECT_TYPES, TIMELINES, BUDGETS } from './choices.mjs';

// Easy-to-edit blocklist. Edit freely; matching is case-insensitive.
// NAME_BLOCKLIST: a hit anywhere in the name drops the submission.
export const NAME_BLOCKLIST = [/robertwam/i];
// PRICE_PHRASES: "I wanted to know your price" bot messages. Only dropped when the
// whole message is short (SHORT_MESSAGE chars), so real questions about price pass.
export const PRICE_PHRASES = [
  /wanted to know (your|the) price/i,
  /quer[ií]a saber (tu|su) precio/i,
  /wollt [äa]re pr[äa]is w[ëe]ssen/i,
  /voulais conna[iî]tre (votre|ton) prix/i,
  /wollte (ihren|deinen) preis wissen/i,
  /volevo sapere (il tuo|il vostro|il suo) prezzo/i,
  /queria saber (o seu|seu) pre[çc]o/i,
];
export const SHORT_MESSAGE = 80;

const CHOICE_FIELDS = { project_type: PROJECT_TYPES, timeline: TIMELINES, budget: BUDGETS };
const TEXT_FIELDS = ['name', 'business_name', 'location', 'project_type', 'timeline', 'budget', 'description'];

/** @param {Record<string,string>} d validated, trimmed form data */
export function spamReason(d) {
  const counts = new Map();
  for (const k of TEXT_FIELDS) {
    const raw = String(d[k] ?? '').trim();
    // A real dropdown answer (e.g. "Not sure yet" three times) is not suspicious.
    if (CHOICE_FIELDS[k]?.includes(raw)) continue;
    const v = raw.toLowerCase();
    if (v) counts.set(v, (counts.get(v) || 0) + 1);
  }
  if ([...counts.values()].some((n) => n >= 3)) return 'repeat-fields';

  for (const [k, allowed] of Object.entries(CHOICE_FIELDS)) {
    const v = String(d[k] ?? '').trim();
    if (v && !allowed.includes(v)) return 'bad-choice';
  }

  if (NAME_BLOCKLIST.some((re) => re.test(d.name ?? ''))) return 'blocked-name';
  const msg = String(d.description ?? '').trim();
  if (msg.length < SHORT_MESSAGE && PRICE_PHRASES.some((re) => re.test(msg))) return 'price-phrase';
  return null;
}
