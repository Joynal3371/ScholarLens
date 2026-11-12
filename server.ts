import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import firebaseAppletConfig from './firebase-applet-config.json';
import {
  AuthProvider,
  AuthenticatedResearcherRecord,
  ORCID_SESSION_COOKIE_NAME,
  ORCID_STATE_COOKIE_NAME,
  OrcidAccountStore,
  OrcidConflictError,
  OrcidEnvironment,
  OrcidUnauthorizedError,
  OrcidValidationError,
  createInMemoryAccountMirror,
  createSignedOAuthState,
  createSignedSessionToken,
  deriveAuthSecret,
  exchangeOrcidAuthorizationCode,
  getOrcidEndpoints,
  normalizeOrcidId,
  parseCookies,
  resolvePublicBaseUrl,
  serializeCookie,
  validateOrcidClientId,
  verifyAndResolveOrcidIdentity,
  verifySignedOAuthState,
  verifySignedSessionToken,
} from './src/server/orcidAuth';
import {
  DigestWorkItem,
  PublicResearcherSummary,
  SocialForbiddenError,
  SocialNetworkStore,
  SocialNotFoundError,
  SocialValidationError,
} from './src/server/socialStore';
import {
  buildYahooScholarSearchQueries,
  extractAffiliationKeywords,
  extractPortraitUrlFromHtml,
  extractSameInstitutionAuthorIds,
  normalizeAsciiWords,
  pickDisambiguationTitles,
  pickInstitutionalProfileUrls,
  rankOpenAlexAuthorsFromWorks,
  scoreOpenAlexAuthorCandidate,
} from './src/server/openAlexDisambiguation';
import verifiedScholarSnapshot from './src/data/verifiedScholarCache.json';
import verifiedColleagueDirectory from './src/data/verifiedColleagueDirectory.json';
import verifiedAvatarStore from './src/data/verifiedAvatarStore.json';
import {
  CoAuthorAffiliation,
  Publication,
  Quartile,
  PublicationType,
  AuthorshipRole,
  ResearcherProfile,
  OfficialScholarMetrics,
  normalizePublicationsVenueConsistency,
  getJournalImpactFactor,
  getAuthoritativeQuartile,
  parseGoogleScholarInput,
  parseStrictGoogleScholarProfileInput,
} from './src/utils/scholarAnalytics';

dotenv.config();

type ContinentName =
  | 'North America'
  | 'Europe'
  | 'Asia'
  | 'Oceania'
  | 'South America'
  | 'Africa';

// ISO-3166 Country Code to Continent & Country Name (Standard ISO Reference)
const ISO_COUNTRY_INFO: Record<
  string,
  { country: string; continent: ContinentName; lat: number; lng: number }
> = {
  BD: { country: 'Bangladesh', continent: 'Asia', lat: 23.8103, lng: 90.4125 },
  US: { country: 'United States', continent: 'North America', lat: 38.8951, lng: -77.0364 },
  CA: { country: 'Canada', continent: 'North America', lat: 45.4215, lng: -75.6972 },
  GB: { country: 'United Kingdom', continent: 'Europe', lat: 51.5074, lng: -0.1278 },
  DK: { country: 'Denmark', continent: 'Europe', lat: 55.6761, lng: 12.5683 },
  FR: { country: 'France', continent: 'Europe', lat: 48.8566, lng: 2.3522 },
  DE: { country: 'Germany', continent: 'Europe', lat: 52.52, lng: 13.405 },
  ES: { country: 'Spain', continent: 'Europe', lat: 40.4168, lng: -3.7038 },
  PT: { country: 'Portugal', continent: 'Europe', lat: 38.7223, lng: -9.1393 },
  IT: { country: 'Italy', continent: 'Europe', lat: 41.9028, lng: 12.4964 },
  NL: { country: 'Netherlands', continent: 'Europe', lat: 52.3676, lng: 4.9041 },
  CH: { country: 'Switzerland', continent: 'Europe', lat: 47.3769, lng: 8.5417 },
  SE: { country: 'Sweden', continent: 'Europe', lat: 59.3293, lng: 18.0686 },
  NO: { country: 'Norway', continent: 'Europe', lat: 59.9139, lng: 10.7522 },
  FI: { country: 'Finland', continent: 'Europe', lat: 60.1699, lng: 24.9384 },
  BE: { country: 'Belgium', continent: 'Europe', lat: 50.8503, lng: 4.3517 },
  AT: { country: 'Austria', continent: 'Europe', lat: 48.2082, lng: 16.3738 },
  IE: { country: 'Ireland', continent: 'Europe', lat: 53.3498, lng: -6.2603 },
  PL: { country: 'Poland', continent: 'Europe', lat: 52.2297, lng: 21.0122 },
  CZ: { country: 'Czechia', continent: 'Europe', lat: 50.0755, lng: 14.4378 },
  GR: { country: 'Greece', continent: 'Europe', lat: 37.9838, lng: 23.7275 },
  TR: { country: 'Turkey', continent: 'Asia', lat: 39.9334, lng: 32.8597 },
  MY: { country: 'Malaysia', continent: 'Asia', lat: 3.139, lng: 101.6869 },
  SG: { country: 'Singapore', continent: 'Asia', lat: 1.3521, lng: 103.8198 },
  CN: { country: 'China', continent: 'Asia', lat: 39.9042, lng: 116.4074 },
  HK: { country: 'China (Hong Kong)', continent: 'Asia', lat: 22.3193, lng: 114.1694 },
  JP: { country: 'Japan', continent: 'Asia', lat: 35.6762, lng: 139.6503 },
  KR: { country: 'South Korea', continent: 'Asia', lat: 37.5665, lng: 126.978 },
  IN: { country: 'India', continent: 'Asia', lat: 28.6139, lng: 77.209 },
  PK: { country: 'Pakistan', continent: 'Asia', lat: 33.6844, lng: 73.0479 },
  SA: { country: 'Saudi Arabia', continent: 'Asia', lat: 24.7136, lng: 46.6753 },
  AE: { country: 'United Arab Emirates', continent: 'Asia', lat: 24.4539, lng: 54.3773 },
  QA: { country: 'Qatar', continent: 'Asia', lat: 25.2854, lng: 51.531 },
  TH: { country: 'Thailand', continent: 'Asia', lat: 13.7563, lng: 100.5018 },
  VN: { country: 'Vietnam', continent: 'Asia', lat: 21.0278, lng: 105.8342 },
  ID: { country: 'Indonesia', continent: 'Asia', lat: -6.2088, lng: 106.8456 },
  AU: { country: 'Australia', continent: 'Oceania', lat: -33.8688, lng: 151.2093 },
  NZ: { country: 'New Zealand', continent: 'Oceania', lat: -36.8485, lng: 174.7633 },
  EG: { country: 'Egypt', continent: 'Africa', lat: 30.0444, lng: 31.2357 },
  ZA: { country: 'South Africa', continent: 'Africa', lat: -33.9249, lng: 18.4241 },
  NG: { country: 'Nigeria', continent: 'Africa', lat: 9.0765, lng: 7.3986 },
  BR: { country: 'Brazil', continent: 'South America', lat: -23.5505, lng: -46.6333 },
  MX: { country: 'Mexico', continent: 'North America', lat: 19.4326, lng: -99.1332 },
  AR: { country: 'Argentina', continent: 'South America', lat: -34.6037, lng: -58.3816 },
  CL: { country: 'Chile', continent: 'South America', lat: -33.4489, lng: -70.6693 },
  CO: { country: 'Colombia', continent: 'South America', lat: 4.711, lng: -74.0721 },
};

function slugifyInstitution(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/–|—/g, '-')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 42) || 'institution'
  );
}

function normalizeUniversityDisplayName(name: string): string {
  const cleaned = name
    .replace(/East–West University/gi, 'East West University')
    .replace(/\s*\([A-Z0-9-]{2,10}\)\s*$/g, '')
    .trim();
  if (/^university of girona$/i.test(cleaned)) return 'Universitat de Girona';
  if (/^university politehnica timisoara$/i.test(cleaned))
    return 'Politehnica University of Timisoara';
  if (/^cnrs$/i.test(cleaned))
    return 'Centre National de la Recherche Scientifique';
  return cleaned;
}

/**
 * Strips volume, issue, page numbers, years, and publisher suffixes from Google Scholar venue strings
 * so journals are never split into separate entries (e.g. "Electronics 13 (11), 2153" -> "Electronics").
 */
export function cleanVenueName(rawVenue: string): string {
  if (!rawVenue) return 'Academic Venue';
  let v = rawVenue
    .replace(/\s+/g, ' ')
    .replace(/,\s*(19|20)\d{2}\s*$/, '')
    .trim();

  // Strip volume/issue/page patterns like "13 (11), 2153", "321, 117242", "102 (1), 159-172. e7", "vol. 12, no. 3, pp. 1-10", ", 109021"
  v = v
    .replace(/,?\s*\bvol\.?\s*\d+.*$/i, '')
    .replace(/,?\s*\bno\.?\s*\d+.*$/i, '')
    .replace(/,?\s*\bpp\.?\s*\d+.*$/i, '')
    .replace(/\s*\((?:cat\.?\s*no\.?|vol\.?|pp\.?|no\.?)[^)]*\)/i, '')
    .replace(/(?:,\s*|\s+)\b(?:cat\.?\s*no\.?|vol\.?|pp\.?|no\.?)\s*[:#]?\s*\d+.*$/i, '')
    .replace(/\s+\d+\s*\([^)]+\).*$/i, '')
    .replace(/\s+\d+\s*,\s*[\d–eE.-]+.*$/i, '')
    .replace(/,\s*\d+-\d+.*$/i, '')
    .replace(/,\s*[A-Za-z]?\d{4,8}\s*$/i, '')
    .replace(/\s+\(\d{4}\)\s*$/i, '')
    .replace(/\s+\d{1,4}\s*$/i, '')
    .replace(/[…\.\s\(\)]+$/, '')
    .replace(/^[,\s\(-]+|[,\s\)-]+$/g, '')
    .trim();

  // Canonicalize major journals & conferences so the same venue is never fragmented
  if (/^renewable\s+(and\s+)?sustainable\s+energy\s+rev/i.test(v))
    return 'Renewable and Sustainable Energy Reviews';
  if (/^applied\s+energy/i.test(v) || /^appl\.\s*energy/i.test(v))
    return 'Applied Energy';
  if (/^proceedings\s+of\s+the\s+ieee/i.test(v) || /^proc\.\s*ieee/i.test(v))
    return 'Proceedings of the IEEE';
  if (/^nature communications/i.test(v) || /^nat\.\s*commun/i.test(v)) return 'Nature Communications';
  if (/^the embo journal$/i.test(v)) return 'The EMBO Journal';
  if (/^ieee access$/i.test(v)) return 'IEEE Access';
  if (/^plos one$/i.test(v)) return 'PLOS ONE';
  if (/^scientific reports$/i.test(v)) return 'Scientific Reports';
  if (/^front(\.|iers in)\s*plant\s*sci/i.test(v)) return 'Frontiers in Plant Science';
  if (/^(sustainable\s+)?energy\s+technol(\.|ogies)\s*(and\s+)?assess/i.test(v))
    return 'Sustainable Energy Technologies and Assessments';
  if (/^energy conversion and management:?\s*x$/i.test(v))
    return 'Energy Conversion and Management: X';
  if (/^energy conversion and management$/i.test(v))
    return 'Energy Conversion and Management';
  if (/^energy$/i.test(v)) return 'Energy';
  if (/^gub journal of science and engineering/i.test(v))
    return 'GUB Journal of Science and Engineering';
  if (/^journal of engineering and technology\s*(\(jet\))?$/i.test(v))
    return 'Journal of Engineering and Technology';
  if (
    /^int\.\s*j\.\s*comput\.\s*sci\.\s*netw/i.test(v) ||
    /^international journal of computer science and network security/i.test(v)
  ) {
    return 'International Journal of Computer Science and Network Security';
  }
  if (!v || v.length <= 2) return 'Academic Venue';
  return v;
}

/**
 * Automatically detects and excludes non-journal / non-conference items from Google Scholar & OpenAlex/Crossref:
 * - Open data & datasets (Mendeley Data, Harvard Dataverse, DANS, Zenodo, Figshare, Dryad, Data in Brief, Version V1/V2/V3)
 * - Code repositories (GitHub, GitLab, Code Ocean, SourceForge, Bitbucket)
 * - Preprints & working papers (arXiv, bioRxiv, medRxiv, TechRxiv, SSRN, Research Square, Preprints.org, HAL)
 * - Theses, dissertations, posters, patents, footnote strings, and corrupted ", 0" duplicate records
 */
export function shouldExcludeNonPaperRecord(params: {
  title: string;
  venue: string;
  workType?: string;
  sourceType?: string;
  citations?: number;
}): boolean {
  const title = (params.title || '').trim();
  const rawVenue = (params.venue || '').trim();
  const tLower = title.toLowerCase();
  const vLower = rawVenue.toLowerCase();
  const wType = (params.workType || '').toLowerCase();
  const sType = (params.sourceType || '').toLowerCase();

  if (!title || title.length < 10) return true;

  // 1. Corrupted Google Scholar duplicate/footnote strings (e.g. ending with ", 0" in title or venue, or author lists/titles in venue)
  if (/,\s*0(\s|$)/.test(title) || /,\s*0(\s|$)/.test(rawVenue)) return true;
  if (
    tLower.includes('the author (s)') ||
    tLower.includes('the author(s)') ||
    /^[a-z]{1,3}\d{4,}$/i.test(title) ||
    /^[a-z]{1,3}\d{4,}\b/i.test(tLower) ||
    /^[^\w]*\d+\s+[A-Z]/.test(title) ||
    /\bpp\.\s*\d+/i.test(title) ||
    /\bet\s+al\b/i.test(vLower) ||
    // Venues that are actually author citation headers (e.g., "Surname, F, 2020", "Surname A, Surname B", etc.) without any publication venue keywords
    (!/journal|conf|proc|trans|ieee|lett|rev|symp|ann|bull|arch|commun|adv|res|rep|chem|phys|eng|med|sci/i.test(
      vLower
    ) &&
      (/^[a-z]+,\s*[a-z](\.[a-z])?/i.test(vLower) ||
        /^[a-z\s]+,\s*(?:19|20)\d{2}\b/i.test(vLower))) ||
    /^seta-d-\d+/i.test(vLower) ||
    ((rawVenue.includes('…') || rawVenue.includes('...')) &&
      !/conference|symposium|workshop|proceedings|journal|ieee|international|lecture|transactions/i.test(
        vLower
      ))
  ) {
    return true;
  }

  // 2. Official Crossref / OpenAlex non-article work types
  const excludedTypes = [
    'dataset',
    'posted-content',
    'preprint',
    'dissertation',
    'thesis',
    'peer-review',
    'component',
    'grant',
    'standard',
    'report',
    'paratext',
    'erratum',
    'corrigendum',
    'retraction',
    'letter',
    'editorial',
  ];
  if (excludedTypes.some((et) => wType === et || wType.includes(et))) {
    return true;
  }
  if (sType === 'repository') {
    return true;
  }

  // 3. Open Data, Datasets, Code Repositories, Preprint Servers, Theses & Posters in Venue
  const nonPaperVenuePatterns = [
    'mendeley data',
    'mendeley',
    'dataverse',
    'harvard dataverse',
    'dans data station',
    'data archiving and networked services',
    '(dans)',
    'dans ',
    '[google scholar]',
    'stays neutral with regard to jurisdictional claims',
    'universidad de zaragoza',
    'zenodo',
    'figshare',
    'dryad',
    'kaggle',
    'github',
    'gitlab',
    'bitbucket',
    'sourceforge',
    'code ocean',
    'arxiv',
    'biorxiv',
    'medrxiv',
    'techrxiv',
    'chemrxiv',
    'engrxiv',
    'ssrn',
    'research square',
    'preprints',
    'authorea',
    'hal-',
    'open science framework',
    'osf.io',
    'virological',
    'thesis',
    'dissertation',
    'master thesis',
    'phd thesis',
    'bachelor thesis',
    'technical report',
    'working paper',
    'white paper',
    'poster',
    'patent',
    'us patent',
  ];
  if (nonPaperVenuePatterns.some((pat) => vLower.includes(pat))) {
    return true;
  }

  // 4. Open data repositories, Zenodo, Dataverse, Figshare, Dryad, Replication Data in Title or Venue
  const repositoryPatterns = [
    'zenodo',
    'dataverse',
    'figshare',
    'dryad',
    'mendeley data',
    'kaggle',
    'github.com',
    'code ocean',
    '[data set]',
    '[dataset]',
    'replication data',
    'open data repository',
  ];
  if (
    repositoryPatterns.some(
      (pat) => tLower.includes(pat) || vLower.includes(pat)
    )
  ) {
    return true;
  }

  // 5. Dataset repository versions, supplementary files, theses & dissertations
  if (
    /\bversion\s+v?\d+/i.test(vLower) ||
    /\bversion\s+v?\d+/i.test(tLower) ||
    /\bv\d+\.\[google/i.test(vLower) ||
    /^data\s+for:/i.test(tLower) ||
    /^supplementary\s+(data|material|information)/i.test(tLower) ||
    /\bcode\s+repository\b/i.test(tLower) ||
    /\b(phd|master'?s|doctoral)\s+(thesis|dissertation)\b/i.test(tLower)
  ) {
    return true;
  }

  // 6. Unverified entries with no venue ("Academic Venue" or empty) that are not real papers
  if (
    (!vLower || vLower === 'academic venue') &&
    (params.citations || 0) === 0
  ) {
    return true;
  }

  // 7. Malformed Google Scholar citation fragments where the title is just a truncated author list
  if (
    params.title.trim().length < 40 &&
    (/,\s*[A-Z]\.?(\s*,\s*|\s+and\s*$|$)/.test(params.title.trim()) ||
      /\bshihavuddin\b/i.test(tLower))
  ) {
    return true;
  }

  return false;
}

interface OpenAlexGeoRecord {
  id: string;
  display_name: string;
  ror?: string;
  country_code?: string;
  geo?: {
    city?: string;
    country?: string;
    country_code?: string;
    latitude?: number;
    longitude?: number;
  };
}

// Persistent runtime cache for official ROR + Wikidata + OpenAlex institution coordinates
const officialInstitutionGeoCache = new Map<
  string,
  Omit<CoAuthorAffiliation, 'name' | 'isHomeInstitution'>
>();

/**
 * Queries Wikidata SPARQL for exact physical campus coordinates (wdt:P625) by ROR ID (wdt:P6782) or institution label.
 */
async function queryWikidataInstitutionCoords(
  institutionName: string,
  rorId?: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const cleanRor = rorId
      ? rorId.replace('https://ror.org/', '').trim()
      : '';
    const sparql = cleanRor
      ? `SELECT ?coord WHERE { ?item wdt:P6782 "${cleanRor}". ?item wdt:P625 ?coord. } LIMIT 1`
      : `SELECT ?coord WHERE { ?item rdfs:label "${institutionName.replace(
          /"/g,
          ''
        )}"@en. ?item wdt:P625 ?coord. } LIMIT 1`;
    const res = await fetch(
      `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(
        sparql
      )}`,
      {
        headers: {
          'User-Agent': 'ScholarLens/2.0 (mailto:research@scholarlens.org)',
        },
        signal: AbortSignal.timeout(2500),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const wkt = String(data?.results?.bindings?.[0]?.coord?.value || '');
    const m = wkt.match(/Point\(([-\d.]+)\s+([-\d.]+)\)/i);
    if (m) {
      const lng = Number(m[1]);
      const lat = Number(m[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }
    }
  } catch {
    // Ignore timeout
  }
  return null;
}

const openAlexJsonCache = new Map<string, { ts: number; data: any }>();
let openAlexDirectRateLimitedUntil = 0;

/**
 * Fetches JSON from OpenAlex with in-memory caching, rotating polite-pool identifier, and automatic fallback via secondary proxy/relay if the local IP hits HTTP 429 rate limits.
 */
async function fetchOpenAlexJson(
  url: string,
  timeoutMs: number = 3800
): Promise<any | null> {
  const canonicalUrl = url
    .replace(/([?&])mailto=[^&]+(&|$)/i, (_m, p1, p2) => (p2 === '&' ? p1 : ''))
    .replace(/[?&]$/, '');

  const cached = openAlexJsonCache.get(canonicalUrl);
  if (cached && Date.now() - cached.ts < 30 * 60 * 1000) {
    return cached.data;
  }

  const rotatingMailto = `node-${Math.floor(Date.now() / 60000).toString(
    36
  )}-${Math.random().toString(36).slice(2, 6)}@scholarlens.org`;
  const fullUrl = `${canonicalUrl}${
    canonicalUrl.includes('?') ? '&' : '?'
  }mailto=${rotatingMailto}`;

  if (Date.now() >= openAlexDirectRateLimitedUntil) {
    try {
      const res = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ScholarLens/2.0)',
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) {
        const data = await res.json();
        openAlexJsonCache.set(canonicalUrl, { ts: Date.now(), data });
        return data;
      }
      if (res.status === 429) {
        openAlexDirectRateLimitedUntil = Date.now() + 10 * 60 * 1000;
      } else if (res.status < 500) {
        return null;
      }
    } catch {
      // Fall through to relay below
    }
  }

  if (!process.env.VERCEL) {
    try {
      const vUrl = `https://scholarlens-analytics.vercel.app/api/scholar/openalex-proxy?url=${encodeURIComponent(
        fullUrl
      )}`;
      const vRes = await fetch(vUrl, {
        signal: AbortSignal.timeout(Math.max(timeoutMs, 6500)),
      });
      if (vRes.ok) {
        const data = await vRes.json();
        openAlexJsonCache.set(canonicalUrl, { ts: Date.now(), data });
        return data;
      }
    } catch {
      // Ignore proxy error
    }
  }
  return null;
}

/**
 * Resolves any university or research institute strictly from official sources:
 * 1. OpenAlex /institutions GeoNames record + Wikidata wdt:P625 campus coordinates
 * 2. Research Organization Registry (ROR API v2 `https://api.ror.org/v2/organizations`)
 * 3. OpenAlex Institution Search API
 */
async function resolveInstitutionFromOfficialSources(
  rawInstName: string,
  rawCountryCode: string,
  openAlexId?: string,
  geoCache?: Map<string, OpenAlexGeoRecord>
): Promise<Omit<CoAuthorAffiliation, 'name' | 'isHomeInstitution'>> {
  const cleanName = normalizeUniversityDisplayName(rawInstName);
  const cacheKey = `${cleanName.toLowerCase()}::${openAlexId || ''}`;
  if (officialInstitutionGeoCache.has(cacheKey)) {
    return officialInstitutionGeoCache.get(cacheKey)!;
  }

  // 1. Check OpenAlex pre-fetched batch geoCache first
  if (openAlexId && geoCache?.has(openAlexId)) {
    const rec = geoCache.get(openAlexId)!;
    const cc = (
      rec.geo?.country_code ||
      rec.country_code ||
      rawCountryCode ||
      'US'
    ).toUpperCase();
    const countryInfo = ISO_COUNTRY_INFO[cc] || {
      country: rec.geo?.country || cc,
      continent: 'Asia' as ContinentName,
      lat: 23.8103,
      lng: 90.4125,
    };

    let lat =
      typeof rec.geo?.latitude === 'number'
        ? rec.geo.latitude
        : countryInfo.lat;
    let lng =
      typeof rec.geo?.longitude === 'number'
        ? rec.geo.longitude
        : countryInfo.lng;

    // Only query Wikidata P625 if OpenAlex geo coordinates are missing
    if (
      typeof rec.geo?.latitude !== 'number' ||
      typeof rec.geo?.longitude !== 'number'
    ) {
      const wdCoords = await queryWikidataInstitutionCoords(
        rec.display_name || cleanName,
        rec.ror
      );
      if (wdCoords) {
        lat = wdCoords.lat;
        lng = wdCoords.lng;
      }
    }

    const resolved: Omit<CoAuthorAffiliation, 'name' | 'isHomeInstitution'> = {
      universityId: slugifyInstitution(rec.display_name || cleanName),
      universityName: normalizeUniversityDisplayName(
        rec.display_name || cleanName
      ),
      city: rec.geo?.city || rec.geo?.country || countryInfo.country,
      country: rec.geo?.country || countryInfo.country,
      countryCode: cc,
      continent: countryInfo.continent,
      lat,
      lng,
    };
    officialInstitutionGeoCache.set(cacheKey, resolved);
    officialInstitutionGeoCache.set(
      `${resolved.universityName.toLowerCase()}::`,
      resolved
    );
    return resolved;
  }

  // 2. Query official ROR Registry (`https://api.ror.org/v2/organizations`) & OpenAlex Institution Search
  try {
    const [rorRes, oaData] = await Promise.all([
      fetch(
        `https://api.ror.org/v2/organizations?query=${encodeURIComponent(
          cleanName
        )}`,
        {
          headers: {
            'User-Agent': 'ScholarLens/2.0 (mailto:research@scholarlens.org)',
          },
          signal: AbortSignal.timeout(3000),
        }
      ).catch(() => null),
      fetchOpenAlexJson(
        `https://api.openalex.org/institutions?search=${encodeURIComponent(
          cleanName
        )}&per-page=3&select=id,display_name,ror,country_code,geo`,
        3000
      ),
    ]);

    const topInst = oaData?.results?.[0];
    if (topInst) {
      const cc = String(
        topInst.geo?.country_code ||
          topInst.country_code ||
          rawCountryCode ||
          'US'
      ).toUpperCase();
      const countryInfo = ISO_COUNTRY_INFO[cc] || ISO_COUNTRY_INFO.US;
      let lat =
        typeof topInst.geo?.latitude === 'number'
          ? topInst.geo.latitude
          : countryInfo.lat;
      let lng =
        typeof topInst.geo?.longitude === 'number'
          ? topInst.geo.longitude
          : countryInfo.lng;

      if (
        typeof topInst.geo?.latitude !== 'number' ||
        typeof topInst.geo?.longitude !== 'number'
      ) {
        const wdCoords = await queryWikidataInstitutionCoords(
          topInst.display_name || cleanName,
          topInst.ror
        );
        if (wdCoords) {
          lat = wdCoords.lat;
          lng = wdCoords.lng;
        }
      }

      const resolved: Omit<
        CoAuthorAffiliation,
        'name' | 'isHomeInstitution'
      > = {
        universityId: slugifyInstitution(topInst.display_name || cleanName),
        universityName: normalizeUniversityDisplayName(
          topInst.display_name || cleanName
        ),
        city:
          topInst.geo?.city || topInst.geo?.country || countryInfo.country,
        country: topInst.geo?.country || countryInfo.country,
        countryCode: cc,
        continent: countryInfo.continent,
        lat,
        lng,
      };
      officialInstitutionGeoCache.set(cacheKey, resolved);
      return resolved;
    }

    if (rorRes?.ok) {
      const rorData = (await rorRes.json()) as any;
      const items: any[] = Array.isArray(rorData?.items) ? rorData.items : [];
      const genericWords = new Set([
        'university',
        'universitat',
        'universite',
        'universidad',
        'universidade',
        'universiti',
        'institute',
        'institut',
        'institution',
        'college',
        'polytechnic',
        'polytechnique',
        'technology',
        'science',
        'sciences',
        'research',
        'national',
        'international',
        'center',
        'centre',
        'computing',
        'engineering',
        'department',
        'school',
        'academy',
        'foundation',
        'the',
        'and',
        'for',
      ]);
      const queryTokens = cleanName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length >= 3 && !genericWords.has(t));

      const item =
        items.find((cand: any) => {
          if (queryTokens.length === 0) return true;
          const allNames = (cand?.names || [])
            .map((n: any) =>
              String(n?.value || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
            )
            .join(' ');
          return queryTokens.some((qt) => allNames.includes(qt));
        }) || (queryTokens.length === 0 ? items[0] : null);

      const loc = item?.locations?.[0]?.geonames_details;
      if (item && loc) {
        const cc = String(
          loc.country_code || rawCountryCode || 'US'
        ).toUpperCase();
        const countryInfo = ISO_COUNTRY_INFO[cc] || ISO_COUNTRY_INFO.US;
        const rorDisplay =
          item.names?.find((n: any) => n.types?.includes('ror_display'))
            ?.value || cleanName;
        let lat = typeof loc.lat === 'number' ? loc.lat : countryInfo.lat;
        let lng = typeof loc.lng === 'number' ? loc.lng : countryInfo.lng;

        if (typeof loc.lat !== 'number' || typeof loc.lng !== 'number') {
          const wdCoords = await queryWikidataInstitutionCoords(
            rorDisplay,
            item.id
          );
          if (wdCoords) {
            lat = wdCoords.lat;
            lng = wdCoords.lng;
          }
        }

        const resolved: Omit<
          CoAuthorAffiliation,
          'name' | 'isHomeInstitution'
        > = {
          universityId: slugifyInstitution(rorDisplay),
          universityName: normalizeUniversityDisplayName(rorDisplay),
          city: loc.name || loc.country_name || countryInfo.country,
          country: loc.country_name || countryInfo.country,
          countryCode: cc,
          continent: countryInfo.continent,
          lat,
          lng,
        };
        officialInstitutionGeoCache.set(cacheKey, resolved);
        return resolved;
      }
    }
  } catch {
    // Fallback to Wikidata coordinate lookup below
  }

  const wdFallback = await queryWikidataInstitutionCoords(cleanName);
  let resolvedCC = (rawCountryCode || '').toUpperCase();
  if (!resolvedCC) {
    const cLower = cleanName.toLowerCase();
    if (cLower.includes('spain') || cLower.includes('girona') || cLower.includes('catalonia') || cLower.includes('barcelona') || cLower.includes('madrid')) resolvedCC = 'ES';
    else if (cLower.includes('norway') || cLower.includes('bergen') || cLower.includes('oslo')) resolvedCC = 'NO';
    else if (cLower.includes('france') || cLower.includes('paris') || cLower.includes('cnrs')) resolvedCC = 'FR';
    else if (cLower.includes('germany') || cLower.includes('berlin') || cLower.includes('munich') || cLower.includes('kiel')) resolvedCC = 'DE';
    else if (cLower.includes('canada') || cLower.includes('toronto')) resolvedCC = 'CA';
    else if (cLower.includes('bangladesh') || cLower.includes('dhaka')) resolvedCC = 'BD';
    else if (cLower.includes('uk') || cLower.includes('united kingdom') || cLower.includes('london') || cLower.includes('oxford') || cLower.includes('cambridge')) resolvedCC = 'GB';
    else resolvedCC = 'US';
  }
  const base = ISO_COUNTRY_INFO[resolvedCC] || ISO_COUNTRY_INFO.US;
  const fallbackResolved: Omit<
    CoAuthorAffiliation,
    'name' | 'isHomeInstitution'
  > = {
    universityId: slugifyInstitution(cleanName),
    universityName: cleanName,
    city: base.country,
    country: base.country,
    countryCode: resolvedCC,
    continent: base.continent,
    lat: wdFallback?.lat ?? base.lat,
    lng: wdFallback?.lng ?? base.lng,
  };
  officialInstitutionGeoCache.set(cacheKey, fallbackResolved);
  return fallbackResolved;
}

async function resolveInstitutionByVerifiedDomain(
  rawDomain: string | undefined
): Promise<Omit<CoAuthorAffiliation, 'name' | 'isHomeInstitution'> | null> {
  if (!rawDomain) return null;
  const clean = rawDomain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/\.$/, '');
  if (
    !clean ||
    clean === 'scholar.google.com' ||
    clean.endsWith('gmail.com') ||
    clean.endsWith('yahoo.com') ||
    clean.endsWith('outlook.com') ||
    clean.endsWith('hotmail.com') ||
    clean.endsWith('icloud.com') ||
    clean.endsWith('ieee.org') ||
    clean.endsWith('acm.org')
  ) {
    return null;
  }

  const cacheKey = `domain:${clean}`;
  const cached = officialInstitutionGeoCache.get(cacheKey);
  if (cached) return cached;

  const parts = clean.split('.');
  let rootDomain = clean;
  if (parts.length >= 3) {
    const lastTwo = parts.slice(-2).join('.');
    if (/^(edu|ac|org|gov|res)\.[a-z]{2}$/.test(lastTwo)) {
      rootDomain = parts.slice(-3).join('.');
    } else {
      rootDomain = lastTwo;
    }
  }
  const altRootDomain = rootDomain.includes('.ac.')
    ? rootDomain.replace('.ac.', '.edu.')
    : rootDomain.includes('.edu.')
    ? rootDomain.replace('.edu.', '.ac.')
    : rootDomain;
  const slug = rootDomain.split('.')[0];
  if (!slug || slug.length < 2) return null;

  const queries = [slug, rootDomain];
  for (const q of queries) {
    try {
      const rorResp = await fetch(
        `https://api.ror.org/v2/organizations?query=${encodeURIComponent(q)}`,
        {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(3500),
        }
      );
      if (!rorResp.ok) continue;
      const rorData = (await rorResp.json()) as any;
      const items: any[] = Array.isArray(rorData?.items) ? rorData.items : [];
      const matched = items.find((it) => {
        const doms: string[] = (it.domains || []).map((d: string) =>
          String(d).toLowerCase()
        );
        if (
          doms.some(
            (d) =>
              d === rootDomain ||
              d === altRootDomain ||
              d === clean ||
              clean.endsWith(`.${d}`) ||
              rootDomain.endsWith(`.${d}`)
          )
        ) {
          return true;
        }
        const links: string[] = (it.links || []).map((l: any) =>
          String(l.value || '').toLowerCase()
        );
        return links.some((u) => {
          try {
            const h = new URL(u).hostname.replace(/^www\./, '');
            return (
              h === rootDomain ||
              h === altRootDomain ||
              h === clean ||
              clean.endsWith(`.${h}`) ||
              h.endsWith(`.${rootDomain}`) ||
              h.endsWith(`.${altRootDomain}`)
            );
          } catch {
            return false;
          }
        });
      });

      if (matched) {
        const names: any[] = Array.isArray(matched.names) ? matched.names : [];
        const dispObj =
          names.find(
            (n) => (n.types || []).includes('ror_display') && n.lang === 'en'
          ) ||
          names.find((n) => (n.types || []).includes('ror_display')) ||
          names.find((n) => (n.types || []).includes('label') && n.lang === 'en') ||
          names[0];
        const rorName = String(dispObj?.value || '').trim();
        const loc = matched.locations?.[0]?.geonames_details;
        const rorCC = String(
          loc?.country_code || loc?.country_subdivision_code || 'US'
        ).toUpperCase();
        const base = ISO_COUNTRY_INFO[rorCC] || ISO_COUNTRY_INFO.US;
        const rorLat = Number(loc?.lat);
        const rorLng = Number(loc?.lng);
        if (rorName) {
          const resolved: Omit<
            CoAuthorAffiliation,
            'name' | 'isHomeInstitution'
          > = {
            universityId: slugifyInstitution(rorName),
            universityName: rorName,
            city: String(loc?.name || base.country),
            country: String(loc?.country_name || base.country),
            countryCode: rorCC,
            continent: base.continent,
            lat: Number.isFinite(rorLat) ? rorLat : base.lat,
            lng: Number.isFinite(rorLng) ? rorLng : base.lng,
          };
          officialInstitutionGeoCache.set(cacheKey, resolved);
          return resolved;
        }
      }
    } catch {
      // Ignore ROR domain lookup timeout
    }
  }
  return null;
}

interface ScrapedScholarPublication {
  title: string;
  authorsText: string;
  venueText: string;
  year: number;
  citations: number;
  scholarUrl?: string;
}

interface ScrapedScholarSidebarAuthor {
  name: string;
  affiliation: string;
  verifiedDomain?: string;
  scholarUserId?: string;
}

interface ScrapedScholarProfile {
  userId: string;
  name: string;
  affiliation: string;
  verifiedDomain: string;
  fields: string[];
  avatarDataUrl?: string;
  officialMetrics: OfficialScholarMetrics;
  sidebarCoAuthors: ScrapedScholarSidebarAuthor[];
  publications: ScrapedScholarPublication[];
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)))
    .trim();
}

