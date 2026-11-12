import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areOrcidsConflicting,
  buildYahooScholarSearchQueries,
  extractAffiliationKeywords,
  extractPortraitUrlFromHtml,
  extractSameInstitutionAuthorIds,
  isSameResearcherNameMatch,
  pickDisambiguationTitles,
  pickInstitutionalProfileUrls,
  rankOpenAlexAuthorsFromWorks,
  scoreOpenAlexAuthorCandidate,
} from './openAlexDisambiguation';

const simpleSameName = (a: string, b: string) =>
  a.toLowerCase().trim() === b.toLowerCase().trim();

const simpleMatchWork = (title: string, works: any[]) =>
  works.find(
    (w) =>
      String(w.title || '').toLowerCase().trim() ===
      title.toLowerCase().trim()
  ) || null;

test('scoreOpenAlexAuthorCandidate distinguishes affiliation and country matches cleanly', () => {
  const affilTokens = extractAffiliationKeywords('Technical University of Denmark');
  const bitMesraCandidate = {
    id: 'https://openalex.org/A5043563773',
    display_name: 'Aminul Islam',
    works_count: 255,
    last_known_institutions: [
      { display_name: 'Birla Institute of Technology, Mesra', country_code: 'IN' },
    ],
  };
  const dtuCandidate = {
    id: 'https://openalex.org/A5101775050',
    display_name: 'Aminul Islam',
    works_count: 128,
    last_known_institutions: [
      { display_name: 'Technical University of Denmark', country_code: 'DK' },
    ],
  };

  const s1 = scoreOpenAlexAuthorCandidate(
    bitMesraCandidate,
    'Aminul Islam',
    affilTokens,
    'DK',
    simpleSameName
  )!;
  const s2 = scoreOpenAlexAuthorCandidate(
    dtuCandidate,
    'Aminul Islam',
    affilTokens,
    'DK',
    simpleSameName
  )!;

  assert.equal(s1.affilMatches, 0);
  assert.equal(s1.countryMatches, 0);
  assert.ok(s2.affilMatches >= 2);
  assert.equal(s2.countryMatches, 1);
  assert.ok(s2.score > s1.score);
});

test('pickDisambiguationTitles and rankOpenAlexAuthorsFromWorks recover true affiliation author from multi-title lookup', () => {
  const pubs = [
    { title: 'Legacy paper not indexed', year: 1997, citations: 5 },
    { title: 'Advances in ultrasonic welding of thermoplastic composites', year: 2021, citations: 140 },
    { title: 'Micro injection molding of polymers', year: 2019, citations: 80 },
  ];
  const titles = pickDisambiguationTitles(pubs, 4);
  assert.equal(titles.length, 3);

  const affilTokens = extractAffiliationKeywords('Technical University of Denmark');
  const ranked = rankOpenAlexAuthorsFromWorks(
    [
      {
        title: pubs[0].title,
        works: [],
      },
      {
        title: pubs[1].title,
        works: [
          {
            title: pubs[1].title,
            authorships: [
              {
                author: { id: 'https://openalex.org/A5101775050', display_name: 'Aminul Islam' },
                institutions: [{ display_name: 'Technical University of Denmark', country_code: 'DK' }],
              },
            ],
          },
        ],
      },
      {
        title: pubs[2].title,
        works: [
          {
            title: pubs[2].title,
            authorships: [
              {
                author: { id: 'https://openalex.org/A5101775050', display_name: 'Aminul Islam' },
                institutions: [{ display_name: 'Technical University of Denmark', country_code: 'DK' }],
              },
            ],
          },
        ],
      },
    ],
    'Aminul Islam',
    affilTokens,
    'DK',
    simpleSameName,
    simpleMatchWork
  );

  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].id, 'A5101775050');
  assert.equal(ranked[0].affilHits, 2);
  assert.equal(ranked[0].titleHits, 2);
});

