function decodeHtmlEntitiesBasic(raw: string): string {
  return String(raw || '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) =>
      String.fromCharCode(parseInt(h, 16))
    );
}

function cleanTextFragment(raw: string): string {
  return decodeHtmlEntitiesBasic(
    String(raw || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[\u202A-\u202E\u200E\u200F]/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(val: string): string {
  return val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractNameFromScholarTitle(rawTitle: string): string {
  const cleaned = cleanTextFragment(rawTitle)
    .replace(/\s*[-–|]\s*Google\s+(?:Scholar|Acad[eè]mic|Akademik|Cendekia).*$/i, '')
    .replace(/^Google\s+Scholar(?:\s+Profiles)?$/i, '')
    .replace(/^(?:Citations|Profil)\s*$/i, '')
    .trim();

  if (
    !cleaned ||
    cleaned.length < 3 ||
    /^google\s*scholar$/i.test(cleaned) ||
    /^citations$/i.test(cleaned)
  ) {
    return '';
  }
  return cleaned;
}

export interface ResolvedScholarIdentity {
  name: string;
  affiliationHint?: string;
  countryCodeHint?: string;
  source: string;
}

export interface ScholarStoreLookupParams {
  scholarId: string;
  colleagueDirectory?: Record<string, { name?: string; userId?: string; university?: string }>;
  colleagueList?: Array<{ u?: string; n?: string; userId?: string; name?: string; university?: string }>;
  coAuthorMap?: Record<string, { u?: string; p?: string }>;
  verifiedSnapshot?: Record<string, any>;
  digests?: Record<string, any>;
  registeredUsers?: Array<{ name?: string; scholarUserId?: string; affiliation?: string }>;
}

export interface ScholarWorkEvidence {
  knownWorkTitles: string[];
  knownCollaboratorNames: string[];
  affiliationHint?: string;
  countryCodeHint?: string;
}

const GENERIC_PLACEHOLDER_AFFILS = new Set([
  'independent / unlisted',
  'unlisted',
  'unknown',
  'unknown university',
  'academic researcher',
  'academic research university',
  'research university',
]);

function isInformativeAffiliation(raw?: string): boolean {
  const clean = String(raw || '').trim().toLowerCase();
  return Boolean(clean && clean.length >= 3 && !GENERIC_PLACEHOLDER_AFFILS.has(clean));
}

function normalizeCountryCodeOpt(raw?: string): string | undefined {
  const cc = String(raw || '').trim().toUpperCase();
  return cc.length === 2 && cc !== 'UN' ? cc : undefined;
}

/**
 * Parses Yahoo SERP HTML for results pointing directly to a researcher's
 * Google Scholar profile (`scholar.google.<tld>/citations?...user=<scholarId>`).
 */
export function extractScholarIdentityFromYahooHtml(
  html: string,
  scholarId: string
): ResolvedScholarIdentity | null {
  if (!html || !scholarId) return null;
  const escapedId = escapeRegExp(scholarId.trim());
  const exactUserUrlRe = new RegExp(
    `scholar\\.google\\.[^"'\\s<]*citations[^"'\\s<]*[?&]user=${escapedId}(?:&|$|#|"|')`
  );
  const directUserParamRe = new RegExp(`[?&]user=${escapedId}(?:&|$|#)`);

  const blocks = html.split(/<div[^>]*class="[^"]*algo(?:-sr)?[^"]*"/i).slice(1);
  for (const rawBlock of blocks) {
    const seg = rawBlock.slice(0, 5000);
    // Decode double/single URL-encoded Yahoo RU= redirect URLs inside hrefs
    const hrefMatches = [...seg.matchAll(/href="([^"]+)"/gi)].map((m) =>
      m[1]
    );
    let pointsToExactUser = false;
    for (const href of hrefMatches) {
      let decoded = decodeHtmlEntitiesBasic(href);
      try {
        decoded = decodeURIComponent(decoded);
        decoded = decodeURIComponent(decoded);
      } catch {
        // Ignore malformed escape sequences in tracking params
      }
      if (exactUserUrlRe.test(decoded) || (decoded.includes('scholar.google.') && directUserParamRe.test(decoded))) {
        pointsToExactUser = true;
        break;
      }
    }
    if (!pointsToExactUser) continue;

    const titleMatch = seg.match(
      /<h3[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i
    );
    const titleName = titleMatch?.[1]
      ? extractNameFromScholarTitle(titleMatch[1])
      : '';

    const snippetMatch =
      seg.match(/<div[^>]*class="[^"]*compText[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
      seg.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const snippetText = snippetMatch?.[1]
      ? cleanTextFragment(snippetMatch[1])
      : '';

    let resolvedName = titleName;
    let affiliationHint = '';

    if (snippetText) {
      const beforeCitedBy = snippetText.split(/\bCited\s+by\b/i)[0] || '';
      const cleanParts = beforeCitedBy
        .split(/\s+[-–]\s+/)
        .map((p) => p.replace(/^Verified email at\s+\S+/i, '').trim())
        .filter((p) => p && !/^google\s+scholar$/i.test(p));

      if (!resolvedName && cleanParts.length >= 1) {
        const candidateName = extractNameFromScholarTitle(cleanParts[0]);
        if (candidateName && candidateName.split(/\s+/).length <= 6) {
          resolvedName = candidateName;
        }
      }
      if (cleanParts.length >= 2) {
        affiliationHint = cleanParts
          .slice(resolvedName && cleanParts[0].includes(resolvedName) ? 1 : 0)
          .join(', ')
          .slice(0, 140);
      } else if (resolvedName && cleanParts.length === 1 && cleanParts[0] !== resolvedName) {
        affiliationHint = cleanParts[0].slice(0, 140);
      }
    }

    if (resolvedName) {
      return {
        name: resolvedName,
        ...(affiliationHint ? { affiliationHint } : {}),
        source: 'yahoo-scholar-index',
      };
    }
  }

  return null;
}

interface StoreAggregationResult {
  identity: ResolvedScholarIdentity | null;
  knownWorkTitles: string[];
  knownCollaboratorNames: string[];
}

function collectScholarStoreIdentityAndEvidence(
  params: ScholarStoreLookupParams
): StoreAggregationResult {
  const targetId = String(params.scholarId || '').trim();
  if (!targetId) {
    return { identity: null, knownWorkTitles: [], knownCollaboratorNames: [] };
  }

  const bestName: { value: { name: string; source: string; priority: number } | null } = {
    value: null,
  };
  const coAuthorNameCounts = new Map<
    string,
    { display: string; count: number; source: string; priority: number }
  >();
  const affilVotes = new Map<
    string,
    { affil: string; countryCode?: string; weight: number }
  >();
  const evidenceItems: Array<{
    title: string;
    collaborator?: string;
    affil?: string;
    year: number;
  }> = [];

  const recordName = (name: string, source: string, priority: number) => {
    const clean = String(name || '').trim();
    if (!clean) return;
    if (!bestName.value || priority > bestName.value.priority) {
      bestName.value = { name: clean, source, priority };
    }
  };

  const recordCoAuthorName = (name: string, source: string, priority: number) => {
    const clean = String(name || '').trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    const prev = coAuthorNameCounts.get(key);
    if (prev) {
      prev.count++;
      if (priority > prev.priority) {
        prev.priority = priority;
        prev.source = source;
        prev.display = clean;
      }
    } else {
      coAuthorNameCounts.set(key, {
        display: clean,
        count: 1,
        source,
        priority,
      });
    }
  };

  const recordAffilVote = (
    rawAffil: string | undefined,
    rawCountry: string | undefined,
    weight: number
  ) => {
    const cleanAffil = String(rawAffil || '').trim();
    if (!isInformativeAffiliation(cleanAffil)) return;
    const key = cleanAffil.toLowerCase();
    const cc = normalizeCountryCodeOpt(rawCountry);
    const prev = affilVotes.get(key);
    if (prev) {
      prev.weight += weight;
      if (!prev.countryCode && cc) prev.countryCode = cc;
    } else {
      affilVotes.set(key, { affil: cleanAffil, countryCode: cc, weight });
    }
  };

  for (const reg of params.registeredUsers || []) {
    if (String(reg?.scholarUserId || '').trim() === targetId && reg?.name) {
      recordName(reg.name, 'registered-user', 100);
      recordAffilVote(reg.affiliation, undefined, 6);
    }
  }

  for (const snapVal of Object.values(params.verifiedSnapshot || {})) {
    const prof = snapVal?.profile || (snapVal?.publications ? snapVal : undefined);
    if (!prof) continue;
    if (String(prof.scholarUserId || '').trim() === targetId && prof.name) {
      recordName(prof.name, 'snapshot-profile', 90);
      recordAffilVote(
        prof.homeUniversity || prof.affiliation,
        undefined,
        6
      );
      for (const pub of prof.publications || []) {
        const title = String(pub?.title || '').trim();
        if (title) {
          evidenceItems.push({
            title,
            affil: String(prof.homeUniversity || prof.affiliation || '').trim(),
            year: Number(pub?.year || 0),
          });
        }
      }
    }
    for (const pub of prof.publications || []) {
      for (const ca of pub?.coAuthors || []) {
        if (String(ca?.scholarUserId || '').trim() === targetId && ca?.name) {
          recordCoAuthorName(String(ca.name), 'snapshot-coauthor', 40);
          recordAffilVote(ca.universityName, ca.countryCode, 1);
          const title = String(pub?.title || '').trim();
          if (title) {
            evidenceItems.push({
              title,
              collaborator: String(prof.name || '').trim() || undefined,
              affil: String(ca.universityName || '').trim(),
              year: Number(pub?.year || 0),
            });
          }
        }
      }
    }
  }

  for (const digest of Object.values(params.digests || {})) {
    if (String(digest?.scholarUserId || '').trim() === targetId && digest?.name) {
      recordName(String(digest.name), 'works-digest', 80);
      recordAffilVote(digest.affiliation, undefined, 5);
    }
    for (const ca of digest?.coAuthors || []) {
      if (String(ca?.scholarUserId || '').trim() === targetId && ca?.name) {
        recordCoAuthorName(String(ca.name), 'digest-coauthor', 45);
        recordAffilVote(ca.universityName, ca.countryCode, 1);
      }
    }
  }

  for (const item of params.colleagueList || []) {
    const id = String(item?.u || item?.userId || '').trim();
    const nm = String(item?.n || item?.name || '').trim();
    if (id === targetId && nm) {
      recordName(nm, 'colleague-list', 70);
      recordAffilVote(item?.university, undefined, 2);
    }
  }

  for (const entry of Object.values(params.colleagueDirectory || {})) {
    if (String(entry?.userId || '').trim() === targetId && entry?.name) {
      recordName(String(entry.name), 'colleague-directory', 65);
      recordAffilVote(entry.university, undefined, 2);
    }
  }

  for (const [rawKey, entry] of Object.entries(params.coAuthorMap || {})) {
    if (String(entry?.u || '').trim() === targetId && rawKey.trim()) {
      recordName(rawKey.trim(), 'coauthor-map', 20);
    }
  }

  if (coAuthorNameCounts.size > 0 && (!bestName.value || bestName.value.priority < 50)) {
    const sortedCo = [...coAuthorNameCounts.values()].sort(
      (a, b) => b.count - a.count || b.priority - a.priority
    );
    bestName.value = {
      name: sortedCo[0].display,
      source: sortedCo[0].source,
      priority: sortedCo[0].priority,
    };
  }

  if (!bestName.value) {
    return { identity: null, knownWorkTitles: [], knownCollaboratorNames: [] };
  }

  const topAffil = [...affilVotes.values()].sort((a, b) => b.weight - a.weight)[0];
  const winningAffilLower = topAffil?.affil.toLowerCase();

  // Filter work evidence to papers consistent with the winning affiliation when known
  const sortedEvidence = [...evidenceItems].sort((a, b) => {
    const aAligned =
      winningAffilLower && a.affil?.toLowerCase() === winningAffilLower ? 1 : 0;
    const bAligned =
      winningAffilLower && b.affil?.toLowerCase() === winningAffilLower ? 1 : 0;
    return bAligned - aAligned || b.year - a.year;
  });

  const knownWorkTitles: string[] = [];
  const seenTitles = new Set<string>();
  const knownCollaboratorNames: string[] = [];
  const seenCollabs = new Set<string>();
  for (const item of sortedEvidence) {
    if (
      winningAffilLower &&
      item.affil &&
      isInformativeAffiliation(item.affil) &&
      item.affil.toLowerCase() !== winningAffilLower &&
      knownWorkTitles.length > 0
    ) {
      continue;
    }
    const tKey = item.title.toLowerCase();
    if (!seenTitles.has(tKey) && knownWorkTitles.length < 6) {
      seenTitles.add(tKey);
      knownWorkTitles.push(item.title);
    }
    if (item.collaborator) {
      const cKey = item.collaborator.toLowerCase();
      if (!seenCollabs.has(cKey) && knownCollaboratorNames.length < 6) {
        seenCollabs.add(cKey);
        knownCollaboratorNames.push(item.collaborator);
      }
    }
  }

  return {
    identity: {
      name: bestName.value.name,
      ...(topAffil?.affil ? { affiliationHint: topAffil.affil } : {}),
      ...(topAffil?.countryCode ? { countryCodeHint: topAffil.countryCode } : {}),
      source: bestName.value.source,
    },
    knownWorkTitles,
    knownCollaboratorNames,
  };
}

/**
 * Searches verified local caches/directories for a Google Scholar userId so
 * co-author or previously seen researchers resolve without external GS scraping.
 * Scans all stores and picks the highest-weighted canonical affiliation so
 * affiliation-less directory rows never shadow verified university metadata.
 */
export function lookupScholarIdentityInStores(
  params: ScholarStoreLookupParams
): ResolvedScholarIdentity | null {
  return collectScholarStoreIdentityAndEvidence(params).identity;
}

/**
 * Extracts verified co-authored paper titles and collaborator names associated with a
 * Google Scholar userId from local snapshots/digests for OpenAlex work-based disambiguation.
 */
export function lookupScholarWorkEvidenceInStores(
  params: ScholarStoreLookupParams
): ScholarWorkEvidence {
  const res = collectScholarStoreIdentityAndEvidence(params);
  return {
    knownWorkTitles: res.knownWorkTitles,
    knownCollaboratorNames: res.knownCollaboratorNames,
    ...(res.identity?.affiliationHint
      ? { affiliationHint: res.identity.affiliationHint }
      : {}),
    ...(res.identity?.countryCodeHint
      ? { countryCodeHint: res.identity.countryCodeHint }
      : {}),
  };
}

export function decodeSearchRedirectUrl(rawHref: string): string {
  const unescaped = decodeHtmlEntitiesBasic(rawHref);
  try {
    const uddgMatch = unescaped.match(/[?&]uddg=([^&]+)/i);
    if (uddgMatch?.[1]) {
      return decodeURIComponent(decodeURIComponent(uddgMatch[1]));
    }
  } catch {
    // Fallback to standard decode
  }
  try {
    const uddgMatch = unescaped.match(/[?&]uddg=([^&]+)/i);
    if (uddgMatch?.[1]) {
      return decodeURIComponent(uddgMatch[1]);
    }
  } catch {
    // Ignore malformed encoding
  }
  try {
    return decodeURIComponent(unescaped);
  } catch {
    return unescaped;
  }
}

/**
 * Parses DuckDuckGo HTML results (`html.duckduckgo.com/html/`) for results pointing
 * to a researcher's Google Scholar profile (`scholar.google.<tld>/citations?...user=<scholarId>`).
 */
export function extractScholarIdentityFromDdgHtml(
  html: string,
  scholarId: string
): ResolvedScholarIdentity | null {
  if (!html || !scholarId) return null;
  const escapedId = escapeRegExp(scholarId.trim());
  const exactUserParamRe = new RegExp(`[?&]user=${escapedId}(?:&|$|#)`);
  const titleAnchorRe =
    /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i;
  const snippetRe =
    /class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/(?:a|div|span)>/i;

  const blocks = html.split(/<div[^>]*class="[^"]*results_links[^"]*"/i).slice(1);
  const segments =
    blocks.length > 0
      ? blocks
      : [...html.matchAll(/<h2[^>]*class="[^"]*result__title[^"]*"[\s\S]{0,1800}/gi)].map(
          (m) => m[0]
        );

  for (const rawSeg of segments) {
    const seg = rawSeg.slice(0, 4000);
    const anchor = seg.match(titleAnchorRe);
    if (!anchor) continue;
    const decodedHref = decodeSearchRedirectUrl(anchor[1] || '');
    const hrefMatchesExact =
      decodedHref.includes('scholar.google.') &&
      exactUserParamRe.test(decodedHref);

    if (!hrefMatchesExact) continue;

    const titleName = extractNameFromScholarTitle(anchor[2] || '');
    const snippetRaw = seg.match(snippetRe)?.[1] || '';
    const snippetText = snippetRaw ? cleanTextFragment(snippetRaw) : '';

    let resolvedName = titleName;
    let affiliationHint = '';

    if (snippetText) {
      const beforeCitedBy = snippetText.split(/\bCited\s+by\b/i)[0] || '';
      const cleanParts = beforeCitedBy
        .split(/\s+[-–]\s+/)
        .map((p) => p.replace(/^Verified email at\s+\S+/i, '').trim())
        .filter((p) => p && !/^google\s+scholar$/i.test(p));

      if (!resolvedName && cleanParts.length >= 1) {
        const candidateName = extractNameFromScholarTitle(cleanParts[0]);
        if (candidateName && candidateName.split(/\s+/).length <= 6) {
          resolvedName = candidateName;
        }
      }
      if (cleanParts.length >= 2) {
        affiliationHint = cleanParts
          .slice(resolvedName && cleanParts[0].includes(resolvedName) ? 1 : 0)
          .join(', ')
          .slice(0, 140);
      } else if (resolvedName && cleanParts.length === 1 && cleanParts[0] !== resolvedName) {
        affiliationHint = cleanParts[0].slice(0, 140);
      }
    }

    if (resolvedName) {
      return {
        name: resolvedName,
        ...(affiliationHint ? { affiliationHint } : {}),
        source: 'ddg-scholar-index',
      };
    }
  }

  return null;
}

/**
 * Extracts ranked 12-character Google Scholar user IDs from DuckDuckGo or Yahoo SERP HTML,
 * verifying researcher name match and scoring affiliation hits first.
 */
export function extractCandidateScholarIdsFromSearchHtml(
  html: string,
  researcherName: string,
  affiliationHint?: string,
  nameMatcher?: (candidateName: string, targetName: string) => boolean
): string[] {
  if (!html || !researcherName) return [];
  const cleanTarget = researcherName.trim();
  const affTokens = String(affiliationHint || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (t) =>
        t.length >= 4 &&
        !new Set([
          'university',
          'institute',
          'college',
          'department',
          'research',
          'school',
          'center',
          'centre',
          'national',
          'international',
        ]).has(t)
    );

  const scored: Array<{ id: string; score: number }> = [];
  const seen = new Set<string>();

  const ddgBlocks = html.split(/<div[^>]*class="[^"]*results_links[^"]*"/i).slice(1);
  const yahooBlocks = html.split(/<div[^>]*class="[^"]*algo(?:-sr)?[^"]*"/i).slice(1);
  const blocks = ddgBlocks.length > 0 ? ddgBlocks : yahooBlocks;

  for (const rawBlock of blocks) {
    const seg = rawBlock.slice(0, 4500);
    const hrefs = [...seg.matchAll(/href="([^"]+)"/gi)].map((m) =>
      decodeSearchRedirectUrl(m[1])
    );
    const scholarHref = hrefs.find(
      (h) => h.includes('scholar.google.') && /[?&]user=([a-zA-Z0-9_-]{10,14})/.test(h)
    );
    if (!scholarHref) continue;
    const idMatch = scholarHref.match(/[?&]user=([a-zA-Z0-9_-]{10,14})/);
    const candId = idMatch?.[1]?.trim();
    if (!candId || seen.has(candId)) continue;

    const titleHtml =
      seg.match(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*>([\s\S]*?)<\/a>/i)?.[1] ||
      seg.match(/<h3[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ||
      '';
    const titleName = extractNameFromScholarTitle(titleHtml);
    if (!titleName) continue;

    const matchesName = nameMatcher
      ? nameMatcher(titleName, cleanTarget)
      : titleName.toLowerCase() === cleanTarget.toLowerCase();
    if (!matchesName) continue;

    const fullText = cleanTextFragment(seg).toLowerCase();
    const affHits = affTokens.filter((tok) => fullText.includes(tok)).length;
    seen.add(candId);
    scored.push({
      id: candId,
      score: 10 + affHits * 15,
    });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.id);
}

export function extractGeneralUrlsFromDdgHtml(html: string): string[] {
  if (!html) return [];
  const urls: string[] = [];
  const seen = new Set<string>();
  const matches = html.matchAll(
    /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"/gi
  );
  for (const m of matches) {
    const decoded = decodeSearchRedirectUrl(m[1] || '').trim();
    if (!decoded || !/^https?:\/\//i.test(decoded)) continue;
    if (
      /duckduckgo\.com|google\.com\/search|scholar\.google\.|youtube\.com|facebook\.com|twitter\.com|x\.com|linkedin\.com\/pub\/dir/i.test(
        decoded
      )
    ) {
      continue;
    }
    if (!seen.has(decoded)) {
      seen.add(decoded);
      urls.push(decoded);
    }
  }
  return urls;
}
