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
