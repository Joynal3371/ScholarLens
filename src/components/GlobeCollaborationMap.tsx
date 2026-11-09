import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  RotateCcw,
  Pause,
  Play,
  Filter,
  ImageDown,
  ZoomIn,
  ZoomOut,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  geoOrthographic,
  geoPath,
  geoGraticule,
  geoDistance,
} from 'd3-geo';
import * as topojson from 'topojson-client';
import worldAtlasData from 'world-atlas/countries-110m.json';
import {
  UniversityCollaboration,
  ResearcherProfile,
  getPublicationUrl,
} from '../utils/scholarAnalytics';

interface GlobeCollaborationMapProps {
  profile: ResearcherProfile;
  universities: UniversityCollaboration[];
  selectedUniversityId: string;
  onSelectUniversity: (universityId: string) => void;
  onFilterByUniversity: (universityId: string) => void;
  onFilterByCoAuthor: (coAuthorName: string) => void;
  onExportChartPng: (
    chartId: string,
    title: string,
    filename: string,
    darkTheme?: boolean
  ) => void;
}

const REGION_PRESETS: { label: string; lat: number; lng: number }[] = [
  { label: 'Asia & Oceania', lat: 23.78, lng: 90.4 },
  { label: 'Europe & Africa', lat: 48.85, lng: 2.35 },
  { label: 'Americas', lat: 37.5, lng: -85 },
];

const worldTopology = worldAtlasData as any;
const WORLD_COUNTRIES_COLLECTION = topojson.feature(
  worldTopology,
  worldTopology.objects.countries
) as any;
const WORLD_COUNTRY_FEATURES: any[] = WORLD_COUNTRIES_COLLECTION.features || [];
const WORLD_BORDERS_MESH = topojson.mesh(
  worldTopology,
  worldTopology.objects.countries,
  (a: any, b: any) => a !== b
);

// Earth radius = 6,371 km; viewport radius = 230 px -> at zoom=1, 1 px = 27.7 km.
// At zoom = 27.7, 1 px = 1.0 km. At zoom = 250, 1 px = 0.11 km (110m).
const EARTH_RADIUS_KM = 6371;
const GLOBE_SIZE = 500;
const CENTER = GLOBE_SIZE / 2;
const VIEWPORT_RADIUS = 230;
const ZOOM_1KM_PER_PX = Number((EARTH_RADIUS_KM / VIEWPORT_RADIUS).toFixed(1)); // 27.7x = 1.0 km/px
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 250;

function formatResolutionLabel(zoom: number): string {
  const kmPerPx = EARTH_RADIUS_KM / (VIEWPORT_RADIUS * zoom);
  if (kmPerPx >= 10) {
    return `${Math.round(kmPerPx)} km/px`;
  }
  if (kmPerPx >= 0.95) {
    return `${kmPerPx.toFixed(1)} km/px`;
  }
  return `${Math.round(kmPerPx * 1000)} m/px`;
}

function matchesCollaboratingCountry(
  featureName: string,
  collabCountries: Set<string>
): boolean {
  const f = (featureName || '').toLowerCase();
  if (!f) return false;
  if (collabCountries.has(f)) return true;
  if (f === 'united states of america' && collabCountries.has('united states')) {
    return true;
  }
  if (f === 'czechia' && collabCountries.has('czech republic')) {
    return true;
  }
  for (const c of collabCountries) {
    if (c.length >= 5 && (f.includes(c) || c.includes(f))) {
      return true;
    }
  }
  return false;
}

