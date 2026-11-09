import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Filter,
  ImageDown,
  Search,
  ExternalLink,
  Plus,
  Minus,
  RotateCcw,
  Compass,
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
import countryDistrictsData from '../data/countryDistrictsGeo.json';
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

const districtsGeo = countryDistrictsData as any;
const BD_DISTRICT_FEATURES: any[] = districtsGeo?.bdDistricts?.features || [];
const BD_DISTRICT_CENTROIDS: { name: string; lat: number; lng: number }[] =
  districtsGeo?.bdCentroids || [];
const WORLD_SUBDIVISIONS_MESH: any =
  districtsGeo?.worldSubdivisionsMesh || null;

const GLOBE_WIDTH = 680;
const GLOBE_HEIGHT = 520;
const CENTER_X = GLOBE_WIDTH / 2;
const CENTER_Y = GLOBE_HEIGHT / 2;
const BASE_RADIUS = 210;
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 1500;

// Flattened full-world Equirectangular projection for PNG & PDF export
const FLAT_WIDTH = 1100;
const FLAT_HEIGHT = 540;
const FLAT_PROJECTION = geoEquirectangular()
  .scale(172)
  .translate([FLAT_WIDTH / 2, FLAT_HEIGHT / 2 + 18]);
const FLAT_PATH_GENERATOR = geoPath(FLAT_PROJECTION);
const FLAT_GRATICULE_PATH = FLAT_PATH_GENERATOR(STATIC_GRATICULE as any) || '';
const FLAT_BORDERS_PATH = FLAT_PATH_GENERATOR(WORLD_BORDERS_MESH as any) || '';

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
  const [hoveredUniId, setHoveredUniId] = useState<string | null>(null);

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

  const projectedScale = BASE_RADIUS * zoom;

  const pathGenerator = useMemo(() => {
    const proj = geoOrthographic()
      .translate([CENTER_X, CENTER_Y])
      .scale(projectedScale)
      .rotate([-centerLng, -centerLat, 0])
      .clipAngle(90)
      .clipExtent([
        [-60, -60],
        [GLOBE_WIDTH + 60, GLOBE_HEIGHT + 60],
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
      if (
        target &&
        (target.closest('button') || target.closest('[data-globe-dot="true"]'))
      ) {
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
            cur.zoom >= 40
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
    const curZoom = viewStateRef.current.zoom;
    const nextZoom = curZoom < 3.5 ? 4.2 : curZoom;
    scheduleViewUpdate({
      ...viewStateRef.current,
      lat: Math.max(-82, Math.min(82, uni.lat)),
      lng: uni.lng,
      zoom: nextZoom,
    });
    onSelectUniversity(uni.universityId);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-globe-dot="true"]')) {
      return;
    }
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

  // District & state/province internal boundaries when zoomed inside a country
  const worldSubdivisionsPath = useMemo(() => {
    if (zoom < 1.75 || !WORLD_SUBDIVISIONS_MESH) return '';
    return pathGenerator(WORLD_SUBDIVISIONS_MESH) || '';
  }, [pathGenerator, zoom]);

  const bdDistrictPaths = useMemo(() => {
    if (zoom < 1.75) return [];
    return BD_DISTRICT_FEATURES.map((feat, idx) => {
      const d = pathGenerator(feat);
      if (!d) return null;
      return {
        id: `bd-dist-${idx}-${feat.properties?.name || idx}`,
        name: String(feat.properties?.name || 'District'),
        d,
      };
    }).filter(Boolean) as { id: string; name: string; d: string }[];
  }, [pathGenerator, zoom]);

  const projectedDistrictLabels = useMemo(() => {
    if (zoom < 3.5) return [];
    const centerCoord: [number, number] = [centerLng, centerLat];
    const pointProj = geoOrthographic()
      .translate([CENTER_X, CENTER_Y])
      .scale(projectedScale)
      .rotate([-centerLng, -centerLat, 0])
      .clipAngle(90);

    const candidateLabels: { name: string; x: number; y: number }[] = [];
    const minLabelSep = zoom >= 12 ? 32 : 48;

    for (const dist of BD_DISTRICT_CENTROIDS) {
      const angularDist = geoDistance(centerCoord, [dist.lng, dist.lat]);
      if (angularDist > Math.PI / 2 - 0.02) continue;
      const pt = pointProj([dist.lng, dist.lat]);
      if (!pt) continue;
      const [x, y] = pt;
      if (x < 24 || x > GLOBE_WIDTH - 24 || y < 24 || y > GLOBE_HEIGHT - 24) {
        continue;
      }
      // Prevent label overlap at intermediate zooms
      const tooClose = candidateLabels.some(
        (existing) => Math.hypot(existing.x - x, existing.y - y) < minLabelSep
      );
      if (!tooClose) {
        candidateLabels.push({ name: dist.name, x, y });
      }
    }
    return candidateLabels;
  }, [centerLat, centerLng, projectedScale, zoom]);

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
      .translate([CENTER_X, CENTER_Y])
      .scale(projectedScale)
      .rotate([-centerLng, -centerLat, 0])
      .clipAngle(90);

    const raw = universities.map((u) => {
      const angularDist = geoDistance(centerCoord, [u.lng, u.lat]);
      const visible = angularDist <= Math.PI / 2 - 0.01;
      const pt = visible ? pointProj([u.lng, u.lat]) : null;
      const x = pt ? pt[0] : CENTER_X;
      const y = pt ? pt[1] : CENTER_Y;
      const inViewport =
        Boolean(visible && pt) &&
        x >= -30 &&
        x <= GLOBE_WIDTH + 30 &&
        y >= -30 &&
        y <= GLOBE_HEIGHT + 30;
      return {
        uni: u,
        visible: inViewport,
        exactX: x,
        exactY: y,
        screenX: x,
        screenY: y,
      };
    });

    // Subtle on-globe spacing so co-located city universities (e.g. in Dhaka) are individually clickable without any second floating dot
    const visibleItems = raw.filter((item) => item.visible);
    const minSepPx = zoom >= 25 ? 12 : zoom >= 6 ? 15 : 14;
    const maxDriftPx = zoom >= 25 ? 6 : zoom >= 6 ? 18 : 22;

    for (let iter = 0; iter < 6; iter++) {
      for (let i = 0; i < visibleItems.length; i++) {
        for (let j = i + 1; j < visibleItems.length; j++) {
          const dx = visibleItems[j].screenX - visibleItems[i].screenX;
          const dy = visibleItems[j].screenY - visibleItems[i].screenY;
          const dist = Math.hypot(dx, dy);
          if (dist < minSepPx) {
            const angle =
              dist > 0.05
                ? Math.atan2(dy, dx)
                : ((i * 7 + j * 13) % 12) * 0.52;
            const push = (minSepPx - dist) * 0.42;
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
        // Keep strictly inside the globe circle
        const cx = item.screenX - CENTER_X;
        const cy = item.screenY - CENTER_Y;
        const r = Math.hypot(cx, cy);
        const maxR = Math.max(10, projectedScale - 8);
        if (r > maxR && r > 0) {
          item.screenX = CENTER_X + (cx / r) * maxR;
          item.screenY = CENTER_Y + (cy / r) * maxR;
        }
      }
    }

    return raw;
  }, [universities, centerLat, centerLng, projectedScale, zoom]);

  // Precomputed flattened world map data for PNG & PDF exports
  const flatMapData = useMemo(() => {
    const countries = WORLD_COUNTRY_FEATURES.map((feat, idx) => {
      const d = FLAT_PATH_GENERATOR(feat);
      if (!d) return null;
      const name = String(feat.properties?.name || `country-${idx}`);
      const isCollab = matchesCollaboratingCountry(
        name,
        collaboratingCountryNames
      );
      return { id: `flat-${idx}`, name, d, isCollab };
    }).filter(Boolean) as {
      id: string;
      name: string;
      d: string;
      isCollab: boolean;
    }[];

    const homePt = FLAT_PROJECTION([
      profile.homeLng || 90.4,
      profile.homeLat || 23.78,
    ]) || [FLAT_WIDTH / 2, FLAT_HEIGHT / 2];

    const nodes = universities.map((u) => {
      const pt = FLAT_PROJECTION([u.lng, u.lat]) || [
        FLAT_WIDTH / 2,
        FLAT_HEIGHT / 2,
      ];
      return {
        uni: u,
        x: pt[0],
        y: pt[1],
        isHome: u.universityId === profile.homeUniversityId,
      };
    });

    const arcs = nodes
      .filter((n) => !n.isHome)
      .map((n) => {
        const midX = (homePt[0] + n.x) / 2;
        const dist = Math.hypot(n.x - homePt[0], n.y - homePt[1]);
        const midY = Math.max(24, (homePt[1] + n.y) / 2 - dist * 0.18);
        return {
          id: `flat-arc-${n.uni.universityId}`,
          d: `M ${homePt[0].toFixed(1)} ${homePt[1].toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${n.x.toFixed(1)} ${n.y.toFixed(1)}`,
        };
      });

    // Place non-overlapping labels for top institutions on the flat map
    const labelNodes: {
      id: string;
      text: string;
      x: number;
      y: number;
      isHome: boolean;
    }[] = [];
    for (const n of nodes.slice(0, 12)) {
      const labelY = n.y - 11;
      const overlaps = labelNodes.some(
        (l) => Math.abs(l.x - n.x) < 95 && Math.abs(l.y - labelY) < 16
      );
      if (!overlaps) {
        const shortName =
          n.uni.universityName.length > 28
            ? `${n.uni.universityName.slice(0, 26)}…`
            : n.uni.universityName;
        labelNodes.push({
          id: n.uni.universityId,
          text: `${shortName} (${n.uni.paperCount})`,
          x: Math.max(70, Math.min(FLAT_WIDTH - 70, n.x)),
          y: Math.max(18, labelY),
          isHome: n.isHome,
        });
      }
    }

    return { countries, nodes, arcs, labelNodes };
  }, [universities, profile, collaboratingCountryNames]);

  const filteredSelectedCoAuthors = useMemo(() => {
    if (!selectedUni) return [];
    const q = coAuthorQuery.trim().toLowerCase();
    if (!q) return selectedUni.coAuthors;
    return selectedUni.coAuthors.filter((ca) =>
      ca.name.toLowerCase().includes(q)
    );
  }, [selectedUni, coAuthorQuery]);

  const activeBadgeUni = useMemo(() => {
    if (hoveredUniId) {
      const hovered = universities.find((u) => u.universityId === hoveredUniId);
      if (hovered) return hovered;
    }
    return selectedUni;
  }, [hoveredUniId, universities, selectedUni]);

  return (
    <section
      id="global-map"
      aria-labelledby="globe-section-heading"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs relative"
    >
      {/* Offscreen Full Flattened World Map used when exporting PNG or PDF Report */}
      <div
        id="chart-collaboration-globe-flat"
        aria-hidden="true"
        className="fixed -left-[9999px] -top-[9999px] w-[1100px] h-[540px] pointer-events-none overflow-hidden"
      >
        <svg
          viewBox={`0 0 ${FLAT_WIDTH} ${FLAT_HEIGHT}`}
          width={FLAT_WIDTH}
          height={FLAT_HEIGHT}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="flatOceanBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#091526" />
              <stop offset="50%" stopColor="#0c1f38" />
              <stop offset="100%" stopColor="#071120" />
            </linearGradient>
          </defs>
          <rect
            x={0}
            y={0}
            width={FLAT_WIDTH}
            height={FLAT_HEIGHT}
            rx={12}
            fill="url(#flatOceanBg)"
          />
          {FLAT_GRATICULE_PATH && (
            <path
              d={FLAT_GRATICULE_PATH}
              fill="none"
              stroke="rgba(148, 163, 184, 0.14)"
              strokeWidth="0.6"
            />
          )}
          {flatMapData.countries.map((c) => (
            <path
              key={c.id}
              d={c.d}
              fill={
                c.isCollab
                  ? 'rgba(14, 116, 144, 0.48)'
                  : 'rgba(30, 41, 59, 0.85)'
              }
              stroke={
                c.isCollab
                  ? 'rgba(56, 189, 248, 0.75)'
                  : 'rgba(100, 116, 139, 0.4)'
              }
              strokeWidth={c.isCollab ? '0.9' : '0.5'}
            />
          ))}
          {FLAT_BORDERS_PATH && (
            <path
              d={FLAT_BORDERS_PATH}
              fill="none"
              stroke="rgba(148, 163, 184, 0.45)"
              strokeWidth="0.55"
            />
          )}
          {flatMapData.arcs.map((arc) => (
            <path
              key={arc.id}
              d={arc.d}
              fill="none"
              stroke="rgba(56, 189, 248, 0.65)"
              strokeWidth="1.4"
              strokeDasharray="4 3"
            />
          ))}
          {flatMapData.nodes.map((n) => (
            <g key={`flat-node-${n.uni.universityId}`}>
              <circle
                cx={n.x}
                cy={n.y}
                r={n.isHome ? 8.5 : 6.5}
                fill={
                  n.isHome
                    ? 'rgba(251, 191, 36, 0.28)'
                    : 'rgba(56, 189, 248, 0.25)'
                }
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={n.isHome ? 5.5 : 4.2}
                fill={n.isHome ? '#fbbf24' : '#38bdf8'}
                stroke="#0f172a"
                strokeWidth="1.4"
              />
            </g>
          ))}
          {flatMapData.labelNodes.map((lbl) => (
            <g key={`flat-lbl-${lbl.id}`}>
              <rect
                x={lbl.x - lbl.text.length * 3.1 - 6}
                y={lbl.y - 10}
                width={lbl.text.length * 6.2 + 12}
                height={15}
                rx={4}
                fill="rgba(15, 23, 42, 0.88)"
                stroke={lbl.isHome ? '#fbbf24' : 'rgba(56, 189, 248, 0.5)'}
                strokeWidth="0.8"
              />
              <text
                x={lbl.x}
                y={lbl.y + 0.5}
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="9.5"
                fontWeight="600"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {lbl.text}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Top Header */}
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
              'global_collaboration_world_map.png',
              true
            )
          }
          aria-label="Export Flattened World Collaboration Map as PNG"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ImageDown className="w-3.5 h-3.5" />
          <span>Export World Map PNG</span>
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
            className={`relative w-full h-[480px] sm:h-[520px] flex items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950 touch-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <svg
              viewBox={`0 0 ${GLOBE_WIDTH} ${GLOBE_HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full overflow-hidden"
              aria-label="Interactive round-world collaboration globe with country and district boundaries"
            >
              <defs>
                <radialGradient id="oceanSphereGrad" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#162e4d" />
                  <stop offset="60%" stopColor="#0b1b32" />
                  <stop offset="100%" stopColor="#050d1a" />
                </radialGradient>
                <clipPath id="globeCircleClip">
                  <circle cx={CENTER_X} cy={CENTER_Y} r={projectedScale} />
                </clipPath>
              </defs>

              <circle
                cx={CENTER_X}
                cy={CENTER_Y}
                r={projectedScale}
                fill="url(#oceanSphereGrad)"
                stroke="#334155"
                strokeWidth={zoom > 3 ? 0 : 1.5}
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

                {/* Global state/province/division boundaries when zoomed in */}
                {worldSubdivisionsPath && (
                  <path
                    d={worldSubdivisionsPath}
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.36)"
                    strokeWidth="0.65"
                    strokeDasharray="2.5 2"
                  />
                )}

                {/* Detailed district boundaries inside the country when zoomed in */}
                {bdDistrictPaths.map((dist) => (
                  <path
                    key={dist.id}
                    d={dist.d}
                    fill="rgba(14, 116, 144, 0.12)"
                    stroke="rgba(125, 211, 252, 0.52)"
                    strokeWidth={zoom >= 6 ? '0.9' : '0.65'}
                    strokeDasharray="2 1.5"
                  >
                    <title>{dist.name} District</title>
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

                {/* District name labels when zoomed into a country */}
                {projectedDistrictLabels.map((lbl) => (
                  <text
                    key={`dist-lbl-${lbl.name}`}
                    x={lbl.x}
                    y={lbl.y}
                    textAnchor="middle"
                    fill="rgba(226, 232, 240, 0.78)"
                    fontSize={zoom >= 10 ? '10' : '8.5'}
                    fontWeight="500"
                    className="pointer-events-none select-none"
                    style={{
                      paintOrder: 'stroke',
                      stroke: 'rgba(15, 23, 42, 0.85)',
                      strokeWidth: '2.4px',
                    }}
                  >
                    {lbl.name}
                  </text>
                ))}

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

                {/* Single, clear, easily clickable university dot directly on the round globe (zero duplicate floating dots) */}
                {projectedUniversities.map(
                  ({ uni, visible, screenX, screenY }) => {
                    if (!visible) return null;
                    const isHome =
                      uni.universityId === profile.homeUniversityId;
                    const isSelected =
                      selectedUni?.universityId === uni.universityId;
                    const isHovered = hoveredUniId === uni.universityId;
                    const dotRadius = isSelected
                      ? 8.5
                      : isHovered
                      ? 8
                      : isHome
                      ? 7.5
                      : 6.5;

                    return (
                      <g
                        key={`globe-node-${uni.universityId}`}
                        data-testid={`globe-dot-${uni.universityId}`}
                        data-globe-dot="true"
                        role="button"
                        tabIndex={0}
                        aria-label={`Inspect collaboration with ${uni.universityName} (${uni.paperCount} papers)`}
                        className="cursor-pointer focus:outline-none"
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseEnter={() => setHoveredUniId(uni.universityId)}
                        onMouseLeave={() =>
                          setHoveredUniId((prev) =>
                            prev === uni.universityId ? null : prev
                          )
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          focusOnUniversity(uni);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            focusOnUniversity(uni);
                          }
                        }}
                      >
                        <title>{`${uni.universityName} (${uni.city}, ${uni.country}) — ${uni.paperCount} papers`}</title>
                        {/* Generous transparent hit area so tapping/clicking is effortless */}
                        <circle
                          cx={screenX}
                          cy={screenY}
                          r={15}
                          fill="transparent"
                        />
                        {/* Outer halo ring for selected, hovered, or home institution */}
                        {(isSelected || isHovered || isHome) && (
                          <circle
                            cx={screenX}
                            cy={screenY}
                            r={dotRadius + 4.5}
                            fill={
                              isHome
                                ? 'rgba(251, 191, 36, 0.28)'
                                : 'rgba(56, 189, 248, 0.35)'
                            }
                            stroke={
                              isSelected
                                ? '#38bdf8'
                                : isHome
                                ? 'rgba(251, 191, 36, 0.65)'
                                : 'rgba(56, 189, 248, 0.6)'
                            }
                            strokeWidth={isSelected ? '1.6' : '1'}
                          />
                        )}
                        {/* Primary on-globe university marker */}
                        <circle
                          cx={screenX}
                          cy={screenY}
                          r={dotRadius}
                          fill={
                            isHome
                              ? '#fbbf24'
                              : isSelected
                              ? '#ffffff'
                              : '#38bdf8'
                          }
                          stroke={isSelected ? '#0284c7' : '#0f172a'}
                          strokeWidth={isSelected ? '2.4' : '1.8'}
                        />
                      </g>
                    );
                  }
                )}
              </g>
            </svg>

            {/* Non-obtrusive Active University Badge: Pinned at top-left so it NEVER covers any dots */}
            {activeBadgeUni && (
              <div className="pointer-events-none absolute top-3 left-3 z-30 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 max-w-[85%]">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ring-2 ${
                    activeBadgeUni.universityId === profile.homeUniversityId
                      ? 'bg-amber-400 ring-amber-400/30'
                      : 'bg-sky-400 ring-sky-400/30'
                  }`}
                />
                <div className="truncate text-xs font-semibold">
                  {activeBadgeUni.universityName}
                  <span className="text-slate-300 font-normal ml-1.5 font-mono text-[11px]">
                    · {activeBadgeUni.paperCount}{' '}
                    {activeBadgeUni.paperCount === 1 ? 'paper' : 'papers'} ·{' '}
                    {activeBadgeUni.coAuthors.length}{' '}
                    {activeBadgeUni.coAuthors.length === 1
                      ? 'co-author'
                      : 'co-authors'}{' '}
                    ({activeBadgeUni.city}, {activeBadgeUni.country})
                  </span>
                </div>
              </div>
            )}

            {/* Floating Globe Controls: Zoom In, Zoom Out, Recenter, Auto-Rotate */}
            <div className="absolute bottom-3 right-3 z-30 flex flex-col items-center gap-1 bg-slate-900/85 backdrop-blur-xs p-1 rounded-lg border border-slate-700/80 shadow-md">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoRotate(false);
                  const cur = viewStateRef.current;
                  const nextZoom = Math.min(
                    MAX_ZOOM,
                    Number((cur.zoom * 1.6).toFixed(2))
                  );
                  scheduleViewUpdate({ ...cur, zoom: nextZoom });
                }}
                title="Zoom in (up to 1500x)"
                aria-label="Zoom in"
                className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoRotate(false);
                  const cur = viewStateRef.current;
                  const nextZoom = Math.max(
                    MIN_ZOOM,
                    Number((cur.zoom / 1.6).toFixed(2))
                  );
                  scheduleViewUpdate({ ...cur, zoom: nextZoom });
                }}
                title="Zoom out"
                aria-label="Zoom out"
                className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="w-4 h-px bg-slate-700/60 my-0.5" />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoRotate(false);
                  scheduleViewUpdate({
                    lat: Math.max(-80, Math.min(80, profile.homeLat || 23.78)),
                    lng: profile.homeLng || 90.4,
                    zoom: 1,
                  });
                }}
                title="Recenter to home institution"
                aria-label="Recenter to home institution"
                className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoRotate((prev) => !prev);
                }}
                title={autoRotate ? 'Pause rotation' : 'Auto-rotate globe'}
                aria-label="Toggle auto rotation"
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  autoRotate
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
              </button>

              <div className="text-[10px] font-mono text-slate-400 px-1 py-0.5 tabular-nums">
                {zoom >= 10 ? `${Math.round(zoom)}x` : `${zoom.toFixed(1)}x`}
              </div>
            </div>
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
