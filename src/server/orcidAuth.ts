import crypto from 'crypto';

export type OrcidEnvironment = 'production' | 'sandbox';
export type AuthProvider = 'google' | 'orcid' | 'email';

export interface AuthenticatedResearcherRecord {
  uid: string;
  name: string;
  emailOrId: string;
  photoURL?: string;
  scholarUrl?: string;
  scholarUserId?: string;
  orcidId?: string;
  verified?: boolean;
  provider: AuthProvider;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface OrcidEndpoints {
  env: OrcidEnvironment;
  baseDomain: string;
  issuer: string;
  authorizeUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  jwksUrl: string;
  publicApiBase: string;
}

export interface SignedOAuthStatePayload {
  nonce: string;
  csrf: string;
  redirectUri: string;
  env: OrcidEnvironment;
  mode: 'popup' | 'redirect';
  linkUid?: string;
  scholarUserId?: string;
  scholarQueryName?: string;
  iat: number;
  exp: number;
}

export interface SignedSessionPayload {
  uid: string;
  orcidId?: string;
  name?: string;
  provider: AuthProvider;
  iat: number;
  exp: number;
}

export interface OrcidTokenResponse {
  access_token?: string;
  token_type?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  name?: string;
  orcid?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

export interface VerifiedOrcidIdentity {
  orcidId: string;
  name: string;
  givenName?: string;
  familyName?: string;
  authTime?: number;
  amr?: string[];
  verifiedVia: 'id_token' | 'userinfo' | 'token_response';
}

export class OrcidConflictError extends Error {
  public readonly statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = 'OrcidConflictError';
  }
}

export class OrcidValidationError extends Error {
  public readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'OrcidValidationError';
  }
}

export class OrcidUnauthorizedError extends Error {
  public readonly statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = 'OrcidUnauthorizedError';
  }
}

export const ORCID_SESSION_COOKIE_NAME = 'scholarlens_session';
export const ORCID_STATE_COOKIE_NAME = 'scholarlens_orcid_state';
const DEFAULT_STATE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Returns official ORCID OAuth 2.0 / OIDC endpoints for production or sandbox.
 */
export function getOrcidEndpoints(env: OrcidEnvironment = 'production'): OrcidEndpoints {
  const isSandbox = env === 'sandbox';
  const baseDomain = isSandbox ? 'sandbox.orcid.org' : 'orcid.org';
  const publicDomain = isSandbox ? 'pub.sandbox.orcid.org' : 'pub.orcid.org';
  return {
    env: isSandbox ? 'sandbox' : 'production',
    baseDomain,
    issuer: `https://${baseDomain}`,
    authorizeUrl: `https://${baseDomain}/oauth/authorize`,
    tokenUrl: `https://${baseDomain}/oauth/token`,
    userinfoUrl: `https://${baseDomain}/oauth/userinfo`,
    jwksUrl: `https://${baseDomain}/oauth/jwks`,
    publicApiBase: `https://${publicDomain}/v3.0`,
  };
}

/**
 * Normalizes an ORCID URI or raw identifier to canonical XXXX-XXXX-XXXX-XXXX format.
 * Returns null if the input does not match valid ORCID structure.
 */
export function normalizeOrcidId(rawInput: string | undefined | null): string | null {
  if (!rawInput || typeof rawInput !== 'string') return null;
  const trimmed = rawInput
    .trim()
    .replace(/^https?:\/\/(sandbox\.)?orcid\.org\//i, '')
    .replace(/[/?#].*$/, '')
    .toUpperCase();
  const digits = trimmed.replace(/[^0-9X]/g, '');
  if (!/^\d{15}[\dX]$/.test(digits)) {
    return null;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}`;
}

/**
 * Validates the ISO 7064 Mod 11-2 check digit of an ORCID iD.
 */
export function hasValidOrcidChecksum(orcidId: string): boolean {
  const normalized = normalizeOrcidId(orcidId);
  if (!normalized) return false;
  const digits = normalized.replace(/-/g, '');
  let total = 0;
  for (let i = 0; i < 15; i += 1) {
    total = (total + Number(digits[i])) * 2;
  }
  const remainder = total % 11;
  const result = (12 - remainder) % 11;
  const expected = result === 10 ? 'X' : String(result);
  return digits[15] === expected;
}

/**
 * Derives the canonical ScholarLens account UID for an ORCID-created account.
 */
export function orcidIdToUid(orcidId: string): string {
  const normalized = normalizeOrcidId(orcidId);
  if (!normalized) {
    throw new OrcidValidationError('Invalid ORCID iD format.');
  }
  return `orcid_${normalized.replace(/-/g, '')}`;
}

export interface OrcidClientIdValidationResult {
  valid: boolean;
  clientId: string;
  error?: string;
}

const ORCID_OAUTH_CLIENT_ID_PATTERN = /^APP-[A-Za-z0-9]{12,32}$/;

/**
 * Validates that a configured ORCID OAuth client_id is a real Developer Tools
 * application identifier (APP-...) rather than a personal ORCID iD / URL or placeholder.
 */
export function validateOrcidClientId(
  rawClientId: string | undefined | null
): OrcidClientIdValidationResult {
  const clientId = String(rawClientId || '').trim();
  if (
    !clientId ||
    clientId === 'MY_ORCID_CLIENT_ID' ||
    clientId === 'APP-XXXXXXXXXXXXXXXX'
  ) {
    return {
      valid: false,
      clientId: '',
      error:
        'ORCID OAuth Client ID is missing or still a placeholder. Register an application at https://orcid.org/developer-tools and use its APP-... Client ID.',
    };
  }

  if (/orcid\.org/i.test(clientId) || normalizeOrcidId(clientId) !== null) {
    return {
      valid: false,
      clientId,
      error:
        'Entered a personal ORCID iD / profile URL instead of an OAuth Application Client ID. Do not use your 0000-0000-0000-0000 ORCID iD as client_id; obtain an APP-... Client ID from ORCID Developer Tools.',
    };
  }

  if (!ORCID_OAUTH_CLIENT_ID_PATTERN.test(clientId)) {
    return {
      valid: false,
      clientId,
      error:
        'Invalid ORCID Client ID format. Official ORCID OAuth Client IDs begin with "APP-" followed by alphanumeric characters (e.g. APP-1234567890ABCDEF) and must match the selected environment (Production or Sandbox).',
    };
  }

  return {
    valid: true,
    clientId,
  };
}

/**
 * Extracts first token of potentially comma-separated proxy header values.
 */
function firstHeaderToken(value: string | string[] | undefined): string {
  if (!value) return '';
  const raw = Array.isArray(value) ? value[0] : value;
  return String(raw || '').split(',')[0].trim();
}

/**
 * Deterministically resolves the public origin URL across local Express and Vercel proxy headers.
 * Deliberately avoids trusting volatile client Origin headers so authorize and callback match.
 */
export function resolvePublicBaseUrl(params: {
  appUrlEnv?: string;
  headers: Record<string, string | string[] | undefined>;
  protocol?: string;
}): string {
  const appUrl = (params.appUrlEnv || '').trim();
  if (appUrl && !appUrl.includes('MY_APP_URL')) {
    return appUrl.replace(/\/$/, '');
  }

  const forwardedHost = firstHeaderToken(params.headers['x-forwarded-host']);
  const host = forwardedHost || firstHeaderToken(params.headers.host) || 'localhost:3000';
  const forwardedProto = firstHeaderToken(params.headers['x-forwarded-proto']);
  let proto = forwardedProto || params.protocol || 'http';

  if (
    !forwardedProto &&
    host &&
    !host.startsWith('localhost') &&
    !host.startsWith('127.0.0.1') &&
    proto === 'http'
  ) {
    proto = 'https';
  }

  return `${proto}://${host}`.replace(/\/$/, '');
}

/**
 * Parses HTTP Cookie header into key-value map.
 */
export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const rawVal = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(rawVal);
    } catch {
      out[key] = rawVal;
    }
  }
  return out;
}

