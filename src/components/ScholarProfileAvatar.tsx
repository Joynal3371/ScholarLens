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
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [fallbackStep, setFallbackStep] = useState<number>(0);

  const initialUrl =
    avatarUrl && avatarUrl.startsWith('data:image/')
      ? avatarUrl
      : `/api/scholar/avatar?userId=${encodeURIComponent(
          scholarUserId
        )}&name=${encodeURIComponent(name)}`;

  useEffect(() => {
    setCurrentSrc(initialUrl);
    setFallbackStep(0);
  }, [initialUrl, scholarUserId]);

  const handleImageError = () => {
    if (fallbackStep === 0) {
      setFallbackStep(1);
      setCurrentSrc(
        `/api/scholar/avatar?userId=${encodeURIComponent(
          scholarUserId
        )}&name=${encodeURIComponent(name)}`
      );
    } else if (fallbackStep === 1) {
      setFallbackStep(2);
      setCurrentSrc(`/api/scholar/avatar?name=${encodeURIComponent(name)}`);
    }
  };

  return (
    <div className="relative shrink-0 select-none">
      {/* Circular Profile Picture Container directly displaying Google Scholar Photo */}
      <div
        className={`${className} rounded-full overflow-hidden border-4 border-slate-200/90 bg-slate-100 shadow-md ring-4 ring-slate-100/80 relative flex items-center justify-center`}
      >
        <img
          src={currentSrc}
          alt={name}
          referrerPolicy="no-referrer"
          data-testid="active-researcher-avatar"
          onError={handleImageError}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
