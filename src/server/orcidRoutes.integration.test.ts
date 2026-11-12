import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import type http from 'http';

function base64Url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createRs256Jwt(
  payload: Record<string, unknown>,
  privateKey: crypto.KeyObject,
  kid = 'orcid-int-key-1'
): string {
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid }));
  const body = base64Url(JSON.stringify(payload));
  const sig = crypto.sign('RSA-SHA256', Buffer.from(`${header}.${body}`, 'utf8'), privateKey);
  return `${header}.${body}.${base64Url(sig)}`;
}

function extractCookieValue(setCookieHeaders: string[], name: string): string | null {
  for (const header of setCookieHeaders) {
    const firstPart = header.split(';')[0] || '';
    const eqIdx = firstPart.indexOf('=');
    if (eqIdx > 0 && firstPart.slice(0, eqIdx).trim() === name) {
      return firstPart.slice(eqIdx + 1).trim();
    }
  }
  return null;
}

test('Express ORCID OAuth 2.0 routes handle full authorization, callback, session, profile, and delete lifecycle', async () => {
  process.env.SKIP_SERVER_LISTEN = '1';
  process.env.READ_ONLY_FS = 'true';
  process.env.APP_URL = 'https://scholarlens.test';
  process.env.ORCID_CLIENT_ID = 'APP-1234567890ABCDEF';
  process.env.ORCID_CLIENT_SECRET = 'secret-test-integration';
  process.env.ORCID_ENVIRONMENT = 'production';
  process.env.SESSION_SECRET = 'integration-test-session-secret';

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = publicKey.export({ format: 'jwk' }) as Record<string, unknown>;
  const firestoreDocs = new Map<string, Record<string, unknown>>();
  let expectedNonce = '';
  let simulateFirestoreForbidden = false;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    // Allow local loopback HTTP calls to our ephemeral Express test server
    if (url.startsWith('http://127.0.0.1:')) {
      return originalFetch(input, init);
    }

    if (url === 'https://orcid.org/oauth/token') {
      const params = new URLSearchParams(String(init?.body || ''));
      assert.equal(params.get('redirect_uri'), 'https://scholarlens.test/auth/orcid/callback');
      assert.equal(params.get('client_id'), 'APP-1234567890ABCDEF');
      assert.equal(params.get('client_secret'), 'secret-test-integration');

      const idToken = createRs256Jwt(
        {
          iss: 'https://orcid.org',
          sub: '0000-0002-1825-0097',
          aud: 'APP-1234567890ABCDEF',
          nonce: expectedNonce,
          name: 'Josiah Carberry',
          exp: Math.floor(Date.now() / 1000) + 600,
        },
        privateKey
      );
      return new Response(
        JSON.stringify({
          access_token: 'orcid-access-token-1',
          orcid: '0000-0002-1825-0097',
          name: 'Josiah Carberry',
          id_token: idToken,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (url === 'https://orcid.org/oauth/jwks') {
      return new Response(
        JSON.stringify({
          keys: [{ ...jwk, kty: 'RSA', kid: 'orcid-int-key-1', use: 'sig', alg: 'RS256' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (url === 'https://orcid.org/oauth/userinfo') {
      return new Response(
        JSON.stringify({ sub: '0000-0002-1825-0097', name: 'Josiah Carberry' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (url.includes('identitytoolkit.googleapis.com/v1/accounts:signInWithPassword')) {
      return new Response(JSON.stringify({ idToken: 'mock-bridge-jwt' }), { status: 200 });
    }

    if (url.startsWith('https://firestore.googleapis.com/v1/projects/')) {
      if (simulateFirestoreForbidden) {
        return new Response(JSON.stringify({ error: { status: 'PERMISSION_DENIED' } }), { status: 403 });
      }
      const method = (init?.method || 'GET').toUpperCase();
      if (url.endsWith(':commit') && method === 'POST') {
        const body = JSON.parse(String(init?.body || '{}')) as {
          writes: Array<{
            update: { name: string; fields: Record<string, unknown> };
            currentDocument?: { exists?: boolean };
          }>;
        };
        for (const w of body.writes) {
          const docPath = w.update.name.replace(/^projects\/[^/]+\/databases\/[^/]+\/documents\//, '');
          if (w.currentDocument?.exists === false && firestoreDocs.has(docPath)) {
            return new Response(JSON.stringify({ error: { status: 'ALREADY_EXISTS' } }), { status: 409 });
          }
        }
        for (const w of body.writes) {
          const docPath = w.update.name.replace(/^projects\/[^/]+\/databases\/[^/]+\/documents\//, '');
          firestoreDocs.set(docPath, { fields: w.update.fields });
        }
        return new Response(JSON.stringify({ writeResults: [] }), { status: 200 });
      }

      const marker = '/documents/';
      const idx = url.indexOf(marker);
      const docPath = decodeURIComponent(url.slice(idx + marker.length));
      if (method === 'GET') {
        const doc = firestoreDocs.get(docPath);
        return doc
          ? new Response(JSON.stringify(doc), { status: 200 })
          : new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      }
      if (method === 'PATCH') {
        const body = JSON.parse(String(init?.body || '{}'));
        firestoreDocs.set(docPath, body);
        return new Response(JSON.stringify(body), { status: 200 });
      }
      if (method === 'DELETE') {
        firestoreDocs.delete(docPath);
        return new Response('{}', { status: 200 });
      }
    }

    return originalFetch(input, init);
  }) as typeof fetch;

  const { app } = await import('../../server');
  const server: http.Server = await new Promise((resolve) => {
    const srv = app.listen(0, '127.0.0.1', () => resolve(srv));
  });

  try {
    const addr = server.address() as { port: number };
    const base = `http://127.0.0.1:${addr.port}`;

    // 0. Guardrail: invalid personal ORCID URL in ORCID_CLIENT_ID is never forwarded to orcid.org
    process.env.ORCID_CLIENT_ID = 'https://orcid.org/0009-0007-9332-9241';
    const invalidCfgResp = await originalFetch(`${base}/api/auth/orcid/url?mode=popup`);
    assert.equal(invalidCfgResp.status, 200);
    const invalidCfgJson = (await invalidCfgResp.json()) as {
      url: string;
      configured: boolean;
      configError?: string;
    };
    assert.equal(invalidCfgJson.configured, false);
    assert.ok(!invalidCfgJson.url.startsWith('https://orcid.org/oauth/authorize'));
    assert.match(invalidCfgJson.configError || '', /personal ORCID iD/i);

    delete process.env.ORCID_CLIENT_ID;
    delete process.env.ORCID_CLIENT_SECRET;
    const badSaveResp = await originalFetch(`${base}/api/auth/orcid/save-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'https://orcid.org/0009-0007-9332-9241',
        clientSecret: 'secret-test-integration',
        environment: 'production',
      }),
    });
    assert.equal(badSaveResp.status, 400);
    const badSaveJson = (await badSaveResp.json()) as { error?: string };
    assert.match(badSaveJson.error || '', /APP-/);

    process.env.ORCID_CLIENT_ID = 'APP-1234567890ABCDEF';
    process.env.ORCID_CLIENT_SECRET = 'secret-test-integration';

    // 1. Initiate OAuth URL request
    const urlResp = await originalFetch(`${base}/api/auth/orcid/url?mode=popup`);
    assert.equal(urlResp.status, 200);
    const urlJson = (await urlResp.json()) as {
      url: string;
      configured: boolean;
      redirectUri: string;
    };
    assert.equal(urlJson.configured, true);
    assert.equal(urlJson.redirectUri, 'https://scholarlens.test/auth/orcid/callback');

    const authUrlObj = new URL(urlJson.url);
    assert.equal(authUrlObj.origin, 'https://orcid.org');
    assert.equal(authUrlObj.pathname, '/oauth/authorize');
    assert.equal(authUrlObj.searchParams.get('scope'), 'openid');
    const stateParam = authUrlObj.searchParams.get('state') || '';
    expectedNonce = authUrlObj.searchParams.get('nonce') || '';
    assert.ok(stateParam);
    assert.ok(expectedNonce);

    const urlCookies = urlResp.headers.getSetCookie();
    const stateCookieVal = extractCookieValue(urlCookies, 'scholarlens_orcid_state');
    assert.ok(stateCookieVal);

    // 2. Callback rejects missing CSRF cookie
    const missingCookieCb = await originalFetch(
      `${base}/auth/orcid/callback?code=c1&state=${encodeURIComponent(stateParam)}`
    );
    assert.equal(missingCookieCb.status, 400);

    // 3. Callback rejects forged state
    const badStateCb = await originalFetch(
      `${base}/auth/orcid/callback?code=c1&state=forged.state`,
      { headers: { Cookie: `scholarlens_orcid_state=${stateCookieVal}` } }
    );
    assert.equal(badStateCb.status, 400);

    // 4. Happy-path OAuth callback creates user, enforces unique index, sets HttpOnly session cookie
    const okCb = await originalFetch(
      `${base}/auth/orcid/callback?code=valid-code-1&state=${encodeURIComponent(stateParam)}`,
      { headers: { Cookie: `scholarlens_orcid_state=${stateCookieVal}` } }
    );
    assert.equal(okCb.status, 200);
    const cbHtml = await okCb.text();
    assert.match(cbHtml, /ORCID_AUTH_SUCCESS/);
    assert.match(cbHtml, /window\.location\.origin/);
    assert.ok(!cbHtml.includes("postMessage(payload, '*')"));

    const cbCookies = okCb.headers.getSetCookie();
    const sessionCookieVal = extractCookieValue(cbCookies, 'scholarlens_session');
    assert.ok(sessionCookieVal);
    assert.ok(firestoreDocs.has('orcidAccounts/0000-0002-1825-0097'));
    assert.ok(firestoreDocs.has('users/orcid_0000000218250097'));

    // 5. Session check returns authenticated researcher without cookie vs with cookie
    const unauthSession = await originalFetch(`${base}/api/auth/session`).then((r) => r.json());
    assert.equal(unauthSession.authenticated, false);

    const authSession = await originalFetch(`${base}/api/auth/session`, {
      headers: { Cookie: `scholarlens_session=${sessionCookieVal}` },
    }).then((r) => r.json());
    assert.equal(authSession.authenticated, true);
    assert.equal(authSession.user.uid, 'orcid_0000000218250097');
    assert.equal(authSession.user.orcidId, '0000-0002-1825-0097');
    assert.equal(authSession.user.name, 'Josiah Carberry');
    assert.equal(authSession.user.provider, 'orcid');

    // 6. Legacy spoof endpoint is permanently disabled
    const spoofResp = await originalFetch(`${base}/api/auth/orcid/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orcidId: '0000-0002-1825-0097' }),
    });
    assert.equal(spoofResp.status, 410);

    // 7. Profile update requires valid session and saves linked Google Scholar profile
    const unauthProfileResp = await originalFetch(`${base}/api/auth/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacker' }),
    });
    assert.equal(unauthProfileResp.status, 401);

    const updateProfileResp = await originalFetch(`${base}/api/auth/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `scholarlens_session=${sessionCookieVal}`,
      },
      body: JSON.stringify({
        name: 'Prof. Carberry',
        scholarUrl: 'https://scholar.google.com/citations?user=JicYPdAAAAAJ&hl=en',
      }),
    });
    assert.equal(updateProfileResp.status, 200);
    const updatedJson = (await updateProfileResp.json()) as {
      success: boolean;
      user: { name: string; scholarUserId: string };
    };
    assert.equal(updatedJson.success, true);
    assert.equal(updatedJson.user.name, 'Prof. Carberry');
    assert.equal(updatedJson.user.scholarUserId, 'JicYPdAAAAAJ');

    // 8. Redirect mode OAuth flow (/auth/orcid/authorize -> /auth/orcid/callback 302) logs back into same account
    const authRedirectResp = await originalFetch(`${base}/auth/orcid/authorize?mode=redirect`, {
      redirect: 'manual',
    });
    assert.equal(authRedirectResp.status, 302);
    const redirectTarget = new URL(authRedirectResp.headers.get('location') || '');
    const stateParam2 = redirectTarget.searchParams.get('state') || '';
    expectedNonce = redirectTarget.searchParams.get('nonce') || '';
    const stateCookie2 = extractCookieValue(
      authRedirectResp.headers.getSetCookie(),
      'scholarlens_orcid_state'
    );
    assert.ok(stateCookie2);

    const cbRedirect = await originalFetch(
      `${base}/auth/orcid/callback?code=valid-code-2&state=${encodeURIComponent(stateParam2)}`,
      {
        redirect: 'manual',
        headers: { Cookie: `scholarlens_orcid_state=${stateCookie2}` },
      }
    );
    assert.equal(cbRedirect.status, 302);
    assert.equal(cbRedirect.headers.get('location'), '/?orcid_auth=success');
    const sessionCookie2 = extractCookieValue(cbRedirect.headers.getSetCookie(), 'scholarlens_session');
    assert.ok(sessionCookie2);

    const returningSession = await originalFetch(`${base}/api/auth/session`, {
      headers: { Cookie: `scholarlens_session=${sessionCookie2}` },
    }).then((r) => r.json());
    assert.equal(returningSession.user.uid, 'orcid_0000000218250097');
    assert.equal(returningSession.user.scholarUserId, 'JicYPdAAAAAJ');

    // 9. Logout clears cookie, and Account Deletion removes DB records cleanly
    const logoutResp = await originalFetch(`${base}/api/auth/logout`, { method: 'POST' });
    assert.equal(logoutResp.status, 200);
    assert.match(logoutResp.headers.getSetCookie().join(';'), /Max-Age=0/);

    const delResp = await originalFetch(`${base}/api/auth/account`, {
      method: 'DELETE',
      headers: { Cookie: `scholarlens_session=${sessionCookie2}` },
    });
    assert.equal(delResp.status, 200);
    assert.equal(firestoreDocs.has('orcidAccounts/0000-0002-1825-0097'), false);
    assert.equal(firestoreDocs.has('users/orcid_0000000218250097'), false);

    // 10. Cold-lambda resilience: valid HMAC cookie stays authenticated if Firestore returns 403,
    //     but rejects deleted/missing accounts cleanly when Firestore returns 404
    const { createSignedSessionToken } = await import('./orcidAuth');
    const coldToken = createSignedSessionToken(
      {
        uid: 'orcid_0000000151093700',
        orcidId: '0000-0001-5109-3700',
        name: 'Cold Lambda Researcher',
        provider: 'orcid',
      },
      process.env.SESSION_SECRET!
    );
    simulateFirestoreForbidden = true;
    const coldOkSession = await originalFetch(`${base}/api/auth/session`, {
      headers: { Cookie: `scholarlens_session=${coldToken}` },
    }).then((r) => r.json());
    assert.equal(coldOkSession.authenticated, true);
    assert.equal(coldOkSession.user.name, 'Cold Lambda Researcher');
    assert.equal(coldOkSession.user.orcidId, '0000-0001-5109-3700');

    simulateFirestoreForbidden = false;
    const deletedSession = await originalFetch(`${base}/api/auth/session`, {
      headers: { Cookie: `scholarlens_session=${coldToken}` },
    }).then((r) => r.json());
    assert.equal(deletedSession.authenticated, false);
  } finally {
    globalThis.fetch = originalFetch;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