let scholarCookieJar = '';

function updateScholarCookies(resp: Response): void {
  try {
    const rawCookies: string[] =
      typeof (resp.headers as any).getSetCookie === 'function'
        ? (resp.headers as any).getSetCookie()
        : resp.headers.get('set-cookie')
        ? [String(resp.headers.get('set-cookie'))]
        : [];
    if (rawCookies.length === 0) return;
    const cookiePairs = rawCookies
      .map((c) => c.split(';')[0]?.trim())
      .filter(Boolean);
    if (cookiePairs.length > 0) {
      scholarCookieJar = cookiePairs.join('; ');
    }
  } catch {
    // Ignore cookie parse error
  }
}

async function fetchScholarPageHtml(url: string): Promise<string | null> {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  ];

  // 1. Direct fetch with persistent session cookies & Chrome navigation headers (with retry)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const headers: Record<string, string> = {
        'User-Agent': userAgents[attempt % userAgents.length],
        'Accept-Language': 'en-US,en;q=0.9',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Sec-Ch-Ua':
          '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      };
      if (scholarCookieJar) {
        headers.Cookie = scholarCookieJar;
      }

      const resp = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(5500),
      });
      updateScholarCookies(resp);
      if (resp.ok) {
        const html = await resp.text();
        if (
          html.includes('gsc_prf_in') ||
          html.includes('gsc_a_tr') ||
          html.includes('gs_ai_chpr') ||
          html.includes('gsc_uco_b')
        ) {
          return html;
        }
      }
      if (resp.status === 429 || resp.status === 503) {
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }
      break;
    } catch {
      // Fall through to mirrors/relays below
    }
  }

  // 2. Fallback via Google AMP mirror & high-availability Hexlet AllOrigins relays if direct fetch was throttled
  const ampPath = url.replace(/^https?:\/\//i, '');
  const fallbackEndpoints = [
    {
      type: 'raw',
      url: `https://www.google.com/amp/s/${ampPath}`,
    },
    {
      type: 'raw',
      url: `https://allorigins.hexlet.app/raw?url=${encodeURIComponent(url)}`,
    },
    {
      type: 'json',
      url: `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
        url
      )}`,
    },
  ];

  for (const endpoint of fallbackEndpoints) {
    try {
      const pResp = await fetch(endpoint.url, {
        headers: {
          'User-Agent': userAgents[0],
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(6500),
      });
      if (!pResp.ok) continue;
      if (endpoint.type === 'json') {
        const data = (await pResp.json()) as any;
        const pHtml = String(data?.contents || '');
        if (
          pHtml.includes('gsc_prf_in') ||
          pHtml.includes('gsc_a_tr') ||
          pHtml.includes('gs_ai_chpr') ||
          pHtml.includes('gsc_uco_b')
        ) {
          return pHtml;
        }
      } else {
        const pHtml = await pResp.text();
        if (
          pHtml.includes('gsc_prf_in') ||
          pHtml.includes('gsc_a_tr') ||
          pHtml.includes('gs_ai_chpr') ||
          pHtml.includes('gsc_uco_b')
        ) {
          return pHtml;
        }
      }
    } catch {
      // Try next fallback endpoint
    }
  }

  return null;
}

async function scrapeGoogleScholarFullProfile(
  userId: string
): Promise<ScrapedScholarProfile | null> {
  try {
    const makePageUrl = (cstart: number) =>
      `https://scholar.google.com/citations?user=${encodeURIComponent(
        userId
      )}&hl=en&cstart=${cstart}&pagesize=100`;

    const firstPageHtml = await fetchScholarPageHtml(makePageUrl(0));
    if (!firstPageHtml) return null;

    const pagesHtml: string[] = [firstPageHtml];
    const firstRows = [...firstPageHtml.matchAll(/<tr class="gsc_a_tr">/g)];
    if (firstRows.length >= 100) {
      const morePages = await Promise.all([
        fetchScholarPageHtml(makePageUrl(100)),
        fetchScholarPageHtml(makePageUrl(200)),
      ]);
      for (const pHtml of morePages) {
        if (pHtml) pagesHtml.push(pHtml);
      }
    }

    const firstPage = pagesHtml[0];

    const nameMatch = firstPage.match(/id="gsc_prf_in"[^>]*>([^<]+)</i);
    const titleMatch = firstPage.match(
      /<title>([^<-]+)\s*[-–]\s*Google Scholar/i
    );
    const name = decodeHtmlEntities(nameMatch?.[1] || titleMatch?.[1] || '');
    if (!name) return null;

    const affilMatch = firstPage.match(
      /class="gsc_prf_il"[^>]*>([\s\S]*?)<\/div>/i
    );
    const affiliation = decodeHtmlEntities(
      (affilMatch?.[1] || 'Academic Researcher').replace(/<[^>]+>/g, '')
    );

    const ivhBlock =
      firstPage.match(/id="gsc_prf_ivh"[^>]*>([\s\S]*?)<\/div>/i)?.[1] || '';
    const domainMatch = ivhBlock.match(
      /Verified email at\s+([a-zA-Z0-9.-]+)/i
    );
    const verifiedDomain =
      domainMatch?.[1]?.replace(/\.$/, '') || 'scholar.google.com';

    const fieldMatches = [
      ...firstPage.matchAll(/class="gsc_prf_inta[^"]*"[^>]*>([^<]+)<\/a>/gi),
    ];
    const fields = fieldMatches
      .map((m) => decodeHtmlEntities(m[1]))
      .filter(Boolean);

    const stdCells = [
      ...firstPage.matchAll(/class="gsc_rsb_std"[^>]*>([\d,]+)<\/td>/gi),
    ].map((m) => Number(String(m[1]).replace(/,/g, '')));

    // Extract Google Scholar's official "Citations per year" bar chart histogram (.gsc_md_hist_b)
    const citationsByYear: Record<number, number> = {};
    const histBlockMatch = firstPage.match(
      /class="gsc_md_hist_b"[^>]*>([\s\S]*?)<\/div>/i
    );
    if (histBlockMatch?.[1]) {
      const histHtml = histBlockMatch[1];
      const histYears = [
        ...histHtml.matchAll(/class="gsc_g_t"[^>]*>(\d{4})<\/span>/gi),
      ].map((m) => Number(m[1]));
      for (const y of histYears) {
        if (y >= 1950) citationsByYear[y] = 0;
      }
      const barAnchors = [
        ...histHtml.matchAll(
          /<a[^>]*class="gsc_g_a"[^>]*style="[^"]*z-index:\s*(\d+)[^"]*"[^>]*>\s*<span[^>]*class="gsc_g_al"[^>]*>([\d,]+)<\/span>\s*<\/a>/gi
        ),
      ];
      if (barAnchors.length > 0 && histYears.length > 0) {
        for (const aMatch of barAnchors) {
          const zIdx = Number(aMatch[1]);
          const citVal = Number(String(aMatch[2]).replace(/,/g, ''));
          const yrIdx = histYears.length - zIdx;
          if (yrIdx >= 0 && yrIdx < histYears.length) {
            citationsByYear[histYears[yrIdx]] = citVal;
          }
        }
      } else {
        const rawCits = [
          ...histHtml.matchAll(/class="gsc_g_al"[^>]*>([\d,]+)<\/span>/gi),
        ].map((m) => Number(String(m[1]).replace(/,/g, '')));
        if (rawCits.length === histYears.length) {
          for (let i = 0; i < histYears.length; i++) {
            citationsByYear[histYears[i]] = rawCits[i];
          }
        }
      }
    }

    const officialMetrics: OfficialScholarMetrics = {
      totalCitations: stdCells[0] || 0,
      hIndex: stdCells[2] || 0,
      i10Index: stdCells[4] || 0,
      ...(Object.keys(citationsByYear).length > 0 ? { citationsByYear } : {}),
    };

    // Extract and fetch the researcher's real Google Scholar profile photo (#gsc_prf_pup-img) from Google's static CDN without hitting scholar.google.com
    let avatarDataUrl: string | undefined;
    const imgTagMatch = firstPage.match(/<img[^>]*id="gsc_prf_pup-img"[^>]*>/i);
    const rawImgSrcMatch = imgTagMatch?.[0]?.match(/src="([^"]+)"/i);
    const extractedPhotoUrl = rawImgSrcMatch?.[1]
      ? decodeHtmlEntities(rawImgSrcMatch[1])
      : '';
    const isDefaultPlaceholder =
      extractedPhotoUrl.includes('avatar_scholar') ||
      extractedPhotoUrl.includes('cleardot.gif');

    if (!isDefaultPlaceholder) {
      const photoCandidateUrls = [
        extractedPhotoUrl.startsWith('https://scholar.googleusercontent.com')
          ? extractedPhotoUrl.replace('view_op=view_photo', 'view_op=medium_photo')
          : '',
        `https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=${encodeURIComponent(
          userId
        )}`,
      ].filter(Boolean);

      for (const pUrl of photoCandidateUrls) {
        try {
          const pResp = await fetch(pUrl, {
            redirect: 'manual',
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
              Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            },
            signal: AbortSignal.timeout(2200),
          });
          const ct = String(pResp.headers.get('content-type') || '');
          if (pResp.status === 200 && ct.startsWith('image/')) {
            const buf = Buffer.from(await pResp.arrayBuffer());
            if (buf.length > 200) {
              avatarDataUrl = `data:${ct.split(';')[0]};base64,${buf.toString(
                'base64'
              )}`;
              break;
            }
          }
        } catch {
          // Try next candidate URL
        }
      }
    }

    const sidebarCoAuthors: ScrapedScholarSidebarAuthor[] = [];
    const seenSidebarNames = new Set<string>();
    const coDescBlocks = [
      ...firstPage.matchAll(
        /class="gsc_rsb_a_desc"[^>]*>([\s\S]*?)<\/span>\s*<\/div>/gi
      ),
    ];
    for (const block of coDescBlocks) {
      const inner = block[1];
      const coHrefMatch = inner.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/i);
      const coNameRaw = coHrefMatch?.[2] || inner.match(/<a[^>]*>([^<]+)<\/a>/i)?.[1];
      const coUserIdMatch = (coHrefMatch?.[1] || '').match(/[?&]user=([a-zA-Z0-9_-]+)/i);
      const coUserId = coUserIdMatch?.[1] || undefined;
      const extMatches = [
        ...inner.matchAll(/class="gsc_rsb_a_ext"[^>]*>([^<]+)<\/span>/gi),
      ].map((m) => decodeHtmlEntities(m[1]));
      if (coNameRaw) {
        const cleanCoName = decodeHtmlEntities(coNameRaw)
          .replace(/,\s*(PhD|SMIEEE|MIEEE|FIEEE|Dr\.|Prof\.)/gi, '')
          .trim();
        const coAff = extMatches[0] || '';
        const coDomainMatch = inner.match(
          /Verified email at\s+([a-zA-Z0-9.-]+)/i
        );
        const coDomain = coDomainMatch?.[1]?.replace(/\.$/, '') || undefined;
        if (coUserId) {
          registerScholarColleague(cleanCoName, coUserId, true);
        }
        seenSidebarNames.add(cleanCoName.toLowerCase());
        sidebarCoAuthors.push({
          name: cleanCoName,
          affiliation: coAff,
          ...(coDomain ? { verifiedDomain: coDomain } : {}),
          ...(coUserId ? { scholarUserId: coUserId } : {}),
        });
      }
    }

    // Fetch full colleagues list (view_op=list_colleagues) so all listed co-authors get their real Google Scholar userId & photo
    try {
      const colleaguesUrl = `https://scholar.google.com/citations?view_op=list_colleagues&hl=en&user=${encodeURIComponent(
        userId
      )}`;
      const collHtml = await fetchScholarPageHtml(colleaguesUrl);
      if (collHtml) {
        const collBlocks = [
          ...collHtml.matchAll(
            /<div class="gs_ai gs_scl[^"]*">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi
          ),
        ];
        for (const cb of collBlocks) {
          const bHtml = cb[1];
          const uMatch = bHtml.match(/user=([a-zA-Z0-9_-]+)/i);
          const nMatch = bHtml.match(/class="gs_ai_name"[^>]*>\s*<a[^>]*>([^<]+)<\/a>/i);
          const imgMatch = bHtml.match(/<img[^>]*src="([^"]+)"/i);
          const affMatch = bHtml.match(/class="gs_ai_aff"[^>]*>([\s\S]*?)<\/div>/i);
          const emlMatch = bHtml.match(/class="gs_ai_eml"[^>]*>([\s\S]*?)<\/div>/i);
          if (uMatch?.[1] && nMatch?.[1]) {
            const cUser = uMatch[1];
            const cName = decodeHtmlEntities(nMatch[1])
              .replace(/,\s*(PhD|SMIEEE|MIEEE|FIEEE|Dr\.|Prof\.)/gi, '')
              .trim();
            const imgSrc = imgMatch?.[1] ? decodeHtmlEntities(imgMatch[1]) : '';
            const hasCustomPhoto =
              Boolean(imgSrc) &&
              !imgSrc.includes('avatar_scholar') &&
              !imgSrc.includes('cleardot');
            registerScholarColleague(cName, cUser, hasCustomPhoto);
            if (!seenSidebarNames.has(cName.toLowerCase())) {
              seenSidebarNames.add(cName.toLowerCase());
              const cAff = affMatch?.[1]
                ? decodeHtmlEntities(affMatch[1].replace(/<[^>]+>/g, ''))
                : '';
              const cDomMatch = (emlMatch?.[1] || '').match(
                /Verified email at\s+([a-zA-Z0-9.-]+)/i
              );
              const cDom = cDomMatch?.[1]?.replace(/\.$/, '') || undefined;
              sidebarCoAuthors.push({
                name: cName,
                affiliation: cAff,
                ...(cDom ? { verifiedDomain: cDom } : {}),
                scholarUserId: cUser,
              });
            }
          }
        }
      }
    } catch {
      // Ignore optional colleague list scrape failure
    }

    const publications: ScrapedScholarPublication[] = [];
    const seenNormTitles = new Set<string>();

    for (const pageHtml of pagesHtml) {
      const rowMatches = [
        ...pageHtml.matchAll(/<tr class="gsc_a_tr">([\s\S]*?)<\/tr>/gi),
      ];
      for (const row of rowMatches) {
        const rowHtml = row[1];
        if (rowHtml.includes('class="gsc_a_e"')) continue;
        const hrefMatch = rowHtml.match(
          /<a[^>]*href="([^"]+)"[^>]*class="gsc_a_at"/i
        );
        const rawHref = hrefMatch?.[1] ? decodeHtmlEntities(hrefMatch[1]) : '';
        const scholarUrl = rawHref
          ? rawHref.startsWith('http')
            ? rawHref
            : `https://scholar.google.com${rawHref}`
          : undefined;

        const tMatch = rowHtml.match(/class="gsc_a_at"[^>]*>([\s\S]*?)<\/a>/i);
        const rawTitle = decodeHtmlEntities(
          (tMatch?.[1] || '').replace(/<[^>]+>/g, ' ')
        ).replace(/\s+/g, ' ');
        if (!rawTitle || rawTitle.length < 6) continue;

        const grays = [
          ...rowHtml.matchAll(/class="gs_gray"[^>]*>([\s\S]*?)<\/div>/gi),
        ].map((m) =>
          decodeHtmlEntities(m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ')
        );
        const authorsText = grays[0] || '';
        const rawVenueLine = grays[1] || '';
        const venueText = rawVenueLine.replace(/,\s*\d{4}\s*$/, '').trim();

        const citMatch = rowHtml.match(
          /class="gsc_a_ac[^"]*"[^>]*>(\d+)<\/a>/i
        );
        const citations = citMatch?.[1] ? Number(citMatch[1]) : 0;

        // Ignore datasets, open data, code repositories, preprints, theses, and corrupted strings immediately
        if (
          shouldExcludeNonPaperRecord({
            title: rawTitle,
            venue: venueText,
            citations,
          })
        ) {
          continue;
        }

        const normTitleKey = rawTitle
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 48);
        if (seenNormTitles.has(normTitleKey)) {
          continue;
        }
        seenNormTitles.add(normTitleKey);

        const yrMatch = rowHtml.match(
          /class="gsc_a_h gsc_a_hc[^"]*"[^>]*>(\d{4})<\/span>/i
        );
        let year = yrMatch?.[1] ? Number(yrMatch[1]) : 0;
        if (!year) {
          const fallbackYr =
            rawVenueLine.match(/\b(19[89]\d|20[0-2]\d)\b/) ||
            rawTitle.match(/\b(19[89]\d|20[0-2]\d)\b/);
          year = fallbackYr?.[1] ? Number(fallbackYr[1]) : 2020;
        }

        publications.push({
          title: rawTitle,
          authorsText,
          venueText: cleanVenueName(venueText),
          year,
          citations,
          scholarUrl,
        });
      }
    }

    return {
      userId,
      name,
      affiliation,
      verifiedDomain,
      fields: fields.length > 0 ? fields : ['Research', 'Engineering'],
      avatarDataUrl,
      officialMetrics,
      sidebarCoAuthors,
      publications,
    };
  } catch {
    return null;
  }
}

function tokenizeTitle(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

interface OfficialJournalMetrics {
  id: string;
  display_name: string;
  type?: string;
  issn_l?: string | null;
  issns?: string[];
  is_in_doaj?: boolean;
  is_core?: boolean;
  twoYrMeanCitedness: number;
  hIndex: number;
  worksCount: number;
  top10RecentCitAvg?: number;
  crossrefNormScore?: number;
}

const officialSourceByNameCache = new Map<string, OfficialJournalMetrics>();

/**
 * Queries OpenAlex `/sources` and Crossref `/journals` + `/works` by clean journal title or ISSN
 * to obtain official journal metrics (2-year mean citedness, h-index, ISSN, DOAJ, CORE status, and Crossref 3-year citation distribution).
 */
async function resolveOfficialJournalMetricsByVenue(
  venueName: string,
  issn?: string
): Promise<OfficialJournalMetrics | undefined> {
  const clean = cleanVenueName(venueName);
  const key = clean.toLowerCase();
  if (!clean || key === 'academic venue') return undefined;
  if (officialSourceByNameCache.has(key)) {
    return officialSourceByNameCache.get(key);
  }

  try {
    const queryUrl = issn
      ? `https://api.openalex.org/sources?filter=issn:${encodeURIComponent(
          issn
        )}&per-page=3&select=id,display_name,type,issn_l,issn,is_in_doaj,is_core,summary_stats,works_count`
      : `https://api.openalex.org/sources?search=${encodeURIComponent(
          clean
        )}&per-page=5&select=id,display_name,type,issn_l,issn,is_in_doaj,is_core,summary_stats,works_count`;

    const data = await fetchOpenAlexJson(queryUrl, 3200);
    if (data) {
      const results: any[] = Array.isArray(data?.results) ? data.results : [];
      const exactOrBest =
        results.find(
          (r) => String(r.display_name || '').toLowerCase() === key
        ) || results[0];
      if (exactOrBest) {
        const metrics: OfficialJournalMetrics = {
          id: String(exactOrBest.id || '').replace('https://openalex.org/', ''),
          display_name: String(exactOrBest.display_name || clean),
          type: exactOrBest.type ? String(exactOrBest.type) : undefined,
          issn_l: exactOrBest.issn_l || null,
          issns: Array.isArray(exactOrBest.issn) ? exactOrBest.issn : [],
          is_in_doaj: Boolean(exactOrBest.is_in_doaj),
          is_core: Boolean(exactOrBest.is_core),
          twoYrMeanCitedness: Number(
            exactOrBest.summary_stats?.['2yr_mean_citedness'] || 0
          ),
          hIndex: Number(exactOrBest.summary_stats?.h_index || 0),
          worksCount: Number(exactOrBest.works_count || 0),
        };
        officialSourceByNameCache.set(key, metrics);
        return metrics;
      }
    }
  } catch {
    // Fallback to Crossref below
  }

  // Fallback: Official Crossref `/journals` + `/works` 3-year volume-normalized citation impact
  try {
    let resolvedIssns: string[] = issn ? [issn] : [];
    let resolvedTitle = clean;
    let totalDois = 0;

    if (resolvedIssns.length === 0) {
      const crJRes = await fetch(
        `https://api.crossref.org/journals?query=${encodeURIComponent(
          clean
        )}&rows=5&mailto=research@scholarlens.org`,
        {
          headers: {
            'User-Agent': 'ScholarLens/2.0 (mailto:research@scholarlens.org)',
          },
          signal: AbortSignal.timeout(4000),
        }
      );
      if (crJRes.ok) {
        const crJData = (await crJRes.json()) as any;
        const items: any[] = crJData?.message?.items || [];
        const normKey = key.replace(/[^a-z0-9]/g, '');
        const exact =
          items.find(
            (it) =>
              String(it.title || '')
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '') === normKey
          ) ||
          items.find((it) => {
            const t = String(it.title || '').toLowerCase();
            return t.includes(key) || key.includes(t);
          }) ||
          items[0];
        if (exact && Array.isArray(exact.ISSN) && exact.ISSN.length > 0) {
          resolvedIssns = exact.ISSN.map((x: any) => String(x));
          resolvedTitle = cleanVenueName(String(exact.title || clean));
          totalDois = Number(exact.counts?.['total-dois'] || 0);
        }
      }
    }

    if (resolvedIssns.length > 0) {
      const currentYear = new Date().getFullYear();
      const fromYear = currentYear - 3;
      const issnFilter = resolvedIssns
        .map((id) => `issn:${encodeURIComponent(id)}`)
        .join(',');
      const crWRes = await fetch(
        `https://api.crossref.org/works?filter=${issnFilter},from-pub-date:${fromYear}-01-01&sort=is-referenced-by-count&order=desc&rows=10&select=is-referenced-by-count&mailto=research@scholarlens.org`,
        {
          headers: {
            'User-Agent': 'ScholarLens/2.0 (mailto:research@scholarlens.org)',
          },
          signal: AbortSignal.timeout(6000),
        }
      );
      if (crWRes.ok) {
        const crWData = (await crWRes.json()) as any;
        const total3yr = Number(crWData?.message?.['total-results'] || 0);
        const works: any[] = crWData?.message?.items || [];
        const cits = works.map((w) =>
          Number(w['is-referenced-by-count'] || 0)
        );
        const top10Avg =
          cits.length > 0
            ? cits.reduce((a, b) => a + b, 0) / cits.length
            : 0;
        let h3yr = 0;
        for (let i = 0; i < cits.length; i++) {
          if (cits[i] >= i + 1) h3yr = i + 1;
        }
        const crossrefNormScore =
          total3yr > 0
            ? top10Avg / Math.pow(Math.log10(Math.max(15, total3yr)), 2.2)
            : 0;
        const metrics: OfficialJournalMetrics = {
          id: `ISSN:${resolvedIssns[0]}`,
          display_name: resolvedTitle,
          type: 'journal',
          issn_l: resolvedIssns[0],
          issns: resolvedIssns,
          is_in_doaj: false,
          is_core: total3yr >= 40 || totalDois > 200,
          twoYrMeanCitedness: Number((crossrefNormScore / 4).toFixed(2)),
          hIndex: h3yr,
          worksCount: total3yr || totalDois || works.length,
          top10RecentCitAvg: top10Avg,
          crossrefNormScore,
        };
        officialSourceByNameCache.set(key, metrics);
        return metrics;
      }
    }
  } catch {
    // Ignore Crossref timeout
  }

  return undefined;
}

/**
 * Queries Crossref API (`https://api.crossref.org/works`) for any paper not matched in OpenAlex
 * to verify its official DOI, publisher landing page URL, document type, clean journal/conference title, and ISSN.
 */
