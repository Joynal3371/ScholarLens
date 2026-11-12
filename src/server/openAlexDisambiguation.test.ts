import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildYahooScholarSearchQueries,
  extractAffiliationKeywords,
  extractPortraitUrlFromHtml,
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
