import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Filter,
  ImageDown,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  geoOrthographic,
  geoEquirectangular,
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
const STATIC_GRATICULE = geoGraticule().step([15, 15])();

const GLOBE_SIZE = 500;
const CENTER = GLOBE_SIZE / 2;
const VIEWPORT_RADIUS = 230;
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 250;

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
  const [viewState, setViewState] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  }>({
    lat: Math.max(-80, Math.min(80, profile.homeLat || 23.78)),
    lng: profile.homeLng || 90.4,
    zoom: 1,
  });
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [coAuthorQuery, setCoAuthorQuery] = useState<string>('');

  const centerLat = viewState.lat;
  const centerLng = viewState.lng;
  const zoom = viewState.zoom;

  const viewStateRef = useRef(viewState);
  viewStateRef.current = viewState;

  const globeContainerRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingViewRef = useRef<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);

  const mouseDragRef = useRef<{
    x: number;
    y: number;
    lat: number;
    lng: number;
  } | null>(null);

  const touchGestureRef = useRef<{
    mode: 'none' | 'pan' | 'pinch';
    startX: number;
    startY: number;
    startLat: number;
    startLng: number;
    startDist: number;
    startZoom: number;
    lastTapTime: number;
    lastTapX: number;
    lastTapY: number;
  }>({
    mode: 'none',
    startX: 0,
    startY: 0,
    startLat: 0,
    startLng: 0,
    startDist: 1,
    startZoom: 1,
    lastTapTime: 0,
    lastTapX: 0,
    lastTapY: 0,
  });

  const scheduleViewUpdate = (next: {
    lat: number;
    lng: number;
    zoom: number;
  }) => {
    pendingViewRef.current = next;
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (pendingViewRef.current) {
        setViewState(pendingViewRef.current);
      }
    });
  };

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setViewState({
      lat: Math.max(-80, Math.min(80, profile.homeLat || 23.78)),
      lng: profile.homeLng || 90.4,
      zoom: 1,
    });
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

  const pathGenerator = useMemo(() => {
    const proj = geoOrthographic()
      .translate([CENTER, CENTER])
      .scale(projectedScale)
      .rotate([-centerLng, -centerLat, 0])
      .clipAngle(90)
      .clipExtent([
        [0, 0],
        [GLOBE_SIZE, GLOBE_SIZE],
      ])
      .precision(0.35);
    return geoPath(proj);
  }, [centerLat, centerLng, projectedScale]);

  // Native wheel + Android multi-touch pinch-to-zoom and single-finger pan
  useEffect(() => {
    const el = globeContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setAutoRotate(false);
      const factor = e.deltaY < 0 ? 1.32 : 1 / 1.32;
      const cur = viewStateRef.current;
      const nextZoom = Number(
        Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cur.zoom * factor)).toFixed(2)
      );
      scheduleViewUpdate({ ...cur, zoom: nextZoom });
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button')) {
        return;
      }
      setAutoRotate(false);
      const cur = viewStateRef.current;
      const g = touchGestureRef.current;

      if (e.touches.length === 2) {
        e.preventDefault();
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const dist = Math.max(
          10,
          Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
        );
        const midX = (t0.clientX + t1.clientX) / 2;
        const midY = (t0.clientY + t1.clientY) / 2;
        g.mode = 'pinch';
        g.startDist = dist;
        g.startZoom = cur.zoom;
        g.startX = midX;
        g.startY = midY;
        g.startLat = cur.lat;
        g.startLng = cur.lng;
        setIsDragging(true);
      } else if (e.touches.length === 1) {
        const t0 = e.touches[0];
        const now = Date.now();
        if (
          now - g.lastTapTime < 280 &&
          Math.hypot(t0.clientX - g.lastTapX, t0.clientY - g.lastTapY) < 28
        ) {
          e.preventDefault();
          g.lastTapTime = 0;
          const nextZoom =
            cur.zoom >= 20
              ? 1
              : Number(Math.min(MAX_ZOOM, cur.zoom * 2.1).toFixed(2));
          scheduleViewUpdate({ ...cur, zoom: nextZoom });
          return;
        }
        g.lastTapTime = now;
        g.lastTapX = t0.clientX;
        g.lastTapY = t0.clientY;
        g.mode = 'pan';
        g.startX = t0.clientX;
        g.startY = t0.clientY;
        g.startLat = cur.lat;
        g.startLng = cur.lng;
        setIsDragging(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const g = touchGestureRef.current;
      if (g.mode === 'none') return;
      e.preventDefault();

      if (e.touches.length === 2) {
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const dist = Math.max(
          10,
          Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
        );
        const midX = (t0.clientX + t1.clientX) / 2;
        const midY = (t0.clientY + t1.clientY) / 2;

        if (g.mode !== 'pinch') {
          const cur = viewStateRef.current;
          g.mode = 'pinch';
          g.startDist = dist;
          g.startZoom = cur.zoom;
          g.startX = midX;
          g.startY = midY;
          g.startLat = cur.lat;
          g.startLng = cur.lng;
          return;
        }

        const scaleRatio = dist / g.startDist;
        const nextZoom = Number(
          Math.min(
            MAX_ZOOM,
            Math.max(MIN_ZOOM, g.startZoom * scaleRatio)
          ).toFixed(2)
        );
        const dx = midX - g.startX;
        const dy = midY - g.startY;
        const sensitivity = 0.42 / nextZoom;
        const nextLng = ((g.startLng - dx * sensitivity + 540) % 360) - 180;
        const nextLat = Math.max(
          -85,
          Math.min(85, g.startLat + dy * sensitivity)
        );
        scheduleViewUpdate({ lat: nextLat, lng: nextLng, zoom: nextZoom });
      } else if (e.touches.length === 1 && g.mode === 'pan') {
        const t0 = e.touches[0];
        const curZoom = viewStateRef.current.zoom;
        const dx = t0.clientX - g.startX;
        const dy = t0.clientY - g.startY;
        const sensitivity = 0.42 / curZoom;
        const nextLng = ((g.startLng - dx * sensitivity + 540) % 360) - 180;
        const nextLat = Math.max(
          -85,
          Math.min(85, g.startLat + dy * sensitivity)
        );
        scheduleViewUpdate({
          lat: nextLat,
          lng: nextLng,
          zoom: curZoom,
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const g = touchGestureRef.current;
      if (e.touches.length === 0) {
        g.mode = 'none';
        setIsDragging(false);
      } else if (e.touches.length === 1) {
        const t0 = e.touches[0];
        const cur = viewStateRef.current;
        g.mode = 'pan';
        g.startX = t0.clientX;
        g.startY = t0.clientY;
        g.startLat = cur.lat;
        g.startLng = cur.lng;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
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
      setViewState((prev) => {
        const nextLng = prev.lng + 1.2;
        return {
          ...prev,
          lng: nextLng > 180 ? nextLng - 360 : nextLng,
        };
      });
    }, 60);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  const focusOnUniversity = (uni: UniversityCollaboration) => {
    setAutoRotate(false);
    setViewState((prev) => ({
      ...prev,
      lat: Math.max(-82, Math.min(82, uni.lat)),
      lng: uni.lng,
    }));
    onSelectUniversity(uni.universityId);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setAutoRotate(false);
    mouseDragRef.current = {
      x: e.clientX,
      y: e.clientY,
      lat: centerLat,
      lng: centerLng,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (!isDragging || !mouseDragRef.current) return;
    const dx = e.clientX - mouseDragRef.current.x;
    const dy = e.clientY - mouseDragRef.current.y;
    const sensitivity = 0.42 / zoom;
    const nextLng =
      ((mouseDragRef.current.lng - dx * sensitivity + 540) % 360) - 180;
    const nextLat = Math.max(
      -85,
      Math.min(85, mouseDragRef.current.lat + dy * sensitivity)
    );
    scheduleViewUpdate({ lat: nextLat, lng: nextLng, zoom });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    setIsDragging(false);
    mouseDragRef.current = null;
  };

  const graticulePath = useMemo(() => {
    return pathGenerator(STATIC_GRATICULE as any) || '';
  }, [pathGenerator]);

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

    const visibleItems = raw.filter((item) => item.visible);
    const minSepPx = zoom >= 6 ? 20 : zoom >= 2 ? 15 : 11;
    const maxDriftPx = zoom >= 10 ? 110 : zoom >= 3 ? 75 : 32;
    const iterations = zoom >= 3 ? 10 : 6;

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < visibleItems.length; i++) {
        for (let j = i + 1; j < visibleItems.length; j++) {
          const dx = visibleItems[j].screenX - visibleItems[i].screenX;
          const dy = visibleItems[j].screenY - visibleItems[i].screenY;
          const dist = Math.hypot(dx, dy);
          if (dist < minSepPx) {
            const angle =
              dist > 0.05 ? Math.atan2(dy, dx) : ((i * 7 + j * 13) % 12) * 0.52;
            const push = (minSepPx - dist) * 0.45;
            visibleItems[i].screenX -= Math.cos(angle) * push;
            visibleItems[i].screenY -= Math.sin(angle) * push;
            visibleItems[j].screenX += Math.cos(angle) * push;
            visibleItems[j].screenY += Math.sin(angle) * push;
          }
        }
      }

      for (const item of visibleItems) {
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
      {/* Top Header: Clean on Android/Mobile (manual zoom & surrounding buttons hidden on mobile/Android) */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4">
        <h2
          id="globe-section-heading"
          className="text-base font-bold text-slate-900 tracking-tight"
        >
          World Collaboration Map
        </h2>

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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <ImageDown className="w-3.5 h-3.5" />
          <span>Export PNG</span>
        </button>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left 7 Columns: Clean, Uncluttered Pinch-Zoomable Globe Viewport */}
        <div
          id="chart-collaboration-globe"
          className="lg:col-span-7 p-3 sm:p-6 bg-slate-950 text-slate-100 flex items-center justify-center relative select-none"
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
              setViewState((prev) => ({
                ...prev,
                zoom: Math.min(
                  MAX_ZOOM,
                  Number((prev.zoom * 1.8).toFixed(2))
                ),
              }));
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
                {graticulePath && (
                  <path
                    d={graticulePath}
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.14)"
                    strokeWidth="0.6"
                  />
                )}

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

                {bordersMeshPath && (
                  <path
                    d={bordersMeshPath}
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.55)"
                    strokeWidth="0.65"
                  />
                )}

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

            {/* Easily Clickable University Dots */}
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
              const hitAreaSize = Math.max(28, visualDotSize + 14);

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