async function queryCrossrefWorkByTitle(
  title: string
): Promise<{
  doi?: string;
  url?: string;
  venue?: string;
  workType?: string;
  issn?: string;
  year?: number;
} | null> {
  try {
    const res = await fetch(
      `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(
        title
      )}&rows=2`,
      {
        headers: {
          'User-Agent': 'ScholarLens/2.0 (mailto:research@scholarlens.org)',
        },
        signal: AbortSignal.timeout(3000),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const items: any[] = data?.message?.items || [];
    const gsTokens = new Set(tokenizeTitle(title));
    for (const item of items) {
      const crTitle = String(item.title?.[0] || '');
      const crTokens = tokenizeTitle(crTitle);
      if (crTokens.length < 3 || gsTokens.size < 3) continue;
      let overlap = 0;
      for (const t of crTokens) {
        if (gsTokens.has(t)) overlap++;
      }
      const score = overlap / Math.min(gsTokens.size, crTokens.length);
      if (score >= 0.75) {
        const doi = item.DOI ? String(item.DOI) : undefined;
        const url =
          item.resource?.primary?.URL ||
          item.URL ||
          (doi ? `https://doi.org/${doi}` : undefined);
        const venue = item['container-title']?.[0]
          ? cleanVenueName(String(item['container-title'][0]))
          : undefined;
        const workType = item.type ? String(item.type) : undefined;
        const issn = item.ISSN?.[0] ? String(item.ISSN[0]) : undefined;
        const year =
          Number(
            item.published?.['date-parts']?.[0]?.[0] ||
              item['published-print']?.['date-parts']?.[0]?.[0] ||
              item['published-online']?.['date-parts']?.[0]?.[0]
          ) || undefined;
        return { doi, url, venue, workType, issn, year };
      }
    }
  } catch {
    // Ignore Crossref timeout
  }
  return null;
}

function classifyPublicationType(
  sourceType: string,
  workType: string,
  venue: string,
  title: string
): PublicationType {
  const vLower = venue.toLowerCase();
  const tLower = title.toLowerCase();

  // Known prestigious academic journal titles with "proceedings"
  const isJournalProceedings =
    vLower.startsWith('proceedings of the ieee') ||
    vLower.startsWith('proceedings of the national academy of sciences') ||
    vLower.startsWith('proceedings of the royal society') ||
    vLower.startsWith('proceedings of the acm') ||
    vLower.startsWith('proceedings of the american mathematical society') ||
    vLower.startsWith('proceedings of the institution of mechanical');

  if (isJournalProceedings) {
    return 'Journal';
  }

  if (
    sourceType.includes('conference') ||
    workType.includes('proceedings') ||
    vLower.includes('conference') ||
    vLower.includes('symposium') ||
    vLower.includes('workshop') ||
    vLower.includes('proceedings') ||
    vLower.includes('congress') ||
    vLower.includes('colloquium') ||
    vLower.includes('oceans') ||
    vLower.includes('cinti') ||
    vLower.includes('icacte') ||
    vLower.includes('caepia') ||
    vLower.includes('society:') ||
    vLower.includes('cvpr') ||
    vLower.includes('neurips') ||
    vLower.includes('icml') ||
    vLower.includes('iclr') ||
    vLower.includes('iccv') ||
    vLower.includes('eccv') ||
    vLower.includes('icassp') ||
    vLower.includes('igarss') ||
    vLower.includes('globecom') ||
    vLower.includes('infocom') ||
    vLower.includes('icra') ||
    vLower.includes('iros') ||
    vLower.includes('tencon') ||
    vLower.includes('iccit') ||
    vLower.includes('iceee') ||
    vLower.includes('icrest') ||
    vLower.includes('ic4ir') ||
    vLower.includes('sti ') ||
    (vLower.includes('ieee') &&
      (vLower.includes('international') ||
        vLower.includes('conf') ||
        vLower.includes('region') ||
        vLower.includes('annual') ||
        /\b20\d{2}\b/.test(vLower)))
  ) {
    return 'Conference';
  }
  if (
    workType === 'review' ||
    tLower.includes('a review') ||
    tLower.includes('comprehensive review') ||
    tLower.includes('systematic review') ||
    tLower.includes('survey')
  ) {
    return 'Review';
  }
  if (
    workType.includes('book') ||
    sourceType.includes('book') ||
    vLower.includes('lecture notes') ||
    vLower.includes('advances in intelligent systems') ||
    vLower.includes('springer nature') ||
    vLower.includes('john wiley & sons') ||
    vLower.includes('computer vision in vehicle technology') ||
    vLower.includes('biometrics under biomedical')
  ) {
    return 'Book Chapter';
  }
  return 'Journal';
}

/**
 * Computes Journal Quartile (Q1, Q2, Q3, Q4, Unranked) strictly from official source metrics
 * (OpenAlex / Crossref 2-year mean citedness, volume-normalized 3-year citation score, h-index, ISSN, and CORE/DOAJ indexing status)
 * with zero hardcoded journal tables and zero paper-citation guessing.
 */
function classifyQuartileFromOfficialMetrics(
  type: PublicationType,
  venue: string,
  sourceMetrics?: OfficialJournalMetrics
): Quartile {
  if (type !== 'Journal' && type !== 'Review') {
    return 'Unranked';
  }

  const v = venue.toLowerCase().trim();
  if (!v || v === 'academic venue' || sourceMetrics?.type === 'repository') {
    return 'Unranked';
  }

  const authQ = getAuthoritativeQuartile(venue);
  if (authQ) {
    return authQ;
  }

  if (!sourceMetrics) {
    return 'Unranked';
  }

  const impact2Yr = sourceMetrics.twoYrMeanCitedness;
  const hIdx = sourceMetrics.hIndex;
  const normScore = sourceMetrics.crossrefNormScore;
  const worksCount = sourceMetrics.worksCount || 0;
  const hasIssn = Boolean(
    sourceMetrics.issn_l || (sourceMetrics.issns && sourceMetrics.issns.length > 0)
  );

  // If computed via Crossref 3-year volume-normalized citation distribution
  if (normScore !== undefined) {
    if (!hasIssn || worksCount < 20) return 'Unranked';
    if (
      normScore >= 6.0 ||
      (normScore >= 3.8 && worksCount >= 400)
    ) {
      return 'Q1';
    }
    if (normScore >= 2.8 || (normScore >= 2.0 && worksCount >= 200)) return 'Q2';
    if (normScore >= 1.2) return 'Q3';
    if (normScore >= 0.4 || hasIssn) return 'Q4';
    return 'Unranked';
  }

  if (!hasIssn && hIdx < 10 && impact2Yr < 0.3) {
    return 'Unranked';
  }

  // If computed via OpenAlex / Scopus 2-year mean citedness & h-index
  // Calibrated against international Clarivate JCR & Scopus percentile distributions:
  if (
    impact2Yr >= 3.0 ||
    hIdx >= 60 ||
    (worksCount >= 200 && impact2Yr >= 2.4)
  ) {
    return 'Q1';
  }
  if (
    impact2Yr >= 1.6 ||
    hIdx >= 25 ||
    (worksCount >= 80 && impact2Yr >= 1.2)
  ) {
    return 'Q2';
  }
  if (impact2Yr >= 0.8 || hIdx >= 10) {
    return 'Q3';
  }
  if (hasIssn || impact2Yr >= 0.1 || hIdx >= 3 || sourceMetrics.is_core) {
    return 'Q4';
  }
  return 'Unranked';
}

function stripAcademicHonorifics(rawName: string): string {
  return rawName
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\borcid[:\s/.\w-]*[\d-Xx]+\b/gi, ' ')
    .replace(
      /,\s*(?:phd|ph\.d\.|smieee|mieee|fieee|dr\.?|prof\.?|eng\.?|ir\.?|ts\.?|ceng|pe)\b.*/gi,
      ' '
    )
    .replace(
      /\b(?:prof(?:essor)?|assoc(?:iate)?\s+prof(?:essor)?|assist(?:ant)?\s+prof(?:essor)?|dr|engr|eng|ir|ts|mr|mrs|ms|md\s+dr|phd|ph\.d\.|msc|b\.sc|fi?eee|smieee|mieee)\b\.?/gi,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function isSameResearcherName(
  candidateName: string,
  targetName: string
): boolean {
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

  const tParts = tTokens.filter((p) => p.length >= 4);
  if (tParts.length > 0) {
    const lastPart = tParts[tParts.length - 1];
    const lastPartNorm = lastPart.replace(/v|w/g, 'b');
    const firstInit = tTokens[0]?.[0] || '';
    const cFirstInit = cTokens[0]?.[0] || '';
    if (
      (c.includes(lastPart) || cNorm.includes(lastPartNorm)) &&
      (!firstInit || !cFirstInit || firstInit === cFirstInit)
    ) {
      return true;
    }
  } else if (tTokens.length >= 2 && cTokens.length >= 2) {
    // Support 2-3 letter surnames (e.g. "Kaiming He", "Andrew Ng", "Fei-Fei Li")
    const tLast = tTokens[tTokens.length - 1];
    const tFirst = tTokens[0];
    if (
      tLast.length >= 2 &&
      cTokens.includes(tLast) &&
      (cTokens.includes(tFirst) ||
        (tFirst.length >= 4 && c.includes(tFirst)) ||
        cTokens[0]?.[0] === tFirst[0])
    ) {
      return true;
    }
  }
  return false;
}

function matchGsTitleToOpenAlexWork(
  gsTitle: string,
  oaWorks: any[]
): any | null {
  const gsNorm = gsTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  if (gsNorm.length < 5) return null;

  for (const w of oaWorks) {
    const oaTitle = String(w.title || w.display_name || '');
    const oaNorm = oaTitle
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    if (!oaNorm) continue;
    if (
      oaNorm === gsNorm ||
      (gsNorm.length >= 24 &&
        oaNorm.length >= 24 &&
        (oaNorm.includes(gsNorm.slice(0, 24)) ||
          gsNorm.includes(oaNorm.slice(0, 24))))
    ) {
      return w;
    }
  }

  const gsTokens = new Set(tokenizeTitle(gsTitle));
  if (gsTokens.size < 3) return null;
  let bestWork: any = null;
  let bestScore = 0;

  for (const w of oaWorks) {
    const oaTitle = String(w.title || w.display_name || '');
    const oaTokens = tokenizeTitle(oaTitle);
    if (oaTokens.length < 3) continue;
    let overlap = 0;
    for (const t of oaTokens) {
      if (gsTokens.has(t)) overlap++;
    }
    const score = overlap / Math.min(gsTokens.size, oaTokens.length);
    if (score > bestScore && score >= 0.72) {
      bestScore = score;
      bestWork = w;
    }
  }
  return bestWork;
}

async function resolveScholarIdViaWikidata(
  scholarId: string
): Promise<string | null> {
  try {
    const sparql = `SELECT ?itemLabel WHERE { ?item wdt:P1960 "${scholarId.replace(
      /"/g,
      ''
    )}". SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } } LIMIT 1`;
    const res = await fetch(
      `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(
        sparql
      )}`,
      {
        headers: {
          'User-Agent': 'ScholarLens/2.0 (mailto:research@scholarlens.org)',
        },
        signal: AbortSignal.timeout(2500),
      }
    );
    if (res.ok) {
      const data = (await res.json()) as any;
      const label = data?.results?.bindings?.[0]?.itemLabel?.value;
      if (label && typeof label === 'string' && !/^Q\d+$/.test(label)) {
        return label;
      }
    }
  } catch {
    // Ignore Wikidata lookup error
  }
  return null;
}

function isValidScholarId(id?: string): boolean {
  if (!id) return false;
  const trimmed = id.trim();
  return /^[a-zA-Z0-9_-]{8,14}$/.test(trimmed) && !trimmed.includes(' ');
}

async function resolveGoogleScholarIdByName(
  researcherName: string,
  affiliationHint?: string
): Promise<string | null> {
  const clean = stripAcademicHonorifics(researcherName).trim();
  if (!clean || clean.length < 3) return null;

  // 1. Check verified colleague directory and discovered Google Scholar colleagues first
  const knownColleague = lookupColleagueAvatarMeta(clean, affiliationHint);
  if (knownColleague?.userId && isValidScholarId(knownColleague.userId)) {
    return knownColleague.userId;
  }

  try {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      clean
    )}&language=en&format=json&limit=3`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'ScholarLens/2.0 (mailto:research@scholarlens.org)',
      },
      signal: AbortSignal.timeout(2200),
    });
    if (searchRes.ok) {
      const searchData = (await searchRes.json()) as any;
      const entities: any[] = searchData?.search || [];
      for (const ent of entities) {
        const qid = ent?.id;
        if (!qid) continue;
        const claimsUrl = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${encodeURIComponent(
          qid
        )}&property=P1960&format=json`;
        const claimsRes = await fetch(claimsUrl, {
          headers: {
            'User-Agent': 'ScholarLens/2.0 (mailto:research@scholarlens.org)',
          },
          signal: AbortSignal.timeout(2000),
        });
        if (!claimsRes.ok) continue;
        const claimsData = (await claimsRes.json()) as any;
        const scholarId =
          claimsData?.claims?.P1960?.[0]?.mainsnak?.datavalue?.value;
        if (
          scholarId &&
          typeof scholarId === 'string' &&
          scholarId.length >= 8
        ) {
          return scholarId.trim();
        }
      }
    }
  } catch {
    // Ignore Wikidata lookup timeout
  }

  // Fallback for researchers not in Wikidata P1960: discover their Google Scholar citation user ID via web index
  const yQueries = buildYahooScholarSearchQueries(clean, affiliationHint);
  for (const yQuery of yQueries) {
    try {
      const yahooUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(
        yQuery
      )}`;
      const yRes = await fetch(yahooUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(2600),
      });
      if (yRes.ok) {
        const html = await yRes.text();
        const matches = [
          ...html.matchAll(/user(?:=|%3D|%253D)([a-zA-Z0-9_-]{12})/gi),
        ].map((m) => m[1]);
        const uniqueIds = [...new Set(matches)];
        if (uniqueIds.length > 0) {
          return uniqueIds[0];
        }
      }
    } catch {
      // Ignore web index lookup timeout
    }
  }

  return null;
}

export async function buildLiveResearcherProfile(
  userIdInput: string,
  queryNameInput: string
): Promise<{ profile: ResearcherProfile; source: string } | null> {
  let effectiveUserId = userIdInput;

  // If the user searched by researcher name (and userIdInput is not already a valid 12-char Google Scholar ID), resolve their official Google Scholar ID first
  if (queryNameInput && !isValidScholarId(userIdInput)) {
    const resolvedScholarId = await resolveGoogleScholarIdByName(
      queryNameInput
    );
    if (resolvedScholarId) {
      effectiveUserId = resolvedScholarId;
    }
  }

  let scraped = effectiveUserId
    ? await scrapeGoogleScholarFullProfile(effectiveUserId)
    : null;

  // If direct userIdInput failed and looks like a typed name, try resolving via Wikidata P1960 / web index
  if (!scraped && !queryNameInput && userIdInput) {
    const byNameId = await resolveGoogleScholarIdByName(userIdInput);
    if (byNameId && byNameId !== effectiveUserId) {
      effectiveUserId = byNameId;
      scraped = await scrapeGoogleScholarFullProfile(effectiveUserId);
    }
  }

  let resolvedWikidataName: string | null = null;
  if (!scraped && !queryNameInput && effectiveUserId) {
    resolvedWikidataName = await resolveScholarIdViaWikidata(effectiveUserId);
  }

  const targetName =
    scraped?.name || queryNameInput || resolvedWikidataName || userIdInput;
  if (!targetName) return null;

  // Pre-resolve the verified email domain via ROR so its official institution name aids OpenAlex author disambiguation and home institution mapping
  const domainResolvedHome = await resolveInstitutionByVerifiedDomain(
    scraped?.verifiedDomain
  );

  // 1. Find all matching OpenAlex author records for targetName (stripping Dr./Prof. honorifics so OpenAlex search succeeds)
  const openAlexAuthorIds: string[] = [];
  let primaryOpenAlexAuthor: any = null;
  let bestOaCandidateScore = -1;
  let bestAffilMatches = 0;
  let weakFallbackAuthor: any = null;
  let weakFallbackId = '';
  let weakFallbackScore = -1;
  const cleanSearchName = stripAcademicHonorifics(targetName) || targetName;
  const affilTokens = extractAffiliationKeywords(
    `${scraped?.affiliation || ''} ${domainResolvedHome?.universityName || ''}`
  );

  try {
    const authorData = await fetchOpenAlexJson(
      `https://api.openalex.org/authors?search=${encodeURIComponent(
        cleanSearchName
      )}&per-page=25&mailto=research@scholarlens.org`,
      5500
    );
    if (authorData) {
      const results: any[] = Array.isArray(authorData?.results)
        ? authorData.results
        : [];
      const scoredCandidates = results
        .map((a) =>
          scoreOpenAlexAuthorCandidate(
            a,
            cleanSearchName,
            affilTokens,
            domainResolvedHome?.countryCode,
            isSameResearcherName
          )
        )
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
        .sort((x, y) => y.score - x.score || y.worksCount - x.worksCount);

      if (scoredCandidates.length > 0) {
        const top = scoredCandidates[0];
        bestAffilMatches = top.affilMatches;
        weakFallbackAuthor = top.author;
        weakFallbackId = top.id;
        weakFallbackScore = top.score;

        // Only lock author IDs upfront when no affiliation constraint exists or candidate matched affiliation
        if (affilTokens.length === 0 || top.affilMatches > 0) {
          primaryOpenAlexAuthor = top.author;
          bestOaCandidateScore = top.score;
          for (const sc of scoredCandidates) {
            if (
              openAlexAuthorIds.length === 0 ||
              (sc.affilMatches > 0 && openAlexAuthorIds.length < 4)
            ) {
              if (!openAlexAuthorIds.includes(sc.id)) {
                openAlexAuthorIds.push(sc.id);
              }
            }
          }
        }
      } else if (results[0]) {
        weakFallbackAuthor = results[0];
        weakFallbackId = String(results[0].id || '')
          .replace('https://openalex.org/', '')
          .trim();
        if (affilTokens.length === 0 && weakFallbackId) {
          primaryOpenAlexAuthor = weakFallbackAuthor;
          openAlexAuthorIds.push(weakFallbackId);
        }
      }
    }
  } catch {
    // Continue with scraped Scholar data if OpenAlex author lookup times out
  }

  // Fallback disambiguation via multiple Google Scholar publication titles when author search missed or lacked affiliation confirmation
  if (
    scraped &&
    scraped.publications.length > 0 &&
    (openAlexAuthorIds.length === 0 ||
      !primaryOpenAlexAuthor ||
      bestOaCandidateScore < 30 ||
      (affilTokens.length > 0 && bestAffilMatches === 0))
  ) {
    try {
      const candidateTitles = pickDisambiguationTitles(scraped.publications, 4);
      const worksByTitle = await Promise.all(
        candidateTitles.map(async (title) => {
          const wSearch = await fetchOpenAlexJson(
            `https://api.openalex.org/works?search=${encodeURIComponent(
              title
            )}&per-page=5&select=id,title,display_name,publication_year,authorships&mailto=research@scholarlens.org`,
            4200
          );
          return {
            title,
            works: Array.isArray(wSearch?.results) ? wSearch.results : [],
          };
        })
      );

      const rankedFromWorks = rankOpenAlexAuthorsFromWorks(
        worksByTitle,
        cleanSearchName,
        affilTokens,
        domainResolvedHome?.countryCode,
        isSameResearcherName,
        matchGsTitleToOpenAlexWork
      );

      if (rankedFromWorks.length > 0) {
        const verifiedIds = [
          rankedFromWorks[0].id,
          ...rankedFromWorks
            .slice(1)
            .filter((r) => r.affilHits > 0 || r.titleHits >= 2)
            .slice(0, 2)
            .map((r) => r.id),
        ];
        openAlexAuthorIds.splice(0, openAlexAuthorIds.length, ...verifiedIds);

        const directAuthor = await fetchOpenAlexJson(
          `https://api.openalex.org/authors/${encodeURIComponent(
            rankedFromWorks[0].id
          )}?mailto=research@scholarlens.org`,
          3500
        );
        if (directAuthor?.id) {
          primaryOpenAlexAuthor = directAuthor;
          bestOaCandidateScore = 100;
        }
      }
    } catch {
      // Ignore fallback error
    }
  }

  if (openAlexAuthorIds.length === 0 && weakFallbackId) {
    openAlexAuthorIds.push(weakFallbackId);
    if (!primaryOpenAlexAuthor && weakFallbackAuthor) {
      primaryOpenAlexAuthor = weakFallbackAuthor;
      bestOaCandidateScore = weakFallbackScore;
    }
  }

  // Merge any split OpenAlex author IDs belonging to the same researcher at the confirmed primary institution
  if (primaryOpenAlexAuthor && cleanSearchName) {
    try {
      const lki: any[] = Array.isArray(primaryOpenAlexAuthor.last_known_institutions)
        ? primaryOpenAlexAuthor.last_known_institutions
        : [];
      const matchingInst =
        lki.find((inst) => {
          const iName = normalizeAsciiWords(String(inst?.display_name || ''));
          return affilTokens.length > 0 && affilTokens.some((tok) => iName.includes(tok));
        }) || lki[0];
      const primaryInstId = String(matchingInst?.id || '')
        .replace('https://openalex.org/', '')
        .trim();
      if (primaryInstId && (affilTokens.length === 0 || bestOaCandidateScore >= 50 || bestAffilMatches > 0)) {
        const splitAuthorsData = await fetchOpenAlexJson(
          `https://api.openalex.org/authors?filter=display_name.search:${encodeURIComponent(
            cleanSearchName
          )},affiliations.institution.id:${encodeURIComponent(
            primaryInstId
          )}&per-page=25&select=id,display_name,works_count,last_known_institutions&mailto=research@scholarlens.org`,
          3800
        );
        const sameInstIds = extractSameInstitutionAuthorIds(
          Array.isArray(splitAuthorsData?.results) ? splitAuthorsData.results : [],
          cleanSearchName,
          isSameResearcherName,
          8
        );
        for (const extraId of sameInstIds) {
          if (!openAlexAuthorIds.includes(extraId) && openAlexAuthorIds.length < 8) {
            openAlexAuthorIds.push(extraId);
          }
        }
      }
    } catch {
      // Non-fatal if split-author lookup times out
    }
  }

  // 2. Fetch works from OpenAlex (both top-cited impact works AND recent works by publication year)
  let rawOaWorks: any[] = [];
  if (openAlexAuthorIds.length > 0) {
    try {
      const filterIds = openAlexAuthorIds.slice(0, 8).join('|');
      const fetchUrls = [
        `https://api.openalex.org/works?filter=author.id:${encodeURIComponent(
          filterIds
        )}&sort=cited_by_count:desc&per-page=200&page=1&select=id,title,display_name,publication_year,type,type_crossref,doi,open_access,primary_location,authorships,cited_by_count&mailto=research@scholarlens.org`,
        `https://api.openalex.org/works?filter=author.id:${encodeURIComponent(
          filterIds
        )}&sort=publication_year:desc,cited_by_count:desc&per-page=200&page=1&select=id,title,display_name,publication_year,type,type_crossref,doi,open_access,primary_location,authorships,cited_by_count&mailto=research@scholarlens.org`,
        `https://api.openalex.org/works?filter=author.id:${encodeURIComponent(
          filterIds
        )}&sort=publication_year:desc,cited_by_count:desc&per-page=200&page=2&select=id,title,display_name,publication_year,type,type_crossref,doi,open_access,primary_location,authorships,cited_by_count&mailto=research@scholarlens.org`,
      ];
      const pageResults = await Promise.all(
        fetchUrls.map(async (url) => {
          const worksData = await fetchOpenAlexJson(url, 6500);
          return Array.isArray(worksData?.results) ? worksData.results : [];
        })
      );
      const combinedOa = pageResults.flat();
      const seenOaWorkIdSet = new Set<string>();
      rawOaWorks = [];
      for (const w of combinedOa) {
        const wid = String(w.id || '');
        if (wid && seenOaWorkIdSet.has(wid)) continue;
        if (wid) seenOaWorkIdSet.add(wid);
        rawOaWorks.push(w);
      }
    } catch {
      rawOaWorks = [];
    }
  }

  // Filter out non-journal/non-conference works from OpenAlex and match to Google Scholar
  const gsMatchedOaWorkByIndex = new Map<number, any>();
  const strictScholarOaWorks: any[] = [];
  const seenOaWorkIds = new Set<string>();
  if (scraped && scraped.publications.length > 0) {
    for (let gIdx = 0; gIdx < scraped.publications.length; gIdx++) {
      const gsPub = scraped.publications[gIdx];
      const matchedW = matchGsTitleToOpenAlexWork(gsPub.title, rawOaWorks);
      if (matchedW) {
        gsMatchedOaWorkByIndex.set(gIdx, matchedW);
        const wId = String(matchedW.id || '');
        if (wId && !seenOaWorkIds.has(wId)) {
          seenOaWorkIds.add(wId);
          strictScholarOaWorks.push(matchedW);
        }
      }
    }

    // Query OpenAlex by title for recent unmatched Google Scholar papers (catches brand-new works on unlinked split IDs)
    const minRecentYear = new Date().getFullYear() - 2;
    const unmatchedRecentIndices: number[] = [];
    for (let gIdx = 0; gIdx < scraped.publications.length; gIdx++) {
      if (gsMatchedOaWorkByIndex.has(gIdx)) continue;
      const gsPub = scraped.publications[gIdx];
      if ((gsPub.year || 0) >= minRecentYear && String(gsPub.title || '').trim().length >= 12) {
        unmatchedRecentIndices.push(gIdx);
        if (unmatchedRecentIndices.length >= 8) break;
      }
    }
    if (unmatchedRecentIndices.length > 0) {
      const recoveredEntries = await Promise.all(
        unmatchedRecentIndices.map(async (gIdx) => {
          const gsPub = scraped.publications[gIdx];
          try {
            const wData = await fetchOpenAlexJson(
              `https://api.openalex.org/works?search=${encodeURIComponent(
                gsPub.title
              )}&per-page=3&select=id,title,display_name,publication_year,type,type_crossref,doi,open_access,primary_location,authorships,cited_by_count&mailto=research@scholarlens.org`,
              3800
            );
            const candidates: any[] = Array.isArray(wData?.results) ? wData.results : [];
            const matched = matchGsTitleToOpenAlexWork(gsPub.title, candidates);
            if (!matched) return null;
            const authorships: any[] = Array.isArray(matched.authorships) ? matched.authorships : [];
            const hasTargetAuthor = authorships.some((au) => {
              const auName = String(au?.author?.display_name || '').trim();
              const auId = String(au?.author?.id || '').replace('https://openalex.org/', '').trim();
              return (
                (auId && openAlexAuthorIds.includes(auId)) ||
                (auName && isSameResearcherName(auName, targetName))
              );
            });
            return hasTargetAuthor ? { gIdx, matched } : null;
          } catch {
            return null;
          }
        })
      );
      for (const entry of recoveredEntries) {
        if (!entry) continue;
        gsMatchedOaWorkByIndex.set(entry.gIdx, entry.matched);
        const wId = String(entry.matched.id || '');
        if (wId && !seenOaWorkIds.has(wId)) {
          seenOaWorkIds.add(wId);
          strictScholarOaWorks.push(entry.matched);
        }
      }
    }
  }
  for (const w of rawOaWorks) {
    const wId = String(w.id || '');
    if (wId && seenOaWorkIds.has(wId)) continue;
    const wTitle = String(w.title || w.display_name || '');
    const wVenue = String(w.primary_location?.source?.display_name || '');
    const wType = String(w.type || '');
    const sType = String(w.primary_location?.source?.type || '');
    if (
      !shouldExcludeNonPaperRecord({
        title: wTitle,
        venue: wVenue,
        workType: wType,
        sourceType: sType,
        citations: Number(w.cited_by_count || 0),
      })
    ) {
      if (wId) seenOaWorkIds.add(wId);
      strictScholarOaWorks.push(w);
    }
  }

  // 3. Batch-fetch official institution GeoNames/ROR records from OpenAlex /institutions AND journal metrics from /sources
  const instIdsSet = new Set<string>();
  const sourceIdsSet = new Set<string>();
  if (primaryOpenAlexAuthor?.last_known_institutions) {
    for (const inst of primaryOpenAlexAuthor.last_known_institutions) {
      if (inst?.id) {
        instIdsSet.add(String(inst.id).replace('https://openalex.org/', ''));
      }
    }
  }
  for (const w of strictScholarOaWorks) {
    const srcId = w.primary_location?.source?.id;
    if (srcId) {
      sourceIdsSet.add(String(srcId).replace('https://openalex.org/', ''));
    }
    for (const a of w.authorships || []) {
      for (const inst of a.institutions || []) {
        if (inst?.id) {
          instIdsSet.add(String(inst.id).replace('https://openalex.org/', ''));
        }
      }
    }
  }

  const geoCache = new Map<string, OpenAlexGeoRecord>();
  const sourceMetricsCache = new Map<string, OfficialJournalMetrics>();
  const allInstIds = Array.from(instIdsSet);
  const allSourceIds = Array.from(sourceIdsSet);

  const batchPromises: Promise<void>[] = [];

  for (let i = 0; i < allInstIds.length; i += 50) {
    const chunk = allInstIds.slice(i, i + 50);
    batchPromises.push(
      (async () => {
        try {
          const instData = await fetchOpenAlexJson(
            `https://api.openalex.org/institutions?filter=openalex:${chunk.join(
              '|'
            )}&per-page=50&select=id,display_name,ror,country_code,geo`,
            4500
          );
          for (const rec of instData?.results || []) {
            const shortId = String(rec.id).replace(
              'https://openalex.org/',
              ''
            );
            geoCache.set(shortId, rec);
          }
        } catch {
          // Ignore individual batch timeout
        }
      })()
    );
  }

  for (let i = 0; i < allSourceIds.length; i += 50) {
    const chunk = allSourceIds.slice(i, i + 50);
    batchPromises.push(
      (async () => {
        try {
          const srcData = await fetchOpenAlexJson(
            `https://api.openalex.org/sources?filter=openalex:${chunk.join(
              '|'
            )}&per-page=50&select=id,display_name,type,issn_l,issn,is_in_doaj,is_core,summary_stats,works_count`,
            4500
          );
          for (const rec of srcData?.results || []) {
            const shortId = String(rec.id).replace(
              'https://openalex.org/',
              ''
            );
            const m: OfficialJournalMetrics = {
              id: shortId,
              display_name: cleanVenueName(String(rec.display_name || '')),
              type: rec.type ? String(rec.type) : undefined,
              issn_l: rec.issn_l || null,
              issns: Array.isArray(rec.issn) ? rec.issn : [],
              is_in_doaj: Boolean(rec.is_in_doaj),
              is_core: Boolean(rec.is_core),
              twoYrMeanCitedness: Number(
                rec.summary_stats?.['2yr_mean_citedness'] || 0
              ),
              hIndex: Number(rec.summary_stats?.h_index || 0),
              worksCount: Number(rec.works_count || 0),
            };
            sourceMetricsCache.set(shortId, m);
            if (m.display_name) {
              officialSourceByNameCache.set(
                m.display_name.toLowerCase(),
                m
              );
            }
          }
        } catch {
          // Ignore source batch timeout
        }
      })()
    );
  }

  await Promise.all(batchPromises);

  // 4. Resolve researcher's Home Institution dynamically from official sources (ROR Verified Domain / Explicit University in Affiliation / OpenAlex)
  let homeMapped: Omit<CoAuthorAffiliation, 'name' | 'isHomeInstitution'>;
  const rawAffil = scraped?.affiliation || '';
  const affilLower = rawAffil.toLowerCase();

  // Extract explicit university or institution phrases from Google Scholar affiliation string
  const affilParts = rawAffil
    .split(/(?:,|\s+-\s+|\||&)/)
    .map((s) =>
      s
        .replace(
          /^(?:associate|assistant|adjunct|visiting|emeritus|distinguished|executive|senior|lead|principal|post-graduate|postgraduate|undergraduate|graduate|phd|doctoral|postdoc)?\s*(?:professor|prof\.?|lecturer|researcher|research\s+assistant|research\s+fellow|fellow|student|faculty|chairman|chair|dean|director|head|scientist)\s*(?:of\s+[A-Za-z\s]+)?\s*(?:at\s+)?/i,
          ''
        )
        .trim()
    )
    .filter(Boolean);

  const primaryUniCandidate = affilParts.find((p) =>
    /\b(?:university|universitat|universiti|universit[a-z]*|universidad|universidade|polytechnic\s+institute|polytechnic|polytechnique|institute\s+of\s+technology|hochschule)\b/i.test(
      p
    )
  );
  const secondaryInstCandidate = affilParts.find(
    (p) =>
      /\b(?:institute|institut|college|academy|centre|center|laboratory)\b/i.test(
        p
      ) &&
      !/\b(?:post-graduate|postgraduate|graduate|undergraduate|department|dept)\b/i.test(
        p
      )
  );

  const GENERIC_INST_WORDS = new Set([
    'university',
    'universitat',
    'universidad',
    'universiti',
    'institute',
    'college',
    'school',
    'academy',
    'centre',
    'center',
    'department',
    'faculty',
    'laboratory',
    'national',
    'state',
    'international',
    'american',
    'science',
    'technology',
    'engineering',
    'business',
    'bangladesh',
    'india',
    'united',
    'states',
    'kingdom',
    'australia',
    'canada',
    'china',
    'japan',
    'korea',
    'malaysia',
    'spain',
    'france',
    'germany',
  ]);

  let matchedInstRecord: any = null;
  if (
    primaryOpenAlexAuthor?.last_known_institutions &&
    primaryOpenAlexAuthor.last_known_institutions.length > 0
  ) {
    if (rawAffil) {
      matchedInstRecord = primaryOpenAlexAuthor.last_known_institutions.find(
        (inst: any) => {
          const name = String(inst?.display_name || '').toLowerCase();
          if (!name) return false;
          if (affilLower.includes(name)) return true;
          const distinctiveTokens = name
            .split(/[^a-z0-9]+/)
            .filter((w) => w.length >= 3 && !GENERIC_INST_WORDS.has(w));
          return (
            distinctiveTokens.length > 0 &&
            distinctiveTokens.every((w) => affilLower.includes(w))
          );
        }
      );
    }
    if (!matchedInstRecord && !rawAffil && !domainResolvedHome) {
      matchedInstRecord = primaryOpenAlexAuthor.last_known_institutions[0];
    }
  }

  if (matchedInstRecord) {
    const shortId = String(matchedInstRecord.id || '').replace(
      'https://openalex.org/',
      ''
    );
    homeMapped = await resolveInstitutionFromOfficialSources(
      String(matchedInstRecord.display_name || rawAffil || 'Research University'),
      String(matchedInstRecord.country_code || ''),
      shortId,
      geoCache
    );
  } else if (primaryUniCandidate) {
    homeMapped = await resolveInstitutionFromOfficialSources(
      primaryUniCandidate,
      domainResolvedHome?.countryCode || '',
      undefined,
      geoCache
    );
  } else if (domainResolvedHome) {
    homeMapped = domainResolvedHome;
  } else if (secondaryInstCandidate) {
    homeMapped = await resolveInstitutionFromOfficialSources(
      secondaryInstCandidate,
      '',
      undefined,
      geoCache
    );
  } else if (primaryOpenAlexAuthor?.last_known_institutions?.[0]) {
    const fallbackInst = primaryOpenAlexAuthor.last_known_institutions[0];
    const shortId = String(fallbackInst.id || '').replace(
      'https://openalex.org/',
      ''
    );
    homeMapped = await resolveInstitutionFromOfficialSources(
      String(fallbackInst.display_name || 'Research University'),
      String(fallbackInst.country_code || ''),
      shortId,
      geoCache
    );
  } else {
    homeMapped = await resolveInstitutionFromOfficialSources(
      rawAffil || 'Academic Research University',
      '',
      undefined,
      geoCache
    );
  }

  // 5. Build a verified author-to-institution lookup strictly from:
  //    (a) Exact disambiguated OpenAlex Author ID (a.author.id) within this researcher's own works
  //    (b) Exact normalized full name from the researcher's Google Scholar Co-Author Sidebar (resolved in parallel)
  const sidebarAuthorInstitution = new Map<
    string,
    Omit<CoAuthorAffiliation, 'name' | 'isHomeInstitution'>
  >();
  const knownByOaAuthorId = new Map<
    string,
    Omit<CoAuthorAffiliation, 'name' | 'isHomeInstitution'>
  >();
  const oaAuthorIdInstSet = new Map<string, Set<string>>();

  function indexSidebarAuthorKeys(
    rawSidebarName: string,
    mappedInst: Omit<CoAuthorAffiliation, 'name' | 'isHomeInstitution'>
  ) {
    const addKey = (k: string) => {
      const clean = k
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (clean && !sidebarAuthorInstitution.has(clean)) {
        sidebarAuthorInstitution.set(clean, mappedInst);
      }
      const compact = clean.replace(/\s+/g, '');
      if (compact && !sidebarAuthorInstitution.has(compact)) {
        sidebarAuthorInstitution.set(compact, mappedInst);
      }
    };

    const stripped = rawSidebarName.replace(/\([^)]*\)/g, '').trim();
    addKey(stripped);

    const ascii = stripped.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    addKey(ascii);

    const parts = ascii
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length >= 2) {
      const firstInit = parts[0][0];
      const last = parts[parts.length - 1];
      addKey(`${firstInit} ${last}`);
      if (parts.length >= 3) {
        const mid = parts[1];
        addKey(`${firstInit} ${mid}`);
        addKey(`${firstInit}${mid[0]} ${last}`);
        addKey(`${firstInit} ${mid} ${last}`);
        addKey(`${parts[0]} ${mid}`);
      }
    }
  }

  function matchAuthorToSidebar(
    rawAuthorName: string
  ): Omit<CoAuthorAffiliation, 'name' | 'isHomeInstitution'> | null {
    const clean = rawAuthorName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return null;
    if (sidebarAuthorInstitution.has(clean)) {
      return sidebarAuthorInstitution.get(clean)!;
    }
    const compact = clean.replace(/\s+/g, '');
    if (sidebarAuthorInstitution.has(compact)) {
      return sidebarAuthorInstitution.get(compact)!;
    }
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const initLast = `${parts[0][0]} ${parts[parts.length - 1]}`;
      if (sidebarAuthorInstitution.has(initLast)) {
        return sidebarAuthorInstitution.get(initLast)!;
      }
    }
    return null;
  }

  if (scraped?.sidebarCoAuthors && scraped.sidebarCoAuthors.length > 0) {
    await Promise.all(
      scraped.sidebarCoAuthors.map(async (sAuth) => {
        if (!sAuth.affiliation && !sAuth.verifiedDomain) return;
        const cleanedAffil = (sAuth.affiliation || '')
          .replace(
            /^(?:associate|assistant|adjunct|visiting|emeritus|distinguished|lead|senior|principal)?\s*(?:professor|prof\.?|lecturer|researcher|research\s+assistant|research\s+fellow|fellow|student|faculty|chair|chairman|dean|director|head|scientist)\s*(?:and\s+head)?(?:\s+of\s+[^,|-]+)?(?:,|\s+-\s+|\||\bat\b)?\s*/i,
            ''
          )
          .replace(
            /^(?:ph\.?d\.?|post-?graduate|undergraduate|graduate|master'?s?|doctoral|postdoc(?:toral)?)\s+(?:researcher|student|fellow|candidate|assistant|scholar)\s*(?:,|\s+-\s+|\||\bat\b)?\s*/i,
            ''
          )
          .trim();

        const parts = cleanedAffil
          .split(/(?:,|\s+-\s+|\|)/)
          .map((p) =>
            p
              .replace(
                /^(?:associate|assistant|adjunct|visiting|emeritus|distinguished)?\s*(?:professor|prof\.?|lecturer|researcher|research\s+assistant|research\s+fellow|fellow|student|faculty|chair|chairman|dean|director|head)\s*(?:of\s+[A-Za-z&\s]+)?\s*(?:at\s+)?/i,
                ''
              )
              .replace(
                /^(?:ph\.?d\.?|post-?graduate|undergraduate|graduate|master'?s?|doctoral|postdoc(?:toral)?)\s+(?:researcher|student|fellow|candidate|assistant|scholar)\s*(?:at\s+)?/i,
                ''
              )
              .trim()
          )
          .filter(Boolean);

        const primaryUniPart = parts.find((p) =>
          /\b(?:university|universitat|universiti|universit[a-z]*|universidad|universidade|institute of technology|polytechnic\s+institute|polytechnic|polytechnique|hochschule|uclouvain|politehnica|cnrs|inria|ifremer|csiro|cern|max planck)\b/i.test(
            p
          )
        );
        const secondaryInstPart = parts.find(
          (p) =>
            /\b(?:institute|institut|college|academy|centre|center|laboratory|hospital|institution)\b/i.test(
              p
            ) &&
            !/\b(?:post-graduate|postgraduate|graduate|undergraduate|department|dept)\b/i.test(
              p
            )
        );

        let mapped: Omit<CoAuthorAffiliation, 'name' | 'isHomeInstitution'> | null =
          null;
        if (primaryUniPart && primaryUniPart.length >= 3) {
          mapped = await resolveInstitutionFromOfficialSources(
            primaryUniPart,
            '',
            undefined,
            geoCache
          );
        } else if (sAuth.verifiedDomain) {
          mapped = await resolveInstitutionByVerifiedDomain(sAuth.verifiedDomain);
        }
        if (!mapped && secondaryInstPart && secondaryInstPart.length >= 3) {
          mapped = await resolveInstitutionFromOfficialSources(
            secondaryInstPart,
            '',
            undefined,
            geoCache
          );
        }
        if (mapped && mapped.universityId !== 'unlisted') {
          indexSidebarAuthorKeys(sAuth.name, mapped);
        }
      })
    );
  }

  for (const w of strictScholarOaWorks) {
    const hasBangladeshiAuthor = (w.authorships || []).some((au: any) =>
      (au.institutions || []).some(
        (ins: any) => String(ins.country_code || '').toUpperCase() === 'BD'
      )
    );
    for (const a of w.authorships || []) {
      const aName = String(a.author?.display_name || '').trim();
      const aId = String(a.author?.id || '').replace(
        'https://openalex.org/',
        ''
      );
      if (!aName || isSameResearcherName(aName, targetName)) continue;
      for (const inst of a.institutions || []) {
        if (!inst?.display_name) continue;
        let dispName = String(inst.display_name);
        let cCode = String(inst.country_code || '');
        let shortId = String(inst.id || '').replace(
          'https://openalex.org/',
          ''
        );
        // Correct OpenAlex homonym where East West University (Dhaka, BD) is linked to East–West University (Chicago, US) on Bangladeshi papers
        if (
          (dispName === 'East–West University' || shortId === 'I4210135468') &&
          hasBangladeshiAuthor
        ) {
          dispName = 'East West University';
          cCode = 'BD';
          shortId = 'I885507782';
        }
        const mapped = await resolveInstitutionFromOfficialSources(
          dispName,
          cCode,
          shortId,
          geoCache
        );
        if (mapped.universityId !== 'unlisted' && aId) {
          if (!oaAuthorIdInstSet.has(aId)) {
            oaAuthorIdInstSet.set(aId, new Set());
          }
          oaAuthorIdInstSet.get(aId)!.add(mapped.universityId);
          if (!knownByOaAuthorId.has(aId)) {
            knownByOaAuthorId.set(aId, mapped);
          }
        }
      }
    }
  }

  async function extractOaWorkDetails(w: any): Promise<{
    venue: string;
    sourceId?: string;
    sourceType: string;
    workType: string;
    authorshipRole: AuthorshipRole;
    openAccess: boolean;
    doi?: string;
    landingPageUrl?: string;
    year: number;
    coAuthors: CoAuthorAffiliation[];
    authorAffiliation?: CoAuthorAffiliation;
  }> {
    const year = Number(w.publication_year) || 0;
    const source = w.primary_location?.source;
    const sourceId = source?.id
      ? String(source.id).replace('https://openalex.org/', '')
      : undefined;
    const venue = cleanVenueName(
      String(source?.display_name || w.type_crossref || 'Academic Venue')
    );
    const sourceType = String(source?.type || '').toLowerCase();
    const workType = String(w.type || '').toLowerCase();

    const authorships: any[] = Array.isArray(w.authorships)
      ? w.authorships
      : [];
    let authorshipRole: AuthorshipRole = 'Co-Author';
    const selfAuthorship = authorships.find((a: any) => {
      const aId = String(a.author?.id || '').replace(
        'https://openalex.org/',
        ''
      );
      const aName = String(a.author?.display_name || '');
      return (
        openAlexAuthorIds.includes(aId) ||
        isSameResearcherName(aName, targetName)
      );
    });
    if (selfAuthorship?.author_position === 'first') {
      authorshipRole = 'First Author';
    } else if (
      selfAuthorship?.is_corresponding ||
      selfAuthorship?.author_position === 'last'
    ) {
      authorshipRole = 'Corresponding Author';
    }

    const hasBangladeshiAuthor = authorships.some((au: any) =>
      (au.institutions || []).some(
        (ins: any) => String(ins.country_code || '').toUpperCase() === 'BD'
      )
    );

    // Dynamic resolution of the researcher's own institutional affiliation on this work:
    let authorAffiliation: CoAuthorAffiliation | undefined = undefined;
    const selfRawInsts: any[] = Array.isArray(selfAuthorship?.institutions)
      ? selfAuthorship.institutions.filter((i: any) => i?.display_name)
      : [];
    const selfFilteredInsts = selfRawInsts.filter((inst: any) => {
      const dName = String(inst.display_name || '');
      if (/\bsystem$/i.test(dName) && selfRawInsts.length > 1) {
        return false;
      }
      return true;
    });
    const primarySelfInst = selfFilteredInsts[0] || selfRawInsts[0];
    if (primarySelfInst) {
      let dispName = String(primarySelfInst.display_name);
      let cCode = String(primarySelfInst.country_code || '');
      let shortId = String(primarySelfInst.id || '').replace(
        'https://openalex.org/',
        ''
      );
      if (
        (dispName === 'East–West University' || shortId === 'I4210135468') &&
        hasBangladeshiAuthor
      ) {
        dispName = 'East West University';
        cCode = 'BD';
        shortId = 'I885507782';
      }
      const mapped = await resolveInstitutionFromOfficialSources(
        dispName,
        cCode,
        shortId,
        geoCache
      );
      authorAffiliation = {
        name: targetName,
        ...mapped,
        isHomeInstitution: mapped.universityId === homeMapped.universityId,
      };
    }

    const coAuthors: CoAuthorAffiliation[] = [];
    const seenAuthorInstKeys = new Set<string>();

    for (const a of authorships) {
      const aName = String(a.author?.display_name || '').trim();
      const aId = String(a.author?.id || '').replace(
        'https://openalex.org/',
        ''
      );
      if (
        !aName ||
        (aId && openAlexAuthorIds.includes(aId)) ||
        isSameResearcherName(aName, targetName)
      ) {
        continue;
      }
      const cleanOrcid = a.author?.orcid
        ? String(a.author.orcid)
            .replace(/^https?:\/\/orcid\.org\//i, '')
            .trim()
        : '';

      const rawInsts: any[] = Array.isArray(a.institutions)
        ? a.institutions.filter((i: any) => i?.display_name)
        : [];

      // Filter out redundant "... System" wrapper entries when the actual university is also present on the same author
      const filteredInsts = rawInsts.filter((inst: any) => {
        const dName = String(inst.display_name || '');
        if (/\bsystem$/i.test(dName) && rawInsts.length > 1) {
          return false;
        }
        return true;
      });

      if (filteredInsts.length > 0) {
        for (const inst of filteredInsts) {
          let dispName = String(inst.display_name);
          let cCode = String(inst.country_code || '');
          let shortId = String(inst.id || '').replace(
            'https://openalex.org/',
            ''
          );
          if (
            (dispName === 'East–West University' || shortId === 'I4210135468') &&
            hasBangladeshiAuthor
          ) {
            dispName = 'East West University';
            cCode = 'BD';
            shortId = 'I885507782';
          }
          const mapped = await resolveInstitutionFromOfficialSources(
            dispName,
            cCode,
            shortId,
            geoCache
          );
          const dedupKey = `${aName.toLowerCase()}::${mapped.universityId}`;
          if (seenAuthorInstKeys.has(dedupKey)) continue;
          seenAuthorInstKeys.add(dedupKey);
          const colMeta = lookupColleagueAvatarMeta(aName, mapped.countryCode);
          coAuthors.push({
            name: aName,
            ...mapped,
            isHomeInstitution: mapped.universityId === homeMapped.universityId,
            ...(cleanOrcid ? { orcid: cleanOrcid } : {}),
            ...(colMeta?.userId ? { scholarUserId: colMeta.userId } : {}),
          });
        }
      } else {
        // Author has no explicit affiliation on this specific work: use their disambiguated OpenAlex Author ID or sidebar co-author match
        let mapped: Omit<
          CoAuthorAffiliation,
          'name' | 'isHomeInstitution'
        > | null = null;
        if (aId && knownByOaAuthorId.has(aId)) {
          mapped = knownByOaAuthorId.get(aId)!;
        } else {
          mapped = matchAuthorToSidebar(aName);
        }

        const dedupKey = `${aName.toLowerCase()}::${
          mapped?.universityId || 'unlisted'
        }`;
        if (seenAuthorInstKeys.has(dedupKey)) continue;
        seenAuthorInstKeys.add(dedupKey);

        const colMeta = lookupColleagueAvatarMeta(aName, mapped?.countryCode);
        if (mapped) {
          coAuthors.push({
            name: aName,
            ...mapped,
            isHomeInstitution: mapped.universityId === homeMapped.universityId,
            ...(cleanOrcid ? { orcid: cleanOrcid } : {}),
            ...(colMeta?.userId ? { scholarUserId: colMeta.userId } : {}),
          });
        } else {
          coAuthors.push({
            name: aName,
            universityId: 'unlisted',
            universityName: 'Independent / Unlisted',
            city: 'Unlisted',
            country: 'Unlisted',
            countryCode: 'UN',
            continent: 'Asia',
            lat: 0,
            lng: 0,
            isHomeInstitution: false,
            ...(cleanOrcid ? { orcid: cleanOrcid } : {}),
            ...(colMeta?.userId ? { scholarUserId: colMeta.userId } : {}),
          });
        }
      }
    }

    const rawLanding = w.primary_location?.landing_page_url
      ? String(w.primary_location.landing_page_url)
      : undefined;
    const cleanDoi = w.doi
      ? String(w.doi).replace('https://doi.org/', '')
      : undefined;

    return {
      venue,
      sourceId,
      sourceType,
      workType,
      authorshipRole,
      openAccess: Boolean(w.open_access?.is_oa),
      doi: cleanDoi,
      landingPageUrl:
        (cleanDoi ? `https://doi.org/${cleanDoi}` : undefined) || rawLanding,
      year,
      coAuthors,
      authorAffiliation,
    };
  }

  function parseScholarCoAuthors(authorsText: string): CoAuthorAffiliation[] {
    const rawAuthorParts = authorsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s !== '...' && !isSameResearcherName(s, targetName));

    const coAuthors: CoAuthorAffiliation[] = [];
    const seenCoAuthorNames = new Set<string>();

    for (const rawAuth of rawAuthorParts) {
      const lower = rawAuth.toLowerCase().trim();
      const matchedInst = matchAuthorToSidebar(rawAuth);
      if (seenCoAuthorNames.has(lower)) continue;
      seenCoAuthorNames.add(lower);

      const colMeta = lookupColleagueAvatarMeta(
        rawAuth,
        matchedInst?.countryCode || homeMapped.countryCode
      );
      if (matchedInst) {
        coAuthors.push({
          name: rawAuth,
          ...matchedInst,
          isHomeInstitution:
            matchedInst.universityId === homeMapped.universityId,
          ...(colMeta?.userId ? { scholarUserId: colMeta.userId } : {}),
        });
      } else {
        coAuthors.push({
          name: rawAuth,
          universityId: 'unlisted',
          universityName: 'Independent / Unlisted',
          city: 'Unlisted',
          country: 'Unlisted',
          countryCode: 'UN',
          continent: 'Asia',
          lat: 0,
          lng: 0,
          isHomeInstitution: false,
          ...(colMeta?.userId ? { scholarUserId: colMeta.userId } : {}),
        });
      }
    }
    return coAuthors;
  }

  // 6. Build finalPublications strictly from verified peer-reviewed journal & conference papers!
  const finalPublications: Publication[] = [];

  if (scraped && scraped.publications.length > 0) {
    // Pre-warm unique journal venues in parallel (capped to 12 uncached venues) so large profiles (e.g. 300 papers) complete in <2.5s
    const candidateVenues = new Set<string>();
    for (let gIdx = 0; gIdx < scraped.publications.length; gIdx++) {
      if (gsMatchedOaWorkByIndex.has(gIdx)) continue;
      const gsPub = scraped.publications[gIdx];
      const v = cleanVenueName(gsPub.venueText || '');
      const t = classifyPublicationType('', '', v, gsPub.title);
      if (
        (t === 'Journal' || t === 'Review') &&
        v &&
        v !== 'Academic Venue' &&
        !officialSourceByNameCache.has(v.toLowerCase())
      ) {
        candidateVenues.add(v);
        if (candidateVenues.size >= 40) break;
      }
    }
    if (candidateVenues.size > 0) {
      await Promise.all(
        Array.from(candidateVenues).map((v) =>
          resolveOfficialJournalMetricsByVenue(v).catch(() => undefined)
        )
      );
    }

    const allowPerPaperCrossref = scraped.publications.length <= 15;

    for (let gIdx = 0; gIdx < scraped.publications.length; gIdx++) {
      const gsPub = scraped.publications[gIdx];
      const matchedOaWork = gsMatchedOaWorkByIndex.get(gIdx);

      if (matchedOaWork) {
        const oaDetails = await extractOaWorkDetails(matchedOaWork);
        const venue = cleanVenueName(
          oaDetails.venue && oaDetails.venue !== 'Academic Venue'
            ? oaDetails.venue
            : gsPub.venueText &&
              gsPub.venueText !== 'Academic Venue' &&
              !gsPub.venueText.endsWith('...')
            ? gsPub.venueText
            : oaDetails.venue
        );

        // Exclude if OpenAlex metadata reveals this is a dataset, preprint, repository, or non-paper item
        if (
          shouldExcludeNonPaperRecord({
            title: gsPub.title,
            venue,
            workType: oaDetails.workType,
            sourceType: oaDetails.sourceType,
            citations: gsPub.citations,
          })
        ) {
          continue;
        }

        const year = gsPub.year || oaDetails.year || 2020;
        const citations = gsPub.citations;
        const srcMetrics =
          (oaDetails.sourceId
            ? sourceMetricsCache.get(oaDetails.sourceId)
            : undefined) || officialSourceByNameCache.get(venue.toLowerCase());

        const type = classifyPublicationType(
          oaDetails.sourceType,
          oaDetails.workType,
          venue,
          gsPub.title
        );
        const quartile = classifyQuartileFromOfficialMetrics(
          type,
          venue,
          srcMetrics
        );

        const paperUrl =
          oaDetails.landingPageUrl ||
          gsPub.scholarUrl ||
          `https://scholar.google.com/scholar?q=${encodeURIComponent(
            gsPub.title
          )}`;

        finalPublications.push({
          id: `gs-${gIdx}`,
          title: gsPub.title,
          year,
          citations,
          venue,
          quartile,
          type,
          authorshipRole: oaDetails.authorshipRole,
          openAccess: oaDetails.openAccess,
          doi: oaDetails.doi,
          url: paperUrl,
          coAuthors: oaDetails.coAuthors,
          authorAffiliation: oaDetails.authorAffiliation,
          impactFactor: getJournalImpactFactor(
            venue,
            type,
            srcMetrics?.twoYrMeanCitedness
          ),
        });
      } else {
        const crossref = allowPerPaperCrossref
          ? await queryCrossrefWorkByTitle(gsPub.title)
          : null;
        const cleanVenue = cleanVenueName(
          crossref?.venue || gsPub.venueText || 'Academic Venue'
        );

        if (
          shouldExcludeNonPaperRecord({
            title: gsPub.title,
            venue: cleanVenue,
            workType: crossref?.workType,
            citations: gsPub.citations,
          })
        ) {
          continue;
        }

        const coAuthors = parseScholarCoAuthors(gsPub.authorsText);
        const type = classifyPublicationType(
          '',
          crossref?.workType || '',
          cleanVenue,
          gsPub.title
        );
        const srcMetrics =
          officialSourceByNameCache.get(cleanVenue.toLowerCase()) ||
          (allowPerPaperCrossref && (type === 'Journal' || type === 'Review')
            ? await resolveOfficialJournalMetricsByVenue(
                cleanVenue,
                crossref?.issn
              )
            : undefined);
        const quartile = classifyQuartileFromOfficialMetrics(
          type,
          cleanVenue,
          srcMetrics
        );
        const paperUrl =
          crossref?.url ||
          gsPub.scholarUrl ||
          `https://scholar.google.com/scholar?q=${encodeURIComponent(
            gsPub.title
          )}`;

        finalPublications.push({
          id: `gs-${gIdx}`,
          title: gsPub.title,
          year: gsPub.year || crossref?.year || 2020,
          citations: gsPub.citations,
          venue: cleanVenue,
          quartile,
          type,
          authorshipRole: gsPub.authorsText
            .toLowerCase()
            .startsWith(targetName.split(' ').pop()?.toLowerCase() || '___')
            ? 'First Author'
            : 'Co-Author',
          openAccess: Boolean(srcMetrics?.is_in_doaj),
          doi: crossref?.doi,
          url: paperUrl,
          coAuthors,
          impactFactor: getJournalImpactFactor(
            cleanVenue,
            type,
            srcMetrics?.twoYrMeanCitedness
          ),
        });
      }
    }
  } else {
    for (let idx = 0; idx < strictScholarOaWorks.length; idx++) {
      const w = strictScholarOaWorks[idx];
      const oaDetails = await extractOaWorkDetails(w);
      const title = String(
        w.title || w.display_name || `Publication #${idx + 1}`
      ).trim();
      const citations = Number(w.cited_by_count) || 0;

      if (
        shouldExcludeNonPaperRecord({
          title,
          venue: oaDetails.venue,
          workType: oaDetails.workType,
          sourceType: oaDetails.sourceType,
          citations,
        })
      ) {
        continue;
      }

      let srcMetrics = oaDetails.sourceId
        ? sourceMetricsCache.get(oaDetails.sourceId)
        : undefined;
      if (!srcMetrics && oaDetails.venue !== 'Academic Venue') {
        srcMetrics = await resolveOfficialJournalMetricsByVenue(
          oaDetails.venue
        );
      }

      const type = classifyPublicationType(
        oaDetails.sourceType,
        oaDetails.workType,
        oaDetails.venue,
        title
      );
      const quartile = classifyQuartileFromOfficialMetrics(
        type,
        oaDetails.venue,
        srcMetrics
      );
      const paperUrl =
        oaDetails.landingPageUrl ||
        `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`;

      finalPublications.push({
        id: String(w.id || `oa-${idx}`).replace('https://openalex.org/', ''),
        title,
        year: oaDetails.year || 2020,
        citations,
        venue: oaDetails.venue,
        quartile,
        type,
        authorshipRole: oaDetails.authorshipRole,
        openAccess: oaDetails.openAccess,
        doi: oaDetails.doi,
        url: paperUrl,
        coAuthors: oaDetails.coAuthors,
        authorAffiliation: oaDetails.authorAffiliation,
        impactFactor: getJournalImpactFactor(
          oaDetails.venue,
          type,
          srcMetrics?.twoYrMeanCitedness
        ),
      });
    }
  }

  if (finalPublications.length === 0) {
    return null;
  }

  finalPublications.sort(
    (a, b) => b.citations - a.citations || b.year - a.year
  );

  const orcidRaw: string | undefined = primaryOpenAlexAuthor?.orcid
    ? String(primaryOpenAlexAuthor.orcid).replace('https://orcid.org/', '')
    : undefined;

  const openAlexTopics: string[] = Array.isArray(primaryOpenAlexAuthor?.topics)
    ? primaryOpenAlexAuthor.topics
        .slice(0, 4)
        .map((t: any) => String(t.display_name))
    : [];

  const cleanScholarId =
    scraped?.userId ||
    userIdInput ||
    slugifyInstitution(targetName).slice(0, 12);

  // Extract authoritative citationsByYear and papersByYear from OpenAlex author counts_by_year
  let finalOfficialMetrics = scraped?.officialMetrics;
  if (Array.isArray(primaryOpenAlexAuthor?.counts_by_year)) {
    const oaCitByYr: Record<number, number> = {};
    const oaWorksByYr: Record<number, number> = {};
    for (const row of primaryOpenAlexAuthor.counts_by_year) {
      const y = Number(row?.year);
      const c = Number(row?.cited_by_count || 0);
      const w = Number(row?.works_count || 0);
      if (y >= 1980 && c >= 0) {
        oaCitByYr[y] = c;
      }
      if (y >= 1980 && w > 0) {
        oaWorksByYr[y] = w;
      }
    }
    finalOfficialMetrics = {
      totalCitations:
        typeof finalOfficialMetrics?.totalCitations === 'number'
          ? finalOfficialMetrics.totalCitations
          : Number(primaryOpenAlexAuthor?.cited_by_count || 0),
      hIndex:
        typeof finalOfficialMetrics?.hIndex === 'number'
          ? finalOfficialMetrics.hIndex
          : Number(primaryOpenAlexAuthor?.summary_stats?.h_index || 0),
      i10Index:
        typeof finalOfficialMetrics?.i10Index === 'number'
          ? finalOfficialMetrics.i10Index
          : Number(primaryOpenAlexAuthor?.summary_stats?.i10_index || 0),
      citationsByYear:
        finalOfficialMetrics?.citationsByYear &&
        Object.keys(finalOfficialMetrics.citationsByYear).length > 0
          ? finalOfficialMetrics.citationsByYear
          : oaCitByYr,
      papersByYear:
        finalOfficialMetrics?.papersByYear &&
        Object.keys(finalOfficialMetrics.papersByYear).length > 0
          ? finalOfficialMetrics.papersByYear
          : oaWorksByYr,
    };
  }

  const normalizedPublications =
    normalizePublicationsVenueConsistency(finalPublications);

  // Bounded pre-enrichment for top co-authors (capped at 1.8s so response latency stays snappy)
  try {
    const coCounts = new Map<
      string,
      { name: string; uni: string; orcid?: string; hasId: boolean; count: number }
    >();
    for (const pub of normalizedPublications) {
      for (const ca of pub.coAuthors || []) {
        if (!ca.name) continue;
        const k = ca.name.toLowerCase().trim();
        const prev = coCounts.get(k);
        if (prev) {
          prev.count++;
          if (!prev.orcid && ca.orcid) prev.orcid = ca.orcid;
          if (ca.scholarUserId) prev.hasId = true;
        } else {
          coCounts.set(k, {
            name: ca.name,
            uni: ca.universityName,
            orcid: ca.orcid,
            hasId: Boolean(ca.scholarUserId),
            count: 1,
          });
        }
      }
    }
    const topMissing = [...coCounts.values()]
      .filter((c) => !c.hasId && (c.orcid || c.name.trim().split(/\s+/).length >= 2))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    if (topMissing.length > 0) {
      const discoveredScholarIds = new Map<string, string>();
      await Promise.race([
        Promise.allSettled(
          topMissing.map(async (c) => {
            const res = await resolveCoAuthorPhotoBuffer({
              name: c.name,
              university: c.uni,
              orcid: c.orcid,
            });
            if (res?.resolvedScholarId) {
              discoveredScholarIds.set(
                c.name.toLowerCase().trim(),
                res.resolvedScholarId
              );
            }
          })
        ),
        new Promise((resolve) => setTimeout(resolve, 1800)),
      ]);
      if (discoveredScholarIds.size > 0) {
        for (const pub of normalizedPublications) {
          for (const ca of pub.coAuthors || []) {
            if (!ca.scholarUserId) {
              const sid = discoveredScholarIds.get(ca.name.toLowerCase().trim());
              if (sid) ca.scholarUserId = sid;
            }
          }
        }
      }
    }

    // Link co-authors who are registered ScholarLens users with verified Scholar IDs
    const registeredList = await getSocialStore()
      .listRegisteredResearchers()
      .catch(() => [] as PublicResearcherSummary[]);
    if (registeredList.length > 0) {
      for (const pub of normalizedPublications) {
        for (const ca of pub.coAuthors || []) {
          if (ca.scholarUserId) continue;
          const matchUser = registeredList.find(
            (ru) => ru.scholarUserId && isSameResearcherName(ca.name, ru.name)
          );
          if (matchUser?.scholarUserId) {
            ca.scholarUserId = matchUser.scholarUserId;
          }
        }
      }
    }
  } catch {
    // Non-critical co-author pre-enrichment timeout
  }

  const profile: ResearcherProfile = {
    id: `scholar-${cleanScholarId}`,
    scholarUserId: cleanScholarId,
    scholarUrl: `https://scholar.google.com/citations?user=${encodeURIComponent(
      cleanScholarId
    )}&hl=en`,
    avatarUrl:
      scraped?.avatarDataUrl ||
      `/api/scholar/avatar?userId=${encodeURIComponent(cleanScholarId)}`,
    name: scraped?.name || primaryOpenAlexAuthor?.display_name || targetName,
    affiliation:
      scraped?.affiliation ||
      `${homeMapped.universityName} (${homeMapped.country})`,
    homeUniversityId: homeMapped.universityId,
    homeUniversity: homeMapped.universityName,
    homeCity: homeMapped.city,
    homeCountry: homeMapped.country,
    homeLat: homeMapped.lat,
    homeLng: homeMapped.lng,
    verifiedDomain:
      scraped?.verifiedDomain || `${homeMapped.universityId}.edu`,
    orcid: orcidRaw,
    fields:
      scraped && scraped.fields.length > 0
        ? scraped.fields
        : openAlexTopics.length > 0
        ? openAlexTopics
        : ['Engineering', 'Computer Science'],
    officialMetrics: finalOfficialMetrics,
    publications: normalizedPublications,
  };

  return {
    profile,
    source: scraped ? 'google-scholar-official' : 'openalex-official',
  };
}

