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
  const headerH = 76;
  const minW = 660;
  const totalW = Math.max(minW, svgW + pad * 2);
  const totalH = svgH + headerH + pad * 2;
  const scale = 3;

  const serializer = new XMLSerializer();
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(svgW));
  clone.setAttribute('height', String(svgH));
  clone.setAttribute(
    'font-family',
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  );

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
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(title, pad, pad + 18);

      // Subtitle: Parse name & affiliation so it wraps gracefully and is 100% visible
      const maxTextW = totalW - pad * 2;
      const subMatch = subtitle.match(/^([^(]+?)\s*\((.+)\)\s*$/);
      if (subMatch) {
        const rName = subMatch[1].trim();
        const rAffil = subMatch[2].trim();

        ctx.fillStyle = darkTheme ? '#e2e8f0' : '#1e293b';
        ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(rName, pad, pad + 38);

        ctx.fillStyle = darkTheme ? '#94a3b8' : '#64748b';
        ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        
        // Wrap affiliation text if it exceeds max width
        if (ctx.measureText(rAffil).width <= maxTextW) {
          ctx.fillText(rAffil, pad, pad + 54);
        } else {
          const words = rAffil.split(' ');
          let line1 = '';
          let line2 = '';
          for (const w of words) {
            const testLine = line1 ? `${line1} ${w}` : w;
            if (ctx.measureText(testLine).width <= maxTextW) {
              line1 = testLine;
            } else {
              line2 = line2 ? `${line2} ${w}` : w;
            }
          }
          ctx.fillText(line1, pad, pad + 52);
          if (line2) {
            ctx.fillText(line2, pad, pad + 66);
          }
        }
      } else {
        ctx.fillStyle = darkTheme ? '#94a3b8' : '#64748b';
        ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(subtitle, pad, pad + 40);
      }

      // Draw SVG chart (centered horizontally)
      const chartX = Math.max(pad, Math.round((totalW - svgW) / 2));
      ctx.drawImage(img, chartX, pad + headerH, svgW, svgH);

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
 * Robustly finds the chart SVG within a container, explicitly skipping any nested button icons (such as ImageDown).
 */
function findTargetChartSvg(
  container: HTMLElement | null
): SVGSVGElement | null {
  if (!container) return null;
  // 1. Explicitly tagged chart SVG
  const tagged = container.querySelector<SVGSVGElement>(
    'svg[data-chart-svg="true"]'
  );
  if (tagged) return tagged;
  // 2. Class-based chart SVG
  const classed = container.querySelector<SVGSVGElement>(
    'svg.scholar-chart-svg'
  );
  if (classed) return classed;
  // 3. Role="img" chart SVG
  const roleImg = container.querySelector<SVGSVGElement>('svg[role="img"]');
  if (roleImg) return roleImg;
  // 4. Any SVG that is NOT inside a button
  const allSvgs = Array.from(container.querySelectorAll<SVGSVGElement>('svg'));
  const nonButtonSvg = allSvgs.find((s) => !s.closest('button'));
  if (nonButtonSvg) return nonButtonSvg;
  return allSvgs[allSvgs.length - 1] || null;
}

/**
 * Converts an SVG element directly into a high-DPI PNG data URL preserving its exact native aspect ratio.
 */
async function svgElementToRawPngDataUrl(
  svgEl: SVGSVGElement
): Promise<{ dataUrl: string; width: number; height: number }> {
  const bbox = svgEl.viewBox?.baseVal;
  const svgW =
    bbox && bbox.width > 0 ? bbox.width : svgEl.clientWidth || 360;
  const svgH =
    bbox && bbox.height > 0 ? bbox.height : svgEl.clientHeight || 210;
  const scale = 3;

  const serializer = new XMLSerializer();
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(svgW));
  clone.setAttribute('height', String(svgH));
  if (!clone.getAttribute('viewBox')) {
    clone.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  }
  clone.setAttribute(
    'font-family',
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  );

  const svgStr = serializer.serializeToString(clone);
  const svgBlob = new Blob([svgStr], {
    type: 'image/svg+xml;charset=utf-8',
  });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let triedDataUri = false;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgW * scale;
      canvas.height = svgH * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, svgW, svgH);
      URL.revokeObjectURL(url);
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        width: svgW,
        height: svgH,
      });
    };
    img.onerror = (err) => {
      if (!triedDataUri) {
        triedDataUri = true;
        img.src =
          'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
      } else {
        URL.revokeObjectURL(url);
        reject(err);
      }
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
  const svgEl = findTargetChartSvg(container);
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
  Q1: [37, 99, 235], // Royal Blue
  Q2: [5, 150, 105], // Emerald Green
  Q3: [217, 119, 6], // Amber Gold
  Q4: [225, 29, 72], // Rose Red
  Conference: [124, 58, 237], // Royal Purple
  'Non-Indexed': [71, 85, 105], // Slate Charcoal
};

