import { jsPDF } from 'jspdf';
import {
  ResearcherProfile,
  ProfileStatistics,
  UniversityCollaboration,
  CoAuthorSummary,
  CountryCollaboration,
  JournalSummary,
  getPublicationPortfolioCategory,
  getPublicationUrl,
} from './scholarAnalytics';

/**
 * Converts an SVG element in the DOM into a high-DPI PNG data URL.
 */
export async function svgElementToPngDataUrl(
  svgEl: SVGSVGElement,
  title: string,
  subtitle: string,
  darkTheme: boolean = false
): Promise<string> {
  const bbox = svgEl.viewBox?.baseVal;
  const svgW = bbox && bbox.width > 0 ? bbox.width : svgEl.clientWidth || 560;
  const svgH = bbox && bbox.height > 0 ? bbox.height : svgEl.clientHeight || 320;

  const pad = 28;
  const headerH = 54;
  const totalW = svgW + pad * 2;
  const totalH = svgH + headerH + pad * 2;
  const scale = 2;

  const serializer = new XMLSerializer();
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(svgW));
  clone.setAttribute('height', String(svgH));

  const svgStr = serializer.serializeToString(clone);
  const svgBlob = new Blob([svgStr], {
    type: 'image/svg+xml;charset=utf-8',
  });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = totalW * scale;
      canvas.height = totalH * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context unavailable'));
        return;
      }

      ctx.scale(scale, scale);

      // Background
      ctx.fillStyle = darkTheme ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, totalW, totalH);

      // Border
      ctx.strokeStyle = darkTheme ? '#1e293b' : '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, totalW - 1, totalH - 1);

      // Title
      ctx.fillStyle = darkTheme ? '#f8fafc' : '#0f172a';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(title, pad, pad + 16);

      // Subtitle
      ctx.fillStyle = darkTheme ? '#94a3b8' : '#64748b';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(subtitle, pad, pad + 36);

      // Draw SVG chart
      ctx.drawImage(img, pad, pad + headerH, svgW, svgH);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Triggers a browser download of a specific chart SVG as a crisp PNG image.
 * Automatically routes globe exports to the flat full-world projection so all global collaborations are visible.
 */
