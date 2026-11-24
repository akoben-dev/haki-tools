// Run: node --test infra/lambda/contact/spam.test.mjs
// (index.mjs is not imported: its AWS SDK only exists inside the Lambda runtime.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spamReason } from './spam.mjs';

const base = { email: 'someone@example.com', location: '', project_type: 'Not sure yet', timeline: '', budget: '' };

test('real RobertWam sample #1 is dropped', () => {
  const d = { ...base, name: 'RobertWam', business_name: 'RobertWam', timeline: 'RobertWam', location: 'Georgia', budget: '151314', description: 'Salut, ech wollt Äre Präis wëssen.' };
  assert.equal(spamReason(d), 'repeat-fields');
});
test('real RobertWam sample #2 is dropped', () => {
  const d = { ...base, name: 'RobertWam', business_name: 'RobertWam', timeline: 'RobertWam', location: 'Georgia', budget: '145515', description: 'Hola, quería saber tu precio..' };
  assert.equal(spamReason(d), 'repeat-fields');
});
test('repeat check is case-insensitive and trimmed', () => {
  assert.equal(spamReason({ ...base, name: 'Bob', business_name: ' BOB ', location: 'bob', description: 'Hello there friend.' }), 'repeat-fields');
});
test('off-list budget, timeline or project type is dropped', () => {
  const ok = { ...base, name: 'Ana', business_name: 'Ana Co', description: 'We need a booking site.' };
  assert.equal(spamReason({ ...ok, budget: '151314' }), 'bad-choice');
  assert.equal(spamReason({ ...ok, timeline: 'tomorrow lol' }), 'bad-choice');
  assert.equal(spamReason({ ...ok, project_type: 'Crypto' }), 'bad-choice');
});
test('blocked name is dropped even alone', () => {
  assert.equal(spamReason({ ...base, name: 'robertwam', business_name: 'X', description: 'A totally normal long message about a website.' }), 'blocked-name');
});
for (const msg of ['Hi, I wanted to know your price.', 'Hola, quería saber tu precio..', 'Salut, ech wollt Äre Präis wëssen.', 'Bonjour, je voulais connaître votre prix.', 'Hallo, ich wollte Ihren Preis wissen.']) {
  test(`short price-bot message is dropped: ${msg}`, () => {
    assert.equal(spamReason({ ...base, name: 'Maria', business_name: 'Shop', description: msg }), 'price-phrase');
  });
}

const legit = [
  { name: 'Dana Whitfield', business_name: 'Whitfield Bakery', location: 'Savannah, GA', project_type: 'Launch', timeline: 'Within 1 month', budget: '$2,500 to $5,000', description: 'We need a simple site with our menu, hours and online cake orders.' },
  { name: 'Marcus Lee', business_name: 'Lee Plumbing LLC', location: 'Atlanta', project_type: 'Automate', timeline: '1 to 3 months', budget: 'Not sure yet', description: 'I wanted to know your price for automating our invoice reminders. We send about 200 invoices a month from QuickBooks and chase them by hand.' },
  { name: 'Not sure', business_name: 'Not sure yet LLC', location: '', project_type: 'Not sure yet', timeline: 'Not sure yet', budget: 'Not sure yet', description: 'Still figuring out what we need, can we talk?' },
  { name: 'Sofía Ramírez', business_name: 'Ramírez Studio', location: 'Miami', project_type: 'Upgrade', timeline: '', budget: '', description: 'Hola! Our site is slow and looks dated on phones. Can you help?' },
];
for (const d of legit) {
  test(`legit inquiry passes: ${d.business_name}`, () => {
    assert.equal(spamReason({ ...d, email: 'person@example.com' }), null);
  });
}