function drawSectionHeader(
  doc: jsPDF,
  numberLabel: string,
  title: string,
  x: number,
  y: number,
  width: number
): number {
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(x, y, width, 7.5, 1.2, 1.2, 'FD');

  doc.setFillColor(30, 58, 138);
  doc.roundedRect(x + 1.5, y + 1.2, 7.5, 5.1, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(numberLabel, x + 5.25, y + 4.8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.setTextColor(15, 23, 42);
  doc.text(title, x + 11.5, y + 5.1);

  return y + 10.5;
}

/**
 * Loads the researcher's Google Scholar avatar URL onto an offscreen circular canvas
 * and returns a high-DPI PNG data URL suitable for embedding in jsPDF.
 */
async function loadCircularAvatarPngDataUrl(
  profile: ResearcherProfile
): Promise<string | null> {
  const candidates = [
    profile.avatarUrl && profile.avatarUrl.startsWith('data:image/')
      ? profile.avatarUrl
      : null,
    `/api/scholar/avatar?userId=${encodeURIComponent(
      profile.scholarUserId
    )}&name=${encodeURIComponent(profile.name)}`,
  ].filter(Boolean) as string[];

  for (const srcUrl of candidates) {
    const rendered = await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const size = 320;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          // Clip to circular avatar frame
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          // Draw directly from Google Scholar photo preserving aspect ratio
          const nw = img.naturalWidth || img.width;
          const nh = img.naturalHeight || img.height;
          const scale = Math.max(size / nw, size / nh);
          const drawW = nw * scale;
          const drawH = nh * scale;
          const drawX = (size - drawW) / 2;
          const drawY = (size - drawH) / 2;

          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.restore();

          // Outer border ring
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 5;
          ctx.stroke();

          resolve(canvas.toDataURL('image/png'));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = srcUrl;
    });
    if (rendered) return rendered;
  }
  return null;
}

