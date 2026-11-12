import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertCircle,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  BadgeCheck,
  Lock,
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
  onClose: () => void;
  onAuthenticated: (user: AuthenticatedResearcher) => void;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  pendingActionLabel,
  onClose,
  onAuthenticated,
}) => {
  // Method selection: 'orcid' (authoritative academic identity), 'email' (OTP), or 'google'
  const [activeTab, setActiveTab] = useState<'orcid' | 'email' | 'google'>('orcid');

  // ORCID Verified Researcher state
  const [orcidMode, setOrcidMode] = useState<'verify' | 'login'>('verify');
  const [scholarUrlInput, setScholarUrlInput] = useState('');
  const [orcidIdInput, setOrcidIdInput] = useState('');
  const [isOrcidVerifying, setIsOrcidVerifying] = useState(false);
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
  const [popupBlocked, setPopupBlocked] = useState(false);
  const bridgePopupRef = useRef<Window | null>(null);
  const codeInputRef = useRef<HTMLInputElement | null>(null);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset error and loading state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMessage(null);
      setIsGoogleLoading(false);
      setIsOrcidVerifying(false);
      setPopupBlocked(false);
    }
  }, [isOpen]);

  // Focus code input when transitioning to enter_code
  useEffect(() => {
    if (emailStep === 'enter_code') {
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 150);
    }
  }, [emailStep]);

  // Listen for ORCID and Google Auth postMessage events
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

      // 1. Handle ORCID Auth Success
      if (data.type === 'ORCID_AUTH_SUCCESS') {
        const returnedOrcid = String(data.orcidId || '').trim();
        if (returnedOrcid) {
          setOrcidIdInput(returnedOrcid);
          setSuccessMessage(`ORCID connected (${returnedOrcid}). Authenticating...`);
          if (orcidMode === 'login') {
            try {
              const resp = await fetch('/api/auth/orcid/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orcidId: returnedOrcid }),
              });
              const loginResult = await resp.json();
              if (loginResult.found && loginResult.user) {
                onAuthenticated(loginResult.user);
                return;
              }
              setOrcidMode('verify');
              setError(
                'First-time setup: Enter your Google Scholar profile link below to verify and lock your profile.'
              );
            } catch {
              setError('Failed to log in with ORCID.');
            }
          }
        }
      } else if (data.type === 'ORCID_AUTH_ERROR') {
        setError(data.error || 'ORCID authentication was cancelled.');
      }

      // 2. Handle Google Bridge Message
      if (data.type === 'GOOGLE_BRIDGE_AUTH_SUCCESS') {
        setIsGoogleLoading(true);
        setError(null);
        setPopupBlocked(false);
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
  }, [onAuthenticated, orcidMode]);

  if (!isOpen) return null;

  // Request 6-digit verification code to email
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
      setError(
        err instanceof Error
          ? err.message
          : 'Could not send verification code. Please check your connection.'
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  // Verify the 6-digit code and sign in
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
      setError(
        err instanceof Error
          ? err.message
          : 'Verification failed. Please check the code and try again.'
      );
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const openAuthorizedGoogleBridgePopup = () => {
    setError(null);
    setPopupBlocked(false);
    const width = 500;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const bridgeBase =
      typeof window !== 'undefined' &&
      (window.location.origin.includes('vercel.app') ||
        window.location.origin.includes('localhost') ||
        window.location.origin.includes('firebaseapp.com'))
        ? window.location.origin
        : AUTHORIZED_BRIDGE_ORIGIN;

    const popup = window.open(
      `${bridgeBase}/?googleAuthBridge=1`,
      'ScholarLensGoogleAuth',
      `width=${width},height=${height},left=${left},top=${top},noopener=no`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setError('Popup was blocked by your browser. Please use the Email Verification Code option below.');
      setActiveTab('email');
      setIsGoogleLoading(false);
      return;
    }
    bridgePopupRef.current = popup;

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setIsGoogleLoading(false);
      }
    }, 1000);
  };

  const handleOrcidVerifyAndClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanScholar = scholarUrlInput.trim();
    const cleanOrcid = orcidIdInput
      .trim()
      .replace(/^https?:\/\/orcid\.org\//i, '')
      .trim();

    if (!cleanScholar) {
      setError('Please enter your Google Scholar profile link or User ID.');
      return;
    }
    if (!cleanOrcid || !/^\d{4}-\d{4}-\d{4}-[\dX]{4}$/.test(cleanOrcid)) {
      setError(
        'Please enter a valid 16-character ORCID iD (e.g. 0000-0002-1825-0097).'
      );
      return;
    }

    setIsOrcidVerifying(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const resp = await fetch('/api/auth/orcid/verify-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scholarInput: cleanScholar,
          orcidId: cleanOrcid,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Authenticity verification failed.');
      }

      setSuccessMessage(
        data.message ||
          'Profile successfully verified and locked to your ORCID account!'
      );
      setTimeout(() => {
        onAuthenticated(data.user);
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setIsOrcidVerifying(false);
    }
  };

  const handleOrcidLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOrcid = orcidIdInput
      .trim()
      .replace(/^https?:\/\/orcid\.org\//i, '')
      .trim();

    if (!cleanOrcid || !/^\d{4}-\d{4}-\d{4}-[\dX]{4}$/.test(cleanOrcid)) {
      setError(
        'Please enter your 16-character ORCID iD (e.g. 0000-0002-1825-0097).'
      );
      return;
    }

    setIsOrcidVerifying(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const resp = await fetch('/api/auth/orcid/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orcidId: cleanOrcid }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to sign in with ORCID.');
      }

      if (data.found && data.user) {
        setSuccessMessage('Welcome back! Loading your verified profile...');
        setTimeout(() => {
          onAuthenticated(data.user);
        }, 500);
      } else {
        setOrcidMode('verify');
        setError(
          data.message ||
            'No account linked yet. Please enter your Google Scholar profile link to complete verification.'
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setIsOrcidVerifying(false);
    }
  };

  const handleConnectWithOrcidPopup = async () => {
    setError(null);
    setIsOrcidOAuthLoading(true);

    try {
      const resp = await fetch('/api/auth/orcid/url');
      const data = await resp.json();
      if (data.configured && data.url) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(
          data.url,
          'orcid_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},noopener=no`
        );
        if (!popup || popup.closed) {
          setError(
            'Popup was blocked. Please enter your 16-character ORCID iD directly below.'
          );
        }
      } else {
        setSuccessMessage(
          'Official ORCID registry direct check active. Enter your 16-digit ORCID iD below.'
        );
      }
    } catch {
      setError(
        'Could not initialize ORCID popup. Please enter your 16-character ORCID iD directly.'
      );
    } finally {
      setIsOrcidOAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setPopupBlocked(false);
    setIsGoogleLoading(true);

    const safetyTimeout = setTimeout(() => {
      setIsGoogleLoading(false);
    }, 12000);

    try {
      const { user, profile } = await signInWithGoogleAccount();
      clearTimeout(safetyTimeout);
      onAuthenticated({
        uid: user.uid,
        name: profile.displayName,
        emailOrId: user.email || user.uid,
        photoURL: profile.photoURL,
        scholarUrl: profile.scholarUrl || '',
        provider: 'google',
      });
    } catch (err: unknown) {
      clearTimeout(safetyTimeout);
      const codeStr = String((err as { code?: string })?.code || '');
      const msg = String((err as { message?: string })?.message || '');

      if (
        codeStr.includes('popup-closed-by-user') ||
        codeStr.includes('cancelled-popup-request')
      ) {
        setError('Google sign-in was cancelled.');
      } else {
        setError(
          'Google sign-in is restricted in this browser window. Please switch to ORCID or Email Code to sign in.'
        );
      }
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="auth-modal-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Sign In to ScholarLens</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified Identity
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {pendingActionLabel
                ? `Sign in to ${pendingActionLabel}`
                : 'Connect your verified ORCID account to lock and manage your Google Scholar profile.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Tab Switcher: ORCID vs Email Code vs Google */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('orcid');
              setError(null);
            }}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'orcid'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-[#A6CE39] text-white flex items-center justify-center font-bold text-[8px] shrink-0">
              iD
            </span>
            <span>ORCID</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setError(null);
            }}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>Email</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('google');
              setError(null);
            }}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'google'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Google</span>
          </button>
        </div>

        {/* TAB 0: ORCID VERIFIED RESEARCHER IDENTITY */}
        {activeTab === 'orcid' && (
          <div className="space-y-4 pt-1">
            {/* Mode Selector */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setOrcidMode('verify');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 px-2 rounded-md transition-all text-center cursor-pointer ${
                  orcidMode === 'verify'
                    ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Verify &amp; Link Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrcidMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 px-2 rounded-md transition-all text-center cursor-pointer ${
                  orcidMode === 'login'
                    ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Returning ORCID Login
              </button>
            </div>

            {orcidMode === 'verify' ? (
              <form onSubmit={handleOrcidVerifyAndClaim} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="orcid-scholar-input"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Google Scholar Profile Link
                  </label>
                  <input
                    id="orcid-scholar-input"
                    type="text"
                    required
                    value={scholarUrlInput}
                    onChange={(e) => {
                      setScholarUrlInput(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="https://scholar.google.com/citations?user=... or User ID"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Paste your public Google Scholar link (e.g. scholar.google.com/citations?user=...)
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="orcid-id-input"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Your Official ORCID iD
                    </label>
                    <button
                      type="button"
                      onClick={handleConnectWithOrcidPopup}
                      disabled={isOrcidOAuthLoading}
                      className="text-[11px] text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Connect via orcid.org</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <span className="w-4 h-4 rounded-full bg-[#A6CE39] text-white flex items-center justify-center font-bold text-[9px]">
                        iD
                      </span>
                    </div>
                    <input
                      id="orcid-id-input"
                      type="text"
                      required
                      value={orcidIdInput}
                      onChange={(e) => {
                        setOrcidIdInput(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="0000-0002-1825-0097 or https://orcid.org/..."
                      className="w-full pl-8 pr-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    16-character identifier (format: 0000-000X-XXXX-XXXX)
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Authoritative 1-to-1 Profile Verification</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    ScholarLens cross-references author name, affiliation, and publication titles on your ORCID record against the Google Scholar profile. Only the authentic profile owner can claim this profile, locking it from impersonation.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isOrcidVerifying}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#82A824] hover:bg-[#72941e] rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isOrcidVerifying ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Verifying Authenticity with ORCID...</span>
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="w-4 h-4" />
                      <span>Verify &amp; Create Verified Account</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOrcidLogin} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="orcid-login-input"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Returning Researcher ORCID iD
                    </label>
                    <button
                      type="button"
                      onClick={handleConnectWithOrcidPopup}
                      disabled={isOrcidOAuthLoading}
                      className="text-[11px] text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>OAuth Popup</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <span className="w-4 h-4 rounded-full bg-[#A6CE39] text-white flex items-center justify-center font-bold text-[9px]">
                        iD
                      </span>
                    </div>
                    <input
                      id="orcid-login-input"
                      type="text"
                      required
                      value={orcidIdInput}
                      onChange={(e) => {
                        setOrcidIdInput(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="0000-0002-1825-0097"
                      className="w-full pl-8 pr-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    If you have already verified your profile, sign in directly without re-verification.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isOrcidVerifying}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isOrcidVerifying ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>Sign In with ORCID</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 1: EMAIL VERIFICATION CODE (Zero popup dependencies) */}
        {activeTab === 'email' && (
          <div className="space-y-4 pt-1">
            {emailStep === 'enter_email' ? (
              <form onSubmit={handleSendVerificationCode} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="researcher-email-input"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                      placeholder="e.g. mdsaimon3371@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    We will send a 6-digit verification code to your email. No password required.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSendingCode || !email.trim()}
                  className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSendingCode ? (
                    <span>Sending Code...</span>
                  ) : (
                    <>
                      <span>Get Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <label
                      htmlFor="verification-code-input"
                      className="font-semibold text-slate-700"
                    >
                      6-Digit Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailStep('enter_email');
                        setCode('');
                        setError(null);
                        setReceivedCodeHint(null);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-[11px] font-medium hover:underline cursor-pointer"
                    >
                      Change email
                    </button>
                  </div>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                          // Auto-verify on 6th digit
                          setTimeout(() => {
                            void handleVerifyCode();
                          }, 50);
                        }
                      }}
                      placeholder="• • • • • •"
                      className="w-full pl-10 pr-4 py-2.5 text-center text-lg font-mono font-bold tracking-[0.4em] bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span className="truncate max-w-[200px]">Sent to: {email}</span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isSendingCode}
                      onClick={() => void handleSendVerificationCode()}
                      className="text-blue-600 hover:text-blue-800 font-medium disabled:text-slate-400 cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}</span>
                    </button>
                  </div>

                  {receivedCodeHint && (
                    <div className="mt-2.5 p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                      <div className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Code: <strong className="font-mono text-sm tracking-wider">{receivedCodeHint}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCode(receivedCodeHint);
                          if (error) setError(null);
                        }}
                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingCode || code.length !== 6}
                  className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isVerifyingCode ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <span>Verify &amp; Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: GOOGLE SIGN-IN */}
        {activeTab === 'google' && (
          <div className="space-y-3.5 pt-1">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-2.5 shadow-2xs disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>

            {popupBlocked && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
                <p>
                  Your browser blocked the Google authentication popup. You can click below to open the Google sign-in window directly:
                </p>
                <button
                  type="button"
                  onClick={openAuthorizedGoogleBridgePopup}
                  className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Open Google Sign-In Window</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <div className="text-[11px] text-amber-700 text-center pt-1">
                  Tip: Or use the <strong className="cursor-pointer underline" onClick={() => setActiveTab('email')}>Email Code</strong> tab above for instant sign-in without popups!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status / Error Messages */}
        {successMessage && !error && (
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 space-y-1">
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

