// C3: contact form handler (Node.js 22, no dependencies beyond the runtime's AWS SDK).
//   GET  /api/contact/token  -> { token } : HMAC-signed timestamp, fetched by the form's JS
//   POST /api/contact        -> validates, filters spam, emails Everett through SES
// Request bodies are never logged; logs hold only an outcome and sizes.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ses = new SESv2Client({});
const ssm = new SSMClient({});
const { FROM_ADDRESS, TO_ADDRESS, HMAC_PARAM } = process.env;
const MIN_FILL_MS = 3000;
const MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_URLS = 3;

let keyPromise;
const hmacKey = () =>
  (keyPromise ??= ssm
    .send(new GetParameterCommand({ Name: HMAC_PARAM, WithDecryption: true }))
    .then((r) => r.Parameter.Value));

const sign = async (ts) => createHmac('sha256', await hmacKey()).update(String(ts)).digest('base64url');

/** 'ok' | 'missing' | 'bad' | 'fast' | 'stale' */
async function checkToken(token, now) {
  if (!token) return 'missing';
  const [ts, mac] = String(token).split('.');
  const n = Number(ts);
  if (!Number.isFinite(n) || !mac) return 'bad';
  const expected = Buffer.from(await sign(n));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return 'bad';
  if (now - n < MIN_FILL_MS) return 'fast';
  if (now - n > MAX_TOKEN_AGE_MS) return 'stale';
  return 'ok';
}

const FIELDS = {
  name: { max: 120, required: true, msg: 'Please enter your name.' },
  email: { max: 200, required: true, msg: 'Please enter a valid email address.' },
  business_name: { max: 160, required: true, msg: 'Please enter your business name.' },
  description: { max: 5000, min: 10, required: true, msg: 'A sentence or two about the project helps.' },
  location: { max: 120 },
  project_type: { max: 80 },
  timeline: { max: 120 },
  budget: { max: 120 },
};
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
const oneLine = (s) => s.replace(/[\r\n\t]+/g, ' ').trim();

export function validate(input) {
  const data = {};
  const errors = {};
  for (const [k, rule] of Object.entries(FIELDS)) {
    const v = String(input[k] ?? '').trim();
    data[k] = v;
    if (rule.required && !v) errors[k] = rule.msg;
    else if (v.length > rule.max) errors[k] = `Please keep this under ${rule.max} characters.`;
    else if (rule.min && v.length < rule.min) errors[k] = rule.msg;
  }
  if (data.email && !errors.email && !EMAIL_RE.test(data.email)) errors.email = FIELDS.email.msg;
  return { data, errors };
}

function parseBody(event) {
  const raw = event.body ? (event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body) : '';
  const type = (event.headers?.['content-type'] || '').toLowerCase();
  if (raw.length > 20000) return { input: null, json: type.includes('json') };
  if (type.includes('application/json')) {
    try {
      return { input: JSON.parse(raw), json: true };
    } catch {
      return { input: null, json: true };
    }
  }
  return { input: Object.fromEntries(new URLSearchParams(raw)), json: false };
}

const json = (status, body) => ({
  statusCode: status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  body: JSON.stringify(body),
});
const redirect = (path) => ({
  statusCode: 303,
  headers: { location: `${path}`, 'cache-control': 'no-store' },
  body: '',
});

/** No-JS send failure: a 502 whose page forwards to /contact/error/. */
const errorPage = () => ({
  statusCode: 502,
  headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  body: `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/contact/error/"><title>Message not sent</title><p>Your message could not be sent. <a href="/contact/error/">Continue</a>.</p>`,
});

function emailText(d) {
  return [
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Business: ${d.business_name}`,
    `Location: ${d.location || '-'}`,
    `Project type: ${d.project_type || '-'}`,
    `Timeline: ${d.timeline || '-'}`,
    `Budget: ${d.budget || '-'}`,
    '',
    d.description,
    '',
    '-- Sent from the contact form on haki.tools. Reply to answer the sender directly.',
  ].join('\n');
}

const log = (fields) => console.log(JSON.stringify(fields));

export async function handler(event) {
  const method = event.requestContext?.http?.method;
  const path = event.rawPath;

  if (method === 'GET' && path === '/api/contact/token') {
    const ts = Date.now();
    return json(200, { token: `${ts}.${await sign(ts)}` });
  }
  if (method !== 'POST' || path !== '/api/contact') return json(404, { ok: false });

  const now = Date.now();
  const { input, json: wantsJson } = parseBody(event);
  const done = () => (wantsJson ? json(200, { ok: true }) : redirect('/contact/thanks/'));
  if (!input || typeof input !== 'object') {
    log({ outcome: 'unparseable' });
    return wantsJson ? json(400, { ok: false }) : redirect('/contact/error/');
  }

  // Bots: answer exactly like a success, but send nothing.
  if (String(input.company_website ?? '').trim()) return log({ outcome: 'honeypot' }), done();
  const token = await checkToken(input.token, now);
  if (token === 'bad' || token === 'fast') return log({ outcome: `token-${token}` }), done();
  if ((String(input.description ?? '').match(/https?:\/\//gi) || []).length > MAX_URLS)
    return log({ outcome: 'too-many-links' }), done();

  const { data, errors } = validate(input);
  if (Object.keys(errors).length) {
    log({ outcome: 'invalid', fields: Object.keys(errors) });
    return wantsJson ? json(400, { ok: false, errors }) : redirect('/contact/error/');
  }

  const subject = oneLine(`New inquiry: ${data.business_name} (${data.project_type || 'Not sure yet'})`).slice(0, 150);
  try {
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: FROM_ADDRESS,
        Destination: { ToAddresses: [TO_ADDRESS] },
        ReplyToAddresses: [oneLine(data.email)],
        Content: { Simple: { Subject: { Data: subject }, Body: { Text: { Data: emailText(data) } } } },
      }),
    );
  } catch (err) {
    // A 5xx (not a 303) so the API's 5xx alarm (C6) fires for both kinds of request.
    log({ outcome: 'send-failed', error: err?.name });
    return wantsJson ? json(502, { ok: false }) : errorPage();
  }
  log({ outcome: 'sent', token, chars: data.description.length });
  return done();
}