/**
 * Generates and downloads a publication-grade academic bibliometric dossier PDF
 * featuring the researcher's Google Scholar profile portrait, vector charts,
 * flattened full-world collaboration network map, and complete verified publication portfolio.
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

  const avatarPngUrl = await loadCircularAvatarPngDataUrl(profile);

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
  // PAGE 1: ACADEMIC CURRICULUM & BIBLIOMETRIC DOSSIER HEADER + ANALYTICS
  // =========================================================================

  // Academic Dossier Header Banner (Enlarged with Name, Affiliation, and Google Scholar)
  const hasAvatar = Boolean(avatarPngUrl);
  const textLeftX = hasAvatar ? margin + 28.5 : margin;
  const maxLeftTextW = pageW - textLeftX - margin;

  const affilStr = profile.affiliation
    ? profile.affiliation
    : 'Google Scholar Profile';
  const affilLines = doc.splitTextToSize(affilStr, maxLeftTextW);
  const isMultiLineAffil = affilLines.length > 1;
  const headerBannerH = isMultiLineAffil ? 39.5 : 35.5;

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageW, headerBannerH, 'F');
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 2.0, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(0, headerBannerH - 0.2, pageW, headerBannerH - 0.2);
  doc.setFillColor(30, 58, 138);
  doc.rect(0, headerBannerH - 1.0, pageW, 0.8, 'F');

  // Draw Google Scholar Researcher Portrait on Left
  if (avatarPngUrl) {
    try {
      doc.addImage(avatarPngUrl, 'PNG', margin, 5.2, 24.5, 24.5);
    } catch {
      // Ignore image error
    }
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16.5);
  doc.text(profile.name, textLeftX, 12.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(51, 65, 85);
  let curHeaderY = 17.5;
  for (let i = 0; i < Math.min(2, affilLines.length); i++) {
    doc.text(affilLines[i], textLeftX, curHeaderY);
    curHeaderY += 4.0;
  }

  // Research Areas directly under Affiliation (ABOVE Google Scholar link)
  const domainStr =
    profile.fields.length > 0
      ? `Research Areas: ${profile.fields.slice(0, 5).join(' · ')}`
      : '';
  if (domainStr) {
    const domainLines = doc.splitTextToSize(domainStr, maxLeftTextW);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(domainLines[0], textLeftX, curHeaderY + 0.5);
    curHeaderY += 4.5;
  } else {
    curHeaderY += 1.0;
  }

  // Google Scholar Profile Link BELOW Research Areas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(29, 78, 216);
  const scholarLabel = 'Google Scholar Profile';
  doc.textWithLink(scholarLabel, textLeftX, curHeaderY + 1.0, { url: profile.scholarUrl });
  const scholarW = (doc.getStringUnitWidth(scholarLabel) * 8.2) / (72 / 25.4);
  doc.link(textLeftX, curHeaderY - 2.0, scholarW, 4.2, { url: profile.scholarUrl });

  y = headerBannerH + 4.5;

  // -------------------------------------------------------------------------
  // SECTION 1: EXECUTIVE BIBLIOMETRIC & IMPACT INDICATORS (MATCHING WEB HIGHLIGHT SECTION)
  // -------------------------------------------------------------------------
  y = drawSectionHeader(
    doc,
    '01',
    'Executive Bibliometric & Impact Indicators',
    margin,
    y,
    contentW
  );

  // 1. Top Row: 4 Primary Metric Cards (Matching Web Highlight Cards)
  const metricCards = [
    {
      label: 'VERIFIED PUBLICATIONS',
      value: String(stats.totalPapers),
      sub: 'Peer-reviewed corpus',
    },
    {
      label: 'CUMULATIVE CITATIONS',
      value: stats.totalCitations.toLocaleString(),
      sub: `~${(stats.totalCitations / Math.max(1, stats.totalPapers)).toFixed(1)} cites/paper`,
    },
    {
      label: 'H-INDEX / I10-INDEX',
      value: `${stats.hIndex}  /  ${stats.i10Index}`,
      sub: `${stats.i10Index} papers >= 10 citations`,
    },
    {
      label: 'INSTITUTIONAL NETWORK',
      value: String(universities.length),
      sub: `Across ${countries.length} collaborating nations`,
    },
  ];

  const mCols = 4;
  const mGap = 2.5;
  const mW = (contentW - mGap * (mCols - 1)) / mCols;
  const mH = 14.2;

  metricCards.forEach((card, idx) => {
    const bx = margin + idx * (mW + mGap);
    const by = y;

    // Card background & subtle border (pure white, matching web)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(bx, by, mW, mH, 1.5, 1.5, 'FD');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, bx + 2.5, by + 4.2);

    // Primary Value (dark bold text)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.0);
    doc.setTextColor(15, 23, 42);
    doc.text(card.value, bx + 2.5, by + 9.5);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(148, 163, 184);
    doc.text(card.sub, bx + 2.5, by + 12.8);
  });

  y += mH + 2.5;

  // 2. Row 2: Dedicated Journal Quartile & Indexing Distribution Container (matching web highlight section)
  const pCategories: {
    key: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Conference' | 'Non-Indexed';
    label: string;
    dotColor: [number, number, number];
  }[] = [
    {
      key: 'Q1',
      label: 'Q1 Journals',
      dotColor: [37, 99, 235],
    },
    {
      key: 'Q2',
      label: 'Q2 Journals',
      dotColor: [5, 150, 105],
    },
    {
      key: 'Q3',
      label: 'Q3 Journals',
      dotColor: [217, 119, 6],
    },
    {
      key: 'Q4',
      label: 'Q4 Journals',
      dotColor: [225, 29, 72],
    },
    {
      key: 'Conference',
      label: 'Conference',
      dotColor: [124, 58, 237],
    },
    {
      key: 'Non-Indexed',
      label: 'Others',
      dotColor: [71, 85, 105],
    },
  ];

  const containerH = 22.0;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentW, containerH, 1.8, 1.8, 'FD');

  // Container Header: Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(15, 23, 42);
  doc.text('Journal Quartile & Indexing Distribution', margin + 3.0, y + 4.2);

  // 6 Interactive/Visual Category Chips (pure white cards, matching web app)
  const chipPad = 3.0;
  const chipGap = 1.8;
  const chipW = (contentW - chipPad * 2 - chipGap * 5) / 6;
  const chipH = 10.0;
  const chipY = y + 5.6;

  pCategories.forEach(({ key, label, dotColor }, idx) => {
    const d = stats.portfolioDistribution[key];
    const cx = margin + chipPad + idx * (chipW + chipGap);

    // Clean white chip box matching web app
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cx, chipY, chipW, chipH, 1.2, 1.2, 'FD');

    // Label (left) & Colored indicator dot (right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.6);
    doc.setTextColor(71, 85, 105);
    doc.text(label, cx + 2.0, chipY + 3.6);

    doc.setFillColor(dotColor[0], dotColor[1], dotColor[2]);
    doc.circle(cx + chipW - 2.8, chipY + 2.8, 0.9, 'F');

    // Percentage value (bold dark text, exactly like web highlight)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.4);
    doc.setTextColor(15, 23, 42);
    doc.text(`${d.percentage}%`, cx + 2.0, chipY + 7.2);

    // Paper count (subtle slate text)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${d.count} papers`, cx + 2.0, chipY + 9.2);
  });

  // Modern Segmented Progress Bar inside the container
  const barY = y + 17.2;
  const barW = contentW - chipPad * 2;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + chipPad, barY, barW, 2.8, 1.0, 1.0, 'F');

  let curBarX = margin + chipPad;
  pCategories.forEach(({ key }) => {
    const pct = stats.portfolioDistribution[key].percentage;
    if (pct <= 0) return;
    const segW = Math.max(1.2, (pct / 100) * barW);
    const [r, g, b] = CATEGORY_RGB[key];
    doc.setFillColor(r, g, b);
    doc.rect(
      curBarX,
      barY,
      Math.min(segW, margin + chipPad + barW - curBarX),
      2.8,
      'F'
    );
    curBarX += segW;
  });

  y += containerH + 3.0;

  // -------------------------------------------------------------------------
  // SECTION 2: GLOBAL COLLABORATION NETWORK MAP (EXPANDED TO FULL WIDTH ON PAGE 1)
  // -------------------------------------------------------------------------
  try {
    const flatMapContainer =
      document.getElementById('chart-collaboration-globe-flat') ||
      document.getElementById('chart-collaboration-globe-flat-overview') ||
      document.querySelector('[aria-label="Global Collaboration Map"]');
    const flatMapSvg =
      flatMapContainer?.querySelector('svg') ||
      document.querySelector(
        '#chart-collaboration-globe-flat-overview svg'
      ) as SVGSVGElement | null;
    if (flatMapSvg) {
      y = drawSectionHeader(
        doc,
        '02',
        `Global Collaboration Network Map (${universities.length} Institutions Across ${countries.length} Nations)`,
        margin,
        y,
        contentW
      );
      const rawMap = await svgElementToRawPngDataUrl(flatMapSvg);
      const trueMapH = Math.min(
        94.0,
        Number(
          ((contentW * rawMap.height) / Math.max(1, rawMap.width)).toFixed(1)
        )
      );
      const mapDrawW = contentW;
      const mapDrawX = margin;
      doc.addImage(rawMap.dataUrl, 'PNG', mapDrawX, y, mapDrawW, trueMapH);
      y += trueMapH + 2.5;

      // Summary strip under map
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentW, 6.2, 1, 1, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Global Research Footprint: ${universities.length} Collaborating Institutions Across ${countries.length} Nations Worldwide`,
        margin + contentW / 2,
        y + 4.2,
        { align: 'center' }
      );
      y += 8.5;
    }
  } catch {
    // Continue if offscreen SVG serialization is skipped
  }

  // Key International Collaboration Highlights on Page 1 (Fills remaining space cleanly)
  const p1ColW = (contentW - 5.0) / 3;
  const p1CardH = 58.0;
  const p1CardY = y + 1.0;

  // Card 1: Top 4 Collaborating Countries
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, p1CardY, p1ColW, p1CardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Top Partner Nations', margin + 3.0, p1CardY + 5.0);

  const p1Countries = countries.slice(0, 4);
  const p1MaxCountryPapers = Math.max(
    1,
    ...p1Countries.map((c) => c.paperCount)
  );
  p1Countries.forEach((c, idx) => {
    const ry = p1CardY + 7.5 + idx * 12.0;
    // Rank Badge
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin + 2.5, ry + 0.5, 4.8, 5.0, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(37, 99, 235);
    doc.text(`#${idx + 1}`, margin + 4.9, ry + 4.0, { align: 'center' });

    // Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    const cName =
      c.country.length > 28 ? c.country.slice(0, 27) + '…' : c.country;
    doc.text(cName, margin + 8.5, ry + 2.2);

    // Bar
    const barW = p1ColW - 11.5;
    const fillW = Math.max(2.5, (c.paperCount / p1MaxCountryPapers) * barW);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin + 8.5, ry + 3.6, barW, 1.2, 'F');
    doc.setFillColor(14, 165, 233);
    doc.rect(margin + 8.5, ry + 3.6, fillW, 1.2, 'F');

    // Counts
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.6);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${c.paperCount} ${c.paperCount === 1 ? 'paper' : 'papers'} · ${c.totalCitations.toLocaleString()} citations`,
      margin + 8.5,
      ry + 7.2
    );
  });

  // Card 2: Top 4 Collaborating Institutions
  const c2X = margin + p1ColW + 2.5;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(c2X, p1CardY, p1ColW, p1CardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Top Partner Institutions', c2X + 3.0, p1CardY + 5.0);

  const p1Unis = universities.slice(0, 4);
  const p1MaxUniPapers = Math.max(1, ...p1Unis.map((u) => u.paperCount));
  p1Unis.forEach((u, idx) => {
    const ry = p1CardY + 7.5 + idx * 12.0;
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(c2X + 2.5, ry + 0.5, 4.8, 5.0, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(37, 99, 235);
    doc.text(`#${idx + 1}`, c2X + 4.9, ry + 4.0, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    const uName =
      u.universityName.length > 28
        ? u.universityName.slice(0, 27) + '…'
        : u.universityName;
    doc.text(uName, c2X + 8.5, ry + 2.2);

    const barW = p1ColW - 11.5;
    const fillW = Math.max(2.5, (u.paperCount / p1MaxUniPapers) * barW);
    doc.setFillColor(241, 245, 249);
    doc.rect(c2X + 8.5, ry + 3.6, barW, 1.2, 'F');
    doc.setFillColor(37, 99, 235);
    doc.rect(c2X + 8.5, ry + 3.6, fillW, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.6);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${u.paperCount} ${u.paperCount === 1 ? 'paper' : 'papers'} · ${u.totalCitations.toLocaleString()} citations`,
      c2X + 8.5,
      ry + 7.2
    );
  });

  // Card 3: Top 4 Research Co-Authors
  const c3X = margin + (p1ColW + 2.5) * 2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(c3X, p1CardY, p1ColW, p1CardH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Research Co-Authors', c3X + 3.0, p1CardY + 5.0);

  const p1Authors = coAuthors.slice(0, 4);
  const p1MaxAuthorPapers = Math.max(1, ...p1Authors.map((a) => a.paperCount));
  p1Authors.forEach((a, idx) => {
    const ry = p1CardY + 7.5 + idx * 12.0;
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(c3X + 2.5, ry + 0.5, 4.8, 5.0, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(79, 70, 229);
    doc.text(`#${idx + 1}`, c3X + 4.9, ry + 4.0, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    const aName = a.name.length > 28 ? a.name.slice(0, 27) + '…' : a.name;
    doc.text(aName, c3X + 8.5, ry + 2.2);

    const barW = p1ColW - 11.5;
    const fillW = Math.max(2.5, (a.paperCount / p1MaxAuthorPapers) * barW);
    doc.setFillColor(241, 245, 249);
    doc.rect(c3X + 8.5, ry + 3.6, barW, 1.2, 'F');
    doc.setFillColor(79, 70, 229);
    doc.rect(c3X + 8.5, ry + 3.6, fillW, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.6);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${a.paperCount} ${a.paperCount === 1 ? 'paper' : 'papers'} · ${a.totalCitations.toLocaleString()} citations`,
      c3X + 8.5,
      ry + 7.2
    );
  });

  // =========================================================================
  // PAGE 2: BIBLIOMETRIC & IMPACT ANALYTICS GRAPHS (LARGE 2x3 GRID)
  // =========================================================================
  doc.addPage();
  y = 14;

  y = drawSectionHeader(
    doc,
    '03',
    'Bibliometric & Impact Analytics Graphs',
    margin,
    y,
    contentW
  );

  const siteAnalyticsCharts: { id: string; title: string }[] = [
    {
      id: 'chart-top-impact-journals',
      title: 'High-Impact Publishing Venues',
    },
    {
      id: 'chart-leading-coauthors',
      title: 'Leading Co-Authors',
    },
    {
      id: 'chart-quartile-donut',
      title: 'Quartile & Indexing Distribution',
    },
    {
      id: 'chart-pub-types',
      title: 'Document Type Classification',
    },
    {
      id: 'chart-citation-brackets',
      title: 'Citation Impact Distribution',
    },
    {
      id: 'chart-yearly-trend',
      title: 'Annual Citation & Trajectory Trend',
    },
    {
      id: 'chart-quartile-yearly',
      title: 'Quartile Composition by Year',
    },
    {
      id: 'chart-top-countries',
      title: 'Collaborating Countries',
    },
  ];

  const chartCols = 2;
  const chartGapX = 5.0;
  const chartGapY = 3.5;
  const chartCardW = (contentW - chartGapX * (chartCols - 1)) / chartCols;
  const chartCardH = 58.0;

  let chartRowOnPage = 0;
  for (let i = 0; i < siteAnalyticsCharts.length; i++) {
    const item = siteAnalyticsCharts[i];
    const col = i % chartCols;
    if (col === 0 && i > 0) {
      chartRowOnPage++;
      if (y + (chartRowOnPage + 1) * (chartCardH + chartGapY) > 284) {
        doc.addPage();
        y = 14;
        chartRowOnPage = 0;
      }
    }
    const cardX = margin + col * (chartCardW + chartGapX);
    const cardY = y + chartRowOnPage * (chartCardH + chartGapY);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, cardY, chartCardW, chartCardH, 2.0, 2.0, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.0);
    doc.setTextColor(15, 23, 42);
    doc.text(item.title, cardX + 3.5, cardY + 5.5);

    try {
      const container = document.getElementById(item.id);
      const svgEl = findTargetChartSvg(container);
      if (svgEl) {
        const rendered = await svgElementToRawPngDataUrl(svgEl);
        const padX = 3.0;
        const topOffset = 7.5;
        const maxDrawW = chartCardW - padX * 2;
        const maxDrawH = chartCardH - topOffset - 2.5;
        const aspect = rendered.width / Math.max(1, rendered.height);

        let drawW = maxDrawW;
        let drawH = drawW / aspect;
        if (drawH > maxDrawH) {
          drawH = maxDrawH;
          drawW = drawH * aspect;
        }
        const drawX = cardX + (chartCardW - drawW) / 2;
        const drawY = cardY + topOffset + (maxDrawH - drawH) / 2;
        doc.addImage(rendered.dataUrl, 'PNG', drawX, drawY, drawW, drawH);
      }
    } catch {
      // Skip individual chart if SVG serialization fails
    }
  }

  // =========================================================================
  // PAGE 3: TOP 10 COLLABORATING COUNTRIES, CO-AUTHORS, INSTITUTIONS & VENUES
  // =========================================================================
  doc.addPage();
  y = 14;

  // -------------------------------------------------------------------------
  // SECTION 4: TOP 10 COUNTRIES & TOP 10 CO-AUTHORS (SIDE-BY-SIDE HIGHLIGHTS)
  // -------------------------------------------------------------------------
  y = drawSectionHeader(
    doc,
    '04',
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

  // Generous card height so country names, co-author names, bars, and stats are completely uncrowded with ZERO overlap
  const rowItemH1 = 10.2;
  const listCardH = Math.max(
    45,
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
    const ry = y + 7.5 + idx * rowItemH1;

    // Rank Badge
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin + 2.5, ry + 0.8, 5.0, 5.4, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(37, 99, 235);
    doc.text(`#${idx + 1}`, margin + 5.0, ry + 4.5, { align: 'center' });

    // Line 1: Full Country Name (Cleanly separated above the bar)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    const countryFullName =
      c.country.length > 52 ? c.country.slice(0, 51) + '…' : c.country;
    doc.text(countryFullName, margin + 8.5, ry + 3.0);

    // Line 2: Proportional Color Bar Line (1.6mm below text, never touching)
    const barMaxW = 76;
    const barFillW =
      Math.max(3.0, (c.paperCount / maxTopCountryPapers) * barMaxW);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin + 8.5, ry + 4.6, barMaxW, 1.3, 'F');
    doc.setFillColor(14, 165, 233);
    doc.rect(margin + 8.5, ry + 4.6, barFillW, 1.3, 'F');

    // Line 3: Paper and Citation Numbers (2.4mm below the bar, never touching)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${c.paperCount} ${c.paperCount === 1 ? 'paper' : 'papers'} · ${c.totalCitations.toLocaleString()} citations`,
      margin + 8.5,
      ry + 8.6
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
    const ry = y + 7.5 + idx * rowItemH1;

    // Rank Badge
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(rightCardX + 2.5, ry + 0.8, 5.0, 5.4, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(79, 70, 229);
    doc.text(`#${idx + 1}`, rightCardX + 5.0, ry + 4.5, { align: 'center' });

    // Line 1: Full Co-Author Name (Cleanly separated above the bar)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    const authorLabel = ca.name;
    const authorFullLabel =
      authorLabel.length > 52 ? authorLabel.slice(0, 51) + '…' : authorLabel;
    doc.text(authorFullLabel, rightCardX + 8.5, ry + 3.0);

    // Line 2: Proportional Color Bar Line (1.6mm below text, never touching)
    const barMaxW = 76;
    const barFillW =
      Math.max(3.0, (ca.paperCount / maxTopAuthorPapers) * barMaxW);
    doc.setFillColor(241, 245, 249);
    doc.rect(rightCardX + 8.5, ry + 4.6, barMaxW, 1.3, 'F');
    doc.setFillColor(79, 70, 229);
    doc.rect(rightCardX + 8.5, ry + 4.6, barFillW, 1.3, 'F');

    // Line 3: Paper and Citation Numbers (2.4mm below the bar, never touching)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${ca.paperCount} ${ca.paperCount === 1 ? 'paper' : 'papers'} · ${ca.totalCitations.toLocaleString()} citations`,
      rightCardX + 8.5,
      ry + 8.6
    );
  });

  y += listCardH + 4.5;

  // -------------------------------------------------------------------------
  // SECTION 5: TOP 10 PARTNER INSTITUTIONS & TOP 10 PUBLICATION VENUES
  // -------------------------------------------------------------------------
  y = drawSectionHeader(
    doc,
    '05',
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

  // Generous card height so institution names are completely uncrowded with ZERO overlap
  const rowItemH = 10.2;
  const listCard2H = Math.max(
    45,
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
    const ry = y + 7.5 + idx * rowItemH;

    // Rank Badge
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin + 2.5, ry + 0.8, 5.0, 5.4, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(37, 99, 235);
    doc.text(`#${idx + 1}`, margin + 5.0, ry + 4.5, { align: 'center' });

    // Line 1: Full University Name (Cleanly separated above the bar)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    const uniFullName =
      u.universityName.length > 52
        ? u.universityName.slice(0, 51) + '…'
        : u.universityName;
    doc.text(uniFullName, margin + 8.5, ry + 3.0);

    // Line 2: Proportional Color Bar Line (1.6mm below text, never touching)
    const barMaxW = 76;
    const barFillW = Math.max(3.0, (u.paperCount / maxUniPapers) * barMaxW);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin + 8.5, ry + 4.6, barMaxW, 1.3, 'F');
    doc.setFillColor(37, 99, 235);
    doc.rect(margin + 8.5, ry + 4.6, barFillW, 1.3, 'F');

    // Line 3: Paper and Citation Numbers (2.4mm below the bar, never touching)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${u.paperCount} ${u.paperCount === 1 ? 'paper' : 'papers'} · ${u.totalCitations.toLocaleString()} citations`,
      margin + 8.5,
      ry + 8.6
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
    const ry = y + 7.5 + idx * rowItemH;

    // Rank Badge
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(rightCardX + 2.5, ry + 0.8, 5.0, 5.4, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(5, 150, 105);
    doc.text(`#${idx + 1}`, rightCardX + 5.0, ry + 4.5, { align: 'center' });

    // Line 1: Full Venue Name (Cleanly separated above the bar)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    const ifVal = j.impactFactor;
    const ifLabel = ifVal ? ` [JIF ${ifVal.toFixed(1)}]` : '';
    const baseName = j.venue;
    const venueFullName =
      (baseName + ifLabel).length > 52
        ? baseName.slice(0, Math.max(10, 50 - ifLabel.length)) + '…' + ifLabel
        : baseName + ifLabel;
    doc.text(venueFullName, rightCardX + 8.5, ry + 3.0);

    // Line 2: Proportional Color Bar Line (1.6mm below text, never touching)
    const barMaxW = 76;
    const barFillW = Math.max(3.0, (j.paperCount / maxJournalPapers) * barMaxW);
    doc.setFillColor(241, 245, 249);
    doc.rect(rightCardX + 8.5, ry + 4.6, barMaxW, 1.3, 'F');
    doc.setFillColor(16, 185, 129);
    doc.rect(rightCardX + 8.5, ry + 4.6, barFillW, 1.3, 'F');

    // Line 3: Paper and Citation Numbers (2.4mm below the bar, never touching)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    const ifText = ifVal ? ` · Clarivate JIF: ${ifVal.toFixed(1)}` : '';
    doc.text(
      `${j.paperCount} ${j.paperCount === 1 ? 'paper' : 'papers'} · ${j.totalCitations.toLocaleString()} citations${ifText}`,
      rightCardX + 8.5,
      ry + 8.6
    );
  });

  y += listCard2H + 6.0;

  // -------------------------------------------------------------------------
  // SECTION 6: TOP 10 MOST CITED PUBLICATIONS
  // -------------------------------------------------------------------------
  const top10Papers = [...profile.publications]
    .sort((a, b) => b.citations - a.citations)
    .slice(0, 10);

  // Dynamic Page Flow: Only add a new page if Section 06 will exceed the bottom margin
  const section6NeededH = 9.0 + 5.5 + top10Papers.length * 6.2 + 5.0;
  if (y + section6NeededH > 276) {
    doc.addPage();
    y = 14;
  }

  y = drawSectionHeader(
    doc,
    '06',
    'Top 10 Most Cited Publications',
    margin,
    y,
    contentW
  );

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentW, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.0);
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
    doc.text(`#${idx + 1}`, margin + 2, y + 4.4);

    // Clickable Publication Title
    const paperUrl = getPublicationUrl(pub);
    const titleText =
      pub.title.length > 54 ? pub.title.slice(0, 53) + '…' : pub.title;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(29, 78, 216); // High-contrast academic blue for clickable link
    doc.textWithLink(titleText, margin + 10, y + 4.4, { url: paperUrl });
    const titleW = (doc.getStringUnitWidth(titleText) * 6.8) / (72 / 25.4);
    doc.link(margin + 10, y + 0.6, titleW, 5.2, { url: paperUrl });

    // Journal / Conference Venue
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    const venueText =
      pub.venue.length > 22 ? pub.venue.slice(0, 21) + '…' : pub.venue;
    doc.text(venueText, margin + 100, y + 4.4);

    // Tier / Category
    const cat = getPublicationPortfolioCategory(pub);
    const [cr, cg, cb] = CATEGORY_RGB[cat];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(cr, cg, cb);
    doc.text(cat === 'Non-Indexed' ? 'Others' : cat, margin + 140, y + 4.4);

    // Year (Centered at margin + 162 with 7mm clear margin on both sides)
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(String(pub.year), margin + 162, y + 4.4, { align: 'center' });

    // Citations (Right-aligned)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(pub.citations.toLocaleString(), margin + contentW - 2, y + 4.4, {
      align: 'right',
    });

    y += rowH;
  });

  y += 5.0;

  // -------------------------------------------------------------------------
  // SECTION 7: COMPLETE VERIFIED PUBLICATION PORTFOLIO
  // -------------------------------------------------------------------------
  if (y + 28 > 276) {
    doc.addPage();
    y = 14;
  }

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
    const [cr, cg, cb] = CATEGORY_RGB[cat];
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(cr, cg, cb);
    doc.text(cat === 'Non-Indexed' ? 'Others' : cat, margin + 140, y + 4.3);

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
      `Generated by ScholarLense — ${profile.name}`,
      margin,
      290
    );
    doc.text(`Page ${pNum} of ${totalPages}`, pageW - margin, 290, {
      align: 'right',
    });
  }

  const safeResearcherName =
    profile.name
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || profile.scholarUserId;
  doc.save(`${safeResearcherName}_ScholarLense.pdf`);
}