/**
 * Serializes a Set-Cookie header string with secure defaults.
 */
export function serializeCookie(
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Lax' | 'Strict' | 'None';
    path?: string;
    maxAgeSeconds?: number;
  } = {}
): string {
  const segments = [`${name}=${encodeURIComponent(value)}`];
  segments.push(`Path=${options.path || '/'}`);
  if (options.httpOnly !== false) segments.push('HttpOnly');
  segments.push(`SameSite=${options.sameSite || 'Lax'}`);
  if (options.secure) segments.push('Secure');
  if (typeof options.maxAgeSeconds === 'number') {
    segments.push(`Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`);
  }
  return segments.join('; ');
}

/**
 * Resolves the HMAC signing secret for OAuth state & HttpOnly session cookies.
 * Deterministic fallback keeps sessions valid across serverless instances when SESSION_SECRET is unset.
 */
export function deriveAuthSecret(env: {
  sessionSecret?: string;
  authSecret?: string;
  orcidClientSecret?: string;
  firebaseProjectId?: string;
  firebaseApiKey?: string;
}): string {
  const explicit = (env.sessionSecret || env.authSecret || '').trim();
  if (explicit) return explicit;
  const seed = [
    'scholarlens-auth-signing-key-v1',
    (env.orcidClientSecret || '').trim(),
    (env.firebaseProjectId || '').trim(),
    (env.firebaseApiKey || '').trim(),
  ].join(':');
  return crypto.createHmac('sha256', 'scholarlens-root-salt').update(seed).digest('hex');
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecodeToBuffer(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  return Buffer.from(padded, 'base64');
}

function signTokenPayload<T extends object>(payload: T, secret: string): string {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const sig = base64UrlEncode(crypto.createHmac('sha256', secret).update(encoded).digest());
  return `${encoded}.${sig}`;
}

function verifyTokenPayload<T extends { exp?: number }>(
  token: string,
  secret: string,
  nowMs = Date.now()
): T | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, providedSig] = parts;
  if (!encoded || !providedSig) return null;

  const expectedSig = base64UrlEncode(crypto.createHmac('sha256', secret).update(encoded).digest());
  const providedBuf = Buffer.from(providedSig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecodeToBuffer(encoded).toString('utf8')) as T;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.exp === 'number' && parsed.exp < nowMs) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function createSignedOAuthState(
  params: {
    redirectUri: string;
    env: OrcidEnvironment;
    mode?: 'popup' | 'redirect';
    linkUid?: string;
    scholarUserId?: string;
    scholarQueryName?: string;
    ttlMs?: number;
    nowMs?: number;
  },
  secret: string
): { stateToken: string; payload: SignedOAuthStatePayload } {
  const nowMs = params.nowMs ?? Date.now();
  const cleanScholarId = typeof params.scholarUserId === 'string' ? params.scholarUserId.trim() : '';
  const cleanScholarQuery =
    typeof params.scholarQueryName === 'string' ? params.scholarQueryName.trim() : '';
  const payload: SignedOAuthStatePayload = {
    nonce: base64UrlEncode(crypto.randomBytes(18)),
    csrf: base64UrlEncode(crypto.randomBytes(18)),
    redirectUri: params.redirectUri,
    env: params.env,
    mode: params.mode === 'redirect' ? 'redirect' : 'popup',
    ...(params.linkUid ? { linkUid: params.linkUid } : {}),
    ...(cleanScholarId ? { scholarUserId: cleanScholarId } : {}),
    ...(cleanScholarQuery ? { scholarQueryName: cleanScholarQuery } : {}),
    iat: nowMs,
    exp: nowMs + (params.ttlMs ?? DEFAULT_STATE_TTL_MS),
  };
  return {
    stateToken: signTokenPayload(payload, secret),
    payload,
  };
}

export function verifySignedOAuthState(
  stateToken: string,
  secret: string,
  options: { expectedCsrf?: string; requireCsrf?: boolean; nowMs?: number } = {}
): SignedOAuthStatePayload | null {
  const payload = verifyTokenPayload<SignedOAuthStatePayload>(stateToken, secret, options.nowMs);
  if (!payload || !payload.csrf || !payload.nonce || !payload.redirectUri) {
    return null;
  }
  if (options.requireCsrf !== false) {
    if (!options.expectedCsrf) {
      return null;
    }
    const a = Buffer.from(payload.csrf, 'utf8');
    const b = Buffer.from(options.expectedCsrf, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }
  }
  return payload;
}

export function createSignedSessionToken(
  params: {
    uid: string;
    orcidId?: string;
    name?: string;
    provider: AuthProvider;
    ttlMs?: number;
    nowMs?: number;
  },
  secret: string
): string {
  const nowMs = params.nowMs ?? Date.now();
  const safeName = typeof params.name === 'string' ? params.name.trim().slice(0, 160) : '';
  const payload: SignedSessionPayload = {
    uid: params.uid,
    ...(params.orcidId ? { orcidId: params.orcidId } : {}),
    ...(safeName ? { name: safeName } : {}),
    provider: params.provider,
    iat: nowMs,
    exp: nowMs + (params.ttlMs ?? DEFAULT_SESSION_TTL_MS),
  };
  return signTokenPayload(payload, secret);
}

