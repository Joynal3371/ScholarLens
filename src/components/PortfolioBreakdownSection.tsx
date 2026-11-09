import React from 'react';
import { ImageDown } from 'lucide-react';
import {
  ProfileStatistics,
  Quartile,
  PortfolioCategory,
  PublicationType,
  CountryCollaboration,
} from '../utils/scholarAnalytics';

interface PortfolioBreakdownSectionProps {
  stats: ProfileStatistics;
  countries: CountryCollaboration[];
  onQuickFilterQuartile: (quartile: Quartile) => void;
  onQuickFilterType: (type: PublicationType) => void;
  onExportChartPng: (chartId: string, title: string, filename: string) => void;
}

const PORTFOLIO_CATEGORY_COLORS: Record<
  PortfolioCategory,
  { hex: string; label: string }
> = {
  Q1: { hex: '#2563eb', label: 'Q1 Journals' },
  Q2: { hex: '#0ea5e9', label: 'Q2 Journals' },
  Q3: { hex: '#f59e0b', label: 'Q3 Journals' },
  Q4: { hex: '#94a3b8', label: 'Q4 Journals' },
  Conference: { hex: '#4f46e5', label: 'Conference Papers' },
  'Non-Indexed': { hex: '#64748b', label: 'Non-Indexed Papers' },
};

const TYPE_COLORS: Record<PublicationType, string> = {
  Journal: '#2563eb',
  Conference: '#4f46e5',
  Review: '#0d9488',
  'Book Chapter': '#d97706',
  Preprint: '#64748b',
};

export const PortfolioBreakdownSection: React.FC<
  PortfolioBreakdownSectionProps
