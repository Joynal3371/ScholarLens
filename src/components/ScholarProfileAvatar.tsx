import React, { useState, useEffect } from 'react';

interface ScholarProfileAvatarProps {
  scholarUserId: string;
  name: string;
  avatarUrl?: string;
  orcid?: string;
  university?: string;
  compact?: boolean;
  className?: string;
}

export const ScholarProfileAvatar: React.FC<ScholarProfileAvatarProps> = ({
  scholarUserId,
  name,
  avatarUrl,
  orcid,
  university,
  compact = false,
  className = 'w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40',
}) => {
  const buildAvatarProxyUrl = (withId: boolean) => {
    const cleanId = (scholarUserId || '').trim();
    const cleanName = (name || '').trim();
    const params = new URLSearchParams();
    if (withId && cleanId) params.set('userId', cleanId);
    if (cleanName) params.set('name', cleanName);
    if (orcid) params.set('orcid', orcid);
    if (university) params.set('uni', university);
    return `/api/scholar/avatar?${params.toString()}`;
  };

  const getInitialSrc = (): string | null => {
    const trimmedUrl = (avatarUrl || '').trim();
    if (
      trimmedUrl &&
      (trimmedUrl.startsWith('data:image/') ||
        trimmedUrl.startsWith('https://') ||
        trimmedUrl.startsWith('http://') ||
        trimmedUrl.startsWith('/api/'))
    ) {
      return trimmedUrl;
    }
    const cleanId = (scholarUserId || '').trim();
    const cleanName = (name || '').trim();
    if (cleanId || cleanName || orcid) {
      return buildAvatarProxyUrl(true);
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

    if (fallbackStep === 0 && (cleanId || cleanName)) {
      setFallbackStep(1);
      setCurrentSrc(buildAvatarProxyUrl(true));
    } else if (fallbackStep <= 1 && cleanName) {
      setFallbackStep(2);
      setCurrentSrc(buildAvatarProxyUrl(false));
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
        className={`${className} rounded-full overflow-hidden ${
          compact
            ? 'border border-slate-200 bg-slate-100'
            : 'border-4 border-slate-200/90 bg-slate-100 shadow-md ring-4 ring-slate-100/80'
        } relative flex items-center justify-center`}
      >
        {currentSrc ? (
          <img
            src={currentSrc}
            alt={name || 'Researcher'}
            referrerPolicy="no-referrer"
            data-testid={compact ? undefined : 'active-researcher-avatar'}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className={`${
              compact ? 'text-xs' : 'text-xl sm:text-2xl'
            } font-bold text-slate-500`}
          >
            {initials || 'SR'}
          </span>
        )}
      </div>
    </div>
  );
};
