import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertCircle,
  Mail,
  KeyRound,
  CheckCircle2,
  RotateCcw,
  Link2,
} from 'lucide-react';
import {
  signInWithGoogleAccount,
  signInWithGoogleIdToken,
  getLocalUserProfileOverride,
  AUTHORIZED_BRIDGE_ORIGIN,
} from '../firebase';
import { parseStrictGoogleScholarProfileInput } from '../utils/scholarAnalytics';

export interface AuthenticatedResearcher {
  uid: string;
  name: string;
  emailOrId: string;
  photoURL?: string;
  scholarUrl?: string;
  scholarUserId?: string;
  orcidId?: string;
  verified?: boolean;
  provider: 'google' | 'orcid' | 'email';
}

interface AuthGateModalProps {
  isOpen: boolean;
  pendingActionLabel: string | null;
  defaultScholarUrl?: string;
  externalError?: string | null;
  onClose: () => void;
  onAuthenticated: (user: AuthenticatedResearcher) => void;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  pendingActionLabel,
  defaultScholarUrl,
  externalError,
  onClose,
  onAuthenticated,
}) => {
  // Method selection: 'orcid' (default primary) or 'email'
  const [authMethod, setAuthMethod] = useState<'orcid' | 'email'>('orcid');

  // Google Scholar input captured before ORCID redirect
  const [scholarInput, setScholarInput] = useState(defaultScholarUrl || '');

  // Loading states
  const [isOrcidOAuthLoading, setIsOrcidOAuthLoading] = useState(false);

  // Email OTP state
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [emailStep, setEmailStep] = useState<'enter_email' | 'enter_code'>('enter_email');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [receivedCodeHint, setReceivedCodeHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Common UI state
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const codeInputRef = useRef<HTMLInputElement | null>(null);
  const authCompletedRef = useRef(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      authCompletedRef.current = false;
      setError(externalError || null);
      setSuccessMessage(null);
      setIsGoogleLoading(false);
      setIsOrcidOAuthLoading(false);
      setAuthMethod('orcid');
      setScholarInput(defaultScholarUrl || '');
    }
  }, [isOpen, externalError, defaultScholarUrl]);

  // Focus code input when entering OTP step
  useEffect(() => {
    if (emailStep === 'enter_code') {
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 150);
    }
  }, [emailStep]);

  // Handle postMessage events from ORCID OAuth & Google Bridge popups
  useEffect(() => {
    const handleAuthMessage = async (event: MessageEvent) => {
      const allowedOrigins = [
        AUTHORIZED_BRIDGE_ORIGIN,
        'https://scholarlens-analytics.vercel.app',
        'https://gen-lang-client-0156039264.firebaseapp.com',
        window.location.origin,
      ];
      const isAllowed =
        allowedOrigins.includes(event.origin) ||
        event.origin.endsWith('.run.app') ||
        event.origin.includes('localhost') ||
        event.origin.includes('orcid.org');

      if (!isAllowed) return;
      const data = event.data;
      if (!data) return;

      // 1. Handle official ORCID OAuth Authentication Success from Popup
      if (data.type === 'ORCID_AUTH_SUCCESS') {
        if (event.origin !== window.location.origin) {
          return;
        }
        setIsOrcidOAuthLoading(false);
        setError(null);

        try {
          let authenticatedUser: AuthenticatedResearcher | null =
            data.user && typeof data.user === 'object' && data.user.uid
              ? (data.user as AuthenticatedResearcher)
              : null;

          if (!authenticatedUser) {
            const sessionResp = await fetch('/api/auth/session', {
              credentials: 'same-origin',
            });
            const sessionData = await sessionResp.json();
            if (sessionResp.ok && sessionData.authenticated && sessionData.user) {
              authenticatedUser = sessionData.user as AuthenticatedResearcher;
            }
          }

          if (!authenticatedUser) {
            setError('Could not retrieve verified ORCID session.');
            return;
          }

          if (!authCompletedRef.current) {
            authCompletedRef.current = true;
            onAuthenticated(authenticatedUser);
          }
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Could not complete ORCID sign-in.');
        }
      } else if (data.type === 'ORCID_AUTH_ERROR') {
        if (event.origin !== window.location.origin) {
          return;
        }
        setIsOrcidOAuthLoading(false);
        setError(data.error || 'ORCID authentication was cancelled.');
      }

      // 2. Handle Google Bridge Message
      if (data.type === 'GOOGLE_BRIDGE_AUTH_SUCCESS') {
        setIsGoogleLoading(true);
        setError(null);
        try {
          if (data.idToken) {
            const { user, profile } = await signInWithGoogleIdToken(data.idToken);
            onAuthenticated({
              uid: user.uid,
              name: profile.displayName,
              emailOrId: user.email || user.uid,
              photoURL: profile.photoURL,
              scholarUrl: profile.scholarUrl || '',
              provider: 'google',
            });
          } else if (data.uid) {
            const localOverride = getLocalUserProfileOverride(data.uid);
            onAuthenticated({
              uid: data.uid,
              name: localOverride?.displayName || data.name || 'Researcher',
              emailOrId: data.email || data.uid,
              photoURL: localOverride?.photoURL || data.photoURL || '',
              scholarUrl: localOverride?.scholarUrl || '',
              provider: 'google',
            });
          }
        } catch {
          if (data.uid) {
            const localOverride = getLocalUserProfileOverride(data.uid);
            onAuthenticated({
              uid: data.uid,
              name: localOverride?.displayName || data.name || 'Researcher',
              emailOrId: data.email || data.uid,
              photoURL: localOverride?.photoURL || data.photoURL || '',
              scholarUrl: localOverride?.scholarUrl || '',
              provider: 'google',
            });
          }
        } finally {
          setIsGoogleLoading(false);
        }
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [onAuthenticated]);

  if (!isOpen) return null;

  // Validate Google Scholar link/ID first, then launch official ORCID OAuth 2.0 flow
  const handleContinueWithOrcid = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    authCompletedRef.current = false;
    setError(null);
    setSuccessMessage(null);

    const trimmedScholar = scholarInput.trim();
    const parsedScholar = parseStrictGoogleScholarProfileInput(trimmedScholar);
    if (!parsedScholar.valid || !parsedScholar.userId) {
      setError(
        parsedScholar.error ||
          'Please enter your Google Scholar profile link (e.g. https://scholar.google.com/citations?user=...) or Scholar ID before continuing to ORCID.'
      );
      return;
    }

    setIsOrcidOAuthLoading(true);

    try {
      const encodedScholar = encodeURIComponent(trimmedScholar);
      const resp = await fetch(`/api/auth/orcid/url?mode=popup&scholarInput=${encodedScholar}`, {
        credentials: 'same-origin',
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Could not validate Google Scholar profile before ORCID redirect.');
      }
      const isLocalHost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      if (!data.configured && !isLocalHost) {
        throw new Error(
          data.configError ||
            'ORCID sign-in is not configured yet on the server. Set ORCID_CLIENT_ID (starting with APP-...) and ORCID_CLIENT_SECRET in your deployment environment variables.'
        );
      }
      const popupUrl = data.url;

      if (!popupUrl) {
        throw new Error('Could not retrieve ORCID authorization URL.');
      }

      const width = 560;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        popupUrl,
        'orcid_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},noopener=no`
      );

      if (!popup || popup.closed) {
        if (data.configured) {
          // Seamless same-window OAuth redirect fallback when popups are blocked
          window.location.assign(`/auth/orcid/authorize?mode=redirect&scholarInput=${encodedScholar}`);
          return;
        }
        setIsOrcidOAuthLoading(false);
        setError('Popup was blocked by your browser. Please allow popups for this site to configure ORCID.');
        return;
      }

      const checkClosed = setInterval(async () => {
        if (!popup.closed) return;
        clearInterval(checkClosed);

        // Give window.opener.postMessage a moment to settle, then check server session cookie as fallback
        await new Promise((r) => setTimeout(r, 250));
        if (authCompletedRef.current) {
          setIsOrcidOAuthLoading(false);
          return;
        }

        try {
          const sessionResp = await fetch('/api/auth/session', {
            credentials: 'same-origin',
          });
          const sessionData = await sessionResp.json();
          if (sessionResp.ok && sessionData.authenticated && sessionData.user && !authCompletedRef.current) {
            authCompletedRef.current = true;
            onAuthenticated(sessionData.user as AuthenticatedResearcher);
          }
        } catch {
          // Ignore network probe error on manual popup close
        } finally {
          setIsOrcidOAuthLoading(false);
        }
      }, 450);
    } catch (err: unknown) {
      setIsOrcidOAuthLoading(false);
      setError(err instanceof Error ? err.message : 'Could not connect to ORCID service.');
    }
  };

  // Google sign in via direct SDK
  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const { user, profile } = await signInWithGoogleAccount();
      onAuthenticated({
        uid: user.uid,
        name: profile.displayName,
        emailOrId: user.email || user.uid,
        photoURL: profile.photoURL,
        scholarUrl: profile.scholarUrl || '',
        provider: 'google',
      });
    } catch (err: unknown) {
      const codeStr = String((err as { code?: string })?.code || '');
      if (codeStr.includes('popup-blocked') || codeStr.includes('cancelled-popup-request')) {
        setAuthMethod('email');
        setError('Popup was blocked. Please sign in with your email verification code below.');
      } else {
        setError('Google sign-in was unavailable. Please sign in with ORCID or Email.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Email verification code handlers
  const handleSendVerificationCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSendingCode(true);

    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      setEmailStep('enter_code');
      setResendCooldown(45);
      setSuccessMessage(`A 6-digit verification code was sent to ${cleanEmail}`);
      if (data.code) {
        setReceivedCodeHint(data.code);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send verification code.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = code.trim().replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError(null);
    setIsVerifyingCode(true);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: cleanCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.user) {
        throw new Error(data.error || 'Invalid or expired verification code.');
      }

      onAuthenticated(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const isLoading = isOrcidOAuthLoading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 id="auth-modal-title" className="text-base font-semibold text-slate-900">
              Sign In
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {pendingActionLabel
                ? `Sign in to ${pendingActionLabel}`
                : 'Sign in or create an account with your ORCID iD'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ORCID OAUTH SIGN IN / REGISTER */}
        {authMethod === 'orcid' && (
          <div className="space-y-3 pt-1">
            <form onSubmit={handleContinueWithOrcid} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="orcid-scholar-input"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Google Scholar Profile Link or Scholar ID
                  </label>
                  <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    Step 1 of 2
                  </span>
                </div>
                <div className="relative">
                  <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="orcid-scholar-input"
                    data-testid="orcid-scholar-input"
                    type="text"
                    required
                    value={scholarInput}
                    onChange={(e) => {
                      setScholarInput(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="https://scholar.google.com/citations?user=..."
                    className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#0047bb]/25 focus:border-[#0047bb]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                  Press Continue to verify with ORCID. Your account is created only after your ORCID profile matches this Google Scholar profile.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                data-testid="continue-with-orcid-btn"
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-gradient-to-b from-[#fdfdfd] to-[#eef0f2] hover:from-[#ffffff] hover:to-[#e2e6ea] active:to-[#d8dde3] border border-[#cbd5e1] rounded-[5px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-[#0047bb]" />
                    <span className="text-sm font-bold text-[#0047bb]">
                      Verifying with ORCID...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-5 h-5 rounded-full bg-[#A6CE39] text-[#283800] flex items-center justify-center font-black text-[11px] leading-none shrink-0 shadow-2xs">
                      iD
                    </span>
                    <span className="text-sm font-bold text-[#0047bb] tracking-tight">
                      Continue to ORCID Verification
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="relative flex py-0.5 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-2 text-[10px] uppercase tracking-wider text-slate-400">
                or
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              data-testid="continue-with-google-btn"
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-[5px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm font-medium text-slate-700">
                {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </span>
            </button>
          </div>
        )}

        {/* EMAIL CODE FORM (SECONDARY) */}
        {authMethod === 'email' && (
          <div className="space-y-3">
            {emailStep === 'enter_email' ? (
              <form onSubmit={handleSendVerificationCode} className="space-y-3">
                <div>
                  <label htmlFor="researcher-email-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="researcher-email-input"
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="e.g. researcher@university.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingCode || !email.trim()}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSendingCode ? <span>Sending Code...</span> : <span>Send Verification Code</span>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <label htmlFor="verification-code-input" className="font-semibold text-slate-700">
                      Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailStep('enter_email');
                        setCode('');
                        setError(null);
                      }}
                      className="text-blue-600 hover:underline text-[11px] cursor-pointer"
                    >
                      Change email
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={codeInputRef}
                      id="verification-code-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setCode(val);
                        if (error) setError(null);
                        if (val.length === 6) {
                          setTimeout(() => void handleVerifyCode(), 50);
                        }
                      }}
                      placeholder="••••••"
                      className="w-full pl-9 pr-3 py-2 text-center text-base font-mono font-bold tracking-widest bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>
                  {receivedCodeHint && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between text-[11px] text-blue-900">
                      <span>Code: <strong className="font-mono">{receivedCodeHint}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setCode(receivedCodeHint);
                          if (error) setError(null);
                        }}
                        className="text-blue-700 font-semibold hover:underline cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingCode || code.length !== 6}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isVerifyingCode ? <span>Verifying...</span> : <span>Verify &amp; Sign In</span>}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Status / Error Messages */}
        {successMessage && !error && (
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Minimal Divider & Email Option */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-center text-xs text-slate-500">
            {authMethod === 'orcid' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="hover:text-slate-800 hover:underline cursor-pointer"
              >
                Use Email verification code instead
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('orcid');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="hover:text-slate-800 hover:underline cursor-pointer"
              >
                ← Back to ORCID &amp; Google Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