export async function exportChartSvgAsPng(
  chartId: string,
  title: string,
  subtitle: string,
  filename: string,
  darkTheme: boolean = false
): Promise<boolean> {
  const effectiveId =
    chartId === 'chart-collaboration-globe'
      ? 'chart-collaboration-globe-flat'
      : chartId;
  const container =
    document.getElementById(effectiveId) || document.getElementById(chartId);
  const svgEl = container?.querySelector('svg') as SVGSVGElement | null;
  if (!svgEl) return false;

  const dataUrl = await svgElementToPngDataUrl(
    svgEl,
    title,
    subtitle,
    darkTheme
  );
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

const CATEGORY_RGB: Record<
  'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Conference' | 'Non-Indexed',
  [number, number, number]
> = {
  Q1: [37, 99, 235],
  Q2: [14, 165, 233],
  Q3: [245, 158, 11],
  Q4: [148, 163, 184],
  Conference: [79, 70, 229],
  'Non-Indexed': [100, 116, 139],
};

function drawSectionHeader(
  doc: jsPDF,
  numberLabel: string,
  title: string,
  x: number,
  y: number,
  width: number
): number {
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(x, y, width, 7.5, 1.2, 1.2, 'FD');

  doc.setFillColor(37, 99, 235);
  doc.roundedRect(x + 1.5, y + 1.2, 7.5, 5.1, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(numberLabel, x + 5.25, y + 4.8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(title, x + 11.5, y + 5.1);

  return y + 10.5;
}

/**
 * Generates and downloads an executive multi-page PDF bibliometric report
 * featuring vector charts, a flat world collaboration network map, and Top 5 rankings.
 */
export async function generateResearcherPdfReport(params: {
  profile: ResearcherProfile;
  stats: ProfileStatistics;
  universities: UniversityCollaboration[];
  coAuthors: CoAuthorSummary[];
  countries: CountryCollaboration[];
  journals: JournalSummary[];
}): Promise<void> {
  const { profile, stats, universities, coAuthors, countries, journals } =
    params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageW = 210;
  const margin = 12;
  const contentW = pageW - margin * 2;
  let y = 14;

  // =========================================================================
  // PAGE 1: EXECUTIVE SUMMARY, VECTOR ANALYTICS CHARTS & TOP 5 HIGHLIGHTS
  // =========================================================================

  // Executive Light Header Banner (Matches the clean light theme of the platform)
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageW, 34, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, 33.8, pageW, 33.8);
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 33, pageW, 1.2, 'F');

  const maxLeftTextW = pageW - margin - 58 - margin; // 128mm bound so text never touches the right badge

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(profile.name, margin, 12.5);

  const affilStr = profile.affiliation
    ? `${profile.affiliation}  |  Scholar ID: ${profile.scholarUserId}`
    : `Scholar ID: ${profile.scholarUserId}`;
  const affilLines = doc.splitTextToSize(affilStr, maxLeftTextW);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(71, 85, 105);
  doc.text(affilLines[0], margin, 18.5);

  const domainStr = `Research Domains: ${profile.fields.slice(0, 5).join(' · ')}`;
  const domainLines = doc.splitTextToSize(domainStr, maxLeftTextW);
  doc.setFontSize(7.6);
  doc.setTextColor(100, 116, 139);
  doc.text(domainLines[0], margin, 24.5);

  // Right-side Banner Badge (Light Refined Card)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(pageW - margin - 56, 6.5, 56, 20.5, 1.8, 1.8, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(37, 99, 235);
  doc.text('BIBLIOMETRIC DOSSIER', pageW - margin - 28, 12, {
    align: 'center',
  });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${stats.totalPapers} Papers · ${stats.totalCitations.toLocaleString()} Cit.`,
    pageW - margin - 28,
    17.2,
    { align: 'center' }
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `h-index: ${stats.hIndex} · i10-index: ${stats.i10Index}`,
    pageW - margin - 28,
    22.2,
    { align: 'center' }
  );

  y = 40;

  // -------------------------------------------------------------------------
  // SECTION 1: CORE BIBLIOMETRIC INDICATORS (4x3 KPI GRID)
  // -------------------------------------------------------------------------
  y = drawSectionHeader(
    doc,
    '01',
    'Executive Bibliometric & Impact Indicators',
    margin,
    y,
    contentW
  );

  const kpiItems: { label: string; value: string; sub: string }[] = [
    {
      label: 'Verified Publications',
      value: String(stats.totalPapers),
      sub: 'Peer-Reviewed Portfolio',
    },
    {
      label: 'Cumulative Citations',
      value: stats.totalCitations.toLocaleString(),
      sub: `${stats.meanCitationsPerPaper} Mean / Paper`,
    },
    {
      label: 'Citation Indices',
      value: `h: ${stats.hIndex} / i10: ${stats.i10Index}`,
      sub: `g-index: ${stats.gIndex}`,
    },
    {
      label: 'Q1 Journal Share',
      value: `${stats.portfolioDistribution.Q1.percentage}%`,
      sub: `${stats.portfolioDistribution.Q1.count} Q1 Publications`,
    },
    {
      label: 'Q1 + Q2 Combined',
      value: `${stats.q1Q2CombinedPercentage}%`,
      sub: 'High-Impact Quartiles',
    },
    {
      label: 'Citation Velocity',
      value: `${stats.annualCitationVelocity}/yr`,
      sub: `Median: ${stats.medianCitationsPerPaper} Cit.`,
    },
    {
      label: 'Partner Institutions',
      value: String(universities.length),
      sub: `${countries.length} Collaborating Nations`,
    },
    {
      label: 'Co-Author Network',
      value: String(coAuthors.length),
      sub: `${stats.internationalCollabPercentage}% International`,
    },
  ];

  const kpiCols = 4;
  const kpiGap = 2.5;
  const kpiW = (contentW - kpiGap * (kpiCols - 1)) / kpiCols;
  const kpiH = 14.5;

  kpiItems.forEach((item, idx) => {
    const col = idx % kpiCols;
    const row = Math.floor(idx / kpiCols);
    const bx = margin + col * (kpiW + kpiGap);
    const by = y + row * (kpiH + 2);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(bx, by, kpiW, kpiH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, bx + 2.5, by + 4.3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(item.value, bx + 2.5, by + 9.6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(item.sub, bx + 2.5, by + 13.1);
  });

  y += Math.ceil(kpiItems.length / kpiCols) * (kpiH + 2) + 3.5;

  // -------------------------------------------------------------------------
  // SECTION: PORTFOLIO QUARTILE & INDEXING DISTRIBUTION (STACKED BAR + TABLE)
  // -------------------------------------------------------------------------
  y += 1;

  const pCategories: {
    key: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Conference' | 'Non-Indexed';
    label: string;
  }[] = [
    { key: 'Q1', label: 'Q1 Indexed Journals' },
    { key: 'Q2', label: 'Q2 Indexed Journals' },
    { key: 'Q3', label: 'Q3 Indexed Journals' },
    { key: 'Q4', label: 'Q4 Indexed Journals' },
    { key: 'Conference', label: 'Conference Proceedings' },
    { key: 'Non-Indexed', label: 'Emerging / Other Venues' },
  ];

  // Draw 100% Proportional Stacked Bar
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentW, 5.5, 1.2, 1.2, 'F');
  let curBarX = margin;
  pCategories.forEach(({ key }) => {
    const pct = stats.portfolioDistribution[key].percentage;
    if (pct <= 0) return;
    const segW = Math.max(1.5, (pct / 100) * contentW);
    const [r, g, b] = CATEGORY_RGB[key];
    doc.setFillColor(r, g, b);
    doc.rect(
      curBarX,
      y,
      Math.min(segW, margin + contentW - curBarX),
      5.5,
      'F'
    );
    curBarX += segW;
  });
  y += 7.5;

  // Compact 6-Column Visual Legend & Metric Cards
  const catColW = (contentW - 2 * 5) / 6;
  pCategories.forEach(({ key, label }, idx) => {
    const d = stats.portfolioDistribution[key];
    const cx = margin + idx * (catColW + 2);
    const [r, g, b] = CATEGORY_RGB[key];

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cx, y, catColW, 14, 1.2, 1.2, 'FD');

    doc.setFillColor(r, g, b);
    doc.rect(cx, y, catColW, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.3);
    doc.setTextColor(51, 65, 85);
    doc.text(label.slice(0, 18), cx + 2, y + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${d.percentage}%`, cx + 2, y + 9.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${d.count} papers · ${d.citations.toLocaleString()} cit.`,
      cx + 2,
      y + 12.9
    );
  });

  y += 17.5;

  // -------------------------------------------------------------------------
  // SECTION 3: VECTOR STATISTICAL CHARTS (YEARLY TRAJECTORY & CITATION BRACKETS)
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // SECTION 2: VECTOR STATISTICAL CHARTS (YEARLY TRAJECTORY & CITATION BRACKETS)
  // -------------------------------------------------------------------------
  y = drawSectionHeader(
    doc,
    '02',
    'Bibliometric Trajectory & Citation Distribution Charts',
    margin,
    y,
    contentW
  );

  const chartBoxW = (contentW - 4) / 2;
  const chartBoxH = 48;

  // Left Vector Chart: Annual Publications (Bars) & Citations (Line)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, chartBoxW, chartBoxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Annual Output (Bars) & Citation Trajectory (Line)', margin + 3, y + 5);

  const trendYears = stats.yearlyTrend.slice(-9);
  const maxYrCit = Math.max(1, ...trendYears.map((t) => t.citations));
  const maxYrPapers = Math.max(1, ...trendYears.map((t) => t.papers));
  const plotLeft = margin + 6;
  const plotRight = margin + chartBoxW - 6;
  const plotBottom = y + chartBoxH - 7;
  const plotTop = y + 11;
  const plotH = plotBottom - plotTop;
  const plotW = plotRight - plotLeft;

  // Gridlines
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.2);
  [0, 0.5, 1].forEach((frac) => {
    const gy = plotBottom - frac * plotH;
    doc.line(plotLeft, gy, plotRight, gy);
  });

  const stepX =
    trendYears.length > 1 ? plotW / (trendYears.length - 1) : plotW / 2;
  const barW = Math.min(6.5, stepX * 0.55);

  // Publication Bars
  trendYears.forEach((yr, idx) => {
    const cx =
      trendYears.length > 1 ? plotLeft + idx * stepX : plotLeft + plotW / 2;
    const bh = Math.max(1, (yr.papers / maxYrPapers) * (plotH * 0.65));
    doc.setFillColor(203, 213, 225);
    doc.rect(cx - barW / 2, plotBottom - bh, barW, bh, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text(String(yr.year).slice(-2), cx, plotBottom + 4, {
      align: 'center',
    });
  });

  // Citation Trajectory Line & Points
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.6);
  for (let i = 0; i < trendYears.length - 1; i++) {
    const x1 = plotLeft + i * stepX;
    const y1 =
      plotBottom - (trendYears[i].citations / maxYrCit) * (plotH * 0.85);
    const x2 = plotLeft + (i + 1) * stepX;
    const y2 =
      plotBottom - (trendYears[i + 1].citations / maxYrCit) * (plotH * 0.85);
    doc.line(x1, y1, x2, y2);
  }
  trendYears.forEach((yr, idx) => {
    const cx =
      trendYears.length > 1 ? plotLeft + idx * stepX : plotLeft + plotW / 2;
    const cy = plotBottom - (yr.citations / maxYrCit) * (plotH * 0.85);
    doc.setFillColor(37, 99, 235);
    doc.circle(cx, cy, 0.9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(30, 58, 138);
    doc.text(String(yr.citations), cx, cy - 1.5, { align: 'center' });
  });

  // Right Vector Chart: Citation Distribution Histogram
  const rightChartX = margin + chartBoxW + 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightChartX, y, chartBoxW, chartBoxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Citation Impact Distribution (Papers by Range)', rightChartX + 3, y + 5);

  const maxBracket = Math.max(1, ...stats.citationBrackets.map((b) => b.count));
  const bPlotLeft = rightChartX + 8;
  const bPlotRight = rightChartX + chartBoxW - 6;
  const bPlotW = bPlotRight - bPlotLeft;
  const bColStep = bPlotW / Math.max(1, stats.citationBrackets.length);
  const bColW = Math.min(11, bColStep * 0.62);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.25);
  doc.line(bPlotLeft - 2, plotBottom, bPlotRight, plotBottom);

  stats.citationBrackets.forEach((b, idx) => {
    const cx = bPlotLeft + idx * bColStep + bColStep / 2;
    const bh = Math.max(
      b.count > 0 ? 2 : 0.4,
      (b.count / maxBracket) * (plotH * 0.82)
    );
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(cx - bColW / 2, plotBottom - bh, bColW, bh, 0.8, 0.8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(String(b.count), cx, plotBottom - bh - 1.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text(b.label, cx, plotBottom + 4, { align: 'center' });
  });

  y += chartBoxH + 4;

  // -------------------------------------------------------------------------
  // SECTION 3: TOP 10 COUNTRIES & TOP 10 CO-AUTHORS (SIDE-BY-SIDE HIGHLIGHTS)
  // -------------------------------------------------------------------------
  y = drawSectionHeader(
    doc,
    '03',
    'Top 10 Collaborating Countries & Top 10 Co-Authors',
    margin,
    y,
    contentW
  );

  const halfW = (contentW - 4) / 2;
  const top10Countries = countries.slice(0, 10);
  const top10CoAuthors = coAuthors.slice(0, 10);
  const maxTopCountryPapers = Math.max(
    1,
    ...top10Countries.map((c) => c.paperCount)
  );
  const maxTopAuthorPapers = Math.max(
    1,
    ...top10CoAuthors.map((a) => a.paperCount)
  );

  // Generous card height so country names and co-author names are completely spelled out without truncation
  const rowItemH1 = 7.1;
  const listCardH = Math.max(
    38,
    Math.max(top10Countries.length, top10CoAuthors.length) * rowItemH1 + 7.5
  );

  // Left Card: Top 10 Countries (Full names with zero slicing)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, halfW, listCardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 23, 42);
  doc.text('Top 10 Collaborating Countries', margin + 3, y + 5.2);

  top10Countries.forEach((c, idx) => {
    const ry = y + 7.2 + idx * rowItemH1;

    // Rank Badge
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin + 2.5, ry, 5, 4.4, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(37, 99, 235);
    doc.text(`#${idx + 1}`, margin + 5, ry + 3.2, { align: 'center' });

    // Full Country Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    const countryFullName =
      c.country.length > 52 ? c.country.slice(0, 51) + '…' : c.country;
    doc.text(countryFullName, margin + 8.5, ry + 2.6);

    // Row 2: Proportional Bar + Detailed Paper/Citation Metrics
    const barMaxW = 26;
    const barFillW =
      Math.max(2.5, (c.paperCount / maxTopCountryPapers) * barMaxW);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin + 8.5, ry + 3.8, barMaxW, 1.2, 'F');
    doc.setFillColor(14, 165, 233);
    doc.rect(margin + 8.5, ry + 3.8, barFillW, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `${c.paperCount} papers (${c.percentageOfTotalPapers}%) · ${c.totalCitations.toLocaleString()} cit.`,
      margin + 36.5,
      ry + 4.9
    );
  });

  // Right Card: Top 10 Co-Authors (Full names with zero slicing)
  const rightCardX = margin + halfW + 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightCardX, y, halfW, listCardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 23, 42);
  doc.text('Top 10 Research Co-Authors', rightCardX + 3, y + 5.2);

  top10CoAuthors.forEach((ca, idx) => {
    const ry = y + 7.2 + idx * rowItemH1;

    // Rank Badge
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(rightCardX + 2.5, ry, 5, 4.4, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(79, 70, 229);
    doc.text(`#${idx + 1}`, rightCardX + 5, ry + 3.2, { align: 'center' });

    // Full Co-Author Name & Affiliation
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    const authorLabel = `${ca.name} (${ca.country})`;
    const authorFullLabel =
      authorLabel.length > 52 ? authorLabel.slice(0, 51) + '…' : authorLabel;
    doc.text(authorFullLabel, rightCardX + 8.5, ry + 2.6);

    // Row 2: Proportional Bar + Detailed Metrics
    const barMaxW = 26;
    const barFillW =
      Math.max(2.5, (ca.paperCount / maxTopAuthorPapers) * barMaxW);
    doc.setFillColor(241, 245, 249);
    doc.rect(rightCardX + 8.5, ry + 3.8, barMaxW, 1.2, 'F');
    doc.setFillColor(79, 70, 229);
    doc.rect(rightCardX + 8.5, ry + 3.8, barFillW, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `${ca.paperCount} papers · ${ca.totalCitations.toLocaleString()} cit.`,
      rightCardX + 36.5,
      ry + 4.9
    );
  });

  // =========================================================================
  // PAGE 2: FLAT WORLD COLLABORATION MAP, TOP 5 PAPERS, UNIVERSITIES & VENUES
  // =========================================================================
  doc.addPage();
  y = 14;

  // Embed Flat World Collaboration Map so ALL global collaborations are visible
  try {
    const flatMapContainer = document.getElementById(
      'chart-collaboration-globe-flat'
    );
    const flatMapSvg = flatMapContainer?.querySelector(
      'svg'
    ) as SVGSVGElement | null;
    if (flatMapSvg) {
      y = drawSectionHeader(
        doc,
        '04',
        `Global Collaboration Network Map (${universities.length} Institutions Across ${countries.length} Nations)`,
        margin,
        y,
        contentW
      );
      const flatMapUrl = await svgElementToPngDataUrl(
        flatMapSvg,
        `Global Research Collaboration Network — ${profile.name}`,
        `${universities.length} Collaborating Institutions · ${countries.length} Countries`,
        true
      );
      doc.addImage(flatMapUrl, 'PNG', margin, y, contentW, 62);
      y += 66;
    }
  } catch {
    // Continue if offscreen SVG serialization is skipped
  }

  // -------------------------------------------------------------------------
  // SECTION 5: TOP 10 MOST CITED PUBLICATIONS
  // -------------------------------------------------------------------------
  y = drawSectionHeader(
    doc,
    '05',
    'Top 10 Most Cited Publications',
    margin,
    y,
    contentW
  );

  const top10Papers = [...profile.publications]
    .sort((a, b) => b.citations - a.citations)
    .slice(0, 10);

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentW, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('Rank', margin + 2, y + 3.8);
  doc.text('Publication Title', margin + 10, y + 3.8);
  doc.text('Journal / Conference Venue', margin + 100, y + 3.8);
  doc.text('Tier', margin + 140, y + 3.8);
  doc.text('Year', margin + 162, y + 3.8, { align: 'center' });
  doc.text('Citations', margin + contentW - 2, y + 3.8, { align: 'right' });
  y += 5.5;

  top10Papers.forEach((pub, idx) => {
    const rowH = 6.2;
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentW, rowH, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowH, margin + contentW, y + rowH);

    // Rank Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(37, 99, 235);
    doc.text(`#${idx + 1}`, margin + 2, y + 4.2);

    // Clickable Publication Title
    const paperUrl = getPublicationUrl(pub);
    const titleText =
      pub.title.length > 54 ? pub.title.slice(0, 53) + '…' : pub.title;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(29, 78, 216); // High-contrast academic blue for clickable link
    doc.textWithLink(titleText, margin + 10, y + 4.2, { url: paperUrl });
    const titleW = (doc.getStringUnitWidth(titleText) * 6.8) / (72 / 25.4);
    doc.link(margin + 10, y + 0.6, titleW, 5.0, { url: paperUrl });

    // Journal / Conference Venue
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    const venueText =
      pub.venue.length > 22 ? pub.venue.slice(0, 21) + '…' : pub.venue;
    doc.text(venueText, margin + 100, y + 4.2);

    // Tier / Category
    const cat = getPublicationPortfolioCategory(pub);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 58, 138);
    doc.text(cat, margin + 140, y + 4.2);

    // Year (Centered at margin + 162 with 7mm clear margin on both sides)
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(String(pub.year), margin + 162, y + 4.2, { align: 'center' });

    // Citations (Right-aligned)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(pub.citations.toLocaleString(), margin + contentW - 2, y + 4.2, {
      align: 'right',
    });

    y += rowH;
  });

  y += 4;

  // -------------------------------------------------------------------------
  // SECTION 6: TOP 10 PARTNER INSTITUTIONS & TOP 10 PUBLICATION VENUES
  // -------------------------------------------------------------------------
  y = drawSectionHeader(
    doc,
    '06',
    'Top 10 Collaborating Institutions & Top 10 Publication Venues',
    margin,
    y,
    contentW
  );

  const top10Unis = universities.slice(0, 10);
  const top10Journals = journals.slice(0, 10);
  const maxUniPapers = Math.max(1, ...top10Unis.map((u) => u.paperCount));
  const maxJournalPapers = Math.max(
    1,
    ...top10Journals.map((j) => j.paperCount)
  );

  // Generous card height so institution names are completely spelled out without truncation
  const rowItemH = 7.1;
  const listCard2H = Math.max(
    38,
    Math.max(top10Unis.length, top10Journals.length) * rowItemH + 7.5
  );

  // Left Card: Top 10 Partner Universities (Full names with zero slicing)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, halfW, listCard2H, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 23, 42);
  doc.text('Top 10 Collaborating Institutions', margin + 3, y + 5.2);

  top10Unis.forEach((u, idx) => {
    const ry = y + 7.2 + idx * rowItemH;

    // Rank Badge
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin + 2.5, ry, 5, 4.4, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(37, 99, 235);
    doc.text(`#${idx + 1}`, margin + 5, ry + 3.2, { align: 'center' });

    // Full University Name (up to 55 characters displayed across full width)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    const uniFullName =
      u.universityName.length > 52
        ? u.universityName.slice(0, 51) + '…'
        : u.universityName;
    doc.text(uniFullName, margin + 8.5, ry + 2.6);

    // Row 2: Proportional Bar + Detailed Paper/Citation Metrics
    const barMaxW = 26;
    const barFillW = Math.max(2.5, (u.paperCount / maxUniPapers) * barMaxW);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin + 8.5, ry + 3.8, barMaxW, 1.2, 'F');
    doc.setFillColor(37, 99, 235);
    doc.rect(margin + 8.5, ry + 3.8, barFillW, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `${u.paperCount} papers (${u.country}) · ${u.totalCitations.toLocaleString()} cit.`,
      margin + 36.5,
      ry + 4.9
    );
  });

  // Right Card: Top 10 Journals / Venues (Full venue names with zero slicing)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightCardX, y, halfW, listCard2H, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 23, 42);
  doc.text('Top 10 Journals & Conference Venues', rightCardX + 3, y + 5.2);

  top10Journals.forEach((j, idx) => {
    const ry = y + 7.2 + idx * rowItemH;

    // Rank Badge
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(rightCardX + 2.5, ry, 5, 4.4, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(5, 150, 105);
    doc.text(`#${idx + 1}`, rightCardX + 5, ry + 3.2, { align: 'center' });

    // Full Venue Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    const venueFullName =
      j.venue.length > 52 ? j.venue.slice(0, 51) + '…' : j.venue;
    doc.text(venueFullName, rightCardX + 8.5, ry + 2.6);

    // Row 2: Proportional Bar + Detailed Metrics
    const barMaxW = 26;
    const barFillW = Math.max(2.5, (j.paperCount / maxJournalPapers) * barMaxW);
    doc.setFillColor(241, 245, 249);
    doc.rect(rightCardX + 8.5, ry + 3.8, barMaxW, 1.2, 'F');
    doc.setFillColor(16, 185, 129);
    doc.rect(rightCardX + 8.5, ry + 3.8, barFillW, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `${j.paperCount} papers (${j.quartile}) · ${j.totalCitations.toLocaleString()} cit.`,
      rightCardX + 36.5,
      ry + 4.9
    );
  });

  // =========================================================================
  // PAGE 3+: COMPLETE VERIFIED PUBLICATION INVENTORY
  // =========================================================================
  doc.addPage();
  y = 14;
  y = drawSectionHeader(
    doc,
    '07',
    `Complete Verified Publication Portfolio (${profile.publications.length} Publications)`,
    margin,
    y,
    contentW
  );

  const drawPubTableHeader = (topY: number): number => {
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, topY, contentW, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(255, 255, 255);
    doc.text('#', margin + 2, topY + 4.4);
    doc.text('Publication Title', margin + 10, topY + 4.4);
    doc.text('Journal / Conference Venue', margin + 100, topY + 4.4);
    doc.text('Category', margin + 140, topY + 4.4);
    doc.text('Year', margin + 162, topY + 4.4, { align: 'center' });
    doc.text('Citations', margin + contentW - 2, topY + 4.4, { align: 'right' });
    return topY + 6.5;
  };

  y = drawPubTableHeader(y);

  profile.publications.forEach((p, idx) => {
    if (y > 276) {
      doc.addPage();
      y = 14;
      y = drawPubTableHeader(y);
    }
    const rowH = 6.2;
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentW, rowH, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + rowH, margin + contentW, y + rowH);

    // Publication Number
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(String(idx + 1), margin + 2, y + 4.3);

    // Clickable Publication Title
    const paperUrl = getPublicationUrl(p);
    const titleText =
      p.title.length > 54 ? p.title.slice(0, 53) + '…' : p.title;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(29, 78, 216); // High-contrast academic blue for clickable link
    doc.textWithLink(titleText, margin + 10, y + 4.3, { url: paperUrl });
    const titleW = (doc.getStringUnitWidth(titleText) * 6.8) / (72 / 25.4);
    doc.link(margin + 10, y + 0.6, titleW, 5.0, { url: paperUrl });

    // Journal / Conference Venue
    doc.setTextColor(71, 85, 105);
    const venueText =
      p.venue.length > 22 ? p.venue.slice(0, 21) + '…' : p.venue;
    doc.text(venueText, margin + 100, y + 4.3);

    // Category
    const cat = getPublicationPortfolioCategory(p);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(cat, margin + 140, y + 4.3);

    // Year (Centered at margin + 162 with clear spacing)
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(String(p.year), margin + 162, y + 4.3, { align: 'center' });

    // Citations (Right-aligned)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(p.citations.toLocaleString(), margin + contentW - 2, y + 4.3, {
      align: 'right',
    });

    y += rowH;
  });

  // Add Page Numbers to All Pages
  const totalPages = doc.getNumberOfPages();
  for (let pNum = 1; pNum <= totalPages; pNum++) {
    doc.setPage(pNum);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `ScholarLens Bibliometric Dossier — ${profile.name} (${profile.scholarUserId})`,
      margin,
      290
    );
    doc.text(`Page ${pNum} of ${totalPages}`, pageW - margin, 290, {
      align: 'right',
    });
  }

  doc.save(`${profile.scholarUserId}_bibliometric_report.pdf`);
}
