import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
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
  onClose,
  onAuthenticated,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const bridgePopupRef = useRef<Window | null>(null);

  useEffect(() => {
    const handleBridgeMessage = async (event: MessageEvent) => {
      if (event.origin !== AUTHORIZED_BRIDGE_ORIGIN) return;
      const data = event.data;
      if (!data || data.type !== 'GOOGLE_BRIDGE_AUTH_SUCCESS') return;

      setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleBridgeMessage);
    return () => window.removeEventListener('message', handleBridgeMessage);
  }, [onAuthenticated]);

  if (!isOpen) return null;

  const openAuthorizedGoogleBridgePopup = () => {
    setError(null);
    const width = 500;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      `${AUTHORIZED_BRIDGE_ORIGIN}/?googleAuthBridge=1`,
      'ScholarLensGoogleAuth',
      `width=${width},height=${height},left=${left},top=${top},noopener=no`
    );
    if (!popup) {
      setError('Popup blocked by browser. Please allow popups and try again.');
      setIsLoading(false);
      return;
    }
    bridgePopupRef.current = popup;
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
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
      const code = String((err as { code?: string })?.code || '');
      if (
        code.includes('unauthorized-domain') ||
        code.includes('operation-not-supported')
      ) {
        openAuthorizedGoogleBridgePopup();
        return;
      }
      if (
        code.includes('popup-closed-by-user') ||
        code.includes('cancelled-popup-request')
      ) {
        setError('Google sign-in was cancelled.');
      } else {
        setError('Unable to sign in with Google. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 id="auth-modal-title" className="text-base font-bold text-slate-900">
            Sign In
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-2.5 px-4 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2.5 shadow-2xs disabled:opacity-60 cursor-pointer"
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
          <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
        </button>

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
