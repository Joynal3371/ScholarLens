import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Check, Eye } from 'lucide-react';
import {
  fitScholarPortraitWithGenerativeExpansion,
  FittedPortraitResult,
} from '../utils/portraitGenerativeFitter';

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
  const [fittedSrc, setFittedSrc] = useState<string | null>(null);
  const [useFittedMode, setUseFittedMode] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [fitResult, setFitResult] = useState<FittedPortraitResult | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [fallbackStep, setFallbackStep] = useState<number>(0);

  const initialUrl =
    avatarUrl && avatarUrl.startsWith('data:image/')
      ? avatarUrl
      : `https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=${encodeURIComponent(
          scholarUserId
        )}`;

  useEffect(() => {
    setCurrentSrc(initialUrl);
    setFittedSrc(null);
    setFitResult(null);
    setFallbackStep(0);
    setUseFittedMode(true);
  }, [initialUrl, scholarUserId]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Avoid re-processing the fitted data URL
    if (img.src.startsWith('data:image/png;base64,') && fittedSrc) return;

    try {
      setIsProcessing(true);
      const result = fitScholarPortraitWithGenerativeExpansion(img, {
        targetSize: 420,
        headroomRatio: 0.08,
        generativeBlur: 28,
        clipToCircle: false,
      });

      if (result.wasExpanded || result.dataUrl) {
        setFittedSrc(result.dataUrl);
        setFitResult(result);
      }
    } catch (err) {
      console.warn('AI Generative Portrait fitting error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

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

  const displaySrc =
    useFittedMode && fittedSrc ? fittedSrc : currentSrc;

  return (
    <div className="relative group shrink-0 select-none">
      {/* Circular Avatar Container */}
      <div
        className={`${className} rounded-full overflow-hidden border-4 border-slate-200/90 bg-slate-100 shadow-md ring-4 ring-slate-100/80 relative`}
      >
        <img
          src={displaySrc}
          alt={name}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          data-testid="active-researcher-avatar"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="w-full h-full object-cover transition-all duration-300"
        />

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-2xs flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400 animate-spin" />
          </div>
        )}
      </div>

      {/* AI Generative Fit Pill Badge */}
      {fittedSrc && fitResult?.wasExpanded && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
          <button
            type="button"
            onClick={() => setUseFittedMode((prev) => !prev)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            aria-label="Toggle AI-Fitted Portrait"
            title={
              useFittedMode
                ? 'AI-Fitted: Facial identity 100% preserved, background expanded. Click to see raw photo.'
                : 'Showing original unexpanded photo. Click to enable AI-Fitted.'
            }
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shadow-xs transition-all cursor-pointer whitespace-nowrap ${
              useFittedMode
                ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
            <span>{useFittedMode ? 'AI Fitted' : 'Original'}</span>
          </button>

          {/* Interactive Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 p-2 bg-slate-900 text-white text-[10px] leading-tight rounded-lg shadow-xl pointer-events-none z-30">
              <div className="font-bold flex items-center gap-1 text-blue-300 mb-1">
                <Check className="w-3 h-3 text-emerald-400" />
                Facial Identity Protected
              </div>
              <p className="text-slate-300">
                Main portrait & face are 100% preserved. Ambient background is generatively expanded so the full head fits within the circular frame.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