test('pickInstitutionalProfileUrls and extractPortraitUrlFromHtml select valid institutional headshots', () => {
  const urls = pickInstitutionalProfileUrls([
    { url: { value: 'https://www.linkedin.com/in/example/' } },
    { url: { value: 'https://scholar.google.com/citations?user=123456789012' } },
    { url: { value: 'https://orbit.dtu.dk/en/persons/04ac6d96-df2f-44fb' } },
  ]);
  assert.deepEqual(urls, ['https://orbit.dtu.dk/en/persons/04ac6d96-df2f-44fb']);

  const portrait = extractPortraitUrlFromHtml(
    '<html><head><meta property="og:image" content="https://orbit.dtu.dk/files-asset/465161331/headshot.jpg/"></head></html>',
    'https://orbit.dtu.dk/en/persons/04ac6d96-df2f-44fb'
  );
  assert.equal(portrait, 'https://orbit.dtu.dk/files-asset/465161331/headshot.jpg/');

  const rejectedLogo = extractPortraitUrlFromHtml(
    '<html><head><meta property="og:image" content="https://example.edu/assets/university-logo.png"></head></html>',
    'https://example.edu/faculty/jane'
  );
  assert.equal(rejectedLogo, null);
});

test('buildYahooScholarSearchQueries scopes university when known and skips Independent/Unlisted', () => {
  assert.deepEqual(
    buildYahooScholarSearchQueries('Guido Tosello', 'Technical University of Denmark'),
    [
      '"Guido Tosello" "Technical University of Denmark" scholar.google.com/citations',
      'Guido Tosello scholar.google.com/citations',
    ]
  );
  assert.deepEqual(
    buildYahooScholarSearchQueries('Guido Tosello', 'Independent / Unlisted'),
    ['Guido Tosello scholar.google.com/citations']
  );
});

test('extractSameInstitutionAuthorIds collects split OpenAlex author records matching name', () => {
  const merged = extractSameInstitutionAuthorIds(
    [
      { id: 'https://openalex.org/A5044908817', display_name: 'Aminul Islam', works_count: 47 },
      { id: 'https://openalex.org/A9999999999', display_name: 'Md Aminul Hoque', works_count: 15 },
      { id: 'https://openalex.org/A5139503707', display_name: 'Aminul Islam', works_count: 2 },
      { id: 'https://openalex.org/A5101775050', display_name: 'Aminul Islam', works_count: 130 },
    ],
    'Aminul Islam',
    simpleSameName
  );
  assert.deepEqual(merged, ['A5101775050', 'A5044908817', 'A5139503707']);

  // Conflicting non-empty ORCIDs at the same university must never be merged together
  const safeMerged = extractSameInstitutionAuthorIds(
    [
      {
        id: 'https://openalex.org/A5044908817',
        display_name: 'Aminul Islam',
        orcid: 'https://orcid.org/0000-0002-5335-6735',
        works_count: 47,
      },
      {
        id: 'https://openalex.org/A5139503707',
        display_name: 'Aminul Islam',
        orcid: null,
        works_count: 2,
      },
      {
        id: 'https://openalex.org/A5101775050',
        display_name: 'Aminul Islam',
        orcid: 'https://orcid.org/0000-0002-8275-6631',
        works_count: 130,
      },
    ],
    'Aminul Islam',
    simpleSameName,
    8,
    '0000-0002-8275-6631'
  );
  assert.deepEqual(safeMerged, ['A5101775050', 'A5139503707']);

  // Without primaryOrcid, ambiguous distinct ORCIDs at the same university must not be merged together
  const ambiguousNoPrimary = extractSameInstitutionAuthorIds(
    [
      {
        id: 'https://openalex.org/A5044908817',
        display_name: 'Aminul Islam',
        orcid: 'https://orcid.org/0000-0002-5335-6735',
        works_count: 47,
      },
      {
        id: 'https://openalex.org/A5139503707',
        display_name: 'Aminul Islam',
        orcid: null,
        works_count: 2,
      },
      {
        id: 'https://openalex.org/A5101775050',
        display_name: 'Aminul Islam',
        orcid: 'https://orcid.org/0000-0002-8275-6631',
        works_count: 130,
      },
    ],
    'Aminul Islam',
    simpleSameName,
    8
  );
  assert.deepEqual(ambiguousNoPrimary, ['A5139503707']);

  assert.equal(
    areOrcidsConflicting('https://orcid.org/0000-0002-8275-6631', '0000-0002-5335-6735'),
    true
  );
  assert.equal(
    areOrcidsConflicting('https://orcid.org/0000-0002-8275-6631', '0000-0002-8275-6631'),
    false
  );
});

