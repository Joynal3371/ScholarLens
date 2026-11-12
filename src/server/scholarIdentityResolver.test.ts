import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractCandidateScholarIdsFromSearchHtml,
  extractScholarIdentityFromDdgHtml,
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

test('extractScholarIdentityFromDdgHtml resolves identity from DDG encoded uddg links and BiDi marks', () => {
  const html = `
    <div class="result results_links results_links_deep web-result">
      <div class="links_main links_deep result__body">
        <h2 class="result__title">
          <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fscholar.google.com%2Fcitations%3Fuser%3DmG4imMEAAAAJ%26hl%3Den&amp;rut=123">\u202AAndrew Ng\u202C - \u202AGoogle Scholar\u202C</a>
        </h2>
        <a class="result__snippet" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fscholar.google.com%2Fcitations%3Fuser%3DmG4imMEAAAAJ%26hl%3Den">Stanford University - Cited by 312,000</a>
      </div>
    </div>
  `;

  const resolved = extractScholarIdentityFromDdgHtml(html, 'mG4imMEAAAAJ');
  assert.ok(resolved);
  assert.equal(resolved.name, 'Andrew Ng');
  assert.equal(resolved.affiliationHint, 'Stanford University');
  assert.equal(resolved.source, 'ddg-scholar-index');
});

test('extractCandidateScholarIdsFromSearchHtml ranks matching Scholar IDs with affiliation hits first', () => {
  const html = `
    <div class="result results_links">
      <h2 class="result__title">
        <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fscholar.google.com%2Fcitations%3Fuser%3DAAAA1111BBBB%26hl%3Den">Aini Hussain - Google Scholar</a>
      </h2>
      <a class="result__snippet">Unrelated Company</a>
    </div>
    <div class="result results_links">
      <h2 class="result__title">
        <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fscholar.google.com%2Fcitations%3Fuser%3D_4sL4XUAAAAJ%26hl%3Den">Aini Hussain - Google Scholar</a>
      </h2>
      <a class="result__snippet">National University of Malaysia (UKM) - Cited by 9,100</a>
    </div>
  `;

  const ids = extractCandidateScholarIdsFromSearchHtml(
    html,
    'Aini Hussain',
    'National University of Malaysia',
    (cand, target) => cand.toLowerCase() === target.toLowerCase()
  );
  assert.deepEqual(ids, ['_4sL4XUAAAAJ', 'AAAA1111BBBB']);
});
