/**
 * Unit checks for vCard FN, URL prefixing, line folding, and download names.
 * Run: node --experimental-strip-types scripts/check-invariants.mjs
 */
import { buildVCard, ensureUrl, foldLine } from '../src/lib/vcard.ts';
import { safeFilename } from '../src/lib/download.ts';

let failed = 0;

function assert(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) {
    failed += 1;
    console.error(`FAIL ${name}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
  } else {
    console.log(`ok   ${name}`);
  }
}

function assertMatch(name, actual, re) {
  const ok = re.test(actual);
  if (!ok) {
    failed += 1;
    console.error(`FAIL ${name}\n  pattern: ${re}\n  actual:  ${JSON.stringify(actual)}`);
  } else {
    console.log(`ok   ${name}`);
  }
}

const empty = {
  prefix: '',
  firstName: '',
  lastName: '',
  jobTitle: '',
  company: '',
  address: '',
  phones: [],
  emails: [],
  website: '',
  socials: [],
};

const phoneOnly = buildVCard({
  ...empty,
  phones: [{ id: 'p1', number: '+41 79 123 45 67', type: 'CELL' }],
});
assertMatch('phone-only FN', phoneOnly, /^FN:\+41 79 123 45 67$/m);

const emailOnly = buildVCard({
  ...empty,
  emails: [{ id: 'e1', address: 'a@b.ch', type: 'WORK' }],
});
assertMatch('email-only FN', emailOnly, /^FN:a@b\.ch$/m);

const orgOnly = buildVCard({ ...empty, company: 'Muster AG' });
assertMatch('org-only FN', orgOnly, /^FN:Muster AG$/m);

const nameless = buildVCard(empty);
assertMatch('empty FN placeholder', nameless, /^FN:Contact$/m);

assert('mailto stays mailto', ensureUrl('mailto:a@b.ch'), 'mailto:a@b.ch');
assert('https kept', ensureUrl('https://example.ch'), 'https://example.ch');
assert('bare host gets https', ensureUrl('example.ch'), 'https://example.ch');
assert('host:port gets https', ensureUrl('example.ch:8080'), 'https://example.ch:8080');
assert('javascript stripped', ensureUrl('javascript:alert(1)'), '');

const long = `NOTE:${'ä'.repeat(80)}`;
const folded = foldLine(long);
assert('fold has CRLF continuation', folded.includes('\r\n '), true);
for (const line of folded.split('\r\n')) {
  const octets = new TextEncoder().encode(line).length;
  if (octets > 75) {
    failed += 1;
    console.error(`FAIL fold octet length ${octets} > 75 for ${JSON.stringify(line)}`);
  }
}

assert('slash in filename', safeFilename('a/b:c*d?e"f<g>h|i'), 'a-b-c-d-e-f-g-h-i');
assert('filename fallback', safeFilename('///'), 'vcard');

if (failed) {
  console.error(`\n${failed} failed`);
  process.exit(1);
}
console.log('\nall invariants passed');
