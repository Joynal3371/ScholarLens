import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Rss,
  Image as ImageIcon,
  Video,
  BookOpen,
  UserPlus,
  Users,
  ThumbsUp,
  MessageCircle,
  MessageSquare,
  Send,
  Trash2,
  ExternalLink,
  X,
  ArrowUp,
  ShieldCheck,
  Check,
  Clock,
  Share2,
  Loader2,
} from 'lucide-react';
import { AuthenticatedResearcher } from './AuthGateModal';
import { ScholarProfileAvatar } from './ScholarProfileAvatar';
import { ConnectionStatus, SiteResearcher } from './ConnectionsSection';
import {
  Publication,
  ResearcherProfile,
  getPublicationUrl,
  parseGoogleScholarInput,
} from '../utils/scholarAnalytics';

interface MentionedWork {
  id?: string;
  title: string;
  venue?: string;
  year?: number;
  citations?: number;
  quartile?: string;
  type?: string;
  doi?: string;
  url?: string;
}

interface TaggedCoAuthor {
  name: string;
  scholarUserId?: string;
  uid?: string;
  university?: string;
}

interface FeedComment {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhoto?: string;
  authorScholarUserId?: string;
  text: string;
  createdAt: string;
}

interface FeedAuthorMeta {
  uid: string;
  name: string;
  photoURL?: string;
  scholarUserId?: string;
  orcidId?: string;
  affiliation?: string;
  country?: string;
  verified?: boolean;
  connectionStatus?: ConnectionStatus;
  isSelf?: boolean;
}

interface FeedPostItem {
  feedId: string;
  kind: 'post';
  postId: string;
  createdAt: string;
  author: FeedAuthorMeta;
  caption: string;
  mentionedWork?: MentionedWork | null;
  taggedCoAuthors: TaggedCoAuthor[];
  images: string[];
  video?: { url: string; kind: 'upload' | 'external' } | null;
  likesCount: number;
  likedByMe: boolean;
  comments: FeedComment[];
  suggestionReason?: 'connected' | 'coauthor' | 'coauthor_coauthor' | 'community';
  suggestionLabel?: string;
}

interface FeedWorkItem {
  feedId: string;
  kind: 'work';
  createdAt: string;
  author: FeedAuthorMeta;
  suggestionReason?: 'connected' | 'coauthor' | 'coauthor_coauthor' | 'community';
  suggestionLabel?: string;
  work: {
    id: string;
    title: string;
    venue: string;
    year: number;
    citations: number;
    quartile?: string;
    type?: string;
    doi?: string;
    url?: string;
    coAuthorNames: string[];
  };
}

type FeedItem = FeedPostItem | FeedWorkItem;
type FeedFilter = 'all' | 'posts' | 'works' | 'connections';

interface ResearchFeedSectionProps {
  authUser: AuthenticatedResearcher | null;
  activeProfile: ResearcherProfile | null;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  onRequireSignIn: () => void;
  onOpenMessage: (researcher: SiteResearcher) => void;
  onOpenScholarProfile: (name: string, scholarUserId?: string) => void;
  onSummaryChanged?: () => void;
}

function resizePostImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1080;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        let uri = canvas.toDataURL('image/jpeg', 0.8);
        if (uri.length > 260000) {
          uri = canvas.toDataURL('image/jpeg', 0.62);
        }
        resolve(uri);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function getYouTubeEmbedUrl(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith('/embed/')) return rawUrl;
      const shortsMatch = u.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]+)/);
      if (shortsMatch?.[1]) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

