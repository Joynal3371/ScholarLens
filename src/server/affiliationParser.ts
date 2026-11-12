export type ContinentName =
  | 'North America'
  | 'Europe'
  | 'Asia'
  | 'Oceania'
  | 'South America'
  | 'Africa';

export interface CountryGeoMeta {
  country: string;
  continent: ContinentName;
  lat: number;
  lng: number;
}

/**
 * Broad ISO-3166 alpha-2 reference covering academic publishing countries worldwide
 * so non-Western institutions never silently collapse to United States.
 */
export const ISO_COUNTRY_INFO: Record<string, CountryGeoMeta> = {
  AF: { country: 'Afghanistan', continent: 'Asia', lat: 34.5553, lng: 69.2075 },
  AL: { country: 'Albania', continent: 'Europe', lat: 41.3275, lng: 19.8187 },
  DZ: { country: 'Algeria', continent: 'Africa', lat: 36.7538, lng: 3.0588 },
  AR: { country: 'Argentina', continent: 'South America', lat: -34.6037, lng: -58.3816 },
  AM: { country: 'Armenia', continent: 'Asia', lat: 40.1792, lng: 44.4991 },
  AU: { country: 'Australia', continent: 'Oceania', lat: -33.8688, lng: 151.2093 },
  AT: { country: 'Austria', continent: 'Europe', lat: 48.2082, lng: 16.3738 },
  AZ: { country: 'Azerbaijan', continent: 'Asia', lat: 40.4093, lng: 49.8671 },
  BH: { country: 'Bahrain', continent: 'Asia', lat: 26.2285, lng: 50.586 },
  BD: { country: 'Bangladesh', continent: 'Asia', lat: 23.8103, lng: 90.4125 },
  BY: { country: 'Belarus', continent: 'Europe', lat: 53.9006, lng: 27.559 },
  BE: { country: 'Belgium', continent: 'Europe', lat: 50.8503, lng: 4.3517 },
  BA: { country: 'Bosnia and Herzegovina', continent: 'Europe', lat: 43.8563, lng: 18.4131 },
  BR: { country: 'Brazil', continent: 'South America', lat: -23.5505, lng: -46.6333 },
  BN: { country: 'Brunei', continent: 'Asia', lat: 4.9031, lng: 114.9398 },
  BG: { country: 'Bulgaria', continent: 'Europe', lat: 42.6977, lng: 23.3219 },
  KH: { country: 'Cambodia', continent: 'Asia', lat: 11.5564, lng: 104.9282 },
  CM: { country: 'Cameroon', continent: 'Africa', lat: 3.848, lng: 11.5021 },
  CA: { country: 'Canada', continent: 'North America', lat: 45.4215, lng: -75.6972 },
  CL: { country: 'Chile', continent: 'South America', lat: -33.4489, lng: -70.6693 },
  CN: { country: 'China', continent: 'Asia', lat: 39.9042, lng: 116.4074 },
  CO: { country: 'Colombia', continent: 'South America', lat: 4.711, lng: -74.0721 },
  CR: { country: 'Costa Rica', continent: 'North America', lat: 9.9281, lng: -84.0907 },
  HR: { country: 'Croatia', continent: 'Europe', lat: 45.815, lng: 15.9819 },
  CU: { country: 'Cuba', continent: 'North America', lat: 23.1136, lng: -82.3666 },
  CY: { country: 'Cyprus', continent: 'Europe', lat: 35.1856, lng: 33.3823 },
  CZ: { country: 'Czechia', continent: 'Europe', lat: 50.0755, lng: 14.4378 },
  DK: { country: 'Denmark', continent: 'Europe', lat: 55.6761, lng: 12.5683 },
  EC: { country: 'Ecuador', continent: 'South America', lat: -0.1807, lng: -78.4678 },
  EG: { country: 'Egypt', continent: 'Africa', lat: 30.0444, lng: 31.2357 },
  EE: { country: 'Estonia', continent: 'Europe', lat: 59.437, lng: 24.7536 },
  ET: { country: 'Ethiopia', continent: 'Africa', lat: 9.032, lng: 38.7469 },
  FI: { country: 'Finland', continent: 'Europe', lat: 60.1699, lng: 24.9384 },
  FR: { country: 'France', continent: 'Europe', lat: 48.8566, lng: 2.3522 },
  GE: { country: 'Georgia', continent: 'Asia', lat: 41.7151, lng: 44.8271 },
  DE: { country: 'Germany', continent: 'Europe', lat: 52.52, lng: 13.405 },
  GH: { country: 'Ghana', continent: 'Africa', lat: 5.6037, lng: -0.187 },
  GR: { country: 'Greece', continent: 'Europe', lat: 37.9838, lng: 23.7275 },
  HK: { country: 'China (Hong Kong)', continent: 'Asia', lat: 22.3193, lng: 114.1694 },
  HU: { country: 'Hungary', continent: 'Europe', lat: 47.4979, lng: 19.0402 },
  IS: { country: 'Iceland', continent: 'Europe', lat: 64.1466, lng: -21.9426 },
  IN: { country: 'India', continent: 'Asia', lat: 28.6139, lng: 77.209 },
  ID: { country: 'Indonesia', continent: 'Asia', lat: -6.2088, lng: 106.8456 },
  IR: { country: 'Iran', continent: 'Asia', lat: 35.6892, lng: 51.389 },
  IQ: { country: 'Iraq', continent: 'Asia', lat: 33.3152, lng: 44.3661 },
  IE: { country: 'Ireland', continent: 'Europe', lat: 53.3498, lng: -6.2603 },
  IL: { country: 'Israel', continent: 'Asia', lat: 31.7683, lng: 35.2137 },
  IT: { country: 'Italy', continent: 'Europe', lat: 41.9028, lng: 12.4964 },
  JP: { country: 'Japan', continent: 'Asia', lat: 35.6762, lng: 139.6503 },
  JO: { country: 'Jordan', continent: 'Asia', lat: 31.9454, lng: 35.9284 },
  KZ: { country: 'Kazakhstan', continent: 'Asia', lat: 51.1694, lng: 71.4491 },
  KE: { country: 'Kenya', continent: 'Africa', lat: -1.2921, lng: 36.8219 },
  KW: { country: 'Kuwait', continent: 'Asia', lat: 29.3759, lng: 47.9774 },
  LV: { country: 'Latvia', continent: 'Europe', lat: 56.9496, lng: 24.1052 },
  LB: { country: 'Lebanon', continent: 'Asia', lat: 33.8938, lng: 35.5018 },
  LY: { country: 'Libya', continent: 'Africa', lat: 32.8872, lng: 13.1913 },
  LT: { country: 'Lithuania', continent: 'Europe', lat: 54.6872, lng: 25.2797 },
  LU: { country: 'Luxembourg', continent: 'Europe', lat: 49.6116, lng: 6.1319 },
  MO: { country: 'Macau', continent: 'Asia', lat: 22.1987, lng: 113.5439 },
  MY: { country: 'Malaysia', continent: 'Asia', lat: 3.139, lng: 101.6869 },
  MT: { country: 'Malta', continent: 'Europe', lat: 35.8989, lng: 14.5146 },
  MX: { country: 'Mexico', continent: 'North America', lat: 19.4326, lng: -99.1332 },
  MA: { country: 'Morocco', continent: 'Africa', lat: 34.0209, lng: -6.8416 },
  MM: { country: 'Myanmar', continent: 'Asia', lat: 16.8661, lng: 96.1951 },
  NP: { country: 'Nepal', continent: 'Asia', lat: 27.7172, lng: 85.324 },
  NL: { country: 'Netherlands', continent: 'Europe', lat: 52.3676, lng: 4.9041 },
  NZ: { country: 'New Zealand', continent: 'Oceania', lat: -36.8485, lng: 174.7633 },
  NG: { country: 'Nigeria', continent: 'Africa', lat: 9.0765, lng: 7.3986 },
  NO: { country: 'Norway', continent: 'Europe', lat: 59.9139, lng: 10.7522 },
  OM: { country: 'Oman', continent: 'Asia', lat: 23.588, lng: 58.3829 },
  PK: { country: 'Pakistan', continent: 'Asia', lat: 33.6844, lng: 73.0479 },
  PS: { country: 'Palestine', continent: 'Asia', lat: 31.9038, lng: 35.2034 },
  PE: { country: 'Peru', continent: 'South America', lat: -12.0464, lng: -77.0428 },
  PH: { country: 'Philippines', continent: 'Asia', lat: 14.5995, lng: 120.9842 },
  PL: { country: 'Poland', continent: 'Europe', lat: 52.2297, lng: 21.0122 },
  PT: { country: 'Portugal', continent: 'Europe', lat: 38.7223, lng: -9.1393 },
  QA: { country: 'Qatar', continent: 'Asia', lat: 25.2854, lng: 51.531 },
  RO: { country: 'Romania', continent: 'Europe', lat: 44.4268, lng: 26.1025 },
  RU: { country: 'Russia', continent: 'Europe', lat: 55.7558, lng: 37.6173 },
  RW: { country: 'Rwanda', continent: 'Africa', lat: -1.9441, lng: 30.0619 },
  SA: { country: 'Saudi Arabia', continent: 'Asia', lat: 24.7136, lng: 46.6753 },
  SN: { country: 'Senegal', continent: 'Africa', lat: 14.7167, lng: -17.4677 },
  RS: { country: 'Serbia', continent: 'Europe', lat: 44.7866, lng: 20.4489 },
  SG: { country: 'Singapore', continent: 'Asia', lat: 1.3521, lng: 103.8198 },
  SK: { country: 'Slovakia', continent: 'Europe', lat: 48.1486, lng: 17.1077 },
  SI: { country: 'Slovenia', continent: 'Europe', lat: 46.0569, lng: 14.5058 },
  ZA: { country: 'South Africa', continent: 'Africa', lat: -33.9249, lng: 18.4241 },
  KR: { country: 'South Korea', continent: 'Asia', lat: 37.5665, lng: 126.978 },
  ES: { country: 'Spain', continent: 'Europe', lat: 40.4168, lng: -3.7038 },
  LK: { country: 'Sri Lanka', continent: 'Asia', lat: 6.9271, lng: 79.8612 },
  SD: { country: 'Sudan', continent: 'Africa', lat: 15.5007, lng: 32.5599 },
  SE: { country: 'Sweden', continent: 'Europe', lat: 59.3293, lng: 18.0686 },
  CH: { country: 'Switzerland', continent: 'Europe', lat: 47.3769, lng: 8.5417 },
  SY: { country: 'Syria', continent: 'Asia', lat: 33.5138, lng: 36.2765 },
  TW: { country: 'Taiwan', continent: 'Asia', lat: 25.033, lng: 121.5654 },
  TZ: { country: 'Tanzania', continent: 'Africa', lat: -6.163, lng: 35.7516 },
  TH: { country: 'Thailand', continent: 'Asia', lat: 13.7563, lng: 100.5018 },
  TN: { country: 'Tunisia', continent: 'Africa', lat: 36.8065, lng: 10.1815 },
  TR: { country: 'Turkey', continent: 'Asia', lat: 39.9334, lng: 32.8597 },
  UG: { country: 'Uganda', continent: 'Africa', lat: 0.3476, lng: 32.5825 },
  UA: { country: 'Ukraine', continent: 'Europe', lat: 50.4501, lng: 30.5234 },
  AE: { country: 'United Arab Emirates', continent: 'Asia', lat: 24.4539, lng: 54.3773 },
  GB: { country: 'United Kingdom', continent: 'Europe', lat: 51.5074, lng: -0.1278 },
  US: { country: 'United States', continent: 'North America', lat: 38.8951, lng: -77.0364 },
  UY: { country: 'Uruguay', continent: 'South America', lat: -34.9011, lng: -56.1645 },
  UZ: { country: 'Uzbekistan', continent: 'Asia', lat: 41.2995, lng: 69.2401 },
  VE: { country: 'Venezuela', continent: 'South America', lat: 10.4806, lng: -66.9036 },
  VN: { country: 'Vietnam', continent: 'Asia', lat: 21.0278, lng: 105.8342 },
  YE: { country: 'Yemen', continent: 'Asia', lat: 15.3694, lng: 44.191 },
  ZM: { country: 'Zambia', continent: 'Africa', lat: -15.3875, lng: 28.3228 },
  ZW: { country: 'Zimbabwe', continent: 'Africa', lat: -17.8252, lng: 31.0335 },
};

