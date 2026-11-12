import { ResearcherWorksDigest } from './socialStore';

export type FeedNetworkReason =
  | 'connected'
  | 'coauthor'
  | 'coauthor_coauthor'
  | 'community';

export interface FeedNetworkSets {
  viewerUid: string;
  viewerNames: Set<string>;
  viewerScholarIds: Set<string>;
  connectedUids: Set<string>;
  connectedScholarIds: Set<string>;
  connectedNames: Set<string>;
  coAuthorScholarIds: Set<string>;
  coAuthorNames: Set<string>;
  secondDegreeScholarIds: Set<string>;
  secondDegreeNames: Set<string>;
}

export interface RankableFeedItem {
  feedId: string;
  kind: 'post' | 'work';
  createdAt: string;
  sortScore: number;
  author: {
    uid?: string;
    name?: string;
    scholarUserId?: string;
  };
  taggedCoAuthors?: Array<{ name?: string; uid?: string; scholarUserId?: string }>;
  work?: {
    coAuthorNames?: string[];
  };
  networkTier?: number;
  suggestionReason?: FeedNetworkReason;
  suggestionLabel?: string;
}

/**
 * Normalizes a researcher name for case/punctuation-insensitive graph matching.
 */
export function normalizeResearcherKey(name: string | undefined): string {
  return String(name || '')
    .toLowerCase()
    .replace(/\./g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function areSimilarResearcherNames(a: string, b: string): boolean {
  const normA = normalizeResearcherKey(a);
  const normB = normalizeResearcherKey(b);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  const partsA = normA.split(' ');
  const partsB = normB.split(' ');
  const lastA = partsA[partsA.length - 1];
  const lastB = partsB[partsB.length - 1];
  if (lastA !== lastB) return false;

  const firstA = partsA[0] || '';
  const firstB = partsB[0] || '';
  if (!firstA || !firstB) return false;
  return (
    firstA === firstB ||
    (firstA.length === 1 && firstB.startsWith(firstA)) ||
    (firstB.length === 1 && firstA.startsWith(firstB))
  );
}

function matchesNameSet(name: string | undefined, set: Set<string>): boolean {
  const clean = normalizeResearcherKey(name);
  if (!clean) return false;
  if (set.has(clean)) return true;
  for (const candidate of set) {
    if (areSimilarResearcherNames(clean, candidate)) return true;
  }
  return false;
}

/**
 * Builds 1st-degree (connected), co-author, and 2nd-degree (co-authors' co-authors)
 * matching sets from registered connections and ResearcherWorksDigest graphs.
 */
export function buildFeedNetworkSets(params: {
  viewerUid?: string;
  viewerName?: string;
  viewerScholarUserId?: string;
  acceptedUids?: Iterable<string>;
  registeredUsers?: Array<{
    uid: string;
    name: string;
    scholarUserId?: string;
  }>;
  digests: Record<string, ResearcherWorksDigest>;
}): FeedNetworkSets {
  const viewerUid = String(params.viewerUid || '').trim();
  const viewerNames = new Set<string>();
  if (params.viewerName) viewerNames.add(normalizeResearcherKey(params.viewerName));
  const viewerScholarIds = new Set<string>();
  if (params.viewerScholarUserId) {
    // Google Scholar IDs are case-sensitive (e.g., X6_inMYAAAAJ !== x6_inmyaaaaj).
    viewerScholarIds.add(String(params.viewerScholarUserId).trim());
  }

  const connectedUids = new Set<string>();
  if (viewerUid) connectedUids.add(viewerUid);
  for (const uid of params.acceptedUids || []) {
    if (uid) connectedUids.add(String(uid).trim());
  }

  const connectedScholarIds = new Set<string>();
  const connectedNames = new Set<string>();
  for (const user of params.registeredUsers || []) {
    if (connectedUids.has(user.uid)) {
      if (user.scholarUserId) {
        connectedScholarIds.add(user.scholarUserId.trim());
      }
      if (user.name) {
        connectedNames.add(normalizeResearcherKey(user.name));
      }
    }
  }

  const isViewer = (name?: string, sid?: string): boolean => {
    const cleanSid = String(sid || '').trim();
    if (cleanSid && viewerScholarIds.size > 0) {
      if (viewerScholarIds.has(cleanSid)) return true;
      return false;
    }
    if (cleanSid && viewerScholarIds.has(cleanSid)) return true;
    return matchesNameSet(name, viewerNames);
  };

  // Tier 2: Direct co-authors of the viewer
  const coAuthorScholarIds = new Set<string>();
  const coAuthorNames = new Set<string>();

  const registerCoAuthor = (name?: string, sid?: string) => {
    const cleanSid = String(sid || '').trim();
    const cleanName = normalizeResearcherKey(name);
    if (isViewer(name, sid)) return;
    if (cleanSid && !connectedScholarIds.has(cleanSid)) {
      coAuthorScholarIds.add(cleanSid);
    }
    if (cleanName && !matchesNameSet(cleanName, connectedNames)) {
      coAuthorNames.add(cleanName);
    }
  };

  for (const digest of Object.values(params.digests || {})) {
    const digestSid = String(digest.scholarUserId || '').trim();
    const viewerDigest =
      digestSid && viewerScholarIds.size > 0
        ? viewerScholarIds.has(digestSid)
        : matchesNameSet(digest.name, viewerNames);

    if (viewerDigest) {
      for (const ca of digest.coAuthors || []) {
        registerCoAuthor(ca.name, ca.scholarUserId);
      }
      for (const work of digest.works || []) {
        for (const name of work.coAuthorNames || []) {
          registerCoAuthor(name);
        }
      }
      continue;
    }

    // Also detect co-authorship when a paper in another digest lists the viewer
    let viewerAppearsOnDigest = false;
    for (const ca of digest.coAuthors || []) {
      if (isViewer(ca.name, ca.scholarUserId)) {
        viewerAppearsOnDigest = true;
        break;
      }
    }
    if (!viewerAppearsOnDigest) {
      for (const work of digest.works || []) {
        if ((work.coAuthorNames || []).some((n) => isViewer(n))) {
          viewerAppearsOnDigest = true;
          break;
        }
      }
    }
    if (viewerAppearsOnDigest) {
      registerCoAuthor(digest.name, digest.scholarUserId);
    }
  }

  // Tier 3: Co-authors' co-authors (2nd-degree collaborator network)
  const secondDegreeScholarIds = new Set<string>();
  const secondDegreeNames = new Set<string>();

  const registerSecondDegree = (name?: string, sid?: string) => {
    const cleanSid = String(sid || '').trim();
    const cleanName = normalizeResearcherKey(name);
    if (isViewer(name, sid)) return;
    if (cleanSid && connectedScholarIds.has(cleanSid)) return;
    if (cleanSid && coAuthorScholarIds.has(cleanSid)) return;
    if (cleanName && matchesNameSet(cleanName, connectedNames)) return;
    if (cleanName && matchesNameSet(cleanName, coAuthorNames)) return;

    if (cleanSid) secondDegreeScholarIds.add(cleanSid);
    if (cleanName) secondDegreeNames.add(cleanName);
  };

  for (const digest of Object.values(params.digests || {})) {
    const digestSid = String(digest.scholarUserId || '').trim();
    const isDirectCoAuthorDigest =
      (digestSid && coAuthorScholarIds.has(digestSid)) ||
      matchesNameSet(digest.name, coAuthorNames);

    if (isDirectCoAuthorDigest) {
      for (const ca of digest.coAuthors || []) {
        registerSecondDegree(ca.name, ca.scholarUserId);
      }
      for (const work of digest.works || []) {
        for (const name of work.coAuthorNames || []) {
          registerSecondDegree(name);
        }
      }
      continue;
    }

    // If a direct co-author appears in a work's coAuthorNames, the work author & siblings are 2nd-degree
    let directCoAuthorOnDigest = false;
    for (const work of digest.works || []) {
      const workHasDirectCoAuthor = (work.coAuthorNames || []).some((n) =>
        matchesNameSet(n, coAuthorNames)
      );
      if (workHasDirectCoAuthor) {
        directCoAuthorOnDigest = true;
        for (const sibling of work.coAuthorNames || []) {
          registerSecondDegree(sibling);
        }
      }
    }
    if (directCoAuthorOnDigest) {
      registerSecondDegree(digest.name, digest.scholarUserId);
    }
  }

  return {
    viewerUid,
    viewerNames,
    viewerScholarIds,
    connectedUids,
    connectedScholarIds,
    connectedNames,
    coAuthorScholarIds,
    coAuthorNames,
    secondDegreeScholarIds,
    secondDegreeNames,
  };
}

/**
 * Classifies a feed item into strict priority tiers:
 * 1: Connected researcher content (including self)
 * 2: Direct co-author content
 * 3: Co-author's co-author (2nd-degree network) content
 * 4: General community / discovery content
 */
export function classifyFeedItemPriority(
  item: RankableFeedItem,
  network: FeedNetworkSets
): {
  tier: 1 | 2 | 3 | 4;
  reason: FeedNetworkReason;
  label: string;
} {
  const authorUid = String(item.author?.uid || '').trim();
  const authorSid = String(item.author?.scholarUserId || '').trim();
  const authorName = item.author?.name;

  const isViewerAuthor =
    (authorUid && authorUid === network.viewerUid) ||
    (authorSid && network.viewerScholarIds.has(authorSid)) ||
    (matchesNameSet(authorName, network.viewerNames) &&
      (!authorSid || network.viewerScholarIds.size === 0 || network.viewerScholarIds.has(authorSid)));

  if (isViewerAuthor) {
    return {
      tier: 1,
      reason: 'connected',
      label: 'Your Update',
    };
  }

  if (
    (authorUid && network.connectedUids.has(authorUid)) ||
    (authorSid && network.connectedScholarIds.has(authorSid)) ||
    matchesNameSet(authorName, network.connectedNames)
  ) {
    return {
      tier: 1,
      reason: 'connected',
      label: 'Connected',
    };
  }

  const taggedList = (item.taggedCoAuthors || []).map((t) => t.name || '');
  const workCoAuthors = item.work?.coAuthorNames || [];

  // Tier 2: Only label as "Co-Author" when the card's author IS a direct co-author of the viewer
  // (or when the viewer themselves appears directly on this paper/post with the author).
  if (
    (authorSid && network.coAuthorScholarIds.has(authorSid)) ||
    matchesNameSet(authorName, network.coAuthorNames) ||
    taggedList.some((n) => matchesNameSet(n, network.viewerNames)) ||
    workCoAuthors.some((n) => matchesNameSet(n, network.viewerNames))
  ) {
    return {
      tier: 2,
      reason: 'coauthor',
      label: 'Co-Author',
    };
  }

  // Tier 3: Co-author's co-author (including papers where a co-author's co-author collaborated with our co-author)
  if (
    (authorSid && network.secondDegreeScholarIds.has(authorSid)) ||
    matchesNameSet(authorName, network.secondDegreeNames) ||
    taggedList.some(
      (n) =>
        matchesNameSet(n, network.coAuthorNames) ||
        matchesNameSet(n, network.secondDegreeNames)
    ) ||
    workCoAuthors.some(
      (n) =>
        matchesNameSet(n, network.coAuthorNames) ||
        matchesNameSet(n, network.secondDegreeNames)
    )
  ) {
    return {
      tier: 3,
      reason: 'coauthor_coauthor',
      label: "Co-Author's Co-Author",
    };
  }

  return {
    tier: 4,
    reason: 'community',
    label: 'Community',
  };
}

/**
 * Ranks feed items in strict priority order:
 * Connected Researcher Content > Direct Co-Author Content > Co-Author's Co-Author Content > Community.
 * Within each tier, newest posts/works appear first.
 */
export function sortAndRankFeedItems<T extends RankableFeedItem>(
  items: T[],
  network: FeedNetworkSets
): T[] {
  const annotated = items.map((item) => {
    const classification = classifyFeedItemPriority(item, network);
    return {
      ...item,
      networkTier: classification.tier,
      suggestionReason: classification.reason,
      suggestionLabel: classification.label,
    };
  });

  annotated.sort((a, b) => {
    const tierDiff = (a.networkTier || 4) - (b.networkTier || 4);
    if (tierDiff !== 0) return tierDiff;
    if (a.kind !== b.kind && Math.abs(b.sortScore - a.sortScore) < 30 * 86400 * 1000) {
      return a.kind === 'post' ? -1 : 1;
    }
    return b.sortScore - a.sortScore;
  });

  return annotated;
}

/**
 * Slices a ranked feed page cleanly and optionally loops with unique cycle feedIds
 * so infinite scrolling never runs into a dead end.
 */
export function sliceEndlessFeed<T extends { feedId: string }>(
  rankedItems: T[],
  offset: number,
  limit: number,
  allowInfiniteRepeat: boolean
): { items: T[]; hasMore: boolean } {
  const total = rankedItems.length;
  if (total === 0) {
    return { items: [], hasMore: false };
  }

  if (!allowInfiniteRepeat) {
    const paged = rankedItems.slice(offset, offset + limit);
    return {
      items: paged,
      hasMore: offset + paged.length < total,
    };
  }

  const out: T[] = [];
  for (let i = 0; i < limit; i++) {
    const absIndex = offset + i;
    const cycle = Math.floor(absIndex / total);
    const baseItem = rankedItems[absIndex % total];
    out.push(
      cycle === 0
        ? baseItem
        : {
            ...baseItem,
            feedId: `${baseItem.feedId}__c${cycle}_${absIndex}`,
          }
    );
  }

  return { items: out, hasMore: true };
}
