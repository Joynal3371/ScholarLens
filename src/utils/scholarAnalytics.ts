export type Quartile = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Unranked';

export type PortfolioCategory =
  | 'Q1'
  | 'Q2'
  | 'Q3'
  | 'Q4'
  | 'Conference'
  | 'Non-Indexed';

export type PublicationType =
  | 'Journal'
  | 'Conference'
  | 'Review'
  | 'Book Chapter'
  | 'Preprint';

export type AuthorshipRole =
  | 'First Author'
  | 'Corresponding Author'
  | 'Co-Author';

export interface CoAuthorAffiliation {
  name: string;
  universityId: string;
  universityName: string;
  city: string;
  country: string;
  countryCode: string;
  continent:
    | 'North America'
    | 'Europe'
    | 'Asia'
    | 'Oceania'
    | 'South America'
    | 'Africa';
  lat: number;
  lng: number;
  isHomeInstitution?: boolean;
}

export interface Publication {
  id: string;
  title: string;
  year: number;
  citations: number;
  venue: string;
  quartile: Quartile;
  type: PublicationType;
  authorshipRole: AuthorshipRole;
  openAccess: boolean;
  doi?: string;
  url?: string;
  coAuthors: CoAuthorAffiliation[];
}

export interface OfficialScholarMetrics {
  totalCitations: number;
  hIndex: number;
  i10Index: number;
  citationsByYear?: Record<number, number>;
}

export interface ResearcherProfile {
  id: string;
  scholarUserId: string;
  scholarUrl: string;
  avatarUrl?: string;
  name: string;
  affiliation: string;
  homeUniversityId: string;
  homeUniversity: string;
  homeCity: string;
  homeCountry: string;
  homeLat: number;
  homeLng: number;
  verifiedDomain: string;
  orcid?: string;
  fields: string[];
  officialMetrics?: OfficialScholarMetrics;
  publications: Publication[];
}

const QUARTILE_PRIORITY_RANK: Record<Quartile, number> = {
  Q1: 1,
  Q2: 2,
  Q3: 3,
  Q4: 4,
  Unranked: 5,
};

/**
 * Guarantees that every publication in the same journal/venue shares a single consistent
 * canonical quartile and publication type across the entire profile.
 */