export function verifySignedSessionToken(
  token: string,
  secret: string,
  nowMs = Date.now()
): SignedSessionPayload | null {
  const payload = verifyTokenPayload<SignedSessionPayload>(token, secret, nowMs);
  if (!payload || !payload.uid || !payload.provider) {
    return null;
  }
  return payload;
}

interface JwkKey {
  kty: string;
  kid?: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  [key: string]: unknown;
}

const jwksCache = new Map<string, { keys: JwkKey[]; fetchedAt: number }>();
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000;

async function fetchJwksKeys(
  jwksUrl: string,
  fetchImpl: typeof fetch,
  forceRefresh = false
): Promise<JwkKey[]> {
  const cached = jwksCache.get(jwksUrl);
  if (!forceRefresh && cached && Date.now() - cached.fetchedAt < JWKS_CACHE_TTL_MS) {
    return cached.keys;
  }
  const resp = await fetchImpl(jwksUrl, { headers: { Accept: 'application/json' } });
  if (!resp.ok) {
    throw new OrcidUnauthorizedError(`Failed to fetch ORCID JWKS (${resp.status}).`);
  }
  const json = (await resp.json()) as { keys?: JwkKey[] };
  const keys = Array.isArray(json?.keys) ? json.keys : [];
  jwksCache.set(jwksUrl, { keys, fetchedAt: Date.now() });
  return keys;
}

/**
 * Cryptographically verifies an ORCID OpenID Connect id_token (RS256 against ORCID JWKS)
 * along with issuer, audience, expiration, nonce, and subject claims.
 */
export async function verifyOrcidIdToken(params: {
  idToken: string;
  clientId: string;
  expectedIssuer: string;
  expectedNonce?: string;
  jwksUrl: string;
  jwksOverride?: JwkKey[];
  fetchImpl?: typeof fetch;
  nowSeconds?: number;
}): Promise<VerifiedOrcidIdentity> {
  const parts = String(params.idToken || '').split('.');
  if (parts.length !== 3) {
    throw new OrcidUnauthorizedError('Malformed ORCID ID token.');
  }
  const [headerB64, payloadB64, signatureB64] = parts;

  let header: { alg?: string; kid?: string; typ?: string };
  let claims: Record<string, unknown>;
  try {
    header = JSON.parse(base64UrlDecodeToBuffer(headerB64).toString('utf8'));
    claims = JSON.parse(base64UrlDecodeToBuffer(payloadB64).toString('utf8'));
  } catch {
    throw new OrcidUnauthorizedError('Unreadable ORCID ID token payload.');
  }

  if (header.alg !== 'RS256') {
    throw new OrcidUnauthorizedError(`Unsupported ORCID ID token algorithm: ${header.alg || 'none'}`);
  }

  const fetchImpl = params.fetchImpl || fetch;
  let keys = params.jwksOverride || (await fetchJwksKeys(params.jwksUrl, fetchImpl, false));

  const findMatchingKey = (keyList: JwkKey[]): JwkKey | undefined => {
    if (header.kid) {
      return keyList.find((k) => k.kid === header.kid && k.kty === 'RSA');
    }
    const rsaKeys = keyList.filter((k) => k.kty === 'RSA' && (!k.use || k.use === 'sig'));
    return rsaKeys.length === 1 ? rsaKeys[0] : rsaKeys[0];
  };

  let jwk = findMatchingKey(keys);
  if (!jwk && !params.jwksOverride) {
    // Key rotation: retry once with fresh JWKS before rejecting
    keys = await fetchJwksKeys(params.jwksUrl, fetchImpl, true);
    jwk = findMatchingKey(keys);
  }
  if (!jwk) {
    throw new OrcidUnauthorizedError('Matching ORCID signing key not found in JWKS.');
  }

  const publicKey = crypto.createPublicKey({ key: jwk as crypto.JsonWebKey, format: 'jwk' });
  const signingInput = Buffer.from(`${headerB64}.${payloadB64}`, 'utf8');
  const signatureBuf = base64UrlDecodeToBuffer(signatureB64);
  const signatureValid = crypto.verify('RSA-SHA256', signingInput, publicKey, signatureBuf);
  if (!signatureValid) {
    throw new OrcidUnauthorizedError('Invalid ORCID ID token signature.');
  }

  const normalizedIss = String(claims.iss || '').replace(/\/$/, '');
  const normalizedExpectedIss = params.expectedIssuer.replace(/\/$/, '');
  if (normalizedIss !== normalizedExpectedIss) {
    throw new OrcidUnauthorizedError(`ORCID ID token issuer mismatch: ${normalizedIss}`);
  }

  const audClaim = claims.aud;
  const audMatches = Array.isArray(audClaim)
    ? audClaim.includes(params.clientId)
    : audClaim === params.clientId;
  if (!audMatches) {
    throw new OrcidUnauthorizedError('ORCID ID token audience does not match client ID.');
  }

  const nowSec = params.nowSeconds ?? Math.floor(Date.now() / 1000);
  const exp = Number(claims.exp);
  if (!Number.isFinite(exp) || exp < nowSec - 60) {
    throw new OrcidUnauthorizedError('ORCID ID token has expired.');
  }
  if (claims.nbf !== undefined && Number(claims.nbf) > nowSec + 60) {
    throw new OrcidUnauthorizedError('ORCID ID token is not yet valid.');
  }

  if (params.expectedNonce && claims.nonce !== params.expectedNonce) {
    throw new OrcidUnauthorizedError('ORCID ID token nonce mismatch.');
  }

  const subOrcid = normalizeOrcidId(String(claims.sub || ''));
  if (!subOrcid) {
    throw new OrcidUnauthorizedError('ORCID ID token subject is missing or malformed.');
  }

  const givenName = typeof claims.given_name === 'string' ? claims.given_name.trim() : undefined;
  const familyName = typeof claims.family_name === 'string' ? claims.family_name.trim() : undefined;
  const combinedName =
    (typeof claims.name === 'string' && claims.name.trim()) ||
    [givenName, familyName].filter(Boolean).join(' ').trim() ||
    subOrcid;

  return {
    orcidId: subOrcid,
    name: combinedName,
    ...(givenName ? { givenName } : {}),
    ...(familyName ? { familyName } : {}),
    ...(typeof claims.auth_time === 'number' ? { authTime: claims.auth_time } : {}),
    ...(Array.isArray(claims.amr) ? { amr: claims.amr.map(String) } : {}),
    verifiedVia: 'id_token',
  };
}

