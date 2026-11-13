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
  ChevronDown,
  X,
} from 'lucide-react';
import {
  geoOrthographic,
  geoEquirectangular,
  geoPath,
  geoGraticule,
  geoDistance,
  geoInterpolate,
} from 'd3-geo';
import * as topojson from 'topojson-client';
import worldAtlasData from 'world-atlas/countries-50m.json';
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
  onSelectResearcher?: (name: string, scholarUserId?: string) => void;
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
const GLOBAL_DISTRICT_SEGMENTS: [number, number, [number, number][]][] =
  districtsGeo?.segments || [];

const GLOBE_WIDTH = 680;
const GLOBE_HEIGHT = 520;
const CENTER_X = GLOBE_WIDTH / 2;
const CENTER_Y = GLOBE_HEIGHT / 2;
const BASE_RADIUS = 236;
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 1500;

// Flattened full-world Equirectangular projection for PNG & PDF export
const FLAT_WIDTH = 1100;
const FLAT_HEIGHT = 540;
const FLAT_PROJECTION = geoEquirectangular()
  .scale(172)
  .translate([FLAT_WIDTH / 2, FLAT_HEIGHT / 2 + 18])
  .precision(0.1);
const FLAT_PATH_GENERATOR = geoPath(FLAT_PROJECTION);
const FLAT_GRATICULE_PATH = FLAT_PATH_GENERATOR(STATIC_GRATICULE as any) || '';
const FLAT_BORDERS_PATH = FLAT_PATH_GENERATOR(WORLD_BORDERS_MESH as any) || '';

function matchesCollaboratingCountry(
  featureName: string,
  collabCountries: Set<string>
): boolean {
  const f = (featureName || '').toLowerCase().trim();
  if (!f) return false;
  if (collabCountries.has(f)) return true;
  if (
    (f === 'united states of america' || f === 'united states') &&
    (collabCountries.has('united states') ||
      collabCountries.has('united states of america'))
  ) {
    return true;
  }
  if (
    (f === 'czechia' || f === 'czech republic') &&
    (collabCountries.has('czech republic') || collabCountries.has('czechia'))
  ) {
    return true;
  }
  if (
    (f === 'south korea' || f === 'republic of korea') &&
    (collabCountries.has('south korea') ||
      collabCountries.has('republic of korea'))
  ) {
    return true;
  }
  if (
    (f === 'china' || f === 'hong kong') &&
    collabCountries.has('china (hong kong)')
  ) {
    return true;
  }
  return false;
}

interface FlatWorldCollaborationMapProps {
  profile: ResearcherProfile;
  universities: UniversityCollaboration[];
  onSelectUniversity?: (universityId: string) => void;
}

export const FlatWorldCollaborationMap: React.FC<
  FlatWorldCollaborationMapProps