export const GlobeCollaborationMap: React.FC<GlobeCollaborationMapProps> = ({
  profile,
  universities,
  selectedUniversityId,
  onSelectUniversity,
  onFilterByUniversity,
  onFilterByCoAuthor,
  onExportChartPng,
}) => {
  const [centerLat, setCenterLat] = useState<number>(profile.homeLat || 23.78);
  const [centerLng, setCenterLng] = useState<number>(profile.homeLng || 90.4);
  const [zoom, setZoom] = useState<number>(1);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [coAuthorQuery, setCoAuthorQuery] = useState<string>('');

  const globeContainerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    setCenterLat(Math.max(-80, Math.min(80, profile.homeLat || 23.78)));
    setCenterLng(profile.homeLng || 90.4);
    setZoom(1);
    setCoAuthorQuery('');
  }, [profile.id, profile.homeLat, profile.homeLng]);

  const selectedUni = useMemo(() => {
    return (
      universities.find((u) => u.universityId === selectedUniversityId) ||
      universities[0] ||
      null
    );
  }, [universities, selectedUniversityId]);

  const projectedScale = VIEWPORT_RADIUS * zoom;
  const sphereClipRadius = Math.min(VIEWPORT_RADIUS, projectedScale);

  const { projection, pathGenerator } = useMemo(() => {
    const proj = geoOrthographic()
      .translate([CENTER, CENTER])
      .scale(projectedScale)
      .rotate([-centerLng, -centerLat, 0])
      .clipAngle(90)
      .clipExtent([
        [0, 0],
        [GLOBE_SIZE, GLOBE_SIZE],
      ])
      .precision(0.2);
    const gen = geoPath(proj);
    return { projection: proj, pathGenerator: gen };
  }, [centerLat, centerLng, projectedScale]);

  // Attach non-passive wheel listener so scrolling over the globe zooms smoothly all the way to 1km/px & 100m/px
  useEffect(() => {
    const el = globeContainerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setAutoRotate(false);
      const factor = e.deltaY < 0 ? 1.35 : 1 / 1.35;
      setZoom((prev) => {
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev * factor));
        return Number(next.toFixed(2));
      });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const collaboratingCountryNames = useMemo(() => {
    const s = new Set<string>();
    for (const u of universities) {
      if (u.country) s.add(u.country.toLowerCase());
    }
    return s;
  }, [universities]);

  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const interval = setInterval(() => {
      setCenterLng((prev) => {
        const next = prev + 1.2;
        return next > 180 ? next - 360 : next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  const focusOnUniversity = (uni: UniversityCollaboration) => {
    setAutoRotate(false);
    setCenterLat(Math.max(-82, Math.min(82, uni.lat)));
    setCenterLng(uni.lng);
    onSelectUniversity(uni.universityId);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setAutoRotate(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      lat: centerLat,
      lng: centerLng,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const sensitivity = 0.42 / zoom;
    const nextLng = dragStartRef.current.lng - dx * sensitivity;
    const nextLat = Math.max(
      -85,
      Math.min(85, dragStartRef.current.lat + dy * sensitivity)
    );
    setCenterLng(((nextLng + 540) % 360) - 180);
    setCenterLat(nextLat);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const graticulePath = useMemo(() => {
    let stepDeg = 10;
    if (zoom >= 60) stepDeg = 0.1;
    else if (zoom >= 20) stepDeg = 0.25;
    else if (zoom >= 6) stepDeg = 1;
    else if (zoom >= 2.5) stepDeg = 2.5;
    const grat = geoGraticule().step([stepDeg, stepDeg])();
    return pathGenerator(grat as any) || '';
  }, [pathGenerator, zoom]);

  const countryPaths = useMemo(() => {
    return WORLD_COUNTRY_FEATURES.map((feat, idx) => {
      const d = pathGenerator(feat);
      if (!d) return null;
      const name = String(feat.properties?.name || `country-${idx}`);
      const isCollab = matchesCollaboratingCountry(
        name,
        collaboratingCountryNames
      );
      return {
        id: `${feat.id || idx}-${name}`,
        name,
        d,
        isCollab,
      };
    }).filter(Boolean) as {
      id: string;
      name: string;
      d: string;
      isCollab: boolean;
    }[];
  }, [pathGenerator, collaboratingCountryNames]);

  const bordersMeshPath = useMemo(() => {
    return pathGenerator(WORLD_BORDERS_MESH as any) || '';
  }, [pathGenerator]);

  const arcPaths = useMemo(() => {
    return universities
      .filter((u) => u.universityId !== profile.homeUniversityId)
      .map((u) => {
        const lineFeature: any = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [profile.homeLng, profile.homeLat],
              [u.lng, u.lat],
            ],
          },
        };
        const d = pathGenerator(lineFeature) || '';
        return {
          id: u.universityId,
          isSelected: u.universityId === selectedUni?.universityId,
          d,
        };
      })
      .filter((a) => a.d.length > 0);
  }, [universities, profile, pathGenerator, selectedUni]);

  const projectedUniversities = useMemo(() => {
    const centerCoord: [number, number] = [centerLng, centerLat];
    // Orthographic projection without clipExtent to get exact projected point coordinates
    const pointProj = geoOrthographic()
      .translate([CENTER, CENTER])
      .scale(projectedScale)
      .rotate([-centerLng, -centerLat, 0])
      .clipAngle(90);

    const raw = universities.map((u) => {
      const angularDist = geoDistance(centerCoord, [u.lng, u.lat]);
      const visible = angularDist <= Math.PI / 2 - 0.01;
      const pt = visible ? pointProj([u.lng, u.lat]) : null;
      const x = pt ? pt[0] : CENTER;
      const y = pt ? pt[1] : CENTER;
      const distFromViewportCenter = Math.hypot(x - CENTER, y - CENTER);
      const inViewport =
        Boolean(visible && pt) &&
        distFromViewportCenter <= sphereClipRadius - 4;
      return {
        uni: u,
        visible: inViewport,
        exactX: x,
        exactY: y,
        screenX: x,
        screenY: y,
      };
    });

    // Ensure visible university dots never overlap on screen when zoomed in
    const minSepPx = zoom >= 6 ? 20 : zoom >= 2 ? 15 : 11;
    const maxDriftPx = zoom >= 10 ? 110 : zoom >= 3 ? 75 : 32;
    const iterations = zoom >= 3 ? 24 : 10;

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < raw.length; i++) {
        if (!raw[i].visible) continue;
        for (let j = i + 1; j < raw.length; j++) {
          if (!raw[j].visible) continue;
          const dx = raw[j].screenX - raw[i].screenX;
          const dy = raw[j].screenY - raw[i].screenY;
          const dist = Math.hypot(dx, dy);
          if (dist < minSepPx) {
            const angle =
              dist > 0.05 ? Math.atan2(dy, dx) : ((i * 7 + j * 13) % 12) * 0.52;
            const push = (minSepPx - dist) * 0.45;
            raw[i].screenX -= Math.cos(angle) * push;
            raw[i].screenY -= Math.sin(angle) * push;
            raw[j].screenX += Math.cos(angle) * push;
            raw[j].screenY += Math.sin(angle) * push;
          }
        }
      }

      // Keep all separated dots inside the circular globe viewport and within maxDriftPx
      for (const item of raw) {
        if (!item.visible) continue;
        const dx = item.screenX - item.exactX;
        const dy = item.screenY - item.exactY;
        const drift = Math.hypot(dx, dy);
        if (drift > maxDriftPx) {
          item.screenX = item.exactX + (dx / drift) * maxDriftPx;
          item.screenY = item.exactY + (dy / drift) * maxDriftPx;
        }
        const cx = item.screenX - CENTER;
        const cy = item.screenY - CENTER;
        const r = Math.hypot(cx, cy);
        const maxR = sphereClipRadius - 10;
        if (r > maxR) {
          item.screenX = CENTER + (cx / r) * maxR;
          item.screenY = CENTER + (cy / r) * maxR;
        }
      }
    }

    return raw;
  }, [
    universities,
    centerLat,
    centerLng,
    projectedScale,
    sphereClipRadius,
    zoom,
  ]);

  const filteredSelectedCoAuthors = useMemo(() => {
    if (!selectedUni) return [];
    const q = coAuthorQuery.trim().toLowerCase();
    if (!q) return selectedUni.coAuthors;
    return selectedUni.coAuthors.filter((ca) =>
      ca.name.toLowerCase().includes(q)
    );
  }, [selectedUni, coAuthorQuery]);

  return (
    <section
      id="global-map"
      aria-labelledby="globe-section-heading"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
    >
      {/* Top Toolbar */}
      <div className="px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2
            id="globe-section-heading"
            className="text-base font-bold text-slate-900 tracking-tight"
          >
            World Collaboration Map
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Globe region presets"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
          >
            {REGION_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setAutoRotate(false);
                  setCenterLat(preset.lat);
                  setCenterLng(preset.lng);
                }}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Zoom Controls with 1 km/px Deep Zoom Preset */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setAutoRotate(false);
                setZoom((z) =>
                  Math.max(MIN_ZOOM, Number((z / 1.45).toFixed(2)))
                );
              }}
              aria-label="Zoom out globe"
              className="p-1 text-xs font-medium text-slate-700 hover:bg-white rounded-md transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span
              data-testid="globe-resolution-badge"
              className="px-1.5 text-[11px] font-mono font-semibold text-slate-700 tabular-nums whitespace-nowrap"
              title={`Zoom ${zoom.toFixed(1)}x (${formatResolutionLabel(zoom)})`}
            >
              {formatResolutionLabel(zoom)}
            </span>
            <button
              type="button"
              onClick={() => {
                setAutoRotate(false);
                setZoom((z) =>
                  Math.min(MAX_ZOOM, Number((z * 1.45).toFixed(2)))
                );
              }}
              aria-label="Zoom in globe"
              className="p-1 text-xs font-medium text-slate-700 hover:bg-white rounded-md transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              data-testid="zoom-1km-button"
              onClick={() => {
                setAutoRotate(false);
                if (selectedUni) {
                  setCenterLat(selectedUni.lat);
                  setCenterLng(selectedUni.lng);
                }
                setZoom(ZOOM_1KM_PER_PX);
              }}
              className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded-md transition-colors whitespace-nowrap ${
                Math.abs(zoom - ZOOM_1KM_PER_PX) < 2
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-700 hover:bg-blue-50'
              }`}
              title="Zoom to 1 km/pixel scale centered on selected university"
            >
              1 km/px
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            aria-label={autoRotate ? 'Pause globe rotation' : 'Auto-rotate globe'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              autoRotate
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {autoRotate ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{autoRotate ? 'Pause' : 'Rotate'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAutoRotate(false);
              setCenterLat(profile.homeLat || 23.78);
              setCenterLng(profile.homeLng || 90.4);
              setZoom(1);
            }}
            aria-label="Reset globe orientation"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onExportChartPng(
                'chart-collaboration-globe',
                `Global University Collaborations — ${profile.name}`,
                'global_collaboration_globe.png',
                true
              )
            }
            aria-label="Export Collaboration Globe as PNG"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <ImageDown className="w-3.5 h-3.5" />
            <span>Export PNG</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left 7 Columns: Clean, Uncluttered Zoomable Globe Viewport */}
        <div
          id="chart-collaboration-globe"
          className="lg:col-span-7 p-4 sm:p-6 bg-slate-950 text-slate-100 flex items-center justify-center relative select-none"
        >
          <div
            ref={globeContainerRef}
            data-testid="round-world-globe"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onDoubleClick={() => {
              setAutoRotate(false);
              setZoom((z) =>
                Math.min(MAX_ZOOM, Number((z * 1.8).toFixed(2)))
              );
            }}
            className={`relative mx-auto w-full max-w-[500px] aspect-square flex items-center justify-center overflow-hidden rounded-full touch-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <svg
              viewBox={`0 0 ${GLOBE_SIZE} ${GLOBE_SIZE}`}
              className="w-full h-full overflow-hidden"
              aria-label="Interactive round-world collaboration globe with country boundaries"
            >
              <defs>
                <radialGradient id="oceanSphereGrad" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#162e4d" />
                  <stop offset="60%" stopColor="#0b1b32" />
                  <stop offset="100%" stopColor="#050d1a" />
                </radialGradient>
                <clipPath id="globeCircleClip">
                  <circle cx={CENTER} cy={CENTER} r={sphereClipRadius} />
                </clipPath>
              </defs>

              <circle
                cx={CENTER}
                cy={CENTER}
                r={sphereClipRadius}
                fill="url(#oceanSphereGrad)"
                stroke="#334155"
                strokeWidth="1.5"
              />

              <g clipPath="url(#globeCircleClip)">
                {/* Graticule lines */}
                {graticulePath && (
                  <path
                    d={graticulePath}
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.14)"
                    strokeWidth="0.6"
                  />
                )}

                {/* Individual Country Polygons */}
                {countryPaths.map((country) => (
                  <path
                    key={country.id}
                    d={country.d}
                    fill={
                      country.isCollab
                        ? 'rgba(14, 116, 144, 0.42)'
                        : 'rgba(30, 41, 59, 0.88)'
                    }
                    stroke={
                      country.isCollab
                        ? 'rgba(56, 189, 248, 0.65)'
                        : 'rgba(100, 116, 139, 0.45)'
                    }
                    strokeWidth={country.isCollab ? '0.9' : '0.6'}
                  >
                    <title>{country.name}</title>
                  </path>
                ))}

                {/* International Political Boundary Mesh */}
                {bordersMeshPath && (
                  <path
                    d={bordersMeshPath}
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.55)"
                    strokeWidth="0.65"
                  />
                )}

                {/* Great-Circle Collaboration Arcs */}
                {arcPaths.map((arc) => (
                  <path
                    key={`arc-${arc.id}`}
                    d={arc.d}
                    fill="none"
                    stroke={
                      arc.isSelected ? '#38bdf8' : 'rgba(56, 189, 248, 0.45)'
                    }
                    strokeWidth={arc.isSelected ? '2.2' : '1.15'}
                    strokeDasharray={arc.isSelected ? undefined : '3 3'}
                  />
                ))}

                {/* Leader lines from exact GPS campus coordinates to non-overlapping dot positions */}
                {projectedUniversities.map(
                  ({ uni, visible, exactX, exactY, screenX, screenY }) => {
                    if (!visible) return null;
                    const drift = Math.hypot(
                      screenX - exactX,
                      screenY - exactY
                    );
                    if (drift < 3) return null;
                    return (
                      <g key={`leader-${uni.universityId}`}>
                        <line
                          x1={exactX}
                          y1={exactY}
                          x2={screenX}
                          y2={screenY}
                          stroke="rgba(56, 189, 248, 0.65)"
                          strokeWidth="1"
                        />
                        <circle
                          cx={exactX}
                          cy={exactY}
                          r={2}
                          fill="#38bdf8"
                        />
                      </g>
                    );
                  }
                )}

                {/* Embedded SVG dots for PNG/PDF exports */}
                {projectedUniversities.map(
                  ({ uni, visible, screenX, screenY }) => {
                    if (!visible) return null;
                    const isHome =
                      uni.universityId === profile.homeUniversityId;
                    const isSelected =
                      selectedUni?.universityId === uni.universityId;
                    return (
                      <circle
                        key={`svg-dot-${uni.universityId}`}
                        cx={screenX}
                        cy={screenY}
                        r={isSelected ? 6.5 : 5}
                        fill={
                          isHome
                            ? '#fbbf24'
                            : isSelected
                            ? '#ffffff'
                            : '#38bdf8'
                        }
                        stroke="#0f172a"
                        strokeWidth="1.5"
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectUniversity(uni.universityId);
                        }}
                      />
                    );
                  }
                )}
              </g>
            </svg>

            {/* Easily Clickable University Dots (Generous hit area + crisp visual marker) */}
            {projectedUniversities.map(({ uni, visible, screenX, screenY }) => {
              if (!visible) return null;

              const isSelected = selectedUni?.universityId === uni.universityId;
              const isHome = uni.universityId === profile.homeUniversityId;
              const visualDotSize =
                zoom >= 8
                  ? 13
                  : Math.min(
                      18,
                      Math.max(11, 9 + Math.log2(uni.paperCount + 1) * 2.2)
                    );
              const hitAreaSize = Math.max(26, visualDotSize + 12);

              return (
                <button
                  key={uni.universityId}
                  type="button"
                  data-testid={`globe-dot-${uni.universityId}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectUniversity(uni.universityId);
                  }}
                  aria-label={`Inspect collaboration with ${uni.universityName} (${uni.paperCount} papers)`}
                  title={`${uni.universityName} (${uni.city}, ${uni.country}) — ${uni.lat.toFixed(4)}°N, ${uni.lng.toFixed(4)}°E — ${uni.paperCount} papers`}
                  style={{
                    left: `${(screenX / GLOBE_SIZE) * 100}%`,
                    top: `${(screenY / GLOBE_SIZE) * 100}%`,
                    width: `${hitAreaSize}px`,
                    height: `${hitAreaSize}px`,
                  }}
                  className={`group scroll-mt-28 absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer focus:outline-none ${
                    isSelected ? 'z-30' : 'z-20 hover:z-30'
                  }`}
                >
                  <span
                    style={{
                      width: `${visualDotSize}px`,
                      height: `${visualDotSize}px`,
                    }}
                    className={`block rounded-full transition-transform ${
                      isSelected
                        ? 'scale-125 ring-4 ring-sky-400/60'
                        : 'group-hover:scale-125 group-hover:ring-3 group-hover:ring-sky-300/50'
                    } ${
                      isHome
                        ? 'bg-amber-400 border-2 border-white shadow-sm'
                        : isSelected
                        ? 'bg-white border-2 border-sky-400 shadow-md'
                        : 'bg-sky-400 border border-slate-950 shadow-xs'
                    }`}
                  />
                  <span className="sr-only">
                    {uni.universityName} ({uni.paperCount} papers)
                  </span>
                </button>
              );
            })}

            {selectedUni &&
              (() => {
                const match = projectedUniversities.find(
                  (p) => p.uni.universityId === selectedUni.universityId
                );
                if (!match || !match.visible) return null;
                return (
                  <div
                    style={{
                      left: `${(match.screenX / GLOBE_SIZE) * 100}%`,
                      top: `${Math.max(
                        8,
                        ((match.screenY - 18) / GLOBE_SIZE) * 100
                      )}%`,
                    }}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-full z-30 bg-slate-900/95 border border-slate-700 text-white px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap shadow-md"
                  >
                    {selectedUni.universityName} · {selectedUni.paperCount}{' '}
                    {selectedUni.paperCount === 1 ? 'paper' : 'papers'}
                  </div>
                );
              })()}
          </div>
        </div>

        {/* Right 5 Columns: Selected University Inspector */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-white flex flex-col justify-between">
          {selectedUni ? (
            <div className="space-y-4">
              {/* Clean University Selector Dropdown */}
              <div>
                <label
                  htmlFor="inspector-university-select"
                  className="block text-[11px] font-medium text-slate-500 mb-1"
                >
                  Collaborating University ({universities.length})
                </label>
                <select
                  id="inspector-university-select"
                  value={selectedUni.universityId}
                  onChange={(e) => {
                    const target = universities.find(
                      (u) => u.universityId === e.target.value
                    );
                    if (target) focusOnUniversity(target);
                  }}
                  className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  {universities.map((u) => (
                    <option key={u.universityId} value={u.universityId}>
                      {u.universityName} ({u.country}) — {u.paperCount} papers
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-b border-slate-200 pb-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">
                      {selectedUni.city} · {selectedUni.country}
                    </div>
                    <h3
                      data-testid="selected-university-name"
                      className="text-lg font-bold text-slate-900 mt-0.5"
                    >
                      {selectedUni.universityName}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onFilterByUniversity(selectedUni.universityId)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>View Papers</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-[11px] text-slate-500">Papers</div>
                    <div
                      data-testid="selected-university-papers-count"
                      className="text-sm font-bold font-mono text-slate-900 tabular-nums"
                    >
                      {selectedUni.paperCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Citations</div>
                    <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                      {selectedUni.totalCitations.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Q1 Papers</div>
                    <div className="text-sm font-bold font-mono text-blue-700 tabular-nums">
                      {selectedUni.q1PaperCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Years</div>
                    <div className="text-xs font-semibold font-mono text-slate-800 tabular-nums mt-0.5">
                      {selectedUni.firstCollaborationYear}–
                      {selectedUni.latestCollaborationYear}
                    </div>
                  </div>
                </div>
              </div>

              {/* Co-Authors at Selected University */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-xs font-semibold text-slate-700">
                    Co-Authors ({filteredSelectedCoAuthors.length})
                  </h4>
                  <div className="relative w-44 sm:w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={coAuthorQuery}
                      onChange={(e) => setCoAuthorQuery(e.target.value)}
                      placeholder="Find co-author..."
                      aria-label="Find co-author in selected university"
                      className="w-full pl-7 pr-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg max-h-[150px] overflow-y-auto">
                  {filteredSelectedCoAuthors.map((author) => (
                    <div
                      key={author.name}
                      className="px-3 py-2 flex items-center justify-between gap-2 bg-slate-50/40 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {author.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                          {author.paperCount}{' '}
                          {author.paperCount === 1 ? 'paper' : 'papers'} ·{' '}
                          {author.citations.toLocaleString()} cit.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onFilterByCoAuthor(author.name)}
                        className="px-2 py-1 text-xs font-medium text-slate-700 hover:text-blue-700 bg-white border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Papers
                      </button>
                    </div>
                  ))}
                  {filteredSelectedCoAuthors.length === 0 && (
                    <div className="px-3 py-4 text-center text-xs text-slate-500">
                      No co-authors matching "{coAuthorQuery}".
                    </div>
                  )}
                </div>
              </div>

              {/* Collaborative Papers with Clickable Paper Titles */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">
                  Collaborative Papers ({selectedUni.papers.length})
                </h4>
                <div className="space-y-2 max-h-[175px] overflow-y-auto pr-1">
                  {selectedUni.papers.map((paper) => (
                    <article
                      key={paper.id}
                      className="p-3 border border-slate-200 rounded-lg bg-white hover:border-slate-300 transition-colors"
                    >
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">
                          {paper.quartile !== 'Unranked'
                            ? paper.quartile
                            : paper.type === 'Conference'
                            ? 'Conference'
                            : 'Non-Indexed'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[200px]">
                          {paper.venue}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {paper.year}
                        </span>
                      </div>
                      <h5 className="text-xs font-semibold text-slate-900 mt-1 leading-snug">
                        <a
                          href={getPublicationUrl(paper)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 hover:underline inline-flex items-start gap-1 group"
                        >
                          <span>{paper.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 text-slate-400 group-hover:text-blue-600" />
                        </a>
                      </h5>
                      <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span className="truncate">
                          {paper.coAuthors.map((ca) => ca.name).join(', ')}
                        </span>
                        <span className="font-mono font-semibold text-slate-900 tabular-nums shrink-0">
                          {paper.citations.toLocaleString()} cit.
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
