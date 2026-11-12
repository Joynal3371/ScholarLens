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
  'institution',
  'academic',
  'college',
  'school',
  'international',
  'unlisted',
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
  const cleaned = normalizeAsciiWords(text)
    .replace(
      /\bindependent\s+(?:researcher|scholar|scientist|author|consultant|unlisted)\b/g,
      ' '
    )
    .replace(/^independent(?:\s+unlisted)?$/g, ' ');
  return Array.from(
    new Set(
      cleaned
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

const MUHAMMAD_PREFIX_VARIANTS = new Set([
  'md',
  'mohd',
  'mohammed',
  'muhammad',
  'mohammad',
  'muhammed',
  'mohamad',
]);

function areGivenNameTokensCompatible(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.replace(/v|w/g, 'b') === b.replace(/v|w/g, 'b')) return true;
  if (MUHAMMAD_PREFIX_VARIANTS.has(a) && MUHAMMAD_PREFIX_VARIANTS.has(b)) {
    return true;
  }
  if (a.length === 1 || b.length === 1) {
    return a[0] === b[0];
  }
  return false;
}

function isOrderedGivenSubsequence(shortTokens: string[], longTokens: string[]): boolean {
  if (shortTokens.length === 0 || longTokens.length < shortTokens.length) {
    return false;
  }
  let j = 0;
  let firstMatchIndex = -1;
  let matchedNonPrefix = false;
  for (let i = 0; i < shortTokens.length; i++) {
    const tok = shortTokens[i];
    let found = false;
    while (j < longTokens.length) {
      if (areGivenNameTokensCompatible(tok, longTokens[j])) {
        if (firstMatchIndex === -1) firstMatchIndex = j;
        if (!MUHAMMAD_PREFIX_VARIANTS.has(tok) || !MUHAMMAD_PREFIX_VARIANTS.has(longTokens[j])) {
          matchedNonPrefix = true;
        }
        j++;
        found = true;
        break;
      }
      j++;
    }
    if (!found) return false;
  }
  // Do not match a lone middle initial (e.g. "Y. Ng" vs "Andrew Y. Ng")
  if (firstMatchIndex > 0 && shortTokens[0].length === 1 && shortTokens.length === 1) {
    return false;
  }
  // Do not let "Md. Islam" match "Md. Ashraful Islam" solely via "Md." prefix
  const longHasExtraDistinguishingToken =
    longTokens.length > shortTokens.length &&
    longTokens.some((t) => t.length >= 2 && !MUHAMMAD_PREFIX_VARIANTS.has(t));
  if (!matchedNonPrefix && longHasExtraDistinguishingToken) {
    return false;
  }
  return true;
}

export function isSameResearcherNameMatch(
  candidateName: string,
  targetName: string
): boolean {
  const c = String(candidateName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const t = String(targetName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!c || !t) return false;
  if (c === t) return true;

  const cNorm = c.replace(/v|w/g, 'b');
  const tNorm = t.replace(/v|w/g, 'b');
  if (cNorm === tNorm) return true;

  const cTokens = c.split(/\s+/).filter(Boolean);
  const tTokens = t.split(/\s+/).filter(Boolean);
  if (cTokens.length < 2 || tTokens.length < 2) {
    return false;
  }

  // Reversed East Asian name order ("Li Fei-Fei" <-> "Fei-Fei Li")
  if (
    cTokens.length === tTokens.length &&
    [...cTokens].sort().join(' ') === [...tTokens].sort().join(' ')
  ) {
    return true;
  }

  const cLast = cTokens[cTokens.length - 1];
  const tLast = tTokens[tTokens.length - 1];
  if (
    cLast !== tLast &&
    cLast.replace(/v|w/g, 'b') !== tLast.replace(/v|w/g, 'b')
  ) {
    // Allow hyphenated compound surnames (e.g. "Caroline Barrère‐Mangote" <-> "Caroline Barrere")
    const getHyphenSurnameParts = (raw: string): string[] | null => {
      const lastRaw = String(raw || '').trim().split(/\s+/).pop() || '';
      if (!/[-‐‑‒–—]/.test(lastRaw)) return null;
      const parts = lastRaw
        .split(/[-‐‑‒–—]+/)
        .map((p) =>
          p
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z]/g, '')
        )
        .filter((p) => p.length >= 2);
      return parts.length >= 2 ? parts : null;
    };
    const cHyphenParts = getHyphenSurnameParts(candidateName);
    const tHyphenParts = getHyphenSurnameParts(targetName);
    const hyphenLastMatches =
      (cHyphenParts &&
        cHyphenParts.includes(tLast) &&
        cTokens.length >= 3 &&
        cTokens.slice(0, -cHyphenParts.length).join(' ') === tTokens.slice(0, -1).join(' ')) ||
      (tHyphenParts &&
        tHyphenParts.includes(cLast) &&
        tTokens.length >= 3 &&
        tTokens.slice(0, -tHyphenParts.length).join(' ') === cTokens.slice(0, -1).join(' '));
    if (hyphenLastMatches) {
      return true;
    }
    return false;
  }

  const cGiven = cTokens.slice(0, -1);
  const tGiven = tTokens.slice(0, -1);

  if (cGiven.join('') === tGiven.join('')) return true;

  // Compacted multi-initial form (e.g. "MSH Lipu" <-> "Molla Shahadat Hossain Lipu")
  if (
    cGiven.length === 1 &&
    cGiven[0].length >= 2 &&
    cGiven[0].length === tGiven.length &&
    tGiven.every((tok, idx) => tok[0] === cGiven[0][idx])
  ) {
    return true;
  }
  if (
    tGiven.length === 1 &&
    tGiven[0].length >= 2 &&
    tGiven[0].length === cGiven.length &&
    cGiven.every((tok, idx) => tok[0] === tGiven[0][idx])
  ) {
    return true;
  }

  const stripLeadingPrefix = (tokens: string[]): string[] =>
    tokens.length >= 2 && MUHAMMAD_PREFIX_VARIANTS.has(tokens[0])
      ? tokens.slice(1)
      : tokens;

  const collapseSingleLetterRuns = (tokens: string[]): string[] => {
    const out: string[] = [];
    let i = 0;
    while (i < tokens.length) {
      if (tokens[i].length === 1) {
        let j = i;
        while (j < tokens.length && tokens[j].length === 1) j++;
        if (j - i >= 2) {
          out.push(tokens.slice(i, j).join(''));
        } else {
          out.push(tokens[i]);
        }
        i = j;
      } else {
        out.push(tokens[i]);
        i++;
      }
    }
    return out;
  };

  const buildVariants = (tokens: string[]): string[][] => {
    const variants: string[][] = [tokens];
    const stripped = stripLeadingPrefix(tokens);
    if (stripped !== tokens) variants.push(stripped);
    const collapsed = collapseSingleLetterRuns(tokens);
    if (collapsed.length !== tokens.length) variants.push(collapsed);
    return variants;
  };

  const cVariants = buildVariants(cGiven);
  const tVariants = buildVariants(tGiven);

  for (const cv of cVariants) {
    for (const tv of tVariants) {
      const [shortTokens, longTokens] =
        cv.length <= tv.length ? [cv, tv] : [tv, cv];
      if (isOrderedGivenSubsequence(shortTokens, longTokens)) {
        return true;
      }
    }
  }

  return false;
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

  const joinCompactInitials = (s: string) =>
    s.replace(/\b(?:[a-z]\s+)+[a-z]\b/g, (m) => m.replace(/\s+/g, ''));

  const normDispCompact = joinCompactInitials(normDispExact);
  const normSearchCompact = joinCompactInitials(normSearchExact);

  const normDispSorted = normDispNoMid
    .split(' ')
    .filter(Boolean)
    .sort()
    .join(' ');
  const normSearchSorted = normSearchNoMid
    .split(' ')
    .filter(Boolean)
    .sort()
    .join(' ');

  let score = 0;
  if (normDispExact === normSearchExact) {
    score += 25;
  } else if (normDispCompact === normSearchCompact || normDispNoMid === normSearchNoMid) {
    score += 24;
  } else if (normDispSorted && normDispSorted === normSearchSorted) {
    score += 23;
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

export function normalizeOrcidUrl(raw?: string | null): string {
  return String(raw || '')
    .trim()
    .replace(/^https?:\/\/orcid\.org\//i, '')
    .toUpperCase();
}

export function areOrcidsConflicting(
  orcidA?: string | null,
  orcidB?: string | null
): boolean {
  const cleanA = normalizeOrcidUrl(orcidA);
  const cleanB = normalizeOrcidUrl(orcidB);
  return Boolean(cleanA && cleanB && cleanA !== cleanB);
}

export interface RankedWorkAuthorMatch {
  id: string;
  orcid?: string;
  score: number;
  affilHits: number;
  countryHits: number;
  titleHits: number;
  collaboratorHits: number;
}

export function rankOpenAlexAuthorsFromWorks(
  worksByTitle: Array<{ title: string; works: any[] }>,
  cleanSearchName: string,
  affilTokens: string[],
  homeCountryCode: string | undefined,
  isSameName: (a: string, b: string) => boolean,
  matchWorkFn: (title: string, works: any[]) => any | null,
  collaboratorNames: string[] = []
): RankedWorkAuthorMatch[] {
  const upperHomeCountry = String(homeCountryCode || '').trim().toUpperCase();
  const cleanCollaborators = collaboratorNames
    .map((n) => stripAuthorHonorificsBasic(n).trim())
    .filter(Boolean);
  const candidates = new Map<
    string,
    {
      id: string;
      orcid?: string;
      affilHits: number;
      countryHits: number;
      titleHits: number;
      collaboratorHits: number;
      seenTitles: Set<string>;
    }
  >();

  for (const entry of worksByTitle) {
    const titleKey = entry.title.toLowerCase();
    for (const w of entry.works) {
      if (!matchWorkFn(entry.title, [w])) continue;
      const authorships: any[] = Array.isArray(w.authorships) ? w.authorships : [];
      const workCollabCount =
        cleanCollaborators.length > 0
          ? authorships.filter((otherAu) => {
              const otherName = String(otherAu.author?.display_name || '').trim();
              return (
                otherName &&
                cleanCollaborators.some((colName) => isSameName(otherName, colName))
              );
            }).length
          : 0;

      for (const au of authorships) {
        const auName = String(au.author?.display_name || '');
        const auId = String(au.author?.id || '')
          .replace('https://openalex.org/', '')
          .trim();
        if (!auId || !auName || !isSameName(auName, cleanSearchName)) continue;

        let stats = candidates.get(auId);
        if (!stats) {
          stats = {
            id: auId,
            orcid: normalizeOrcidUrl(au.author?.orcid) || undefined,
            affilHits: 0,
            countryHits: 0,
            titleHits: 0,
            collaboratorHits: 0,
            seenTitles: new Set(),
          };
          candidates.set(auId, stats);
        } else if (!stats.orcid) {
          const normO = normalizeOrcidUrl(au.author?.orcid);
          if (normO) stats.orcid = normO;
        }

        if (!stats.seenTitles.has(titleKey)) {
          stats.seenTitles.add(titleKey);
          stats.titleHits++;
          stats.collaboratorHits += workCollabCount;
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
      ...(c.orcid ? { orcid: c.orcid } : {}),
      affilHits: c.affilHits,
      countryHits: c.countryHits,
      titleHits: c.titleHits,
      collaboratorHits: c.collaboratorHits,
      score:
        c.affilHits * 60 +
        c.collaboratorHits * 45 +
        c.countryHits * 25 +
        c.titleHits * 15,
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.collaboratorHits - a.collaboratorHits ||
        b.affilHits - a.affilHits ||
        b.titleHits - a.titleHits ||
        (b.orcid ? 1 : 0) - (a.orcid ? 1 : 0)
    );
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
  maxIds: number = 8,
  primaryOrcid?: string
): string[] {
  const ids: string[] = [];
  const normalizedPrimaryOrcid = normalizeOrcidUrl(primaryOrcid);
  const matching = (instAuthors || []).filter((cand) => {
    const cName = String(cand?.display_name || '').trim();
    const cId = String(cand?.id || '')
      .replace('https://openalex.org/', '')
      .trim();
    return Boolean(cId && cName && isSameName(cName, cleanSearchName));
  });
  const distinctOrcids = new Set(
    matching.map((cand) => normalizeOrcidUrl(cand?.orcid)).filter(Boolean)
  );
  const skipAllOrcids = !normalizedPrimaryOrcid && distinctOrcids.size > 1;
  const sorted = [...matching].sort(
    (a, b) => Number(b?.works_count || 0) - Number(a?.works_count || 0)
  );
  for (const cand of sorted) {
    const cId = String(cand?.id || '')
      .replace('https://openalex.org/', '')
      .trim();
    const candOrcid = normalizeOrcidUrl(cand?.orcid);
    if (normalizedPrimaryOrcid && areOrcidsConflicting(normalizedPrimaryOrcid, candOrcid)) {
      continue;
    }
    if (skipAllOrcids && candOrcid) {
      continue;
    }
    if (!ids.includes(cId)) {
      ids.push(cId);
      if (ids.length >= maxIds) break;
    }
  }
  return ids;
}

/** Filters un-ORCIDed Crossref fallback works against target name, affiliation tokens, or known GS titles to block homonym pollution. */
export function shouldKeepCrossrefFallbackWork(params: {
  title: string;
  authors: any[];
  targetName: string;
  isSameName: (a: string, b: string) => boolean;
  affilTokens: string[];
  candidateTitles?: string[];
}): boolean {
  const { title, authors, targetName, isSameName, affilTokens, candidateTitles } =
    params;
  const matchingAuthors = (authors || []).filter((au) => {
    const full = `${au?.given || ''} ${au?.family || ''}`.trim();
    return Boolean(full && isSameName(full, targetName));
  });
  if (matchingAuthors.length === 0) return false;

  const normTitle = normalizeAsciiWords(title);
  if (normTitle && candidateTitles && candidateTitles.length > 0) {
    const titleMatched = candidateTitles.some((cand) => {
      const cNorm = normalizeAsciiWords(cand);
      if (!cNorm) return false;
      if (cNorm === normTitle) return true;
      return (
        Math.min(cNorm.length, normTitle.length) >= 24 &&
        (normTitle.includes(cNorm) || cNorm.includes(normTitle))
      );
    });
    if (titleMatched) return true;
  }

  if (affilTokens.length === 0) return false;

  for (const au of matchingAuthors) {
    const affList = Array.isArray(au?.affiliation) ? au.affiliation : [];
    const affText = normalizeAsciiWords(
      affList.map((af: any) => String(af?.name || af || '')).join(' ')
    );
    if (affText && affilTokens.some((tok) => affText.includes(tok))) {
      return true;
    }
  }

  return false;
}

/** Maps ORCID public `/works` summary groups into OpenAlex-shaped work objects, skipping entries already present in `existingKeys`. */
export function mapOrcidWorksSummaryToOpenAlexFormat(
  worksData: any,
  authorName: string,
  orcidId: string,
  existingKeys: Set<string> = new Set(),
  affiliationHint: string = ''
): any[] {
  const groups: any[] = Array.isArray(worksData?.group) ? worksData.group : [];
  const cleanOrcid = String(orcidId || '').trim();
  const cleanAffil = String(affiliationHint || '').trim();
  const mapped: any[] = [];

  for (const group of groups) {
    const summary = Array.isArray(group?.['work-summary'])
      ? group['work-summary'][0]
      : null;
    if (!summary) continue;

    const title = String(summary?.title?.title?.value || '').trim();
    if (!title) continue;
    const normTitleKey = normalizeAsciiWords(title);

    const extIds: any[] = Array.isArray(
      summary?.['external-ids']?.['external-id']
    )
      ? summary['external-ids']['external-id']
      : [];
    const doiEntry =
      extIds.find(
        (e) =>
          String(e?.['external-id-type'] || '').toLowerCase() === 'doi' &&
          String(e?.['external-id-relationship'] || '').toLowerCase() === 'self'
      ) ||
      extIds.find(
        (e) => String(e?.['external-id-type'] || '').toLowerCase() === 'doi'
      );
    const rawDoi = String(doiEntry?.['external-id-value'] || '').trim();
    const doiKey = rawDoi.toLowerCase();

    if (
      (doiKey && existingKeys.has(`doi:${doiKey}`)) ||
      (normTitleKey && existingKeys.has(`title:${normTitleKey}`))
    ) {
      continue;
    }
    if (doiKey) existingKeys.add(`doi:${doiKey}`);
    if (normTitleKey) existingKeys.add(`title:${normTitleKey}`);

    const venue =
      String(summary?.['journal-title']?.value || '').trim() ||
      'Academic Venue';
    const year = Number(summary?.['publication-date']?.year?.value) || 2020;
    const workUrl =
      String(summary?.url?.value || '').trim() ||
      (rawDoi ? `https://doi.org/${rawDoi}` : undefined);

    mapped.push({
      id: rawDoi ? `orcid:${rawDoi}` : `orcid:${title.slice(0, 48)}`,
      title,
      display_name: title,
      publication_year: year,
      type: String(summary?.type || 'journal-article').replace(/-/g, '_'),
      doi: rawDoi ? `https://doi.org/${rawDoi}` : undefined,
      open_access: { is_oa: false },
      cited_by_count: 0,
      primary_location: {
        source: { display_name: venue, type: 'journal' },
        landing_page_url: workUrl,
      },
      authorships: [
        {
          author_position: 'first',
          author: {
            display_name: authorName,
            orcid: cleanOrcid ? `https://orcid.org/${cleanOrcid}` : undefined,
          },
          institutions: [],
          raw_affiliation_strings: cleanAffil ? [cleanAffil] : [],
        },
      ],
    });
  }

  return mapped;
}