export function normalizePublicationsVenueConsistency(
  publications: Publication[]
): Publication[] {
  const byVenue = new Map<string, Publication[]>();
  for (const p of publications) {
    const key = (p.venue || '').toLowerCase().trim();
    if (!key) continue;
    if (!byVenue.has(key)) byVenue.set(key, []);
    byVenue.get(key)!.push(p);
  }

  const canonicalMap = new Map<
    string,
    { venue: string; quartile: Quartile; type: PublicationType }
  >();

  for (const [key, pubs] of byVenue.entries()) {
    const qCounts = new Map<Quartile, number>();
    const tCounts = new Map<PublicationType, number>();
    for (const p of pubs) {
      qCounts.set(p.quartile, (qCounts.get(p.quartile) || 0) + 1);
      tCounts.set(p.type, (tCounts.get(p.type) || 0) + 1);
    }

    const bestQuartile = [...qCounts.entries()].sort((a, b) => {
      if (a[0] === 'Unranked' && b[0] !== 'Unranked') return 1;
      if (b[0] === 'Unranked' && a[0] !== 'Unranked') return -1;
      return (
        b[1] - a[1] ||
        QUARTILE_PRIORITY_RANK[a[0]] - QUARTILE_PRIORITY_RANK[b[0]]
      );
    })[0][0];

    const bestType = [...tCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    canonicalMap.set(key, {
      venue: pubs[0].venue,
      quartile: bestQuartile,
      type: bestType,
    });
  }

  return publications.map((p) => {
    const key = (p.venue || '').toLowerCase().trim();
    const canon = canonicalMap.get(key);
    if (!canon) return p;
    if (
      p.venue === canon.venue &&
      p.quartile === canon.quartile &&
      p.type === canon.type
    ) {
      return p;
    }
    return {
      ...p,
      venue: canon.venue,
      quartile: canon.quartile,
      type: canon.type,
    };
  });
}

export interface CategoryStat {
  count: number;
  percentageOfTotal: number;
  percentageOfRankedJournals: number;
  citations: number;
}

export interface PortfolioCategoryStat {
  count: number;
  percentage: number;
  citations: number;
}

export interface TypeStat {
  count: number;
  percentageOfTotal: number;
  citations: number;
}

export interface YearlyStat {
  year: number;
  papers: number;
  citations: number;
  q1Count: number;
  q2Count: number;
  q3Count: number;
  q4Count: number;
  conferenceCount: number;
  otherCount: number;
}

export interface CitationBracket {
  label: string;
  min: number;
  max: number | null;
  count: number;
  percentage: number;
}

export interface ProfileStatistics {
  totalPapers: number;
  totalCitations: number;
  hIndex: number;
  i10Index: number;
  gIndex: number;
  meanCitationsPerPaper: number;
  medianCitationsPerPaper: number;
  maxCitations: number;
  annualCitationVelocity: number;
  openAccessCount: number;
  openAccessPercentage: number;
  firstOrCorrespondingCount: number;
  firstOrCorrespondingPercentage: number;
  internationalCollabCount: number;
  internationalCollabPercentage: number;
  rankedJournalCount: number;
  quartileBreakdown: Record<Quartile, CategoryStat>;
  portfolioDistribution: Record<PortfolioCategory, PortfolioCategoryStat>;
  typeBreakdown: Record<PublicationType, TypeStat>;
  yearlyTrend: YearlyStat[];
  citationBrackets: CitationBracket[];
  topCitedPaper: Publication | null;
  q1Q2CombinedPercentage: number;
}

export interface UniversityCollaboration {
  universityId: string;
  universityName: string;
  city: string;
  country: string;
  countryCode: string;
  continent: string;
  lat: number;
  lng: number;
  isHomeInstitution: boolean;
  paperCount: number;
  totalCitations: number;
  q1PaperCount: number;
  coAuthors: {
    name: string;
    paperCount: number;
    citations: number;
  }[];
  papers: Publication[];
  firstCollaborationYear: number;
  latestCollaborationYear: number;
}

export interface CoAuthorSummary {
  name: string;
  universityId: string;
  universityName: string;
  city: string;
  country: string;
  countryCode: string;
  paperCount: number;
  totalCitations: number;
  q1Papers: number;
  firstYear: number;
  latestYear: number;
  papers: Publication[];
}

export interface CountryCollaboration {
  country: string;
  countryCode: string;
  continent: string;
  universityCount: number;
  coAuthorCount: number;
  paperCount: number;
  totalCitations: number;
  percentageOfTotalPapers: number;
  universities: string[];
}

export interface JournalSummary {
  venue: string;
  type: PublicationType;
  quartile: Quartile;
  paperCount: number;
  totalCitations: number;
  avgCitations: number;
  papers: Publication[];
}

export type SortOption =
  | 'citations-desc'
  | 'citations-asc'
  | 'year-desc'
  | 'year-asc'
  | 'quartile-asc'
  | 'title-asc';

export interface PublicationFilterState {
  searchQuery: string;
  minCitations: string;
  maxCitations: string;
  minYear: string;
  maxYear: string;
  quartiles: Quartile[];
  types: PublicationType[];
  authorshipRole: 'All' | AuthorshipRole;
  openAccessOnly: boolean;
  universityId: string;
  coAuthorName: string;
  country: string;
  venue: string;
  sortBy: SortOption;
}

export const DEFAULT_FILTER_STATE: PublicationFilterState = {
  searchQuery: '',
  minCitations: '',
  maxCitations: '',
  minYear: '',
  maxYear: '',
  quartiles: [],
  types: [],
  authorshipRole: 'All',
  openAccessOnly: false,
  universityId: 'All',
  coAuthorName: 'All',
  country: 'All',
  venue: 'All',
  sortBy: 'citations-desc',
};

export interface ScholarUrlParseResult {
  valid: boolean;
  userId?: string;
  normalizedUrl?: string;
  queryName?: string;
  error?: string;
}

/**
 * Validates and extracts a Google Scholar user ID or researcher query from input.
 */
export function parseGoogleScholarInput(rawInput: string): ScholarUrlParseResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Paste a Google Scholar profile link (https://scholar.google.com/citations?user=...) or researcher name.',
    };
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.includes('scholar.google.')
  ) {
    try {
      const urlString = trimmed.startsWith('http')
        ? trimmed
        : `https://${trimmed}`;
      const url = new URL(urlString);
      const isScholarDomain = /^scholar\.google\.[a-z.]+$/i.test(url.hostname);
      if (!isScholarDomain) {
        return {
          valid: false,
          error: 'URL must be from a Google Scholar domain (scholar.google.com/citations?user=...).',
        };
      }
      const userId = url.searchParams.get('user');
      if (!userId || userId.trim().length < 3) {
        return {
          valid: false,
          error: 'Google Scholar link is missing the "?user=" profile identifier.',
        };
      }
      const cleanId = userId.trim();
      return {
        valid: true,
        userId: cleanId,
        normalizedUrl: `https://scholar.google.com/citations?user=${encodeURIComponent(
          cleanId
        )}&hl=en`,
      };
    } catch {
      return {
        valid: false,
        error: 'Invalid Google Scholar URL format.',
      };
    }
  }

  if (trimmed.includes('/') || trimmed.includes('.com') || trimmed.includes('.org')) {
    return {
      valid: false,
      error: 'Enter a valid Google Scholar URL (https://scholar.google.com/citations?user=...).',
    };
  }

  if (/^[A-Za-z0-9_-]{6,20}$/.test(trimmed) && !trimmed.includes(' ')) {
    return {
      valid: true,
      userId: trimmed,
      normalizedUrl: `https://scholar.google.com/citations?user=${encodeURIComponent(
        trimmed
      )}&hl=en`,
    };
  }

  if (trimmed.length >= 3) {
    const cleanQueryId = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 12);
    return {
      valid: true,
      userId: cleanQueryId || 'scholar_query',
      queryName: trimmed,
      normalizedUrl: `https://scholar.google.com/citations?user=${encodeURIComponent(
        cleanQueryId || 'scholar_query'
      )}&hl=en`,
    };
  }

  return {
    valid: false,
    error: 'Input is too short. Paste a valid Google Scholar profile link.',
  };
}

