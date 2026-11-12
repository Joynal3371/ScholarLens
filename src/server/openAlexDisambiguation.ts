const AFFIL_STOPWORDS = new Set([
  'dept',
  'department',
  'student',
  'professor',
  'prof',
  'researcher',
  'fellow',
  'post',
  'graduate',
  'undergraduate',
  'associate',
  'assistant',
  'emeritus',
  'chairman',
  'chair',
  'dr',
  'faculty',
  'univ',
  'university',
  'institute',
  'college',
  'school',
  'technology',
  'science',
  'engineering',
  'computer',
  'and',
  'the',
  'for',
  'of',
]);

export function normalizeAsciiWords(input: string): string {
  return String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractAffiliationKeywords(text: string): string[] {
  return Array.from(
    new Set(
      normalizeAsciiWords(text)
        .split(/\s+/)
        .filter((t) => t.length >= 3 && !AFFIL_STOPWORDS.has(t))
    )
  );
}

export function stripAuthorHonorificsBasic(name: string): string {
  return String(name || '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/,\s*(?:phd|ph\.d\.|dr\.?|prof\.?)\b.*/gi, ' ')
    .replace(/\b(?:prof(?:essor)?|dr|engr|eng)\b\.?/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ScoredOaCandidate {
  author: any;
  id: string;
  score: number;
  affilMatches: number;
  countryMatches: number;
  worksCount: number;
}

export function scoreOpenAlexAuthorCandidate(
  author: any,
  cleanSearchName: string,
  affilTokens: string[],
  homeCountryCode: string | undefined,
  isSameName: (a: string, b: string) => boolean
): ScoredOaCandidate | null {
  const disp = String(author?.display_name || '');
  if (!disp || !isSameName(disp, cleanSearchName)) return null;

  const normSearchExact = normalizeAsciiWords(
    stripAuthorHonorificsBasic(cleanSearchName)
  ).replace(/[0-9]/g, '').replace(/\s+/g, ' ').trim();
  const normSearchNoMid = normSearchExact
    .split(' ')
    .filter((w, i, arr) => i === 0 || i === arr.length - 1 || w.length > 1)
    .join(' ');

  const normDispExact = normalizeAsciiWords(stripAuthorHonorificsBasic(disp))
    .replace(/[0-9]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const normDispNoMid = normDispExact
    .split(' ')
    .filter((w, i, arr) => i === 0 || i === arr.length - 1 || w.length > 1)
    .join(' ');

  let score = 0;
  if (normDispExact === normSearchExact) {
    score += 25;
  } else if (normDispNoMid === normSearchNoMid) {
    score += 24;
  }

  const candidateInstitutions: Array<{ name: string; countryCode: string }> = [];
  if (Array.isArray(author.last_known_institutions)) {
    for (const inst of author.last_known_institutions) {
      if (inst?.display_name || inst?.country_code) {
        candidateInstitutions.push({
          name: normalizeAsciiWords(String(inst.display_name || '')),
          countryCode: String(inst.country_code || '').toUpperCase(),
        });
      }
    }
  }
  if (Array.isArray(author.affiliations)) {
    for (const aff of author.affiliations) {
      if (aff?.institution?.display_name || aff?.institution?.country_code) {
        candidateInstitutions.push({
          name: normalizeAsciiWords(String(aff.institution.display_name || '')),
          countryCode: String(aff.institution.country_code || '').toUpperCase(),
        });
      }
    }
  }

  let affilMatches = 0;
  for (const token of affilTokens) {
    if (candidateInstitutions.some((ci) => ci.name.includes(token))) {
      affilMatches++;
      score += 30;
    }
  }

  let countryMatches = 0;
  const upperHomeCountry = String(homeCountryCode || '').trim().toUpperCase();
  if (
    upperHomeCountry &&
    candidateInstitutions.some((ci) => ci.countryCode === upperHomeCountry)
  ) {
    countryMatches = 1;
    score += 15;
  }

  const worksCount = Number(author.works_count || 0);
  score += Math.min(25, Math.log10(worksCount + 1) * 8);

  const id = String(author.id || '').replace('https://openalex.org/', '').trim();
  if (!id) return null;

  return {
    author,
    id,
    score,
    affilMatches,
    countryMatches,
    worksCount,
  };
}

export function pickDisambiguationTitles(
  publications: Array<{ title: string; year?: number; citations?: number }>,
  limit: number = 4
): string[] {
  const chosen: string[] = [];
  const seen = new Set<string>();

  const tryAdd = (pub?: { title: string }) => {
    const t = String(pub?.title || '').trim();
    const key = t.toLowerCase();
    if (!t || t.length < 10 || seen.has(key)) return false;
    seen.add(key);
    chosen.push(t);
    return true;
  };

  // Prefer recent substantial papers + top-cited items so an odd/misattributed first row doesn't stall lookup
  for (const pub of publications.slice(0, 3)) {
    if (chosen.length >= limit) break;
    tryAdd(pub);
  }
  const recentPub = publications.find((p) => (p.year || 0) >= 2018 && p.title.length >= 20);
  if (recentPub && chosen.length < limit) {
    tryAdd(recentPub);
  }
  for (const pub of publications) {
    if (chosen.length >= limit) break;
    tryAdd(pub);
  }

  return chosen;
}

export interface RankedWorkAuthorMatch {
  id: string;
  score: number;
  affilHits: number;
  countryHits: number;
  titleHits: number;
}

export function rankOpenAlexAuthorsFromWorks(
  worksByTitle: Array<{ title: string; works: any[] }>,
  cleanSearchName: string,
  affilTokens: string[],
  homeCountryCode: string | undefined,
  isSameName: (a: string, b: string) => boolean,
  matchWorkFn: (title: string, works: any[]) => any | null
): RankedWorkAuthorMatch[] {
  const upperHomeCountry = String(homeCountryCode || '').trim().toUpperCase();
  const candidates = new Map<
    string,
    {
      id: string;
      affilHits: number;
      countryHits: number;
      titleHits: number;
      seenTitles: Set<string>;
    }
  >();

  for (const entry of worksByTitle) {
    const titleKey = entry.title.toLowerCase();
    for (const w of entry.works) {
      if (!matchWorkFn(entry.title, [w])) continue;
      for (const au of w.authorships || []) {
        const auName = String(au.author?.display_name || '');
        const auId = String(au.author?.id || '')
          .replace('https://openalex.org/', '')
          .trim();
        if (!auId || !auName || !isSameName(auName, cleanSearchName)) continue;

        let stats = candidates.get(auId);
        if (!stats) {
          stats = {
            id: auId,
            affilHits: 0,
            countryHits: 0,
            titleHits: 0,
            seenTitles: new Set(),
          };
          candidates.set(auId, stats);
        }

        if (!stats.seenTitles.has(titleKey)) {
          stats.seenTitles.add(titleKey);
          stats.titleHits++;
        }

        const insts: any[] = Array.isArray(au.institutions) ? au.institutions : [];
        let workAffilMatched = false;
        let workCountryMatched = false;
        for (const inst of insts) {
          const iName = normalizeAsciiWords(String(inst?.display_name || ''));
          const iCode = String(inst?.country_code || '').trim().toUpperCase();
          if (affilTokens.some((tok) => iName.includes(tok))) {
            workAffilMatched = true;
          }
          if (upperHomeCountry && iCode === upperHomeCountry) {
            workCountryMatched = true;
          }
        }
        if (workAffilMatched) stats.affilHits++;
        if (workCountryMatched) stats.countryHits++;
      }
    }
  }

  return Array.from(candidates.values())
    .map((c) => ({
      id: c.id,
      affilHits: c.affilHits,
      countryHits: c.countryHits,
      titleHits: c.titleHits,
      score: c.affilHits * 60 + c.countryHits * 25 + c.titleHits * 15,
    }))
    .sort((a, b) => b.score - a.score || b.titleHits - a.titleHits);
}

const SKIPPED_PROFILE_HOSTS = [
  'scholar.google',
  'linkedin.com',
  'researchgate.net',
  'scopus.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'github.com',
  'youtube.com',
  'orcid.org',
  'publons.com',
  'webofscience.com',
  'semanticscholar.org',
  'dblp.org',
  'ieee.org',
  'acm.org',
  'springer.com',
  'elsevier.com',
  'wikipedia.org',
];

const PREFERRED_PROFILE_PATTERNS = [
  /orbit\./i,
  /pure\./i,
  /profiles?\./i,
  /people\./i,
  /faculty/i,
  /staff/i,
  /person/i,
  /\.edu(?:\/|$|\.)/i,
  /\.ac\.[a-z]{2}(?:\/|$)/i,
  /\.dk(?:\/|$)/i,
  /\.se(?:\/|$)/i,
  /\.de(?:\/|$)/i,
  /\.uk(?:\/|$)/i,
];

export function pickInstitutionalProfileUrls(researcherUrls: any[]): string[] {
  const scored: Array<{ url: string; priority: number }> = [];
  const seen = new Set<string>();

  for (const item of researcherUrls || []) {
    const raw = String(item?.url?.value || item?.url || '').trim();
    if (!raw || !/^https?:\/\//i.test(raw)) continue;
    const lower = raw.toLowerCase();
    if (SKIPPED_PROFILE_HOSTS.some((h) => lower.includes(h))) continue;
    if (seen.has(raw)) continue;
    seen.add(raw);

    let priority = 1;
    if (/\/persons?\//i.test(lower) || /pure|orbit/i.test(lower)) priority += 4;
    if (PREFERRED_PROFILE_PATTERNS.some((re) => re.test(lower))) priority += 2;
    if (raw.startsWith('https://')) priority += 1;
    scored.push({ url: raw, priority });
  }

  return scored.sort((a, b) => b.priority - a.priority).map((s) => s.url);
}

const REJECTED_IMAGE_PATTERNS =
  /(?:logo|icon|favicon|placeholder|default|avatar_scholar|cleardot|blank|spinner|orcid|banner|badge|wordmark|seal|header|footer|share|\.svg(?:$|\?))/i;

export function extractPortraitUrlFromHtml(
  html: string,
  pageUrl: string
): string | null {
  if (!html) return null;
  const candidateAttrRegexes = [
    /<meta[^>]*property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]*name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
    /<img[^>]*class=["'][^"']*(?:portrait|avatar|headshot|profile-?photo|person-?image)[^"']*["'][^>]*src=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']*\/files-asset\/[^"']+)["']/i,
  ];

  for (const re of candidateAttrRegexes) {
    const match = html.match(re);
    const rawCandidate = match?.[1]?.trim();
    if (!rawCandidate || rawCandidate.startsWith('data:')) continue;
    if (REJECTED_IMAGE_PATTERNS.test(rawCandidate)) continue;

    try {
      const resolved = new URL(rawCandidate, pageUrl).toString();
      if (/^https?:\/\//i.test(resolved) && !REJECTED_IMAGE_PATTERNS.test(resolved)) {
        return resolved;
      }
    } catch {
      // Ignore malformed relative URL
    }
  }

  return null;
}

export function buildYahooScholarSearchQueries(
  name: string,
  university?: string
): string[] {
  const cleanName = stripAuthorHonorificsBasic(name);
  if (!cleanName) return [];
  const cleanUni = String(university || '').trim();
  const isGenericUni =
    !cleanUni ||
    /^(?:independent\s*\/\s*unlisted|unlisted|unknown(?:\s+university)?)$/i.test(
      cleanUni
    );

  const queries: string[] = [];
  if (!isGenericUni) {
    const shortUni = cleanUni.split(',')[0].trim();
    queries.push(`"${cleanName}" "${shortUni}" scholar.google.com/citations`);
  }
  queries.push(`${cleanName} scholar.google.com/citations`);
  return queries;
}

export function extractSameInstitutionAuthorIds(
  instAuthors: any[],
  cleanSearchName: string,
  isSameName: (a: string, b: string) => boolean,
  maxIds: number = 8
): string[] {
  const ids: string[] = [];
  const sorted = [...(instAuthors || [])].sort(
    (a, b) => Number(b?.works_count || 0) - Number(a?.works_count || 0)
  );
  for (const cand of sorted) {
    const cName = String(cand?.display_name || '').trim();
    const cId = String(cand?.id || '')
      .replace('https://openalex.org/', '')
      .trim();
    if (!cId || !cName || !isSameName(cName, cleanSearchName)) continue;
    if (!ids.includes(cId)) {
      ids.push(cId);
      if (ids.length >= maxIds) break;
    }
  }
  return ids;
}
