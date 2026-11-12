import React, { useState, useEffect } from 'react';

interface ScholarProfileAvatarProps {
  scholarUserId: string;
  name: string;
  avatarUrl?: string;
  className?: string;
}

export const ScholarProfileAvatar: React.FC<ScholarProfileAvatarProps> = ({
  scholarUserId,
  name,
  avatarUrl,
  className = 'w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40',
}) => {
  const getInitialSrc = (): string | null => {
    if (avatarUrl && avatarUrl.trim() && avatarUrl.startsWith('data:image/')) {
      return avatarUrl.trim();
    }
    const cleanId = (scholarUserId || '').trim();
    const cleanName = (name || '').trim();
    if (cleanId || cleanName) {
      return `/api/scholar/avatar?userId=${encodeURIComponent(cleanId)}&name=${encodeURIComponent(cleanName)}`;
    }
    return null;
  };

  const [currentSrc, setCurrentSrc] = useState<string | null>(getInitialSrc);
  const [fallbackStep, setFallbackStep] = useState<number>(0);

  useEffect(() => {
    setCurrentSrc(getInitialSrc());
    setFallbackStep(0);
  }, [avatarUrl, scholarUserId, name]);

  const handleImageError = () => {
    const cleanId = (scholarUserId || '').trim();
    const cleanName = (name || '').trim();

    if (fallbackStep === 0 && cleanId && cleanName) {
      setFallbackStep(1);
      setCurrentSrc(`/api/scholar/avatar?userId=${encodeURIComponent(cleanId)}&name=${encodeURIComponent(cleanName)}`);
    } else if (fallbackStep <= 1 && cleanName) {
      setFallbackStep(2);
      setCurrentSrc(`/api/scholar/avatar?name=${encodeURIComponent(cleanName)}`);
    } else {
      setCurrentSrc(null);
    }
  };

  const initials = (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <div className="relative shrink-0 select-none">
      {/* Circular Profile Picture Container */}
      <div
        className={`${className} rounded-full overflow-hidden border-4 border-slate-200/90 bg-slate-100 shadow-md ring-4 ring-slate-100/80 relative flex items-center justify-center`}
      >
        {currentSrc ? (
          <img
            src={currentSrc}
            alt={name || 'Researcher'}
            referrerPolicy="no-referrer"
            data-testid="active-researcher-avatar"
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xl sm:text-2xl font-bold text-slate-500">
            {initials || 'SR'}
          </span>
        )}
      </div>
    </div>
  );
};
