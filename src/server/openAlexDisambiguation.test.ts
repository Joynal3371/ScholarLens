import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areOrcidsConflicting,
  buildYahooScholarSearchQueries,
  extractAffiliationKeywords,
  extractPortraitUrlFromHtml,
  extractSameInstitutionAuthorIds,
  isSameResearcherNameMatch,
  mapOrcidWorksSummaryToOpenAlexFormat,
  pickDisambiguationTitles,
  pickInstitutionalProfileUrls,
  rankOpenAlexAuthorsFromWorks,
  scoreOpenAlexAuthorCandidate,
  shouldKeepCrossrefFallbackWork,
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

  // Compacted multi-initial runs paired with other tokens ("MM Naushad Ali" <-> "M M Naushad Ali", "ASM Shihavuddin" <-> "A S M Shihavuddin")
  assert.equal(isSameResearcherNameMatch('MM Naushad Ali', 'M M Naushad Ali'), true);
  assert.equal(isSameResearcherNameMatch('M. M. Naushad Ali', 'MM Naushad Ali'), true);
  assert.equal(isSameResearcherNameMatch('ASM Shihavuddin', 'A S M Shihavuddin'), true);
  assert.equal(isSameResearcherNameMatch('ASM Shihavuddin', 'Abu S. M. Shihavuddin'), true);

  // Critical false-merge prevention
  assert.equal(isSameResearcherNameMatch('Md. Ashraful Islam', 'Md. Imamul Islam'), false);
  assert.equal(isSameResearcherNameMatch('Ashraful Islam', 'Aminul Islam'), false);
  assert.equal(isSameResearcherNameMatch('Aminul Islam Nayan', 'Aminul Islam'), false);
  assert.equal(isSameResearcherNameMatch('James Smith', 'John Smith'), false);
  assert.equal(isSameResearcherNameMatch('Y. Ng', 'Andrew Y. Ng'), false);
  assert.equal(isSameResearcherNameMatch('Md. Islam', 'Md. Ashraful Islam'), false);
});

test('scoreOpenAlexAuthorCandidate prefers high-impact reversed-order author over small exact-order split stub', () => {
  const affilTokens = extractAffiliationKeywords('Universiti Malaysia Pahang Al-Sultan Abdullah');
  const canonicalReversed = {
    id: 'https://openalex.org/A5108044051',
    display_name: 'Kumarasamy Sudhakar',
    works_count: 266,
    cited_by_count: 16835,
    orcid: 'https://orcid.org/0000-0002-5849-5040',
    last_known_institutions: [
      { display_name: 'Universiti Malaysia Pahang Al-Sultan Abdullah', country_code: 'MY' },
    ],
  };
  const splitStub = {
    id: 'https://openalex.org/A5133164786',
    display_name: 'Sudhakar Kumarasamy',
    works_count: 21,
    cited_by_count: 7,
    last_known_institutions: [
      { display_name: 'Universiti Malaysia Pahang Al-Sultan Abdullah', country_code: 'MY' },
    ],
  };

  const reversedScore = scoreOpenAlexAuthorCandidate(
    canonicalReversed,
    'Sudhakar Kumarasamy',
    affilTokens,
    'MY',
    isSameResearcherNameMatch
  )!;
  const stubScore = scoreOpenAlexAuthorCandidate(
    splitStub,
    'Sudhakar Kumarasamy',
    affilTokens,
    'MY',
    isSameResearcherNameMatch
  )!;

  assert.ok(reversedScore);
  assert.ok(stubScore);
  assert.ok(reversedScore.score > stubScore.score);
});

test('scoreOpenAlexAuthorCandidate prefers higher-impact spaced-initial record over compact-initial stub', () => {
  const compactStub = {
    id: 'https://openalex.org/A5020689418',
    display_name: 'MM Naushad Ali',
    works_count: 1,
    cited_by_count: 17,
    orcid: null,
  };
  const spacedCanonical = {
    id: 'https://openalex.org/A5108059396',
    display_name: 'M M Naushad Ali',
    works_count: 33,
    cited_by_count: 261,
    orcid: 'https://orcid.org/0000-0003-2428-5875',
  };

  const sStub = scoreOpenAlexAuthorCandidate(
    compactStub,
    'MM Naushad Ali',
    [],
    '',
    isSameResearcherNameMatch
  )!;
  const sCanonical = scoreOpenAlexAuthorCandidate(
    spacedCanonical,
    'MM Naushad Ali',
    [],
    '',
    isSameResearcherNameMatch
  )!;

  assert.ok(sStub);
  assert.ok(sCanonical);
  assert.ok(sCanonical.score > sStub.score);
});