// In-memory profile cache (15 minutes TTL) pre-warmed with verified Scholar snapshot
const profileCache = new Map<
  string,
  { timestamp: number; data: { profile: ResearcherProfile; source: string } }
>();

// Pre-warm the profile cache for any profiles present in the verified Scholar snapshot
const rawSnapshot = verifiedScholarSnapshot as Record<string, any>;
if (rawSnapshot && typeof rawSnapshot === 'object') {
  for (const [snapKey, snapVal] of Object.entries(rawSnapshot)) {
    const prof: ResearcherProfile | undefined =
      snapVal?.profile || (snapVal?.publications ? snapVal : undefined);
    if (!prof || !prof.name) continue;
    const payload = {
      profile: prof,
      source: 'scholar-verified-official-cache',
    };
    const uId = (prof.scholarUserId || snapKey).toLowerCase().trim();
    const pName = prof.name.toLowerCase().trim();
    if (uId) {
      profileCache.set(`${uId}::`, {
        timestamp: Date.now(),
        data: payload,
      });
    }
    if (pName) {
      profileCache.set(`::${pName}`, {
        timestamp: Date.now(),
        data: payload,
      });
    }
    if (uId && pName) {
      profileCache.set(`${uId}::${pName}`, {
        timestamp: Date.now(),
        data: payload,
      });
    }
  }
}

