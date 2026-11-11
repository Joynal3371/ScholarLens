import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseGoogleScholarInput,
  calculateHIndex,
  calculateGIndex,
  computeProfileStatistics,
  filterAndSortPublications,
  aggregateUniversityCollaborations,
  aggregateCoAuthors,
  aggregateCountries,
  aggregateJournals,
  DEFAULT_FILTER_STATE,
  normalizePublicationsVenueConsistency,
  getJournalImpactFactor,
} from './scholarAnalytics';
import { PRESET_PROFILES, findVerifiedPresetProfile } from './scholarPresets';
import { projectOrthographic, interpolateGreatCircle } from './globeProjection';

test('parseGoogleScholarInput validates Google Scholar URLs and rejects invalid ones', () => {
  const valid1 = parseGoogleScholarInput(
    'https://scholar.google.com/citations?user=JicYPdAAAAAJ&hl=en'
  );
  assert.equal(valid1.valid, true);
  assert.equal(valid1.userId, 'JicYPdAAAAAJ');

  const validUk = parseGoogleScholarInput(
    'https://scholar.google.co.uk/citations?hl=en&user=DhtAFkwAAAAJ'
  );
  assert.equal(validUk.valid, true);
  assert.equal(validUk.userId, 'DhtAFkwAAAAJ');

  const empty = parseGoogleScholarInput('   ');
  assert.equal(empty.valid, false);
  assert.ok(empty.error);

  const missingUserParam = parseGoogleScholarInput(
    'https://scholar.google.com/citations?hl=en'
  );
  assert.equal(missingUserParam.valid, false);

  const nonScholarDomain = parseGoogleScholarInput(
    'https://example.com/citations?user=123456'
  );
  assert.equal(nonScholarDomain.valid, false);
});

test('calculateHIndex and calculateGIndex compute accurate bibliometric indices', () => {
  const citations = [50, 40, 33, 23, 12, 8, 5, 2, 1];
  assert.equal(calculateHIndex(citations), 6);
  assert.ok(calculateGIndex(citations) >= 6);
  assert.equal(calculateHIndex([]), 0);
});

test('computeProfileStatistics calculates Q1-Q4 percentages, types, and citation brackets accurately', () => {
  const hinton = PRESET_PROFILES[0];
  const stats = computeProfileStatistics(
    hinton.publications,
    hinton.homeCountry,
    2026
  );

  assert.equal(stats.totalPapers, 24);
  assert.ok(stats.totalCitations > 400000);

  const sumQuartileCounts =
    stats.quartileBreakdown.Q1.count +
    stats.quartileBreakdown.Q2.count +
    stats.quartileBreakdown.Q3.count +
    stats.quartileBreakdown.Q4.count +
    stats.quartileBreakdown.Unranked.count;
  assert.equal(sumQuartileCounts, stats.totalPapers);

  const sumBrackets = stats.citationBrackets.reduce((acc, b) => acc + b.count, 0);
  assert.equal(sumBrackets, stats.totalPapers);
});

test('filterAndSortPublications filters by custom citation range, quartile, type, and university', () => {
  const pubs = PRESET_PROFILES[0].publications;

  const byCitationRange = filterAndSortPublications(pubs, {
    ...DEFAULT_FILTER_STATE,
    minCitations: '1000',
    maxCitations: '25000',
  });
  assert.ok(byCitationRange.length > 0);
  for (const p of byCitationRange) {
    assert.ok(p.citations >= 1000 && p.citations <= 25000);
  }

  const q1Journals = filterAndSortPublications(pubs, {
    ...DEFAULT_FILTER_STATE,
    quartiles: ['Q1'],
    types: ['Journal'],
  });
  assert.ok(q1Journals.length > 0);
  for (const p of q1Journals) {
    assert.equal(p.quartile, 'Q1');
    assert.equal(p.type, 'Journal');
  }

  assert.equal(getJournalImpactFactor('Energies', 'Journal'), 3.2);
  assert.equal(getJournalImpactFactor('Nature', 'Journal'), 50.5);
  assert.equal(
    getJournalImpactFactor('IEEE International Conference', 'Conference'),
    undefined
  );

  const normalizedPubs = normalizePublicationsVenueConsistency(pubs);
  const highIfJournals = filterAndSortPublications(normalizedPubs, {
    ...DEFAULT_FILTER_STATE,
    minImpactFactor: '10',
    maxImpactFactor: '60',
    sortBy: 'impact-factor-desc',
  });
  assert.ok(highIfJournals.length > 0);
  for (let i = 0; i < highIfJournals.length; i++) {
    const p = highIfJournals[i];
    assert.ok(
      p.impactFactor !== undefined &&
        p.impactFactor >= 10 &&
        p.impactFactor <= 60
    );
    if (i > 0) {
      assert.ok(
        (highIfJournals[i - 1].impactFactor ?? 0) >= (p.impactFactor ?? 0)
      );
    }
  }
});

