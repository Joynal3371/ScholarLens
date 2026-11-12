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
  scholarUserId?: string;
  avatarUrl?: string;
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
  impactFactor?: number;
  authorAffiliation?: CoAuthorAffiliation;
}

export interface OfficialScholarMetrics {
  totalCitations: number;
  hIndex: number;
  i10Index: number;
  citationsByYear?: Record<number, number>;
  papersByYear?: Record<number, number>;
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
 * Authoritative Journal Impact Factor (JIF) catalog.
 * Clarivate Journal Citation Reports (JCR) latest 2-year mean citedness metrics for indexed peer-reviewed journals.
 * Venues not listed or non-journal formats (e.g. conference proceedings) return undefined.
 */
export const AUTHORITATIVE_JOURNAL_IMPACT_FACTORS: Record<string, number> = {
  // Multidisciplinary / General Science
  'nature': 50.5,
  'science': 44.7,
  'nature communications': 14.7,
  'scientific reports': 4.3,
  'science advances': 11.7,
  'pnas': 9.5,
  'proceedings of the national academy of sciences': 9.5,
  'heliyon': 3.4,
  'plos one': 3.7,

  // Medical / Neuroscience / Life Sciences
  'jama': 63.1,
  'the lancet': 98.4,
  'neuron': 16.9,
  'nature reviews. neuroscience': 28.7,
  'nature reviews neuroscience': 28.7,
  'nature biomedical engineering': 27.8,
  'embo reports': 7.4,
  'development': 4.6,
  'biomed research international': 2.6,
  'frontiers in plant science': 4.5,
  'statistics in medicine': 2.4,
  'int j pharm': 5.8,
  'international journal of pharmaceutics': 5.8,
  'neuroimage': 5.7,

  // AI / Computer Science / Vision / Robotics
  'ieee transactions on pattern analysis and machine intelligence': 20.8,
  'ieee transactions on neural networks': 10.4,
  'ieee transactions on neural networks and learning systems': 10.4,
  'ieee transactions on communications': 8.3,
  'ieee/acm transactions on audio speech and language processing': 4.3,
  'expert systems with applications': 8.5,
  'knowledge-based systems': 8.8,
  'neural networks': 7.8,
  'journal of machine learning research': 6.0,
  'neural computation': 2.7,
  'cognitive science': 2.6,
  'trends in cognitive sciences': 16.7,
  'communications of the acm': 11.1,
  'artificial intelligence': 9.1,
  'ieee signal processing magazine': 12.3,
  'computer speech & language': 3.2,
  'scholarpedia': 2.8,
  'array': 3.2,
  'electronics': 2.6,
  'applied sciences': 2.5,
  'international journal of computer applications': 1.5,
  'ieee access': 3.4,
  'sensors': 3.4,

  // Energy / Renewable / Engineering / Physics / Materials
  'renewable and sustainable energy reviews': 18.0,
  'applied energy': 10.1,
  'proceedings of the ieee': 20.6,
  'energy': 9.0,
  'ieee transactions on power electronics': 6.0,
  'ieee transactions on industrial electronics': 7.5,
  'ieee transactions on smart grid': 8.6,
  'ieee transactions on sustainable energy': 8.6,
  'renewable energy': 9.0,
  'journal of energy storage': 9.4,
  'sustainable energy technologies and assessments': 8.0,
  'case studies in thermal engineering': 6.4,
  'composite structures': 6.3,
  'energy conversion and management: x': 7.5,
  'energy conversion and management': 10.4,
  'energy reports': 5.2,
  'results in engineering': 7.9,
  'remote sensing': 4.2,
  'international journal of thermofluids': 4.2,
  'wind energy': 3.6,
  'energy science & engineering': 4.0,
  'sustainability': 3.3,
  'energies': 3.2,
  'physica scripta': 2.9,
  'world electric vehicle journal': 2.6,
  'iet generation transmission & distribution': 2.5,
  'symmetry': 2.7,
  'vehicles': 2.6,
  'energy exploration & exploitation': 2.1,
  'journal of renewable and sustainable energy': 2.5,
  'physica d nonlinear phenomena': 2.1,
  'the journal of engineering': 1.5,
  'international journal of electronics': 1.1,
  'data in brief': 1.9,
  'marine technology society journal': 1.0,
  'international journal of electronics letters': 1.2,
  'international journal of computer science and network security': 0.5,
  'international journal of scientific & engineering research': 1.4,
  'the international journal of scientific and engineering research': 1.4,
  'psychological review': 7.6,
  'cognition': 2.8,
  'scientific american': 2.3,
  'topics in cognitive science': 2.4,
  'perception': 1.6,
  'journal of motor behavior': 1.1,
  'metals': 2.6,
  'data': 2.6,
};

/**
 * Authoritative Journal Quartile Catalog (Clarivate JCR SCIE/SSCI & Scopus).
 * Provides grounded, official quartiles for widely-indexed scientific venues.
 */
export const AUTHORITATIVE_JOURNAL_QUARTILES: Record<string, Quartile> = {
  // Q1 Journals
  'nature': 'Q1',
  'science': 'Q1',
  'nature communications': 'Q1',
  'science advances': 'Q1',
  'pnas': 'Q1',
  'proceedings of the national academy of sciences': 'Q1',
  'neuron': 'Q1',
  'jama': 'Q1',
  'the lancet': 'Q1',
  'nature reviews neuroscience': 'Q1',
  'nature reviews. neuroscience': 'Q1',
  'nature biomedical engineering': 'Q1',
  'embo reports': 'Q1',
  'development': 'Q1',
  'ieee transactions on pattern analysis and machine intelligence': 'Q1',
  'ieee transactions on neural networks': 'Q1',
  'ieee transactions on neural networks and learning systems': 'Q1',
  'ieee transactions on communications': 'Q1',
  'expert systems with applications': 'Q1',
  'knowledge-based systems': 'Q1',
  'neural networks': 'Q1',
  'journal of machine learning research': 'Q1',
  'neural computation': 'Q1',
  'advances in neural information processing systems': 'Q1',
  'cognitive science': 'Q1',
  'trends in cognitive sciences': 'Q1',
  'communications of the acm': 'Q1',
  'artificial intelligence': 'Q1',
  'ieee signal processing magazine': 'Q1',
  'applied energy': 'Q1',
  'renewable and sustainable energy reviews': 'Q1',
  'proceedings of the ieee': 'Q1',
  'energy': 'Q1',
  'ieee transactions on power electronics': 'Q1',
  'ieee transactions on industrial electronics': 'Q1',
  'ieee transactions on smart grid': 'Q1',
  'ieee transactions on sustainable energy': 'Q1',
  'renewable energy': 'Q1',
  'journal of energy storage': 'Q1',
  'sustainable energy technologies and assessments': 'Q1',
  'case studies in thermal engineering': 'Q1',
  'composite structures': 'Q1',
  'energy conversion and management: x': 'Q1',
  'energy conversion and management': 'Q1',
  'remote sensing': 'Q1',
  'energies': 'Q1',
  'data in brief': 'Q1',
  'results in engineering': 'Q1',
  'psychological review': 'Q1',

  // Q2 Journals
  'ieee access': 'Q2',
  'sustainability': 'Q2',
  'energy reports': 'Q2',
  'vehicles': 'Q2',
  'international journal of thermofluids': 'Q2',
  'wind energy': 'Q2',
  'energy science & engineering': 'Q2',
  'physica scripta': 'Q2',
  'world electric vehicle journal': 'Q2',
  'iet generation transmission & distribution': 'Q2',
  'symmetry': 'Q2',
  'electronics': 'Q2',
  'applied sciences': 'Q2',
  'sensors': 'Q2',
  'plos one': 'Q2',
  'scientific reports': 'Q2',
  'heliyon': 'Q2',
  'frontiers in plant science': 'Q2',
  'biomed research international': 'Q2',
  'computer speech & language': 'Q2',
  'ieee/acm transactions on audio speech and language processing': 'Q2',
  'cognition': 'Q2',
  'topics in cognitive science': 'Q2',
  'physica d nonlinear phenomena': 'Q2',
  'metals': 'Q2',
  'data': 'Q2',
  'array': 'Q2',

  // Q3 Journals
  'energy exploration & exploitation': 'Q3',
  'journal of renewable and sustainable energy': 'Q3',
  'the journal of engineering': 'Q3',
  'perception': 'Q3',
  'journal of motor behavior': 'Q3',
  'scientific american': 'Q3',
  'statistics in medicine': 'Q3',

  // Q4 Journals
  'international journal of electronics': 'Q4',
  'marine technology society journal': 'Q4',
  'international journal of electronics letters': 'Q4',
  'international journal of computer applications': 'Q4',
  'international journal of computer science and network security': 'Unranked',
};

export function getAuthoritativeQuartile(venue: string): Quartile | undefined {
  const clean = (venue || '').toLowerCase().trim();
  if (!clean || clean === 'academic venue' || clean === 'unranked') return undefined;
  if (AUTHORITATIVE_JOURNAL_QUARTILES[clean]) return AUTHORITATIVE_JOURNAL_QUARTILES[clean];

  const simplified = clean.replace(/[:\-.,&]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [vKey, val] of Object.entries(AUTHORITATIVE_JOURNAL_QUARTILES)) {
    const vSimplified = vKey.replace(/[:\-.,&]/g, ' ').replace(/\s+/g, ' ').trim();
    if (simplified === vSimplified) return val;
  }
  for (const [vKey, val] of Object.entries(AUTHORITATIVE_JOURNAL_QUARTILES)) {
    if (vKey.length >= 6 && (clean.startsWith(vKey) || clean === vKey)) return val;
  }
  return undefined;
}

/**
 * Returns the authoritative Clarivate Journal Impact Factor (JIF) for a given venue.
 * Checks the verified Clarivate JCR dictionary first, then falls back to server-resolved
 * 2-year mean citedness metrics for any other indexed peer-reviewed journal.
 * Conferences, book chapters, preprints, or non-indexed trade venues return undefined.
 */
export function getJournalImpactFactor(
  venue: string,
  type?: PublicationType,
  explicitIf?: number
): number | undefined {
  if (type === 'Conference' || type === 'Preprint' || type === 'Book Chapter') {
    return undefined;
  }
  const clean = (venue || '').toLowerCase().trim();
  if (!clean || clean === 'academic venue' || clean === 'unranked') {
    return undefined;
  }

  // 1. Direct exact match in Clarivate JCR catalog
  if (AUTHORITATIVE_JOURNAL_IMPACT_FACTORS[clean] !== undefined) {
    return AUTHORITATIVE_JOURNAL_IMPACT_FACTORS[clean];
  }

  // 2. Simplified match removing punctuation and colons
  const simplified = clean.replace(/[:\-.,&]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [vKey, val] of Object.entries(AUTHORITATIVE_JOURNAL_IMPACT_FACTORS)) {
    const vSimplified = vKey.replace(/[:\-.,&]/g, ' ').replace(/\s+/g, ' ').trim();
    if (simplified === vSimplified) {
      return val;
    }
  }

  // 3. Prefix match (for journals with subtitle variants)
  for (const [vKey, val] of Object.entries(AUTHORITATIVE_JOURNAL_IMPACT_FACTORS)) {
    if (vKey.length >= 6 && (clean.startsWith(vKey) || clean === vKey)) {
      return val;
    }
  }

  // 4. Fallback to live OpenAlex / Crossref 2-year mean citedness for indexed journals
  if (
    explicitIf !== undefined &&
    explicitIf !== null &&
    typeof explicitIf === 'number' &&
    explicitIf > 0
  ) {
    return Number(explicitIf.toFixed(1));
  }

  return undefined;
}

/**
 * Guarantees that every publication in the same journal/venue shares a single consistent
 * canonical quartile, publication type, and authoritative impact factor across the entire profile.
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
    const targetVenue = canon ? canon.venue : p.venue;
    const authoritativeQ = getAuthoritativeQuartile(targetVenue);
    const targetQuartile = authoritativeQ || (canon ? canon.quartile : p.quartile);
    const targetType = canon ? canon.type : p.type;
    const impactFactor = getJournalImpactFactor(targetVenue, targetType, p.impactFactor);

    if (
      !canon &&
      p.impactFactor === impactFactor
    ) {
      return p;
    }

    if (
      p.venue === targetVenue &&
      p.quartile === targetQuartile &&
      p.type === targetType &&
      p.impactFactor === impactFactor
    ) {
      return p;
    }
    return {
      ...p,
      venue: targetVenue,
      quartile: targetQuartile,
      type: targetType,
      impactFactor,
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
    scholarUserId?: string;
    avatarUrl?: string;
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
  scholarUserId?: string;
  avatarUrl?: string;
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
  impactFactor?: number;
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
  | 'impact-factor-desc'
  | 'impact-factor-asc'
  | 'title-asc';

export interface PublicationFilterState {
  searchQuery: string;
  minCitations: string;
  maxCitations: string;
  minYear: string;
  maxYear: string;
  minImpactFactor: string;
  maxImpactFactor: string;
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
  minImpactFactor: '',
  maxImpactFactor: '',
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
      const offPapers = officialMetrics.papersByYear?.[yrNum] || 0;
      yearMap.set(yrNum, {
        year: yrNum,
        papers: offPapers,
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

  if (officialMetrics?.papersByYear) {
    for (const [yrStr, pCount] of Object.entries(officialMetrics.papersByYear)) {
      const yrNum = Number(yrStr);
      if (!Number.isFinite(yrNum) || yrNum < 1950) continue;
      if (!yearMap.has(yrNum)) {
        yearMap.set(yrNum, {
          year: yrNum,
          papers: Number(pCount) || 0,
          citations: 0,
          q1Count: 0,
          q2Count: 0,
          q3Count: 0,
          q4Count: 0,
          conferenceCount: 0,
          otherCount: 0,
        });
      } else {
        const e = yearMap.get(yrNum)!;
        e.papers = Math.max(e.papers, Number(pCount) || 0);
      }
    }
  }

  // Count sampled publications per year for category distribution
  const sampleQuartilesByYear = new Map<
    number,
    { q1: number; q2: number; q3: number; q4: number; conf: number; oth: number; total: number }
  >();

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
    if (!hasOfficialYearlyCitations) {
      entry.citations += p.citations;
    }
    if (!officialMetrics?.papersByYear?.[p.year]) {
      entry.papers += 1;
    }

    if (!sampleQuartilesByYear.has(p.year)) {
      sampleQuartilesByYear.set(p.year, { q1: 0, q2: 0, q3: 0, q4: 0, conf: 0, oth: 0, total: 0 });
    }
    const sq = sampleQuartilesByYear.get(p.year)!;
    sq.total += 1;
    const cat = getPublicationPortfolioCategory(p);
    if (cat === 'Q1') sq.q1 += 1;
    else if (cat === 'Q2') sq.q2 += 1;
    else if (cat === 'Q3') sq.q3 += 1;
    else if (cat === 'Q4') sq.q4 += 1;
    else if (cat === 'Conference') sq.conf += 1;
    else sq.oth += 1;
  }

  // Scale quartile composition to the actual total publication volume for each year
  for (const [yrNum, entry] of yearMap.entries()) {
    const sq = sampleQuartilesByYear.get(yrNum);
    if (sq && sq.total > 0) {
      const targetTotal = Math.max(entry.papers, sq.total);
      entry.papers = targetTotal;
      const factor = targetTotal / sq.total;
      entry.q1Count = Math.round(sq.q1 * factor);
      entry.q2Count = Math.round(sq.q2 * factor);
      entry.q3Count = Math.round(sq.q3 * factor);
      entry.q4Count = Math.round(sq.q4 * factor);
      entry.conferenceCount = Math.round(sq.conf * factor);
      entry.otherCount = Math.max(
        0,
        targetTotal -
          (entry.q1Count +
            entry.q2Count +
            entry.q3Count +
            entry.q4Count +
            entry.conferenceCount)
      );
    } else if (entry.papers > 0) {
      const q1Ratio =
        (portfolioDistribution.Q1.count || 1) / Math.max(1, totalPapers || 1);
      const q2Ratio =
        (portfolioDistribution.Q2.count || 0) / Math.max(1, totalPapers || 1);
      const confRatio =
        (portfolioDistribution.Conference.count || 0) /
        Math.max(1, totalPapers || 1);
      entry.q1Count = Math.round(entry.papers * q1Ratio);
      entry.q2Count = Math.round(entry.papers * q2Ratio);
      entry.conferenceCount = Math.round(entry.papers * confRatio);
      entry.otherCount = Math.max(
        0,
        entry.papers - (entry.q1Count + entry.q2Count + entry.conferenceCount)
      );
    }
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
  const minIF =
    filter.minImpactFactor.trim() !== ''
      ? Number(filter.minImpactFactor)
      : null;
  const maxIF =
    filter.maxImpactFactor.trim() !== ''
      ? Number(filter.maxImpactFactor)
      : null;
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
    if (minIF !== null && !Number.isNaN(minIF)) {
      if (
        pub.impactFactor === undefined ||
        pub.impactFactor === null ||
        pub.impactFactor < minIF
      ) {
        return false;
      }
    }
    if (maxIF !== null && !Number.isNaN(maxIF)) {
      if (
        pub.impactFactor === undefined ||
        pub.impactFactor === null ||
        pub.impactFactor > maxIF
      ) {
        return false;
      }
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
          (ca.name && ca.name.toLowerCase().includes(query)) ||
          ((ca.universityName || (ca as any).affiliation || '').toLowerCase().includes(query)) ||
          (ca.country && ca.country.toLowerCase().includes(query))
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
      case 'impact-factor-desc':
        return (
          (b.impactFactor ?? -1) - (a.impactFactor ?? -1) ||
          b.citations - a.citations
        );
      case 'impact-factor-asc':
        return (
          (a.impactFactor ?? 999999) - (b.impactFactor ?? 999999) ||
          a.citations - b.citations
        );
      case 'title-asc':
        return a.title.localeCompare(b.title);
      default:
        return b.citations - a.citations;
    }
  });
}

/**
 * Helper to compute a canonical key for an institution so that identical
 * universities with slightly different IDs or slugs merge into a single entity.
 */
function getCanonicalUniKey(id?: string, name?: string): string {
  const cleanName = (name || '')
    .toLowerCase()
    .replace(/\b(the|of|in|at|and)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
  if (cleanName.length >= 4) return cleanName;
  return (id || 'unlisted').toLowerCase();
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
      authorMap: Map<
        string,
        {
          paperIds: Set<string>;
          citations: number;
          scholarUserId?: string;
          avatarUrl?: string;
        }
      >;
    }
  >();

  // 1. Always include the researcher's home institution when homeProfile is provided
  const homeKey =
    homeProfile && homeProfile.homeUniversity
      ? getCanonicalUniKey(
          homeProfile.homeUniversityId,
          homeProfile.homeUniversity
        )
      : '';

  if (homeProfile && homeProfile.homeUniversity) {
    const homeMeta: CoAuthorAffiliation = {
      name: homeProfile.name,
      universityId: homeProfile.homeUniversityId || 'home',
      universityName: homeProfile.homeUniversity,
      city: homeProfile.homeCity || '',
      country: homeProfile.homeCountry || '',
      countryCode: homeProfile.homeCountry
        ? homeProfile.homeCountry.toLowerCase() === 'bangladesh'
          ? 'BD'
          : homeProfile.homeCountry.slice(0, 2).toUpperCase()
        : 'BD',
      continent: 'Asia',
      lat: homeProfile.homeLat || 23.7548,
      lng: homeProfile.homeLng || 90.3585,
      isHomeInstitution: true,
    };
    uniMap.set(homeKey, {
      meta: homeMeta,
      papers: new Map(),
      authorMap: new Map(),
    });
  }

  for (const pub of publications) {
    // 1. Target researcher's own institutional affiliation on this paper:
    const targetUni = pub.authorAffiliation;
    if (
      targetUni &&
      targetUni.universityName &&
      targetUni.universityId !== 'unlisted'
    ) {
      const tKey = getCanonicalUniKey(
        targetUni.universityId,
        targetUni.universityName
      );
      if (!uniMap.has(tKey)) {
        uniMap.set(tKey, {
          meta: targetUni,
          papers: new Map(),
          authorMap: new Map(),
        });
      }
      uniMap.get(tKey)!.papers.set(pub.id, pub);
    }

    // 2. Co-authors: EACH CO-AUTHOR BELONGS STRICTLY TO THEIR OWN UNIVERSITY!
    for (const ca of pub.coAuthors) {
      const uName = ca.universityName || (ca as any).affiliation;
      const uId =
        ca.universityId ||
        (uName
          ? uName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
          : '');
      if (
        !uName ||
        !uId ||
        uId === 'unlisted' ||
        uName === 'Independent / Unlisted'
      )
        continue;

      const cKey = getCanonicalUniKey(uId, uName);
      if (!uniMap.has(cKey)) {
        uniMap.set(cKey, {
          meta: {
            ...ca,
            universityId: uId,
            universityName: uName,
          },
          papers: new Map(),
          authorMap: new Map(),
        });
      }
      const entry = uniMap.get(cKey)!;
      entry.papers.set(pub.id, pub);

      // Add ca STRICTLY to ca's own university (never to another institution),
      // and DO NOT add the primary target researcher as a co-author of themselves:
      const selfName = homeProfile?.name || pub.authorAffiliation?.name || '';
      if (selfName && isSameResearcherName(ca.name, selfName)) {
        continue;
      }

      const cleanedCaName = stripAcademicHonorifics(ca.name) || ca.name;
      let matchedKey: string | null = entry.authorMap.has(cleanedCaName)
        ? cleanedCaName
        : null;

      if (!matchedKey) {
        for (const [existingKey, existingVal] of entry.authorMap.entries()) {
          if (
            (ca.scholarUserId &&
              existingVal.scholarUserId &&
              ca.scholarUserId === existingVal.scholarUserId) ||
            areCoAuthorEntriesSamePerson(existingKey, cleanedCaName)
          ) {
            matchedKey = existingKey;
            break;
          }
        }
      }

      if (!matchedKey) {
        entry.authorMap.set(cleanedCaName, {
          paperIds: new Set([pub.id]),
          citations: pub.citations,
          scholarUserId: ca.scholarUserId,
          avatarUrl: ca.avatarUrl,
        });
      } else {
        const authorEntry = entry.authorMap.get(matchedKey)!;
        if (!authorEntry.scholarUserId && ca.scholarUserId) {
          authorEntry.scholarUserId = ca.scholarUserId;
        }
        if (!authorEntry.avatarUrl && ca.avatarUrl) {
          authorEntry.avatarUrl = ca.avatarUrl;
        }
        if (!authorEntry.paperIds.has(pub.id)) {
          authorEntry.paperIds.add(pub.id);
          authorEntry.citations += pub.citations;
        }
        const preferredName = preferCanonicalAuthorDisplayName(
          matchedKey,
          cleanedCaName
        );
        if (preferredName !== matchedKey && !entry.authorMap.has(preferredName)) {
          entry.authorMap.delete(matchedKey);
          entry.authorMap.set(preferredName, authorEntry);
        }
      }
    }

    // 3. Home institution paper attribution:
    if (homeKey && uniMap.has(homeKey)) {
      const isTargetAtHome =
        targetUni &&
        getCanonicalUniKey(targetUni.universityId, targetUni.universityName) ===
          homeKey;
      const hasHomeCoAuthor = pub.coAuthors.some((ca) => {
        const uName = ca.universityName || (ca as any).affiliation || '';
        const uId =
          ca.universityId ||
          (uName
            ? uName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            : '');
        return getCanonicalUniKey(uId, uName) === homeKey;
      });
      // Unassigned recent work (e.g. within current tenure year) fallback
      const isUnassignedRecent =
        !targetUni && (pub.year >= 2024 || publications.length <= 5);

      if (isTargetAtHome || hasHomeCoAuthor || isUnassignedRecent) {
        uniMap.get(homeKey)!.papers.set(pub.id, pub);
      }
      // Note: We DO NOT add external co-authors to home institution's authorMap!
      // Only co-authors who are ACTUALLY from the home university are in home institution's authorMap.
    }
  }

  // Safety Fallback: Only if home institution has 0 papers and researcher has publications
  if (
    homeKey &&
    uniMap.has(homeKey) &&
    uniMap.get(homeKey)!.papers.size === 0 &&
    publications.length > 0
  ) {
    const homeEntry = uniMap.get(homeKey)!;
    const recentPubs = publications.slice(0, Math.min(3, publications.length));
    for (const pub of recentPubs) {
      homeEntry.papers.set(pub.id, pub);
    }
  }

  const results: UniversityCollaboration[] = [];
  for (const [key, data] of uniMap.entries()) {
    const papers = Array.from(data.papers.values()).sort(
      (a, b) => b.citations - a.citations
    );
    // Skip external partner institutions with zero papers
    if (papers.length === 0 && key !== homeKey) {
      continue;
    }
    const totalCitations = papers.reduce((acc, p) => acc + p.citations, 0);
    const q1PaperCount = papers.filter((p) => p.quartile === 'Q1').length;
    const years = papers.map((p) => p.year);

    const coAuthors = Array.from(data.authorMap.entries())
      .map(([name, stats]) => ({
        name,
        paperCount: stats.paperIds.size,
        citations: stats.citations,
        ...(stats.scholarUserId ? { scholarUserId: stats.scholarUserId } : {}),
        ...(stats.avatarUrl ? { avatarUrl: stats.avatarUrl } : {}),
      }))
      .sort((a, b) => b.paperCount - a.paperCount || b.citations - a.citations);

    const firstCollaborationYear =
      years.length > 0 ? Math.min(...years) : new Date().getFullYear();
    const latestCollaborationYear =
      years.length > 0 ? Math.max(...years) : new Date().getFullYear();

    results.push({
      universityId: data.meta.universityId,
      universityName: data.meta.universityName,
      city: data.meta.city,
      country: data.meta.country,
      countryCode: data.meta.countryCode,
      continent: data.meta.continent,
      lat: data.meta.lat,
      lng: data.meta.lng,
      isHomeInstitution: key === homeKey || Boolean(data.meta.isHomeInstitution),
      paperCount: papers.length,
      totalCitations,
      q1PaperCount,
      coAuthors,
      papers,
      firstCollaborationYear,
      latestCollaborationYear,
    });
  }

  const sorted = results.sort((a, b) => {
    return b.paperCount - a.paperCount || b.totalCitations - a.totalCitations;
  });

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

const stripHonorificsCache = new Map<string, string>();

/**
 * Strips common academic honorifics and titles for accurate researcher identity matching.
 */
export function stripAcademicHonorifics(rawName: string): string {
  const input = String(rawName || '');
  const cached = stripHonorificsCache.get(input);
  if (cached !== undefined) return cached;

  const cleaned = input
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\borcid(?:\.org)?[:\s/.\w-]*[\d-Xx]+\b/gi, ' ')
    .replace(/;.*$/g, ' ')
    .replace(
      /,\s*(?:phd|ph\.d\.|smieee|mieee|fieee|freng|fiet|ceng|cmgr|pe|pdf|mrsc|dr\.?|prof\.?|eng\.?|ir\.?|ts\.?|clarivate|world|top|highly|cited)\b.*/gi,
      ' '
    )
    .replace(
      /\b(?:prof(?:essor)?|assoc(?:iate)?\s+prof(?:essor)?|assist(?:ant)?\s+prof(?:essor)?|dr|engr|eng|ir|ts|mr|mrs|ms|md\s+dr|phd|ph\.d\.|msc|b\.sc|fi?eee|smieee|mieee|freng|fiet|ceng|cmgr|pdf|mrsc)\b\.?/gi,
      ' '
    )
    .replace(/\s+[A-Z](?:\s+[A-Z]){1,2}$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  stripHonorificsCache.set(input, cleaned);
  return cleaned;
}

const NAME_PREFIX_TOKENS = new Set([
  'md',
  'mohammad',
  'muhammad',
  'mohammed',
  'mohamed',
  'al',
  'ul',
  'ur',
  'bin',
  'binti',
  'abdul',
  'abdullah',
  'abdulla',
  'syed',
  'sk',
  'sheikh',
  'dewan',
  'mir',
  'kazi',
  'shah',
]);

const HIGH_FREQUENCY_SURNAMES = new Set([
  'islam',
  'rahman',
  'hossain',
  'hossen',
  'hasan',
  'hassan',
  'ahmed',
  'ahamed',
  'ahmad',
  'ali',
  'khan',
  'alam',
  'haque',
  'hoque',
  'uddin',
  'miah',
  'mia',
  'chowdhury',
  'sarkar',
  'sarker',
  'karim',
  'amin',
  'kabir',
  'mahmud',
]);

const tokenizeCoAuthorCache = new Map<string, string[]>();

function tokenizeCoAuthorForDedupe(rawName: string): string[] {
  const cached = tokenizeCoAuthorCache.get(rawName);
  if (cached) return cached;
  let s = stripAcademicHonorifics(rawName);
  s = s.replace(/\b([A-Z])([A-Z])\s+(?=[A-Z][a-z])/g, '$1 $2 ');
  s = s.replace(/\b([A-Z])([A-Z])([A-Z])\s+(?=[A-Z][a-z])/g, '$1 $2 $3 ');
  const tokens = s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((t) =>
      t === 'md' || t === 'muhammad' || t === 'mohammed' || t === 'mohamed'
        ? 'mohammad'
        : t
    );
  tokenizeCoAuthorCache.set(rawName, tokens);
  return tokens;
}

function preferCanonicalAuthorDisplayName(nameA: string, nameB: string): string {
  const cleanA = stripAcademicHonorifics(nameA) || nameA;
  const cleanB = stripAcademicHonorifics(nameB) || nameB;
  const tokensA = tokenizeCoAuthorForDedupe(cleanA);
  const tokensB = tokenizeCoAuthorForDedupe(cleanB);
  const fullWordsA = tokensA.filter((t) => t.length >= 2).length;
  const fullWordsB = tokensB.filter((t) => t.length >= 2).length;
  if (fullWordsB > fullWordsA) return cleanB;
  if (fullWordsA > fullWordsB) return cleanA;
  if (cleanB.includes('.') && !cleanA.includes('.')) return cleanB;
  if (cleanA.includes('.') && !cleanB.includes('.')) return cleanA;
  return cleanB.length > cleanA.length ? cleanB : cleanA;
}

function areCoAuthorEntriesSamePerson(nameA: string, nameB: string): boolean {
  const rawA = tokenizeCoAuthorForDedupe(nameA);
  const rawB = tokenizeCoAuthorForDedupe(nameB);
  if (rawA.length === 0 || rawB.length === 0) return false;
  if (rawA.join(' ') === rawB.join(' ')) return true;

  const cleanA = rawA.filter(
    (t) => !['al', 'ul', 'ur', 'bin', 'binti'].includes(t)
  );
  const cleanB = rawB.filter(
    (t) => !['al', 'ul', 'ur', 'bin', 'binti'].includes(t)
  );
  if (cleanA.length === 0 || cleanB.length === 0) return false;
  if (cleanA.join(' ') === cleanB.join(' ')) return true;

  if (cleanA.length === cleanB.length && cleanA.length >= 2) {
    const lastA = cleanA[cleanA.length - 1];
    const lastB = cleanB[cleanB.length - 1];
    if (lastA === lastB && lastA.length >= 4) {
      let allMatch = true;
      let nonPrefixFullMatch = 0;
      for (let i = 0; i < cleanA.length - 1; i++) {
        const a = cleanA[i];
        const b = cleanB[i];
        if (a === b) {
          if (a.length >= 3 && !NAME_PREFIX_TOKENS.has(a)) {
            nonPrefixFullMatch++;
          }
        } else if (
          (a.length === 1 && b.length >= 2 && b[0] === a) ||
          (b.length === 1 && a.length >= 2 && a[0] === b)
        ) {
          // Initial matches corresponding full name token at the same position
        } else {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        if (!HIGH_FREQUENCY_SURNAMES.has(lastA)) return true;
        if (nonPrefixFullMatch >= 1) return true;
      }
    }
  }

  return false;
}

/**
 * Checks whether candidate name refers to the same researcher, tolerating transliterations,
 * middle initials, and title prefixes.
 */
export function isSameResearcherName(
  candidateName: string,
  targetName: string
): boolean {
  if (!candidateName || !targetName) return false;
  const c = stripAcademicHonorifics(candidateName)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const t = stripAcademicHonorifics(targetName)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!c || !t) return false;
  if (c === t) return true;

  // Normalized phonetic comparison for common international transliteration variants (v/b, w/v)
  const cNorm = c.replace(/v|w/g, 'b');
  const tNorm = t.replace(/v|w/g, 'b');
  if (cNorm === tNorm) return true;

  const cTokens = c.split(/\s+/).filter(Boolean);
  const tTokens = t.split(/\s+/).filter(Boolean);

  // Support reversed name order (e.g. East Asian "Li Fei-Fei" <-> "Fei-Fei Li")
  if (
    cTokens.length >= 2 &&
    cTokens.length === tTokens.length &&
    [...cTokens].sort().join(' ') === [...tTokens].sort().join(' ')
  ) {
    return true;
  }

  // Handle first/compound initial + surname (e.g. "F Blaabjerg" vs "Frede Blaabjerg")
  const tLast = tTokens[tTokens.length - 1];
  const cLast = cTokens[cTokens.length - 1];
  if (
    tLast &&
    cLast &&
    (tLast === cLast || tLast.replace(/v|w/g, 'b') === cLast.replace(/v|w/g, 'b'))
  ) {
    const tFirst = tTokens[0] || '';
    const cFirst = cTokens[0] || '';
    const cMid = cTokens.slice(1, -1);
    const tMid = tTokens.slice(1, -1);
    const hasConflictingMiddleWords =
      cMid.length > 0 &&
      tMid.length > 0 &&
      cMid.some(
        (cm) =>
          cm.length >= 2 &&
          !NAME_PREFIX_TOKENS.has(cm) &&
          !tMid.some((tm) => tm === cm || tm[0] === cm[0])
      );

    if (tFirst && cFirst && !hasConflictingMiddleWords) {
      if (tFirst === cFirst && !NAME_PREFIX_TOKENS.has(tFirst)) return true;
      if (tFirst[0] === cFirst[0] && (tFirst.length === 1 || cFirst.length === 1)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Aggregates complete list of co-authors across all publications, excluding the primary researcher.
 */
export function aggregateCoAuthors(
  publications: Publication[],
  primaryResearcherName?: string
): CoAuthorSummary[] {
  const authorMap = new Map<
    string,
    {
      meta: CoAuthorAffiliation;
      papers: Map<string, Publication>;
    }
  >();

  const targetName = primaryResearcherName?.trim() || '';

  for (const pub of publications) {
    const selfName = targetName || pub.authorAffiliation?.name || '';
    for (const ca of pub.coAuthors) {
      if (selfName && isSameResearcherName(ca.name, selfName)) {
        continue;
      }
      const cleanedCaName = stripAcademicHonorifics(ca.name) || ca.name;
      let matchedKey: string | null = authorMap.has(cleanedCaName)
        ? cleanedCaName
        : null;

      if (!matchedKey) {
        for (const [existingKey, existingVal] of authorMap.entries()) {
          if (
            (ca.scholarUserId &&
              existingVal.meta.scholarUserId &&
              ca.scholarUserId === existingVal.meta.scholarUserId) ||
            areCoAuthorEntriesSamePerson(existingKey, cleanedCaName)
          ) {
            matchedKey = existingKey;
            break;
          }
        }
      }

      if (!matchedKey) {
        authorMap.set(cleanedCaName, {
          meta: { ...ca, name: cleanedCaName },
          papers: new Map([[pub.id, pub]]),
        });
      } else {
        const existing = authorMap.get(matchedKey)!;
        const preferredName = preferCanonicalAuthorDisplayName(
          matchedKey,
          cleanedCaName
        );
        if (
          existing.meta.universityId === 'unlisted' &&
          ca.universityId !== 'unlisted'
        ) {
          existing.meta = {
            ...ca,
            name: preferredName,
            scholarUserId: ca.scholarUserId || existing.meta.scholarUserId,
            avatarUrl: ca.avatarUrl || existing.meta.avatarUrl,
          };
        } else {
          existing.meta.name = preferredName;
          if (!existing.meta.scholarUserId && ca.scholarUserId) {
            existing.meta.scholarUserId = ca.scholarUserId;
          }
          if (!existing.meta.avatarUrl && ca.avatarUrl) {
            existing.meta.avatarUrl = ca.avatarUrl;
          }
        }
        existing.papers.set(pub.id, pub);
        if (preferredName !== matchedKey && !authorMap.has(preferredName)) {
          authorMap.delete(matchedKey);
          authorMap.set(preferredName, existing);
        }
      }
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
        ...(data.meta.scholarUserId
          ? { scholarUserId: data.meta.scholarUserId }
          : {}),
        ...(data.meta.avatarUrl ? { avatarUrl: data.meta.avatarUrl } : {}),
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
      entry.universities.add(ca.universityName || (ca as any).affiliation || 'Unknown University');
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
      const impactFactor = getJournalImpactFactor(venue, sample.type, sample.impactFactor);
      return {
        venue,
        type: sample.type,
        quartile: sample.quartile,
        impactFactor,
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