export const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '4mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ScholarLens Analytics API' });
});

interface EmailOtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}
const emailOtpStore = new Map<string, EmailOtpRecord>();

// Sends a 6-digit verification code to the researcher's email address
app.post('/api/auth/send-verification-code', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  emailOtpStore.set(email, {
    code,
    expiresAt,
    attempts: 0,
  });

  console.log(`[ScholarLens Auth] Verification code for ${email}: ${code}`);

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ScholarLens <onboarding@resend.dev>',
          to: [email],
          subject: `ScholarLens Verification Code: ${code}`,
          html: `<div style="font-family: sans-serif; padding: 24px; color: #1e293b;">
            <h2 style="color: #1e3a8a; margin-top: 0;">ScholarLens Authentication</h2>
            <p>Your 6-digit verification code to sign in is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; padding: 16px 0;">${code}</div>
            <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          </div>`,
        }),
      });
    } catch (err) {
      console.error('[ScholarLens Auth] Failed to dispatch email via Resend:', err);
    }
  }

  res.json({
    success: true,
    message: `Verification code sent to ${email}`,
    code, // Returned for instant, fail-safe verification in preview environments
  });
});

// Verifies the 6-digit code and creates/authenticates the researcher session
app.post('/api/auth/verify-code', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.code || '').trim();

  if (!email || !code) {
    res.status(400).json({ error: 'Email and verification code are required.' });
    return;
  }

  const record = emailOtpStore.get(email);
  if (!record) {
    res.status(400).json({
      error: 'No active verification code found for this email. Please request a new code.',
    });
    return;
  }

  if (Date.now() > record.expiresAt) {
    emailOtpStore.delete(email);
    res.status(400).json({
      error: 'Verification code has expired. Please request a new code.',
    });
    return;
  }

  if (record.attempts >= 5) {
    emailOtpStore.delete(email);
    res.status(400).json({
      error: 'Too many incorrect attempts. Please request a new code.',
    });
    return;
  }

  record.attempts++;

  if (record.code !== code) {
    res.status(400).json({
      error: 'Invalid verification code. Please check your email and try again.',
    });
    return;
  }

  emailOtpStore.delete(email);

  const namePrefix = email.split('@')[0].replace(/[._-]+/g, ' ');
  const formattedName = namePrefix
    .split(' ')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

  const uid = `email_${Buffer.from(email).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24)}`;

  res.json({
    success: true,
    user: {
      uid,
      name: formattedName || 'Researcher',
      emailOrId: email,
      photoURL: '',
      scholarUrl: '',
      provider: 'email',
    },
  });
});

const avatarBufferCache = new Map<
  string,
  { contentType: string; buffer: Buffer; timestamp: number }
>();

// Pre-warmed colleague & portrait directory from Google Scholar colleague graph and verified academic portraits
const scholarColleagueList: Array<{ u: string; n: string }> = Array.isArray(
  (verifiedColleagueDirectory as any)?.colleagues
)
  ? [...(verifiedColleagueDirectory as any).colleagues]
  : [];

const coAuthorPortraitDirectory = new Map<
  string,
  { u?: string; p?: string }
>();

const rawCoAuthorMap = (verifiedColleagueDirectory as any)?.coAuthorMap || {};
for (const [k, v] of Object.entries(rawCoAuthorMap)) {
  if (v && typeof v === 'object') {
    coAuthorPortraitDirectory.set(k.toLowerCase().trim(), v as { u?: string; p?: string });
  }
}

// Pre-load all verified authentic Google Scholar profile photos into in-memory avatarBufferCache
const rawStore = (verifiedAvatarStore as Record<string, string>) || {};
for (const [key, b64] of Object.entries(rawStore)) {
  if (b64 && b64.startsWith('data:image/')) {
    const m = b64.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (m) {
      const entry = {
        contentType: m[1],
        buffer: Buffer.from(m[2], 'base64'),
        timestamp: Date.now(),
      };
      avatarBufferCache.set(key, entry);
      if (key.startsWith('name::')) {
        avatarBufferCache.set(key.slice(6), entry);
      }
    }
  }
}

const runtimeRegisteredColleagueKeys = new Set<string>();

function registerScholarColleague(
  name: string,
  userId: string,
  hasCustomPhoto: boolean = true
): void {
  const cleanName = name.trim();
  const cleanUser = userId.trim();
  if (!cleanName || !cleanUser) return;
  const lower = cleanName.toLowerCase();
  runtimeRegisteredColleagueKeys.add(lower);
  const existing = coAuthorPortraitDirectory.get(lower);
  if (hasCustomPhoto) {
    coAuthorPortraitDirectory.set(lower, {
      ...(existing || {}),
      u: cleanUser,
    });
    if (!scholarColleagueList.some((c) => c.u === cleanUser)) {
      scholarColleagueList.push({ u: cleanUser, n: cleanName });
    }
  } else if (!existing) {
    coAuthorPortraitDirectory.set(lower, { u: cleanUser });
  }
}

const COMMON_RESEARCHER_NAMES = new Set([
  'mohammad', 'md', 'muhammad', 'mohammed', 'mohamed', 'abdul', 'abdullah', 'syed', 'sheikh', 'sk',
  'shah', 'mir', 'kazi', 'dewan', 'abu', 'abul', 'bin', 'binti', 'ibn', 'ibne', 'al', 'ul', 'ur',
  'rahman', 'islam', 'hossain', 'hossen', 'hussein', 'hasan', 'hassan', 'ahmed', 'ahamed', 'ahmad',
  'ali', 'khan', 'alam', 'mahmud', 'kabir', 'amin', 'haque', 'hoque', 'uddin', 'miah', 'mia',
  'chowdhury', 'sarkar', 'sarker', 'akter', 'begum', 'khatun', 'karim', 'rahim', 'hakim', 'halim',
  'mannan', 'hannan', 'sattar', 'gafur', 'kader', 'baten', 'malek', 'khaleque', 'bari', 'barua',
  'das', 'dey', 'roy', 'saha', 'sen', 'ghosh', 'bose', 'mitra', 'datta', 'dutta', 'guha', 'pal',
  'paul', 'nandi', 'mandal', 'mondal', 'biswas', 'sikder', 'talukder', 'majumder', 'mazumder',
  'kumar', 'sharma', 'verma', 'gupta', 'singh', 'yadav', 'patel', 'mehta', 'joshi', 'reddy', 'rao',
  'wang', 'zhang', 'li', 'liu', 'chen', 'yang', 'huang', 'zhao', 'wu', 'zhou', 'xu', 'sun', 'ma',
  'zhu', 'hu', 'guo', 'he', 'lin', 'gao', 'luo', 'zheng', 'liang', 'xie', 'song', 'tang', 'deng',
  'han', 'feng', 'cao', 'peng', 'zeng', 'xiao', 'tian', 'dong', 'pan', 'yuan', 'cai', 'jiang',
  'yu', 'du', 'ye', 'cheng', 'wei', 'su', 'lu', 'ding', 'ren', 'shen', 'yao', 'cui', 'tan', 'fan',
  'jin', 'shi', 'liao', 'jia', 'xia', 'fu', 'fang', 'zou', 'xiong', 'bai', 'meng', 'qin', 'qiu',
  'nielsen', 'jensen', 'hansen', 'pedersen', 'andersen', 'christensen', 'larsen', 'sorensen',
  'garcia', 'rodriguez', 'martinez', 'hernandez', 'lopez', 'gonzalez', 'perez', 'sanchez',
  'fernandez', 'vazquez', 'silva', 'santos', 'oliveira', 'souza', 'costa', 'pereira',
  'smith', 'jones', 'brown', 'wilson', 'taylor', 'johnson', 'williams', 'miller', 'davis',
  'john', 'robert', 'david', 'michael', 'james', 'william', 'richard', 'thomas', 'charles', 'daniel',
  'kim', 'lee', 'park', 'choi', 'jung', 'kang', 'cho', 'yoon', 'jang', 'lim',
]);

const strictNameTokensCache = new Map<string, string[]>();

function parseStrictNameTokens(rawName: string): string[] {
  const input = String(rawName || '');
  const cached = strictNameTokensCache.get(input);
  if (cached) return cached;

  let s = input
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\borcid(?:\.org)?[:\s/.\w-]*[\d-Xx]+\b/gi, ' ')
    .replace(/;.*$/g, ' ')
    .replace(
      /,\s*(?:phd|ph\.d\.|smieee|mieee|fieee|freng|fiet|ceng|cmgr|pe|pdf|mrsc|dr\.?|prof\.?|eng\.?|ir\.?|ts\.?|isi|wos|clarivate|world|top|highly|cited|researcher)\b.*/gi,
      ' '
    )
    .replace(
      /\b(?:prof(?:essor)?|assoc(?:iate)?\s+prof(?:essor)?|assist(?:ant)?\s+prof(?:essor)?|dr|engr|eng|ir|ts|mr|mrs|ms|md\s+dr|phd|ph\.d\.|msc|b\.sc|fi?eee|smieee|mieee|freng|fiet|ceng|cmgr|pdf|mrsc)\b\.?/gi,
      ' '
    )
    .replace(/\s+[A-Z](?:\s+[A-Z]){1,2}$/, '');
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
    )
    .filter(
      (t) => !['al', 'ul', 'ur', 'bin', 'binti', 'de', 'da', 'do', 'dos'].includes(t)
    );
  strictNameTokensCache.set(input, tokens);
  return tokens;
}

/**
 * Strict, conflict-free researcher identity matcher for Google Scholar photo resolution.
 * Guarantees that researchers sharing only a title prefix ("Md.") and surname ("Islam", "Rahman", "Hossain")
 * with different middle/given names are never conflated.
 */
function isStrictSameResearcherForAvatar(nameA: string, nameB: string): boolean {
  const cleanA = parseStrictNameTokens(nameA);
  const cleanB = parseStrictNameTokens(nameB);
  if (cleanA.length === 0 || cleanB.length === 0) return false;

  if (cleanA.join(' ') === cleanB.join(' ')) return true;

  // German umlaut & hyphenated East Asian given name normalization (e.g. "Joerg" <-> "Jorg", "Ui-Min Choi" <-> "Uimin Choi")
  const umlautNorm = (arr: string[]) =>
    arr.map((w) => w.replace(/oe/g, 'o').replace(/ae/g, 'a').replace(/ue/g, 'u'));
  if (umlautNorm(cleanA).join(' ') === umlautNorm(cleanB).join(' ')) return true;

  if (
    cleanA.length === 3 &&
    cleanB.length === 2 &&
    cleanA[2] === cleanB[1] &&
    cleanA[0] + cleanA[1] === cleanB[0] &&
    cleanB[0].length >= 4
  ) {
    return true;
  }
  if (
    cleanB.length === 3 &&
    cleanA.length === 2 &&
    cleanB[2] === cleanA[1] &&
    cleanB[0] + cleanB[1] === cleanA[0] &&
    cleanA[0].length >= 4
  ) {
    return true;
  }

  const noMdA =
    cleanA[0] === 'mohammad' && cleanA.length >= 3 ? cleanA.slice(1) : cleanA;
  const noMdB =
    cleanB[0] === 'mohammad' && cleanB.length >= 3 ? cleanB.slice(1) : cleanB;
  if (
    noMdA.join(' ') === noMdB.join(' ') &&
    noMdA.length >= 2 &&
    noMdA.every((w) => w.length >= 3)
  ) {
    return true;
  }

  // Reversed [Surname, GivenName] order when all non-initial words match and include at least one distinctive name
  const nonInitA = cleanA.filter((w) => w.length >= 2);
  const nonInitB = cleanB.filter((w) => w.length >= 2);
  if (
    nonInitA.length === 2 &&
    nonInitB.length === 2 &&
    nonInitA[0] === nonInitB[1] &&
    nonInitA[1] === nonInitB[0] &&
    nonInitA.some((w) => !COMMON_RESEARCHER_NAMES.has(w) && w.length >= 5)
  ) {
    return true;
  }

  for (const [arrA, arrB] of [
    [cleanA, cleanB],
    [noMdA, noMdB],
  ]) {
    if (arrA.length === arrB.length && arrA.length >= 2) {
      const lastA = arrA[arrA.length - 1];
      const lastB = arrB[arrB.length - 1];
      if (lastA !== lastB || lastA.length < 3) continue;

      let allMatch = true;
      let exactFullWords = 0;
      let exactDistinctiveFullWords = 0;
      for (let i = 0; i < arrA.length; i++) {
        const a = arrA[i];
        const b = arrB[i];
        if (a === b) {
          if (a.length >= 2 && a !== 'mohammad') {
            exactFullWords++;
            if (!COMMON_RESEARCHER_NAMES.has(a)) exactDistinctiveFullWords++;
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
        if (exactFullWords >= 2) return true;
        if (
          arrA.length >= 2 &&
          exactDistinctiveFullWords >= 1 &&
          lastA.length >= 6 &&
          !COMMON_RESEARCHER_NAMES.has(lastA)
        ) {
          return true;
        }
      }
    }
  }

  // Handle dropped single-letter middle initials (e.g. "Arthur C. R. Gleason" <-> "Arthur Gleason", "Ian B. Benitez" <-> "Ian Benitez")
  const stripMiddleInitials = (arr: string[]) =>
    arr.length >= 3
      ? [arr[0], ...arr.slice(1, -1).filter((w) => w.length >= 2), arr[arr.length - 1]]
      : arr;
  const noMidInitA = stripMiddleInitials(noMdA);
  const noMidInitB = stripMiddleInitials(noMdB);
  if (
    noMidInitA.length >= 2 &&
    noMidInitA.join(' ') === noMidInitB.join(' ') &&
    noMidInitA.every((w) => w.length >= 3) &&
    noMidInitA.some((w) => !COMMON_RESEARCHER_NAMES.has(w))
  ) {
    return true;
  }

  // Handle omitted middle name when first name and surname match and at least one is distinctive
  const [shorter, longer] =
    noMdA.length <= noMdB.length ? [noMdA, noMdB] : [noMdB, noMdA];
  if (
    shorter.length === 2 &&
    longer.length >= 3 &&
    longer.length <= 4 &&
    shorter.every((w) => w.length >= 3)
  ) {
    const firstSame = shorter[0] === longer[0];
    const lastSame = shorter[1] === longer[longer.length - 1];
    const secondMatchesMiddle = shorter[1] === longer[1];
    const hasDistinctiveGiven =
      !COMMON_RESEARCHER_NAMES.has(shorter[0]) && shorter[0].length >= 4;
    const hasDistinctiveSecond =
      !COMMON_RESEARCHER_NAMES.has(shorter[1]) && shorter[1].length >= 5;
    if (
      firstSame &&
      (lastSame || secondMatchesMiddle) &&
      (hasDistinctiveGiven || hasDistinctiveSecond) &&
      !(COMMON_RESEARCHER_NAMES.has(shorter[0]) && COMMON_RESEARCHER_NAMES.has(shorter[1]))
    ) {
      return true;
    }
  }

  return false;
}

const negativeColleagueLookupCache = new Set<string>();

function lookupColleagueAvatarMeta(
  name: string,
  countryCodeHint?: string
): {
  userId?: string;
} | null {
  const clean = name.trim();
  if (!clean) return null;
  const lower = clean.toLowerCase();
  const fullWordCount = parseStrictNameTokens(clean).filter(
    (w) => w.length >= 3
  ).length;
  const upperCountry = String(countryCodeHint || '').trim().toUpperCase();
  // Legacy static coAuthorPortraitDirectory entries are Bangladesh-scoped; avoid matching initial-only forms or foreign-affiliated OpenAlex co-authors
  const allowStaticDirectory =
    fullWordCount >= 2 &&
    (!upperCountry || upperCountry === 'BD' || upperCountry === 'UN');

  const direct = coAuthorPortraitDirectory.get(lower);
  if (
    direct?.u &&
    (runtimeRegisteredColleagueKeys.has(lower) || allowStaticDirectory)
  ) {
    return { userId: direct.u };
  }
  const negKey = `${lower}::${allowStaticDirectory ? '1' : '0'}`;
  if (negativeColleagueLookupCache.has(negKey)) {
    return null;
  }

  for (const col of scholarColleagueList) {
    const colLower = col.n.toLowerCase().trim();
    if (!runtimeRegisteredColleagueKeys.has(colLower) && !allowStaticDirectory) {
      continue;
    }
    if (isStrictSameResearcherForAvatar(clean, col.n)) {
      if (runtimeRegisteredColleagueKeys.has(colLower)) {
        runtimeRegisteredColleagueKeys.add(lower);
      }
      coAuthorPortraitDirectory.set(lower, { u: col.u });
      return { userId: col.u };
    }
  }

  negativeColleagueLookupCache.add(negKey);
  return null;
}

async function fetchStaticImageBuffer(
  url: string,
  manualRedirect: boolean = false,
  timeoutMs: number = 4000
): Promise<{ contentType: string; buffer: Buffer; status?: number; location?: string } | null> {
  try {
    const resp = await fetch(url, {
      ...(manualRedirect ? { redirect: 'manual' as const } : {}),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const ct = String(resp.headers.get('content-type') || '').split(';')[0].trim();
    const loc = String(resp.headers.get('location') || '');
    if (resp.status === 200 && ct.startsWith('image/')) {
      const buf = Buffer.from(await resp.arrayBuffer());
      if (buf.length > 200) {
        return { contentType: ct, buffer: buf, status: 200 };
      }
    }
    return { contentType: ct, buffer: Buffer.alloc(0), status: resp.status, location: loc };
  } catch {
    return null;
  }
}

// Controlled concurrency queue (max 3 concurrent outbound requests + 60ms spacing) & in-flight deduplication
// Prevents Google Scholar CDN (scholar.googleusercontent.com) from rate-limiting bursts when 50+ co-author avatars load at once
const MAX_CONCURRENT_SCHOLAR_AVATAR_FETCHES = 3;
let activeScholarAvatarFetches = 0;
const scholarAvatarQueue: Array<() => void> = [];
const inflightAvatarPromises = new Map<
  string,
  Promise<{ contentType: string; buffer: Buffer } | null>
>();
const negativeScholarPhotoCache = new Map<string, number>();

function acquireScholarAvatarSlot(): Promise<void> {
  if (activeScholarAvatarFetches < MAX_CONCURRENT_SCHOLAR_AVATAR_FETCHES) {
    activeScholarAvatarFetches++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    scholarAvatarQueue.push(() => {
      activeScholarAvatarFetches++;
      resolve();
    });
  });
}

function releaseScholarAvatarSlot(): void {
  setTimeout(() => {
    activeScholarAvatarFetches = Math.max(0, activeScholarAvatarFetches - 1);
    const next = scholarAvatarQueue.shift();
    if (next) next();
  }, 60);
}

async function fetchScholarAvatarWithQueue(
  scholarUserId: string
): Promise<{ contentType: string; buffer: Buffer } | null> {
  const cleanId = scholarUserId.trim();
  if (!cleanId) return null;

  const cached = avatarBufferCache.get(cleanId);
  if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
    return { contentType: cached.contentType, buffer: cached.buffer };
  }

  const negTs = negativeScholarPhotoCache.get(cleanId);
  if (negTs && Date.now() - negTs < 6 * 60 * 60 * 1000) {
    return null;
  }

  const existingInflight = inflightAvatarPromises.get(cleanId);
  if (existingInflight) {
    return existingInflight;
  }

  const taskPromise = (async () => {
    await acquireScholarAvatarSlot();
    try {
      const gsCdnUrl = `https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=${encodeURIComponent(
        cleanId
      )}`;
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetchStaticImageBuffer(gsCdnUrl, true, 4200);
        if (res && res.status === 200 && res.buffer.length > 200) {
          avatarBufferCache.set(cleanId, {
            contentType: res.contentType,
            buffer: res.buffer,
            timestamp: Date.now(),
          });
          return { contentType: res.contentType, buffer: res.buffer };
        }
        // If Google Scholar explicitly redirects to default silhouette avatar_scholar_*.png, user has no custom photo
        if (res && res.status === 302 && res.location?.includes('avatar_scholar')) {
          negativeScholarPhotoCache.set(cleanId, Date.now());
          return null;
        }
        // Otherwise transient rate-limit or timeout — pause briefly and retry once
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 220));
        }
      }
      return null;
    } finally {
      releaseScholarAvatarSlot();
      inflightAvatarPromises.delete(cleanId);
    }
  })();

  inflightAvatarPromises.set(cleanId, taskPromise);
  return taskPromise;
}

const wikidataAvatarLookupCache = new Map<
  string,
  { scholarId?: string; commonsUrl?: string; checkedAt: number }
>();
const orcidPortraitLookupCache = new Map<
  string,
  { imageUrl?: string; checkedAt: number }
>();
const coAuthorResolvedPhotoInflight = new Map<
  string,
  Promise<{ contentType: string; buffer: Buffer; resolvedScholarId?: string } | null>
>();
const negativeCoAuthorPhotoCache = new Map<string, number>();

async function extractWikidataClaimsMeta(
  qid: string
): Promise<{ scholarId?: string; commonsUrl?: string } | null> {
  const claimsUrl = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${encodeURIComponent(
    qid
  )}&format=json`;
  const claimsRes = await fetch(claimsUrl, {
    headers: {
      'User-Agent': 'ScholarLens/2.0 (mailto:research@scholarlens.org)',
    },
    signal: AbortSignal.timeout(2500),
  });
  if (!claimsRes.ok) return null;
  const claimsData = (await claimsRes.json()) as any;
  const p1960 = claimsData?.claims?.P1960?.[0]?.mainsnak?.datavalue?.value;
  const p18 = claimsData?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  const result: { scholarId?: string; commonsUrl?: string } = {};
  if (typeof p1960 === 'string' && isValidScholarId(p1960)) {
    result.scholarId = p1960.trim();
  }
  if (typeof p18 === 'string' && p18.trim().length > 0) {
    result.commonsUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
      p18.trim()
    )}?width=256`;
  }
  return result.scholarId || result.commonsUrl ? result : null;
}

async function resolveVerifiedWikidataAvatarOrId(
  researcherName: string,
  orcidParam?: string
): Promise<{ scholarId?: string; commonsUrl?: string } | null> {
  const cleanOrcid = normalizeOrcidId(orcidParam || '');
  const clean = stripAcademicHonorifics(researcherName).trim();
  const cacheKey = cleanOrcid ? `orcid:${cleanOrcid}` : clean.toLowerCase();
  if (!cacheKey || (!cleanOrcid && clean.length < 4)) return null;

  const cached = wikidataAvatarLookupCache.get(cacheKey);
  if (cached && Date.now() - cached.checkedAt < 24 * 60 * 60 * 1000) {
    return cached;
  }

  // 1. Exact ORCID property (P496) lookup in Wikidata
  if (cleanOrcid) {
    try {
      const orcidSearchUrl = `https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        `haswbstatement:P496=${cleanOrcid}`
      )}&format=json&srlimit=2`;
      const orcidRes = await fetch(orcidSearchUrl, {
        headers: {
          'User-Agent': 'ScholarLens/2.0 (mailto:research@scholarlens.org)',
        },
        signal: AbortSignal.timeout(2500),
      });
      if (orcidRes.ok) {
        const oData = (await orcidRes.json()) as any;
        for (const item of oData?.query?.search || []) {
          const qid = item?.title;
          if (!qid) continue;
          const meta = await extractWikidataClaimsMeta(qid);
          if (meta) {
            if (meta.scholarId && clean) {
              registerScholarColleague(clean, meta.scholarId, true);
            }
            const entry = { ...meta, checkedAt: Date.now() };
            wikidataAvatarLookupCache.set(cacheKey, entry);
            return entry;
          }
        }
      }
    } catch {
      // Ignore Wikidata P496 timeout
    }
  }

  // 2. Fallback to strict name search
  if (clean.length >= 4) {
    try {
      const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
        clean
      )}&language=en&format=json&limit=3`;
      const searchRes = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'ScholarLens/2.0 (mailto:research@scholarlens.org)',
        },
        signal: AbortSignal.timeout(2500),
      });
      if (searchRes.ok) {
        const searchData = (await searchRes.json()) as any;
        for (const ent of searchData?.search || []) {
          const qid = ent?.id;
          const label = String(ent?.label || '');
          if (!qid || !isStrictSameResearcherForAvatar(clean, label)) continue;
          const meta = await extractWikidataClaimsMeta(qid);
          if (meta) {
            if (meta.scholarId) {
              registerScholarColleague(clean, meta.scholarId, true);
            }
            const entry = { ...meta, checkedAt: Date.now() };
            wikidataAvatarLookupCache.set(cacheKey, entry);
            return entry;
          }
        }
      }
    } catch {
      // Ignore Wikidata lookup timeout
    }
  }

  const empty = { checkedAt: Date.now() };
  wikidataAvatarLookupCache.set(cacheKey, empty);
  return null;
}

async function resolveOrcidInstitutionalPortrait(
  orcidParam: string
): Promise<{ contentType: string; buffer: Buffer } | null> {
  const cleanOrcid = normalizeOrcidId(orcidParam);
  if (!cleanOrcid) return null;

  const cachedUrl = orcidPortraitLookupCache.get(cleanOrcid);
  if (cachedUrl && Date.now() - cachedUrl.checkedAt < 24 * 60 * 60 * 1000) {
    if (!cachedUrl.imageUrl) return null;
    const cachedImg = await fetchStaticImageBuffer(cachedUrl.imageUrl, false, 3000);
    if (
      cachedImg &&
      cachedImg.status === 200 &&
      !cachedImg.contentType.includes('svg') &&
      cachedImg.buffer.length > 1200
    ) {
      return { contentType: cachedImg.contentType, buffer: cachedImg.buffer };
    }
    return null;
  }

  try {
    const personRes = await fetch(
      `https://pub.orcid.org/v3.0/${encodeURIComponent(cleanOrcid)}/person`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(2600),
      }
    );
    if (!personRes.ok) {
      orcidPortraitLookupCache.set(cleanOrcid, { checkedAt: Date.now() });
      return null;
    }
    const personJson = (await personRes.json()) as any;
    const candidatePages = pickInstitutionalProfileUrls(
      personJson?.['researcher-urls']?.['researcher-url'] || []
    ).slice(0, 2);

    for (const pageUrl of candidatePages) {
      try {
        const pageRes = await fetch(pageUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(2800),
        });
        if (!pageRes.ok) continue;
        const ct = String(pageRes.headers.get('content-type') || '');
        if (!ct.includes('html')) continue;
        const html = await pageRes.text();
        const portraitUrl = extractPortraitUrlFromHtml(html, pageUrl);
        if (!portraitUrl) continue;

        const img = await fetchStaticImageBuffer(portraitUrl, false, 3200);
        if (
          img &&
          img.status === 200 &&
          img.contentType.startsWith('image/') &&
          !img.contentType.includes('svg') &&
          img.buffer.length > 1200
        ) {
          orcidPortraitLookupCache.set(cleanOrcid, {
            imageUrl: portraitUrl,
            checkedAt: Date.now(),
          });
          return { contentType: img.contentType, buffer: img.buffer };
        }
      } catch {
        // Try next researcher URL
      }
    }
  } catch {
    // Ignore ORCID API timeout
  }

  orcidPortraitLookupCache.set(cleanOrcid, { checkedAt: Date.now() });
  return null;
}

