import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import {
  normalizeOrcidId,
  hasValidOrcidChecksum,
  orcidIdToUid,
  validateOrcidClientId,
  resolvePublicBaseUrl,
  parseCookies,
  serializeCookie,
  createSignedOAuthState,
  verifySignedOAuthState,
  createSignedSessionToken,
  verifySignedSessionToken,
  verifyOrcidIdToken,
  exchangeOrcidAuthorizationCode,
  verifyAndResolveOrcidIdentity,
  OrcidAccountStore,
  OrcidConflictError,
  OrcidUnauthorizedError,
  toFirestoreValue,
} from './orcidAuth';

function base64Url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createSignedRs256Jwt(
  payload: Record<string, unknown>,
  privateKey: crypto.KeyObject,
  kid = 'orcid-test-key-1',
  alg = 'RS256'
): string {
  const header = base64Url(JSON.stringify({ alg, typ: 'JWT', kid }));
  const body = base64Url(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  if (alg === 'none') {
    return `${signingInput}.`;
  }
  const sig = crypto.sign('RSA-SHA256', Buffer.from(signingInput, 'utf8'), privateKey);
  return `${signingInput}.${base64Url(sig)}`;
}

test('normalizeOrcidId and hasValidOrcidChecksum handle formats and ISO 7064 check digits', () => {
  assert.equal(normalizeOrcidId('0000-0002-1825-0097'), '0000-0002-1825-0097');
  assert.equal(normalizeOrcidId('https://orcid.org/0000-0002-1825-0097'), '0000-0002-1825-0097');
  assert.equal(normalizeOrcidId('https://sandbox.orcid.org/0000-0002-1825-0097?lang=en'), '0000-0002-1825-0097');
  assert.equal(normalizeOrcidId('000000021694233x'), '0000-0002-1694-233X');
  assert.equal(normalizeOrcidId('invalid-orcid'), null);

  assert.equal(hasValidOrcidChecksum('0000-0002-1825-0097'), true);
  assert.equal(hasValidOrcidChecksum('0000-0002-1694-233X'), true);
  assert.equal(hasValidOrcidChecksum('0000-0002-1825-0098'), false);
  assert.equal(orcidIdToUid('https://orcid.org/0000-0002-1825-0097'), 'orcid_0000000218250097');
});

test('resolvePublicBaseUrl parses proxy headers deterministically', () => {
  assert.equal(
    resolvePublicBaseUrl({
      appUrlEnv: 'MY_APP_URL',
      headers: {
        'x-forwarded-proto': 'https, http',
        'x-forwarded-host': 'scholarlens-analytics.vercel.app, internal-edge',
      },
      protocol: 'http',
    }),
    'https://scholarlens-analytics.vercel.app'
  );

  assert.equal(
    resolvePublicBaseUrl({
      appUrlEnv: 'https://custom.scholarlens.org/',
      headers: { host: 'localhost:3000' },
      protocol: 'http',
    }),
    'https://custom.scholarlens.org'
  );

  assert.equal(
    resolvePublicBaseUrl({
      headers: { host: 'localhost:3000' },
      protocol: 'http',
    }),
    'http://localhost:3000'
  );
});

test('cookie serialization and parsing round-trip cleanly', () => {
  const serialized = serializeCookie('scholarlens_session', 'abc.def+123', {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAgeSeconds: 3600,
  });
  assert.match(serialized, /HttpOnly/);
  assert.match(serialized, /SameSite=Lax/);
  assert.match(serialized, /Secure/);
  assert.match(serialized, /Max-Age=3600/);

  const parsed = parseCookies('foo=bar; scholarlens_session=abc.def%2B123');
  assert.equal(parsed.foo, 'bar');
  assert.equal(parsed.scholarlens_session, 'abc.def+123');
});

test('OAuth signed state & session tokens enforce HMAC integrity, CSRF match, and TTL', () => {
  const secret = 'test-hmac-secret-key';
  const now = 1_700_000_000_000;
  const { stateToken, payload } = createSignedOAuthState(
    {
      redirectUri: 'https://scholarlens.example/auth/orcid/callback',
      env: 'production',
      mode: 'popup',
      nowMs: now,
      ttlMs: 60_000,
    },
    secret
  );

  const verified = verifySignedOAuthState(stateToken, secret, {
    expectedCsrf: payload.csrf,
    nowMs: now + 10_000,
  });
  assert.ok(verified);
  assert.equal(verified?.nonce, payload.nonce);
  assert.equal(verified?.redirectUri, 'https://scholarlens.example/auth/orcid/callback');

  // Reject missing or wrong CSRF cookie
  assert.equal(
    verifySignedOAuthState(stateToken, secret, { expectedCsrf: undefined, nowMs: now + 10_000 }),
    null
  );
  assert.equal(
    verifySignedOAuthState(stateToken, secret, { expectedCsrf: 'wrong-csrf', nowMs: now + 10_000 }),
    null
  );

  // Reject tampered token
  const [rawBody, rawSig] = stateToken.split('.');
  const tampered = `${rawBody.slice(0, -1)}A.${rawSig}`;
  assert.equal(verifySignedOAuthState(tampered, secret, { expectedCsrf: payload.csrf, nowMs: now }), null);

  // Reject expired state
  assert.equal(
    verifySignedOAuthState(stateToken, secret, { expectedCsrf: payload.csrf, nowMs: now + 120_000 }),
    null
  );

  // Session token round-trip & expiry
  const sessionToken = createSignedSessionToken(
    { uid: 'orcid_0000000218250097', orcidId: '0000-0002-1825-0097', provider: 'orcid', nowMs: now, ttlMs: 30_000 },
    secret
  );
  const decodedSession = verifySignedSessionToken(sessionToken, secret, now + 5_000);
  assert.equal(decodedSession?.uid, 'orcid_0000000218250097');
  assert.equal(decodedSession?.orcidId, '0000-0002-1825-0097');
  assert.equal(verifySignedSessionToken(sessionToken, secret, now + 40_000), null);
});

test('verifyOrcidIdToken validates RS256 JWKS signatures and rejects invalid claims', async () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = publicKey.export({ format: 'jwk' }) as Record<string, unknown>;
  const jwksOverride = [{ ...jwk, kty: 'RSA', kid: 'orcid-test-key-1', use: 'sig', alg: 'RS256' }];

  const nowSec = 1_700_000_000;
  const validToken = createSignedRs256Jwt(
    {
      iss: 'https://orcid.org',
      sub: '0000-0002-1825-0097',
      aud: 'APP-CLIENT-123',
      nonce: 'nonce-xyz',
      name: 'Ada Lovelace',
      given_name: 'Ada',
      family_name: 'Lovelace',
      exp: nowSec + 600,
    },
    privateKey
  );

  const identity = await verifyOrcidIdToken({
    idToken: validToken,
    clientId: 'APP-CLIENT-123',
    expectedIssuer: 'https://orcid.org',
    expectedNonce: 'nonce-xyz',
    jwksUrl: 'https://orcid.org/oauth/jwks',
    jwksOverride,
    nowSeconds: nowSec,
  });

  assert.equal(identity.orcidId, '0000-0002-1825-0097');
  assert.equal(identity.name, 'Ada Lovelace');
  assert.equal(identity.verifiedVia, 'id_token');

  // Wrong nonce
  await assert.rejects(
    verifyOrcidIdToken({
      idToken: validToken,
      clientId: 'APP-CLIENT-123',
      expectedIssuer: 'https://orcid.org',
      expectedNonce: 'different-nonce',
      jwksUrl: 'https://orcid.org/oauth/jwks',
      jwksOverride,
      nowSeconds: nowSec,
    }),
    OrcidUnauthorizedError
  );

  // Wrong audience
  await assert.rejects(
    verifyOrcidIdToken({
      idToken: validToken,
      clientId: 'APP-OTHER',
      expectedIssuer: 'https://orcid.org',
      expectedNonce: 'nonce-xyz',
      jwksUrl: 'https://orcid.org/oauth/jwks',
      jwksOverride,
      nowSeconds: nowSec,
    }),
    OrcidUnauthorizedError
  );

  // Alg none downgrade attack rejected
  const unsignedToken = createSignedRs256Jwt(
    {
      iss: 'https://orcid.org',
      sub: '0000-0002-1825-0097',
      aud: 'APP-CLIENT-123',
      exp: nowSec + 600,
    },
    privateKey,
    'orcid-test-key-1',
    'none'
  );
  await assert.rejects(
    verifyOrcidIdToken({
      idToken: unsignedToken,
      clientId: 'APP-CLIENT-123',
      expectedIssuer: 'https://orcid.org',
      jwksUrl: 'https://orcid.org/oauth/jwks',
      jwksOverride,
      nowSeconds: nowSec,
    }),
    OrcidUnauthorizedError
  );
});

