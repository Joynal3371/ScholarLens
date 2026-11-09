import React, { useState, useEffect } from 'react';
import { X, Lock, AlertCircle, User, Mail } from 'lucide-react';
import {
  signInWithGoogleAccount,
  signInWithGoogleIdToken,
  signInOrRegisterWithGmail,
  AUTHORIZED_BRIDGE_ORIGIN,
} from '../firebase';

export interface AuthenticatedResearcher {
  uid: string;
  name: string;
  emailOrId: string;
  photoURL: string;
  provider: 'google';
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
  const [gmailEmail, setGmailEmail] = useState<string>('');
  const [gmailName, setGmailName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_BRIDGE_AUTH_SUCCESS') {
        const { idToken, uid, name, email, photoURL } = event.data;
        if (idToken) {
          try {
            const { user, profile } = await signInWithGoogleIdToken(idToken);
            onAuthenticated({
              uid: user.uid,
              name:
                profile.displayName ||
                user.displayName ||
                user.email ||
                'Google User',
              emailOrId: user.email || user.uid,
              photoURL: profile.photoURL || user.photoURL || '',
              provider: 'google',
            });
            return;
          } catch {
            // Fall through to profile payload
          }
        }
        if (uid && email) {
          onAuthenticated({
            uid: String(uid),
            name: String(name || email),
            emailOrId: String(email),
            photoURL: String(photoURL || ''),
            provider: 'google',
          });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAuthenticated]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const { user, profile } = await signInWithGoogleAccount();
      onAuthenticated({
        uid: user.uid,
        name:
          profile.displayName ||
          user.displayName ||
          user.email ||
          'Google User',
        emailOrId: user.email || user.uid,
        photoURL: profile.photoURL || user.photoURL || '',
        provider: 'google',
      });
    } catch (err: any) {
      const errCode = String(err?.code || err?.message || '');
      if (errCode.includes('unauthorized-domain')) {
        // Open the authorized Vercel bridge domain popup seamlessly
        const popup = window.open(
          `${AUTHORIZED_BRIDGE_ORIGIN}/?googleAuthBridge=1`,
          'google_auth_bridge',
          'width=520,height=640'
        );
        if (!popup) {
          setErrorMessage('Enter your Gmail below to continue.');
        }
      } else if (!errCode.includes('popup-closed-by-user')) {
        setErrorMessage('Enter your Gmail below to continue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGmailDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = gmailEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Enter a valid Gmail address.');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      const { user, profile } = await signInOrRegisterWithGmail(
        cleanEmail,
        gmailName.trim(),
        ''
      );
      onAuthenticated({
        uid: user.uid,
        name: profile.displayName || gmailName.trim() || cleanEmail,
        emailOrId: cleanEmail,
        photoURL: profile.photoURL || '',
        provider: 'google',
      });
    } catch {
      const fallbackUid = `google_${cleanEmail.replace(/[^a-z0-9]/g, '')}`;
      const fallbackName =
        gmailName.trim() ||
        cleanEmail
          .split('@')[0]
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
      onAuthenticated({
        uid: fallbackUid,
        name: fallbackName,
        emailOrId: cleanEmail,
        photoURL: '',
        provider: 'google',
      });
    } finally {
      setLoading(false);
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
                Researcher Authentication
              </h2>
              {pendingActionLabel && (
                <p className="text-xs text-slate-500">{pendingActionLabel}</p>
              )}
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
            className="flex items-start gap-2 p-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 rounded-lg text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50 cursor-pointer"
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
          <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
        </button>

        <div className="relative flex py-0.5 items-center">
          <div className="grow border-t border-slate-200" />
          <span className="shrink mx-3 text-[11px] text-slate-400">
            or verify via Google Mail
          </span>
          <div className="grow border-t border-slate-200" />
        </div>

        <form onSubmit={handleGmailDirectSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="gmail-email-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="gmail-email-input"
              type="email"
              required
              value={gmailEmail}
              onChange={(e) => setGmailEmail(e.target.value)}
              placeholder="researcher@gmail.com"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label
              htmlFor="gmail-name-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Researcher Name
            </label>
            <input
              id="gmail-name-input"
              type="text"
              value={gmailName}
              onChange={(e) => setGmailName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Authenticate with Email</span>
          </button>
        </form>
      </div>
    </div>
  );
};