const regionDisplayNames =
  typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

export function getCountryGeoInfo(
  countryCodeRaw?: string,
  fallbackCountryName?: string
): CountryGeoMeta {
  const cc = String(countryCodeRaw || '')
    .trim()
    .toUpperCase();
  if (cc && ISO_COUNTRY_INFO[cc]) {
    return ISO_COUNTRY_INFO[cc];
  }
  if (/^[A-Z]{2}$/.test(cc) && cc !== 'UN') {
    let resolvedName = fallbackCountryName?.trim() || '';
    if (!resolvedName && regionDisplayNames) {
      try {
        resolvedName = regionDisplayNames.of(cc) || '';
      } catch {
        // Ignore unknown ISO code
      }
    }
    return {
      country: resolvedName || cc,
      continent: 'Asia',
      lat: 20,
      lng: 10,
    };
  }
  return ISO_COUNTRY_INFO.US;
}

const COUNTRY_NAME_ALIASES: Array<[RegExp, string]> = [
  [/\b(?:united states(?: of america)?|u\.s\.a\.|usa|u\.s\.)\b/i, 'US'],
  [/\b(?:united kingdom|u\.k\.|england|scotland|wales|northern ireland)\b/i, 'GB'],
  [/\b(?:people'?s republic of china|p\.?r\.?\s*china|china)\b/i, 'CN'],
  [/\bhong kong\b/i, 'HK'],
  [/\b(?:republic of korea|south korea)\b/i, 'KR'],
  [/\btaiwan\b/i, 'TW'],
  [/\bbangladesh\b/i, 'BD'],
  [/\bmalaysia\b/i, 'MY'],
  [/\blibya\b/i, 'LY'],
  [/\bgermany|deutschland\b/i, 'DE'],
  [/\bfrance\b/i, 'FR'],
  [/\bcanada\b/i, 'CA'],
  [/\baustralia\b/i, 'AU'],
  [/\bjapan\b/i, 'JP'],
  [/\bindia\b/i, 'IN'],
  [/\bpakistan\b/i, 'PK'],
  [/\bsingapore\b/i, 'SG'],
  [/\bindonesia\b/i, 'ID'],
  [/\bthailand\b/i, 'TH'],
  [/\bvietnam\b/i, 'VN'],
  [/\bsaudi arabia|ksa\b/i, 'SA'],
  [/\b(?:united arab emirates|uae)\b/i, 'AE'],
  [/\bqatar\b/i, 'QA'],
  [/\boman\b/i, 'OM'],
  [/\bkuwait\b/i, 'KW'],
  [/\bjordan\b/i, 'JO'],
  [/\biran\b/i, 'IR'],
  [/\biraq\b/i, 'IQ'],
  [/\bisrael\b/i, 'IL'],
  [/\bturkey|türkiye\b/i, 'TR'],
  [/\begypt\b/i, 'EG'],
  [/\bmorocco\b/i, 'MA'],
  [/\balgeria\b/i, 'DZ'],
  [/\btunisia\b/i, 'TN'],
  [/\bnigeria\b/i, 'NG'],
  [/\bsouth africa\b/i, 'ZA'],
  [/\bkenya\b/i, 'KE'],
  [/\bethiopia\b/i, 'ET'],
  [/\bghana\b/i, 'GH'],
  [/\bspain|españa\b/i, 'ES'],
  [/\bitaly|italia\b/i, 'IT'],
  [/\b(?:the )?netherlands|holland\b/i, 'NL'],
  [/\bswitzerland|schweiz|suisse\b/i, 'CH'],
  [/\bsweden\b/i, 'SE'],
  [/\bnorway\b/i, 'NO'],
  [/\bdenmark\b/i, 'DK'],
  [/\bfinland\b/i, 'FI'],
  [/\bbelgium\b/i, 'BE'],
  [/\baustria\b/i, 'AT'],
  [/\bireland\b/i, 'IE'],
  [/\bportugal\b/i, 'PT'],
  [/\bpoland\b/i, 'PL'],
  [/\bgreece\b/i, 'GR'],
  [/\bromania\b/i, 'RO'],
  [/\bhungary\b/i, 'HU'],
  [/\bczech(?:ia| republic)\b/i, 'CZ'],
  [/\brussia(?:n federation)?\b/i, 'RU'],
  [/\bukraine\b/i, 'UA'],
  [/\bbrazil|brasil\b/i, 'BR'],
  [/\bmexico|méxico\b/i, 'MX'],
  [/\bargentina\b/i, 'AR'],
  [/\bchile\b/i, 'CL'],
  [/\bcolombia\b/i, 'CO'],
  [/\bnew zealand\b/i, 'NZ'],
  [/\bnepal\b/i, 'NP'],
  [/\bsri lanka\b/i, 'LK'],
  [/\bphilippines\b/i, 'PH'],
];

const US_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
]);