test('shouldKeepCrossrefFallbackWork blocks homonym papers with mismatched or missing affiliations', () => {
  const affilTokens = extractAffiliationKeywords('Total Research & Technology France');

  // Unrelated nursing paper even when co-authored by same name
  assert.equal(
    shouldKeepCrossrefFallbackWork({
      title: 'Competency Validation for Pediatric Nurses',
      authors: [
        {
          given: 'Caroline',
          family: 'Barrere',
          affiliation: [{ name: 'Texas Hospital School of Nursing, USA' }],
        },
      ],
      targetName: 'Caroline Barrere',
      isSameName: isSameResearcherNameMatch,
      affilTokens,
    }),
    false
  );

  // Matching affiliation keeps the real paper
  assert.equal(
    shouldKeepCrossrefFallbackWork({
      title: 'Understanding the Vanadium-Asphaltene Nanoaggregate Link',
      authors: [
        {
          given: 'Caroline',
          family: 'Barrere',
          affiliation: [{ name: 'Total Research & Technology, Gonfreville, France' }],
        },
      ],
      targetName: 'Caroline Barrere',
      isSameName: isSameResearcherNameMatch,
      affilTokens,
    }),
    true
  );

  // Known scraped GS title keeps the paper even if Crossref omitted affiliation metadata
  assert.equal(
    shouldKeepCrossrefFallbackWork({
      title: 'Characterization of Asphaltenes Using GPC ICP-MS Analysis',
      authors: [{ given: 'Caroline', family: 'Barrere' }],
      targetName: 'Caroline Barrere',
      isSameName: isSameResearcherNameMatch,
      affilTokens,
      candidateTitles: ['Characterization of Asphaltenes Using GPC ICP-MS Analysis'],
    }),
    true
  );

  // Without affiliation tokens or known titles, ambiguous un-ORCIDed Crossref hits are rejected
  assert.equal(
    shouldKeepCrossrefFallbackWork({
      title: 'Vibrational dynamics in GeH4-H2 under pressure',
      authors: [
        {
          given: 'Xiao',
          family: 'Chen',
          affiliation: [{ name: 'Chinese Academy of Sciences' }],
        },
      ],
      targetName: 'Xiao Chen',
      isSameName: isSameResearcherNameMatch,
      affilTokens: [],
      candidateTitles: [],
    }),
    false
  );
});

test('extractAffiliationKeywords ignores generic placeholders and isSameResearcherNameMatch handles hyphenated compound surnames', () => {
  assert.deepEqual(extractAffiliationKeywords('Academic Institution'), []);
  assert.deepEqual(extractAffiliationKeywords('Independent / Unlisted'), []);

  assert.equal(
    isSameResearcherNameMatch('Caroline Barrère\u2010Mangote', 'Caroline Barrere'),
    true
  );
  assert.equal(
    isSameResearcherNameMatch('Caroline Barrere', 'Caroline Barrère-Mangote'),
    true
  );
  assert.equal(
    isSameResearcherNameMatch('Aminul Islam Khan', 'Aminul Islam'),
    false
  );
});

test('mapOrcidWorksSummaryToOpenAlexFormat maps unique ORCID works and skips existing DOIs/titles', () => {
  const seen = new Set(['doi:10.1000/already-in-crossref']);
  const mapped = mapOrcidWorksSummaryToOpenAlexFormat(
    {
      group: [
        {
          'work-summary': [
            {
              title: { title: { value: 'Duplicate Crossref Work' } },
              'external-ids': {
                'external-id': [
                  {
                    'external-id-type': 'doi',
                    'external-id-value': '10.1000/already-in-crossref',
                    'external-id-relationship': 'self',
                  },
                ],
              },
            },
          ],
        },
        {
          'work-summary': [
            {
              title: { title: { value: 'Molecular Characterization of Bio-Oil' } },
              'journal-title': { value: 'Fuel Processing Technology' },
              type: 'journal-article',
              'publication-date': { year: { value: '2022' } },
              'external-ids': {
                'external-id': [
                  {
                    'external-id-type': 'doi',
                    'external-id-value': '10.1016/j.fuproc.2022.107000',
                    'external-id-relationship': 'self',
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    'Caroline Barrere-Mangote',
    '0000-0001-6774-2509',
    seen,
    'Total'
  );

  assert.equal(mapped.length, 1);
  assert.equal(mapped[0].title, 'Molecular Characterization of Bio-Oil');
  assert.equal(mapped[0].publication_year, 2022);
  assert.equal(mapped[0].primary_location.source.display_name, 'Fuel Processing Technology');
  assert.equal(mapped[0].authorships[0].author.orcid, 'https://orcid.org/0000-0001-6774-2509');
});