test('rankOpenAlexAuthorsFromWorks breaks ties between same-university homonyms using collaborators', () => {
  const ranked = rankOpenAlexAuthorsFromWorks(
    [
      {
        title: 'An Analysis and Modeling of the Class-E Inverter',
        works: [
          {
            title: 'An Analysis and Modeling of the Class-E Inverter',
            authorships: [
              { author: { display_name: 'ASM Shihavuddin' } },
              {
                author: {
                  id: 'https://openalex.org/A5101775050',
                  display_name: 'Aminul Islam',
                  orcid: 'https://orcid.org/0000-0002-8275-6631',
                },
                institutions: [{ display_name: 'Technical University of Denmark', country_code: 'DK' }],
              },
            ],
          },
        ],
      },
    ],
    'Aminul Islam',
    ['technical', 'denmark'],
    'DK',
    simpleSameName,
    simpleMatchWork,
    ['ASM Shihavuddin']
  );

  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].id, 'A5101775050');
  assert.equal(ranked[0].collaboratorHits, 1);
  assert.equal(ranked[0].orcid, '0000-0002-8275-6631');
});

test('rankOpenAlexAuthorsFromWorks prefers ORCID-verified record on equal score ties', () => {
  const ranked = rankOpenAlexAuthorsFromWorks(
    [
      {
        title: 'Stub Paper With No Orcid',
        works: [
          {
            title: 'Stub Paper With No Orcid',
            authorships: [
              {
                author: {
                  id: 'https://openalex.org/A5139503707',
                  display_name: 'Aminul Islam',
                  orcid: null,
                },
                institutions: [{ display_name: 'Technical University of Denmark', country_code: 'DK' }],
              },
            ],
          },
        ],
      },
      {
        title: 'Canonical Paper With Orcid',
        works: [
          {
            title: 'Canonical Paper With Orcid',
            authorships: [
              {
                author: {
                  id: 'https://openalex.org/A5101775050',
                  display_name: 'Aminul Islam',
                  orcid: 'https://orcid.org/0000-0002-8275-6631',
                },
                institutions: [{ display_name: 'Technical University of Denmark', country_code: 'DK' }],
              },
            ],
          },
        ],
      },
    ],
    'Aminul Islam',
    ['technical', 'denmark'],
    'DK',
    simpleSameName,
    simpleMatchWork
  );

  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].score, ranked[1].score);
  assert.equal(ranked[0].id, 'A5101775050');
  assert.equal(ranked[0].orcid, '0000-0002-8275-6631');
});

test('isSameResearcherNameMatch rejects distinct given names sharing surname and first initial', () => {
  // True positives
  assert.equal(isSameResearcherNameMatch('Aminul Islam', 'A. Islam'), true);
  assert.equal(isSameResearcherNameMatch('Md. Imamul Islam', 'Imamul Islam'), true);
  assert.equal(isSameResearcherNameMatch('Md. Imamul Islam', 'Mohammad Imamul Islam'), true);
  assert.equal(isSameResearcherNameMatch('Md. Imamul Islam', 'M. I. Islam'), true);
  assert.equal(isSameResearcherNameMatch('M. S. H. Lipu', 'Molla Shahadat Hossain Lipu'), true);
  assert.equal(isSameResearcherNameMatch('MSH Lipu', 'Molla Shahadat Hossain Lipu'), true);
  assert.equal(isSameResearcherNameMatch('Andrew Y. Ng', 'Andrew Ng'), true);
  assert.equal(isSameResearcherNameMatch('Li Fei-Fei', 'Fei-Fei Li'), true);
  assert.equal(isSameResearcherNameMatch('K. He', 'Kaiming He'), true);

  // Critical false-merge prevention
  assert.equal(isSameResearcherNameMatch('Md. Ashraful Islam', 'Md. Imamul Islam'), false);
  assert.equal(isSameResearcherNameMatch('Ashraful Islam', 'Aminul Islam'), false);
  assert.equal(isSameResearcherNameMatch('Aminul Islam Nayan', 'Aminul Islam'), false);
  assert.equal(isSameResearcherNameMatch('James Smith', 'John Smith'), false);
  assert.equal(isSameResearcherNameMatch('Y. Ng', 'Andrew Y. Ng'), false);
  assert.equal(isSameResearcherNameMatch('Md. Islam', 'Md. Ashraful Islam'), false);
});