> = ({ profile, universities, onSelectUniversity }) => {
  const collaboratingCountryNames = useMemo(() => {
    const s = new Set<string>();
    for (const u of universities) {
      if (u.country) s.add(u.country.toLowerCase().trim());
    }
    return s;
  }, [universities]);

  const flatMapData = useMemo(() => {
    const countries = WORLD_COUNTRY_FEATURES.map((feat, idx) => {
      const d = FLAT_PATH_GENERATOR(feat);
      if (!d) return null;
      const name = String(feat.properties?.name || `country-${idx}`);
      const isCollab = matchesCollaboratingCountry(
        name,
        collaboratingCountryNames
      );
      return { id: `overview-flat-${idx}`, name, d, isCollab };
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

    const nodes = universities
      .map((u) => {
        const pt = FLAT_PROJECTION([u.lng, u.lat]) || [
          FLAT_WIDTH / 2,
          FLAT_HEIGHT / 2,
        ];
        return {
          uni: u,
          x: pt[0],
          y: pt[1],
          isHome:
            u.universityId === profile.homeUniversityId || u.isHomeInstitution,
        };
      })
      .sort((a, b) => Number(a.isHome) - Number(b.isHome));

    const arcs = nodes
      .filter((n) => !n.isHome)
      .map((n) => {
        const midX = (homePt[0] + n.x) / 2;
        const dist = Math.hypot(n.x - homePt[0], n.y - homePt[1]);
        const archLift = Math.max(5, Math.min(18, dist * 0.06));
        const midY = Math.max(14, (homePt[1] + n.y) / 2 - archLift);
        const startY = homePt[1] - 1.5;
        const endY = n.y - 1.5;
        return {
          id: `overview-flat-arc-${n.uni.universityId}`,
          d: `M ${homePt[0].toFixed(1)} ${startY.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${n.x.toFixed(1)} ${endY.toFixed(1)}`,
        };
      });

    return { countries, nodes, arcs };
  }, [universities, profile, collaboratingCountryNames]);

  return (
    <section
      aria-label="Global Collaboration Map"
      className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-900">
          Global Collaboration Map
        </h2>
      </div>
      <div
        id="chart-collaboration-globe-flat-overview"
        className="w-full overflow-hidden rounded-lg border border-slate-800 bg-[#091526]"
      >
        <svg
          data-chart-svg="true"
          viewBox={`0 0 ${FLAT_WIDTH} ${FLAT_HEIGHT}`}
          className="w-full h-auto block scholar-chart-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="overviewFlatOceanBg"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
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
            fill="url(#overviewFlatOceanBg)"
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
                  ? 'rgba(56, 189, 248, 0.78)'
                  : 'rgba(100, 116, 139, 0.4)'
              }
              strokeWidth={c.isCollab ? '0.9' : '0.5'}
            >
              <title>{c.name}</title>
            </path>
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
            <g key={arc.id} className="pointer-events-none">
              <path
                d={arc.d}
                fill="none"
                stroke="rgba(56, 189, 248, 0.16)"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
              <path
                d={arc.d}
                fill="none"
                stroke="rgba(125, 211, 252, 0.82)"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
            </g>
          ))}
          {flatMapData.nodes.map((n) => (
            <g
              key={`overview-flat-node-${n.uni.universityId}`}
              className={onSelectUniversity ? 'cursor-pointer' : undefined}
              onClick={() => onSelectUniversity?.(n.uni.universityId)}
            >
              <title>{`${n.uni.universityName} — ${n.uni.paperCount} papers`}</title>
              <circle
                cx={n.x}
                cy={n.y}
                r={n.isHome ? 11 : 6.2}
                fill={
                  n.isHome
                    ? 'rgba(249, 115, 22, 0.36)'
                    : 'rgba(56, 189, 248, 0.24)'
                }
                stroke={n.isHome ? 'rgba(251, 191, 36, 0.85)' : 'none'}
                strokeWidth={n.isHome ? '1.2' : '0'}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={n.isHome ? 6.5 : 4.2}
                fill={n.isHome ? '#f97316' : '#38bdf8'}
                stroke={n.isHome ? '#ffffff' : '#0f172a'}
                strokeWidth={n.isHome ? '1.8' : '1.4'}
              />
            </g>
          ))}
          <g transform={`translate(18, ${FLAT_HEIGHT - 84})`}>
            <rect
              x={0}
              y={0}
              width={255}
              height={68}
              rx={8}
              fill="rgba(15, 23, 42, 0.9)"
              stroke="rgba(56, 189, 248, 0.35)"
              strokeWidth="1"
            />
            <text
              x={14}
              y={19}
              fill="#38bdf8"
              fontSize="9.5"
              fontWeight="700"
              fontFamily="Inter, system-ui, sans-serif"
              letterSpacing="0.5"
            >
              GLOBAL COLLABORATION OVERVIEW
            </text>
            <text
              x={14}
              y={36}
              fill="#f8fafc"
              fontSize="11.5"
              fontWeight="700"
              fontFamily="JetBrains Mono, monospace"
            >
              {`${universities.length} Institutions · ${collaboratingCountryNames.size} Countries`}
            </text>
            <circle
              cx={19}
              cy={52}
              r={4}
              fill="#f97316"
              stroke="#ffffff"
              strokeWidth="1"
            />
            <text
              x={28}
              y={55}
              fill="#cbd5e1"
              fontSize="9.5"
              fontFamily="Inter, system-ui, sans-serif"
            >
              Home Institution
            </text>
            <circle cx={124} cy={52} r={4} fill="#38bdf8" />
            <text
              x={133}
              y={55}
              fill="#cbd5e1"
              fontSize="9.5"
              fontFamily="Inter, system-ui, sans-serif"
            >
              Partner Institutions
            </text>
          </g>
        </svg>
      </div>
    </section>
  );
};

