import React from 'react';

interface ScholarProfileLoadingVisualizerProps {
  targetLabel?: string;
  scholarUserId?: string;
  onCancel?: () => void;
}

const SPOKE_ANGLES = Array.from({ length: 12 }, (_, idx) => idx * 30);

export const ScholarProfileLoadingVisualizer: React.FC<
  ScholarProfileLoadingVisualizerProps
> = () => {
  return (
    <div
      data-testid="scholar-loading-visualizer"
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="min-h-[64vh] w-full flex items-center justify-center"
    >
      <style>{`
        @keyframes scholarRadialSpokeFade {
          0% { opacity: 0.95; }
          100% { opacity: 0.1; }
        }
      `}</style>
      <svg
        viewBox="0 0 100 100"
        className="w-16 h-16 sm:w-20 sm:h-20"
        aria-hidden="true"
      >
        {SPOKE_ANGLES.map((angle, idx) => (
          <rect
            key={angle}
            x="46"
            y="8"
            width="8"
            height="22"
            rx="4"
            fill="#0f172a"
            transform={`rotate(${angle} 50 50)`}
            style={{
              opacity: 0.1,
              animation: 'scholarRadialSpokeFade 0.96s linear infinite',
              animationDelay: `${-(11 - idx) * 0.08}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
};