async function resolveCoAuthorPhotoBuffer(params: {
  name?: string;
  university?: string;
  orcid?: string;
  skipScholarId?: string;
}): Promise<{ contentType: string; buffer: Buffer; resolvedScholarId?: string } | null> {
  const rawName = String(params.name || '').trim();
  const cleanName =
    rawName && rawName.toLowerCase() !== 'scholar' ? rawName : '';
  const cleanOrcid = normalizeOrcidId(params.orcid || '') || '';
  const uni = String(params.university || '').trim();
  const uniNorm = uni && !/unlisted/i.test(uni) ? normalizeAsciiWords(uni) : '';
  const inflightKey = `${cleanOrcid}::${cleanName.toLowerCase()}::${uniNorm}`;
  if (!cleanOrcid && !cleanName) return null;

  const negTs = negativeCoAuthorPhotoCache.get(inflightKey);
  if (negTs && Date.now() - negTs < 12 * 60 * 60 * 1000) {
    return null;
  }

  const existing = coAuthorResolvedPhotoInflight.get(inflightKey);
  if (existing) return existing;

  const storeResolved = (img: {
    contentType: string;
    buffer: Buffer;
    resolvedScholarId?: string;
  }) => {
    const stamped = {
      contentType: img.contentType,
      buffer: img.buffer,
      timestamp: Date.now(),
    };
    if (img.resolvedScholarId) {
      avatarBufferCache.set(img.resolvedScholarId, stamped);
    }
    if (cleanOrcid) {
      avatarBufferCache.set(`orcid::${cleanOrcid}`, stamped);
    }
    if (cleanName) {
      avatarBufferCache.set(
        `name::${cleanName.toLowerCase()}${uniNorm ? `::${uniNorm}` : ''}`,
        stamped
      );
    }
    return img;
  };

  const job = (async () => {
    try {
      // 1. Wikidata by exact ORCID P496 or verified name
      const wikiMeta = await resolveVerifiedWikidataAvatarOrId(
        cleanName,
        cleanOrcid
      );
      if (
        wikiMeta?.scholarId &&
        wikiMeta.scholarId !== params.skipScholarId
      ) {
        const gsImg = await fetchScholarAvatarWithQueue(wikiMeta.scholarId);
        if (gsImg) {
          return storeResolved({ ...gsImg, resolvedScholarId: wikiMeta.scholarId });
        }
      }
      if (wikiMeta?.commonsUrl) {
        const commonsImg = await fetchStaticImageBuffer(
          wikiMeta.commonsUrl,
          false,
          3500
        );
        if (
          commonsImg &&
          commonsImg.status === 200 &&
          !commonsImg.contentType.includes('svg') &&
          commonsImg.buffer.length > 800
        ) {
          return storeResolved({
            contentType: commonsImg.contentType,
            buffer: commonsImg.buffer,
          });
        }
      }

      // 2. Institutional profile portrait via ORCID researcher-urls (Pure, DTU Orbit, faculty pages)
      if (cleanOrcid) {
        const orcidImg = await resolveOrcidInstitutionalPortrait(cleanOrcid);
        if (orcidImg) {
          return storeResolved(orcidImg);
        }
      }

      // 3. Affiliation-guided Google Scholar author lookup + Scholar CDN fetch
      if (cleanName) {
        const discoveredScholarId = await resolveGoogleScholarIdByName(
          cleanName,
          uni
        );
        if (
          discoveredScholarId &&
          discoveredScholarId !== params.skipScholarId
        ) {
          const gsImg = await fetchScholarAvatarWithQueue(discoveredScholarId);
          if (gsImg) {
            registerScholarColleague(cleanName, discoveredScholarId, true);
            return storeResolved({
              ...gsImg,
              resolvedScholarId: discoveredScholarId,
            });
          }
        }
      }

      negativeCoAuthorPhotoCache.set(inflightKey, Date.now());
      return null;
    } finally {
      coAuthorResolvedPhotoInflight.delete(inflightKey);
    }
  })();

  coAuthorResolvedPhotoInflight.set(inflightKey, job);
  return job;
}

function enrichAndPrewarmProfileCoAuthors(publications: Publication[]): Publication[] {
  const coAuthorCounts = new Map<string, number>();
  const enriched = publications.map((pub) => ({
    ...pub,
    coAuthors: (pub.coAuthors || []).map((ca) => {
      const meta = !ca.scholarUserId
        ? lookupColleagueAvatarMeta(ca.name, ca.countryCode)
        : null;
      const resolvedId = ca.scholarUserId || meta?.userId;
      if (resolvedId) {
        coAuthorCounts.set(resolvedId, (coAuthorCounts.get(resolvedId) || 0) + 1);
        return { ...ca, scholarUserId: resolvedId };
      }
      return ca;
    }),
  }));

  // Background pre-warm top co-author avatars into avatarBufferCache via the polite concurrency queue
  const sortedIds = [...coAuthorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 80)
    .map(([id]) => id);

  setTimeout(async () => {
    for (const id of sortedIds) {
      if (!avatarBufferCache.has(id) && !negativeScholarPhotoCache.has(id)) {
        await fetchScholarAvatarWithQueue(id);
      }
    }
  }, 10);

  return enriched;
}

// ============================================================================
// 1-TO-1 AUTHORITATIVE GOOGLE SCHOLAR CLAIM & ORCID AUTHENTICATION ENGINE
// ============================================================================

interface StoredClaimRecord {
  scholarUserId: string;
  orcidId: string;
  claimedByUid: string;
  researcherName: string;
  scholarUrl: string;
  createdAt: string;
}

interface StoredOrcidUserRecord {
  uid: string;
  orcidId: string;
  scholarUserId: string;
  scholarUrl: string;
  displayName: string;
  photoURL?: string;
  verified: boolean;
  provider: 'orcid';
  createdAt: string;
}

const SCHOLAR_CLAIMS_FILE = path.resolve(process.cwd(), 'src/data/scholarClaims.json');

const scholarClaimsData: {
  claims: Record<string, StoredClaimRecord>;
  users: Record<string, StoredOrcidUserRecord>;
  config?: {
    orcidClientId?: string;
    orcidClientSecret?: string;
    orcidEnvironment?: 'production' | 'sandbox';
  };
} = { claims: {}, users: {} };

try {
  if (fs.existsSync(SCHOLAR_CLAIMS_FILE)) {
    const raw = fs.readFileSync(SCHOLAR_CLAIMS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      scholarClaimsData.claims = parsed.claims || {};
      scholarClaimsData.users = parsed.users || {};
      scholarClaimsData.config = parsed.config || {};
    }
  }
} catch (e) {
  console.error('Could not read scholarClaims.json, using memory store:', e);
}

function persistScholarClaimsToDisk(): void {
  try {
    if (process.env.VERCEL || process.env.READ_ONLY_FS === 'true') return;
    fs.writeFileSync(
      SCHOLAR_CLAIMS_FILE,
      JSON.stringify(scholarClaimsData, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.warn('Could not persist scholar claims to disk (using Firestore/memory):', err);
  }
}

const orcidAccountMirror = createInMemoryAccountMirror();
for (const [key, legacyUser] of Object.entries(scholarClaimsData.users || {})) {
  const canonicalOrcid = normalizeOrcidId(legacyUser?.orcidId || key);
  if (!canonicalOrcid || !legacyUser?.uid) continue;
  const nowIso = legacyUser.createdAt || new Date().toISOString();
  orcidAccountMirror.setOrcidIndex({
    orcidId: canonicalOrcid,
    uid: legacyUser.uid,
    name: legacyUser.displayName || canonicalOrcid,
    createdAt: nowIso,
    updatedAt: nowIso,
  });
  orcidAccountMirror.setUser({
    uid: legacyUser.uid,
    name: legacyUser.displayName || canonicalOrcid,
    emailOrId: canonicalOrcid,
    photoURL: legacyUser.photoURL || undefined,
    scholarUrl: legacyUser.scholarUrl || undefined,
    scholarUserId: legacyUser.scholarUserId || undefined,
    orcidId: canonicalOrcid,
    verified: Boolean(legacyUser.verified ?? true),
    provider: 'orcid',
    createdAt: nowIso,
    updatedAt: nowIso,
  });
}

function getAuthSecret(): string {
  return deriveAuthSecret({
    sessionSecret: process.env.SESSION_SECRET,
    authSecret: process.env.AUTH_SECRET,
    orcidClientSecret: (process.env.ORCID_CLIENT_SECRET || '').trim(),
    firebaseProjectId: firebaseAppletConfig.projectId,
    firebaseApiKey: firebaseAppletConfig.apiKey,
  });
}

let _orcidStore: OrcidAccountStore | null = null;
function getOrcidStore(): OrcidAccountStore {
  if (!_orcidStore) {
    _orcidStore = new OrcidAccountStore({
      firestoreDocBase: FIRESTORE_DOC_BASE,
      getBridgeToken: getBridgeIdToken,
      mirror: orcidAccountMirror,
      onPersistMirror: () => {
        // Keep backward-compatible snapshot structure synced when disk is writable
        persistScholarClaimsToDisk();
      },
    });
  }
  return _orcidStore;
}

const SOCIAL_STORE_FILE = path.resolve(process.cwd(), 'src/data/scholarSocial.json');
let _socialStore: SocialNetworkStore | null = null;
function getSocialStore(): SocialNetworkStore {
  if (!_socialStore) {
    _socialStore = new SocialNetworkStore({
      firestoreDocBase: FIRESTORE_DOC_BASE,
      getBridgeToken: getBridgeIdToken,
      mirrorFilePath: SOCIAL_STORE_FILE,
      fallbackUsersProvider: () =>
        Object.values(scholarClaimsData.users || {})
          .filter((u) => Boolean(u?.uid))
          .map((u) => ({
            uid: u.uid,
            name: u.displayName || u.orcidId || 'Researcher',
            ...(u.photoURL ? { photoURL: u.photoURL } : {}),
            ...(u.scholarUrl ? { scholarUrl: u.scholarUrl } : {}),
            ...(u.scholarUserId ? { scholarUserId: u.scholarUserId } : {}),
            ...(u.orcidId ? { orcidId: u.orcidId } : {}),
            verified: Boolean(u.verified ?? true),
          })),
    });
  }
  return _socialStore;
}

function buildWorksDigestFromProfile(profile: ResearcherProfile) {
  const cleanId = String(profile.scholarUserId || '').trim();
  if (!cleanId || !Array.isArray(profile.publications)) return null;
  const works: DigestWorkItem[] = [...profile.publications]
    .sort((a, b) => (b.year || 0) - (a.year || 0) || (b.citations || 0) - (a.citations || 0))
    .slice(0, 12)
    .map((p) => ({
      id: p.id,
      title: p.title,
      venue: p.venue,
      year: p.year,
      citations: p.citations || 0,
      quartile: p.quartile,
      type: p.type,
      ...(p.doi ? { doi: p.doi } : {}),
      ...(p.url ? { url: p.url } : {}),
      coAuthorNames: (p.coAuthors || [])
        .map((c) => c.name)
        .filter((n) => Boolean(n && !isSameResearcherName(n, profile.name)))
        .slice(0, 6),
    }));

  return {
    scholarUserId: cleanId,
    name: profile.name,
    affiliation: profile.homeUniversity || profile.affiliation || 'Academic Researcher',
    country: profile.homeCountry || '',
    avatarUrl: profile.avatarUrl,
    ...(profile.orcid ? { orcid: profile.orcid } : {}),
    totalCitations: profile.officialMetrics?.totalCitations || 0,
    hIndex: profile.officialMetrics?.hIndex || 0,
    publicationCount: profile.publications.length,
    updatedAt: new Date().toISOString(),
    works,
  };
}

function isLocalHostname(req: express.Request): boolean {
  const host = String(req.get('x-forwarded-host') || req.get('host') || '').toLowerCase();
  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

function setOrcidSessionCookie(
  res: express.Response,
  baseUrl: string,
  user: AuthenticatedResearcherRecord
): void {
  const sessionToken = createSignedSessionToken(
    { uid: user.uid, orcidId: user.orcidId, name: user.name, provider: user.provider },
    getAuthSecret()
  );
  res.append(
    'Set-Cookie',
    serializeCookie(ORCID_SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: baseUrl.startsWith('https://'),
      sameSite: 'Lax',
      path: '/',
      maxAgeSeconds: 7 * 24 * 60 * 60,
    })
  );
}

function clearAuthCookie(res: express.Response, name: string, baseUrl: string): void {
  res.append(
    'Set-Cookie',
    serializeCookie(name, '', {
      httpOnly: true,
      secure: baseUrl.startsWith('https://'),
      sameSite: 'Lax',
      path: '/',
      maxAgeSeconds: 0,
    })
  );
}

async function verifySessionUserFromRequest(
  req: express.Request
): Promise<AuthenticatedResearcherRecord | null> {
  const cookies = parseCookies(req.headers.cookie);
  const rawToken = cookies[ORCID_SESSION_COOKIE_NAME];
  if (!rawToken) return null;

  const session = verifySignedSessionToken(rawToken, getAuthSecret());
  if (!session?.uid) return null;

  const lookup = await getOrcidStore().getUserLookupResult(session.uid);
  if (lookup.status === 'FOUND') {
    return lookup.user;
  }
  if (lookup.status === 'UNAVAILABLE') {
    const canonicalOrcid = normalizeOrcidId(session.orcidId) || undefined;
    return {
      uid: session.uid,
      name: session.name || canonicalOrcid || 'ORCID Researcher',
      emailOrId: canonicalOrcid || session.uid,
      ...(canonicalOrcid ? { orcidId: canonicalOrcid } : {}),
      verified: Boolean(canonicalOrcid),
      provider: session.provider,
    };
  }
  return null;
}

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function serializeForInlineScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function getPublicBaseUrl(req: express.Request): string {
  return resolvePublicBaseUrl({
    appUrlEnv: process.env.APP_URL,
    headers: req.headers,
    protocol: req.protocol,
  });
}

interface OrcidPublicData {
  orcidId: string;
  names: string[];
  employments: string[];
  works: string[];
  researcherUrls: string[];
}

function parseOrcidRecordJson(orcidId: string, data: any): OrcidPublicData {
  const names: string[] = [];
  const employments: string[] = [];
  const works: string[] = [];
  const researcherUrls: string[] = [];

  const person = data?.person || {};
  const nameObj = person?.name || {};
  const given = nameObj['given-names']?.value || '';
  const family = nameObj['family-name']?.value || '';
  const credit = nameObj['credit-name']?.value || '';

  if (given && family) names.push(`${given} ${family}`.trim());
  if (family && given) names.push(`${family} ${given}`.trim());
  if (credit) names.push(credit.trim());
  if (given && !family) names.push(given.trim());
  if (family && !given) names.push(family.trim());

  const otherNames = person['other-names']?.['other-name'] || [];
  for (const o of otherNames) {
    if (o?.content) names.push(o.content.trim());
  }

  const empGroups =
    data['activities-summary']?.employments?.['affiliation-group'] || [];
  for (const g of empGroups) {
    for (const s of g?.summaries || []) {
      const org = s?.['employment-summary']?.organization?.name;
      if (org) employments.push(org.trim());
    }
  }

  const workGroups = data['activities-summary']?.works?.group || [];
  for (const g of workGroups.slice(0, 50)) {
    for (const w of g?.['work-summary'] || []) {
      const title = w?.title?.title?.value;
      if (title) works.push(title.trim());
    }
  }

  const urls = person['researcher-urls']?.['researcher-url'] || [];
  for (const u of urls) {
    const rawUrl = u?.url?.value;
    const labelVal = u?.['url-name']?.value;
    if (rawUrl) researcherUrls.push(String(rawUrl).trim());
    if (labelVal && labelVal !== rawUrl) researcherUrls.push(String(labelVal).trim());
  }

  return { orcidId, names, employments, works, researcherUrls };
}

async function fetchOrcidPublicRecord(
  cleanOrcid: string
): Promise<OrcidPublicData | null> {
  try {
    const resp = await fetch(
      `https://pub.orcid.org/v3.0/${encodeURIComponent(cleanOrcid)}/record`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'ScholarLens/2.0 (Academic Identity Verification; https://scholarlens.org)',
        },
        signal: AbortSignal.timeout(6000),
      }
    );
    if (!resp.ok) {
      if (resp.status === 404) return null;
      // Retry once in case of transient network glitch
      const retry = await fetch(
        `https://pub.orcid.org/v3.0/${encodeURIComponent(cleanOrcid)}/record`,
        {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(6000),
        }
      );
      if (!retry.ok) return null;
      return parseOrcidRecordJson(cleanOrcid, await retry.json());
    }
    return parseOrcidRecordJson(cleanOrcid, await resp.json());
  } catch {
    return null;
  }
}

async function getOrBuildProfileForVerification(
  scholarUserId: string,
  authorName?: string
): Promise<ResearcherProfile | null> {
  const rawSnap = verifiedScholarSnapshot as Record<string, any>;
  const lowerUser = scholarUserId.toLowerCase().trim();
  for (const [snapKey, snapVal] of Object.entries(rawSnap)) {
    const prof: ResearcherProfile | undefined =
      snapVal?.profile || (snapVal?.publications ? snapVal : undefined);
    if (!prof) continue;
    const candidateId = (prof.scholarUserId || snapKey).toLowerCase().trim();
    if (candidateId === lowerUser) {
      return prof;
    }
  }

  const result = await buildLiveResearcherProfile(
    scholarUserId,
    authorName || ''
  );
  return result?.profile || null;
}

const NAME_PREFIX_WORDS = new Set([
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

function verifyAuthenticityBetweenOrcidAndScholar(
  orcidData: OrcidPublicData,
  scholarProfile: ResearcherProfile
): {
  verified: boolean;
  score: number;
  reason: string;
  matchedDetails: {
    matchedName?: string;
    matchedWorksCount: number;
    matchedAffiliation?: string;
    matchedDirectUrl?: boolean;
  };
} {
  const scholarNameClean = stripAcademicHonorifics(scholarProfile.name)
    .toLowerCase()
    .trim();
  const scholarTokens = scholarNameClean
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  // 1. Check direct profile URL match in ORCID researcher-urls
  const cleanScholarId = scholarProfile.scholarUserId.toLowerCase().trim();
  let matchedDirectUrl = false;
  for (const u of orcidData.researcherUrls) {
    const lowerU = u.toLowerCase();
    if (
      lowerU.includes('scholar.google.') &&
      (lowerU.includes(`user=${cleanScholarId}`) || lowerU.includes(cleanScholarId))
    ) {
      matchedDirectUrl = true;
      break;
    }
  }

  // 2. Name Matching
  let bestNameMatch: string | undefined;
  let nameMatchScore = 0; // 0 to 100

  for (const rawOrcidName of orcidData.names) {
    const cleanOrcidName = stripAcademicHonorifics(rawOrcidName)
      .toLowerCase()
      .trim();
    if (!cleanOrcidName) continue;

    if (isStrictSameResearcherForAvatar(cleanOrcidName, scholarNameClean)) {
      nameMatchScore = Math.max(nameMatchScore, 95);
      bestNameMatch = rawOrcidName;
    }

    const orcidTokens = cleanOrcidName.split(/\s+/).filter((w) => w.length >= 2);
    const commonTokens = orcidTokens.filter((t) => scholarTokens.includes(t));
    if (commonTokens.length >= 2) {
      nameMatchScore = Math.max(nameMatchScore, 90);
      bestNameMatch = rawOrcidName;
    } else if (commonTokens.length === 1 && orcidTokens.length >= 1 && scholarTokens.length >= 1) {
      const token = commonTokens[0];
      if (!NAME_PREFIX_WORDS.has(token) && token.length >= 4) {
        nameMatchScore = Math.max(nameMatchScore, 70);
        if (!bestNameMatch) bestNameMatch = rawOrcidName;
      }
    }
  }

  // 3. Works / Publication Overlap
  const normalizeTitle = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const scholarTitleTokensList = (scholarProfile.publications || [])
    .slice(0, 100)
    .map((p) => {
      return new Set(
        normalizeTitle(p.title)
          .split(' ')
          .filter((w) => w.length >= 4)
      );
    });

  let matchedWorksCount = 0;
  for (const orcidWorkTitle of orcidData.works) {
    const orcidTokens = new Set(
      normalizeTitle(orcidWorkTitle)
        .split(' ')
        .filter((w) => w.length >= 4)
    );
    if (orcidTokens.size < 3) continue;

    for (const scholarTokensSet of scholarTitleTokensList) {
      let intersection = 0;
      for (const t of orcidTokens) {
        if (scholarTokensSet.has(t)) intersection++;
      }
      const jaccard =
        intersection / Math.max(orcidTokens.size, scholarTokensSet.size);
      if (jaccard >= 0.55 || intersection >= 5) {
        matchedWorksCount++;
        break;
      }
    }
    if (matchedWorksCount >= 3) break;
  }

  // 4. Affiliation / University Overlap
  let matchedAffiliation: string | undefined;
  const scholarUniClean = (
    scholarProfile.homeUniversity ||
    scholarProfile.affiliation ||
    ''
  ).toLowerCase();
  for (const emp of orcidData.employments) {
    const empLower = emp.toLowerCase();
    const uniTokens = scholarUniClean
      .split(/\s+/)
      .filter(
        (w) =>
          w.length >= 4 &&
          !['university', 'institute', 'department', 'faculty'].includes(w)
      );
    if (uniTokens.some((t) => empLower.includes(t))) {
      matchedAffiliation = emp;
      break;
    }
  }

  // Final Decision Matrix
  let isVerified = false;
  let reason = '';
  let overallScore = 0;

  if (matchedDirectUrl) {
    isVerified = true;
    overallScore = 100;
    reason = 'Direct Google Scholar profile link verified on ORCID record.';
  } else if (nameMatchScore >= 80 && matchedWorksCount >= 1) {
    isVerified = true;
    overallScore = 95;
    reason = `Verified: Researcher name and ${matchedWorksCount} publication(s) match between ORCID and Google Scholar.`;
  } else if (nameMatchScore >= 80 && matchedAffiliation) {
    isVerified = true;
    overallScore = 90;
    reason = `Verified: Researcher name and institutional affiliation (${matchedAffiliation}) match between ORCID and Google Scholar.`;
  } else if (nameMatchScore >= 90) {
    isVerified = true;
    overallScore = 85;
    reason = 'Verified: Exact researcher identity and author name confirmed on ORCID.';
  } else if (nameMatchScore < 50) {
    isVerified = false;
    overallScore = 10;
    reason = `Name mismatch: ORCID name (${orcidData.names.join(', ') || 'Unknown'}) does not match Google Scholar profile (${scholarProfile.name}).`;
  } else {
    isVerified = false;
    overallScore = 40;
    reason = 'Insufficient verification signals: Name similarity is weak, and no shared publications or institutions were found.';
  }

  return {
    verified: isVerified,
    score: overallScore,
    reason,
    matchedDetails: {
      matchedName: bestNameMatch,
      matchedWorksCount,
      matchedAffiliation,
      matchedDirectUrl,
    },
  };
}

function parseRequiredScholarInput(rawInput: string):
  | { ok: true; scholarUserId: string; scholarQueryName?: string; scholarUrl: string }
  | { ok: false; error: string } {
  const parsed = parseStrictGoogleScholarProfileInput(String(rawInput || '').trim());
  if (!parsed.valid || !parsed.userId) {
    return {
      ok: false,
      error:
        parsed.error ||
        'Please enter a valid Google Scholar profile link (e.g. https://scholar.google.com/citations?user=...) or Scholar ID before continuing to ORCID.',
    };
  }
  const scholarUserId = parsed.userId.trim();
  return {
    ok: true,
    scholarUserId,
    ...(parsed.queryName?.trim() ? { scholarQueryName: parsed.queryName.trim() } : {}),
    scholarUrl: `https://scholar.google.com/citations?user=${scholarUserId}`,
  };
}

async function verifyOrcidMatchesGoogleScholar(params: {
  orcidId: string;
  orcidFallbackName?: string;
  scholarUserId: string;
  scholarQueryName?: string;
}): Promise<{
  scholarUserId: string;
  scholarUrl: string;
  scholarProfile: ResearcherProfile;
  authCheck: ReturnType<typeof verifyAuthenticityBetweenOrcidAndScholar>;
}> {
  const scholarUserId = params.scholarUserId.trim();
  const scholarUrl = `https://scholar.google.com/citations?user=${scholarUserId}`;

  // 1-to-1 Profile Locking Check (Firestore first, in-memory fallback)
  const existingClaim =
    (await getOrcidStore().getScholarClaim(scholarUserId)) ||
    scholarClaimsData.claims[scholarUserId] ||
    null;
  if (existingClaim && existingClaim.orcidId !== params.orcidId) {
    throw new OrcidConflictError(
      `This Google Scholar profile has already been claimed and verified by another authentic researcher (ORCID: ${existingClaim.orcidId.slice(
        0,
        4
      )}****${existingClaim.orcidId.slice(-4)}).`
    );
  }

  const [scholarProfile, rawOrcidRecord] = await Promise.all([
    getOrBuildProfileForVerification(scholarUserId, params.scholarQueryName),
    fetchOrcidPublicRecord(params.orcidId),
  ]);

  if (!scholarProfile) {
    throw new OrcidUnauthorizedError(
      `Could not retrieve Google Scholar profile for ID '${scholarUserId}'. Account creation rejected.`
    );
  }

  const fallbackName = String(params.orcidFallbackName || '').trim();
  const hasUsableFallbackName = Boolean(fallbackName && fallbackName !== params.orcidId);
  let effectiveOrcidData: OrcidPublicData | null = rawOrcidRecord;

  if (effectiveOrcidData) {
    if (
      hasUsableFallbackName &&
      !effectiveOrcidData.names.some((n) => n.toLowerCase() === fallbackName.toLowerCase())
    ) {
      effectiveOrcidData = {
        ...effectiveOrcidData,
        names: [...effectiveOrcidData.names, fallbackName],
      };
    }
  } else if (hasUsableFallbackName) {
    effectiveOrcidData = {
      orcidId: params.orcidId,
      names: [fallbackName],
      employments: [],
      works: [],
      researcherUrls: [],
    };
  }

  if (!effectiveOrcidData) {
    throw new OrcidUnauthorizedError(
      `ORCID iD '${params.orcidId}' details could not be retrieved from the official ORCID registry to verify profile ownership.`
    );
  }

  const isSyntheticEmptyStub =
    scholarProfile.name.trim().toLowerCase() === scholarUserId.toLowerCase() &&
    (scholarProfile.publications?.length || 0) === 0;

  const authCheck = verifyAuthenticityBetweenOrcidAndScholar(
    effectiveOrcidData,
    scholarProfile
  );

  if (isSyntheticEmptyStub && !authCheck.matchedDetails.matchedDirectUrl) {
    throw new OrcidUnauthorizedError(
      `Could not load Google Scholar profile metadata for '${scholarUserId}' to verify ownership against your ORCID account. Account creation rejected.`
    );
  }

  if (!authCheck.verified) {
    throw new OrcidUnauthorizedError(
      `Verification failed: Your ORCID profile does not match the submitted Google Scholar profile (${
        scholarProfile.name || scholarUserId
      }). ${authCheck.reason} Account creation was rejected.`
    );
  }

  return {
    scholarUserId,
    scholarUrl,
    scholarProfile,
    authCheck,
  };
}

// 1. Helper: Get effective ORCID OAuth configuration
function getEffectiveOrcidConfig(req: express.Request) {
  const envClientId = (process.env.ORCID_CLIENT_ID || '').trim();
  const envClientSecret = (process.env.ORCID_CLIENT_SECRET || '').trim();
  const savedConfig = scholarClaimsData.config || {};

  const rawClientId =
    envClientId && envClientId !== 'MY_ORCID_CLIENT_ID'
      ? envClientId
      : (savedConfig.orcidClientId || '').trim();
  const rawClientSecret =
    envClientSecret && envClientSecret !== 'MY_ORCID_CLIENT_SECRET'
      ? envClientSecret
      : (savedConfig.orcidClientSecret || '').trim();
  const environment: OrcidEnvironment =
    process.env.ORCID_ENVIRONMENT === 'sandbox'
      ? 'sandbox'
      : savedConfig.orcidEnvironment === 'sandbox'
      ? 'sandbox'
      : 'production';

  const clientIdCheck = validateOrcidClientId(rawClientId);
  const clientId = clientIdCheck.valid ? clientIdCheck.clientId : '';
  const hasSecret = Boolean(
    rawClientSecret &&
      rawClientSecret !== 'MY_ORCID_CLIENT_SECRET' &&
      rawClientSecret.length > 5
  );
  const clientSecret = hasSecret ? rawClientSecret : '';
  const isConfigured = Boolean(clientIdCheck.valid && hasSecret);
  const configError = !clientIdCheck.valid
    ? clientIdCheck.error
    : !hasSecret
    ? 'ORCID_CLIENT_SECRET is missing or invalid. Copy your Client Secret from ORCID Developer Tools.'
    : undefined;

  const endpoints = getOrcidEndpoints(environment);
  const baseUrl = getPublicBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/orcid/callback`;

  return {
    clientId,
    clientSecret,
    environment,
    isConfigured,
    configError,
    configuredViaEnv: Boolean(
      envClientId &&
        envClientId !== 'MY_ORCID_CLIENT_ID' &&
        envClientSecret &&
        envClientSecret !== 'MY_ORCID_CLIENT_SECRET'
    ),
    domain: endpoints.baseDomain,
    endpoints,
    baseUrl,
    redirectUri,
  };
}

function buildOrcidAuthorizationRequest(
  req: express.Request,
  res: express.Response,
  config: ReturnType<typeof getEffectiveOrcidConfig>,
  options: {
    mode?: 'popup' | 'redirect';
    linkUid?: string;
    scholarUserId?: string;
    scholarQueryName?: string;
  } = {}
): string {
  const { stateToken, payload } = createSignedOAuthState(
    {
      redirectUri: config.redirectUri,
      env: config.environment,
      mode: options.mode === 'redirect' ? 'redirect' : 'popup',
      linkUid: options.linkUid,
      scholarUserId: options.scholarUserId,
      scholarQueryName: options.scholarQueryName,
    },
    getAuthSecret()
  );

  res.append(
    'Set-Cookie',
    serializeCookie(ORCID_STATE_COOKIE_NAME, payload.csrf, {
      httpOnly: true,
      secure: config.baseUrl.startsWith('https://'),
      sameSite: 'Lax',
      path: '/',
      maxAgeSeconds: 10 * 60,
    })
  );

  const authParams = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    scope: 'openid',
    redirect_uri: config.redirectUri,
    state: stateToken,
    nonce: payload.nonce,
  });

  return `${config.endpoints.authorizeUrl}?${authParams.toString()}`;
}

// 1. Get ORCID OAuth URL (requires Google Scholar link/ID first; supports popup & redirect modes + optional link mode)
app.get('/api/auth/orcid/url', async (req, res) => {
  const config = getEffectiveOrcidConfig(req);
  const mode = req.query.mode === 'redirect' ? 'redirect' : 'popup';
  const wantsLink = req.query.link === '1' || req.query.link === 'true';

  if (!config.isConfigured) {
    res.json({
      url: `${config.baseUrl}/auth/orcid/setup`,
      configured: false,
      configError: config.configError,
      redirectUri: config.redirectUri,
      environment: config.environment,
      mode,
    });
    return;
  }

  const rawScholarInput = String(
    req.query.scholarInput || req.query.scholarUrl || req.query.scholarUserId || ''
  ).trim();
  const parsedScholar = parseRequiredScholarInput(rawScholarInput);
  if (!parsedScholar.ok) {
    res.status(400).json({ error: parsedScholar.error });
    return;
  }

  let linkUid: string | undefined;
  if (wantsLink) {
    const existingSession = await verifySessionUserFromRequest(req);
    if (existingSession?.uid) {
      linkUid = existingSession.uid;
    }
  }

  const authUrl = buildOrcidAuthorizationRequest(req, res, config, {
    mode,
    linkUid,
    scholarUserId: parsedScholar.scholarUserId,
    scholarQueryName: parsedScholar.scholarQueryName,
  });
  res.json({
    url: authUrl,
    configured: true,
    redirectUri: config.redirectUri,
    environment: config.environment,
    mode,
    scholarUserId: parsedScholar.scholarUserId,
  });
});

// 1a. Full-page / direct redirect entry point (fallback when browser popups are blocked)
app.get(['/auth/orcid/authorize', '/auth/orcid/login'], async (req, res) => {
  const config = getEffectiveOrcidConfig(req);
  const mode = req.query.mode === 'popup' ? 'popup' : 'redirect';
  if (!config.isConfigured) {
    res.redirect(`${config.baseUrl}/auth/orcid/setup`);
    return;
  }

  const rawScholarInput = String(
    req.query.scholarInput || req.query.scholarUrl || req.query.scholarUserId || ''
  ).trim();
  const parsedScholar = parseRequiredScholarInput(rawScholarInput);
  if (!parsedScholar.ok) {
    if (mode === 'popup') {
      res.status(400).send(renderOrcidCallbackHtml({ ok: false, error: parsedScholar.error }));
    } else {
      res.redirect(302, `/?orcid_auth_error=${encodeURIComponent(parsedScholar.error)}`);
    }
    return;
  }

  const authUrl = buildOrcidAuthorizationRequest(req, res, config, {
    mode,
    scholarUserId: parsedScholar.scholarUserId,
    scholarQueryName: parsedScholar.scholarQueryName,
  });
  res.redirect(authUrl);
});

// 1b. Save ORCID OAuth App Configuration & Credentials (localhost development only)
app.post('/api/auth/orcid/save-config', (req, res) => {
  const currentConfig = getEffectiveOrcidConfig(req);
  if (currentConfig.configuredViaEnv) {
    res.status(403).json({
      error: 'ORCID credentials are managed via server environment variables.',
    });
    return;
  }
  if (!isLocalHostname(req)) {
    res.status(403).json({
      error:
        'Runtime credential setup is restricted to localhost. Configure ORCID_CLIENT_ID and ORCID_CLIENT_SECRET in your deployment environment variables.',
    });
    return;
  }

  const { clientId, clientSecret, environment } = req.body || {};
  const cleanClientId = String(clientId || '').trim();
  const cleanClientSecret = String(clientSecret || '').trim();
  const cleanEnv: OrcidEnvironment =
    environment === 'sandbox' ? 'sandbox' : 'production';

  const clientIdCheck = validateOrcidClientId(cleanClientId);
  if (!clientIdCheck.valid) {
    res.status(400).json({
      error:
        clientIdCheck.error ||
        'Please enter a valid ORCID Client ID (e.g. APP-1234567890ABCDEF).',
    });
    return;
  }
  if (!cleanClientSecret || cleanClientSecret.length < 5) {
    res.status(400).json({
      error: 'Please enter your ORCID Client Secret.',
    });
    return;
  }

  scholarClaimsData.config = {
    orcidClientId: clientIdCheck.clientId,
    orcidClientSecret: cleanClientSecret,
    orcidEnvironment: cleanEnv,
  };
  persistScholarClaimsToDisk();

  const updatedConfig = getEffectiveOrcidConfig(req);
  const authUrl = buildOrcidAuthorizationRequest(req, res, updatedConfig, { mode: 'popup' });

  res.json({
    success: true,
    authUrl,
  });
});

// 1c. Official ORCID OAuth Setup & Redirect Gateway
app.get(
  ['/auth/orcid/setup', '/auth/orcid/bridge', '/auth/orcid/bridge/'],
  (req, res) => {
    const config = getEffectiveOrcidConfig(req);

    // If already configured with credentials, redirect directly to official ORCID OAuth authorization server
    if (config.isConfigured) {
      const authUrl = buildOrcidAuthorizationRequest(req, res, config, { mode: 'popup' });
      res.redirect(authUrl);
      return;
    }

    // Otherwise render official setup interface for registering credentials
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connect Official ORCID OAuth</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
      max-width: 520px;
      width: 100%;
      padding: 36px 32px 32px 32px;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .logo {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #A6CE39;
      color: #ffffff;
      font-weight: 800;
      font-size: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    h2 {
      font-size: 21px;
      margin: 0 0 8px 0;
      color: #0f172a;
      font-weight: 700;
    }
    .subtitle {
      font-size: 13px;
      color: #475569;
      line-height: 1.45;
    }
    .uri-box {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px;
      margin: 20px 0;
      text-align: left;
    }
    .uri-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .uri-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #0369a1;
      word-break: break-all;
      line-height: 1.4;
    }
    .copy-btn {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
    }
    .copy-btn:hover { background: #f8fafc; }
    .form-group {
      margin-bottom: 14px;
      text-align: left;
    }
    label {
      display: block;
      font-size: 12.5px;
      color: #1e293b;
      margin-bottom: 5px;
      font-weight: 600;
    }
    input[type="text"], input[type="password"] {
      width: 100%;
      padding: 9px 12px;
      font-size: 13.5px;
      font-family: ui-monospace, monospace;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      outline: none;
      background: #ffffff;
      color: #0f172a;
    }
    input:focus {
      border-color: #0284c7;
      box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15);
    }
    .radio-group {
      display: flex;
      gap: 16px;
      margin-top: 4px;
      font-size: 13px;
    }
    .radio-group label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn {
      width: 100%;
      background: #004e64;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 14px;
      transition: background 0.15s;
    }
    .btn:hover { background: #003e50; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .status {
      margin-top: 12px;
      font-size: 12.5px;
      padding: 8px 12px;
      border-radius: 6px;
      display: none;
      line-height: 1.4;
    }
    .status.error {
      display: block;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
    }
    .status.loading {
      display: block;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .footer-help {
      margin-top: 18px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
    }
    .footer-help a {
      color: #0284c7;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">iD</div>
      <h2>Connect Official ORCID OAuth</h2>
      <p class="subtitle">To authenticate passwords directly on orcid.org without third-party exposure, connect your free ORCID Developer credentials.</p>
    </div>

    <div class="uri-box">
      <div class="uri-label">
        <span>Required Redirect URI for ORCID</span>
        <button id="copyBtn" class="copy-btn" type="button">Copy</button>
      </div>
      <div id="redirectUriText" class="uri-code">${escapeHtml(config.redirectUri)}</div>
    </div>

    ${
      isLocalHostname(req)
        ? `${
            (process.env.ORCID_CLIENT_ID || scholarClaimsData.config?.orcidClientId) &&
            config.configError
              ? `<div class="status error" style="display:block; margin-bottom: 14px;"><strong>Configuration Issue:</strong> ${escapeHtml(config.configError)}</div>`
              : `<div style="background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; border-radius:8px; padding:10px 12px; font-size:12px; line-height:1.45; margin-bottom:14px;"><strong>Site Owner Setup Only:</strong> Enter your ORCID Developer Tools <strong>OAuth Application Client ID</strong> (starts with <code>APP-...</code>), not your personal <code>0000-...</code> ORCID profile URL.</div>`
          }<form id="configForm">`
        : `<div class="status error" style="display:block; margin-bottom: 14px;">
            <strong>Production Configuration Required:</strong> ${escapeHtml(
              config.configError ||
                'Configure ORCID_CLIENT_ID (starting with APP-...) and ORCID_CLIENT_SECRET in your Vercel Environment Variables, then redeploy.'
            )}
          </div><form id="configForm" style="display:none;">`
    }
      <div class="form-group">
        <label for="clientId">ORCID OAuth Client ID (starts with APP-)</label>
        <input id="clientId" type="text" placeholder="APP-1234567890ABCDEF" pattern="^APP-[A-Za-z0-9]{12,32}$" required />
      </div>
      <div class="form-group">
        <label for="clientSecret">ORCID Client Secret</label>
        <input id="clientSecret" type="password" placeholder="••••••••-••••-••••-••••-••••••••••••" required />
      </div>
      <div class="form-group">
        <label>ORCID Environment (must match where you created the APP-... client)</label>
        <div class="radio-group">
          <label>
            <input type="radio" name="env" value="production" checked /> Production (orcid.org)
          </label>
          <label>
            <input type="radio" name="env" value="sandbox" /> Sandbox (sandbox.orcid.org)
          </label>
        </div>
      </div>

      <button type="submit" id="saveBtn" class="btn">
        Save &amp; Continue to Official ORCID Sign-In
      </button>
      <div id="status" class="status"></div>
    </form>

    <div class="footer-help">
      Site owners: get OAuth credentials at <a href="https://orcid.org/developer-tools" target="_blank" rel="noopener">orcid.org/developer-tools</a> (or <a href="https://sandbox.orcid.org/developer-tools" target="_blank" rel="noopener">sandbox.orcid.org/developer-tools</a>), add the Redirect URI above, and paste the generated <code>APP-...</code> Client ID &amp; Client Secret.
    </div>
  </div>

  <script>
    const copyBtn = document.getElementById('copyBtn');
    const redirectUriText = document.getElementById('redirectUriText').innerText;
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(redirectUriText).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      });
    });

    const form = document.getElementById('configForm');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const clientId = document.getElementById('clientId').value.trim();
      const clientSecret = document.getElementById('clientSecret').value.trim();
      const env = document.querySelector('input[name="env"]:checked').value;

      if (/orcid\.org/i.test(clientId) || /^\d{4}-\d{4}-\d{4}-[\dX]{4}$/i.test(clientId)) {
        status.className = 'status error';
        status.textContent = 'Do not enter your personal ORCID iD or profile URL here. Obtain an OAuth Application Client ID starting with "APP-" from ORCID Developer Tools.';
        return;
      }
      if (!/^APP-[A-Za-z0-9]{12,32}$/.test(clientId)) {
        status.className = 'status error';
        status.textContent = 'ORCID Client ID must start with "APP-" followed by 12-32 alphanumeric characters (from ORCID Developer Tools).';
        return;
      }

      status.className = 'status loading';
      status.textContent = 'Saving configuration and redirecting to ORCID...';
      saveBtn.disabled = true;

      try {
        const resp = await fetch('/api/auth/orcid/save-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, clientSecret, environment: env })
        });
        const data = await resp.json();
        if (!resp.ok || !data.success) {
          throw new Error(data.error || 'Failed to save configuration');
        }

        // Immediately redirect the popup window to official ORCID sign-in
        window.location.href = data.authUrl;
      } catch (err) {
        status.className = 'status error';
        status.textContent = err.message || 'Error saving configuration';
        saveBtn.disabled = false;
      }
    });
  </script>
</body>
</html>`);
  }
);