test('exchangeOrcidAuthorizationCode and verifyAndResolveOrcidIdentity handle full OIDC exchange', async () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = publicKey.export({ format: 'jwk' }) as Record<string, unknown>;
  const nowSec = Math.floor(Date.now() / 1000);
  const idToken = createSignedRs256Jwt(
    {
      iss: 'https://orcid.org',
      sub: '0000-0002-1825-0097',
      aud: 'APP-1234567890ABCDEF',
      nonce: 'nonce-1',
      exp: nowSec + 300,
    },
    privateKey
  );

  let seenTokenBody = '';
  const mockFetch: typeof fetch = async (input, init) => {
    const url = String(input);
    if (url === 'https://orcid.org/oauth/token') {
      seenTokenBody = String(init?.body || '');
      return new Response(
        JSON.stringify({
          access_token: 'access-tok-1',
          orcid: '0000-0002-1825-0097',
          name: 'Dr. Josiah Carberry',
          id_token: idToken,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (url === 'https://orcid.org/oauth/jwks') {
      return new Response(
        JSON.stringify({ keys: [{ ...jwk, kty: 'RSA', kid: 'orcid-test-key-1', use: 'sig', alg: 'RS256' }] }),
        { status: 200 }
      );
    }
    if (url === 'https://orcid.org/oauth/userinfo') {
      return new Response(
        JSON.stringify({ sub: '0000-0002-1825-0097', name: 'Josiah Carberry' }),
        { status: 200 }
      );
    }
    return new Response('Not found', { status: 404 });
  };

  const tokenData = await exchangeOrcidAuthorizationCode({
    code: 'auth-code-999',
    clientId: 'APP-1234567890ABCDEF',
    clientSecret: 'secret-123',
    redirectUri: 'https://scholarlens.example/auth/orcid/callback',
    env: 'production',
    fetchImpl: mockFetch,
  });

  assert.match(seenTokenBody, /code=auth-code-999/);
  assert.match(seenTokenBody, /redirect_uri=https%3A%2F%2Fscholarlens\.example%2Fauth%2Forcid%2Fcallback/);

  const verified = await verifyAndResolveOrcidIdentity({
    tokenData,
    clientId: 'APP-1234567890ABCDEF',
    env: 'production',
    expectedNonce: 'nonce-1',
    fetchImpl: mockFetch,
  });
  assert.equal(verified.orcidId, '0000-0002-1825-0097');
  assert.equal(verified.name, 'Josiah Carberry');
});

test('OrcidAccountStore enforces unique 1-to-1 ORCID-to-account binding in Firestore mock', async () => {
  const docDb = new Map<string, Record<string, unknown>>();
  const docBase = 'https://firestore.googleapis.com/v1/projects/p1/databases/d1/documents';

  const mockFetch: typeof fetch = async (input, init) => {
    const url = String(input);
    const method = (init?.method || 'GET').toUpperCase();

    if (url === `${docBase}:commit` && method === 'POST') {
      const payload = JSON.parse(String(init?.body || '{}')) as {
        writes: Array<{
          update: { name: string; fields: Record<string, any> };
          currentDocument?: { exists?: boolean };
        }>;
      };
      // Validate preconditions before applying any write
      for (const write of payload.writes) {
        const key = write.update.name.replace(/^projects\/p1\/databases\/d1\/documents\//, '');
        const exists = docDb.has(key);
        if (write.currentDocument?.exists === false && exists) {
          return new Response(JSON.stringify({ error: { status: 'ALREADY_EXISTS' } }), { status: 409 });
        }
      }
      for (const write of payload.writes) {
        const key = write.update.name.replace(/^projects\/p1\/databases\/d1\/documents\//, '');
        docDb.set(key, { fields: write.update.fields });
      }
      return new Response(JSON.stringify({ writeResults: [] }), { status: 200 });
    }

    const prefix = `${docBase}/`;
    if (url.startsWith(prefix)) {
      const key = decodeURIComponent(url.slice(prefix.length));
      if (method === 'GET') {
        const found = docDb.get(key);
        return found
          ? new Response(JSON.stringify(found), { status: 200 })
          : new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      }
      if (method === 'PATCH') {
        const body = JSON.parse(String(init?.body || '{}'));
        docDb.set(key, body);
        return new Response(JSON.stringify(body), { status: 200 });
      }
      if (method === 'DELETE') {
        docDb.delete(key);
        return new Response('{}', { status: 200 });
      }
    }
    return new Response('Bad request', { status: 400 });
  };

  const store = new OrcidAccountStore({
    firestoreDocBase: docBase,
    getBridgeToken: async () => 'mock-bridge-jwt',
    fetchImpl: mockFetch,
  });

  // 1. Register new researcher with ORCID
  const first = await store.authenticateOrRegisterOrcidUser({
    orcidId: '0000-0002-1825-0097',
    verifiedName: 'Josiah Carberry',
  });
  assert.equal(first.isNewAccount, true);
  assert.equal(first.user.uid, 'orcid_0000000218250097');
  assert.equal(first.user.orcidId, '0000-0002-1825-0097');
  assert.equal(first.user.provider, 'orcid');
  assert.equal(first.user.verified, true);
  assert.ok(docDb.has('orcidAccounts/0000-0002-1825-0097'));
  assert.ok(docDb.has('users/orcid_0000000218250097'));

  // Attach Scholar profile to account
  const updated = await store.updateUserProfile(first.user.uid, {
    scholarUrl: 'https://scholar.google.com/citations?user=JicYPdAAAAAJ&hl=en',
    scholarUserId: 'JicYPdAAAAAJ',
  });
  assert.equal(updated?.scholarUserId, 'JicYPdAAAAAJ');

  // 2. Returning login resolves to exact same account & keeps linked Scholar data
  const returning = await store.authenticateOrRegisterOrcidUser({
    orcidId: 'https://orcid.org/0000-0002-1825-0097',
    verifiedName: 'Josiah Carberry',
  });
  assert.equal(returning.isNewAccount, false);
  assert.equal(returning.user.uid, first.user.uid);
  assert.equal(returning.user.scholarUserId, 'JicYPdAAAAAJ');

  // 3. Unique constraint prevents associating the same ORCID iD with another account
  await assert.rejects(
    store.authenticateOrRegisterOrcidUser({
      orcidId: '0000-0002-1825-0097',
      verifiedName: 'Attacker Account',
      linkToUid: 'google_other_user_999',
    }),
    OrcidConflictError
  );

  // 4. Reverse direction: another UID already linked to ORCID A cannot also link ORCID B
  docDb.set('users/google_user_2', {
    fields: Object.fromEntries(
      Object.entries({
        uid: 'google_user_2',
        name: 'Researcher Two',
        emailOrId: 'two@example.edu',
        orcidId: '0000-0001-5109-3700',
        provider: 'google',
        verified: true,
      }).map(([k, v]) => [k, toFirestoreValue(v)])
    ),
  });
  await assert.rejects(
    store.authenticateOrRegisterOrcidUser({
      orcidId: '0000-0003-1415-9269',
      verifiedName: 'Researcher Two',
      linkToUid: 'google_user_2',
    }),
    OrcidConflictError
  );

  // 5. Deleting account frees the ORCID iD binding cleanly
  await store.deleteUserAccount(first.user.uid);
  assert.equal(docDb.has('orcidAccounts/0000-0002-1825-0097'), false);
  assert.equal(docDb.has('users/orcid_0000000218250097'), false);
});

test('validateOrcidClientId accepts APP-... Developer Client IDs and rejects personal ORCID iDs or placeholders', () => {
  const valid = validateOrcidClientId('  APP-A1B2C3D4E5F6G7H8  ');
  assert.equal(valid.valid, true);
  assert.equal(valid.clientId, 'APP-A1B2C3D4E5F6G7H8');

  const personalUrl = validateOrcidClientId('https://orcid.org/0009-0007-9332-9241');
  assert.equal(personalUrl.valid, false);
  assert.match(personalUrl.error || '', /personal ORCID iD/i);
  assert.match(personalUrl.error || '', /APP-/);

  const personalId = validateOrcidClientId('0009-0007-9332-9241');
  assert.equal(personalId.valid, false);
  assert.match(personalId.error || '', /personal ORCID iD/i);

  for (const invalid of ['', 'MY_ORCID_CLIENT_ID', 'APP-XXXXXXXXXXXXXXXX', 'not-an-app-id']) {
    assert.equal(validateOrcidClientId(invalid).valid, false);
  }
});

test('OrcidAccountStore distinguishes UNAVAILABLE (403) from NOT_FOUND (404) and allows fallback profile updates', async () => {
  const unavailableStore = new OrcidAccountStore({
    firestoreDocBase: 'https://firestore.googleapis.com/v1/projects/p1/databases/d1/documents',
    getBridgeToken: async () => 'mock-jwt',
    fetchImpl: async () => new Response('PERMISSION_DENIED', { status: 403 }),
  });

  const unavailLookup = await unavailableStore.getUserLookupResult('orcid_0000000218250097');
  assert.equal(unavailLookup.status, 'UNAVAILABLE');

  const fallbackUpdated = await unavailableStore.updateUserProfile(
    'orcid_0000000218250097',
    { name: 'Prof. Fallback' },
    {
      uid: 'orcid_0000000218250097',
      name: 'Fallback Name',
      emailOrId: '0000-0002-1825-0097',
      orcidId: '0000-0002-1825-0097',
      verified: true,
      provider: 'orcid',
    }
  );
  assert.equal(fallbackUpdated?.name, 'Prof. Fallback');

  const notFoundStore = new OrcidAccountStore({
    firestoreDocBase: 'https://firestore.googleapis.com/v1/projects/p1/databases/d1/documents',
    getBridgeToken: async () => 'mock-jwt',
    fetchImpl: async () => new Response('NOT_FOUND', { status: 404 }),
  });

  assert.equal((await notFoundStore.getUserLookupResult('orcid_deleted')).status, 'NOT_FOUND');
  assert.equal(
    await notFoundStore.updateUserProfile('orcid_deleted', { name: 'Should Fail' }, {
      uid: 'orcid_deleted',
      name: 'Deleted',
      emailOrId: '0000-0002-1825-0097',
      orcidId: '0000-0002-1825-0097',
      verified: true,
      provider: 'orcid',
    }),
    null
  );
});