/**
 * Computes h-index from an array of citation counts.
 */
export function calculateHIndex(citations: number[]): number {
  const sorted = [...citations].sort((a, b) => b - a);
  let h = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] >= i + 1) {
      h = i + 1;
    } else {
      break;
    }
  }
  return h;
}

/**
 * Computes g-index from an array of citation counts.
 */
export function calculateGIndex(citations: number[]): number {
  const sorted = [...citations].sort((a, b) => b - a);
  let cumulative = 0;
  let g = 0;
  for (let i = 0; i < sorted.length; i++) {
    cumulative += sorted[i];
    const rank = i + 1;
    if (cumulative >= rank * rank) {
      g = rank;
    }
  }
  return g;
}

/**
 * Maps a publication into one of 6 mutually exclusive portfolio categories:
 * Q1, Q2, Q3, Q4, Conference, or Non-Indexed.
 */
export function getPublicationPortfolioCategory(
  pub: Publication
): PortfolioCategory {
  if (pub.quartile === 'Q1') return 'Q1';
  if (pub.quartile === 'Q2') return 'Q2';
  if (pub.quartile === 'Q3') return 'Q3';
  if (pub.quartile === 'Q4') return 'Q4';
  if (pub.type === 'Conference') return 'Conference';
  return 'Non-Indexed';
}

/**
 * Returns a direct URL to the paper's website (DOI, publisher landing page, or Google Scholar citation page).
 */