test('aggregators build complete directories of universities, co-authors, countries, and journals', () => {
  const pubs = PRESET_PROFILES[0].publications;
  const universities = aggregateUniversityCollaborations(pubs);
  const coAuthors = aggregateCoAuthors(pubs);
  const countries = aggregateCountries(pubs);
  const journals = aggregateJournals(pubs);

  assert.ok(universities.length >= 8);
  assert.ok(coAuthors.length >= 12);
  assert.ok(countries.length >= 4);
  assert.ok(journals.length >= 10);
});

test('orthographic globe projection and great-circle interpolation work deterministically', () => {
  const centerProj = projectOrthographic(
    43.6629,
    -79.3957,
    43.6629,
    -79.3957,
    200
  );
  assert.ok(Math.abs(centerProj.x) < 1e-6);
  assert.ok(Math.abs(centerProj.y) < 1e-6);
  assert.equal(centerProj.visible, true);

  const arc = interpolateGreatCircle(43.6629, -79.3957, 51.7548, -1.2544, 16);
  assert.equal(arc.length, 17);
});

test('findVerifiedPresetProfile resolves real researcher profiles by Scholar ID or name', () => {
  const hinton = findVerifiedPresetProfile('JicYPdAAAAAJ');
  assert.ok(hinton);
  assert.equal(hinton.name, 'Geoffrey E. Hinton');

  const kaiming = findVerifiedPresetProfile('DhtAFkwAAAAJ');
  assert.ok(kaiming);
  assert.equal(kaiming.name, 'Kaiming He');
});

test('computeProfileStatistics uses officialMetrics and aggregators exclude unlisted university placeholders', () => {
  const pubs = [
    {
      ...PRESET_PROFILES[0].publications[0],
      coAuthors: [
        ...PRESET_PROFILES[0].publications[0].coAuthors,
        {
          name: 'Unlisted CoAuthor',
          universityId: 'unlisted',
          universityName: 'Independent / Unlisted',
          city: 'Unlisted',
          country: 'Unlisted',
          countryCode: 'UN',
          continent: 'Asia' as const,
          lat: 0,
          lng: 0,
        },
      ],
    },
  ];
  const stats = computeProfileStatistics(pubs, 'Bangladesh', 2026, {
    totalCitations: 3978,
    hIndex: 30,
    i10Index: 61,
  });
  assert.equal(stats.totalCitations, 3978);
  assert.equal(stats.hIndex, 30);
  assert.equal(stats.i10Index, 61);

  const unis = aggregateUniversityCollaborations(pubs);
  assert.ok(unis.every((u) => u.universityId !== 'unlisted'));
});

test('aggregateCoAuthors and aggregateUniversityCollaborations strictly exclude the primary researcher from co-authors', () => {
  const profile = PRESET_PROFILES[0];
  const primaryName = profile.name;
  const pubsWithSelf = profile.publications.map((p) => ({
    ...p,
    coAuthors: [
      ...p.coAuthors,
      {
        name: primaryName,
        universityId: 'home-uni',
        universityName: 'Home University',
        city: 'City',
        country: 'Country',
        countryCode: 'BD',
        continent: 'Asia' as const,
        lat: 23,
        lng: 90,
      },
    ],
  }));

  const coAuthors = aggregateCoAuthors(pubsWithSelf, primaryName);
  assert.ok(!coAuthors.some((ca) => ca.name.toLowerCase().includes(primaryName.toLowerCase())));

  const unis = aggregateUniversityCollaborations(pubsWithSelf, profile);
  for (const u of unis) {
    assert.ok(!u.coAuthors.some((ca) => ca.name.toLowerCase().includes(primaryName.toLowerCase())));
  }
});