/**
 * Exchanges an OAuth 2.0 authorization code at ORCID /oauth/token.
 */
export async function exchangeOrcidAuthorizationCode(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  env: OrcidEnvironment;
  fetchImpl?: typeof fetch;
}): Promise<OrcidTokenResponse> {
  const endpoints = getOrcidEndpoints(params.env);
  const fetchImpl = params.fetchImpl || fetch;

  const body = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
  });

  const resp = await fetchImpl(endpoints.tokenUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = (await resp.json().catch(() => ({}))) as OrcidTokenResponse;
  if (!resp.ok || data.error) {
    throw new OrcidUnauthorizedError(
      data.error_description || data.error || `ORCID token exchange failed (${resp.status}).`
    );
  }
  return data;
}

/**
 * Queries ORCID OIDC /oauth/userinfo using the access token to fetch verified profile claims.
 */
export async function fetchOrcidUserInfo(params: {
  accessToken: string;
  env: OrcidEnvironment;
  fetchImpl?: typeof fetch;
}): Promise<VerifiedOrcidIdentity | null> {
  const endpoints = getOrcidEndpoints(params.env);
  const fetchImpl = params.fetchImpl || fetch;

  try {
    const resp = await fetchImpl(endpoints.userinfoUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${params.accessToken}`,
      },
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as Record<string, unknown>;
    const orcidId = normalizeOrcidId(String(data.sub || ''));
    if (!orcidId) return null;

    const givenName = typeof data.given_name === 'string' ? data.given_name.trim() : undefined;
    const familyName = typeof data.family_name === 'string' ? data.family_name.trim() : undefined;
    const name =
      (typeof data.name === 'string' && data.name.trim()) ||
      [givenName, familyName].filter(Boolean).join(' ').trim() ||
      orcidId;

    return {
      orcidId,
      name,
      ...(givenName ? { givenName } : {}),
      ...(familyName ? { familyName } : {}),
      verifiedVia: 'userinfo',
    };
  } catch {
    return null;
  }
}

/**
 * Resolves and verifies the researcher identity returned by ORCID token exchange.
 */
export async function verifyAndResolveOrcidIdentity(params: {
  tokenData: OrcidTokenResponse;
  clientId: string;
  env: OrcidEnvironment;
  expectedNonce?: string;
  jwksOverride?: JwkKey[];
  fetchImpl?: typeof fetch;
}): Promise<VerifiedOrcidIdentity> {
  const endpoints = getOrcidEndpoints(params.env);
  const tokenOrcid = normalizeOrcidId(params.tokenData.orcid);

  let verifiedFromIdToken: VerifiedOrcidIdentity | null = null;
  if (params.tokenData.id_token) {
    verifiedFromIdToken = await verifyOrcidIdToken({
      idToken: params.tokenData.id_token,
      clientId: params.clientId,
      expectedIssuer: endpoints.issuer,
      expectedNonce: params.expectedNonce,
      jwksUrl: endpoints.jwksUrl,
      jwksOverride: params.jwksOverride,
      fetchImpl: params.fetchImpl,
    });
    if (tokenOrcid && verifiedFromIdToken.orcidId !== tokenOrcid) {
      throw new OrcidUnauthorizedError('ORCID ID token subject does not match token response ORCID.');
    }
  }

  let verifiedFromUserInfo: VerifiedOrcidIdentity | null = null;
  if (params.tokenData.access_token) {
    verifiedFromUserInfo = await fetchOrcidUserInfo({
      accessToken: params.tokenData.access_token,
      env: params.env,
      fetchImpl: params.fetchImpl,
    });
    if (
      verifiedFromUserInfo &&
      verifiedFromIdToken &&
      verifiedFromUserInfo.orcidId !== verifiedFromIdToken.orcidId
    ) {
      throw new OrcidUnauthorizedError('ORCID UserInfo subject mismatch.');
    }
  }

  const primary = verifiedFromIdToken || verifiedFromUserInfo;
  if (primary) {
    const preferredName =
      verifiedFromUserInfo?.name && verifiedFromUserInfo.name !== primary.orcidId
        ? verifiedFromUserInfo.name
        : primary.name !== primary.orcidId
        ? primary.name
        : (params.tokenData.name || '').trim() || primary.orcidId;
    return {
      ...primary,
      name: preferredName,
    };
  }

  if (!tokenOrcid) {
    throw new OrcidUnauthorizedError('ORCID response did not contain a verified ORCID iD.');
  }

  return {
    orcidId: tokenOrcid,
    name: (params.tokenData.name || '').trim() || tokenOrcid,
    verifiedVia: 'token_response',
  };
}

// ============================================================================
// Firestore REST helpers + Unique 1-to-1 ORCID <-> Account Constraint Store
// ============================================================================

type FirestorePrimitive =
  | { stringValue: string }
  | { timestampValue: string }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { nullValue: null }
  | { mapValue: { fields: Record<string, FirestorePrimitive> } }
  | { arrayValue: { values: FirestorePrimitive[] } };

export function toFirestoreValue(val: unknown): FirestorePrimitive {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map((item) => toFirestoreValue(item)) } };
  }
  if (typeof val === 'object') {
    const fields: Record<string, FirestorePrimitive> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

export function fromFirestoreFields(
  fields: Record<string, FirestorePrimitive> | undefined
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!fields) return out;
  for (const [key, val] of Object.entries(fields)) {
    out[key] = decodeFirestoreValue(val);
  }
  return out;
}

function decodeFirestoreValue(val: FirestorePrimitive | undefined): unknown {
  if (!val) return undefined;
  if ('stringValue' in val) return val.stringValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return val.doubleValue;
  if ('nullValue' in val) return null;
  if ('mapValue' in val) return fromFirestoreFields(val.mapValue?.fields);
  if ('arrayValue' in val) {
    return Array.isArray(val.arrayValue?.values)
      ? val.arrayValue.values.map((item) => decodeFirestoreValue(item))
      : [];
  }
  return undefined;
}

export interface StoredScholarClaimDoc {
  scholarUserId: string;
  orcidId: string;
  claimedByUid: string;
  researcherName: string;
  scholarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalMirrorFallback {
  getOrcidIndex(orcidId: string): { orcidId: string; uid: string; name?: string; createdAt: string; updatedAt: string } | null;
  setOrcidIndex(entry: { orcidId: string; uid: string; name?: string; createdAt: string; updatedAt: string }): void;
  deleteOrcidIndex(orcidId: string): void;
  getUser(uid: string): AuthenticatedResearcherRecord | null;
  setUser(user: AuthenticatedResearcherRecord): void;
  deleteUser(uid: string): void;
  findUidByOrcidInUsers(orcidId: string): string | null;
  getScholarClaim?(scholarUserId: string): StoredScholarClaimDoc | null;
  setScholarClaim?(claim: StoredScholarClaimDoc): void;
  deleteScholarClaim?(scholarUserId: string): void;
}

/**
 * Creates a clean in-memory fallback store (optionally synced to disk on writable local environments).
 */
export function createInMemoryAccountMirror(): LocalMirrorFallback {
  const orcidIndex = new Map<
    string,
    { orcidId: string; uid: string; name?: string; createdAt: string; updatedAt: string }
  >();
  const users = new Map<string, AuthenticatedResearcherRecord>();
  const scholarClaims = new Map<string, StoredScholarClaimDoc>();

  return {
    getOrcidIndex(orcidId) {
      return orcidIndex.get(orcidId) || null;
    },
    setOrcidIndex(entry) {
      orcidIndex.set(entry.orcidId, { ...entry });
    },
    deleteOrcidIndex(orcidId) {
      orcidIndex.delete(orcidId);
    },
    getUser(uid) {
      const found = users.get(uid);
      return found ? { ...found } : null;
    },
    setUser(user) {
      users.set(user.uid, { ...user });
    },
    deleteUser(uid) {
      users.delete(uid);
    },
    findUidByOrcidInUsers(orcidId) {
      for (const user of users.values()) {
        if (user.orcidId === orcidId) return user.uid;
      }
      return null;
    },
    getScholarClaim(scholarUserId) {
      const found = scholarClaims.get(scholarUserId);
      return found ? { ...found } : null;
    },
    setScholarClaim(claim) {
      scholarClaims.set(claim.scholarUserId, { ...claim });
    },
    deleteScholarClaim(scholarUserId) {
      scholarClaims.delete(scholarUserId);
    },
  };
}

function docFieldsToResearcher(
  uidFallback: string,
  raw: Record<string, unknown>
): AuthenticatedResearcherRecord {
  const providerRaw = String(raw.provider || 'orcid');
  const provider: AuthProvider =
    providerRaw === 'google' || providerRaw === 'email' ? providerRaw : 'orcid';
  const orcidId = normalizeOrcidId(typeof raw.orcidId === 'string' ? raw.orcidId : undefined) || undefined;
  const displayName =
    String(raw.name || raw.displayName || '').trim() || orcidId || uidFallback;
  const emailOrId =
    String(raw.emailOrId || raw.email || orcidId || uidFallback).trim();

  return {
    uid: String(raw.uid || uidFallback),
    name: displayName,
    emailOrId,
    ...(typeof raw.photoURL === 'string' && raw.photoURL ? { photoURL: raw.photoURL } : {}),
    ...(typeof raw.scholarUrl === 'string' && raw.scholarUrl ? { scholarUrl: raw.scholarUrl } : {}),
    ...(typeof raw.scholarUserId === 'string' && raw.scholarUserId
      ? { scholarUserId: raw.scholarUserId }
      : {}),
    ...(orcidId ? { orcidId } : {}),
    verified: raw.verified !== undefined ? Boolean(raw.verified) : Boolean(orcidId),
    provider,
    ...(typeof raw.createdAt === 'string' ? { createdAt: raw.createdAt } : {}),
    ...(typeof raw.updatedAt === 'string' ? { updatedAt: raw.updatedAt } : {}),
    ...(typeof raw.lastLoginAt === 'string' ? { lastLoginAt: raw.lastLoginAt } : {}),
  };
}

function researcherToFirestoreUserDoc(
  user: AuthenticatedResearcherRecord
): Record<string, unknown> {
  const safeName = (user.name || user.orcidId || user.uid).trim().slice(0, 160);
  const safeScholarId =
    user.scholarUserId && /^[a-zA-Z0-9_-]{1,64}$/.test(user.scholarUserId.trim())
      ? user.scholarUserId.trim()
      : '';
  return {
    uid: user.uid,
    name: safeName,
    displayName: safeName,
    email: user.provider === 'orcid' ? '' : (user.emailOrId || '').slice(0, 320),
    emailOrId: (user.emailOrId || user.orcidId || user.uid).slice(0, 320),
    photoURL: (user.photoURL || '').slice(0, 150000),
    scholarUrl: (user.scholarUrl || '').slice(0, 500),
    scholarUserId: safeScholarId,
    orcidId: user.orcidId || '',
    verified: Boolean(user.verified),
    provider: user.provider,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
    lastLoginAt: user.lastLoginAt || new Date().toISOString(),
  };
}

/**
 * Manages ORCID authentication persistence and enforces the strict 1-to-1 unique ORCID-to-account
 * constraint in Cloud Firestore (with optional local mirror for resilience and tests).
 */
export class OrcidAccountStore {
  private readonly firestoreDocBase: string;
  private readonly getBridgeToken: () => Promise<string | null>;
  private readonly mirror: LocalMirrorFallback;
  private readonly fetchImpl: typeof fetch;
  private readonly onPersistMirror?: () => void;

  constructor(options: {
    firestoreDocBase: string;
    getBridgeToken: () => Promise<string | null>;
    mirror?: LocalMirrorFallback;
    fetchImpl?: typeof fetch;
    onPersistMirror?: () => void;
  }) {
    this.firestoreDocBase = options.firestoreDocBase.replace(/\/$/, '');
    this.getBridgeToken = options.getBridgeToken;
    this.mirror = options.mirror || createInMemoryAccountMirror();
    this.fetchImpl = options.fetchImpl || fetch;
    this.onPersistMirror = options.onPersistMirror;
  }

  private get firestoreRootDocumentPath(): string {
    // Converts https://firestore.googleapis.com/v1/projects/P/databases/D/documents -> projects/P/databases/D/documents
    const marker = '/v1/';
    const idx = this.firestoreDocBase.indexOf(marker);
    return idx >= 0 ? this.firestoreDocBase.slice(idx + marker.length) : '';
  }

  private async getDoc(collection: string, docId: string): Promise<Record<string, unknown> | null | 'UNAVAILABLE'> {
    try {
      const token = await this.getBridgeToken();
      if (!token) return 'UNAVAILABLE';
      const resp = await this.fetchImpl(
        `${this.firestoreDocBase}/${encodeURIComponent(collection)}/${encodeURIComponent(docId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (resp.status === 404) return null;
      if (!resp.ok) {
        const body = await resp.text().catch(() => '');
        console.warn(`[OrcidStore] Firestore GET ${collection}/${docId} failed (${resp.status}):`, body.slice(0, 200));
        return 'UNAVAILABLE';
      }
      const doc = (await resp.json()) as { fields?: Record<string, FirestorePrimitive> };
      return fromFirestoreFields(doc.fields);
    } catch (err) {
      console.warn(`[OrcidStore] Firestore GET ${collection}/${docId} error:`, err);
      return 'UNAVAILABLE';
    }
  }

  private async upsertDoc(collection: string, docId: string, data: Record<string, unknown>): Promise<boolean> {
    try {
      const token = await this.getBridgeToken();
      if (!token) return false;
      const fields: Record<string, FirestorePrimitive> = {};
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined) fields[k] = toFirestoreValue(v);
      }
      const resp = await this.fetchImpl(
        `${this.firestoreDocBase}/${encodeURIComponent(collection)}/${encodeURIComponent(docId)}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields }),
        }
      );
      if (!resp.ok) {
        const body = await resp.text().catch(() => '');
        console.warn(`[OrcidStore] Firestore PATCH ${collection}/${docId} failed (${resp.status}):`, body.slice(0, 200));
        return false;
      }
      return true;
    } catch (err) {
      console.warn(`[OrcidStore] Firestore PATCH ${collection}/${docId} error:`, err);
      return false;
    }
  }

  private async deleteDoc(collection: string, docId: string): Promise<boolean> {
    try {
      const token = await this.getBridgeToken();
      if (!token) return false;
      const resp = await this.fetchImpl(
        `${this.firestoreDocBase}/${encodeURIComponent(collection)}/${encodeURIComponent(docId)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (resp.status === 404) return true;
      if (!resp.ok) {
        const body = await resp.text().catch(() => '');
        console.warn(`[OrcidStore] Firestore DELETE ${collection}/${docId} failed (${resp.status}):`, body.slice(0, 200));
        return false;
      }
      return true;
    } catch (err) {
      console.warn(`[OrcidStore] Firestore DELETE ${collection}/${docId} error:`, err);
      return false;
    }
  }

  /**
   * Atomically creates `/orcidAccounts/{orcidId}` with precondition `exists: false`
   * and writes the corresponding `/users/{uid}` profile in the same Firestore commit.
   */
  private async atomicCreateOrcidBinding(
    orcidId: string,
    indexData: { orcidId: string; uid: string; name: string; createdAt: string; updatedAt: string },
    userData: Record<string, unknown>
  ): Promise<'OK' | 'ALREADY_EXISTS' | 'UNAVAILABLE'> {
    try {
      const token = await this.getBridgeToken();
      if (!token || !this.firestoreRootDocumentPath) return 'UNAVAILABLE';

      const toFields = (obj: Record<string, unknown>) => {
        const out: Record<string, FirestorePrimitive> = {};
        for (const [k, v] of Object.entries(obj)) {
          if (v !== undefined) out[k] = toFirestoreValue(v);
        }
        return out;
      };

      const commitUrl = `${this.firestoreDocBase}:commit`;
      const resp = await this.fetchImpl(commitUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          writes: [
            {
              update: {
                name: `${this.firestoreRootDocumentPath}/orcidAccounts/${orcidId}`,
                fields: toFields(indexData),
              },
              currentDocument: { exists: false },
            },
            {
              update: {
                name: `${this.firestoreRootDocumentPath}/users/${String(userData.uid)}`,
                fields: toFields(userData),
              },
            },
          ],
        }),
      });

      if (resp.ok) return 'OK';

      const errText = await resp.text().catch(() => '');
      if (
        resp.status === 409 ||
        errText.includes('ALREADY_EXISTS') ||
        errText.includes('already exists')
      ) {
        return 'ALREADY_EXISTS';
      }
      console.warn(`[OrcidStore] Firestore atomic commit failed (${resp.status}):`, errText.slice(0, 250));
      return 'UNAVAILABLE';
    } catch (err) {
      console.warn('[OrcidStore] Firestore atomic commit error:', err);
      return 'UNAVAILABLE';
    }
  }

  /**
   * Authenticates an existing account bound to `orcidId` or creates a brand new one,
   * strictly enforcing that one ORCID iD maps to at most one ScholarLens account.
   */
  async authenticateOrRegisterOrcidUser(params: {
    orcidId: string;
    verifiedName: string;
    linkToUid?: string;
    scholarUserId?: string;
    scholarUrl?: string;
    photoURL?: string;
  }): Promise<{ user: AuthenticatedResearcherRecord; isNewAccount: boolean }> {
    const canonicalOrcid = normalizeOrcidId(params.orcidId);
    if (!canonicalOrcid) {
      throw new OrcidValidationError('Invalid ORCID iD received from provider.');
    }

    const nowIso = new Date().toISOString();
    const linkToUid = params.linkToUid?.trim() || undefined;
    const cleanScholarUserId = params.scholarUserId?.trim() || undefined;
    const cleanScholarUrl = params.scholarUrl?.trim() || undefined;
    const cleanPhotoURL = params.photoURL?.trim() || undefined;

    // 1. Check authoritative unique index in Firestore first, then mirror fallback
    const remoteIndex = await this.getDoc('orcidAccounts', canonicalOrcid);
    let existingUid: string | null = null;
    if (remoteIndex && remoteIndex !== 'UNAVAILABLE' && typeof remoteIndex.uid === 'string') {
      existingUid = remoteIndex.uid;
    } else if (remoteIndex === null) {
      this.mirror.deleteOrcidIndex(canonicalOrcid);
    } else if (remoteIndex === 'UNAVAILABLE') {
      const mirrorIndex = this.mirror.getOrcidIndex(canonicalOrcid);
      if (mirrorIndex?.uid) {
        existingUid = mirrorIndex.uid;
      } else {
        existingUid = this.mirror.findUidByOrcidInUsers(canonicalOrcid);
      }
    }

    // Also guard linkToUid: an account linking an ORCID cannot silently hijack or steal another UID's ORCID
    if (existingUid) {
      if (linkToUid && linkToUid !== existingUid) {
        throw new OrcidConflictError(
          `ORCID iD ${canonicalOrcid} is already associated with another ScholarLens account.`
        );
      }

      const remoteUser = await this.getDoc('users', existingUid);
      const baseUser =
        remoteUser && remoteUser !== 'UNAVAILABLE'
          ? docFieldsToResearcher(existingUid, remoteUser)
          : (remoteUser === 'UNAVAILABLE' ? this.mirror.getUser(existingUid) : null) || {
              uid: existingUid,
              name: params.verifiedName || canonicalOrcid,
              emailOrId: canonicalOrcid,
              orcidId: canonicalOrcid,
              verified: true,
              provider: 'orcid' as const,
              createdAt: nowIso,
            };

      const updatedUser: AuthenticatedResearcherRecord = {
        ...baseUser,
        uid: existingUid,
        name:
          baseUser.name && baseUser.name !== canonicalOrcid
            ? baseUser.name
            : params.verifiedName || canonicalOrcid,
        emailOrId: baseUser.emailOrId || canonicalOrcid,
        ...(baseUser.photoURL
          ? { photoURL: baseUser.photoURL }
          : cleanPhotoURL
          ? { photoURL: cleanPhotoURL }
          : {}),
        ...(cleanScholarUrl
          ? { scholarUrl: cleanScholarUrl }
          : baseUser.scholarUrl
          ? { scholarUrl: baseUser.scholarUrl }
          : {}),
        ...(cleanScholarUserId
          ? { scholarUserId: cleanScholarUserId }
          : baseUser.scholarUserId
          ? { scholarUserId: baseUser.scholarUserId }
          : {}),
        orcidId: canonicalOrcid,
        verified: true,
        updatedAt: nowIso,
        lastLoginAt: nowIso,
      };

      await this.upsertDoc('users', existingUid, researcherToFirestoreUserDoc(updatedUser));
      this.mirror.setOrcidIndex({
        orcidId: canonicalOrcid,
        uid: existingUid,
        name: updatedUser.name,
        createdAt: updatedUser.createdAt || nowIso,
        updatedAt: nowIso,
      });
      this.mirror.setUser(updatedUser);
      this.onPersistMirror?.();

      return { user: updatedUser, isNewAccount: false };
    }

    // 2. If linkToUid was supplied, verify that target user doesn't already own a *different* ORCID iD
    if (linkToUid) {
      const targetRemote = await this.getDoc('users', linkToUid);
      const targetLocal = this.mirror.getUser(linkToUid);
      const existingTargetUser =
        targetRemote && targetRemote !== 'UNAVAILABLE'
          ? docFieldsToResearcher(linkToUid, targetRemote)
          : targetLocal;
      if (existingTargetUser?.orcidId && existingTargetUser.orcidId !== canonicalOrcid) {
        throw new OrcidConflictError(
          `This account is already linked to ORCID iD ${existingTargetUser.orcidId}.`
        );
      }
    }

    const targetUid = linkToUid || orcidIdToUid(canonicalOrcid);

    // Check existing target user profile if linking to an existing Google/Email UID
    let existingProfile: AuthenticatedResearcherRecord | null = null;
    if (linkToUid) {
      const remoteExisting = await this.getDoc('users', linkToUid);
      existingProfile =
        remoteExisting && remoteExisting !== 'UNAVAILABLE'
          ? docFieldsToResearcher(linkToUid, remoteExisting)
          : this.mirror.getUser(linkToUid);
    }

    const newUser: AuthenticatedResearcherRecord = {
      uid: targetUid,
      name:
        existingProfile?.name ||
        (params.verifiedName && params.verifiedName.trim()) ||
        canonicalOrcid,
      emailOrId: existingProfile?.emailOrId || canonicalOrcid,
      ...(cleanPhotoURL || existingProfile?.photoURL
        ? { photoURL: cleanPhotoURL || existingProfile?.photoURL }
        : {}),
      ...(cleanScholarUrl || existingProfile?.scholarUrl
        ? { scholarUrl: cleanScholarUrl || existingProfile?.scholarUrl }
        : {}),
      ...(cleanScholarUserId || existingProfile?.scholarUserId
        ? { scholarUserId: cleanScholarUserId || existingProfile?.scholarUserId }
        : {}),
      orcidId: canonicalOrcid,
      verified: true,
      provider: existingProfile?.provider || 'orcid',
      createdAt: existingProfile?.createdAt || nowIso,
      updatedAt: nowIso,
      lastLoginAt: nowIso,
    };

    const indexDoc = {
      orcidId: canonicalOrcid,
      uid: targetUid,
      name: newUser.name,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Atomic creation in Firestore enforces strict uniqueness against concurrent races
    const commitStatus = await this.atomicCreateOrcidBinding(
      canonicalOrcid,
      indexDoc,
      researcherToFirestoreUserDoc(newUser)
    );

    if (commitStatus === 'ALREADY_EXISTS') {
      // Another request concurrently bound this ORCID iD first
      const winnerIndex = await this.getDoc('orcidAccounts', canonicalOrcid);
      const winnerUid =
        winnerIndex && winnerIndex !== 'UNAVAILABLE' && typeof winnerIndex.uid === 'string'
          ? winnerIndex.uid
          : null;
      if (linkToUid && winnerUid !== linkToUid) {
        throw new OrcidConflictError(
          `ORCID iD ${canonicalOrcid} is already associated with another ScholarLens account.`
        );
      }
      if (winnerUid) {
        const winnerUser = await this.getUserByUid(winnerUid);
        if (winnerUser) {
          return { user: winnerUser, isNewAccount: false };
        }
      }
      throw new OrcidConflictError(
        `ORCID iD ${canonicalOrcid} is already associated with another ScholarLens account.`
      );
    }

    // Enforce in-process uniqueness fallback only when Firestore was unreachable
    if (commitStatus === 'UNAVAILABLE') {
      const mirrorExisting =
        this.mirror.getOrcidIndex(canonicalOrcid)?.uid ||
        this.mirror.findUidByOrcidInUsers(canonicalOrcid);
      if (mirrorExisting && mirrorExisting !== targetUid) {
        throw new OrcidConflictError(
          `ORCID iD ${canonicalOrcid} is already associated with another ScholarLens account.`
        );
      }
    }

    this.mirror.setOrcidIndex(indexDoc);
    this.mirror.setUser(newUser);
    this.onPersistMirror?.();

    return { user: newUser, isNewAccount: !linkToUid };
  }

  async getUserLookupResult(
    uid: string
  ): Promise<
    | { status: 'FOUND'; user: AuthenticatedResearcherRecord }
    | { status: 'NOT_FOUND' }
    | { status: 'UNAVAILABLE' }
  > {
    if (!uid) return { status: 'NOT_FOUND' };
    const remote = await this.getDoc('users', uid);
    if (remote && remote !== 'UNAVAILABLE') {
      const record = docFieldsToResearcher(uid, remote);
      this.mirror.setUser(record);
      return { status: 'FOUND', user: record };
    }
    if (remote === 'UNAVAILABLE') {
      const mirrored = this.mirror.getUser(uid);
      return mirrored ? { status: 'FOUND', user: mirrored } : { status: 'UNAVAILABLE' };
    }
    // Authoritative 404 from Firestore: evict stale in-memory mirror rather than resurrecting deleted users
    this.mirror.deleteUser(uid);
    return { status: 'NOT_FOUND' };
  }

  async getUserByUid(uid: string): Promise<AuthenticatedResearcherRecord | null> {
    const result = await this.getUserLookupResult(uid);
    return result.status === 'FOUND' ? result.user : null;
  }

  async updateUserProfile(
    uid: string,
    updates: {
      name?: string;
      photoURL?: string;
      scholarUrl?: string;
      scholarUserId?: string;
    },
    fallbackUser?: AuthenticatedResearcherRecord
  ): Promise<AuthenticatedResearcherRecord | null> {
    const lookup = await this.getUserLookupResult(uid);
    const existing =
      lookup.status === 'FOUND'
        ? lookup.user
        : lookup.status === 'UNAVAILABLE' && fallbackUser?.uid === uid
        ? fallbackUser
        : null;
    if (!existing) return null;

    const nowIso = new Date().toISOString();
    const nextUser: AuthenticatedResearcherRecord = {
      ...existing,
      ...(updates.name !== undefined && updates.name.trim()
        ? { name: updates.name.trim() }
        : {}),
      ...(updates.photoURL !== undefined ? { photoURL: updates.photoURL.trim() } : {}),
      ...(updates.scholarUrl !== undefined ? { scholarUrl: updates.scholarUrl.trim() } : {}),
      ...(updates.scholarUserId !== undefined
        ? { scholarUserId: updates.scholarUserId.trim() }
        : {}),
      updatedAt: nowIso,
    };

    await this.upsertDoc('users', uid, researcherToFirestoreUserDoc(nextUser));
    this.mirror.setUser(nextUser);
    this.onPersistMirror?.();
    return nextUser;
  }

  async getScholarClaim(scholarUserId: string): Promise<StoredScholarClaimDoc | null> {
    const cleanId = scholarUserId.trim();
    if (!cleanId) return null;

    const remote = await this.getDoc('scholarClaims', cleanId);
    if (remote && remote !== 'UNAVAILABLE' && typeof remote.orcidId === 'string') {
      const claim: StoredScholarClaimDoc = {
        scholarUserId: String(remote.scholarUserId || cleanId),
        orcidId: String(remote.orcidId),
        claimedByUid: String(remote.claimedByUid || ''),
        researcherName: String(remote.researcherName || ''),
        ...(typeof remote.scholarUrl === 'string' && remote.scholarUrl
          ? { scholarUrl: remote.scholarUrl }
          : {}),
        createdAt: String(remote.createdAt || new Date().toISOString()),
        updatedAt: String(remote.updatedAt || remote.createdAt || new Date().toISOString()),
      };
      this.mirror.setScholarClaim?.(claim);
      return claim;
    }
    if (remote === null) {
      this.mirror.deleteScholarClaim?.(cleanId);
      return null;
    }
    return this.mirror.getScholarClaim?.(cleanId) || null;
  }

  async upsertScholarClaim(params: {
    scholarUserId: string;
    orcidId: string;
    claimedByUid: string;
    researcherName: string;
    scholarUrl?: string;
    createdAt?: string;
  }): Promise<StoredScholarClaimDoc> {
    const nowIso = new Date().toISOString();
    const cleanScholarId = params.scholarUserId.trim();
    const claim: StoredScholarClaimDoc = {
      scholarUserId: cleanScholarId,
      orcidId: params.orcidId.trim(),
      claimedByUid: params.claimedByUid.trim(),
      researcherName: params.researcherName.trim() || params.orcidId.trim(),
      ...(params.scholarUrl?.trim() ? { scholarUrl: params.scholarUrl.trim() } : {}),
      createdAt: params.createdAt || nowIso,
      updatedAt: nowIso,
    };
    await this.upsertDoc('scholarClaims', cleanScholarId, { ...claim });
    this.mirror.setScholarClaim?.(claim);
    this.onPersistMirror?.();
    return claim;
  }

  async deleteScholarClaim(scholarUserId: string): Promise<void> {
    const cleanId = scholarUserId.trim();
    if (!cleanId) return;
    await this.deleteDoc('scholarClaims', cleanId);
    this.mirror.deleteScholarClaim?.(cleanId);
    this.onPersistMirror?.();
  }

  async deleteUserAccount(uid: string): Promise<boolean> {
    const existing = await this.getUserByUid(uid);
    const orcidId = existing?.orcidId ? normalizeOrcidId(existing.orcidId) : null;

    if (orcidId) {
      const remoteIndex = await this.getDoc('orcidAccounts', orcidId);
      const localIndex = this.mirror.getOrcidIndex(orcidId);
      const ownerUid =
        (remoteIndex && remoteIndex !== 'UNAVAILABLE' && typeof remoteIndex.uid === 'string'
          ? remoteIndex.uid
          : null) || localIndex?.uid;
      if (!ownerUid || ownerUid === uid) {
        await this.deleteDoc('orcidAccounts', orcidId);
        this.mirror.deleteOrcidIndex(orcidId);
      }
    }

    if (existing?.scholarUserId) {
      const claim = await this.getScholarClaim(existing.scholarUserId);
      if (!claim || claim.claimedByUid === uid || (orcidId && claim.orcidId === orcidId)) {
        await this.deleteDoc('scholarClaims', existing.scholarUserId);
        this.mirror.deleteScholarClaim?.(existing.scholarUserId);
      }
    }

    await this.deleteDoc('users', uid);
    this.mirror.deleteUser(uid);
    this.onPersistMirror?.();
    return true;
  }
}