> = ({
  stats,
  countries,
  onQuickFilterQuartile,
  onQuickFilterType,
  onExportChartPng,
}) => {
  const portfolioCategories: PortfolioCategory[] = [
    'Q1',
    'Q2',
    'Q3',
    'Q4',
    'Conference',
    'Non-Indexed',
  ];
  const pubTypes: PublicationType[] = [
    'Journal',
    'Conference',
    'Review',
    'Book Chapter',
    'Preprint',
  ];

  // Donut Chart Geometry (6 categories summing to 100.0%)
  const R = 70;
  const CIRC = 2 * Math.PI * R;
  let cumulativePct = 0;
  const donutSegments = portfolioCategories.map((cat) => {
    const pct = stats.portfolioDistribution[cat].percentage;
    const len = (pct / 100) * CIRC;
    const offset = -((cumulativePct / 100) * CIRC);
    cumulativePct += pct;
    return {
      key: cat,
      pct,
      count: stats.portfolioDistribution[cat].count,
      len,
      offset,
      color: PORTFOLIO_CATEGORY_COLORS[cat].hex,
      label: PORTFOLIO_CATEGORY_COLORS[cat].label,
    };
  });

  // Yearly trend geometry
  const trendYears = stats.yearlyTrend.slice(-10);
  const maxYearCit = Math.max(1, ...trendYears.map((y) => y.citations));
  const maxYearPapers = Math.max(1, ...trendYears.map((y) => y.papers));

  // Citation bracket max
  const maxBracketCount = Math.max(
    1,
    ...stats.citationBrackets.map((b) => b.count)
  );

  // Top countries max
  const topCountries = countries.slice(0, 6);
  const maxCountryPapers = Math.max(
    1,
    ...topCountries.map((c) => c.paperCount)
  );

  return (
    <section
      id="charts"
      aria-label="Visual Statistical Charts"
      className="scroll-mt-20 space-y-6"
    >
      {/* Row 1: Quartile & Indexing Donut Chart + Publication Types Bar Chart + Citation Brackets Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart 1: 6-Category Portfolio Distribution Donut Chart (100% Total) */}
        <div
          id="chart-quartile-donut"
          className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Quartile &amp; Indexing Distribution (100%)
              </h2>
              <p className="text-xs text-slate-500">
                Q1, Q2, Q3, Q4, Conferences &amp; Non-Indexed ({stats.totalPapers} papers)
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onExportChartPng(
                  'chart-quartile-donut',
                  'Quartile & Indexing Distribution (100%)',
                  'quartile_distribution_chart.png'
                )
              }
              aria-label="Export Quartile Distribution chart as PNG"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ImageDown className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
          </div>

          <div className="flex items-center justify-center my-1">
            <svg
              viewBox="0 0 360 220"
              className="w-full h-auto max-h-[220px]"
              role="img"
              aria-label="Quartile and indexing distribution donut chart"
            >
              {/* Donut Ring on Left */}
              <g transform="translate(92, 110)">
                <circle
                  r={R}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="22"
                />
                {donutSegments.map((seg) =>
                  seg.pct > 0 ? (
                    <circle
                      key={seg.key}
                      r={R}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="22"
                      strokeDasharray={`${seg.len} ${CIRC}`}
                      strokeDashoffset={seg.offset}
                      transform="rotate(-90)"
                    />
                  ) : null
                )}
                <text
                  x="0"
                  y="-4"
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="19"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {stats.portfolioDistribution.Q1.percentage}%
                </text>
                <text
                  x="0"
                  y="14"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontWeight="500"
                >
                  Q1 Share
                </text>
              </g>

              {/* Legend on Right inside SVG so PNG export captures all 6 categories */}
              <g transform="translate(184, 14)">
                {donutSegments.map((seg, i) => (
                  <g
                    key={seg.key}
                    transform={`translate(0, ${i * 33})`}
                    className="cursor-pointer"
                    onClick={() => {
                      if (
                        seg.key === 'Q1' ||
                        seg.key === 'Q2' ||
                        seg.key === 'Q3' ||
                        seg.key === 'Q4'
                      ) {
                        onQuickFilterQuartile(seg.key);
                      } else if (seg.key === 'Conference') {
                        onQuickFilterType('Conference');
                      } else {
                        onQuickFilterQuartile('Unranked');
                      }
                    }}
                  >
                    <rect
                      x="0"
                      y="2"
                      width="10"
                      height="10"
                      rx="2"
                      fill={seg.color}
                    />
                    <text
                      x="16"
                      y="11"
                      fill="#0f172a"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {seg.label}
                    </text>
                    <text
                      x="16"
                      y="23"
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {seg.pct}% ({seg.count} papers)
                    </text>
                  </g>
                ))}
              </g>
            </svg>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Portfolio Coverage</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              100.0% ({stats.totalPapers} papers)
            </span>
          </div>
        </div>

        {/* Chart 2: Publication Types Horizontal Bar Graph */}
        <div
          id="chart-pub-types"
          className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Publication Types Breakdown
              </h2>
              <p className="text-xs text-slate-500">
                Journals, conferences, reviews &amp; preprints
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onExportChartPng(
                  'chart-pub-types',
                  'Publication Types Breakdown',
                  'publication_types_chart.png'
                )
              }
              aria-label="Export Publication Types chart as PNG"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ImageDown className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
          </div>

          <div className="my-1">
            <svg
              viewBox="0 0 360 210"
              className="w-full h-auto max-h-[210px]"
              role="img"
              aria-label="Publication types horizontal bar chart"
            >
              {pubTypes.map((t, idx) => {
                const d = stats.typeBreakdown[t];
                const y = 14 + idx * 39;
                const barW = Math.max(
                  d.count > 0 ? 6 : 0,
                  (d.percentageOfTotal / 100) * 190
                );
                return (
                  <g
                    key={t}
                    transform={`translate(0, ${y})`}
                    className="cursor-pointer"
                    onClick={() => onQuickFilterType(t)}
                  >
                    <text
                      x="4"
                      y="12"
                      fill="#0f172a"
                      fontSize="11.5"
                      fontWeight="600"
                    >
                      {t}
                    </text>
                    <text
                      x="354"
                      y="12"
                      textAnchor="end"
                      fill="#475569"
                      fontSize="11"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {d.count} ({d.percentageOfTotal}%)
                    </text>
                    <rect
                      x="4"
                      y="18"
                      width="350"
                      height="10"
                      rx="4"
                      fill="#f1f5f9"
                    />
                    {barW > 0 && (
                      <rect
                        x="4"
                        y="18"
                        width={barW * (350 / 190)}
                        height="10"
                        rx="4"
                        fill={TYPE_COLORS[t]}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Lead / Corresponding Author</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {stats.firstOrCorrespondingPercentage}% ({stats.firstOrCorrespondingCount}/{stats.totalPapers})
            </span>
          </div>
        </div>

        {/* Chart 3: Citation Range Brackets Column Chart */}
        <div
          id="chart-citation-brackets"
          className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Citation Distribution Histogram
              </h2>
              <p className="text-xs text-slate-500">
                Papers grouped by citation-count range
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onExportChartPng(
                  'chart-citation-brackets',
                  'Citation Distribution Histogram',
                  'citation_distribution_histogram.png'
                )
              }
              aria-label="Export Citation Distribution chart as PNG"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ImageDown className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
          </div>

          <div className="my-1">
            <svg
              viewBox="0 0 360 210"
              className="w-full h-auto max-h-[210px]"
              role="img"
              aria-label="Citation distribution column chart"
            >
              {/* Baseline */}
              <line
                x1="20"
                y1="172"
                x2="345"
                y2="172"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              {stats.citationBrackets.map((b, i) => {
                const colW = 42;
                const gap = 22;
                const x = 28 + i * (colW + gap);
                const barH = Math.max(
                  b.count > 0 ? 8 : 2,
                  (b.count / maxBracketCount) * 128
                );
                const y = 172 - barH;
                return (
                  <g key={b.label}>
                    <rect
                      x={x}
                      y={y}
                      width={colW}
                      height={barH}
                      rx="4"
                      fill="#2563eb"
                    />
                    <text
                      x={x + colW / 2}
                      y={y - 6}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {b.count}
                    </text>
                    <text
                      x={x + colW / 2}
                      y="190"
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {b.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Median / Mean Citations</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {stats.medianCitationsPerPaper.toLocaleString()} /{' '}
              {stats.meanCitationsPerPaper.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Annual Citations & Publications Trend Graph + Yearly Quartile Stacked Bar Chart + Top Countries Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart 4: Annual Citations & Output Trend Graph (Area + Bar) */}
        <div
          id="chart-yearly-trend"
          className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Yearly Citations &amp; Publication Trend
              </h2>
              <p className="text-xs text-slate-500">
                Line shows total citations; bars show papers published per year
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onExportChartPng(
                  'chart-yearly-trend',
                  'Yearly Citations & Publication Trend',
                  'yearly_citation_trend.png'
                )
              }
              aria-label="Export Yearly Trend chart as PNG"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ImageDown className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
          </div>

          <div className="my-1">
            <svg
              viewBox="0 0 440 200"
              className="w-full h-auto max-h-[200px]"
              role="img"
              aria-label="Yearly citations and publications trend chart"
            >
              {/* Grid lines */}
              {[40, 85, 130, 168].map((gy) => (
                <line
                  key={gy}
                  x1="24"
                  y1={gy}
                  x2="420"
                  y2={gy}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
              ))}

              {/* Publication Bars */}
              {trendYears.map((yr, idx) => {
                const step =
                  trendYears.length > 1
                    ? 360 / (trendYears.length - 1)
                    : 180;
                const cx = 42 + idx * step;
                const barH = (yr.papers / maxYearPapers) * 75;
                return (
                  <g key={`bar-${yr.year}`}>
                    <rect
                      x={cx - 10}
                      y={168 - barH}
                      width="20"
                      height={barH}
                      rx="3"
                      fill="#cbd5e1"
                    />
                    <text
                      x={cx}
                      y="186"
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {yr.year}
                    </text>
                  </g>
                );
              })}

              {/* Citation Line & Points */}
              {trendYears.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  points={trendYears
                    .map((yr, idx) => {
                      const step = 360 / (trendYears.length - 1);
                      const cx = 42 + idx * step;
                      const cy = 162 - (yr.citations / maxYearCit) * 124;
                      return `${cx},${cy}`;
                    })
                    .join(' ')}
                />
              )}

              {trendYears.map((yr, idx) => {
                const step =
                  trendYears.length > 1
                    ? 360 / (trendYears.length - 1)
                    : 180;
                const cx = 42 + idx * step;
                const cy = 162 - (yr.citations / maxYearCit) * 124;
                return (
                  <g key={`pt-${yr.year}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill="#ffffff"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                    />
                    <text
                      x={cx}
                      y={cy - 8}
                      textAnchor="middle"
                      fill="#1e3a8a"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {yr.citations >= 1000
                        ? `${(yr.citations / 1000).toFixed(1)}k`
                        : yr.citations}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Annual Citation Velocity</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {stats.annualCitationVelocity.toLocaleString()} citations / yr
            </span>
          </div>
        </div>

        {/* Chart 5: Yearly Quartile & Conference Stacked Bar Chart */}
        <div
          id="chart-quartile-yearly"
          className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Quartile Mix by Year
              </h2>
              <p className="text-xs text-slate-500">
                Stacked composition of Q1–Q4 &amp; conferences
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onExportChartPng(
                  'chart-quartile-yearly',
                  'Quartile Mix by Year',
                  'quartile_mix_by_year.png'
                )
              }
              aria-label="Export Quartile Mix by Year chart as PNG"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ImageDown className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
          </div>

          <div className="my-1">
            <svg
              viewBox="0 0 360 200"
              className="w-full h-auto max-h-[200px]"
              role="img"
              aria-label="Quartile mix by year stacked bar chart"
            >
              <line
                x1="18"
                y1="168"
                x2="345"
                y2="168"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              {trendYears.map((yr, idx) => {
                const colW = Math.min(
                  26,
                  Math.floor(290 / Math.max(1, trendYears.length)) - 6
                );
                const step = 310 / Math.max(1, trendYears.length);
                const x = 26 + idx * step;
                const scaleH = 130 / maxYearPapers;

                const segments = [
                  { count: yr.q1Count, color: '#2563eb' },
                  { count: yr.q2Count, color: '#0ea5e9' },
                  { count: yr.q3Count, color: '#f59e0b' },
                  { count: yr.q4Count, color: '#94a3b8' },
                  {
                    count: yr.conferenceCount + yr.otherCount,
                    color: '#6366f1',
                  },
                ];

                let curY = 168;
                return (
                  <g key={`stack-${yr.year}`}>
                    {segments.map((s, sIdx) => {
                      if (s.count <= 0) return null;
                      const h = s.count * scaleH;
                      curY -= h;
                      return (
                        <rect
                          key={sIdx}
                          x={x}
                          y={curY}
                          width={colW}
                          height={Math.max(2, h - 1)}
                          rx="1.5"
                          fill={s.color}
                        />
                      );
                    })}
                    <text
                      x={x + colW / 2}
                      y="185"
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="9.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {String(yr.year).slice(-2)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-blue-600 inline-block" />
                Q1
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-sky-500 inline-block" />
                Q2
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-amber-500 inline-block" />
                Q3
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-indigo-500 inline-block" />
                Conf
              </span>
            </div>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {trendYears.length} yrs
            </span>
          </div>
        </div>

        {/* Chart 6: Top Collaborating Countries Bar Chart */}
        <div
          id="chart-top-countries"
          className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Top Partner Countries
              </h2>
              <p className="text-xs text-slate-500">
                By collaborative paper count
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onExportChartPng(
                  'chart-top-countries',
                  'Top Collaborating Countries',
                  'top_collaborating_countries.png'
                )
              }
              aria-label="Export Top Partner Countries chart as PNG"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ImageDown className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
          </div>

          <div className="my-1">
            <svg
              viewBox="0 0 280 200"
              className="w-full h-auto max-h-[200px]"
              role="img"
              aria-label="Top collaborating countries bar chart"
            >
              {topCountries.map((c, idx) => {
                const y = 8 + idx * 32;
                const barW = Math.max(
                  10,
                  (c.paperCount / maxCountryPapers) * 165
                );
                return (
                  <g key={c.country} transform={`translate(0, ${y})`}>
                    <text
                      x="2"
                      y="11"
                      fill="#0f172a"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {c.country}
                    </text>
                    <text
                      x="276"
                      y="11"
                      textAnchor="end"
                      fill="#475569"
                      fontSize="10.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {c.paperCount} ({c.percentageOfTotalPapers}%)
                    </text>
                    <rect
                      x="2"
                      y="16"
                      width="274"
                      height="8"
                      rx="3"
                      fill="#f1f5f9"
                    />
                    <rect
                      x="2"
                      y="16"
                      width={barW * (274 / 165)}
                      height="8"
                      rx="3"
                      fill="#0f172a"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>International Share</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {stats.internationalCollabPercentage}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
