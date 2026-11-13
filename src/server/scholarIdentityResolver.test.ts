import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractCandidateScholarIdsFromSearchHtml,
  extractEmbeddedOrcid,
  extractGeneralUrlsFromDdgHtml,
  extractScholarIdentityFromDdgHtml,
  extractScholarIdentityFromYahooHtml,
  lookupScholarIdentityInStores,
  lookupScholarWorkEvidenceInStores,
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

test('lookupScholarIdentityInStores aggregates majority affiliation across stores without shadowing by colleagueList', () => {
  const params = {
    scholarId: 'X6_inMYAAAAJ',
    colleagueList: [{ u: 'X6_inMYAAAAJ', n: 'Aminul Islam' }],
    verifiedSnapshot: {
      be8uiCkAAAAJ: {
        profile: {
          name: 'ASM Shihavuddin',
          scholarUserId: 'be8uiCkAAAAJ',
          publications: [
            {
              title: 'An analysis and modeling of the class-e inverter',
              year: 2021,
              coAuthors: [
                {
                  name: 'Aminul Islam',
                  scholarUserId: 'X6_inMYAAAAJ',
                  universityName: 'Technical University of Denmark',
                  countryCode: 'DK',
                },
              ],
            },
            {
              title: 'Enhanced energy savings in indoor environments',
              year: 2020,
              coAuthors: [
                {
                  name: 'Aminul Islam',
                  scholarUserId: 'X6_inMYAAAAJ',
                  universityName: 'Technical University of Denmark',
                  countryCode: 'DK',
                },
              ],
            },
            {
              title: 'Noisy outlier paper',
              year: 2026,
              coAuthors: [
                {
                  name: 'Aminul Islam Nayan',
                  scholarUserId: 'X6_inMYAAAAJ',
                  universityName: 'Green University of Bangladesh',
                  countryCode: 'BD',
                },
              ],
            },
          ],
        },
      },
    },
  };

  const identity = lookupScholarIdentityInStores(params);
  assert.ok(identity);
  assert.equal(identity.name, 'Aminul Islam');
  assert.equal(identity.affiliationHint, 'Technical University of Denmark');
  assert.equal(identity.countryCodeHint, 'DK');

  const evidence = lookupScholarWorkEvidenceInStores(params);
  assert.deepEqual(evidence.knownWorkTitles, [
    'An analysis and modeling of the class-e inverter',
    'Enhanced energy savings in indoor environments',
  ]);
  assert.deepEqual(evidence.knownCollaboratorNames, ['ASM Shihavuddin']);
});

test('extractEmbeddedOrcid and lookupScholarIdentityInStores extract ORCID hints from names and snapshots', () => {
  assert.equal(
    extractEmbeddedOrcid('Md Ashraful Amin (ORCID:0000-0003-2330-9775)'),
    '0000-0003-2330-9775'
  );
  assert.equal(
    extractEmbeddedOrcid('Researcher with X check digit 0000-0002-1825-009x'),
    '0000-0002-1825-009X'
  );
  assert.equal(extractEmbeddedOrcid('Plain Researcher Name'), undefined);

  const fromColleague = lookupScholarIdentityInStores({
    scholarId: 'r2MvRboAAAAJ',
    colleagueList: [
      { u: 'r2MvRboAAAAJ', n: 'Md Ashraful Amin (ORCID:0000-0003-2330-9775)' },
    ],
  });
  assert.ok(fromColleague);
  assert.equal(fromColleague.orcid, '0000-0003-2330-9775');
});

test('lookupScholarIdentityInStores ignores generic placeholder affiliations like Academic Institution', () => {
  const res = lookupScholarIdentityInStores({
    scholarId: 'A8Zsmn4AAAAJ',
    digests: {
      A8Zsmn4AAAAJ: {
        scholarUserId: 'A8Zsmn4AAAAJ',
        name: 'Xiao Chen',
        affiliation: 'Academic Institution',
        country: 'International',
      },
    },
  });
  assert.ok(res);
  assert.equal(res.name, 'Xiao Chen');
  assert.equal(res.affiliationHint, undefined);
});

test('lookupScholarIdentityInStores and lookupScholarWorkEvidenceInStores resolve identity, ORCID, and titles from works-digest', () => {
  const digests = {
    X6_inMYAAAAJ: {
      scholarUserId: 'X6_inMYAAAAJ',
      name: 'Aminul Islam',
      affiliation: 'Technical University of Denmark',
      country: 'Denmark',
      orcid: '0000-0002-8275-6631',
      works: [
        {
          id: 'w-1',
          title: 'A review of recent developments on the regulatory, structural and functional aspects of gum arabic',
          year: 1997,
        },
        {
          id: 'w-2',
          title: 'Advances in ultrasonic welding of thermoplastic composites: a review',
          year: 2020,
        },
      ],
    },
  };

  const identity = lookupScholarIdentityInStores({
    scholarId: 'X6_inMYAAAAJ',
    digests,
  });
  assert.ok(identity);
  assert.equal(identity.name, 'Aminul Islam');
  assert.equal(identity.affiliationHint, 'Technical University of Denmark');
  assert.equal(identity.countryCodeHint, 'DK');
  assert.equal(identity.orcid, '0000-0002-8275-6631');
  assert.equal(identity.source, 'works-digest');

  const evidence = lookupScholarWorkEvidenceInStores({
    scholarId: 'X6_inMYAAAAJ',
    digests,
  });
  assert.ok(evidence);
  assert.equal(evidence.affiliationHint, 'Technical University of Denmark');
  assert.equal(evidence.countryCodeHint, 'DK');
  assert.ok(evidence.knownWorkTitles.length >= 2);
  assert.ok(evidence.knownWorkTitles.some((t) => t.includes('gum arabic')));
  assert.ok(evidence.knownWorkTitles.some((t) => t.includes('ultrasonic welding')));
});