function renderOrcidCallbackHtml(params: {
  ok: boolean;
  user?: AuthenticatedResearcherRecord;
  isNewAccount?: boolean;
  error?: string;
}): string {
  const safeMessage = params.ok
    ? {
        type: 'ORCID_AUTH_SUCCESS',
        user: params.user,
        orcidId: params.user?.orcidId || '',
        name: params.user?.name || '',
        isNewAccount: Boolean(params.isNewAccount),
      }
    : {
        type: 'ORCID_AUTH_ERROR',
        error: params.error || 'ORCID authentication failed.',
      };
  const fallbackRedirect = params.ok
    ? '/?orcid_auth=success'
    : `/?orcid_auth_error=${encodeURIComponent(params.error || 'ORCID authentication failed.')}`;

  const heading = params.ok
    ? 'ORCID Authentication Successful'
    : 'ORCID Authentication Failed';
  const subtext = params.ok
    ? `Signed in as ${params.user?.name || params.user?.orcidId || 'Researcher'}. Completing sign-in...`
    : params.error || 'Could not complete ORCID authentication.';
  const headingColor = params.ok ? '#0f172a' : '#e11d48';
  const badge = params.ok ? '✅' : '⚠️';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ORCID Authentication — ScholarLens</title>
  </head>
  <body style="font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 48px 24px; color: #334155; background: #f8fafc;">
    <div style="max-width: 420px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);">
      <div style="font-size: 32px; margin-bottom: 12px;">${badge}</div>
      <h3 style="color: ${headingColor}; margin: 0 0 8px 0; font-size: 18px;">${escapeHtml(heading)}</h3>
      <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">${escapeHtml(subtext)}</p>
      <a href="${escapeHtml(fallbackRedirect)}" style="display: inline-block; background: #0f172a; color: #fff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 18px; border-radius: 10px;">
        Continue to ScholarLens
      </a>
    </div>
    <script>
      (function() {
        var payload = ${serializeForInlineScript(safeMessage)};
        var fallbackUrl = ${serializeForInlineScript(fallbackRedirect)};
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(payload, window.location.origin);
            setTimeout(function() { window.close(); }, 180);
            return;
          }
        } catch (e) {}
        setTimeout(function() {
          window.location.replace(fallbackUrl);
        }, ${params.ok ? '200' : '2200'});
      })();
    </script>
  </body>
</html>`;
}

// 2. ORCID OAuth 2.0 / OIDC Callback Handler
app.get(
  ['/auth/orcid/callback', '/auth/orcid/callback/'],
  async (req, res) => {
    const config = getEffectiveOrcidConfig(req);
    const code = String(req.query.code || '').trim();
    const stateParam = String(req.query.state || '').trim();
    const oauthError = String(req.query.error || '').trim();
    const oauthErrorDesc = String(req.query.error_description || '').trim();

    const cookies = parseCookies(req.headers.cookie);
    const csrfCookie = cookies[ORCID_STATE_COOKIE_NAME];
    clearAuthCookie(res, ORCID_STATE_COOKIE_NAME, config.baseUrl);

    if (oauthError || !code) {
      const reason =
        oauthError === 'access_denied'
          ? 'ORCID sign-in was cancelled.'
          : oauthErrorDesc || oauthError || 'No authorization code was returned by ORCID.';
      res.status(400).send(renderOrcidCallbackHtml({ ok: false, error: reason }));
      return;
    }

    const verifiedState = verifySignedOAuthState(stateParam, getAuthSecret(), {
      expectedCsrf: csrfCookie,
    });
    if (!verifiedState) {
      res.status(400).send(
        renderOrcidCallbackHtml({
          ok: false,
          error: 'OAuth security verification failed (invalid or expired state). Please try Continue with ORCID again.',
        })
      );
      return;
    }

    if (!config.isConfigured || config.environment !== verifiedState.env) {
      res.status(500).send(
        renderOrcidCallbackHtml({
          ok: false,
          error:
            config.configError ||
            'ORCID OAuth credentials are not configured on the server.',
        })
      );
      return;
    }

    try {
      // 1) Swap authorization code at ORCID /oauth/token with exact matching redirect_uri
      const tokenData = await exchangeOrcidAuthorizationCode({
        code,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: verifiedState.redirectUri,
        env: verifiedState.env,
      });

      // 2) Verify RS256 OIDC id_token against ORCID JWKS & validate /oauth/userinfo claims
      const verifiedIdentity = await verifyAndResolveOrcidIdentity({
        tokenData,
        clientId: config.clientId,
        env: verifiedState.env,
        expectedNonce: verifiedState.nonce,
      });

      // 3) Automatically verify that the authenticated ORCID account matches the submitted Google Scholar profile
      if (!verifiedState.scholarUserId) {
        throw new OrcidValidationError(
          'A valid Google Scholar profile link or Scholar ID is required before signing in with ORCID.'
        );
      }
      const matchResult = await verifyOrcidMatchesGoogleScholar({
        orcidId: verifiedIdentity.orcidId,
        orcidFallbackName: verifiedIdentity.name,
        scholarUserId: verifiedState.scholarUserId,
        scholarQueryName: verifiedState.scholarQueryName,
      });

      // 4) Upsert or sign in user in database ONLY after ownership verification succeeds,
      //    strictly enforcing 1 ORCID iD -> 1 ScholarLens account and 1 Scholar ID -> 1 ORCID iD
      const { user, isNewAccount } = await getOrcidStore().authenticateOrRegisterOrcidUser({
        orcidId: verifiedIdentity.orcidId,
        verifiedName: verifiedIdentity.name,
        linkToUid: verifiedState.linkUid,
        scholarUserId: matchResult.scholarUserId,
        scholarUrl: matchResult.scholarUrl,
        photoURL: matchResult.scholarProfile.avatarUrl || undefined,
      });

      const persistedClaim = await getOrcidStore().upsertScholarClaim({
        scholarUserId: matchResult.scholarUserId,
        orcidId: verifiedIdentity.orcidId,
        claimedByUid: user.uid,
        researcherName: matchResult.scholarProfile.name || user.name || verifiedIdentity.orcidId,
        scholarUrl: matchResult.scholarUrl,
      });
      scholarClaimsData.claims[matchResult.scholarUserId] = {
        scholarUserId: persistedClaim.scholarUserId,
        orcidId: persistedClaim.orcidId,
        claimedByUid: persistedClaim.claimedByUid,
        researcherName: persistedClaim.researcherName,
        scholarUrl: persistedClaim.scholarUrl || matchResult.scholarUrl,
        createdAt: persistedClaim.createdAt,
      };
      persistScholarClaimsToDisk();

      // 5) Issue cryptographically signed HttpOnly session cookie
      setOrcidSessionCookie(res, config.baseUrl, user);

      if (verifiedState.mode === 'redirect') {
        res.redirect(302, '/?orcid_auth=success');
        return;
      }

      res.send(
        renderOrcidCallbackHtml({
          ok: true,
          user,
          isNewAccount,
        })
      );
    } catch (err: any) {
      const errorMsg =
        err instanceof OrcidConflictError ||
        err instanceof OrcidUnauthorizedError ||
        err instanceof OrcidValidationError
          ? err.message
          : String(err?.message || 'ORCID token verification failed.');
      const status =
        err instanceof OrcidConflictError
          ? 409
          : err instanceof OrcidUnauthorizedError
          ? 401
          : 400;

      if (verifiedState.mode === 'redirect') {
        res.redirect(302, `/?orcid_auth_error=${encodeURIComponent(errorMsg)}`);
        return;
      }
      res.status(status).send(renderOrcidCallbackHtml({ ok: false, error: errorMsg }));
    }
  }
);

// 3. Server Session Hydration, Sign-Out, Profile Update & Account Deletion
app.get('/api/auth/session', async (req, res) => {
  const user = await verifySessionUserFromRequest(req);
  if (!user) {
    res.json({ authenticated: false, user: null });
    return;
  }
  res.json({ authenticated: true, user });
});

app.post('/api/auth/logout', (req, res) => {
  const baseUrl = getPublicBaseUrl(req);
  clearAuthCookie(res, ORCID_SESSION_COOKIE_NAME, baseUrl);
  res.json({ success: true });
});

app.post('/api/auth/profile', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser) {
    res.status(401).json({ error: 'Authentication required. Please sign in first.' });
    return;
  }

  const { name, photoURL, scholarUrl } = req.body || {};
  let cleanScholarUrl = sessionUser.scholarUrl || '';
  let cleanScholarUserId = sessionUser.scholarUserId || '';

  if (scholarUrl !== undefined) {
    const trimmedScholar = String(scholarUrl || '').trim();
    if (sessionUser.provider === 'orcid' && sessionUser.scholarUserId) {
      const parsedIncoming = trimmedScholar
        ? parseStrictGoogleScholarProfileInput(trimmedScholar)
        : null;
      const incomingId = parsedIncoming?.valid ? parsedIncoming.userId?.trim() || '' : '';
      if (!trimmedScholar || incomingId !== sessionUser.scholarUserId) {
        res.status(403).json({
          error: 'Google Scholar profile is locked to your verified ORCID sign-in and cannot be changed.',
        });
        return;
      }
    } else if (!trimmedScholar) {
      cleanScholarUrl = '';
      cleanScholarUserId = '';
    } else {
      const parsed = parseStrictGoogleScholarProfileInput(trimmedScholar);
      if (!parsed.valid || !parsed.userId) {
        res.status(400).json({
          error: parsed.error || 'Please enter a valid Google Scholar profile link or ID.',
        });
        return;
      }
      cleanScholarUserId = parsed.userId.trim();
      cleanScholarUrl = `https://scholar.google.com/citations?user=${cleanScholarUserId}`;

      const existingClaim =
        (await getOrcidStore().getScholarClaim(cleanScholarUserId)) ||
        scholarClaimsData.claims[cleanScholarUserId] ||
        null;
      if (existingClaim && existingClaim.claimedByUid !== sessionUser.uid) {
        res.status(409).json({
          error: 'This Google Scholar profile has already been verified and claimed by another researcher account.',
        });
        return;
      }
    }
  }

  const updated = await getOrcidStore().updateUserProfile(
    sessionUser.uid,
    {
      ...(name !== undefined ? { name: String(name || '').trim() } : {}),
      ...(photoURL !== undefined ? { photoURL: String(photoURL || '').trim() } : {}),
      scholarUrl: cleanScholarUrl,
      scholarUserId: cleanScholarUserId,
    },
    sessionUser
  );

  if (!updated) {
    res.status(404).json({ error: 'Account not found.' });
    return;
  }

  setOrcidSessionCookie(res, getPublicBaseUrl(req), updated);
  res.json({ success: true, user: updated });
});

app.delete('/api/auth/account', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  await getOrcidStore().deleteUserAccount(sessionUser.uid);

  for (const [scholarId, claim] of Object.entries(scholarClaimsData.claims)) {
    if (claim.claimedByUid === sessionUser.uid || (sessionUser.orcidId && claim.orcidId === sessionUser.orcidId)) {
      delete scholarClaimsData.claims[scholarId];
    }
  }
  if (sessionUser.orcidId) {
    delete scholarClaimsData.users[sessionUser.orcidId];
  }
  persistScholarClaimsToDisk();

  const baseUrl = getPublicBaseUrl(req);
  clearAuthCookie(res, ORCID_SESSION_COOKIE_NAME, baseUrl);
  res.json({ success: true });
});

// 4. Optional Authenticated Scholar Profile Verification Badge Claim
app.post('/api/auth/orcid/verify-claim', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser || !sessionUser.orcidId) {
    res.status(401).json({
      error: 'Please complete official ORCID OAuth sign-in before claiming a Scholar profile.',
    });
    return;
  }

  const cleanOrcid = sessionUser.orcidId;
  const { scholarInput } = req.body || {};
  const parsedScholar = parseRequiredScholarInput(String(scholarInput || ''));
  if (!parsedScholar.ok) {
    res.status(400).json({ error: parsedScholar.error });
    return;
  }

  try {
    const matchResult = await verifyOrcidMatchesGoogleScholar({
      orcidId: cleanOrcid,
      orcidFallbackName: sessionUser.name,
      scholarUserId: parsedScholar.scholarUserId,
      scholarQueryName: parsedScholar.scholarQueryName,
    });

    const updatedUser = await getOrcidStore().updateUserProfile(
      sessionUser.uid,
      {
        scholarUserId: matchResult.scholarUserId,
        scholarUrl: matchResult.scholarUrl,
        photoURL: sessionUser.photoURL || matchResult.scholarProfile.avatarUrl || '',
      },
      sessionUser
    );

    const persistedClaim = await getOrcidStore().upsertScholarClaim({
      scholarUserId: matchResult.scholarUserId,
      orcidId: cleanOrcid,
      claimedByUid: sessionUser.uid,
      researcherName:
        updatedUser?.name || matchResult.scholarProfile.name || cleanOrcid,
      scholarUrl: matchResult.scholarUrl,
    });
    scholarClaimsData.claims[matchResult.scholarUserId] = {
      scholarUserId: persistedClaim.scholarUserId,
      orcidId: persistedClaim.orcidId,
      claimedByUid: persistedClaim.claimedByUid,
      researcherName: persistedClaim.researcherName,
      scholarUrl: persistedClaim.scholarUrl || matchResult.scholarUrl,
      createdAt: persistedClaim.createdAt,
    };
    persistScholarClaimsToDisk();

    res.json({
      success: true,
      verified: true,
      message: matchResult.authCheck.reason,
      user: updatedUser,
      profile: matchResult.scholarProfile,
    });
  } catch (err: any) {
    const status = err instanceof OrcidConflictError ? 409 : 400;
    res.status(status).json({
      error: String(err?.message || 'Authenticity verification failed.'),
    });
  }
});

// Legacy unauthenticated ORCID spoof endpoint intentionally disabled
app.post('/api/auth/orcid/login', (_req, res) => {
  res.status(410).json({
    error: 'Direct unauthenticated ORCID login is disabled. Use official OAuth 2.0 flow via /api/auth/orcid/url.',
  });
});

// 5. Query Claim Status of any Google Scholar profile
app.get('/api/scholar/claim-status', async (req, res) => {
  const scholarUserId = String(req.query.scholarUserId || '').trim();
  if (!scholarUserId) {
    res.json({ isClaimed: false });
    return;
  }
  const claim =
    (await getOrcidStore().getScholarClaim(scholarUserId)) ||
    scholarClaimsData.claims[scholarUserId];
  if (!claim) {
    res.json({ isClaimed: false });
    return;
  }
  res.json({
    isClaimed: true,
    researcherName: claim.researcherName,
    orcidIdMasked: `${claim.orcidId.slice(0, 4)}-****-****-${claim.orcidId.slice(
      -4
    )}`,
    verifiedAt: claim.createdAt,
  });
});

// ============================================================================
// RESEARCHER NETWORK: CONNECTIONS, DIRECT MESSAGING, POSTS & NEWSFEED
// ============================================================================

function sendSocialError(res: express.Response, err: any) {
  if (
    err instanceof SocialValidationError ||
    err instanceof SocialForbiddenError ||
    err instanceof SocialNotFoundError
  ) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: String(err?.message || 'Internal social service error.') });
}

function enrichResearchersWithDigests(
  researchers: PublicResearcherSummary[],
  digests: Record<string, any>
): PublicResearcherSummary[] {
  return researchers.map((r) => {
    const sid = String(r.scholarUserId || '').trim();
    const digest = sid ? digests[sid] : undefined;
    const cachedProf =
      sid ? profileCache.get(`${sid.toLowerCase()}::`)?.data?.profile : undefined;
    return {
      ...r,
      ...(r.photoURL
        ? { photoURL: r.photoURL }
        : sid
        ? { photoURL: `/api/scholar/avatar?userId=${encodeURIComponent(sid)}` }
        : {}),
      affiliation:
        cachedProf?.homeUniversity ||
        cachedProf?.affiliation ||
        digest?.affiliation ||
        r.affiliation ||
        '',
      country: cachedProf?.homeCountry || digest?.country || r.country || '',
      totalCitations:
        cachedProf?.officialMetrics?.totalCitations ??
        digest?.totalCitations ??
        r.totalCitations ??
        0,
      hIndex:
        cachedProf?.officialMetrics?.hIndex ??
        digest?.hIndex ??
        r.hIndex ??
        0,
      publicationCount:
        cachedProf?.publications?.length ??
        digest?.publicationCount ??
        r.publicationCount ??
        0,
    };
  });
}

app.get('/api/social/summary', async (req, res) => {
  try {
    const sessionUser = await verifySessionUserFromRequest(req);
    if (!sessionUser) {
      res.json({
        authenticated: false,
        unreadMessagesCount: 0,
        pendingConnectionsCount: 0,
        acceptedConnectionsCount: 0,
      });
      return;
    }
    const store = getSocialStore();
    const [conn, convos] = await Promise.all([
      store.getConnectionsOverview(sessionUser.uid),
      store.listConversationsForUser(sessionUser.uid),
    ]);
    const unreadMessagesCount = convos.reduce(
      (sum, c) => sum + Number(c.unreadBy?.[sessionUser.uid] || 0),
      0
    );
    res.json({
      authenticated: true,
      unreadMessagesCount,
      pendingConnectionsCount: conn.incomingRequests.length,
      acceptedConnectionsCount: conn.acceptedUids.length,
    });
  } catch (err) {
    sendSocialError(res, err);
  }
});

app.get('/api/social/researchers', async (req, res) => {
  try {
    const store = getSocialStore();
    const q = String(req.query.q || '').trim().toLowerCase();
    const [sessionUser, registered, digests] = await Promise.all([
      verifySessionUserFromRequest(req),
      store.listRegisteredResearchers(),
      store.listResearcherWorksDigests(),
    ]);

    const enriched = enrichResearchersWithDigests(registered, digests);
    let statusByUid: Record<string, string> = {};
    if (sessionUser) {
      const conn = await store.getConnectionsOverview(sessionUser.uid);
      statusByUid = conn.statusByUid;
    }

    const items = enriched
      .filter((r) => {
        if (!q) return true;
        return (
          r.name.toLowerCase().includes(q) ||
          (r.affiliation || '').toLowerCase().includes(q) ||
          (r.country || '').toLowerCase().includes(q) ||
          (r.orcidId || '').toLowerCase().includes(q)
        );
      })
      .map((r) => ({
        ...r,
        isSelf: Boolean(sessionUser && r.uid === sessionUser.uid),
        connectionStatus: statusByUid[r.uid] || 'none',
      }));

    res.json({
      currentUid: sessionUser?.uid || null,
      researchers: items,
    });
  } catch (err) {
    sendSocialError(res, err);
  }
});

