import React, { useState, useEffect } from 'react';
import { X, Lock, AlertCircle, User } from 'lucide-react';
import {
  signInWithGoogleAccount,
  getLocalUserProfileOverride,
} from '../firebase';

export interface AuthenticatedResearcher {
  uid: string;
  name: string;
  emailOrId: string;
  photoURL: string;
  provider: 'google' | 'orcid';
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
  const [orcidInput, setOrcidInput] = useState<string>('');
  const [loadingProvider, setLoadingProvider] = useState<
    'google' | 'orcid' | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (
        event.data?.type === 'OAUTH_AUTH_SUCCESS' &&
        event.data?.provider === 'orcid'
      ) {
        const orcid = String(event.data.orcid || '');
        const uid = `orcid_${orcid.replace(/[^a-zA-Z0-9]/g, '')}`;
        const localOverride = getLocalUserProfileOverride(uid);
        const name =
          localOverride?.displayName ||
          String(event.data.name || `ORCID ${orcid}`);
        onAuthenticated({
          uid,
          name,
          emailOrId: orcid,
          photoURL: localOverride?.photoURL || '',
          provider: 'orcid',
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAuthenticated]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoadingProvider('google');
    try {
      const { user, profile } = await signInWithGoogleAccount();
      onAuthenticated({
        uid: user.uid,
        name:
          profile.displayName ||
          user.displayName ||
          user.email ||
          'Google Researcher',
        emailOrId: user.email || user.uid,
        photoURL: profile.photoURL || user.photoURL || '',
        provider: 'google',
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'Google sign-in popup was closed or blocked. You can also sign in with ORCID below.'
      );
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleOrcidOAuthPopupOrVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoadingProvider('orcid');
    try {
      const redirectUri = `${window.location.origin}/auth/orcid/callback`;
      const urlRes = await fetch(
        `/api/auth/orcid/url?redirectUri=${encodeURIComponent(redirectUri)}`
      );
      if (urlRes.ok) {
        const urlData = await urlRes.json();
        if (urlData.configured && urlData.url) {
          window.open(urlData.url, 'orcid_oauth_popup', 'width=600,height=700');
          setLoadingProvider(null);
          return;
        }
      }

      const verifyRes = await fetch(
        `/api/auth/orcid/verify?orcid=${encodeURIComponent(orcidInput.trim())}`
      );
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.valid) {
        setErrorMessage(
          verifyData.error ||
            'Enter a valid 16-digit ORCID iD (e.g., 0000-0002-4137-9374).'
        );
        setLoadingProvider(null);
        return;
      }

      const uid = `orcid_${String(verifyData.orcid).replace(
        /[^a-zA-Z0-9]/g,
        ''
      )}`;
      const localOverride = getLocalUserProfileOverride(uid);

      onAuthenticated({
        uid,
        name: localOverride?.displayName || verifyData.name,
        emailOrId: verifyData.orcid,
        photoURL: localOverride?.photoURL || '',
        provider: 'orcid',
      });
    } catch {
      setErrorMessage('Could not verify ORCID iD. Please check the format.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              {pendingActionLabel ? (
                <Lock className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2
                id="auth-modal-title"
                className="text-base font-bold text-slate-900"
              >
                {pendingActionLabel
                  ? 'Sign In to Export Reports & Charts'
                  : 'Sign In to ScholarLens'}
              </h2>
              <p className="text-xs text-slate-500">
                {pendingActionLabel
                  ? `Authentication required for: ${pendingActionLabel}`
                  : 'Sign in with Gmail or ORCID to manage your profile and export reports.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Option 1: Gmail / Google Account Login via Firebase Auth */}
        <div>
          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 rounded-lg text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
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
            <span>
              {loadingProvider === 'google'
                ? 'Connecting Gmail...'
                : 'Continue with Google (Gmail)'}
            </span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-slate-200" />
          <span className="shrink mx-3 text-xs text-slate-400">
            or sign in with ORCID
          </span>
          <div className="grow border-t border-slate-200" />
        </div>

        {/* Option 2: ORCID Account Login */}
        <form onSubmit={handleOrcidOAuthPopupOrVerify} className="space-y-3">
          <div>
            <label
              htmlFor="orcid-id-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              ORCID iD (16-digit identifier)
            </label>
            <input
              id="orcid-id-input"
              type="text"
              value={orcidInput}
              onChange={(e) => setOrcidInput(e.target.value)}
              placeholder="0000-0002-4137-9374"
              className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>
          <button
            type="submit"
            disabled={loadingProvider !== null}
            className="w-full py-2.5 px-4 bg-[#A6CE39] hover:bg-[#96bc31] text-slate-950 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <span className="w-4 h-4 rounded-full bg-slate-950 text-[#A6CE39] text-[10px] font-bold flex items-center justify-center">
              iD
            </span>
            <span>
              {loadingProvider === 'orcid'
                ? 'Verifying ORCID...'
                : 'Continue with ORCID Account'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
