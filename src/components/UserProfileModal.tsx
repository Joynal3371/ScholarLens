import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, LogOut, Check, User } from 'lucide-react';
import { AuthenticatedResearcher } from './AuthGateModal';
import {
  updateCustomUserProfile,
  saveLocalUserProfileOverride,
} from '../firebase';

interface UserProfileModalProps {
  isOpen: boolean;
  user: AuthenticatedResearcher | null;
  onClose: () => void;
  onUpdateUser: (updated: AuthenticatedResearcher) => void;
  onSignOut: () => void;
}

function resizeImageFileToDataUrl(
  file: File,
  maxSize: number = 160
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxSize) {
            h = Math.round((h * maxSize) / w);
            w = maxSize;
          }
        } else {
          if (h > maxSize) {
            w = Math.round((w * maxSize) / h);
            h = maxSize;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdateUser,
  onSignOut,
}) => {
  const [nameInput, setNameInput] = useState<string>('');
  const [photoInput, setPhotoInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setNameInput(user.name);
      setPhotoInput(user.photoURL || '');
      setSavedNotice(false);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFileToDataUrl(file, 160);
      setPhotoInput(dataUrl);
    } catch {
      // Ignore invalid image selection
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim() || user.name;
    const cleanPhoto = photoInput.trim();
    setIsSaving(true);
    try {
      if (user.provider === 'google') {
        await updateCustomUserProfile(user.uid, cleanName, cleanPhoto);
      } else {
        saveLocalUserProfileOverride(user.uid, {
          displayName: cleanName,
          photoURL: cleanPhoto,
        });
      }
      onUpdateUser({
        ...user,
        name: cleanName,
        photoURL: cleanPhoto,
      });
      setSavedNotice(true);
      setTimeout(() => {
        onClose();
      }, 450);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (nameInput || user.name || 'R')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h2
            id="profile-modal-title"
            className="text-base font-bold text-slate-900"
          >
            Profile Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile settings"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar Preview & Upload */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center overflow-hidden border-2 border-slate-200 shrink-0">
              {photoInput ? (
                <img
                  src={photoInput}
                  alt={nameInput || user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{initials || <User className="w-6 h-6" />}</span>
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
                {photoInput && (
                  <button
                    type="button"
                    onClick={() => setPhotoInput('')}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {user.emailOrId}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Display Name Input */}
          <div>
            <label
              htmlFor="profile-display-name"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Display Name
            </label>
            <input
              id="profile-display-name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Optional Direct Image URL Input */}
          <div>
            <label
              htmlFor="profile-photo-url"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Profile Picture URL (or use Upload Photo above)
            </label>
            <input
              id="profile-photo-url"
              type="text"
              value={photoInput.startsWith('data:') ? '' : photoInput}
              onChange={(e) => setPhotoInput(e.target.value)}
              placeholder="https://lh3.googleusercontent.com/..."
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {savedNotice ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