function formatPostDate(iso: string): string {
  try {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export const ResearchFeedSection: React.FC<ResearchFeedSectionProps> = ({
  authUser,
  activeProfile,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
  onRequireSignIn,
  onOpenMessage,
  onOpenScholarProfile,
  onSummaryChanged,
}) => {
  const [filterMode, setFilterMode] = useState<FeedFilter>('all');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery =
    controlledSearchQuery !== undefined ? controlledSearchQuery : internalSearchQuery;
  const [items, setItems] = useState<FeedItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [suggestedResearchers, setSuggestedResearchers] = useState<SiteResearcher[]>([]);
  const [matchedResearchers, setMatchedResearchers] = useState<SiteResearcher[]>([]);
  const [matchedScholarProfiles, setMatchedScholarProfiles] = useState<
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
  const [isSearchingResearchers, setIsSearchingResearchers] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Composer State
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [caption, setCaption] = useState('');
  const [mentionedWork, setMentionedWork] = useState<MentionedWork | null>(null);
  const [showWorkPicker, setShowWorkPicker] = useState(false);
  const [workSearchQuery, setWorkSearchQuery] = useState('');
  const [myPublications, setMyPublications] = useState<Publication[]>([]);
  const [isLoadingMyWorks, setIsLoadingMyWorks] = useState(false);
  const [taggedCoAuthors, setTaggedCoAuthors] = useState<TaggedCoAuthor[]>([]);
  const [showCoAuthorPicker, setShowCoAuthorPicker] = useState(false);
  const [coAuthorInput, setCoAuthorInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);

  // Comment state per post
  const [openCommentsPostIds, setOpenCommentsPostIds] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 420);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fetchFeed = useCallback(
    async (offsetVal: number, append: boolean) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setFeedError(null);
      try {
        const viewerSid =
          authUser?.scholarUserId || activeProfile?.scholarUserId || '';
        const params = new URLSearchParams({
          filter: filterMode,
          offset: String(offsetVal),
          limit: '15',
          ...(viewerSid ? { scholarId: viewerSid } : {}),
          ...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
        });
        const resp = await fetch(`/api/social/feed?${params.toString()}`, {
          credentials: 'include',
        });
        if (!resp.ok) throw new Error('Could not load research newsfeed.');
        const data = await resp.json();
        const incomingItems: FeedItem[] = Array.isArray(data.items) ? data.items : [];
        setItems((prev) => (append ? [...prev, ...incomingItems] : incomingItems));
        setHasMore(Boolean(data.hasMore));
      } catch (err: any) {
        setFeedError(err?.message || 'Unable to load feed.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [filterMode, searchQuery, authUser?.scholarUserId, activeProfile?.scholarUserId]
  );

  const loadSuggestedResearchers = useCallback(async () => {
    try {
      const resp = await fetch('/api/social/researchers', {
        credentials: 'include',
      });
      if (!resp.ok) return;
      const data = await resp.json();
      setSuggestedResearchers(
        (data.researchers || []).filter((r: SiteResearcher) => !r.isSelf)
      );
    } catch {
      // Ignore sidebar refresh errors
    }
  }, []);

  useEffect(() => {
    void fetchFeed(0, false);
  }, [fetchFeed]);

  useEffect(() => {
    void loadSuggestedResearchers();
  }, [loadSuggestedResearchers, authUser?.uid]);

  // Find researchers matching the feed search query (site users + analyzed Scholar profiles)
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setMatchedResearchers([]);
      setMatchedScholarProfiles([]);
      setIsSearchingResearchers(false);
      return;
    }

    const qLower = q.toLowerCase();
    const localHits = suggestedResearchers.filter(
      (r) =>
        r.name.toLowerCase().includes(qLower) ||
        (r.affiliation || '').toLowerCase().includes(qLower) ||
        (r.country || '').toLowerCase().includes(qLower) ||
        (r.orcidId || '').toLowerCase().includes(qLower) ||
        (r.scholarUserId || '').toLowerCase().includes(qLower)
    );
    setMatchedResearchers(localHits);

    let cancelled = false;
    setIsSearchingResearchers(true);
    const timer = window.setTimeout(async () => {
      try {
        const resp = await fetch(
          `/api/social/researchers?q=${encodeURIComponent(q)}`,
          { credentials: 'include' }
        );
        if (!resp.ok || cancelled) return;
        const data = await resp.json();
        if (cancelled) return;
        setMatchedResearchers(Array.isArray(data.researchers) ? data.researchers : []);
        setMatchedScholarProfiles(
          Array.isArray(data.scholarProfiles) ? data.scholarProfiles : []
        );
      } catch {
        // Keep local hits on transient errors
      } finally {
        if (!cancelled) setIsSearchingResearchers(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, suggestedResearchers]);

  // Continuous infinite scroll (IntersectionObserver + window scroll fallback)
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;
    const node = loadMoreSentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchFeed(items.length, true);
        }
      },
      { rootMargin: '450px' }
    );
    observer.observe(node);

    const handleScrollNearBottom = () => {
      const remaining =
        document.documentElement.scrollHeight -
        (window.scrollY + window.innerHeight);
      if (remaining < 420) {
        void fetchFeed(items.length, true);
      }
    };
    window.addEventListener('scroll', handleScrollNearBottom, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollNearBottom);
    };
  }, [hasMore, isLoading, isLoadingMore, items.length, fetchFeed]);

  // Load user's own Scholar publications when opening work/coauthor picker
  useEffect(() => {
    if (!authUser?.scholarUserId) return;
    if (
      activeProfile?.scholarUserId &&
      activeProfile.scholarUserId === authUser.scholarUserId &&
      activeProfile.publications.length > 0
    ) {
      setMyPublications(activeProfile.publications);
      return;
    }
    if (!isComposerExpanded || myPublications.length > 0 || isLoadingMyWorks) {
      return;
    }
    setIsLoadingMyWorks(true);
    fetch(
      `/api/scholar/analyze?userId=${encodeURIComponent(authUser.scholarUserId)}`,
      { credentials: 'include' }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.profile?.publications) {
          setMyPublications(data.profile.publications);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingMyWorks(false));
  }, [
    authUser?.scholarUserId,
    activeProfile,
    isComposerExpanded,
    myPublications.length,
    isLoadingMyWorks,
  ]);

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    setIsComposerExpanded(true);
    setComposerError(null);
    for (const f of files.slice(0, Math.max(0, 3 - images.length))) {
      try {
        const uri = await resizePostImageToDataUrl(f);
        setImages((prev) => (prev.length < 3 ? [...prev, uri] : prev));
      } catch (err: any) {
        setComposerError(err?.message || 'Could not process image.');
      }
    }
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsComposerExpanded(true);
    setComposerError(null);
    if (file.size > 520 * 1024) {
      setComposerError(
        'Direct video upload supports clips up to 500 KB.'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setVideoUrl(String(reader.result || ''));
    };
    reader.onerror = () => setComposerError('Could not read selected video file.');
    reader.readAsDataURL(file);
  };

  const addCoAuthorTag = (candidate: TaggedCoAuthor) => {
    const cleanName = candidate.name.trim();
    if (!cleanName) return;
    setTaggedCoAuthors((prev) => {
      if (prev.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
        return prev;
      }
      return [...prev, { ...candidate, name: cleanName }];
    });
    setCoAuthorInput('');
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      onRequireSignIn();
      return;
    }
    setComposerError(null);
    setIsPublishing(true);
    try {
      const resp = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          caption,
          mentionedWork,
          taggedCoAuthors,
          images,
          videoUrl: videoUrl.trim() || undefined,
        }),
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody?.error || 'Could not publish post.');
      }
      setCaption('');
      setMentionedWork(null);
      setTaggedCoAuthors([]);
      setImages([]);
      setVideoUrl('');
      setShowWorkPicker(false);
      setShowCoAuthorPicker(false);
      setIsComposerExpanded(false);
      await fetchFeed(0, false);
    } catch (err: any) {
      setComposerError(err?.message || 'Failed to publish post.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!authUser) {
      onRequireSignIn();
      return;
    }
    try {
      const resp = await fetch(`/api/social/posts/${encodeURIComponent(postId)}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!resp.ok) return;
      const data = await resp.json();
      setItems((prev) =>
        prev.map((item) =>
          item.kind === 'post' && item.postId === postId
            ? {
                ...item,
                likesCount: data.likesCount,
                likedByMe: data.likedByMe,
              }
            : item
        )
      );
    } catch {
      // Ignore toggle error
    }
  };

  const handleSubmitComment = async (postId: string) => {
    if (!authUser) {
      onRequireSignIn();
      return;
    }
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;
    try {
      const resp = await fetch(
        `/api/social/posts/${encodeURIComponent(postId)}/comment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ text }),
        }
      );
      if (!resp.ok) return;
      const data = await resp.json();
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      setItems((prev) =>
        prev.map((item) =>
          item.kind === 'post' && item.postId === postId
            ? { ...item, comments: data.comments || [] }
            : item
        )
      );
    } catch {
      // Ignore comment error
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!authUser) return;
    try {
      const resp = await fetch(`/api/social/posts/${encodeURIComponent(postId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!resp.ok) return;
      setItems((prev) =>
        prev.filter((item) => !(item.kind === 'post' && item.postId === postId))
      );
    } catch {
      // Ignore delete error
    }
  };

  const handleQuickConnect = async (targetUid: string) => {
    if (!authUser) {
      onRequireSignIn();
      return;
    }
    if (!targetUid) return;
    try {
      const resp = await fetch('/api/social/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetUid }),
      });
      if (!resp.ok) return;
      const data = await resp.json();
      const nextStatus: ConnectionStatus = data.status || 'pending_sent';
      setItems((prev) =>
        prev.map((item) =>
          item.author.uid === targetUid
            ? {
                ...item,
                author: { ...item.author, connectionStatus: nextStatus },
              }
            : item
        )
      );
      setSuggestedResearchers((prev) =>
        prev.map((r) =>
          r.uid === targetUid ? { ...r, connectionStatus: nextStatus } : r
        )
      );
      onSummaryChanged?.();
    } catch {
      // Ignore quick connect error
    }
  };

  const handleDiscussWorkInPost = (work: FeedWorkItem['work']) => {
    if (!authUser) {
      onRequireSignIn();
      return;
    }
    setMentionedWork({
      id: work.id,
      title: work.title,
      venue: work.venue,
      year: work.year,
      citations: work.citations,
      quartile: work.quartile,
      type: work.type,
      doi: work.doi,
      url: work.url,
    });
    setIsComposerExpanded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build unique co-author suggestions from user's Scholar publications + site researchers
  const coAuthorSuggestions = React.useMemo(() => {
    const map = new Map<string, TaggedCoAuthor>();
    for (const r of suggestedResearchers) {
      map.set(r.name.toLowerCase(), {
        name: r.name,
        uid: r.uid,
        scholarUserId: r.scholarUserId,
        university: r.affiliation,
      });
    }
    for (const pub of myPublications) {
      for (const ca of pub.coAuthors || []) {
        if (!ca.name || ca.name === authUser?.name) continue;
        const key = ca.name.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            name: ca.name,
            scholarUserId: ca.scholarUserId,
            university: ca.universityName,
          });
        }
      }
    }
    const q = coAuthorInput.trim().toLowerCase();
    return Array.from(map.values())
      .filter(
        (c) =>
          !taggedCoAuthors.some(
            (t) => t.name.toLowerCase() === c.name.toLowerCase()
          ) &&
          (!q ||
            c.name.toLowerCase().includes(q) ||
            (c.university || '').toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [suggestedResearchers, myPublications, authUser?.name, coAuthorInput, taggedCoAuthors]);

  const filteredMyWorks = React.useMemo(() => {
    const q = workSearchQuery.trim().toLowerCase();
    return myPublications
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.venue.toLowerCase().includes(q) ||
          String(p.year).includes(q)
      )
      .slice(0, 12);
  }, [myPublications, workSearchQuery]);

  const parsedFeedScholarQuery = React.useMemo(
    () => (searchQuery.trim() ? parseGoogleScholarInput(searchQuery) : null),
    [searchQuery]
  );

  return (
    <div className="w-full">
      {/* Main Scrollable Newsfeed Column */}
      <div className="w-full space-y-4">
        {/* Feed Filters (Search moved to top header bar) */}
        <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2.5 shadow-2xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['all', 'posts', 'works', ...(authUser ? ['connections'] : [])] as FeedFilter[]).map(
              (f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterMode(f)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                    filterMode === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {f === 'all'
                    ? 'All'
                    : f === 'posts'
                    ? 'Posts'
                    : f === 'works'
                    ? 'Works'
                    : 'Connections'}
                </button>
              )
            )}
          </div>
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={() => {
                onSearchQueryChange?.('');
                if (controlledSearchQuery === undefined) {
                  setInternalSearchQuery('');
                }
              }}
              className="text-[11px] font-semibold text-blue-600 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Researcher Search Matches */}
        {searchQuery.trim().length > 0 && (
          <div
            data-testid="feed-researcher-search-results"
            className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Researchers</span>
              </span>
              {isSearchingResearchers && (
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              )}
            </div>

            {matchedResearchers.length === 0 &&
            matchedScholarProfiles.length === 0 &&
            !isSearchingResearchers ? (
              <p className="text-xs text-slate-500">
                No registered researchers matched &ldquo;{searchQuery.trim()}&rdquo; yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {matchedResearchers.map((r) => (
                  <div
                    key={r.uid}
                    className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ScholarProfileAvatar
                        name={r.name}
                        scholarUserId={r.scholarUserId || ''}
                        orcid={r.orcidId}
                        university={r.affiliation}
                        avatarUrl={r.photoURL}
                        compact
                        className="w-9 h-9 shrink-0"
                      />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenScholarProfile(r.name, r.scholarUserId)
                          }
                          className="text-xs font-bold text-slate-900 hover:text-blue-600 hover:underline truncate inline-flex items-center gap-1 cursor-pointer max-w-full"
                        >
                          <span className="truncate">{r.name}</span>
                          {r.orcidId && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </button>
                        <p className="text-[11px] text-slate-500 truncate">
                          {[
                            r.affiliation || 'Verified Researcher',
                            r.country,
                            r.publicationCount
                              ? `${r.publicationCount} papers`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenScholarProfile(r.name, r.scholarUserId)
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                      >
                        Profile
                      </button>
                      {!r.isSelf && r.connectionStatus !== 'connected' && (
                        <button
                          type="button"
                          disabled={r.connectionStatus === 'pending_sent'}
                          onClick={() => handleQuickConnect(r.uid)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold disabled:opacity-60 cursor-pointer"
                        >
                          {r.connectionStatus === 'pending_sent'
                            ? 'Pending'
                            : 'Connect'}
                        </button>
                      )}
                      {!r.isSelf && (
                        <button
                          type="button"
                          onClick={() => onOpenMessage(r)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-semibold cursor-pointer"
                        >
                          Message
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {matchedScholarProfiles.map((p) => (
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
                        className="w-9 h-9 shrink-0"
                      />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenScholarProfile(p.name, p.scholarUserId)
                          }
                          className="text-xs font-bold text-slate-900 hover:text-blue-600 hover:underline truncate block cursor-pointer max-w-full"
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
                      onClick={() =>
                        onOpenScholarProfile(p.name, p.scholarUserId)
                      }
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold cursor-pointer shrink-0"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            )}

            {parsedFeedScholarQuery?.valid && parsedFeedScholarQuery.userId && (
              <button
                type="button"
                onClick={() =>
                  onOpenScholarProfile(
                    parsedFeedScholarQuery.queryName ||
                      parsedFeedScholarQuery.userId ||
                      searchQuery.trim(),
                    parsedFeedScholarQuery.userId
                  )
                }
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-xs font-semibold text-blue-700 transition-colors cursor-pointer"
              >
                <span className="truncate">
                  Look up Google Scholar profile for &ldquo;{searchQuery.trim()}&rdquo;
                </span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </button>
            )}
          </div>
        )}

        {/* Create Post Composer (Facebook / LinkedIn style) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <input
            ref={imageFileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageFileSelect}
            className="hidden"
          />
          <input
            ref={videoFileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/*"
            onChange={handleVideoFileSelect}
            className="hidden"
          />
          <div className="flex items-center gap-3">
            <ScholarProfileAvatar
              name={authUser?.name || 'Guest Researcher'}
              scholarUserId={authUser?.scholarUserId || ''}
              orcid={authUser?.orcidId}
              avatarUrl={authUser?.photoURL}
              compact
              className="w-10 h-10 shrink-0"
            />
            <button
              type="button"
              data-testid="composer-trigger-bar"
              onClick={() => {
                if (!authUser) {
                  onRequireSignIn();
                  return;
                }
                setIsComposerExpanded(true);
              }}
              className="flex-1 text-left px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/75 text-xs text-slate-500 font-medium transition-colors cursor-pointer"
            >
              {authUser
                ? `Share a publication milestone, dataset, image, or video, ${authUser.name.split(' ')[0]}...`
                : 'Sign in with ORCID to post your research updates...'}
            </button>
          </div>

          {/* Expanded Post Composer Form */}
          {isComposerExpanded && authUser && (
            <form onSubmit={handlePublishPost} className="space-y-3 pt-2 border-t border-slate-100">
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption about your research findings, paper acceptance, or experiment..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 resize-y"
              />

              {/* Tagged Co-Authors Chips */}
              {taggedCoAuthors.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Tagged co-authors:
                  </span>
                  {taggedCoAuthors.map((tag) => (
                    <span
                      key={tag.name}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold"
                    >
                      <span>@{tag.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setTaggedCoAuthors((prev) =>
                            prev.filter((t) => t.name !== tag.name)
                          )
                        }
                        className="hover:text-indigo-950 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Mentioned Work Preview */}
              {mentionedWork && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      <BookOpen className="w-3 h-3" />
                      <span>Mentioned Research Work</span>
                      {mentionedWork.quartile && mentionedWork.quartile !== 'Unranked' && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white">
                          {mentionedWork.quartile}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                      {mentionedWork.title}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {[mentionedWork.venue, mentionedWork.year]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMentionedWork(null)}
                    className="p-1 rounded-lg hover:bg-blue-100 text-blue-700 cursor-pointer"
                    aria-label="Remove mentioned work"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                    >
                      <img
                        src={imgSrc}
                        alt={`Attachment ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Video Preview */}
              {videoUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                  {getYouTubeEmbedUrl(videoUrl) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(videoUrl)!}
                      title="Attached video preview"
                      className="w-full aspect-video"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      className="w-full max-h-60 object-contain"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setVideoUrl('')}
                    className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-white hover:bg-slate-950 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Picker Panels */}
              {showWorkPicker && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">
                      Select Research Work to Mention
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowWorkPicker(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={workSearchQuery}
                    onChange={(e) => setWorkSearchQuery(e.target.value)}
                    placeholder="Filter your papers by title, journal, or year..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  {isLoadingMyWorks ? (
                    <div className="text-[11px] text-slate-400 py-2 flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Loading your Google Scholar works...</span>
                    </div>
                  ) : filteredMyWorks.length === 0 ? (
                    <p className="text-[11px] text-slate-500 py-1">
                      No matching papers found in your loaded publications.
                    </p>
                  ) : (
                    <div className="max-h-44 overflow-y-auto divide-y divide-slate-200/70 bg-white border border-slate-200 rounded-lg">
                      {filteredMyWorks.map((pub) => (
                        <button
                          key={pub.id}
                          type="button"
                          onClick={() => {
                            setMentionedWork({
                              id: pub.id,
                              title: pub.title,
                              venue: pub.venue,
                              year: pub.year,
                              citations: pub.citations,
                              quartile: pub.quartile,
                              type: pub.type,
                              doi: pub.doi,
                              url: getPublicationUrl(pub) || undefined,
                            });
                            setShowWorkPicker(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50/70 transition-colors cursor-pointer"
                        >
                          <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                            {pub.title}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {pub.venue} · {pub.year} · {pub.citations} citations
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showCoAuthorPicker && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">
                      Tag Co-Authors
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCoAuthorPicker(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={coAuthorInput}
                      onChange={(e) => setCoAuthorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && coAuthorInput.trim()) {
                          e.preventDefault();
                          addCoAuthorTag({ name: coAuthorInput.trim() });
                        }
                      }}
                      placeholder="Type co-author name & press Enter..."
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      disabled={!coAuthorInput.trim()}
                      onClick={() => addCoAuthorTag({ name: coAuthorInput.trim() })}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  {coAuthorSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {coAuthorSuggestions.map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => addCoAuthorTag(s)}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-[11px] font-medium text-slate-700 cursor-pointer"
                        >
                          + {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {composerError && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {composerError}
                </div>
              )}

              {/* Composer Toolbar & Publish */}
              <div
                data-testid="composer-action-toolbar"
                className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100"
              >
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowWorkPicker((v) => !v)}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50 text-xs font-semibold text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Work</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => imageFileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-xs font-semibold text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-xs font-semibold text-rose-600 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCoAuthorPicker((v) => !v)}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 text-xs font-semibold text-indigo-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Tag Authors</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposerExpanded(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isPublishing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Feed Stream */}
        {feedError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-2xl">
            {feedError}
          </div>
        )}

        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading researcher newsfeed...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
            <Rss className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              No feed updates match right now
            </p>
            <p className="text-xs text-slate-500">
              Be the first to share a research post or analyze a Google Scholar profile to populate works here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const author = item.author;
              const canMessageAuthor = Boolean(author.uid && !author.isSelf);
              const showConnectBtn = Boolean(
                author.uid &&
                  !author.isSelf &&
                  (author.connectionStatus === 'none' ||
                    author.connectionStatus === 'pending_sent')
              );

              if (item.kind === 'post') {
                const commentsOpen = Boolean(openCommentsPostIds[item.postId]);
                return (
                  <article
                    key={item.feedId}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
                  >
                    {/* Author Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <ScholarProfileAvatar
                          name={author.name}
                          scholarUserId={author.scholarUserId || ''}
                          orcid={author.orcidId}
                          university={author.affiliation}
                          avatarUrl={author.photoURL}
                          compact
                          className="w-10 h-10 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                onOpenScholarProfile(
                                  author.name,
                                  author.scholarUserId
                                )
                              }
                              className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                            >
                              {author.name}
                            </button>
                            {author.verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            {item.suggestionReason &&
                              item.suggestionReason !== 'community' &&
                              item.suggestionLabel && (
                                <span
                                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                                    item.suggestionReason === 'connected'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                      : item.suggestionReason === 'coauthor'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                                  }`}
                                >
                                  {item.suggestionLabel}
                                </span>
                              )}
                            {item.taggedCoAuthors.length > 0 && (
                              <span className="text-xs text-slate-500">
                                with{' '}
                                {item.taggedCoAuthors.map((tag, idx) => (
                                  <React.Fragment key={tag.name}>
                                    {idx > 0 ? ', ' : ''}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onOpenScholarProfile(
                                          tag.name,
                                          tag.scholarUserId
                                        )
                                      }
                                      className="font-semibold text-indigo-700 hover:underline cursor-pointer"
                                    >
                                      @{tag.name}
                                    </button>
                                  </React.Fragment>
                                ))}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {[
                              author.affiliation || 'ScholarLens Researcher',
                              formatPostDate(item.createdAt),
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {showConnectBtn && (
                          <button
                            type="button"
                            disabled={author.connectionStatus === 'pending_sent'}
                            onClick={() => handleQuickConnect(author.uid)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer ${
                              author.connectionStatus === 'pending_sent'
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                            }`}
                          >
                            {author.connectionStatus === 'pending_sent' ? (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>Pending</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span>Connect</span>
                              </>
                            )}
                          </button>
                        )}
                        {canMessageAuthor && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenMessage({
                                uid: author.uid,
                                name: author.name,
                                photoURL: author.photoURL,
                                scholarUserId: author.scholarUserId,
                                orcidId: author.orcidId,
                                affiliation: author.affiliation,
                                verified: author.verified,
                              })
                            }
                            title={`Message ${author.name}`}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {author.isSelf && (
                          <button
                            type="button"
                            onClick={() => handleDeletePost(item.postId)}
                            title="Delete post"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Caption */}
                    {item.caption && (
                      <p className="text-xs sm:text-[13px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {item.caption}
                      </p>
                    )}

                    {/* Mentioned Research Work Card */}
                    {item.mentionedWork && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
                            Research Work
                          </span>
                          {item.mentionedWork.quartile &&
                            item.mentionedWork.quartile !== 'Unranked' && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                {item.mentionedWork.quartile}
                              </span>
                            )}
                          {item.mentionedWork.year && (
                            <span className="text-slate-500">
                              {item.mentionedWork.year}
                            </span>
                          )}
                          {typeof item.mentionedWork.citations === 'number' && (
                            <span className="text-slate-500">
                              · {item.mentionedWork.citations} citations
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {item.mentionedWork.title}
                        </h4>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                          <span>{item.mentionedWork.venue || 'Academic Publication'}</span>
                          {(item.mentionedWork.url || item.mentionedWork.doi) && (
                            <a
                              href={
                                item.mentionedWork.url ||
                                `https://doi.org/${item.mentionedWork.doi}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                            >
                              <span>Open Paper</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Images Grid */}
                    {item.images.length > 0 && (
                      <div
                        className={`grid gap-2 ${
                          item.images.length === 1
                            ? 'grid-cols-1'
                            : item.images.length === 2
                            ? 'grid-cols-2'
                            : 'grid-cols-3'
                        }`}
                      >
                        {item.images.map((src, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setLightboxImage(src)}
                            className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-zoom-in block w-full"
                          >
                            <img
                              src={src}
                              alt={`Research post media ${idx + 1}`}
                              className="w-full max-h-[380px] object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Video Player */}
                    {item.video?.url && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                        {getYouTubeEmbedUrl(item.video.url) ? (
                          <iframe
                            src={getYouTubeEmbedUrl(item.video.url)!}
                            title="Research post video"
                            className="w-full aspect-video"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={item.video.url}
                            controls
                            playsInline
                            className="w-full max-h-[380px]"
                          />
                        )}
                      </div>
                    )}

                    {/* Engagement Bar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(item.postId)}
                          className={`px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                            item.likedByMe
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Like</span>
                          {item.likesCount > 0 && <span>({item.likesCount})</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setOpenCommentsPostIds((prev) => ({
                              ...prev,
                              [item.postId]: !prev[item.postId],
                            }))
                          }
                          className="px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Comment</span>
                          {item.comments.length > 0 && (
                            <span>({item.comments.length})</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {(commentsOpen || item.comments.length > 0) && (
                      <div className="pt-2 border-t border-slate-100 space-y-2.5">
                        {item.comments.map((cmt) => (
                          <div key={cmt.id} className="flex items-start gap-2">
                            <ScholarProfileAvatar
                              name={cmt.authorName}
                              scholarUserId={cmt.authorScholarUserId || ''}
                              avatarUrl={cmt.authorPhoto}
                              compact
                              className="w-7 h-7 shrink-0"
                            />
                            <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-slate-900">
                                  {cmt.authorName}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {formatPostDate(cmt.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 mt-0.5">
                                {cmt.text}
                              </p>
                            </div>
                          </div>
                        ))}

                        {commentsOpen && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              void handleSubmitComment(item.postId);
                            }}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="text"
                              value={commentDrafts[item.postId] || ''}
                              onChange={(e) =>
                                setCommentDrafts((prev) => ({
                                  ...prev,
                                  [item.postId]: e.target.value,
                                }))
                              }
                              placeholder="Write a comment..."
                              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:bg-white focus:border-blue-500"
                            />
                            <button
                              type="submit"
                              disabled={!(commentDrafts[item.postId] || '').trim()}
                              className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
                            >
                              Reply
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </article>
                );
              }

              // Kind === 'work' (Researcher Published Work Card)
              const work = item.work;
              const paperUrl =
                work.url ||
                (work.doi ? `https://doi.org/${work.doi}` : null);
              return (
                <article
                  key={item.feedId}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <ScholarProfileAvatar
                        name={author.name}
                        scholarUserId={author.scholarUserId || ''}
                        orcid={author.orcidId}
                        university={author.affiliation}
                        avatarUrl={author.photoURL}
                        compact
                        className="w-10 h-10 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenScholarProfile(
                                author.name,
                                author.scholarUserId
                              )
                            }
                            className="text-sm font-bold text-slate-900 hover:text-blue-600 truncate cursor-pointer"
                          >
                            {author.name}
                          </button>
                          {author.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          {item.suggestionReason &&
                            item.suggestionReason !== 'community' &&
                            item.suggestionLabel && (
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold shrink-0 ${
                                  item.suggestionReason === 'connected'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                    : item.suggestionReason === 'coauthor'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                                }`}
                              >
                                {item.suggestionLabel}
                              </span>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {[
                            author.affiliation,
                            author.country,
                            `Published Work · ${work.year}`,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {showConnectBtn && (
                        <button
                          type="button"
                          disabled={author.connectionStatus === 'pending_sent'}
                          onClick={() => handleQuickConnect(author.uid)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          {author.connectionStatus === 'pending_sent' ? (
                            <span>Pending</span>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              <span>Connect</span>
                            </>
                          )}
                        </button>
                      )}
                      {canMessageAuthor && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenMessage({
                              uid: author.uid,
                              name: author.name,
                              photoURL: author.photoURL,
                              scholarUserId: author.scholarUserId,
                              orcidId: author.orcidId,
                              affiliation: author.affiliation,
                              verified: author.verified,
                            })
                          }
                          title={`Message ${author.name}`}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                      {work.type && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          {work.type}
                        </span>
                      )}
                      {work.quartile && work.quartile !== 'Unranked' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          {work.quartile}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                        {work.citations} citations
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {work.title}
                    </h3>

                    <p className="text-xs text-slate-600">
                      {work.venue} ({work.year})
                    </p>

                    {work.coAuthorNames.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Co-authors:
                        </span>
                        {work.coAuthorNames.map((cn) => (
                          <span
                            key={cn}
                            className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600"
                          >
                            {cn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      {paperUrl && (
                        <a
                          href={paperUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold inline-flex items-center gap-1.5"
                        >
                          <span>View Paper</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDiscussWorkInPost(work)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Share in Post</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onOpenScholarProfile(author.name, author.scholarUserId)
                      }
                      className="text-xs font-semibold text-slate-500 hover:text-blue-600 cursor-pointer"
                    >
                      Inspect Profile →
                    </button>
                  </div>
                </article>
              );
            })}

            {/* Infinite Scroll Sentinel + Manual Load More */}
            <div ref={loadMoreSentinelRef} className="py-3 text-center">
              {isLoadingMore ? (
                <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading more research updates...</span>
                </div>
              ) : hasMore ? (
                <button
                  type="button"
                  onClick={() => fetchFeed(items.length, true)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
                >
                  Load More Research Updates
                </button>
              ) : (
                <p className="text-[11px] text-slate-400">
                  No more matching results for this search.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scroll Back To Top Pill */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll back to top of feed"
          className="fixed bottom-20 right-5 z-30 p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxImage}
            alt="Full resolution research attachment"
            className="max-w-full max-h-[88vh] rounded-xl shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
};
