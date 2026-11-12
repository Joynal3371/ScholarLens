import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertCircle,
  Mail,
  KeyRound,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import {
  signInWithGoogleAccount,
  signInWithGoogleIdToken,
  getLocalUserProfileOverride,
  AUTHORIZED_BRIDGE_ORIGIN,
} from '../firebase';

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
  onClose: () => void;
  onAuthenticated: (user: AuthenticatedResearcher) => void;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  pendingActionLabel,
  defaultScholarUrl,
  onClose,
  onAuthenticated,
}) => {
  // Method selection: 'orcid' (default primary) or 'email'
  const [authMethod, setAuthMethod] = useState<'orcid' | 'email'>('orcid');

  // Scholar Profile Link required before Continue with ORCID
  const [scholarUrlInput, setScholarUrlInput] = useState('');
  const scholarUrlRef = useRef(scholarUrlInput);

  // Loading states
  const [isOrcidOAuthLoading, setIsOrcidOAuthLoading] = useState(false);
  const [isVerifyingClaim, setIsVerifyingClaim] = useState(false);

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

  // Keep scholarUrlRef in sync
  useEffect(() => {
    scholarUrlRef.current = scholarUrlInput;
  }, [scholarUrlInput]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset or pre-fill state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMessage(null);
      setIsGoogleLoading(false);
      setIsOrcidOAuthLoading(false);
      setIsVerifyingClaim(false);
      setAuthMethod('orcid');
      if (defaultScholarUrl && !scholarUrlInput) {
        setScholarUrlInput(defaultScholarUrl);
      }
    }
  }, [isOpen, defaultScholarUrl]);

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

      // 1. Handle official ORCID Authentication Success from Popup
      if (data.type === 'ORCID_AUTH_SUCCESS') {
        const returnedOrcid = String(data.orcidId || '').trim();
        setIsOrcidOAuthLoading(false);

        if (!returnedOrcid) {
          setError('Could not retrieve verified ORCID identity.');
          return;
        }

        setError(null);

        // Check if this ORCID has already claimed a profile in ScholarLens
        try {
          const resp = await fetch('/api/auth/orcid/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orcidId: returnedOrcid }),
          });
          const loginResult = await resp.json();

          if (loginResult.found && loginResult.user) {
            // Returning verified researcher: Instant Sign-In!
            onAuthenticated(loginResult.user);
            return;
          }

          // First-time researcher: verify and link immediately with the Scholar link provided above the button
          const cleanScholar = scholarUrlRef.current.trim();
          if (!cleanScholar) {
            setError('Please enter your Google Scholar profile link above before continuing with ORCID.');
            return;
          }

          setIsVerifyingClaim(true);
          const verifyResp = await fetch('/api/auth/orcid/verify-claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orcidId: returnedOrcid,
              scholarInput: cleanScholar,
            }),
          });
          const verifyData = await verifyResp.json();

          if (!verifyResp.ok || !verifyData.success || !verifyData.user) {
            throw new Error(
              verifyData.error || 'Authenticity verification failed between ORCID and Google Scholar.'
            );
          }

          // Verified and locked in 1 step with zero secondary windows!
          onAuthenticated(verifyData.user);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Authentication verification failed.');
        } finally {
          setIsVerifyingClaim(false);
        }
      } else if (data.type === 'ORCID_AUTH_ERROR') {
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

  // Open the official ORCID popup after validating the Google Scholar link
  const handleContinueWithOrcid = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanScholar = scholarUrlInput.trim();
    if (!cleanScholar) {
      setError('Please enter your Google Scholar profile link above before continuing with ORCID.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsOrcidOAuthLoading(true);

    try {
      const resp = await fetch('/api/auth/orcid/url');
      const data = await resp.json();
      const popupUrl = data.url;

      if (!popupUrl) {
        throw new Error('Could not retrieve ORCID authorization URL.');
      }

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        popupUrl,
        'orcid_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},noopener=no`
      );

      if (!popup || popup.closed) {
        setIsOrcidOAuthLoading(false);
        setError('Popup was blocked by your browser. Please allow popups for this site to sign in with ORCID.');
      } else {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setIsOrcidOAuthLoading(false);
          }
        }, 1000);
      }
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

  const isLoading = isOrcidOAuthLoading || isVerifyingClaim;

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
                : 'Sign in with your official academic ORCID account'}
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

        {/* ORCID SIGN IN WITH SCHOLAR LINK INPUT BOX ABOVE THE BUTTON */}
        {authMethod === 'orcid' && (
          <form onSubmit={handleContinueWithOrcid} className="space-y-3.5 pt-1">
            {/* 1. Scholar Profile Link Input Box (Directly above the button) */}
            <div>
              <label htmlFor="scholar-link-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Google Scholar Profile Link
              </label>
              <input
                id="scholar-link-input"
                type="text"
                required
                value={scholarUrlInput}
                onChange={(e) => {
                  setScholarUrlInput(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="https://scholar.google.com/citations?user=..."
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Required to verify profile ownership with ORCID.
              </span>
            </div>

            {/* 2. Official Continue with ORCID Button */}
            <button
              type="submit"
              disabled={isLoading}
              data-testid="continue-with-orcid-btn"
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-gradient-to-b from-[#fdfdfd] to-[#eef0f2] hover:from-[#ffffff] hover:to-[#e2e6ea] active:to-[#d8dde3] border border-[#cbd5e1] rounded-[5px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-[#0047bb]" />
                  <span className="text-sm font-bold text-[#0047bb]">
                    {isVerifyingClaim ? 'Verifying Profile...' : 'Connecting to ORCID...'}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-5 h-5 rounded-full bg-[#A6CE39] text-[#283800] flex items-center justify-center font-black text-[11px] leading-none shrink-0 shadow-2xs">
                    iD
                  </span>
                  <span className="text-sm font-bold text-[#0047bb] tracking-tight">
                    Continue with ORCID
                  </span>
                </>
              )}
            </button>
          </form>
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

        {/* Minimal Divider & Alternative Options */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500">
            {authMethod === 'orcid' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('email');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="hover:text-slate-800 hover:underline cursor-pointer"
                >
                  Sign in with Email
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="hover:text-slate-800 hover:underline inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Google</span>
                </button>
              </>
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
                ← Back to ORCID Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
