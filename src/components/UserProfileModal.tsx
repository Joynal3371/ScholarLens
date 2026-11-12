import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Check,
  LogOut,
  Trash2,
  AlertCircle,
  User as UserIcon,
  ShieldCheck,
  ExternalLink,
  BadgeCheck,
} from 'lucide-react';
import { AuthenticatedResearcher } from './AuthGateModal';
import { updateCustomUserProfile, deleteCustomUserAccount } from '../firebase';
import { parseGoogleScholarInput } from '../utils/scholarAnalytics';

interface UserProfileModalProps {
  isOpen: boolean;
  user: AuthenticatedResearcher | null;
  onClose: () => void;
  onUpdateUser: (updated: AuthenticatedResearcher) => void;
  onSignOut: () => void;
  onRemoveAccount: () => void;
  onViewMyProfile?: () => void;
}

function resizeImageFileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not initialize image canvas.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdateUser,
  onSignOut,
  onRemoveAccount,
  onViewMyProfile,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [scholarUrl, setScholarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setDisplayName(user.name || '');
      setPhotoURL(user.photoURL || '');
      setScholarUrl(user.scholarUrl || '');
      setError(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const isScholarUrlValid = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return false;
    const parsed = parseGoogleScholarInput(trimmed);
    return parsed.valid && Boolean(parsed.userId);
  };

  const handleAttemptClose = () => {
    const savedValid = isScholarUrlValid(user.scholarUrl || '');
    const currentValid = isScholarUrlValid(scholarUrl);
    if (!savedValid && !currentValid) {
      setError('Google Scholar profile link is mandatory.');
      return;
    }
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const dataUri = await resizeImageFileToDataUri(file);
      setPhotoURL(dataUri);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to process image.'
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = displayName.trim();
    if (!cleanName) {
      setError('Name is required.');
      return;
    }
    const cleanScholar = scholarUrl.trim();
    const parsed = parseGoogleScholarInput(cleanScholar);
    if (!cleanScholar || !parsed.valid || !parsed.userId) {
      setError('Google Scholar profile link is mandatory.');
      return;
    }

    const normalizedScholarUrl = `https://scholar.google.com/citations?user=${encodeURIComponent(
      parsed.userId
    )}&hl=en`;

    setIsSaving(true);
    setError(null);
    try {
      await updateCustomUserProfile(
        user.uid,
        cleanName,
        photoURL.trim(),
        normalizedScholarUrl
      );
      onUpdateUser({
        ...user,
        name: cleanName,
        photoURL: photoURL.trim(),
        scholarUrl: normalizedScholarUrl,
      });
      onClose();
    } catch {
      setError('Could not save profile settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAccount = async () => {
    setIsRemoving(true);
    setError(null);
    try {
      await deleteCustomUserAccount(user.uid);
      onRemoveAccount();
      onClose();
    } catch {
      setError('Could not remove account. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  };

  const initials = (displayName || user.name || 'R')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleAttemptClose();
        }
      }}
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3
            id="profile-modal-title"
            className="text-base font-bold text-slate-900"
          >
            Profile Settings
          </h3>
          <button
            type="button"
            onClick={handleAttemptClose}
            aria-label="Close profile settings"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4" noValidate>
          {/* Clickable Profile Picture */}
          <div className="flex flex-col items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Change profile picture"
              aria-label="Change profile picture"
              className="relative group w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center text-slate-600 font-bold text-lg cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName || user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{initials || <UserIcon className="w-7 h-7" />}</span>
              )}
              <div className="absolute inset-0 bg-slate-900/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-5 h-5" />
              </div>
            </button>
          </div>

          <div>
            <label
              htmlFor="profile-display-name"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Name
            </label>
            <input
              id="profile-display-name"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Your Name"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="profile-scholar-url"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Google Scholar Link <span className="text-red-600">*</span>
            </label>
            <input
              id="profile-scholar-url"
              type="url"
              required
              value={scholarUrl}
              onChange={(e) => {
                setScholarUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="https://scholar.google.com/citations?user=..."
              className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* ORCID Verified Identity Banner */}
          {user.orcidId && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
                  <span className="w-4 h-4 rounded-full bg-[#A6CE39] text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                    iD
                  </span>
                  <span>ORCID Verified Identity</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  1-to-1 Locked
                </span>
              </div>
              <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-2">
                <span>ORCID iD:</span>
                <a
                  href={`https://orcid.org/${user.orcidId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-medium text-emerald-800 hover:underline inline-flex items-center gap-1"
                >
                  <span>{user.orcidId}</span>
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                </a>
              </div>
              <p className="text-[11px] text-emerald-800/80">
                This Google Scholar profile is verified and permanently bound to your ORCID account.
              </p>
            </div>
          )}

          {/* View My Profile in ScholarLens */}
          {onViewMyProfile && (user.scholarUrl || user.scholarUserId) && (
            <button
              type="button"
              onClick={() => {
                onViewMyProfile();
                onClose();
              }}
              className="w-full py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
              <span>View My Profile in ScholarLens</span>
            </button>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                type="button"
                disabled={isRemoving}
                onClick={handleRemoveAccount}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRemoving ? 'Removing...' : 'Remove Account'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
