import React, { useMemo } from 'react';
import { ImageDown, Award, Users } from 'lucide-react';
import {
  ProfileStatistics,
  Quartile,
  PortfolioCategory,
  PublicationType,
  CountryCollaboration,
  JournalSummary,
  CoAuthorSummary,
} from '../utils/scholarAnalytics';

interface PortfolioBreakdownSectionProps {
  stats: ProfileStatistics;
  countries: CountryCollaboration[];
  journals?: JournalSummary[];
  coAuthors?: CoAuthorSummary[];
  onQuickFilterQuartile: (quartile: Quartile) => void;
  onQuickFilterType: (type: PublicationType) => void;
  onExportChartPng: (chartId: string, title: string, filename: string) => void;
}

const PORTFOLIO_CATEGORY_COLORS: Record<
  PortfolioCategory,
  { hex: string; label: string }
> = {
  Q1: { hex: '#2563eb', label: 'Q1 Journals' },
  Q2: { hex: '#059669', label: 'Q2 Journals' },
  Q3: { hex: '#d97706', label: 'Q3 Journals' },
  Q4: { hex: '#e11d48', label: 'Q4 Journals' },
  Conference: { hex: '#7c3aed', label: 'Conference' },
  'Non-Indexed': { hex: '#475569', label: 'Others' },
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
  journals = [],
  coAuthors = [],
  onQuickFilterQuartile,
  onQuickFilterType,
  onExportChartPng,
}) => {
  const topCoAuthors = useMemo(() => {
    if (!coAuthors) return [];
    return coAuthors.slice(0, 5);
  }, [coAuthors]);

  const topImpactJournals = useMemo(() => {
    if (!journals) return [];
    return journals
      .filter(
        (j) =>
          (j.type === 'Journal' || !j.type) &&
          j.impactFactor !== undefined &&
          j.impactFactor > 0
      )
      .sort(
        (a, b) =>
          (b.impactFactor || 0) - (a.impactFactor || 0) ||
          b.paperCount - a.paperCount ||
          b.totalCitations - a.totalCitations
      )
      .slice(0, 5);
  }, [journals]);
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

  // Yearly trend geometry (matched to Google Scholar yearly citation bar chart)
  const trendYears = stats.yearlyTrend.slice(-10);
  const pubTrendYears = (() => {
    const withPapers = stats.yearlyTrend.filter((y) => y.papers > 0);
    return (withPapers.length > 0 ? withPapers : stats.yearlyTrend).slice(-10);
  })();
  const maxYearCit = Math.max(1, ...trendYears.map((y) => y.citations));
  const maxYearPapers = Math.max(1, ...pubTrendYears.map((y) => y.papers));

  // Citation bracket max
  const maxBracketCount = Math.max(
    1,
    ...stats.citationBrackets.map((b) => b.count)
  );

  // Top countries max (highlight top 5 collaborating nations)
  const topCountries = countries.slice(0, 5);
  const maxCountryPapers = Math.max(
    1,
    ...topCountries.map((c) => c.paperCount)
  );

  return (
    <section
      id="charts"
      aria-label="Bibliometric Analytics Charts"
      className="scroll-mt-20 space-y-6"
    >
      {/* Row 1: Quartile & Indexing Donut Chart + Document Type Classification + Citation Impact Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart 1: 6-Category Portfolio Distribution Donut Chart (100% Total) */}
        <div
          id="chart-quartile-donut"
          className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Quartile &amp; Indexing Distribution
            </h2>
            <button
              type="button"
              onClick={() =>
                onExportChartPng(
                  'chart-quartile-donut',
                  'Quartile & Indexing Distribution',
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
              data-chart-svg="true"
              viewBox="0 0 360 220"
              className="w-full h-auto max-h-[220px] scholar-chart-svg"
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
                      {seg.pct}%
                    </text>
                  </g>
                ))}
              </g>
            </svg>
          </div>
        </div>

        {/* Chart 2: Document Type Classification */}
        <div
          id="chart-pub-types"
          className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Document Type Classification
            </h2>
            <button
              type="button"
              onClick={() =>
                onExportChartPng(
                  'chart-pub-types',
                  'Document Type Classification',
                  'document_type_classification.png'
                )
              }
              aria-label="Export Document Type Classification chart as PNG"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ImageDown className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
          </div>

          <div className="my-1">
            <svg
              data-chart-svg="true"
              viewBox="0 0 360 210"
              className="w-full h-auto max-h-[210px] scholar-chart-svg"
              role="img"
              aria-label="Document type classification horizontal bar chart"
            >
              {pubTypes.map((t, idx) => {
                const d = stats.typeBreakdown[t];
                const y = 18 + idx * 46;
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
                      {t === 'Conference' ? 'Conference Proceedings' : t}
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
                      height="11"
                      rx="4"
                      fill="#f1f5f9"
                    />
                    {barW > 0 && (
                      <rect
                        x="4"
                        y="18"
                        width={barW * (350 / 190)}
                        height="11"
                        rx="4"
                        fill={TYPE_COLORS[t]}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Chart 3: Citation Impact Distribution */}
        <div
          id="chart-citation-brackets"
          className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Citation Impact Distribution
            </h2>
            <button
              type="button"
              onClick={() =>
                onExportChartPng(
                  'chart-citation-brackets',
                  'Citation Impact Distribution',
                  'citation_impact_distribution.png'
                )
              }
              aria-label="Export Citation Impact Distribution chart as PNG"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ImageDown className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
          </div>

          <div className="my-1">
            <svg
              data-chart-svg="true"
              viewBox="0 0 360 210"
              className="w-full h-auto max-h-[210px] scholar-chart-svg"
              role="img"
              aria-label="Citation impact distribution column chart"
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
        </div>
      </div>

      {/* Row 2: Annual Citation & Publication Trajectory + Quartile Composition by Year + Leading Collaborating Nations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart 4: Annual Citation & Publication Trajectory */}
        <div
          id="chart-yearly-trend"
          className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Annual Citation &amp; Publication Trajectory
            </h2>
            <button
              type="button"
              onClick={() =>
                onExportChartPng(
                  'chart-yearly-trend',
                  'Annual Citation & Publication Trajectory',
                  'annual_citation_trajectory.png'
                )
              }
              aria-label="Export Annual Trajectory chart as PNG"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ImageDown className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
          </div>

          <div className="my-1">
            <svg
              data-chart-svg="true"
              viewBox="0 0 440 200"
              className="w-full h-auto max-h-[200px] scholar-chart-svg"
              role="img"
              aria-label="Annual citation and publication trajectory chart"
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

              {/* Baseline */}
              <line
                x1="20"
                y1="168"
                x2="424"
                y2="168"
                stroke="#cbd5e1"
                strokeWidth="1"
              />

              {/* Google Scholar Matched Annual Citation Bar Chart */}
              {trendYears.map((yr, idx) => {
                const count = trendYears.length;
                const plotW = 392;
                const slotW = plotW / Math.max(1, count);
                const barW = Math.min(24, Math.max(12, slotW * 0.62));
                const cx = 24 + idx * slotW + slotW / 2;
                const barH = Math.max(
                  yr.citations > 0 ? 4 : 0,
                  (yr.citations / maxYearCit) * 128
                );
                const topY = 168 - barH;
                const labelVal =
                  yr.citations >= 10000
                    ? `${(yr.citations / 1000).toFixed(0)}k`
                    : yr.citations >= 1000
                    ? `${(yr.citations / 1000).toFixed(1)}k`
                    : String(yr.citations);
                return (
                  <g key={`bar-${yr.year}`}>
                    <rect
                      x={cx - barW / 2}
                      y={topY}
                      width={barW}
                      height={barH}
                      rx="2.5"
                      fill="#1e40af"
                    />
                    <text
                      x={cx}
                      y={Math.max(14, topY - 6)}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {labelVal}
                    </text>
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
            </svg>
          </div>
        </div>

        {/* Chart 5: Quartile Composition by Year (Q1, Q2, Q3, Q4, Conference, Others) */}
        <div
          id="chart-quartile-yearly"
          className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Quartile Composition by Year
            </h2>
            <button
              type="button"
              onClick={() =>
                onExportChartPng(
                  'chart-quartile-yearly',
                  'Quartile Composition by Year',
                  'quartile_composition_by_year.png'
                )
              }
              aria-label="Export Quartile Composition by Year chart as PNG"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ImageDown className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
          </div>

          <div className="my-1">
            <svg
              data-chart-svg="true"
              viewBox="0 0 360 210"
              className="w-full h-auto max-h-[210px] scholar-chart-svg"
              role="img"
              aria-label="Quartile composition by year stacked bar chart"
            >
              <defs>
                {pubTrendYears.map((yr, idx) => {
                  const totalCount =
                    yr.q1Count +
                    yr.q2Count +
                    yr.q3Count +
                    yr.q4Count +
                    yr.conferenceCount +
                    yr.otherCount;
                  if (totalCount <= 0) return null;
                  const colW = Math.min(
                    26,
                    Math.floor(290 / Math.max(1, pubTrendYears.length)) - 6
                  );
                  const step = 310 / Math.max(1, pubTrendYears.length);
                  const x = 26 + idx * step;
                  const scaleH = 122 / maxYearPapers;
                  const totalH = totalCount * scaleH;
                  return (
                    <clipPath
                      key={`clip-yearly-${yr.year}`}
                      id={`clip-yearly-bar-${yr.year}`}
                    >
                      <rect
                        x={x}
                        y={158 - totalH}
                        width={colW}
                        height={totalH}
                        rx="2"
                        ry="2"
                      />
                    </clipPath>
                  );
                })}
              </defs>
              <line
                x1="18"
                y1="158"
                x2="345"
                y2="158"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              {pubTrendYears.map((yr, idx) => {
                const totalCount =
                  yr.q1Count +
                  yr.q2Count +
                  yr.q3Count +
                  yr.q4Count +
                  yr.conferenceCount +
                  yr.otherCount;
                const colW = Math.min(
                  26,
                  Math.floor(290 / Math.max(1, pubTrendYears.length)) - 6
                );
                const step = 310 / Math.max(1, pubTrendYears.length);
                const x = 26 + idx * step;
                const scaleH = 122 / maxYearPapers;
                const totalH = totalCount * scaleH;

                const segments = [
                  {
                    count: yr.q1Count,
                    color: PORTFOLIO_CATEGORY_COLORS.Q1.hex,
                    label: 'Q1',
                  },
                  {
                    count: yr.q2Count,
                    color: PORTFOLIO_CATEGORY_COLORS.Q2.hex,
                    label: 'Q2',
                  },
                  {
                    count: yr.q3Count,
                    color: PORTFOLIO_CATEGORY_COLORS.Q3.hex,
                    label: 'Q3',
                  },
                  {
                    count: yr.q4Count,
                    color: PORTFOLIO_CATEGORY_COLORS.Q4.hex,
                    label: 'Q4',
                  },
                  {
                    count: yr.conferenceCount,
                    color: PORTFOLIO_CATEGORY_COLORS.Conference.hex,
                    label: 'Conference',
                  },
                  {
                    count: yr.otherCount,
                    color: PORTFOLIO_CATEGORY_COLORS['Non-Indexed'].hex,
                    label: 'Others',
                  },
                ];

                let curY = 158;
                return (
                  <g key={`stack-${yr.year}`}>
                    {totalCount > 0 && (
                      <text
                        x={x + colW / 2}
                        y={Math.max(14, 158 - totalH - 4)}
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {totalCount}
                      </text>
                    )}
                    <g clipPath={`url(#clip-yearly-bar-${yr.year})`}>
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
                            height={h}
                            fill={s.color}
                          >
                            <title>{`${yr.year} — ${s.label}: ${s.count}`}</title>
                          </rect>
                        );
                      })}
                    </g>
                    <text
                      x={x + colW / 2}
                      y="174"
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

              {/* Embedded SVG Legend for Q1, Q2, Q3, Q4, Conference, Others */}
              <line
                x1="18"
                y1="184"
                x2="345"
                y2="184"
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              {[
                { label: 'Q1', color: PORTFOLIO_CATEGORY_COLORS.Q1.hex, x: 18 },
                { label: 'Q2', color: PORTFOLIO_CATEGORY_COLORS.Q2.hex, x: 60 },
                { label: 'Q3', color: PORTFOLIO_CATEGORY_COLORS.Q3.hex, x: 102 },
                { label: 'Q4', color: PORTFOLIO_CATEGORY_COLORS.Q4.hex, x: 144 },
                {
                  label: 'Conference',
                  color: PORTFOLIO_CATEGORY_COLORS.Conference.hex,
                  x: 186,
                },
                {
                  label: 'Others',
                  color: PORTFOLIO_CATEGORY_COLORS['Non-Indexed'].hex,
                  x: 274,
                },
              ].map((item) => (
                <g key={item.label} transform={`translate(${item.x}, 193)`}>
                  <rect
                    x="0"
                    y="0"
                    width="8"
                    height="8"
                    rx="1.5"
                    fill={item.color}
                  />
                  <text
                    x="12"
                    y="7.5"
                    fill="#475569"
                    fontSize="9.5"
                    fontWeight="600"
                  >
                    {item.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Chart 6: Leading Collaborating Nations */}
        <div
          id="chart-top-countries"
          className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Leading Collaborating Nations
            </h2>
            <button
              type="button"
              onClick={() =>
                onExportChartPng(
                  'chart-top-countries',
                  'Leading Collaborating Nations',
                  'leading_collaborating_nations.png'
                )
              }
              aria-label="Export Leading Collaborating Nations chart as PNG"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ImageDown className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
          </div>

          <div className="my-1">
            <svg
              data-chart-svg="true"
              viewBox="0 0 280 200"
              className="w-full h-auto max-h-[200px] scholar-chart-svg"
              role="img"
              aria-label="Leading collaborating nations bar chart"
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
                      fill="#0ea5e9"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Chart 7: High-Impact Publishing Venues */}
        {topImpactJournals.length > 0 && (
          <div
            id="chart-top-impact-journals"
            className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Award className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  High-Impact Publishing Venues
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  onExportChartPng(
                    'chart-top-impact-journals',
                    'High-Impact Publishing Venues',
                    'high_impact_publishing_venues.png'
                  )
                }
                aria-label="Export High-Impact Publishing Venues chart as PNG"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ImageDown className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>
            </div>

            <div className="my-1 overflow-x-auto">
              <svg
                data-chart-svg="true"
                viewBox="0 0 420 250"
                className="w-full h-auto min-w-[320px] max-h-[250px] scholar-chart-svg"
                role="img"
                aria-label="High-Impact Publishing Venues horizontal bar chart"
              >
                {topImpactJournals.map((j, idx) => {
                  const maxIf = topImpactJournals[0]?.impactFactor || 10;
                  const ifVal = j.impactFactor || 0;
                  const barMaxW = 384;
                  const barW = Math.max(14, (ifVal / maxIf) * barMaxW);
                  const y = 6 + idx * 48;
                  const rankColors = [
                    '#2563eb',
                    '#059669',
                    '#0d9488',
                    '#4f46e5',
                    '#7c3aed',
                  ];
                  const barColor = rankColors[idx % rankColors.length];

                  return (
                    <g key={j.venue} transform={`translate(0, ${y})`}>
                      {/* 1. Rank Badge */}
                      <rect
                        x="4"
                        y="2"
                        width="22"
                        height="18"
                        rx="4"
                        fill="#f1f5f9"
                      />
                      <text
                        x="15"
                        y="15"
                        fill="#334155"
                        fontSize="10.5"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        #{idx + 1}
                      </text>

                      {/* 2. Venue Name */}
                      <text
                        x="32"
                        y="15.5"
                        fill="#0f172a"
                        fontSize="12"
                        fontWeight="700"
                      >
                        {j.venue.length > 22 ? j.venue.slice(0, 21) + '…' : j.venue}
                      </text>

                      {/* 3. Quartile Pill */}
                      <rect
                        x="192"
                        y="2.5"
                        width="28"
                        height="17"
                        rx="3.5"
                        fill={j.quartile === 'Q1' ? '#eff6ff' : j.quartile === 'Q2' ? '#ecfdf5' : j.quartile === 'Q3' ? '#fffbeb' : '#fef2f2'}
                      />
                      <text
                        x="206"
                        y="14.5"
                        fill={j.quartile === 'Q1' ? '#1d4ed8' : j.quartile === 'Q2' ? '#047857' : j.quartile === 'Q3' ? '#b45309' : '#b91c1c'}
                        fontSize="9.5"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {j.quartile}
                      </text>

                      {/* 4. Clarivate JIF Metric Badge */}
                      <rect
                        x="226"
                        y="2.5"
                        width="54"
                        height="17"
                        rx="3.5"
                        fill="#f8fafc"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                      <text
                        x="253"
                        y="14.5"
                        fill="#0f172a"
                        fontSize="9.5"
                        fontWeight="700"
                        fontFamily="JetBrains Mono, monospace"
                        textAnchor="middle"
                      >
                        IF {ifVal.toFixed(1)}
                      </text>

                      {/* 5. Publications & Citations */}
                      <text
                        x="416"
                        y="15"
                        fill="#64748b"
                        fontSize="10"
                        fontWeight="500"
                        textAnchor="end"
                      >
                        {j.paperCount} {j.paperCount === 1 ? 'pub' : 'pubs'} · {j.totalCitations.toLocaleString()} cites
                      </text>

                      {/* Row 2: Full-Width Prominent Impact Bar Track & Fill */}
                      <rect
                        x="32"
                        y="25"
                        width={barMaxW}
                        height="9"
                        rx="4.5"
                        fill="#f1f5f9"
                      />
                      <rect
                        x="32"
                        y="25"
                        width={barW}
                        height="9"
                        rx="4.5"
                        fill={barColor}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Chart 8: Leading Co-Authors */}
        {topCoAuthors.length > 0 && (
          <div
            id="chart-leading-coauthors"
            className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Leading Co-Authors
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  onExportChartPng(
                    'chart-leading-coauthors',
                    'Leading Co-Authors',
                    'leading_coauthors.png'
                  )
                }
                aria-label="Export Leading Co-Authors chart as PNG"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ImageDown className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>
            </div>

            <div className="my-1 overflow-x-auto">
              <svg
                data-chart-svg="true"
                viewBox="0 0 420 250"
                className="w-full h-auto min-w-[320px] max-h-[250px] scholar-chart-svg"
                role="img"
                aria-label="Leading Co-Authors horizontal bar chart"
              >
                {topCoAuthors.map((ca, idx) => {
                  const maxPapers = Math.max(1, topCoAuthors[0]?.paperCount || 1);
                  const barMaxW = 384;
                  const barW = Math.max(14, (ca.paperCount / maxPapers) * barMaxW);
                  const y = 6 + idx * 48;
                  const coColors = [
                    '#059669',
                    '#0d9488',
                    '#2563eb',
                    '#4f46e5',
                    '#7c3aed',
                  ];
                  const barColor = coColors[idx % coColors.length];

                  return (
                    <g key={ca.name} transform={`translate(0, ${y})`}>
                      {/* 1. Rank Badge */}
                      <rect
                        x="4"
                        y="2"
                        width="22"
                        height="18"
                        rx="4"
                        fill="#f1f5f9"
                      />
                      <text
                        x="15"
                        y="15"
                        fill="#334155"
                        fontSize="10.5"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        #{idx + 1}
                      </text>

                      {/* 2. Co-Author Name */}
                      <text
                        x="32"
                        y="15.5"
                        fill="#0f172a"
                        fontSize="12"
                        fontWeight="700"
                      >
                        {ca.name.length > 20 ? ca.name.slice(0, 19) + '…' : ca.name}
                      </text>

                      {/* 3. Institution / Country Badge */}
                      <rect
                        x="190"
                        y="2.5"
                        width="92"
                        height="17"
                        rx="3.5"
                        fill="#f8fafc"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                      <text
                        x="236"
                        y="14.5"
                        fill="#475569"
                        fontSize="9"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {(ca.universityName || ca.country || 'Collaborator').length > 15
                          ? (ca.universityName || ca.country || 'Collaborator').slice(0, 14) + '…'
                          : ca.universityName || ca.country || 'Collaborator'}
                      </text>

                      {/* 4. Collaboration Metrics */}
                      <text
                        x="416"
                        y="15"
                        fill="#64748b"
                        fontSize="10"
                        fontWeight="500"
                        textAnchor="end"
                      >
                        {ca.paperCount} {ca.paperCount === 1 ? 'pub' : 'pubs'} · {ca.totalCitations.toLocaleString()} cites
                      </text>

                      {/* Row 2: Full-Width Prominent Collaboration Bar Track & Fill */}
                      <rect
                        x="32"
                        y="25"
                        width={barMaxW}
                        height="9"
                        rx="4.5"
                        fill="#f1f5f9"
                      />
                      <rect
                        x="32"
                        y="25"
                        width={barW}
                        height="9"
                        rx="4.5"
                        fill={barColor}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