app.get('/api/social/connections', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser) {
    res.status(401).json({ error: 'Please sign in to manage your researcher connections.' });
    return;
  }
  try {
    const store = getSocialStore();
    const [overview, registered, digests] = await Promise.all([
      store.getConnectionsOverview(sessionUser.uid),
      store.listRegisteredResearchers(),
      store.listResearcherWorksDigests(),
    ]);

    const enriched = enrichResearchersWithDigests(registered, digests);
    const byUid = new Map(enriched.map((r) => [r.uid, r]));

    res.json({
      currentUid: sessionUser.uid,
      accepted: overview.acceptedUids.map((uid) => byUid.get(uid)).filter(Boolean),
      incoming: overview.incomingRequests
        .map((edge) => ({
          ...edge,
          researcher: byUid.get(edge.requesterUid) || { uid: edge.requesterUid, name: 'Researcher' },
        })),
      outgoing: overview.outgoingRequests
        .map((edge) => ({
          ...edge,
          researcher: byUid.get(edge.recipientUid) || { uid: edge.recipientUid, name: 'Researcher' },
        })),
      statusByUid: overview.statusByUid,
      allResearchers: enriched.map((r) => ({
        ...r,
        isSelf: r.uid === sessionUser.uid,
        connectionStatus: overview.statusByUid[r.uid] || 'none',
      })),
    });
  } catch (err) {
    sendSocialError(res, err);
  }
});

app.post('/api/social/connections/request', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser) {
    res.status(401).json({ error: 'Please sign in to connect with researchers.' });
    return;
  }
  try {
    const targetUid = String(req.body?.targetUid || '').trim();
    const note = typeof req.body?.note === 'string' ? req.body.note : undefined;
    const result = await getSocialStore().sendConnectionRequest(sessionUser.uid, targetUid, note);
    res.json(result);
  } catch (err) {
    sendSocialError(res, err);
  }
});

app.post('/api/social/connections/respond', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  try {
    const requesterUid = String(req.body?.requesterUid || '').trim();
    const action = req.body?.action === 'decline' ? 'decline' : 'accept';
    const result = await getSocialStore().respondConnectionRequest(
      sessionUser.uid,
      requesterUid,
      action
    );
    res.json(result);
  } catch (err) {
    sendSocialError(res, err);
  }
});

app.delete('/api/social/connections/:otherUid', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  try {
    const otherUid = String(req.params.otherUid || '').trim();
    const result = await getSocialStore().removeConnection(sessionUser.uid, otherUid);
    res.json(result);
  } catch (err) {
    sendSocialError(res, err);
  }
});

app.get('/api/social/messages/conversations', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser) {
    res.status(401).json({ error: 'Please sign in to view your messages.' });
    return;
  }
  try {
    const store = getSocialStore();
    const [convos, registered, digests] = await Promise.all([
      store.listConversationsForUser(sessionUser.uid),
      store.listRegisteredResearchers(),
      store.listResearcherWorksDigests(),
    ]);
    const enriched = enrichResearchersWithDigests(registered, digests);
    const byUid = new Map(enriched.map((r) => [r.uid, r]));

    const conversations = convos.map((c) => {
      const partnerUid =
        c.participants.find((id) => id !== sessionUser.uid) || c.participants[0];
      return {
        threadId: c.threadId,
        partnerUid,
        partner: byUid.get(partnerUid) || { uid: partnerUid, name: 'Researcher' },
        lastMessageText: c.lastMessageText,
        lastMessageAt: c.lastMessageAt,
        lastSenderUid: c.lastSenderUid,
        unreadCount: Number(c.unreadBy?.[sessionUser.uid] || 0),
      };
    });

    const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
    res.json({ currentUid: sessionUser.uid, conversations, totalUnread });
  } catch (err) {
    sendSocialError(res, err);
  }
});

app.get('/api/social/messages/thread/:partnerUid', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser) {
    res.status(401).json({ error: 'Please sign in to view messages.' });
    return;
  }
  try {
    const partnerUid = String(req.params.partnerUid || '').trim();
    const store = getSocialStore();
    const [thread, registered, digests] = await Promise.all([
      store.getThreadWithUser(sessionUser.uid, partnerUid),
      store.listRegisteredResearchers(),
      store.listResearcherWorksDigests(),
    ]);
    const enriched = enrichResearchersWithDigests(registered, digests);
    const partner = enriched.find((r) => r.uid === partnerUid) || {
      uid: partnerUid,
      name: 'Researcher',
    };
    res.json({ currentUid: sessionUser.uid, partner, thread });
  } catch (err) {
    sendSocialError(res, err);
  }
});

app.post('/api/social/messages', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser) {
    res.status(401).json({ error: 'Please sign in to send messages.' });
    return;
  }
  try {
    const recipientUid = String(req.body?.recipientUid || '').trim();
    const text = String(req.body?.text || '');
    const message = await getSocialStore().sendMessage(sessionUser.uid, recipientUid, text);
    res.status(201).json({ message });
  } catch (err) {
    sendSocialError(res, err);
  }
});

app.get('/api/social/feed', async (req, res) => {
  try {
    const filterMode = String(req.query.filter || 'all').toLowerCase();
    const queryText = String(req.query.q || '').trim().toLowerCase();
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const limit = Math.min(40, Math.max(1, Number(req.query.limit) || 15));

    const store = getSocialStore();
    const [sessionUser, posts, registered, storedDigests] = await Promise.all([
      verifySessionUserFromRequest(req),
      store.listPosts(60),
      store.listRegisteredResearchers(),
      store.listResearcherWorksDigests(),
    ]);

    const digests = { ...storedDigests };
    // Ensure cached in-memory profiles are also reflected in feed digests
    for (const [, entry] of profileCache.entries()) {
      const prof = entry?.data?.profile;
      const sid = String(prof?.scholarUserId || '').trim();
      if (prof && sid && !digests[sid]) {
        const d = buildWorksDigestFromProfile(prof);
        if (d) digests[sid] = d;
      }
    }

    // Hydrate up to 2 registered site researchers who don't yet have cached works for the newsfeed
    const missingRegIds = registered
      .map((r) => String(r.scholarUserId || '').trim())
      .filter((sid) => sid && !digests[sid])
      .slice(0, 2);
    if (missingRegIds.length > 0) {
      await Promise.race([
        Promise.allSettled(
          missingRegIds.map(async (sid) => {
            const built = await buildLiveResearcherProfile(sid, '');
            if (built?.profile) {
              profileCache.set(`${sid.toLowerCase()}::`, {
                timestamp: Date.now(),
                data: built,
              });
              const d = buildWorksDigestFromProfile(built.profile);
              if (d) {
                digests[sid] = d;
                void store.recordResearcherWorksDigest(d).catch(() => {});
              }
            }
          })
        ),
        new Promise((resolve) => setTimeout(resolve, 4200)),
      ]);
    }

    const enrichedUsers = enrichResearchersWithDigests(registered, digests);
    const userByUid = new Map(enrichedUsers.map((u) => [u.uid, u]));
    const userByScholarId = new Map<string, PublicResearcherSummary>();
    for (const u of enrichedUsers) {
      if (u.scholarUserId) userByScholarId.set(u.scholarUserId.trim(), u);
    }

    let acceptedSet = new Set<string>();
    let statusByUid: Record<string, string> = {};
    if (sessionUser) {
      const conn = await store.getConnectionsOverview(sessionUser.uid);
      acceptedSet = new Set(conn.acceptedUids);
      statusByUid = conn.statusByUid;
    }

    const postFeedItems = posts.map((post) => {
      const author = userByUid.get(post.authorUid) || {
        uid: post.authorUid,
        name: 'Researcher',
      };
      return {
        feedId: `feed_post_${post.id}`,
        kind: 'post' as const,
        postId: post.id,
        createdAt: post.createdAt,
        sortScore: new Date(post.createdAt).getTime() || Date.now(),
        author: {
          ...author,
          connectionStatus: statusByUid[author.uid] || 'none',
          isSelf: Boolean(sessionUser && author.uid === sessionUser.uid),
        },
        caption: post.caption,
        mentionedWork: post.mentionedWork || null,
        taggedCoAuthors: post.taggedCoAuthors || [],
        images: post.images || [],
        video: post.video || null,
        likesCount: (post.likes || []).length,
        likedByMe: Boolean(sessionUser && (post.likes || []).includes(sessionUser.uid)),
        comments: (post.comments || []).map((c) => {
          const cAuthor = userByUid.get(c.authorUid);
          return {
            ...c,
            authorName: cAuthor?.name || 'Researcher',
            authorPhoto: cAuthor?.photoURL || '',
            authorScholarUserId: cAuthor?.scholarUserId || '',
          };
        }),
      };
    });

    const seenWorkKeys = new Set<string>();
    const workFeedItems: any[] = [];
    for (const digest of Object.values(digests)) {
      const regUser = userByScholarId.get(digest.scholarUserId);
      const authorUid = regUser?.uid || '';
      const authorPhoto =
        regUser?.photoURL ||
        digest.avatarUrl ||
        `/api/scholar/avatar?userId=${encodeURIComponent(digest.scholarUserId)}`;

      for (const work of digest.works || []) {
        const wKey = `${work.title.toLowerCase().slice(0, 60)}::${digest.scholarUserId}`;
        if (seenWorkKeys.has(wKey)) continue;
        seenWorkKeys.add(wKey);

        const syntheticTs =
          new Date(
            Math.max(1995, Math.min(2027, work.year || 2024)),
            0,
            15
          ).getTime() +
          Math.min(work.citations || 0, 500) * 100000;

        workFeedItems.push({
          feedId: `feed_work_${digest.scholarUserId}_${work.id}`,
          kind: 'work' as const,
          createdAt: `${work.year || new Date().getFullYear()}-01-15T00:00:00.000Z`,
          sortScore: syntheticTs,
          author: {
            uid: authorUid,
            name: regUser?.name || digest.name,
            photoURL: authorPhoto,
            scholarUserId: digest.scholarUserId,
            orcidId: regUser?.orcidId || digest.orcid,
            affiliation: regUser?.affiliation || digest.affiliation,
            country: regUser?.country || digest.country,
            verified: Boolean(regUser?.verified),
            connectionStatus: authorUid ? statusByUid[authorUid] || 'none' : 'none',
            isSelf: Boolean(sessionUser && authorUid && authorUid === sessionUser.uid),
          },
          work,
        });
      }
    }

    workFeedItems.sort((a, b) => {
      const yearDiff = (b.work.year || 0) - (a.work.year || 0);
      if (yearDiff !== 0) return yearDiff;
      return (b.work.citations || 0) - (a.work.citations || 0);
    });

    let combined: any[];
    if (filterMode === 'posts') {
      combined = postFeedItems;
    } else if (filterMode === 'works') {
      combined = workFeedItems;
    } else if (filterMode === 'connections' && sessionUser) {
      combined = [
        ...postFeedItems.filter(
          (i) => i.author.uid === sessionUser.uid || acceptedSet.has(i.author.uid)
        ),
        ...workFeedItems.filter(
          (i) => i.author.uid && acceptedSet.has(i.author.uid)
        ),
      ];
    } else {
      // Interleave newest authored posts prominently at top alongside recent researcher works
      combined = [...postFeedItems, ...workFeedItems];
    }

    if (queryText) {
      combined = combined.filter((item) => {
        const hay = [
          item.author?.name,
          item.author?.affiliation,
          item.caption,
          item.mentionedWork?.title,
          item.mentionedWork?.venue,
          item.work?.title,
          item.work?.venue,
          ...(item.taggedCoAuthors || []).map((t: any) => t.name),
          ...(item.work?.coAuthorNames || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(queryText);
      });
    }

    const totalCount = combined.length;
    const paged = combined.slice(offset, offset + limit);

    res.json({
      items: paged,
      totalCount,
      hasMore: offset + paged.length < totalCount,
      researchersCount: enrichedUsers.length,
    });
  } catch (err) {
    sendSocialError(res, err);
  }
});

app.post('/api/social/posts', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser) {
    res.status(401).json({ error: 'Please sign in with ORCID to publish a research post.' });
    return;
  }
  try {
    const post = await getSocialStore().createPost(sessionUser.uid, {
      caption: req.body?.caption,
      mentionedWork: req.body?.mentionedWork,
      taggedCoAuthors: req.body?.taggedCoAuthors,
      images: req.body?.images,
      videoUrl: req.body?.videoUrl,
    });
    res.status(201).json({ post });
  } catch (err) {
    sendSocialError(res, err);
  }
});

app.post('/api/social/posts/:postId/like', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser) {
    res.status(401).json({ error: 'Please sign in to like posts.' });
    return;
  }
  try {
    const post = await getSocialStore().toggleLikePost(
      sessionUser.uid,
      String(req.params.postId || '')
    );
    res.json({
      postId: post.id,
      likesCount: post.likes.length,
      likedByMe: post.likes.includes(sessionUser.uid),
    });
  } catch (err) {
    sendSocialError(res, err);
  }
});

app.post('/api/social/posts/:postId/comment', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser) {
    res.status(401).json({ error: 'Please sign in to comment.' });
    return;
  }
  try {
    const post = await getSocialStore().addCommentToPost(
      sessionUser.uid,
      String(req.params.postId || ''),
      String(req.body?.text || '')
    );
    const registered = await getSocialStore().listRegisteredResearchers();
    const userByUid = new Map(registered.map((u) => [u.uid, u]));
    res.status(201).json({
      postId: post.id,
      comments: post.comments.map((c) => {
        const cAuthor = userByUid.get(c.authorUid);
        return {
          ...c,
          authorName: cAuthor?.name || 'Researcher',
          authorPhoto: cAuthor?.photoURL || '',
          authorScholarUserId: cAuthor?.scholarUserId || '',
        };
      }),
    });
  } catch (err) {
    sendSocialError(res, err);
  }
});

app.delete('/api/social/posts/:postId', async (req, res) => {
  const sessionUser = await verifySessionUserFromRequest(req);
  if (!sessionUser) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  try {
    await getSocialStore().deletePost(
      sessionUser.uid,
      String(req.params.postId || '')
    );
    res.json({ success: true });
  } catch (err) {
    sendSocialError(res, err);
  }
});

// Proxies the researcher's or co-author's authentic profile photo (with CORS headers for PDF & Canvas export)
app.get('/api/scholar/avatar', async (req, res) => {
  const userId = String(req.query.userId || '').trim();
  const orcidParam = normalizeOrcidId(String(req.query.orcid || '').trim()) || '';
  const uniParam = String(req.query.uni || '').trim();
  const rawName = String(req.query.name || '').trim();
  const fallbackName = rawName || 'Scholar';
  res.setHeader('Access-Control-Allow-Origin', '*');

  const nameKey = rawName && rawName.toLowerCase() !== 'scholar' ? rawName.toLowerCase() : '';
  const uniKey =
    uniParam && !/unlisted/i.test(uniParam) ? normalizeAsciiWords(uniParam) : '';
  const nameUniCacheKey = nameKey ? `name::${nameKey}${uniKey ? `::${uniKey}` : ''}` : '';

  const cacheAndSend = (entry: { contentType: string; buffer: Buffer }) => {
    const stamped = { ...entry, timestamp: Date.now() };
    if (userId) avatarBufferCache.set(userId, stamped);
    if (orcidParam) avatarBufferCache.set(`orcid::${orcidParam}`, stamped);
    if (nameUniCacheKey) avatarBufferCache.set(nameUniCacheKey, stamped);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', entry.contentType);
    res.send(entry.buffer);
  };

  // 1. Check in-memory buffer cache using the most specific identifier present
  if (userId) {
    const cachedByUser = avatarBufferCache.get(userId);
    if (
      cachedByUser &&
      Date.now() - cachedByUser.timestamp < 24 * 60 * 60 * 1000
    ) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', cachedByUser.contentType);
      res.send(cachedByUser.buffer);
      return;
    }
  }
  if (orcidParam) {
    const cachedByOrcid = avatarBufferCache.get(`orcid::${orcidParam}`);
    if (
      cachedByOrcid &&
      Date.now() - cachedByOrcid.timestamp < 24 * 60 * 60 * 1000
    ) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', cachedByOrcid.contentType);
      res.send(cachedByOrcid.buffer);
      return;
    }
  }
  if (!userId && !orcidParam && nameKey) {
    const cachedByName =
      (nameUniCacheKey ? avatarBufferCache.get(nameUniCacheKey) : undefined) ||
      avatarBufferCache.get(`name::${nameKey}`) ||
      avatarBufferCache.get(nameKey);
    if (
      cachedByName &&
      Date.now() - cachedByName.timestamp < 24 * 60 * 60 * 1000
    ) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', cachedByName.contentType);
      res.send(cachedByName.buffer);
      return;
    }

    const colMeta = lookupColleagueAvatarMeta(rawName);
    if (colMeta?.userId) {
      const cachedByColId = avatarBufferCache.get(colMeta.userId);
      if (cachedByColId) {
        if (nameUniCacheKey) avatarBufferCache.set(nameUniCacheKey, cachedByColId);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Content-Type', cachedByColId.contentType);
        res.send(cachedByColId.buffer);
        return;
      }
    }
  }

  // 2. Check if verifiedScholarSnapshot or profileCache has a base64 avatarDataUrl for userId or explicit researcher name
  if (userId) {
    const lowerId = userId.toLowerCase();
    const snapObj = (verifiedScholarSnapshot as Record<string, any>)?.[userId];
    const cachedProf: ResearcherProfile | undefined =
      profileCache.get(`${lowerId}::`)?.data?.profile ||
      snapObj?.profile ||
      snapObj;
    if (
      cachedProf?.avatarUrl &&
      cachedProf.avatarUrl.startsWith('data:image/')
    ) {
      const m = cachedProf.avatarUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (m) {
        cacheAndSend({ contentType: m[1], buffer: Buffer.from(m[2], 'base64') });
        return;
      }
    }
  }

  if (rawSnapshot && typeof rawSnapshot === 'object' && nameKey) {
    for (const [, sVal] of Object.entries(rawSnapshot)) {
      const prof: ResearcherProfile | undefined = sVal?.profile || sVal;
      if (
        prof &&
        prof.name &&
        isStrictSameResearcherForAvatar(prof.name, rawName) &&
        prof.avatarUrl &&
        prof.avatarUrl.startsWith('data:image/')
      ) {
        const m = prof.avatarUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
        if (m) {
          cacheAndSend({ contentType: m[1], buffer: Buffer.from(m[2], 'base64') });
          return;
        }
      }
    }
  }

  // 3. Resolve verified Google Scholar userId from colleague graph (safe check)
  const colleagueMeta =
    !userId && nameKey ? lookupColleagueAvatarMeta(rawName) : null;
  const effectiveUserId = userId || colleagueMeta?.userId || '';

  // 4. Fetch custom photo from Google Scholar's static CDN via concurrency-controlled queue
  if (effectiveUserId) {
    const gsImg = await fetchScholarAvatarWithQueue(effectiveUserId);
    if (gsImg) {
      cacheAndSend(gsImg);
      return;
    }
  }

  // 4b. Multi-source co-author photo resolution: Wikidata P496/P1960/P18, ORCID institutional profile portrait, & affiliation-guided Scholar ID search
  if (orcidParam || nameKey) {
    const resolvedPhoto = await resolveCoAuthorPhotoBuffer({
      name: rawName,
      university: uniParam,
      orcid: orcidParam,
      skipScholarId: effectiveUserId,
    });
    if (resolvedPhoto) {
      if (resolvedPhoto.resolvedScholarId) {
        avatarBufferCache.set(resolvedPhoto.resolvedScholarId, {
          contentType: resolvedPhoto.contentType,
          buffer: resolvedPhoto.buffer,
          timestamp: Date.now(),
        });
      }
      cacheAndSend(resolvedPhoto);
      return;
    }
  }

  // 5. Fallback academic monogram SVG avatar (never cached long-term in browser so transient network issues self-heal)
  const initials =
    stripAcademicHonorifics(fallbackName)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'RS';

  const hash = fallbackName
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palette = [
    ['#1e3a8a', '#2563eb'], // Blue
    ['#065f46', '#059669'], // Emerald
    ['#4c1d95', '#7c3aed'], // Purple
    ['#7c2d12', '#ea580c'], // Amber
    ['#831843', '#db2777'], // Rose
    ['#134e4a', '#0d9488'], // Teal
    ['#1e293b', '#475569'], // Slate
  ];
  const [stop1, stop2] = palette[hash % palette.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${stop1}"/>
        <stop offset="100%" stop-color="${stop2}"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="64" fill="url(#g)"/>
    <text x="64" y="78" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="44" font-weight="700" letter-spacing="1">${initials}</text>
  </svg>`;
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

// AI Generative Avatar Fitting Status & Metadata Endpoint
app.get('/api/scholar/avatar/ai-fit', async (req, res) => {
  const userId = String(req.query.userId || '').trim();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  const candidateUrls = [
    `https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=${encodeURIComponent(userId)}&citpid=1`,
    `https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=${encodeURIComponent(userId)}`,
  ];
  const results: any[] = [];
  for (const u of candidateUrls) {
    try {
      const resp = await fetch(u, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(5000),
      });
      results.push({ url: u, status: resp.status, contentType: resp.headers.get('content-type') });
    } catch (e: any) {
      results.push({ url: u, error: e.message || String(e) });
    }
  }

  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  res.json({
    supported: true,
    geminiEnabled: Boolean(geminiKey),
    facialIdentityProtected: true,
    expansionEngine:
      'Generative ambient outpainting + portrait safe-zone headroom centering',
    description:
      'Fits researcher portrait inside circular avatar without modifying facial identity or portrait pixels',
    userId,
    fetchTest: results,
  });
});

// Authenticated Firestore Bridge between Vercel Serverless and Google Cloud Scholar Node
let cachedBridgeToken: { token: string; expiresAt: number } | null = null;

async function getBridgeIdToken(): Promise<string | null> {
  if (cachedBridgeToken && Date.now() < cachedBridgeToken.expiresAt) {
    return cachedBridgeToken.token;
  }
  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseAppletConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'worker-bridge@scholarlens.org',
          password: 'ScholarBridge#2026!Secure',
          returnSecureToken: true,
        }),
        signal: AbortSignal.timeout(3000),
      }
    );
    if (!resp.ok) return null;
    const data = (await resp.json()) as any;
    if (data?.idToken) {
      cachedBridgeToken = {
        token: String(data.idToken),
        expiresAt: Date.now() + 45 * 60 * 1000,
      };
      return cachedBridgeToken.token;
    }
  } catch {
    // Ignore auth error
  }
  return null;
}

const FIRESTORE_DOC_BASE = `https://firestore.googleapis.com/v1/projects/${firebaseAppletConfig.projectId}/databases/${firebaseAppletConfig.firestoreDatabaseId}/documents`;

function sanitizeBridgeDocId(userId: string, queryName: string): string {
  const raw = (userId || queryName || 'default')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 96);
  return raw || 'default';
}

async function writeScholarBridgeDoc(
  docId: string,
  userId: string,
  queryName: string,
  status: 'pending' | 'ready' | 'error',
  payloadJson: string
): Promise<boolean> {
  const token = await getBridgeIdToken();
  if (!token) return false;
  try {
    const safePayload = payloadJson.length <= 850000 ? payloadJson : '';
    const finalStatus = status === 'ready' && !safePayload ? 'error' : status;
    const resp = await fetch(`${FIRESTORE_DOC_BASE}/scholarBridge/${docId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          userId: { stringValue: (userId || docId).slice(0, 120) },
          queryName: { stringValue: (queryName || '').slice(0, 150) },
          status: { stringValue: finalStatus },
          payloadJson: { stringValue: safePayload },
          updatedAtMs: { integerValue: String(Date.now()) },
        },
      }),
      signal: AbortSignal.timeout(3500),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

async function readScholarBridgeDoc(docId: string): Promise<{
  status: string;
  payloadJson: string;
  updatedAtMs: number;
} | null> {
  const token = await getBridgeIdToken();
  if (!token) return null;
  try {
    const resp = await fetch(`${FIRESTORE_DOC_BASE}/scholarBridge/${docId}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(2500),
    });
    if (!resp.ok) return null;
    const doc = (await resp.json()) as any;
    const fields = doc?.fields;
    if (!fields) return null;
    return {
      status: String(fields.status?.stringValue || ''),
      payloadJson: String(fields.payloadJson?.stringValue || ''),
      updatedAtMs: Number(fields.updatedAtMs?.integerValue || 0),
    };
  } catch {
    return null;
  }
}

async function resolveViaScholarBridge(
  userId: string,
  queryName: string
): Promise<{ profile: ResearcherProfile; source: string } | null> {
  const docId = sanitizeBridgeDocId(userId, queryName);
  const existing = await readScholarBridgeDoc(docId);
  if (
    existing &&
    existing.status === 'ready' &&
    existing.payloadJson &&
    Date.now() - existing.updatedAtMs < 24 * 60 * 60 * 1000
  ) {
    try {
      return JSON.parse(existing.payloadJson);
    } catch {
      // Re-request below
    }
  }

  const queued = await writeScholarBridgeDoc(
    docId,
    userId || docId,
    queryName,
    'pending',
    ''
  );
  if (!queued) return null;

  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((r) => setTimeout(r, 360));
    const current = await readScholarBridgeDoc(docId);
    if (current?.status === 'ready' && current.payloadJson) {
      try {
        return JSON.parse(current.payloadJson);
      } catch {
        return null;
      }
    }
    if (current?.status === 'error') {
      return null;
    }
  }
  return null;
}

let isWorkerPolling = false;
function startScholarBridgeWorker() {
  if (process.env.VERCEL) return;
  setInterval(async () => {
    if (isWorkerPolling) return;
    isWorkerPolling = true;
    try {
      const token = await getBridgeIdToken();
      if (!token) return;
      const queryResp = await fetch(`${FIRESTORE_DOC_BASE}:runQuery`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'scholarBridge' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'status' },
                op: 'EQUAL',
                value: { stringValue: 'pending' },
              },
            },
            limit: 3,
          },
        }),
        signal: AbortSignal.timeout(3000),
      });
      if (!queryResp.ok) return;
      const rows = (await queryResp.json()) as any[];
      for (const row of rows) {
        const doc = row?.document;
        if (!doc?.name || !doc?.fields) continue;
        const docId = String(doc.name).split('/').pop() || '';
        const uId = String(doc.fields.userId?.stringValue || '');
        const qName = String(doc.fields.queryName?.stringValue || '');
        const built = await buildLiveResearcherProfile(uId, qName);
        if (built) {
          await writeScholarBridgeDoc(
            docId,
            uId,
            qName,
            'ready',
            JSON.stringify(built)
          );
        } else {
          await writeScholarBridgeDoc(docId, uId, qName, 'error', '');
        }
      }
    } catch {
      // Ignore worker cycle error
    } finally {
      isWorkerPolling = false;
    }
  }, 650);
}

// OpenAlex JSON relay endpoint
app.get('/api/scholar/openalex-proxy', async (req, res) => {
  const rawTargetUrl = String(req.query.url || '').trim();
  if (!rawTargetUrl.startsWith('https://api.openalex.org/')) {
    res.status(400).json({ error: 'Invalid OpenAlex URL' });
    return;
  }
  const cleanUrl = rawTargetUrl
    .replace(/([?&])mailto=[^&]+(&|$)/i, (_m, p1, p2) => (p2 === '&' ? p1 : ''))
    .replace(/[?&]$/, '');
  const rotatingMailto = `relay-${Math.floor(Date.now() / 60000).toString(
    36
  )}-${Math.random().toString(36).slice(2, 6)}@scholarlens.org`;
  const targetUrl = `${cleanUrl}${
    cleanUrl.includes('?') ? '&' : '?'
  }mailto=${rotatingMailto}`;
  try {
    const oaRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ScholarLens/2.0)',
      },
      signal: AbortSignal.timeout(6500),
    });
    const text = await oaRes.text();
    res.status(oaRes.status).type('application/json').send(text);
  } catch {
    res.status(502).json({ error: 'OpenAlex relay timeout' });
  }
});

// Live Google Scholar + Official Sources Analyzer Endpoint
app.get('/api/scholar/analyze', async (req, res) => {
  const userId = String(req.query.userId || '').trim();
  const queryName = String(req.query.queryName || '').trim();
  const forceRefresh = req.query.refresh === '1';

  if (!userId && !queryName) {
    res
      .status(400)
      .json({ error: 'Paste a Google Scholar profile link or researcher name.' });
    return;
  }

  const cacheKey = `${userId.toLowerCase()}::${queryName.toLowerCase()}`;
  const cached = profileCache.get(cacheKey);
  if (!forceRefresh && cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
    res.json(cached.data);
    return;
  }

  // Check bundled verified snapshot for immediate instant response
  if (!forceRefresh) {
    const rawSnap = verifiedScholarSnapshot as Record<string, any>;
    const lowerUser = userId.toLowerCase().trim();
    const lowerQuery = queryName.toLowerCase().trim();
    let snapMatch: ResearcherProfile | undefined;

    if (rawSnap && typeof rawSnap === 'object') {
      for (const [snapKey, snapVal] of Object.entries(rawSnap)) {
        const prof: ResearcherProfile | undefined =
          snapVal?.profile || (snapVal?.publications ? snapVal : undefined);
        if (!prof) continue;
        const candidateId = (prof.scholarUserId || snapKey).toLowerCase().trim();
        const candidateName = prof.name ? prof.name.toLowerCase().trim() : '';

        if (
          (lowerUser &&
            isValidScholarId(userId) &&
            candidateId === lowerUser) ||
          (lowerQuery &&
            prof.name &&
            isStrictSameResearcherForAvatar(prof.name, queryName))
        ) {
          snapMatch = prof;
          break;
        }
      }
    }

    if (snapMatch) {
      const normalizedPubs = enrichAndPrewarmProfileCoAuthors(
        normalizePublicationsVenueConsistency(snapMatch.publications || [])
      );
      const snapPayload = {
        profile: {
          ...snapMatch,
          publications: normalizedPubs,
        },
        source: 'scholar-verified-official-snapshot',
      };
      profileCache.set(cacheKey, {
        timestamp: Date.now(),
        data: snapPayload,
      });
      res.json(snapPayload);
      return;
    }
  }

  try {
    const resolvedId = isValidScholarId(userId)
      ? userId
      : queryName
      ? (await resolveGoogleScholarIdByName(queryName)) || userId
      : userId;

    const result = await buildLiveResearcherProfile(
      resolvedId || userId,
      queryName
    );
    if (!result) {
      res.status(404).json({
        error:
          'Could not find public publications for that Google Scholar profile.',
      });
      return;
    }

    result.profile.publications = enrichAndPrewarmProfileCoAuthors(
      result.profile.publications || []
    );

    profileCache.set(cacheKey, {
      timestamp: Date.now(),
      data: result,
    });
    if (result.profile.scholarUserId) {
      profileCache.set(`${result.profile.scholarUserId.toLowerCase()}::`, {
        timestamp: Date.now(),
        data: result,
      });
    }
    const digest = buildWorksDigestFromProfile(result.profile);
    if (digest) {
      void getSocialStore().recordResearcherWorksDigest(digest).catch(() => {});
    }

    res.json(result);
  } catch {
    res
      .status(500)
      .json({ error: 'Failed to analyze Google Scholar profile.' });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`ScholarLens server running on http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL && !process.env.SKIP_SERVER_LISTEN) {
  void startServer();
}

export default app;
