import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  FileDown,
  AlertCircle,
  Lock,
  LayoutDashboard,
  BarChart3,
  Globe2,
  BookOpen,
  Users,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  User,
  Award,
  TrendingUp,
  X,
  Rss,
  MessageSquare,
} from 'lucide-react';
import {
  parseGoogleScholarInput,
  computeProfileStatistics,
  filterAndSortPublications,
  aggregateUniversityCollaborations,
  aggregateCoAuthors,
  aggregateCountries,
  aggregateJournals,
  normalizePublicationsVenueConsistency,
  DEFAULT_FILTER_STATE,
  PublicationFilterState,
  Quartile,
  PublicationType,
  ResearcherProfile,
  getPublicationUrl,
  getPublicationPortfolioCategory,
} from './utils/scholarAnalytics';
import {
  exportChartSvgAsPng,
  generateResearcherPdfReport,
} from './utils/exportReport';
import {
  auth,
  onAuthStateChanged,
  firebaseSignOut,
  logExportToFirestore,
  syncOrFetchGoogleUserProfile,
} from './firebase';
import {
  AuthGateModal,
  AuthenticatedResearcher,
} from './components/AuthGateModal';
import { UserProfileModal } from './components/UserProfileModal';
import { PortfolioBreakdownSection } from './components/PortfolioBreakdownSection';
import {
  GlobeCollaborationMap,
  FlatWorldCollaborationMap,
} from './components/GlobeCollaborationMap';
import { PublicationsExplorer } from './components/PublicationsExplorer';
import { ResearchDirectoriesSection } from './components/ResearchDirectoriesSection';
import { ScholarProfileAvatar } from './components/ScholarProfileAvatar';
import { ResearchFeedSection } from './components/ResearchFeedSection';
import {
  ConnectionsSection,
  SiteResearcher,
} from './components/ConnectionsSection';
import { MessagingSection } from './components/MessagingSection';

export type AppPage =
  | 'overview'
  | 'charts'
  | 'map'
  | 'publications'
  | 'directories'
  | 'feed'
  | 'connections'
  | 'messages';

type PendingExportTask =
  | { type: 'pdf' }
  | {
      type: 'png';
      chartId: string;
      title: string;
      filename: string;
      darkTheme?: boolean;
    };

const SESSION_STORAGE_KEY = 'scholarlens_active_auth_user';

const PAGE_METADATA: {
  id: AppPage;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'overview',
    label: 'Executive Overview',
    shortLabel: 'Overview',
    icon: LayoutDashboard,
  },
  {
    id: 'charts',
    label: 'Bibliometric Analytics',
    shortLabel: 'Analytics',
    icon: BarChart3,
  },
  {
    id: 'map',
    label: 'Global Collaboration Network',
    shortLabel: 'Network Map',
    icon: Globe2,
  },
  {
    id: 'publications',
    label: 'Publication Portfolio',
    shortLabel: 'Publications',
    icon: BookOpen,
  },
  {
    id: 'directories',
    label: 'Institutional & Co-Author Registry',
    shortLabel: 'Registry',
    icon: Users,
  },
];