export function inferCountryCodeFromAffiliationString(
  rawAffil: string,
  explicitCountries?: string[]
): string {
  for (const rawCode of explicitCountries || []) {
    const upper = String(rawCode || '')
      .trim()
      .toUpperCase();
    if (/^[A-Z]{2}$/.test(upper) && upper !== 'UN') {
      return upper;
    }
  }

  const text = String(rawAffil || '')
    .replace(/#TAB#/g, ' ')
    .trim();
  if (!text) return '';

  // Prefer matches near the end of the affiliation string first
  const parts = text
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  for (let i = parts.length - 1; i >= Math.max(0, parts.length - 3); i--) {
    const seg = parts[i];
    for (const [pattern, code] of COUNTRY_NAME_ALIASES) {
      if (pattern.test(seg)) {
        return code;
      }
    }
    const trailingUsState = seg.match(/\b([A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?$/);
    if (trailingUsState && US_STATE_CODES.has(trailingUsState[1])) {
      return 'US';
    }
  }

  for (const [pattern, code] of COUNTRY_NAME_ALIASES) {
    if (pattern.test(text)) {
      return code;
    }
  }

  // Trailing "UK" token without dots
  if (/(?:,|\s)UK\b/.test(text)) return 'GB';

  return '';
}

const PURE_SUBUNIT_PREFIX_RE =
  /^(?:department|dept\.?|school|faculty|division|chair|group|unit|branch|program|programme)\s+of\b/i;

const STRONG_INSTITUTION_KEYWORD_RE =
  /\b(?:university|universiti|universit[eéaàä]|universitat|universidad|universidade|polytechnic|polytechnique|institute|institut|college|academy|hospital|medical\s+center|medical\s+centre|national\s+laboratory|laboratories|research\s+center|research\s+centre|meta\s+ai|google|deepmind|openai|microsoft|ibm|nvidia|fair|cnrs|inria|csiro|cern|max\s+planck)\b/i;

const PURE_GEO_OR_POSTAL_RE =
  /^(?:p\.?\s*o\.?\s*box\b.*|\d{4,6}(?:-\d{4})?|[a-z]{1,2}\d{1,2}\s*\d[a-z]{2}|[A-Z]{2}(?:\s+\d{5})?|usa|u\.s\.a\.|uk|u\.k\.|p\.?r\.?\s*china|china|germany|malaysia|libya|bangladesh|canada|australia|japan|india|france|italy|spain|singapore|south korea|brazil|netherlands|switzerland|sweden|norway|denmark|finland|belgium|austria|ireland|portugal|poland|greece|turkey|egypt|saudi arabia|pakistan|indonesia|thailand|vietnam|taiwan)$/i;

/**
 * Extracts a clean institution candidate string (and optional country code)
 * from raw affiliation text when OpenAlex `authorship.institutions` is empty.
 */
export function extractInstitutionFromRawAffiliations(
  rawStrings?: string[],
  rawCountries?: string[]
): {
  institutionName: string;
  countryCode: string;
} | null {
  const cleanedLines = (rawStrings || [])
    .map((s) =>
      String(s || '')
        .replace(/#TAB#/g, ' ')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter((s) => s.length >= 3);

  const explicitCC = inferCountryCodeFromAffiliationString('', rawCountries);

  for (const line of cleanedLines) {
    const countryCode = inferCountryCodeFromAffiliationString(line, rawCountries);
    const segments = line
      .split(/\s*(?:,|;|\|)\s*/)
      .map((seg) =>
        seg
          .replace(/Universiti\s+Kebagsaan\s+Malaysia/gi, 'Universiti Kebangsaan Malaysia')
          .replace(/\b\d{4,6}\b$/g, '')
          .trim()
      )
      .filter((seg) => seg.length >= 3 && !PURE_GEO_OR_POSTAL_RE.test(seg) && !/^\d+$/.test(seg));

    // 1. Prefer segment with explicit university / institute / lab keyword that isn't solely "Department of ..."
    const primarySeg =
      segments.find(
        (seg) =>
          STRONG_INSTITUTION_KEYWORD_RE.test(seg) &&
          !PURE_SUBUNIT_PREFIX_RE.test(seg) &&
          !/^faculty\s+of\b/i.test(seg) &&
          !/^school\s+of\b/i.test(seg)
      ) ||
      segments.find(
        (seg) =>
          STRONG_INSTITUTION_KEYWORD_RE.test(seg) && !PURE_SUBUNIT_PREFIX_RE.test(seg)
      ) ||
      segments.find((seg) => STRONG_INSTITUTION_KEYWORD_RE.test(seg));

    if (primarySeg) {
      return {
        institutionName: primarySeg,
        countryCode,
      };
    }

    // 2. Otherwise use the first clean non-department, non-geo organization segment
    const orgSeg = segments.find((seg) => !PURE_SUBUNIT_PREFIX_RE.test(seg));
    if (orgSeg && orgSeg.length >= 4) {
      return {
        institutionName: orgSeg,
        countryCode,
      };
    }
  }

  if (explicitCC) {
    return {
      institutionName: '',
      countryCode: explicitCC,
    };
  }

  return null;
}
