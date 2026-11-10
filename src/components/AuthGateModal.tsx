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
  // Method selection: 'email' (foolproof OTP) or 'google'
  const [activeTab, setActiveTab] = useState<'email' | 'google'>('email');

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

  // Focus code input when transitioning to enter_code
  useEffect(() => {
    if (emailStep === 'enter_code') {
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 150);
    }
  }, [emailStep]);

  // Listen for Google Auth Bridge postMessage (for cross-window auth)
  useEffect(() => {
    const handleBridgeMessage = async (event: MessageEvent) => {
      const allowedOrigins = [
        AUTHORIZED_BRIDGE_ORIGIN,
        'https://scholarlens-analytics.vercel.app',
        'https://gen-lang-client-0156039264.firebaseapp.com',
        window.location.origin,
      ];
      if (!allowedOrigins.includes(event.origin)) return;
      const data = event.data;
      if (!data || data.type !== 'GOOGLE_BRIDGE_AUTH_SUCCESS') return;

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
    };

    window.addEventListener('message', handleBridgeMessage);
    return () => window.removeEventListener('message', handleBridgeMessage);
  }, [onAuthenticated]);

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
        // Do not auto-spawn popup windows to avoid unwanted redirects.
        // Switch user smoothly to the Email Verification Code tab.
        setError(
          'Google sign-in encountered a browser restriction. Please use the Email Verification Code tab below to sign in instantly.'
        );
        setActiveTab('email');
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
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="auth-modal-title" className="text-lg font-bold text-slate-900">
              Sign In to ScholarLense
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {pendingActionLabel
                ? `Sign in to ${pendingActionLabel}`
                : 'Sign in to export publication dossiers and save profile preferences.'}
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

        {/* Tab Switcher: Email OTP vs Google */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setError(null);
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Code</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('google');
              setError(null);
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'google'
                ? 'bg-white text-slate-900 shadow-xs'
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