function SearchLoadingDots({
  size = 'xs',
  color = 'bg-slate-400',
}: {
  size?: 'xs' | 'sm' | 'md';
  color?: string;
}) {
  const dotSize =
    size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  return (
    <div
      role="status"
      aria-label="Loading profile"
      className="flex items-center gap-0.5 shrink-0 select-none pointer-events-none"
    >
      <span
        className={`${dotSize} rounded-full ${color} animate-bounce`}
        style={{ animationDelay: '-0.32s', animationDuration: '0.8s' }}
      />
      <span
        className={`${dotSize} rounded-full ${color} animate-bounce`}
        style={{ animationDelay: '-0.16s', animationDuration: '0.8s' }}
      />
      <span
        className={`${dotSize} rounded-full ${color} animate-bounce`}
        style={{ animationDuration: '0.8s' }}
      />
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('page') as AppPage | null;
    if (
      p &&
      [
        'overview',
        'charts',
        'map',
        'publications',
        'directories',
        'feed',
        'connections',
        'messages',
      ].includes(p)
    ) {
      return p;
    }
    return 'overview';
  });
  const [activeProfile, setActiveProfile] = useState<ResearcherProfile | null>(
    null
  );
  const [navHistory, setNavHistory] = useState<
    Array<{ page: AppPage; profile: ResearcherProfile | null }>
  >([]);
  const [scholarUrlInput, setScholarUrlInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const [filter, setFilter] = useState<PublicationFilterState>(
    DEFAULT_FILTER_STATE
  );

  // Authentication & Editable User Profile State
  const [authUser, setAuthUser] = useState<AuthenticatedResearcher | null>(
    () => {
      try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<AuthenticatedResearcher>;
        if (!parsed || typeof parsed !== 'object') return null;
        return {
          uid: parsed.uid || 'anonymous',
          name: parsed.name || 'Researcher',
          emailOrId: parsed.emailOrId || '',
          photoURL: parsed.photoURL || '',
          scholarUrl: parsed.scholarUrl || '',
          scholarUserId: parsed.scholarUserId || '',
          orcidId: parsed.orcidId || '',
          verified: Boolean(parsed.verified),
          provider: parsed.provider || 'email',
        };
      } catch {
        return null;
      }
    }
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authExternalError, setAuthExternalError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const [pendingExport, setPendingExport] = useState<PendingExportTask | null>(
    null
  );
  const [messageTarget, setMessageTarget] = useState<SiteResearcher | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isHeaderSearchFocused, setIsHeaderSearchFocused] =
    useState<boolean>(false);
  const [isSearchingHeader, setIsSearchingHeader] = useState<boolean>(false);
  const [headerMatchedResearchers, setHeaderMatchedResearchers] = useState<
    SiteResearcher[]
  >([]);
  const [headerMatchedScholarProfiles, setHeaderMatchedScholarProfiles] =
    useState<
      Array<{
        scholarUserId: string;
        name: string;
        affiliation: string;
        country: string;
        totalCitations: number;
        hIndex: number;
        publicationCount: number;
      }>
    >([]);
  const headerSearchContainerRef = useRef<HTMLDivElement>(null);
  const [socialSummary, setSocialSummary] = useState({
    unreadMessagesCount: 0,
    pendingConnectionsCount: 0,
    acceptedConnectionsCount: 0,
  });

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (
        headerSearchContainerRef.current &&
        !headerSearchContainerRef.current.contains(event.target as Node)
      ) {
        setIsHeaderSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  useEffect(() => {
    const trimmed = globalSearchQuery.trim();
    if (!trimmed || activePage === 'feed') {
      setHeaderMatchedResearchers([]);
      setHeaderMatchedScholarProfiles([]);
      setIsSearchingHeader(false);
      return;
    }

    let cancelled = false;
    setIsSearchingHeader(true);
    const timer = window.setTimeout(async () => {
      try {
        const resp = await fetch(
          `/api/social/researchers?q=${encodeURIComponent(trimmed)}`,
          { credentials: 'include' }
        );
        if (!resp.ok || cancelled) return;
        const data = await resp.json();
        if (!cancelled) {
          setHeaderMatchedResearchers(
            Array.isArray(data.researchers) ? data.researchers : []
          );
          setHeaderMatchedScholarProfiles(
            Array.isArray(data.scholarProfiles) ? data.scholarProfiles : []
          );
        }
      } catch {
        // Ignore transient header search errors
      } finally {
        if (!cancelled) {
          setIsSearchingHeader(false);
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [globalSearchQuery, activePage]);

  const parsedHeaderSearchQuery = useMemo(
    () =>
      globalSearchQuery.trim()
        ? parseGoogleScholarInput(globalSearchQuery)
        : null,
    [globalSearchQuery]
  );

  const refreshSocialSummary = useCallback(async () => {
    if (!authUser) {
      setSocialSummary({
        unreadMessagesCount: 0,
        pendingConnectionsCount: 0,
        acceptedConnectionsCount: 0,
      });
      return;
    }
    try {
      const resp = await fetch('/api/social/summary', { credentials: 'include' });
      if (!resp.ok) return;
      const data = await resp.json();
      setSocialSummary({
        unreadMessagesCount: Number(data.unreadMessagesCount || 0),
        pendingConnectionsCount: Number(data.pendingConnectionsCount || 0),
        acceptedConnectionsCount: Number(data.acceptedConnectionsCount || 0),
      });
    } catch {
      // Ignore transient polling failures
    }
  }, [authUser]);

  useEffect(() => {
    void refreshSocialSummary();
    if (!authUser) return;
    const timer = window.setInterval(() => {
      void refreshSocialSummary();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [authUser, refreshSocialSummary]);

  const saveSessionUser = (user: AuthenticatedResearcher | null) => {
    setAuthUser(user);
    try {
      if (user) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const orcidAuthStatus = params.get('orcid_auth');
    const orcidAuthError = params.get('orcid_auth_error');

    if (orcidAuthStatus || orcidAuthError) {
      params.delete('orcid_auth');
      params.delete('orcid_auth_error');
      window.history.replaceState({}, '', url.pathname + (params.toString() ? `?${params.toString()}` : '') + url.hash);
    }

    if (orcidAuthError) {
      setAuthExternalError(orcidAuthError);
      setIsAuthModalOpen(true);
    }

    if (params.get('googleAuthBridge') === '1' && window.opener) {
      import('./firebase').then(async ({ signInWithGoogleAccount }) => {
        try {
          const { user, profile, idToken } = await signInWithGoogleAccount();
          window.opener.postMessage(
            {
              type: 'GOOGLE_BRIDGE_AUTH_SUCCESS',
              idToken,
              uid: user.uid,
              name: profile.displayName || user.displayName || user.email,
              email: user.email,
              photoURL: profile.photoURL || user.photoURL || '',
            },
            '*'
          );
          window.close();
        } catch {
          window.close();
        }
      });
    }

    // Hydrate / validate server-managed HttpOnly session cookie (supports ORCID OAuth & redirect fallback)
    let cancelled = false;
    void fetch('/api/auth/session', { credentials: 'same-origin' })
      .then(async (resp) => {
        if (!resp.ok) return null;
        return (await resp.json()) as {
          authenticated?: boolean;
          user?: AuthenticatedResearcher | null;
        };
      })
      .then((sessionData) => {
        if (cancelled || !sessionData) return;
        if (sessionData.authenticated && sessionData.user) {
          if (orcidAuthStatus === 'success') {
            handleAuthenticatedSuccess(sessionData.user);
          } else {
            saveSessionUser(sessionData.user);
          }
        } else if (sessionData.authenticated === false) {
          setAuthUser((prev) => {
            if (prev?.provider === 'orcid') {
              try {
                localStorage.removeItem(SESSION_STORAGE_KEY);
              } catch {
                // ignore
              }
              return null;
            }
            return prev;
          });
        }
      })
      .catch(() => {
        // Offline / transient error: keep existing local session intact
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const synced = await syncOrFetchGoogleUserProfile(firebaseUser);
        const sessionUser: AuthenticatedResearcher = {
          uid: firebaseUser.uid,
          name:
            synced.displayName ||
            firebaseUser.displayName ||
            firebaseUser.email ||
            'Authenticated Researcher',
          emailOrId: firebaseUser.email || firebaseUser.uid,
          photoURL: synced.photoURL || firebaseUser.photoURL || '',
          scholarUrl: synced.scholarUrl || '',
          provider: 'google',
        };
        saveSessionUser(sessionUser);
        if (!sessionUser.scholarUrl) {
          setIsProfileModalOpen(true);
        }
      }
    });
    return () => unsub();
  }, []);

  // Support browser / Android Back and Forward navigation across pages
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('page') as AppPage | null;
      if (
        p &&
        [
          'overview',
          'charts',
          'map',
          'publications',
          'directories',
          'feed',
          'connections',
          'messages',
        ].includes(p)
      ) {
        setActivePage(p);
      } else {
        setActivePage('overview');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        desktopSearchInputRef.current?.focus();
        desktopSearchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchProfileFromServer = async (
    userId: string,
    queryName?: string
  ) => {
    setIsAnalyzing(true);
    setUrlError(null);

    try {
      const params = new URLSearchParams({
        userId,
        ...(queryName ? { queryName } : {}),
      });
      const res = await fetch(`/api/scholar/analyze?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.profile) {
        setUrlError(
          data.error ||
            'Could not retrieve public publications for that Google Scholar profile.'
        );
        return;
      }
      const rawProfile: ResearcherProfile = data.profile;
      const resolved: ResearcherProfile = {
        ...rawProfile,
        avatarUrl:
          rawProfile.avatarUrl ||
          `/api/scholar/avatar?userId=${encodeURIComponent(
            rawProfile.scholarUserId
          )}&name=${encodeURIComponent(rawProfile.name)}`,
        publications: normalizePublicationsVenueConsistency(
          rawProfile.publications || []
        ),
      };
      setActiveProfile(resolved);
      setScholarUrlInput('');
      setFilter(DEFAULT_FILTER_STATE);

      try {
        if (resolved.scholarUserId) {
          const url = new URL(window.location.href);
          url.searchParams.set('user', resolved.scholarUserId);
          window.history.replaceState({}, '', url.toString());
        }
      } catch {
        // Ignore history errors in restricted frames
      }

      const nextUnis = aggregateUniversityCollaborations(
        resolved.publications,
        resolved
      );
      const firstPartner =
        nextUnis.find((u) => u.universityId !== resolved.homeUniversityId) ||
        nextUnis[0];
      if (firstPartner) {
        setSelectedGlobeUniId(firstPartner.universityId);
      }
    } catch {
      setUrlError('Network error while analyzing Google Scholar profile.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialUser = urlParams.get('user')?.trim() || '';
    if (initialUser) {
      void fetchProfileFromServer(initialUser, undefined);
    }
  }, []);

  const stats = useMemo(
    () =>
      activeProfile
        ? computeProfileStatistics(
            activeProfile.publications,
            activeProfile.homeCountry,
            2026,
            activeProfile.officialMetrics
          )
        : null,
    [activeProfile]
  );

  const universities = useMemo(
    () =>
      activeProfile
        ? aggregateUniversityCollaborations(
            activeProfile.publications,
            activeProfile
          )
        : [],
    [activeProfile]
  );

  const collaboratingUnis = useMemo(
    () => universities.filter((u) => !u.isHomeInstitution),
    [universities]
  );

  const coAuthors = useMemo(
    () =>
      activeProfile
        ? aggregateCoAuthors(activeProfile.publications, activeProfile.name)
        : [],
    [activeProfile]
  );

  const countries = useMemo(
    () =>
      activeProfile ? aggregateCountries(activeProfile.publications) : [],
    [activeProfile]
  );

  const journals = useMemo(
    () => (activeProfile ? aggregateJournals(activeProfile.publications) : []),
    [activeProfile]
  );

  const filteredPublications = useMemo(
    () =>
      activeProfile
        ? filterAndSortPublications(activeProfile.publications, filter)
        : [],
    [activeProfile, filter]
  );

  const defaultPartnerUniId = useMemo(() => {
    if (!activeProfile) return '';
    const partner = universities.find(
      (u) => u.universityId !== activeProfile.homeUniversityId
    );
    return partner ? partner.universityId : universities[0]?.universityId || '';
  }, [universities, activeProfile]);

  const [selectedGlobeUniId, setSelectedGlobeUniId] = useState<string>('');

  const currentGlobeUniId = useMemo(() => {
    if (universities.some((u) => u.universityId === selectedGlobeUniId)) {
      return selectedGlobeUniId;
    }
    return defaultPartnerUniId;
  }, [universities, selectedGlobeUniId, defaultPartnerUniId]);

  const executeExportTask = async (task: PendingExportTask) => {
    if (!activeProfile || !stats) return;
    if (task.type === 'pdf') {
      await generateResearcherPdfReport({
        profile: activeProfile,
        stats,
        universities,
        coAuthors,
        countries,
        journals,
      });
      const safeName =
        activeProfile.name
          .trim()
          .replace(/[^a-zA-Z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '') || activeProfile.scholarUserId;
      await logExportToFirestore(
        activeProfile.name,
        'pdf',
        `${safeName}_ScholarLense.pdf`
      );
    } else {
      const ok = await exportChartSvgAsPng(
        task.chartId,
        task.title,
        `${activeProfile.name} (${activeProfile.affiliation})`,
        task.filename,
        task.darkTheme
      );
      if (ok) {
        await logExportToFirestore(activeProfile.name, 'png', task.filename);
      }
    }
  };

  // Restriction for exporting PDF/PNG dossiers (set to false for now per user request; change to true later to re-activate)
  const REQUIRE_AUTH_FOR_EXPORT = false;

  const handleRequestPdfReport = () => {
    const task: PendingExportTask = { type: 'pdf' };
    if (REQUIRE_AUTH_FOR_EXPORT && !authUser) {
      setPendingExport(task);
      setIsAuthModalOpen(true);
      return;
    }
    void executeExportTask(task);
  };

  const handleRequestChartPng = (
    chartId: string,
    title: string,
    filename: string,
    darkTheme: boolean = false
  ) => {
    const task: PendingExportTask = {
      type: 'png',
      chartId,
      title,
      filename,
      darkTheme,
    };
    if (REQUIRE_AUTH_FOR_EXPORT && !authUser) {
      setPendingExport(task);
      setIsAuthModalOpen(true);
      return;
    }
    void executeExportTask(task);
  };

  const handleAuthenticatedSuccess = (user: AuthenticatedResearcher) => {
    saveSessionUser(user);
    setIsAuthModalOpen(false);
    setAuthExternalError(null);

    const targetScholar = user.scholarUserId || user.scholarUrl;
    if (targetScholar) {
      const parsed = parseGoogleScholarInput(targetScholar);
      const queryId = parsed.valid && parsed.userId ? parsed.userId : targetScholar;
      void fetchProfileFromServer(queryId, user.name);
      setActivePage('overview');
    } else if (user.provider !== 'orcid' && !pendingExport) {
      setIsProfileModalOpen(true);
    }

    if (pendingExport) {
      const task = pendingExport;
      setPendingExport(null);
      void executeExportTask(task);
    }
  };

  const handleSignOut = async () => {
    if (authUser?.provider === 'google') {
      await firebaseSignOut(auth);
    }
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch {
      // Ignore network errors when clearing session cookie
    }
    saveSessionUser(null);
  };

  const handleRemoveAccount = () => {
    try {
      void fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch {
      // Ignore
    }
    saveSessionUser(null);
  };

  const pushNavHistory = () => {
    setNavHistory((prev) => [
      ...prev.slice(-24),
      { page: activePage, profile: activeProfile },
    ]);
  };

  const handleGoBack = () => {
    if (navHistory.length === 0) {
      if (window.history.length > 1) {
        window.history.back();
      }
      return;
    }
    const prevEntry = navHistory[navHistory.length - 1];
    setNavHistory((prev) => prev.slice(0, -1));
    if (prevEntry.profile !== activeProfile) {
      setActiveProfile(prevEntry.profile);
    }
    setUrlError(null);
    navigateToPage(prevEntry.page, { skipHistory: true });
  };

  const handleAnalyzeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseGoogleScholarInput(scholarUrlInput);
    if (!parsed.valid || !parsed.userId) {
      setUrlError(
        parsed.error || 'Enter a valid Google Scholar profile link.'
      );
      return;
    }
    if (activeProfile && activeProfile.scholarUserId !== parsed.userId) {
      pushNavHistory();
    }
    await fetchProfileFromServer(parsed.userId, parsed.queryName);
  };

  const navigateToPage = (
    page: AppPage,
    options?: { skipHistory?: boolean }
  ) => {
    if (!options?.skipHistory && page !== activePage) {
      pushNavHistory();
    }
    setActivePage(page);
    try {
      const url = new URL(window.location.href);
      if (page === 'overview') {
        url.searchParams.delete('page');
      } else {
        url.searchParams.set('page', page);
      }
      window.history.pushState({ page }, '', url.toString());
    } catch {
      // Ignore history errors in restricted frames
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickFilterQuartile = (quartile: Quartile) => {
    setFilter((prev) => ({
      ...DEFAULT_FILTER_STATE,
      quartiles:
        prev.quartiles.length === 1 && prev.quartiles[0] === quartile
          ? []
          : [quartile],
    }));
    navigateToPage('publications');
  };

  const handleQuickFilterType = (pubType: PublicationType) => {
    setFilter((prev) => ({
      ...DEFAULT_FILTER_STATE,
      types:
        prev.types.length === 1 && prev.types[0] === pubType ? [] : [pubType],
    }));
    navigateToPage('publications');
  };

  const handleFilterByUniversity = (universityId: string) => {
    setFilter({
      ...DEFAULT_FILTER_STATE,
      universityId,
    });
    navigateToPage('publications');
  };

  const handleFilterByCoAuthor = (coAuthorName: string) => {
    setFilter({
      ...DEFAULT_FILTER_STATE,
      coAuthorName,
    });
    navigateToPage('publications');
  };

  const handleFilterByCountry = (country: string) => {
    setFilter({
      ...DEFAULT_FILTER_STATE,
      country,
    });
    navigateToPage('publications');
  };

  const handleFilterByVenue = (venue: string) => {
    setFilter({
      ...DEFAULT_FILTER_STATE,
      venue,
    });
    navigateToPage('publications');
  };

  const handleInspectUniversityOnGlobe = (universityId: string) => {
    setSelectedGlobeUniId(universityId);
    navigateToPage('map');
  };

  const handleOpenResearcherProfile = (
    authorName: string,
    scholarUserId?: string
  ) => {
    const cleanName = authorName.trim();
    if (!cleanName) return;
    const cleanId = scholarUserId?.trim() || '';
    pushNavHistory();
    navigateToPage('overview', { skipHistory: true });
    if (cleanId) {
      void fetchProfileFromServer(cleanId, cleanName);
      return;
    }
    const parsed = parseGoogleScholarInput(cleanName);
    if (parsed.valid && parsed.userId) {
      void fetchProfileFromServer(
        parsed.userId,
        parsed.queryName || cleanName
      );
    }
  };

  const userInitials = authUser
    ? String(authUser.name || 'Researcher')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  const isProfileAnalyticsView = ![
    'feed',
    'connections',
    'messages',
  ].includes(activePage);

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 pb-24 ${
        activePage === 'map' || activePage === 'directories'
          ? 'lg:h-screen lg:overflow-hidden lg:pb-16'
          : 'lg:pb-20'
      }`}
    >
      {/* Top Bar: Back Button + Brand Logo, Centered Global Search Bar, and Right Actions */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-3 sm:px-5 py-2.5 shrink-0">
        <div className="max-w-[1760px] mx-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-4">
          {/* Left: Back Button (when navigating from a previous view) + Brand Logo */}
          <div className="order-1 flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
            {navHistory.length > 0 && (
              <button
                type="button"
                onClick={handleGoBack}
                data-testid="header-back-button"
                aria-label="Go back to previous page"
                title="Back to previous page"
                className="p-2 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => navigateToPage('overview')}
              data-testid="brand-logo-button"
              className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display cursor-pointer group"
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] flex items-center justify-center shadow-2xs group-hover:from-[#172554] group-hover:to-[#1d4ed8] transition-colors shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4.5 h-4.5 text-white"
                  aria-hidden="true"
                >
                  <circle
                    cx="10.5"
                    cy="10.5"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  />
                  <path
                    d="M15.5 15.5L20.5 20.5"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 12.5V10.5M10.5 12.5V8.5M13 12.5V9.5"
                    stroke="#93c5fd"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>
                Scholar<span className="text-blue-600">Lens</span>
              </span>
            </button>
          </div>

          {/* Center: Global Search Bar (researchers, papers, journals, or Scholar ID / URL) */}
          <div
            ref={headerSearchContainerRef}
            className="order-3 sm:order-2 w-full sm:w-auto sm:flex-1 sm:max-w-2xl relative"
          >
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalSearchQuery}
                onFocus={() => setIsHeaderSearchFocused(true)}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setIsHeaderSearchFocused(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsHeaderSearchFocused(false);
                  } else if (
                    e.key === 'Enter' &&
                    globalSearchQuery.trim() &&
                    activePage !== 'feed'
                  ) {
                    e.preventDefault();
                    if (headerMatchedResearchers.length > 0) {
                      const first = headerMatchedResearchers[0];
                      setIsHeaderSearchFocused(false);
                      handleOpenResearcherProfile(
                        first.name,
                        first.scholarUserId
                      );
                    } else if (headerMatchedScholarProfiles.length > 0) {
                      const first = headerMatchedScholarProfiles[0];
                      setIsHeaderSearchFocused(false);
                      handleOpenResearcherProfile(
                        first.name,
                        first.scholarUserId
                      );
                    } else if (
                      parsedHeaderSearchQuery?.valid &&
                      parsedHeaderSearchQuery.userId
                    ) {
                      setIsHeaderSearchFocused(false);
                      handleOpenResearcherProfile(
                        parsedHeaderSearchQuery.queryName ||
                          parsedHeaderSearchQuery.userId ||
                          globalSearchQuery.trim(),
                        parsedHeaderSearchQuery.userId
                      );
                    } else {
                      setIsHeaderSearchFocused(false);
                      navigateToPage('feed');
                    }
                  }
                }}
                data-testid="header-global-search-input"
                aria-label="Search researcher, paper, journal, or Scholar ID / URL"
                placeholder="Search researcher, paper, journal, or Scholar ID / URL..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100/90 hover:bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all text-slate-800 placeholder:text-slate-400"
              />
              {globalSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setGlobalSearchQuery('');
                    setHeaderMatchedResearchers([]);
                    setHeaderMatchedScholarProfiles([]);
                  }}
                  aria-label="Clear search"
                  data-testid="header-global-search-clear"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isHeaderSearchFocused &&
              globalSearchQuery.trim().length > 0 &&
              activePage !== 'feed' && (
                <div
                  data-testid="header-researcher-search-dropdown"
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-lg p-3 space-y-2.5 z-50 max-h-[70vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Researchers &amp; Search</span>
                    </span>
                    {isSearchingHeader && (
                      <span className="text-[11px] text-blue-600 font-medium">
                        Searching...
                      </span>
                    )}
                  </div>

                  {headerMatchedResearchers.length > 0 ||
                  headerMatchedScholarProfiles.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {headerMatchedResearchers.map((r) => (
                        <div
                          key={r.uid}
                          className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <ScholarProfileAvatar
                              name={r.name}
                              scholarUserId={r.scholarUserId || ''}
                              orcid={r.orcidId}
                              avatarUrl={r.photoURL}
                              compact
                              className="w-8 h-8 shrink-0"
                            />
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsHeaderSearchFocused(false);
                                  handleOpenResearcherProfile(
                                    r.name,
                                    r.scholarUserId
                                  );
                                }}
                                className="text-xs font-bold text-slate-900 hover:text-blue-600 hover:underline truncate block cursor-pointer max-w-full text-left"
                              >
                                {r.name}
                              </button>
                              <p className="text-[11px] text-slate-500 truncate">
                                {r.orcidId
                                  ? `ORCID: ${r.orcidId}`
                                  : r.scholarUserId
                                  ? `Scholar ID: ${r.scholarUserId}`
                                  : 'ScholarLens Researcher'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setIsHeaderSearchFocused(false);
                                handleOpenResearcherProfile(
                                  r.name,
                                  r.scholarUserId
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                            >
                              Profile
                            </button>
                            {!r.isSelf && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsHeaderSearchFocused(false);
                                  setMessageTarget(r);
                                  navigateToPage('messages');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>Message</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {headerMatchedScholarProfiles.map((p) => (
                        <div
                          key={p.scholarUserId}
                          className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <ScholarProfileAvatar
                              name={p.name}
                              scholarUserId={p.scholarUserId}
                              university={p.affiliation}
                              compact
                              className="w-8 h-8 shrink-0"
                            />
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsHeaderSearchFocused(false);
                                  handleOpenResearcherProfile(
                                    p.name,
                                    p.scholarUserId
                                  );
                                }}
                                className="text-xs font-bold text-slate-900 hover:text-blue-600 hover:underline truncate block cursor-pointer max-w-full text-left"
                              >
                                {p.name}
                              </button>
                              <p className="text-[11px] text-slate-500 truncate">
                                {[
                                  p.affiliation || 'Google Scholar Researcher',
                                  p.country,
                                  p.totalCitations
                                    ? `${p.totalCitations.toLocaleString()} citations`
                                    : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsHeaderSearchFocused(false);
                              handleOpenResearcherProfile(
                                p.name,
                                p.scholarUserId
                              );
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold cursor-pointer shrink-0"
                          >
                            View Profile
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !isSearchingHeader && (
                      <p className="text-xs text-slate-500">
                        No registered researchers matched &ldquo;
                        {globalSearchQuery.trim()}&rdquo; yet.
                      </p>
                    )
                  )}

                  {parsedHeaderSearchQuery?.valid &&
                    parsedHeaderSearchQuery.userId && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsHeaderSearchFocused(false);
                          handleOpenResearcherProfile(
                            parsedHeaderSearchQuery.queryName ||
                              parsedHeaderSearchQuery.userId ||
                              globalSearchQuery.trim(),
                            parsedHeaderSearchQuery.userId
                          );
                        }}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-xs font-semibold text-blue-700 transition-colors cursor-pointer"
                      >
                        <span className="truncate">
                          Look up Google Scholar profile for &ldquo;
                          {globalSearchQuery.trim()}&rdquo;
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsHeaderSearchFocused(false);
                      navigateToPage('feed');
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 text-xs font-semibold text-blue-700 transition-colors cursor-pointer"
                  >
                    <span className="truncate">
                      Search newsfeed works &amp; posts for &ldquo;
                      {globalSearchQuery.trim()}&rdquo;
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              )}
          </div>

          {/* Right: Corner User Account Badge / Sign In */}
          <div className="order-2 sm:order-3 flex items-center gap-2 sm:gap-2.5 shrink-0">
            {authUser ? (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                data-testid="corner-profile-button"
                aria-label="Open profile settings"
                title="Profile Settings"
                className="flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <div className="relative w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {authUser.photoURL && authUser.photoURL.trim() ? (
                    <img
                      src={authUser.photoURL.trim()}
                      alt={authUser.name}
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{userInitials || <User className="w-3.5 h-3.5" />}</span>
                  )}
                  {authUser.orcidId && (
                    <span
                      title={`Verified ORCID: ${authUser.orcidId}`}
                      className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#A6CE39] text-[#283800] rounded-full border border-white text-[8px] font-black flex items-center justify-center leading-none shadow-xs"
                    >
                      iD
                    </span>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span
                    data-testid="authenticated-user-badge"
                    className="text-xs font-semibold text-slate-800 max-w-[110px] sm:max-w-[140px] truncate"
                  >
                    {authUser.name}
                  </span>
                  {authUser.orcidId && (
                    <span className="text-[9px] font-mono text-emerald-700 font-semibold leading-none">
                      {authUser.orcidId}
                    </span>
                  )}
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPendingExport(null);
                  setIsAuthModalOpen(true);
                }}
                data-testid="corner-login-button"
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Expanded Multi-Page Workspace */}
      <div
        className={`flex-1 max-w-[1760px] w-full mx-auto px-3 sm:px-5 ${
          activePage === 'map' || activePage === 'directories'
            ? 'py-3 lg:flex lg:flex-col lg:min-h-0 lg:overflow-hidden'
            : 'py-4 sm:py-5'
        }`}
      >
        <main
          className={`w-full ${
            activePage === 'map' || activePage === 'directories'
              ? 'lg:flex-1 lg:min-h-0 lg:flex lg:flex-col gap-4'
              : 'space-y-5'
          }`}
        >
          {/* Profile Analytics Navigator Panel: Shown inside Profile view so users can analyze & generate PDF reports */}
          {activeProfile && isProfileAnalyticsView && (
            <div className="shrink-0 space-y-2">
              <div className="w-full overflow-x-auto pb-0.5 flex justify-start lg:justify-center">
                <nav
                  data-testid="profile-navigator-panel"
                  aria-label="Profile Analytics Navigation"
                  className="inline-flex items-center gap-1 bg-slate-100/90 border border-slate-200/80 p-1 rounded-xl shadow-2xs shrink-0"
                >
                  <form
                    onSubmit={handleAnalyzeSubmit}
                    noValidate
                    className="relative flex items-center shrink-0 mr-1"
                  >
                    {isAnalyzing && (
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none z-10">
                        <span className="text-xs text-slate-400 font-sans tracking-tight">
                          analyzing
                        </span>
                        <SearchLoadingDots size="xs" color="bg-slate-400" />
                      </div>
                    )}
                    <input
                      ref={desktopSearchInputRef}
                      type="text"
                      disabled={isAnalyzing}
                      value={isAnalyzing ? '' : scholarUrlInput}
                      onChange={(e) => {
                        setScholarUrlInput(e.target.value);
                        if (urlError) setUrlError(null);
                      }}
                      placeholder={isAnalyzing ? '' : 'Search Scholar ID / URL...'}
                      aria-label="Search Google Scholar profile URL or User ID"
                      className={`w-40 sm:w-44 xl:w-48 pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-200/90 hover:border-slate-300 focus:border-blue-500 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-all disabled:bg-slate-50 ${
                        isAnalyzing ? 'text-transparent' : ''
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isAnalyzing}
                      aria-label="Search Scholar Profile"
                      title="Search Scholar Profile"
                      className="absolute right-2 text-slate-400 hover:text-blue-600 transition-colors p-1 cursor-pointer disabled:opacity-40"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {PAGE_METADATA.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateToPage(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.shortLabel}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={!activeProfile}
                    onClick={handleRequestPdfReport}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/70 transition-all whitespace-nowrap cursor-pointer disabled:opacity-45 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                  >
                    {authUser || !REQUIRE_AUTH_FOR_EXPORT ? (
                      <FileDown className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>PDF Report</span>
                  </button>
                </nav>
              </div>

              {urlError && (
                <div
                  role="alert"
                  className="max-w-2xl mx-auto flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{urlError}</span>
                </div>
              )}
            </div>
          )}

          {/* Author Header & Toggleable Search Bar */}
          {((activeProfile && activePage === 'overview') ||
            (!activeProfile && isProfileAnalyticsView && !isAnalyzing)) && (
            <section
              aria-label="Google Scholar Profile Header"
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 md:p-7 space-y-4 shadow-xs"
            >
              {activeProfile ? (
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 min-w-0">
                    <ScholarProfileAvatar
                      scholarUserId={activeProfile.scholarUserId}
                      name={activeProfile.name}
                      avatarUrl={
                        authUser?.scholarUserId &&
                        authUser.scholarUserId === activeProfile.scholarUserId &&
                        authUser.photoURL?.trim()
                          ? authUser.photoURL.trim()
                          : activeProfile.avatarUrl
                      }
                      className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40"
                    />
                    <div className="min-w-0 flex-1">
                      <h1
                        data-testid="active-researcher-name"
                        className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight break-words"
                      >
                        {activeProfile.name}
                      </h1>
                      <div className="text-sm sm:text-base md:text-lg text-slate-700 font-medium break-words mt-1 sm:mt-1.5 leading-snug">
                        {activeProfile.affiliation}
                      </div>

                      {activeProfile.fields && activeProfile.fields.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap justify-center sm:justify-start gap-1.5 max-w-2xl">
                          {activeProfile.fields.map((field) => (
                            <span
                              key={field}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-center sm:justify-start">
                        <a
                          href={activeProfile.scholarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-sans font-semibold text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline bg-blue-50/80 hover:bg-blue-100 border border-blue-200/60 px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                        >
                          <span>Google Scholar Profile</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Initial View Search Bar (when no active profile is loaded yet) */}
              {!activeProfile && (
                <form
                  onSubmit={handleAnalyzeSubmit}
                  noValidate
                  className="space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <div className="relative flex-1">
                      <label htmlFor="scholar-url-input-initial" className="sr-only">
                        Google Scholar Profile Link or User ID
                      </label>
                      {isAnalyzing ? (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none z-10">
                          <span className="text-xs sm:text-sm text-slate-400 font-sans tracking-tight">
                            analyzing
                          </span>
                          <SearchLoadingDots size="xs" color="bg-slate-400" />
                        </div>
                      ) : (
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                      <input
                        id="scholar-url-input-initial"
                        type="text"
                        autoFocus
                        disabled={isAnalyzing}
                        value={isAnalyzing ? '' : scholarUrlInput}
                        onChange={(e) => {
                          setScholarUrlInput(e.target.value);
                          if (urlError) setUrlError(null);
                        }}
                        placeholder={
                          isAnalyzing
                            ? ''
                            : 'Search by Google Scholar profile URL or researcher User ID...'
                        }
                        aria-label="Google Scholar Profile Link or User ID"
                        className={`w-full pl-10 pr-12 py-2.5 text-xs sm:text-sm font-sans bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors disabled:bg-slate-100 ${
                          isAnalyzing ? 'text-transparent' : ''
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isAnalyzing}
                      className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap shrink-0 disabled:opacity-75 cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <SearchLoadingDots size="xs" color="bg-white" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          <span>Analyze Profile</span>
                        </>
                      )}
                    </button>
                  </div>

                  {urlError && (
                    <div
                      role="alert"
                      className="mt-2.5 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{urlError}</span>
                    </div>
                  )}
                </form>
              )}
            </section>
          )}

          {/* Loading State */}
          {isAnalyzing && !activeProfile && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-2">
              <div className="text-sm font-semibold text-slate-800">
                Loading Google Scholar profile...
              </div>
            </div>
          )}

          {/* PAGE 1: OVERVIEW */}
          {activeProfile && stats && activePage === 'overview' && (
            <div className="space-y-5">
              {/* Row 1: Core Scholar Profile Summary Metrics */}
              <section
                aria-label="Core Profile Metrics"
                className="grid grid-cols-2 lg:grid-cols-4 gap-3.5"
              >
                {/* 1. Verified Publications */}
                <div className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Verified Publications
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div
                      data-testid="kpi-total-papers"
                      className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight tabular-nums"
                    >
                      {stats.totalPapers}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                      <span>Peer-reviewed corpus</span>
                    </div>
                  </div>
                </div>

                {/* 2. Cumulative Citations */}
                <div className="bg-white border border-slate-200/90 hover:border-emerald-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Cumulative Citations
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div
                      data-testid="kpi-total-citations"
                      className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight tabular-nums"
                    >
                      {stats.totalCitations.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                      <span>~{stats.meanCitationsPerPaper} cites/paper</span>
                    </div>
                  </div>
                </div>

                {/* 3. Citation Indices (h-index & i10-index) */}
                <div className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      h-index / i10-index
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight tabular-nums flex items-baseline gap-1.5">
                      <span>{stats.hIndex}</span>
                      <span className="text-base font-normal text-slate-300">/</span>
                      <span className="text-xl sm:text-2xl text-slate-600">{stats.i10Index}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                      <span>{stats.i10Index} papers ≥ 10 citations</span>
                    </div>
                  </div>
                </div>

                {/* 4. Institutional Network */}
                <div className="bg-white border border-slate-200/90 hover:border-violet-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Institutional Network
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                      <Globe2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight tabular-nums">
                      {universities.length}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                      <span>Across {countries.length} collaborating nations</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Row 2: Separate Q1, Q2, Q3, Q4, Conference & Emerging Percentage Breakdown */}
              <section
                aria-label="Publication Indexing and Quartile Distribution"
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="pb-1 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Journal Quartile &amp; Indexing Distribution
                  </h2>
                </div>

                {/* 6 Category Interactive Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {/* 1. Q1 */}
                  <button
                    type="button"
                    onClick={() => handleQuickFilterQuartile('Q1')}
                    className="text-left p-3 rounded-lg border border-slate-200/90 bg-slate-50/60 hover:bg-blue-50/80 hover:border-blue-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-900">
                        Q1 Journals
                      </span>
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    </div>
                    <div
                      data-testid="kpi-q1-percentage"
                      className="text-xl font-bold font-mono text-slate-900 group-hover:text-blue-700 tabular-nums mt-1"
                    >
                      {stats.portfolioDistribution.Q1.percentage}%
                    </div>
                    <div className="text-[10.5px] text-slate-400 group-hover:text-blue-600/80 font-medium mt-0.5">
                      {stats.portfolioDistribution.Q1.count} papers
                    </div>
                  </button>

                  {/* 2. Q2 */}
                  <button
                    type="button"
                    onClick={() => handleQuickFilterQuartile('Q2')}
                    className="text-left p-3 rounded-lg border border-slate-200/90 bg-slate-50/60 hover:bg-emerald-50/80 hover:border-emerald-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-900">
                        Q2 Journals
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    </div>
                    <div
                      data-testid="kpi-q2-percentage"
                      className="text-xl font-bold font-mono text-slate-900 group-hover:text-emerald-700 tabular-nums mt-1"
                    >
                      {stats.portfolioDistribution.Q2.percentage}%
                    </div>
                    <div className="text-[10.5px] text-slate-400 group-hover:text-emerald-600/80 font-medium mt-0.5">
                      {stats.portfolioDistribution.Q2.count} papers
                    </div>
                  </button>

                  {/* 3. Q3 */}
                  <button
                    type="button"
                    onClick={() => handleQuickFilterQuartile('Q3')}
                    className="text-left p-3 rounded-lg border border-slate-200/90 bg-slate-50/60 hover:bg-amber-50/80 hover:border-amber-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-amber-900">
                        Q3 Journals
                      </span>
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    </div>
                    <div
                      data-testid="kpi-q3-percentage"
                      className="text-xl font-bold font-mono text-slate-900 group-hover:text-amber-700 tabular-nums mt-1"
                    >
                      {stats.portfolioDistribution.Q3.percentage}%
                    </div>
                    <div className="text-[10.5px] text-slate-400 group-hover:text-amber-600/80 font-medium mt-0.5">
                      {stats.portfolioDistribution.Q3.count} papers
                    </div>
                  </button>

                  {/* 4. Q4 */}
                  <button
                    type="button"
                    onClick={() => handleQuickFilterQuartile('Q4')}
                    className="text-left p-3 rounded-lg border border-slate-200/90 bg-slate-50/60 hover:bg-rose-50/80 hover:border-rose-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-rose-900">
                        Q4 Journals
                      </span>
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                    </div>
                    <div
                      data-testid="kpi-q4-percentage"
                      className="text-xl font-bold font-mono text-slate-900 group-hover:text-rose-700 tabular-nums mt-1"
                    >
                      {stats.portfolioDistribution.Q4.percentage}%
                    </div>
                    <div className="text-[10.5px] text-slate-400 group-hover:text-rose-600/80 font-medium mt-0.5">
                      {stats.portfolioDistribution.Q4.count} papers
                    </div>
                  </button>

                  {/* 5. Conference */}
                  <button
                    type="button"
                    onClick={() => handleQuickFilterType('Conference')}
                    className="text-left p-3 rounded-lg border border-slate-200/90 bg-slate-50/60 hover:bg-purple-50/80 hover:border-purple-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-purple-900">
                        Conference
                      </span>
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                    </div>
                    <div
                      data-testid="kpi-conference-percentage"
                      className="text-xl font-bold font-mono text-slate-900 group-hover:text-purple-700 tabular-nums mt-1"
                    >
                      {stats.portfolioDistribution.Conference.percentage}%
                    </div>
                    <div className="text-[10.5px] text-slate-400 group-hover:text-purple-600/80 font-medium mt-0.5">
                      {stats.portfolioDistribution.Conference.count} papers
                    </div>
                  </button>

                  {/* 6. Others / Non-Indexed */}
                  <button
                    type="button"
                    onClick={() => handleQuickFilterQuartile('Unranked')}
                    className="text-left p-3 rounded-lg border border-slate-200/90 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                        Others
                      </span>
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                    </div>
                    <div
                      data-testid="kpi-others-percentage"
                      className="text-xl font-bold font-mono text-slate-900 group-hover:text-slate-900 tabular-nums mt-1"
                    >
                      {stats.portfolioDistribution['Non-Indexed'].percentage}%
                    </div>
                    <div className="text-[10.5px] text-slate-400 group-hover:text-slate-600 font-medium mt-0.5">
                      {stats.portfolioDistribution['Non-Indexed'].count} papers
                    </div>
                  </button>
                </div>

                {/* Modern Sleek Segmented Color Progress Bar */}
                <div
                  aria-label="100% Portfolio Distribution Bar"
                  className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex gap-0.5 p-0.5 border border-slate-200/60"
                >
                  <div
                    style={{
                      width: `${stats.portfolioDistribution.Q1.percentage}%`,
                    }}
                    className="bg-blue-600 h-full rounded-sm"
                    title={`Q1 Journals: ${stats.portfolioDistribution.Q1.percentage}% (${stats.portfolioDistribution.Q1.count} papers)`}
                  />
                  <div
                    style={{
                      width: `${stats.portfolioDistribution.Q2.percentage}%`,
                    }}
                    className="bg-emerald-600 h-full rounded-sm"
                    title={`Q2 Journals: ${stats.portfolioDistribution.Q2.percentage}% (${stats.portfolioDistribution.Q2.count} papers)`}
                  />
                  <div
                    style={{
                      width: `${stats.portfolioDistribution.Q3.percentage}%`,
                    }}
                    className="bg-amber-500 h-full rounded-sm"
                    title={`Q3 Journals: ${stats.portfolioDistribution.Q3.percentage}% (${stats.portfolioDistribution.Q3.count} papers)`}
                  />
                  <div
                    style={{
                      width: `${stats.portfolioDistribution.Q4.percentage}%`,
                    }}
                    className="bg-rose-600 h-full rounded-sm"
                    title={`Q4 Journals: ${stats.portfolioDistribution.Q4.percentage}% (${stats.portfolioDistribution.Q4.count} papers)`}
                  />
                  <div
                    style={{
                      width: `${stats.portfolioDistribution.Conference.percentage}%`,
                    }}
                    className="bg-purple-600 h-full rounded-sm"
                    title={`Conference: ${stats.portfolioDistribution.Conference.percentage}% (${stats.portfolioDistribution.Conference.count} papers)`}
                  />
                  <div
                    style={{
                      width: `${stats.portfolioDistribution['Non-Indexed'].percentage}%`,
                    }}
                    className="bg-slate-500 h-full rounded-sm"
                    title={`Others: ${stats.portfolioDistribution['Non-Indexed'].percentage}% (${stats.portfolioDistribution['Non-Indexed'].count} papers)`}
                  />
                </div>
              </section>

              {/* Row 3: Flattened Global Collaboration Map */}
              <FlatWorldCollaborationMap
                profile={activeProfile}
                universities={universities}
                onSelectUniversity={handleInspectUniversityOnGlobe}
              />

              {/* Quick Navigation Cards to Dedicated Pages (No subtext) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => navigateToPage('charts')}
                  className="text-left bg-white hover:bg-slate-50/80 border border-slate-200 rounded-xl p-4 transition-colors flex items-center justify-between group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      Bibliometric Analytics
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateToPage('map')}
                  className="text-left bg-white hover:bg-slate-50/80 border border-slate-200 rounded-xl p-4 transition-colors flex items-center justify-between group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <Globe2 className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      Collaboration Network
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateToPage('publications')}
                  className="text-left bg-white hover:bg-slate-50/80 border border-slate-200 rounded-xl p-4 transition-colors flex items-center justify-between group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      Publication Portfolio
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateToPage('directories')}
                  className="text-left bg-white hover:bg-slate-50/80 border border-slate-200 rounded-xl p-4 transition-colors flex items-center justify-between group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      Institutional Registry
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              </div>

              {/* Overview Summary Split: Leading Partner Institutions & Most Cited Publications */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Leading Collaborating Institutions ({universities.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigateToPage('map')}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Network Map →
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {universities.slice(0, 5).map((uni) => (
                      <div
                        key={uni.universityId}
                        className="py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="text-xs font-semibold text-slate-900 truncate flex items-center gap-1.5">
                            <span className="truncate">{uni.universityName}</span>
                            {uni.isHomeInstitution && (
                              <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded shrink-0">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {uni.city}, {uni.country} · {uni.coAuthors.length}{' '}
                            {uni.coAuthors.length === 1
                              ? 'co-author'
                              : 'co-authors'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                            {uni.paperCount}{' '}
                            {uni.paperCount === 1 ? 'paper' : 'papers'}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleInspectUniversityOnGlobe(uni.universityId)
                            }
                            className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md cursor-pointer whitespace-nowrap shrink-0"
                          >
                            Locate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Most Cited Publications
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigateToPage('publications')}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Full Portfolio ({stats.totalPapers}) →
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {activeProfile.publications.slice(0, 5).map((pub) => {
                      const cat = getPublicationPortfolioCategory(pub);
                      return (
                        <div
                          key={pub.id}
                          className="py-2.5 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1 pr-3 overflow-hidden">
                            <a
                              href={getPublicationUrl(pub)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1.5 w-full min-w-0 group"
                            >
                              <span className="block truncate flex-1 min-w-0">{pub.title}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 text-slate-400 group-hover:text-blue-600" />
                            </a>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {pub.venue} · {pub.year} ·{' '}
                              <span className="font-semibold text-slate-700">
                                {cat === 'Non-Indexed' ? 'Others' : cat}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-xs font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                              {pub.citations.toLocaleString()} cit.
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: CHARTS (Kept mounted offscreen so PDF report can serialize chart SVGs from any tab) */}
          {activeProfile && stats && (
            <div
              className={
                activePage === 'charts'
                  ? 'block'
                  : 'fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0 select-none'
              }
            >
              <PortfolioBreakdownSection
                stats={stats}
                countries={countries}
                journals={journals}
                coAuthors={coAuthors}
                onQuickFilterQuartile={handleQuickFilterQuartile}
                onQuickFilterType={handleQuickFilterType}
                onExportChartPng={handleRequestChartPng}
                onSelectResearcher={handleOpenResearcherProfile}
              />
            </div>
          )}

          {/* PAGE 3: WORLD COLLABORATION MAP (Kept mounted offscreen so PDF report can serialize flat map from any tab) */}
          {activeProfile && stats && (
            <div
              className={
                activePage === 'map'
                  ? 'block lg:flex-1 lg:min-h-0 lg:flex lg:flex-col'
                  : 'fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0 select-none'
              }
            >
              <GlobeCollaborationMap
                profile={activeProfile}
                universities={universities}
                selectedUniversityId={currentGlobeUniId}
                onSelectUniversity={setSelectedGlobeUniId}
                onFilterByUniversity={handleFilterByUniversity}
                onFilterByCoAuthor={handleFilterByCoAuthor}
                onExportChartPng={handleRequestChartPng}
                onSelectResearcher={handleOpenResearcherProfile}
              />
            </div>
          )}

          {/* PAGE 4: PUBLICATIONS EXPLORER */}
          {activeProfile && stats && activePage === 'publications' && (
            <PublicationsExplorer
              allPublications={activeProfile.publications}
              filteredPublications={filteredPublications}
              filter={filter}
              onChangeFilter={setFilter}
              universities={universities}
              coAuthors={coAuthors}
              countries={countries}
              onInspectUniversityOnGlobe={handleInspectUniversityOnGlobe}
              onSelectResearcher={handleOpenResearcherProfile}
            />
          )}

          {/* PAGE 5: COLLABORATION DIRECTORIES */}
          {activeProfile && stats && activePage === 'directories' && (
            <div className="lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
              <ResearchDirectoriesSection
                profile={activeProfile}
                coAuthors={coAuthors}
                universities={universities}
                countries={countries}
                journals={journals}
                onFilterByCoAuthor={handleFilterByCoAuthor}
                onFilterByUniversity={handleFilterByUniversity}
                onFilterByCountry={handleFilterByCountry}
                onFilterByVenue={handleFilterByVenue}
                onInspectUniversityOnGlobe={handleInspectUniversityOnGlobe}
                onSelectResearcher={handleOpenResearcherProfile}
              />
            </div>
          )}

          {/* PAGE 6: RESEARCHER NEWSFEED (Facebook / LinkedIn-style Scrollable Feed + Post Composer) */}
          {activePage === 'feed' && (
            <ResearchFeedSection
              authUser={authUser}
              activeProfile={activeProfile}
              searchQuery={globalSearchQuery}
              onSearchQueryChange={setGlobalSearchQuery}
              onRequireSignIn={() => {
                setPendingExport(null);
                setIsAuthModalOpen(true);
              }}
              onOpenMessage={(researcher) => {
                setMessageTarget(researcher);
                navigateToPage('messages');
              }}
              onOpenScholarProfile={handleOpenResearcherProfile}
              onSummaryChanged={refreshSocialSummary}
            />
          )}

          {/* PAGE 7: LINKEDIN-STYLE RESEARCHER CONNECTIONS */}
          {activePage === 'connections' && (
            <ConnectionsSection
              authUser={authUser}
              onRequireSignIn={() => {
                setPendingExport(null);
                setIsAuthModalOpen(true);
              }}
              onOpenMessage={(researcher) => {
                setMessageTarget(researcher);
                navigateToPage('messages');
              }}
              onOpenScholarProfile={handleOpenResearcherProfile}
              onSummaryChanged={refreshSocialSummary}
            />
          )}

          {/* PAGE 8: RESEARCHER DIRECT MESSAGING */}
          {activePage === 'messages' && (
            <MessagingSection
              authUser={authUser}
              initialPartner={messageTarget}
              onRequireSignIn={() => {
                setPendingExport(null);
                setIsAuthModalOpen(true);
              }}
              onOpenScholarProfile={handleOpenResearcherProfile}
              onUnreadUpdated={refreshSocialSummary}
            />
          )}
        </main>
      </div>

      {/* Persistent Bottom Navigation Bar (Matching Top Navigation Menu) */}
      <div className="fixed bottom-3 inset-x-0 z-40 flex justify-center px-3 pointer-events-none">
        <nav
          aria-label="Bottom Social Navigation"
          data-testid="bottom-navigation-bar"
          className="pointer-events-auto inline-flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-slate-200/90 p-1 rounded-xl shadow-lg"
        >
          <button
            type="button"
            onClick={() => navigateToPage('feed')}
            data-testid="bottom-nav-feed"
            aria-current={activePage === 'feed' ? 'page' : undefined}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activePage === 'feed'
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Rss className="w-3.5 h-3.5 shrink-0" />
            <span>Feed</span>
          </button>

          <button
            type="button"
            onClick={() => navigateToPage('connections')}
            data-testid="bottom-nav-connections"
            aria-current={activePage === 'connections' ? 'page' : undefined}
            className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activePage === 'connections'
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Connections</span>
            {socialSummary.pendingConnectionsCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activePage === 'connections'
                    ? 'bg-white text-blue-600'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {socialSummary.pendingConnectionsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigateToPage('messages')}
            data-testid="bottom-nav-messages"
            aria-current={activePage === 'messages' ? 'page' : undefined}
            className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activePage === 'messages'
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span>Messages</span>
            {socialSummary.unreadMessagesCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activePage === 'messages'
                    ? 'bg-white text-blue-600'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {socialSummary.unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!authUser) {
                setPendingExport(null);
                setIsAuthModalOpen(true);
                return;
              }
              const targetScholar =
                authUser.scholarUserId || authUser.scholarUrl;
              const parsed = targetScholar
                ? parseGoogleScholarInput(targetScholar)
                : null;
              const queryId =
                parsed?.valid && parsed.userId ? parsed.userId : targetScholar;
              if (
                queryId &&
                (!activeProfile || activeProfile.scholarUserId !== queryId)
              ) {
                if (activePage === 'overview' && activeProfile) {
                  pushNavHistory();
                  navigateToPage('overview', { skipHistory: true });
                } else {
                  navigateToPage('overview');
                }
                void fetchProfileFromServer(queryId, authUser.name);
              } else {
                navigateToPage('overview');
              }
            }}
            data-testid="bottom-nav-profile"
            aria-current={
              activePage === 'overview' &&
              Boolean(
                authUser?.scholarUserId &&
                  activeProfile?.scholarUserId === authUser.scholarUserId
              )
                ? 'page'
                : undefined
            }
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activePage === 'overview' &&
              Boolean(
                authUser?.scholarUserId &&
                  activeProfile?.scholarUserId === authUser.scholarUserId
              )
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span>Profile</span>
          </button>
        </nav>
      </div>

      {/* Gmail / ORCID Login Modal */}
      <AuthGateModal
        isOpen={isAuthModalOpen}
        externalError={authExternalError}
        defaultScholarUrl={
          activeProfile?.scholarUrl ||
          (activeProfile?.scholarUserId
            ? `https://scholar.google.com/citations?user=${activeProfile.scholarUserId}`
            : '')
        }
        pendingActionLabel={
          pendingExport?.type === 'pdf'
            ? 'Full Profile PDF Report'
            : pendingExport?.type === 'png'
            ? `PNG Chart (${pendingExport.title})`
            : null
        }
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthExternalError(null);
          setPendingExport(null);
        }}
        onAuthenticated={handleAuthenticatedSuccess}
      />

      {/* Profile Settings Modal (Edit Display Name, Profile Picture & Mandatory Google Scholar Link) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        user={authUser}
        onClose={() => setIsProfileModalOpen(false)}
        onUpdateUser={(updated) => {
          saveSessionUser(updated);
          if (updated.scholarUrl) {
            const parsed = parseGoogleScholarInput(updated.scholarUrl);
            if (
              parsed.valid &&
              parsed.userId &&
              (!activeProfile || activeProfile.scholarUserId !== parsed.userId)
            ) {
              void fetchProfileFromServer(parsed.userId, parsed.queryName);
            }
          }
          if (pendingExport) {
            const task = pendingExport;
            setPendingExport(null);
            void executeExportTask(task);
          }
        }}
        onSignOut={handleSignOut}
        onRemoveAccount={handleRemoveAccount}
      />
    </div>
  );
}
