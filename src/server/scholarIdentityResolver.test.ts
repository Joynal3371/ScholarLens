import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractScholarIdentityFromYahooHtml,
  lookupScholarIdentityInStores,
} from './scholarIdentityResolver';

test('extractScholarIdentityFromYahooHtml resolves researcher only from exact user= link match', () => {
  const html = `
    <div class="dd algo algo-sr">
      <h3 class="title">
        <a href="https://r.search.yahoo.com/_ylt=1/RU=https%3a%2f%2fscholar.google.com%2fcitations%3fuser%3dWRONG_ID123%26hl%3den/RK=2/">Wrong Author - Google Scholar</a>
      </h3>
      <div class="compText">WRONG_ID123 mentioned somewhere</div>
    </div>
    <div class="dd algo algo-sr">
      <h3 class="title">
        <a href="https://r.search.yahoo.com/_ylt=2/RU=https%3a%2f%2fscholar.google.com%2fcitations%3fuser%3dW-m-HKEAAAAJ%26hl%3den/RK=2/">Molla Shahadat Hossain Lipu - Google Scholar</a>
      </h3>
      <div class="compText">Green University of Bangladesh - Cited by 12,450</div>
    </div>
  `;

  const resolved = extractScholarIdentityFromYahooHtml(html, 'W-m-HKEAAAAJ');
  assert.ok(resolved);
  assert.equal(resolved.name, 'Molla Shahadat Hossain Lipu');
  assert.equal(resolved.affiliationHint, 'Green University of Bangladesh');

  const wrongCase = extractScholarIdentityFromYahooHtml(html, 'w-m-hkeaaaaj');
  assert.equal(wrongCase, null);
});

test('lookupScholarIdentityInStores finds identity from digests, co-authors, and snapshots', () => {
  const res = lookupScholarIdentityInStores({
    scholarId: 'W-m-HKEAAAAJ',
    digests: {
      be8uiCkAAAAJ: {
        scholarUserId: 'be8uiCkAAAAJ',
        name: 'ASM Shihavuddin',
        coAuthors: [
          {
            name: 'Molla Shahadat Hossain Lipu',
            scholarUserId: 'W-m-HKEAAAAJ',
            universityName: 'Green University of Bangladesh',
          },
        ],
      },
    },
  });

  assert.deepEqual(res, {
    name: 'Molla Shahadat Hossain Lipu',
    affiliationHint: 'Green University of Bangladesh',
    source: 'digest-coauthor',
  });

  const fromColleagueList = lookupScholarIdentityInStores({
    scholarId: 'tR6rCGcAAAAJ',
    colleagueList: [{ u: 'tR6rCGcAAAAJ', n: 'Kim Branner' }],
  });
  assert.deepEqual(fromColleagueList, {
    name: 'Kim Branner',
    source: 'colleague-list',
  });
});
