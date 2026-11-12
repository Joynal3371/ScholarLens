import React, { useEffect, useState } from 'react';
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  Globe2,
  Loader2,
  Network,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';

interface ScholarProfileLoadingVisualizerProps {
  targetLabel?: string;
  scholarUserId?: string;
  onCancel?: () => void;
}

interface LoadingStage {
  id: string;
  title: string;
  shortLabel: string;
  thresholdMs: number;
  detail: string;
  metricPreview: string;
  icon: React.ComponentType<{ className?: string }>;
  orbitAngleDeg: number;
  accentColor: string;
  ringBg: string;
}

const LOADING_STAGES: LoadingStage[] = [
  {
    id: 'handshake',
    title: 'Google Scholar Profile Lookup',
    shortLabel: 'Scholar Profile',
    thresholdMs: 0,
    detail: 'Validating Scholar user ID and probing verified scholar snapshots & public citations.',
    metricPreview: 'ID resolution • Avatar & Affiliation',
    icon: UserCheck,
    orbitAngleDeg: -50,
    accentColor: '#2563eb',
    ringBg: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    id: 'identity',
    title: 'Author Identity & Disambiguation',
    shortLabel: 'Identity Sync',
    thresholdMs: 1400,
    detail: 'Cross-referencing Wikidata P1960, ORCID Registry, OpenAlex author IDs, and institutional domains.',
    metricPreview: 'ORCID • ROR Institutional Affinity',
    icon: Sparkles,
    orbitAngleDeg: 40,
    accentColor: '#0ea5e9',
    ringBg: 'bg-sky-50 text-sky-600 border-sky-200',
  },
  {
    id: 'corpus',
    title: 'Publication Corpus & Q1–Q4 Quartiles',
    shortLabel: 'Corpus & Quartiles',
    thresholdMs: 3200,
    detail: 'Fetching indexed works, citation counts per paper, and matching Scimago/OpenAlex Q1–Q4 journal quartiles.',
    metricPreview: 'h-index • g-index • i10-index • Quartiles',
    icon: BookOpen,
    orbitAngleDeg: 135,
    accentColor: '#10b981',
    ringBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    id: 'network',
    title: 'Collaboration Graph & Geo Map',
    shortLabel: 'Network Graph',
    thresholdMs: 5600,
    detail: 'Aggregating co-author collaborations, partner universities, and global country footprint.',
    metricPreview: 'Universities • Co-Authors • 3D Globe',
    icon: Globe2,
    orbitAngleDeg: 225,
    accentColor: '#6366f1',
    ringBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
];

export const ScholarProfileLoadingVisualizer: React.FC<
  ScholarProfileLoadingVisualizerProps
> = ({ targetLabel, scholarUserId, onCancel }) => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [inspectedStageId, setInspectedStageId] = useState<string | null>(null);
  const [graphViewMode, setGraphViewMode] = useState<'orbit' | 'telemetry'>(
    'orbit'
  );

  useEffect(() => {
    const start = Date.now();
    setElapsedMs(0);
    setInspectedStageId(null);
    const timer = window.setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 120);
    return () => window.clearInterval(timer);
  }, [targetLabel, scholarUserId]);

  const activeAutoIndex = LOADING_STAGES.reduce(
    (acc, stage, idx) => (elapsedMs >= stage.thresholdMs ? idx : acc),
    0
  );
  const selectedStage =
    LOADING_STAGES.find((s) => s.id === inspectedStageId) ||
    LOADING_STAGES[activeAutoIndex];

  // Asymptotic progress curve from 12% up to 94% so progress always moves smoothly without stalling at 100% prematurely
  const progressPct = Math.min(
    94,
    Math.round(14 + 80 * (1 - Math.exp(-elapsedMs / 5200)))
  );
  const elapsedSecondsText = `${(elapsedMs / 1000).toFixed(1)}s`;

  const displayTarget =
    (targetLabel && targetLabel.trim()) ||
    (scholarUserId && `Scholar ID: ${scholarUserId.trim()}`) ||
    'Google Scholar Profile';

  return (
    <div
      data-testid="scholar-loading-visualizer"
      role="status"
      aria-live="polite"
      className="space-y-5 animate-in fade-in duration-200"
    >
      {/* Top Interactive Pipeline Card */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs overflow-hidden relative">
        {/* Top indeterminate shimmer hairline */}
        <div className="absolute top-0 inset-x-0 h-1 bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center shrink-0">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  Analyzing Researcher Profile
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70 max-w-full truncate">
                  {displayTarget}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedStage.title} — {progressPct}% complete ({elapsedSecondsText})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
              <button
                type="button"
                onClick={() => setGraphViewMode('orbit')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  graphViewMode === 'orbit'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Orbit View
              </button>
              <button
                type="button"
                onClick={() => setGraphViewMode('telemetry')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  graphViewMode === 'telemetry'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Live Feed
              </button>
            </div>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Split Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-5 items-center">
          {/* Left: Interactive Orbital Graph / Telemetry View */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            {graphViewMode === 'orbit' ? (
              <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center select-none">
                <svg
                  viewBox="0 0 260 260"
                  className="w-full h-full overflow-visible"
                  aria-label="Interactive Research Loading Orbit"
                >
                  <defs>
                    <radialGradient id="scholarPulseGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Soft radial glow */}
                  <circle cx="130" cy="130" r="112" fill="url(#scholarPulseGrad)" />

                  {/* Concentric orbital rings */}
                  <circle
                    cx="130"
                    cy="130"
                    r="102"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1.25"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx="130"
                    cy="130"
                    r="66"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1.25"
                    strokeDasharray="6 4"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 130 130"
                      to="360 130 130"
                      dur="14s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Animated sweep sector */}
                  <g>
                    <line
                      x1="130"
                      y1="130"
                      x2="130"
                      y2="28"
                      stroke="#3b82f6"
                      strokeOpacity="0.45"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 130 130"
                      to="360 130 130"
                      dur="3.6s"
                      repeatCount="indefinite"
                    />
                  </g>

                  {/* Stage connection spokes & interactive clickable nodes */}
                  {LOADING_STAGES.map((stage, idx) => {
                    const rad = (stage.orbitAngleDeg * Math.PI) / 180;
                    const r = 92;
                    const nx = 130 + r * Math.cos(rad);
                    const ny = 130 + r * Math.sin(rad);
                    const isDone = idx < activeAutoIndex;
                    const isCurrent = idx === activeAutoIndex;
                    const isSelected = selectedStage.id === stage.id;
                    return (
                      <g
                        key={stage.id}
                        onClick={() => setInspectedStageId(stage.id)}
                        className="cursor-pointer group"
                      >
                        <line
                          x1="130"
                          y1="130"
                          x2={nx}
                          y2={ny}
                          stroke={
                            isDone || isCurrent ? stage.accentColor : '#cbd5e1'
                          }
                          strokeOpacity={isSelected ? 0.9 : 0.45}
                          strokeWidth={isSelected ? 2.2 : 1.4}
                          strokeDasharray={isDone ? undefined : '3 3'}
                        />
                        {isCurrent && (
                          <circle
                            cx={nx}
                            cy={ny}
                            r="20"
                            fill={stage.accentColor}
                            fillOpacity="0.16"
                          >
                            <animate
                              attributeName="r"
                              values="15;24;15"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="fill-opacity"
                              values="0.25;0.05;0.25"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                        <circle
                          cx={nx}
                          cy={ny}
                          r={isSelected ? 15 : 13}
                          fill={
                            isDone || isCurrent ? stage.accentColor : '#ffffff'
                          }
                          stroke={
                            isDone || isCurrent ? '#ffffff' : '#94a3b8'
                          }
                          strokeWidth="2"
                        />
                        <text
                          x={nx}
                          y={ny + 3.5}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="700"
                          fill={isDone || isCurrent ? '#ffffff' : '#475569'}
                        >
                          {isDone ? '✓' : idx + 1}
                        </text>
                        <text
                          x={nx}
                          y={ny + (ny > 130 ? 27 : -21)}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight={isSelected ? '700' : '600'}
                          fill={isSelected ? '#0f172a' : '#475569'}
                        >
                          {stage.shortLabel}
                        </text>
                      </g>
                    );
                  })}

                  {/* Center Scholar Node */}
                  <circle
                    cx="130"
                    cy="130"
                    r="28"
                    fill="#1d4ed8"
                    stroke="#ffffff"
                    strokeWidth="3"
                  />
                  <text
                    x="130"
                    y="127"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#dbeafe"
                  >
                    SCHOLAR
                  </text>
                  <text
                    x="130"
                    y="141"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    fill="#ffffff"
                  >
                    {progressPct}%
                  </text>
                </svg>
                <span className="text-[11px] text-slate-400 font-medium -mt-2">
                  Click any node to inspect pipeline stage
                </span>
              </div>
            ) : (
              <div className="w-full rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-[11px] space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                  <span className="inline-flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    ScholarLens Ingestion Stream
                  </span>
                  <span>{elapsedSecondsText}</span>
                </div>
                {LOADING_STAGES.map((stage, idx) => {
                  const isDone = idx < activeAutoIndex;
                  const isCurrent = idx === activeAutoIndex;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setInspectedStageId(stage.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                        selectedStage.id === stage.id
                          ? 'bg-slate-800 text-white'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <span className="truncate pr-2">
                        [{isDone ? 'OK' : isCurrent ? '..' : 'WAIT'}] {stage.title}
                      </span>
                      <span
                        className={`text-[10px] shrink-0 ${
                          isDone
                            ? 'text-emerald-400'
                            : isCurrent
                            ? 'text-sky-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {isDone ? 'verified' : isCurrent ? 'running' : 'queued'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Interactive Stage Stepper & Detail Inspector */}
          <div className="lg:col-span-7 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LOADING_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isDone = idx < activeAutoIndex;
                const isCurrent = idx === activeAutoIndex;
                const isSelected = selectedStage.id === stage.id;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setInspectedStageId(stage.id)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50/50 ring-2 ring-blue-500/15'
                        : 'border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : isCurrent
                          ? stage.ringBg
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isCurrent ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {stage.shortLabel}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-700'
                              : isCurrent
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-200/70 text-slate-500'
                          }`}
                        >
                          {isDone ? 'Done' : isCurrent ? 'Active' : 'Queued'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {stage.metricPreview}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active / Selected Stage Detail Callout */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-blue-600">
                <Network className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {selectedStage.title}
                  </span>
                  {inspectedStageId && (
                    <button
                      type="button"
                      onClick={() => setInspectedStageId(null)}
                      className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer shrink-0"
                    >
                      Follow live step
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {selectedStage.detail}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matching Overview Skeleton Preview (prevents layout jump) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5" aria-hidden="true">
        {[
          { label: 'Verified Publications', icon: BookOpen },
          { label: 'Cumulative Citations', icon: Award },
          { label: 'Journal Quality Index', icon: Sparkles },
          { label: 'Collaborating Institutions', icon: Globe2 },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-2.5 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                  {card.label}
                </span>
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-300 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="h-7 w-20 rounded-md bg-slate-200/80" />
              <div className="h-3 w-28 rounded bg-slate-100" />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" aria-hidden="true">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 animate-pulse">
          <div className="h-4 w-44 rounded bg-slate-200/80" />
          <div className="h-40 w-full rounded-xl bg-slate-100" />
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 animate-pulse">
          <div className="h-4 w-40 rounded bg-slate-200/80" />
          <div className="space-y-2.5 pt-1">
            <div className="h-10 w-full rounded-xl bg-slate-100" />
            <div className="h-10 w-full rounded-xl bg-slate-100" />
            <div className="h-10 w-3/4 rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
};