export function getPublicationUrl(pub: Publication): string {
  if (pub.url && pub.url.trim().startsWith('http')) {
    return pub.url.trim();
  }
  if (pub.doi && pub.doi.trim()) {
    const cleanDoi = pub.doi.trim().replace(/^https?:\/\/doi\.org\//i, '');
    return `https://doi.org/${cleanDoi}`;
  }
  return `https://scholar.google.com/scholar?q=${encodeURIComponent(
    pub.title
  )}`;
}

/**
 * Computes research profile statistics from a list of publications.
 */
export function computeProfileStatistics(
  publications: Publication[],
  homeCountry: string = 'United States',
  currentYear: number = 2026,
  officialMetrics?: OfficialScholarMetrics
): ProfileStatistics {
  const totalPapers = publications.length;
  const citationList = publications.map((p) => p.citations);
  const computedCitations = citationList.reduce((acc, c) => acc + c, 0);
  const totalCitations =
    officialMetrics && typeof officialMetrics.totalCitations === 'number'
      ? officialMetrics.totalCitations
      : computedCitations;

  const hIndex =
    officialMetrics && typeof officialMetrics.hIndex === 'number'
      ? officialMetrics.hIndex
      : calculateHIndex(citationList);
  const i10Index =
    officialMetrics && typeof officialMetrics.i10Index === 'number'
      ? officialMetrics.i10Index
      : citationList.filter((c) => c >= 10).length;
  const gIndex = calculateGIndex(citationList);

  const meanCitationsPerPaper =
    totalPapers > 0 ? Number((totalCitations / totalPapers).toFixed(1)) : 0;

  const sortedCitations = [...citationList].sort((a, b) => a - b);
  const medianCitationsPerPaper =
    totalPapers === 0
      ? 0
      : totalPapers % 2 === 1
      ? sortedCitations[Math.floor(totalPapers / 2)]
      : Number(
          (
            (sortedCitations[totalPapers / 2 - 1] +
              sortedCitations[totalPapers / 2]) /
            2
          ).toFixed(1)
        );

  const maxCitations = totalPapers > 0 ? sortedCitations[totalPapers - 1] : 0;

  const minYear =
    totalPapers > 0
      ? Math.min(...publications.map((p) => p.year))
      : currentYear;
  const careerSpan = Math.max(1, currentYear - minYear + 1);
  const annualCitationVelocity = Number((totalCitations / careerSpan).toFixed(1));

  const openAccessCount = publications.filter((p) => p.openAccess).length;
  const openAccessPercentage =
    totalPapers > 0 ? Number(((openAccessCount / totalPapers) * 100).toFixed(1)) : 0;

  const firstOrCorrespondingCount = publications.filter(
    (p) =>
      p.authorshipRole === 'First Author' ||
      p.authorshipRole === 'Corresponding Author'
  ).length;
  const firstOrCorrespondingPercentage =
    totalPapers > 0
      ? Number(((firstOrCorrespondingCount / totalPapers) * 100).toFixed(1))
      : 0;

  const internationalCollabCount = publications.filter((p) =>
    p.coAuthors.some(
      (ca) => ca.universityId !== 'unlisted' && ca.country !== homeCountry
    )
  ).length;
  const internationalCollabPercentage =
    totalPapers > 0
      ? Number(((internationalCollabCount / totalPapers) * 100).toFixed(1))
      : 0;

  const rankedJournalCount = publications.filter(
    (p) => p.quartile !== 'Unranked'
  ).length;

  // Compute 6 mutually exclusive portfolio categories guaranteed to sum to 100.0%
  const portfolioKeys: PortfolioCategory[] = [
    'Q1',
    'Q2',
    'Q3',
    'Q4',
    'Conference',
    'Non-Indexed',
  ];
  const rawCategoryData = portfolioKeys.map((cat) => {
    const matching = publications.filter(
      (p) => getPublicationPortfolioCategory(p) === cat
    );
    const count = matching.length;
    const citations = matching.reduce((acc, p) => acc + p.citations, 0);
    const exactTenths = totalPapers > 0 ? (count / totalPapers) * 1000 : 0;
    const floorTenths = Math.floor(exactTenths);
    const remainder = exactTenths - floorTenths;
    return {
      cat,
      count,
      citations,
      floorTenths,
      remainder,
      finalTenths: floorTenths,
    };
  });

  if (totalPapers > 0) {
    let diffTenths =
      1000 - rawCategoryData.reduce((acc, d) => acc + d.floorTenths, 0);
    const sortedByRemainder = [...rawCategoryData].sort(
      (a, b) => b.remainder - a.remainder || b.count - a.count
    );
    let rIdx = 0;
    while (diffTenths > 0 && rIdx < sortedByRemainder.length) {
      sortedByRemainder[rIdx].finalTenths += 1;
      diffTenths -= 1;
      rIdx += 1;
    }
  }

  const portfolioDistribution = {} as Record<
    PortfolioCategory,
    PortfolioCategoryStat
  >;
  for (const d of rawCategoryData) {
    portfolioDistribution[d.cat] = {
      count: d.count,
      percentage: Number((d.finalTenths / 10).toFixed(1)),
      citations: d.citations,
    };
  }

  const quartiles: Quartile[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Unranked'];
  const quartileBreakdown = {} as Record<Quartile, CategoryStat>;

  for (const q of quartiles) {
    const matching = publications.filter((p) => p.quartile === q);
    const count = matching.length;
    const citations = matching.reduce((acc, p) => acc + p.citations, 0);
    quartileBreakdown[q] = {
      count,
      percentageOfTotal:
        q === 'Unranked'
          ? Number(
              (
                portfolioDistribution.Conference.percentage +
                portfolioDistribution['Non-Indexed'].percentage
              ).toFixed(1)
            )
          : portfolioDistribution[q].percentage,
      percentageOfRankedJournals:
        q === 'Unranked' || rankedJournalCount === 0
          ? 0
          : Number(((count / rankedJournalCount) * 100).toFixed(1)),
      citations,
    };
  }

  const pubTypes: PublicationType[] = [
    'Journal',
    'Conference',
    'Review',
    'Book Chapter',
    'Preprint',
  ];
  const typeBreakdown = {} as Record<PublicationType, TypeStat>;

  for (const t of pubTypes) {
    const matching = publications.filter((p) => p.type === t);
    const count = matching.length;
    const citations = matching.reduce((acc, p) => acc + p.citations, 0);
    typeBreakdown[t] = {
      count,
      percentageOfTotal:
        t === 'Conference'
          ? portfolioDistribution.Conference.percentage
          : totalPapers > 0
          ? Number(((count / totalPapers) * 100).toFixed(1))
          : 0,
      citations,
    };
  }

  const yearMap = new Map<number, YearlyStat>();
  const hasOfficialYearlyCitations =
    Boolean(officialMetrics?.citationsByYear) &&
    Object.keys(officialMetrics!.citationsByYear!).length > 0;

  if (hasOfficialYearlyCitations && officialMetrics?.citationsByYear) {
    for (const [yrStr, citCount] of Object.entries(
      officialMetrics.citationsByYear
    )) {
      const yrNum = Number(yrStr);
      if (!Number.isFinite(yrNum) || yrNum < 1950) continue;
      yearMap.set(yrNum, {
        year: yrNum,
        papers: 0,
        citations: Number(citCount) || 0,
        q1Count: 0,
        q2Count: 0,
        q3Count: 0,
        q4Count: 0,
        conferenceCount: 0,
        otherCount: 0,
      });
    }
  }

  for (const p of publications) {
    if (!yearMap.has(p.year)) {
      yearMap.set(p.year, {
        year: p.year,
        papers: 0,
        citations: 0,
        q1Count: 0,
        q2Count: 0,
        q3Count: 0,
        q4Count: 0,
        conferenceCount: 0,
        otherCount: 0,
      });
    }
    const entry = yearMap.get(p.year)!;
    entry.papers += 1;
    if (!hasOfficialYearlyCitations) {
      entry.citations += p.citations;
    }
    const cat = getPublicationPortfolioCategory(p);
    if (cat === 'Q1') entry.q1Count += 1;
    else if (cat === 'Q2') entry.q2Count += 1;
    else if (cat === 'Q3') entry.q3Count += 1;
    else if (cat === 'Q4') entry.q4Count += 1;
    else if (cat === 'Conference') entry.conferenceCount += 1;
    else entry.otherCount += 1;
  }

  const yearlyTrend = Array.from(yearMap.values()).sort((a, b) => a.year - b.year);

  const bracketDefs: { label: string; min: number; max: number | null }[] = [
    { label: '0–25', min: 0, max: 25 },
    { label: '26–100', min: 26, max: 100 },
    { label: '101–500', min: 101, max: 500 },
    { label: '501–2,000', min: 501, max: 2000 },
    { label: '2,000+', min: 2001, max: null },
  ];

  const citationBrackets: CitationBracket[] = bracketDefs.map((b) => {
    const count = publications.filter(
      (p) =>
        p.citations >= b.min && (b.max === null || p.citations <= b.max)
    ).length;
    return {
      ...b,
      count,
      percentage:
        totalPapers > 0 ? Number(((count / totalPapers) * 100).toFixed(1)) : 0,
    };
  });

  const topCitedPaper =
    totalPapers > 0
      ? [...publications].sort((a, b) => b.citations - a.citations)[0]
      : null;

  const q1Q2CombinedPercentage = Number(
    (
      portfolioDistribution.Q1.percentage + portfolioDistribution.Q2.percentage
    ).toFixed(1)
  );

  return {
    totalPapers,
    totalCitations,
    hIndex,
    i10Index,
    gIndex,
    meanCitationsPerPaper,
    medianCitationsPerPaper,
    maxCitations,
    annualCitationVelocity,
    openAccessCount,
    openAccessPercentage,
    firstOrCorrespondingCount,
    firstOrCorrespondingPercentage,
    internationalCollabCount,
    internationalCollabPercentage,
    rankedJournalCount,
    quartileBreakdown,
    portfolioDistribution,
    typeBreakdown,
    yearlyTrend,
    citationBrackets,
    topCitedPaper,
    q1Q2CombinedPercentage,
  };
}

/**
 * Filters and sorts publications based on active user filter criteria.
 */
export function filterAndSortPublications(
  publications: Publication[],
  filter: PublicationFilterState
): Publication[] {
  const minCit =
    filter.minCitations.trim() !== '' ? Number(filter.minCitations) : null;
  const maxCit =
    filter.maxCitations.trim() !== '' ? Number(filter.maxCitations) : null;
  const minYr = filter.minYear.trim() !== '' ? Number(filter.minYear) : null;
  const maxYr = filter.maxYear.trim() !== '' ? Number(filter.maxYear) : null;
  const query = filter.searchQuery.trim().toLowerCase();

  const filtered = publications.filter((pub) => {
    if (minCit !== null && !Number.isNaN(minCit) && pub.citations < minCit) {
      return false;
    }
    if (maxCit !== null && !Number.isNaN(maxCit) && pub.citations > maxCit) {
      return false;
    }
    if (minYr !== null && !Number.isNaN(minYr) && pub.year < minYr) {
      return false;
    }
    if (maxYr !== null && !Number.isNaN(maxYr) && pub.year > maxYr) {
      return false;
    }
    if (
      filter.quartiles.length > 0 &&
      !filter.quartiles.includes(pub.quartile)
    ) {
      return false;
    }
    if (filter.types.length > 0 && !filter.types.includes(pub.type)) {
      return false;
    }
    if (
      filter.authorshipRole !== 'All' &&
      pub.authorshipRole !== filter.authorshipRole
    ) {
      return false;
    }
    if (filter.openAccessOnly && !pub.openAccess) {
      return false;
    }
    if (
      filter.universityId !== 'All' &&
      !pub.coAuthors.some((ca) => ca.universityId === filter.universityId)
    ) {
      return false;
    }
    if (
      filter.coAuthorName !== 'All' &&
      !pub.coAuthors.some((ca) => ca.name === filter.coAuthorName)
    ) {
      return false;
    }
    if (
      filter.country !== 'All' &&
      !pub.coAuthors.some((ca) => ca.country === filter.country)
    ) {
      return false;
    }
    if (filter.venue !== 'All' && pub.venue !== filter.venue) {
      return false;
    }
    if (query) {
      const inTitle = pub.title.toLowerCase().includes(query);
      const inVenue = pub.venue.toLowerCase().includes(query);
      const inAuthors = pub.coAuthors.some(
        (ca) =>
          ca.name.toLowerCase().includes(query) ||
          ca.universityName.toLowerCase().includes(query) ||
          ca.country.toLowerCase().includes(query)
      );
      if (!inTitle && !inVenue && !inAuthors) {
        return false;
      }
    }
    return true;
  });

  const quartileRank: Record<Quartile, number> = {
    Q1: 1,
    Q2: 2,
    Q3: 3,
    Q4: 4,
    Unranked: 5,
  };

  return [...filtered].sort((a, b) => {
    switch (filter.sortBy) {
      case 'citations-desc':
        return b.citations - a.citations || b.year - a.year;
      case 'citations-asc':
        return a.citations - b.citations || b.year - a.year;
      case 'year-desc':
        return b.year - a.year || b.citations - a.citations;
      case 'year-asc':
        return a.year - b.year || b.citations - a.citations;
      case 'quartile-asc':
        return (
          quartileRank[a.quartile] - quartileRank[b.quartile] ||
          b.citations - a.citations
        );
      case 'title-asc':
        return a.title.localeCompare(b.title);
      default:
        return b.citations - a.citations;
    }
  });
}

/**
 * Aggregates all universities with which the researcher has collaborated.
 */
export function aggregateUniversityCollaborations(
  publications: Publication[],
  homeProfile?: ResearcherProfile
): UniversityCollaboration[] {
  const uniMap = new Map<
    string,
    {
      meta: CoAuthorAffiliation;
      papers: Map<string, Publication>;
      authorMap: Map<string, { paperIds: Set<string>; citations: number }>;
    }
  >();

  // 1. Always include the researcher's home institution when homeProfile is provided
  if (
    homeProfile &&
    homeProfile.homeUniversity &&
    homeProfile.homeUniversityId
  ) {
    const homeMeta: CoAuthorAffiliation = {
      name: homeProfile.name,
      universityId: homeProfile.homeUniversityId,
      universityName: homeProfile.homeUniversity,
      city: homeProfile.homeCity || 'Dhaka',
      country: homeProfile.homeCountry || 'Bangladesh',
      countryCode: 'BD',
      continent: 'Asia',
      lat: homeProfile.homeLat || 23.7548,
      lng: homeProfile.homeLng || 90.3585,
      isHomeInstitution: true,
    };
    uniMap.set(homeProfile.homeUniversityId, {
      meta: homeMeta,
      papers: new Map(),
      authorMap: new Map(),
    });
  }

  for (const pub of publications) {
    // If researcher is affiliated with home university, attribute publication to home institution
    if (
      homeProfile &&
      homeProfile.homeUniversityId &&
      uniMap.has(homeProfile.homeUniversityId)
    ) {
      const homeEntry = uniMap.get(homeProfile.homeUniversityId)!;
      homeEntry.papers.set(pub.id, pub);
      if (!homeEntry.authorMap.has(homeProfile.name)) {
        homeEntry.authorMap.set(homeProfile.name, {
          paperIds: new Set(),
          citations: 0,
        });
      }
      const hAuthor = homeEntry.authorMap.get(homeProfile.name)!;
      if (!hAuthor.paperIds.has(pub.id)) {
        hAuthor.paperIds.add(pub.id);
        hAuthor.citations += pub.citations;
      }
    }

    for (const ca of pub.coAuthors) {
      if (ca.universityId === 'unlisted') continue;
      if (!uniMap.has(ca.universityId)) {
        uniMap.set(ca.universityId, {
          meta: ca,
          papers: new Map(),
          authorMap: new Map(),
        });
      }
      const entry = uniMap.get(ca.universityId)!;
      entry.papers.set(pub.id, pub);

      if (!entry.authorMap.has(ca.name)) {
        entry.authorMap.set(ca.name, { paperIds: new Set(), citations: 0 });
      }
      const authorEntry = entry.authorMap.get(ca.name)!;
      if (!authorEntry.paperIds.has(pub.id)) {
        authorEntry.paperIds.add(pub.id);
        authorEntry.citations += pub.citations;
      }
    }
  }

  const results: UniversityCollaboration[] = [];
  for (const [universityId, data] of uniMap.entries()) {
    const papers = Array.from(data.papers.values()).sort(
      (a, b) => b.citations - a.citations
    );
    const totalCitations = papers.reduce((acc, p) => acc + p.citations, 0);
    const q1PaperCount = papers.filter((p) => p.quartile === 'Q1').length;
    const years = papers.map((p) => p.year);

    const coAuthors = Array.from(data.authorMap.entries())
      .map(([name, stats]) => ({
        name,
        paperCount: stats.paperIds.size,
        citations: stats.citations,
      }))
      .sort((a, b) => b.paperCount - a.paperCount || b.citations - a.citations);

    results.push({
      universityId,
      universityName: data.meta.universityName,
      city: data.meta.city,
      country: data.meta.country,
      countryCode: data.meta.countryCode,
      continent: data.meta.continent,
      lat: data.meta.lat,
      lng: data.meta.lng,
      isHomeInstitution: homeProfile
        ? universityId === homeProfile.homeUniversityId
        : Boolean(data.meta.isHomeInstitution),
      paperCount: papers.length,
      totalCitations,
      q1PaperCount,
      coAuthors,
      papers,
      firstCollaborationYear: Math.min(...years),
      latestCollaborationYear: Math.max(...years),
    });
  }

  const sorted = results.sort(
    (a, b) => b.paperCount - a.paperCount || b.totalCitations - a.totalCitations
  );

  // Guarantee that if any two universities received identical city-center fallback coordinates
  // (within 0.002 degrees ~ 220m), they are placed at distinct ~1.5km campus offsets around the city center
  const placedCoords: { lat: number; lng: number }[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const u = sorted[i];
    let lat = u.lat;
    let lng = u.lng;
    let collisionCount = 0;
    while (
      placedCoords.some(
        (p) => Math.hypot(p.lat - lat, p.lng - lng) < 0.004
      ) &&
      collisionCount < 50
    ) {
      collisionCount++;
      const angle = collisionCount * 2.399963229728653; // Golden angle in radians
      const radiusDeg = 0.013 * Math.sqrt(collisionCount); // ~1.4 km per step
      lat = u.lat + Math.sin(angle) * radiusDeg;
      lng = u.lng + Math.cos(angle) * radiusDeg;
    }
    u.lat = Number(lat.toFixed(5));
    u.lng = Number(lng.toFixed(5));
    placedCoords.push({ lat: u.lat, lng: u.lng });
  }

  return sorted;
}

/**
 * Aggregates complete list of co-authors across all publications.
 */
export function aggregateCoAuthors(
  publications: Publication[]
): CoAuthorSummary[] {
  const authorMap = new Map<
    string,
    {
      meta: CoAuthorAffiliation;
      papers: Map<string, Publication>;
    }
  >();

  for (const pub of publications) {
    for (const ca of pub.coAuthors) {
      if (!authorMap.has(ca.name)) {
        authorMap.set(ca.name, { meta: ca, papers: new Map() });
      } else if (
        authorMap.get(ca.name)!.meta.universityId === 'unlisted' &&
        ca.universityId !== 'unlisted'
      ) {
        authorMap.get(ca.name)!.meta = ca;
      }
      authorMap.get(ca.name)!.papers.set(pub.id, pub);
    }
  }

  return Array.from(authorMap.entries())
    .map(([name, data]) => {
      const papers = Array.from(data.papers.values()).sort(
        (a, b) => b.citations - a.citations
      );
      const totalCitations = papers.reduce((acc, p) => acc + p.citations, 0);
      const q1Papers = papers.filter((p) => p.quartile === 'Q1').length;
      const years = papers.map((p) => p.year);
      return {
        name,
        universityId: data.meta.universityId,
        universityName: data.meta.universityName,
        city: data.meta.city,
        country: data.meta.country,
        countryCode: data.meta.countryCode,
        paperCount: papers.length,
        totalCitations,
        q1Papers,
        firstYear: Math.min(...years),
        latestYear: Math.max(...years),
        papers,
      };
    })
    .sort(
      (a, b) => b.paperCount - a.paperCount || b.totalCitations - a.totalCitations
    );
}

/**
 * Aggregates complete list of countries collaborated with.
 */
export function aggregateCountries(
  publications: Publication[]
): CountryCollaboration[] {
  const totalPapers = publications.length;
  const countryMap = new Map<
    string,
    {
      countryCode: string;
      continent: string;
      universities: Set<string>;
      coAuthors: Set<string>;
      papers: Map<string, Publication>;
    }
  >();

  for (const pub of publications) {
    for (const ca of pub.coAuthors) {
      if (ca.universityId === 'unlisted' || !ca.country || ca.country === 'Unlisted') {
        continue;
      }
      if (!countryMap.has(ca.country)) {
        countryMap.set(ca.country, {
          countryCode: ca.countryCode,
          continent: ca.continent,
          universities: new Set(),
          coAuthors: new Set(),
          papers: new Map(),
        });
      }
      const entry = countryMap.get(ca.country)!;
      entry.universities.add(ca.universityName);
      entry.coAuthors.add(ca.name);
      entry.papers.set(pub.id, pub);
    }
  }

  return Array.from(countryMap.entries())
    .map(([country, data]) => {
      const papers = Array.from(data.papers.values());
      const totalCitations = papers.reduce((acc, p) => acc + p.citations, 0);
      return {
        country,
        countryCode: data.countryCode,
        continent: data.continent,
        universityCount: data.universities.size,
        coAuthorCount: data.coAuthors.size,
        paperCount: papers.length,
        totalCitations,
        percentageOfTotalPapers:
          totalPapers > 0
            ? Number(((papers.length / totalPapers) * 100).toFixed(1))
            : 0,
        universities: Array.from(data.universities).sort(),
      };
    })
    .sort(
      (a, b) => b.paperCount - a.paperCount || b.totalCitations - a.totalCitations
    );
}

/**
 * Aggregates complete list of journals and venues.
 */
export function aggregateJournals(publications: Publication[]): JournalSummary[] {
  const normalizedPubs = normalizePublicationsVenueConsistency(publications);
  const venueMap = new Map<string, Publication[]>();
  for (const pub of normalizedPubs) {
    const cleanKey = pub.venue.trim();
    if (!venueMap.has(cleanKey)) {
      venueMap.set(cleanKey, []);
    }
    venueMap.get(cleanKey)!.push(pub);
  }

  return Array.from(venueMap.entries())
    .map(([venue, papers]) => {
      const sample = papers[0];
      const totalCitations = papers.reduce((acc, p) => acc + p.citations, 0);
      return {
        venue,
        type: sample.type,
        quartile: sample.quartile,
        paperCount: papers.length,
        totalCitations,
        avgCitations: Number((totalCitations / papers.length).toFixed(1)),
        papers: [...papers].sort((a, b) => b.citations - a.citations),
      };
    })
    .sort(
      (a, b) => b.paperCount - a.paperCount || b.totalCitations - a.totalCitations
    );
}