export const GlobeCollaborationMap: React.FC<GlobeCollaborationMapProps> = ({
  profile,
  universities,
  selectedUniversityId,
  onSelectUniversity,
  onFilterByUniversity,
  onFilterByCoAuthor,
  onExportChartPng,
  onSelectResearcher,
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
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null);
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState<boolean>(false);
  const [uniSearchQuery, setUniSearchQuery] = useState<string>('');
  const uniDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        uniDropdownRef.current &&
        !uniDropdownRef.current.contains(e.target as Node)
      ) {
        setIsUniDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const filteredDropdownUniversities = useMemo(() => {
    const q = uniSearchQuery.trim().toLowerCase();
    if (!q) return universities;
    return universities.filter(
      (u) =>
        u.universityName.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q)
    );
  }, [universities, uniSearchQuery]);

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
      .precision(0.1);
    const rawPath = geoPath(proj);
    return (geom: any): string => {
      if (!geom) return '';
      try {
        return rawPath(geom) || '';
      } catch {
        return '';
      }
    };
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
      if (u.country) s.add(u.country.toLowerCase().trim());
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

  // Global internal district / state / province boundaries for ALL countries when zoomed in (no district text labels)
  const worldSubdivisionsPath = useMemo(() => {
    if (zoom < 1.5 || GLOBAL_DISTRICT_SEGMENTS.length === 0) return '';
    const centerCoord: [number, number] = [centerLng, centerLat];
    const maxAngularRadius = Math.min(Math.PI / 2, 1.35 / zoom + 0.22);
    const visibleCoords: [number, number][][] = [];

    for (let i = 0; i < GLOBAL_DISTRICT_SEGMENTS.length; i++) {
      const seg = GLOBAL_DISTRICT_SEGMENTS[i];
      const d = geoDistance(centerCoord, [seg[0], seg[1]]);
      if (d <= maxAngularRadius) {
        visibleCoords.push(seg[2]);
      }
    }
    if (visibleCoords.length === 0) return '';
    return (
      pathGenerator({
        type: 'Feature',
        geometry: {
          type: 'MultiLineString',
          coordinates: visibleCoords,
        },
      }) || ''
    );
  }, [pathGenerator, centerLat, centerLng, zoom]);

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

  // 3D Elevated Blue Collaboration Arcs (floating slightly above the globe surface, no black dashed shadow lines)
  const arcPaths = useMemo(() => {
    const centerCoord: [number, number] = [centerLng, centerLat];
    const surfaceProj = geoOrthographic()
      .translate([CENTER_X, CENTER_Y])
      .scale(projectedScale)
      .rotate([-centerLng, -centerLat, 0])
      .clipAngle(90);

    const nodeLookup = new Map<
      string,
      { exactX: number; exactY: number; screenX: number; screenY: number; visible: boolean }
    >();
    for (const item of projectedUniversities) {
      nodeLookup.set(item.uni.universityId, item);
    }

    const homeNode = nodeLookup.get(profile.homeUniversityId);
    const homeOffsetX = homeNode ? homeNode.screenX - homeNode.exactX : 0;
    const homeOffsetY = homeNode ? homeNode.screenY - homeNode.exactY : 0;
    const homeCoord: [number, number] = [profile.homeLng, profile.homeLat];

    const HOVER_CLEARANCE_PX = 1.2;

    return universities
      .filter((u) => u.universityId !== profile.homeUniversityId)
      .map((u) => {
        const targetCoord: [number, number] = [u.lng, u.lat];
        const targetNode = nodeLookup.get(u.universityId);
        const targetOffsetX = targetNode
          ? targetNode.screenX - targetNode.exactX
          : 0;
        const targetOffsetY = targetNode
          ? targetNode.screenY - targetNode.exactY
          : 0;

        const totalAngularSpan = geoDistance(homeCoord, targetCoord);
        const interpolator = geoInterpolate(homeCoord, targetCoord);
        const STEPS = 32;

        const groundPoints: [number, number][] = [];
        for (let i = 0; i <= STEPS; i++) {
          const t = i / STEPS;
          const coord = interpolator(t) as [number, number];
          const distFromCenter = geoDistance(centerCoord, coord);
          if (distFromCenter > Math.PI / 2 - 0.008) continue;
          const pt = surfaceProj(coord);
          if (!pt) continue;
          const gx = pt[0] + (1 - t) * homeOffsetX + t * targetOffsetX;
          const gy = pt[1] + (1 - t) * homeOffsetY + t * targetOffsetY;
          groundPoints.push([gx, gy]);
        }

        if (groundPoints.length < 2) {
          return null;
        }

        const firstPt = groundPoints[0];
        const lastPt = groundPoints[groundPoints.length - 1];
        const chordDx = lastPt[0] - firstPt[0];
        const chordDy = lastPt[1] - firstPt[1];
        const chordLen = Math.hypot(chordDx, chordDy);

        let normX = 0;
        let normY = -1;
        if (chordLen > 1) {
          let perpX = -chordDy / chordLen;
          let perpY = chordDx / chordLen;
          if (perpY > 0) {
            perpX = -perpX;
            perpY = -perpY;
          }
          normX = perpX * 0.5;
          normY = perpY * 0.5 - 0.5;
          const nLen = Math.hypot(normX, normY) || 1;
          normX /= nLen;
          normY /= nLen;
        }

        const peakArchPx = Math.min(
          11,
          Math.max(3.5, chordLen * 0.05 + totalAngularSpan * 4.5)
        );
        const radialAltitudeFactor = Math.min(
          0.03,
          Math.max(0.008, totalAngularSpan * 0.018)
        );

        const elevatedPoints: [number, number][] = groundPoints.map(
          ([gx, gy], idx) => {
            const uParam = idx / (groundPoints.length - 1);
            const arch = Math.sin(Math.PI * uParam);

            const vx = gx - CENTER_X;
            const vy = gy - CENTER_Y;
            const radialLiftX = vx * radialAltitudeFactor * arch;
            const radialLiftY = vy * radialAltitudeFactor * arch;

            const skyLiftX = normX * peakArchPx * arch;
            const skyLiftY =
              normY * peakArchPx * arch - HOVER_CLEARANCE_PX;

            return [gx + radialLiftX + skyLiftX, gy + radialLiftY + skyLiftY];
          }
        );

        const elevatedD = elevatedPoints
          .map(
            (p, idx) =>
              `${idx === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`
          )
          .join(' ');

        return {
          id: u.universityId,
          isSelected: u.universityId === selectedUni?.universityId,
          elevatedD,
        };
      })
      .filter(Boolean) as {
      id: string;
      isSelected: boolean;
      elevatedD: string;
    }[];
  }, [
    universities,
    profile,
    projectedUniversities,
    centerLat,
    centerLng,
    projectedScale,
    selectedUni,
  ]);

  // Precomputed flattened world map data for PNG & PDF exports (no institution name labels, clean bottom-left overview)
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

    const nodes = universities
      .map((u) => {
        const pt = FLAT_PROJECTION([u.lng, u.lat]) || [
          FLAT_WIDTH / 2,
          FLAT_HEIGHT / 2,
        ];
        return {
          uni: u,
          x: pt[0],
          y: pt[1],
          isHome:
            u.universityId === profile.homeUniversityId || u.isHomeInstitution,
        };
      })
      // Render partner markers first and Home Institution orange marker LAST so it is never hidden by nearby dots
      .sort((a, b) => Number(a.isHome) - Number(b.isHome));

    const arcs = nodes
      .filter((n) => !n.isHome)
      .map((n) => {
        const midX = (homePt[0] + n.x) / 2;
        const dist = Math.hypot(n.x - homePt[0], n.y - homePt[1]);
        const archLift = Math.max(5, Math.min(18, dist * 0.06));
        const midY = Math.max(14, (homePt[1] + n.y) / 2 - archLift);
        const startY = homePt[1] - 1.5;
        const endY = n.y - 1.5;
        return {
          id: `flat-arc-${n.uni.universityId}`,
          d: `M ${homePt[0].toFixed(1)} ${startY.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${n.x.toFixed(1)} ${endY.toFixed(1)}`,
        };
      });

    return { countries, nodes, arcs };
  }, [universities, profile, collaboratingCountryNames]);

  const filteredSelectedCoAuthors = useMemo(() => {
    if (!selectedUni) return [];
    const q = coAuthorQuery.trim().toLowerCase();
    if (!q) return selectedUni.coAuthors;
    return selectedUni.coAuthors.filter((ca) =>
      ca.name.toLowerCase().includes(q)
    );
  }, [selectedUni, coAuthorQuery]);

  const dynamicGlobeStat = useMemo(() => {
    // 1. If a specific university is hovered, show its live details:
    if (hoveredUniId) {
      const u = universities.find((x) => x.universityId === hoveredUniId);
      if (u) {
        return {
          type: 'university' as const,
          isHome: u.universityId === profile.homeUniversityId || u.isHomeInstitution,
          title: u.universityName.replace(/\s*\([^)]+\)\s*$/, ''),
          subtitle: `${u.paperCount} ${u.paperCount === 1 ? 'paper' : 'papers'} · ${u.coAuthors.length} ${u.coAuthors.length === 1 ? 'co-author' : 'co-authors'} · ${u.city ? `${u.city}, ` : ''}${u.country}`,
        };
      }
    }

    // 2. If a collaborating country is hovered:
    if (hoveredCountryName) {
      const matchKey = hoveredCountryName.toLowerCase().trim();
      const inCountry = universities.filter(
        (u) => u.country.toLowerCase().trim() === matchKey
      );
      if (inCountry.length > 0) {
        const totalPapers = inCountry.reduce((acc, u) => acc + u.paperCount, 0);
        return {
          type: 'country' as const,
          isHome: inCountry.some((u) => u.isHomeInstitution),
          title: hoveredCountryName,
          subtitle: `${inCountry.length} ${inCountry.length === 1 ? 'institution' : 'institutions'} · ${totalPapers} ${totalPapers === 1 ? 'paper' : 'papers'}`,
        };
      }
    }

    // 3. If a university is selected (clicked):
    if (selectedUni) {
      return {
        type: 'university' as const,
        isHome: selectedUni.universityId === profile.homeUniversityId || selectedUni.isHomeInstitution,
        title: selectedUni.universityName.replace(/\s*\([^)]+\)\s*$/, ''),
        subtitle: `${selectedUni.paperCount} ${selectedUni.paperCount === 1 ? 'paper' : 'papers'} · ${selectedUni.coAuthors.length} ${selectedUni.coAuthors.length === 1 ? 'co-author' : 'co-authors'} · ${selectedUni.city ? `${selectedUni.city}, ` : ''}${selectedUni.country}`,
      };
    }

    // 4. Default: Live Global Research Network Overview
    const totalPapers = universities.reduce((acc, u) => acc + u.paperCount, 0);
    return {
      type: 'overview' as const,
      isHome: false,
      title: 'Global Research Network',
      subtitle: `${universities.length} Institutions · ${collaboratingCountryNames.size} Countries · ${totalPapers} Papers`,
    };
  }, [
    hoveredUniId,
    hoveredCountryName,
    selectedUni,
    universities,
    profile.homeUniversityId,
    collaboratingCountryNames.size,
  ]);

  return (
    <section
      id="global-map"
      aria-labelledby="globe-section-heading"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs relative lg:flex-1 lg:min-h-0 lg:flex lg:flex-col"
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
                  ? 'rgba(56, 189, 248, 0.78)'
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
            <g key={arc.id}>
              {/* 3D elevated blue glow */}
              <path
                d={arc.d}
                fill="none"
                stroke="rgba(56, 189, 248, 0.16)"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
              {/* 3D elevated blue arc line */}
              <path
                d={arc.d}
                fill="none"
                stroke="rgba(125, 211, 252, 0.82)"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
            </g>
          ))}
          {flatMapData.nodes.map((n) => (
            <g key={`flat-node-${n.uni.universityId}`}>
              <circle
                cx={n.x}
                cy={n.y}
                r={n.isHome ? 11 : 6.2}
                fill={
                  n.isHome
                    ? 'rgba(249, 115, 22, 0.36)'
                    : 'rgba(56, 189, 248, 0.24)'
                }
                stroke={n.isHome ? 'rgba(251, 191, 36, 0.85)' : 'none'}
                strokeWidth={n.isHome ? '1.2' : '0'}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={n.isHome ? 6.5 : 4.2}
                fill={n.isHome ? '#f97316' : '#38bdf8'}
                stroke={n.isHome ? '#ffffff' : '#0f172a'}
                strokeWidth={n.isHome ? '1.8' : '1.4'}
              />
            </g>
          ))}

          {/* Compact Short Overview at the Bottom-Left Corner of the Exported World Map (No Institution Name Labels) */}
          <g transform={`translate(18, ${FLAT_HEIGHT - 84})`}>
            <rect
              x={0}
              y={0}
              width={255}
              height={68}
              rx={8}
              fill="rgba(15, 23, 42, 0.9)"
              stroke="rgba(56, 189, 248, 0.35)"
              strokeWidth="1"
            />
            <text
              x={14}
              y={19}
              fill="#38bdf8"
              fontSize="9.5"
              fontWeight="700"
              fontFamily="Inter, system-ui, sans-serif"
              letterSpacing="0.5"
            >
              GLOBAL COLLABORATION OVERVIEW
            </text>
            <text
              x={14}
              y={36}
              fill="#f8fafc"
              fontSize="11.5"
              fontWeight="700"
              fontFamily="JetBrains Mono, monospace"
            >
              {`${universities.length} Institutions · ${collaboratingCountryNames.size} Countries`}
            </text>
            <circle
              cx={19}
              cy={52}
              r={4}
              fill="#f97316"
              stroke="#ffffff"
              strokeWidth="1"
            />
            <text
              x={28}
              y={55}
              fill="#cbd5e1"
              fontSize="9.5"
              fontFamily="Inter, system-ui, sans-serif"
            >
              Home Institution
            </text>
            <circle cx={124} cy={52} r={4} fill="#38bdf8" />
            <text
              x={133}
              y={55}
              fill="#cbd5e1"
              fontSize="9.5"
              fontFamily="Inter, system-ui, sans-serif"
            >
              Partner Institutions
            </text>
          </g>
        </svg>
      </div>

      <h2 id="globe-section-heading" className="sr-only">
        World Collaboration Map
      </h2>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 items-stretch lg:flex-1 lg:min-h-0">
        {/* Left 7 Columns: Clean Globe Viewport */}
        <div
          id="chart-collaboration-globe"
          className="lg:col-span-7 bg-[#060d1c] text-slate-100 flex items-center justify-center relative select-none overflow-hidden h-[440px] sm:h-[500px] lg:h-full lg:min-h-0"
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
            className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-[#060d1c] touch-none ${
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

                {/* Clean Solid Globe Backdrop & Subtle Atmospheric Halo */}
                <radialGradient id="earthAtmosphereHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="78%" stopColor="#0ea5e9" stopOpacity="0" />
                  <stop offset="92%" stopColor="#38bdf8" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* 1. CLEAN SOLID BACKDROP BEHIND GLOBE (No Starfield) */}
              <rect
                x={0}
                y={0}
                width={GLOBE_WIDTH}
                height={GLOBE_HEIGHT}
                fill="#060d1c"
              />

              {/* Subtle Blue Atmospheric Halo Around Earth */}
              <circle
                cx={CENTER_X}
                cy={CENTER_Y}
                r={projectedScale * 1.12}
                fill="url(#earthAtmosphereHalo)"
                className="pointer-events-none"
              />

              {/* 2. SOLID EARTH SPHERE & VISUAL DATA */}
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
                        ? 'rgba(14, 116, 144, 0.44)'
                        : 'rgba(30, 41, 59, 0.88)'
                    }
                    stroke={
                      country.isCollab
                        ? 'rgba(56, 189, 248, 0.75)'
                        : 'rgba(100, 116, 139, 0.45)'
                    }
                    strokeWidth={country.isCollab ? '0.95' : '0.6'}
                    strokeLinejoin="round"
                    className={country.isCollab ? 'cursor-pointer' : undefined}
                    onMouseEnter={() => country.isCollab && setHoveredCountryName(country.name)}
                    onMouseLeave={() => setHoveredCountryName((prev) => (prev === country.name ? null : prev))}
                  >
                    <title>{country.name}</title>
                  </path>
                ))}

                {/* Global district / state / province internal boundaries across ALL countries when zoomed in */}
                {worldSubdivisionsPath && (
                  <path
                    d={worldSubdivisionsPath}
                    fill="none"
                    stroke="rgba(125, 211, 252, 0.45)"
                    strokeWidth={zoom >= 5 ? '0.85' : '0.65'}
                    strokeDasharray="2.5 2"
                  />
                )}

                {bordersMeshPath && (
                  <path
                    d={bordersMeshPath}
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.55)"
                    strokeWidth="0.65"
                    strokeLinejoin="round"
                  />
                )}
              </g>

              {/* Low-profile 3D Elevated Blue Collaboration Arcs hovering subtly above the ground (no black dashed shadow lines) */}
              <g className="pointer-events-none">
                {arcPaths.map((arc) => (
                  <g key={`arc-3d-${arc.id}`}>
                    {/* 3D Outer atmospheric blue glow */}
                    <path
                      d={arc.elevatedD}
                      fill="none"
                      stroke={
                        arc.isSelected
                          ? 'rgba(56, 189, 248, 0.34)'
                          : 'rgba(56, 189, 248, 0.16)'
                      }
                      strokeWidth={arc.isSelected ? '4.4' : '2.8'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Core elevated 3D blue collaboration arc floating slightly above the ground */}
                    <path
                      d={arc.elevatedD}
                      fill="none"
                      stroke={
                        arc.isSelected ? '#7dd3fc' : 'rgba(56, 189, 248, 0.78)'
                      }
                      strokeWidth={arc.isSelected ? '2.1' : '1.35'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                ))}
              </g>

              <g clipPath="url(#globeCircleClip)">

                {/* Single, clear, easily clickable university dot directly on the round globe, sorted so Home Institution orange dot is ALWAYS rendered on top */}
                {[...projectedUniversities]
                  .sort((a, b) => {
                    const aHome =
                      a.uni.universityId === profile.homeUniversityId ||
                      a.uni.isHomeInstitution;
                    const bHome =
                      b.uni.universityId === profile.homeUniversityId ||
                      b.uni.isHomeInstitution;
                    if (aHome !== bHome) return aHome ? 1 : -1;
                    const aSel =
                      selectedUni?.universityId === a.uni.universityId;
                    const bSel =
                      selectedUni?.universityId === b.uni.universityId;
                    if (aSel !== bSel) return aSel ? 1 : -1;
                    return 0;
                  })
                  .map(({ uni, visible, screenX, screenY }) => {
                    if (!visible) return null;
                    const isHome =
                      uni.universityId === profile.homeUniversityId ||
                      uni.isHomeInstitution;
                    const isSelected =
                      selectedUni?.universityId === uni.universityId;
                    const isHovered = hoveredUniId === uni.universityId;
                    const dotRadius = isHome
                      ? 8.5
                      : isSelected
                      ? 8.5
                      : isHovered
                      ? 8
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
                            r={isHome ? dotRadius + 5.5 : dotRadius + 4.5}
                            fill={
                              isHome
                                ? 'rgba(249, 115, 22, 0.36)'
                                : 'rgba(56, 189, 248, 0.35)'
                            }
                            stroke={
                              isHome
                                ? '#fbbf24'
                                : isSelected
                                ? '#38bdf8'
                                : 'rgba(56, 189, 248, 0.6)'
                            }
                            strokeWidth={isHome || isSelected ? '1.6' : '1'}
                          />
                        )}
                        {/* Primary on-globe university marker (Home institution orange dot is always top-most and distinct) */}
                        <circle
                          cx={screenX}
                          cy={screenY}
                          r={dotRadius}
                          fill={
                            isHome
                              ? '#f97316'
                              : isSelected
                              ? '#ffffff'
                              : '#38bdf8'
                          }
                          stroke={
                            isHome
                              ? '#ffffff'
                              : isSelected
                              ? '#0284c7'
                              : '#0f172a'
                          }
                          strokeWidth={isHome || isSelected ? '2.2' : '1.8'}
                        />
                      </g>
                    );
                  })}
              </g>
            </svg>

            {/* Dynamic Interactive Globe Stat Badge: Pinned at top-left of the 3D globe viewport */}
            {dynamicGlobeStat && (
              <div className="pointer-events-none absolute top-3 left-3 z-30 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 max-w-[85%] transition-all">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ring-2 ${
                    dynamicGlobeStat.isHome
                      ? 'bg-amber-400 ring-amber-400/30'
                      : dynamicGlobeStat.type === 'country'
                      ? 'bg-emerald-400 ring-emerald-400/30'
                      : dynamicGlobeStat.type === 'overview'
                      ? 'bg-indigo-400 ring-indigo-400/30'
                      : 'bg-sky-400 ring-sky-400/30'
                  }`}
                />
                <div className="truncate text-xs font-semibold">
                  {dynamicGlobeStat.title}
                  <span className="text-slate-300 font-normal ml-1.5 font-mono text-[11px]">
                    · {dynamicGlobeStat.subtitle}
                  </span>
                </div>
              </div>
            )}

            {/* Export World Map PNG Button inside the globe box (top-right corner) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExportChartPng(
                  'chart-collaboration-globe',
                  `Global Research Collaboration Network — ${profile.name}`,
                  'global_collaboration_world_map.png',
                  true
                );
              }}
              aria-label="Export Flattened World Collaboration Map as PNG"
              className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900/85 hover:bg-slate-800/95 hover:text-white border border-slate-700/80 rounded-lg backdrop-blur-xs transition-colors whitespace-nowrap shadow-md cursor-pointer"
            >
              <ImageDown className="w-3.5 h-3.5" />
              <span>Export World Map PNG</span>
            </button>

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
        <div className="lg:col-span-5 p-3.5 sm:p-4 bg-white flex flex-col lg:h-full lg:min-h-0 lg:overflow-hidden">
          {selectedUni ? (
            <div className="flex flex-col gap-3 lg:h-full lg:min-h-0">
              <div ref={uniDropdownRef} className="relative shrink-0">
                <button
                  id="inspector-university-select"
                  type="button"
                  onClick={() => setIsUniDropdownOpen((prev) => !prev)}
                  aria-expanded={isUniDropdownOpen}
                  aria-label="Select collaborating institution"
                  className="w-full px-3 py-2 text-xs font-medium bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg text-slate-900 flex items-center justify-between gap-2 text-left focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <span className="truncate">
                    {selectedUni.universityName} — {selectedUni.paperCount}{' '}
                    {selectedUni.paperCount === 1 ? 'paper' : 'papers'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                </button>

                {isUniDropdownOpen && (
                  <div className="absolute z-40 mt-1 inset-x-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={uniSearchQuery}
                          onChange={(e) => setUniSearchQuery(e.target.value)}
                          placeholder="Search university..."
                          aria-label="Search collaborating university"
                          autoFocus
                          className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
                        />
                        {uniSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setUniSearchQuery('')}
                            aria-label="Clear university search"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                      {filteredDropdownUniversities.map((u) => {
                        const isSelected =
                          u.universityId === selectedUni.universityId;
                        return (
                          <button
                            key={u.universityId}
                            type="button"
                            onClick={() => {
                              focusOnUniversity(u);
                              setIsUniDropdownOpen(false);
                              setUniSearchQuery('');
                            }}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 text-blue-900 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate">{u.universityName}</div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {u.city} · {u.country}
                              </div>
                            </div>
                            <span className="font-mono text-[11px] text-slate-600 shrink-0 tabular-nums">
                              {u.paperCount} papers
                            </span>
                          </button>
                        );
                      })}
                      {filteredDropdownUniversities.length === 0 && (
                        <div className="px-3 py-3 text-center text-xs text-slate-500">
                          No matching universities
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b border-slate-200 pb-3 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3
                      data-testid="selected-university-name"
                      className="text-lg font-bold text-slate-900"
                    >
                      {selectedUni.universityName}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {selectedUni.city} · {selectedUni.country}
                    </div>
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

                <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t border-slate-100">
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
                    <div className="text-[11px] text-slate-500">Years</div>
                    <div className="text-xs font-semibold font-mono text-slate-800 tabular-nums mt-0.5">
                      {selectedUni.firstCollaborationYear}–
                      {selectedUni.latestCollaborationYear}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col min-h-0 lg:flex-1">
                <div className="flex items-center justify-between gap-2 mb-1.5 shrink-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                    Co-Authors ({filteredSelectedCoAuthors.length})
                  </h4>
                  <div className="relative w-40 sm:w-48">
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
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg h-[180px] lg:h-auto lg:flex-1 lg:min-h-0 overflow-y-auto">
                  {filteredSelectedCoAuthors.map((author) => (
                    <div
                      key={author.name}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-2.5 bg-slate-50/40 hover:bg-slate-50"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onSelectResearcher?.(
                            author.name,
                            author.scholarUserId
                          )
                        }
                        title={`View ${author.name} in ScholarLens`}
                        className="flex items-center gap-2.5 min-w-0 text-left group cursor-pointer focus:outline-none"
                      >
                        <img
                          src={
                            (author.avatarUrl && author.avatarUrl.trim()) ||
                            `/api/scholar/avatar?v=4&name=${encodeURIComponent(
                              author.name
                            )}&uni=${encodeURIComponent(
                              selectedUni.universityName
                            )}${
                              author.orcid
                                ? `&orcid=${encodeURIComponent(author.orcid)}`
                                : ''
                            }${
                              author.scholarUserId
                                ? `&userId=${encodeURIComponent(
                                    author.scholarUserId
                                  )}`
                                : ''
                            }`
                          }
                          alt={author.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallbackUrl = `/api/scholar/avatar?v=4&name=${encodeURIComponent(
                              author.name
                            )}&uni=${encodeURIComponent(
                              selectedUni.universityName
                            )}${
                              author.orcid
                                ? `&orcid=${encodeURIComponent(author.orcid)}`
                                : ''
                            }`;
                            if (!target.src.endsWith(fallbackUrl)) {
                              target.src = fallbackUrl;
                            }
                          }}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-2xs group-hover:ring-2 group-hover:ring-blue-500/40 transition-all"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 group-hover:underline truncate transition-colors">
                            {author.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                            {author.paperCount}{' '}
                            {author.paperCount === 1 ? 'paper' : 'papers'} ·{' '}
                            {author.citations.toLocaleString()} cit.
                          </div>
                        </div>
                      </button>
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
                      {coAuthorQuery
                        ? `No co-authors matching "${coAuthorQuery}".`
                        : 'No other affiliated co-authors recorded for this institution.'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col min-h-0 lg:flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-1.5 shrink-0">
                  Collaborative Papers ({selectedUni.papers.length})
                </h4>
                <div className="space-y-2 h-[200px] lg:h-auto lg:flex-1 lg:min-h-0 overflow-y-auto pr-1">
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
                            : 'Others'}
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
