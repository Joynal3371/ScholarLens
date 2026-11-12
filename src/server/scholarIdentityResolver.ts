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
  source: string;
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

/**
 * Searches verified local caches/directories for a Google Scholar userId so
 * co-author or previously seen researchers resolve without external GS scraping.
 */
export function lookupScholarIdentityInStores(params: {
  scholarId: string;
  colleagueDirectory?: Record<string, { name?: string; userId?: string; university?: string }>;
  colleagueList?: Array<{ u?: string; n?: string; userId?: string; name?: string; university?: string }>;
  coAuthorMap?: Record<string, { u?: string; p?: string }>;
  verifiedSnapshot?: Record<string, any>;
  digests?: Record<string, any>;
  registeredUsers?: Array<{ name?: string; scholarUserId?: string; affiliation?: string }>;
}): ResolvedScholarIdentity | null {
  const targetId = String(params.scholarId || '').trim();
  if (!targetId) return null;

  for (const reg of params.registeredUsers || []) {
    if (String(reg?.scholarUserId || '').trim() === targetId && reg?.name) {
      return {
        name: reg.name.trim(),
        ...(reg.affiliation ? { affiliationHint: reg.affiliation } : {}),
        source: 'registered-user',
      };
    }
  }

  for (const digest of Object.values(params.digests || {})) {
    if (String(digest?.scholarUserId || '').trim() === targetId && digest?.name) {
      return {
        name: String(digest.name).trim(),
        ...(digest.affiliation ? { affiliationHint: String(digest.affiliation) } : {}),
        source: 'works-digest',
      };
    }
    for (const ca of digest?.coAuthors || []) {
      if (String(ca?.scholarUserId || '').trim() === targetId && ca?.name) {
        return {
          name: String(ca.name).trim(),
          ...(ca.universityName ? { affiliationHint: String(ca.universityName) } : {}),
          source: 'digest-coauthor',
        };
      }
    }
  }

  for (const item of params.colleagueList || []) {
    const id = String(item?.u || item?.userId || '').trim();
    const nm = String(item?.n || item?.name || '').trim();
    if (id === targetId && nm) {
      return {
        name: nm,
        ...(item?.university ? { affiliationHint: String(item.university) } : {}),
        source: 'colleague-list',
      };
    }
  }

  for (const [rawKey, entry] of Object.entries(params.coAuthorMap || {})) {
    if (String(entry?.u || '').trim() === targetId && rawKey.trim()) {
      return {
        name: rawKey.trim(),
        source: 'coauthor-map',
      };
    }
  }

  for (const entry of Object.values(params.colleagueDirectory || {})) {
    if (String(entry?.userId || '').trim() === targetId && entry?.name) {
      return {
        name: String(entry.name).trim(),
        ...(entry.university ? { affiliationHint: String(entry.university) } : {}),
        source: 'colleague-directory',
      };
    }
  }

  for (const snapVal of Object.values(params.verifiedSnapshot || {})) {
    const prof = snapVal?.profile || (snapVal?.publications ? snapVal : undefined);
    if (!prof) continue;
    if (String(prof.scholarUserId || '').trim() === targetId && prof.name) {
      return {
        name: String(prof.name).trim(),
        ...(prof.homeUniversity || prof.affiliation
          ? { affiliationHint: String(prof.homeUniversity || prof.affiliation) }
          : {}),
        source: 'snapshot-profile',
      };
    }
    for (const pub of prof.publications || []) {
      for (const ca of pub?.coAuthors || []) {
        if (String(ca?.scholarUserId || '').trim() === targetId && ca?.name) {
          return {
            name: String(ca.name).trim(),
            ...(ca.universityName ? { affiliationHint: String(ca.universityName) } : {}),
            source: 'snapshot-coauthor',
          };
        }
      }
    }
  }

  return null;
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
