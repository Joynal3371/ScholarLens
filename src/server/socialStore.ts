import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface PublicResearcherSummary {
  uid: string;
  name: string;
  photoURL?: string;
  scholarUrl?: string;
  scholarUserId?: string;
  orcidId?: string;
  verified?: boolean;
  affiliation?: string;
  country?: string;
  totalCitations?: number;
  hIndex?: number;
  publicationCount?: number;
}

export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected';

export interface ConnectionEdge {
  id: string;
  requesterUid: string;
  recipientUid: string;
  status: 'pending' | 'accepted';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DirectMessage {
  id: string;
  senderUid: string;
  recipientUid: string;
  text: string;
  createdAt: string;
}

export interface ConversationThreadSummary {
  threadId: string;
  participants: [string, string];
  lastMessageText: string;
  lastMessageAt: string;
  lastSenderUid: string;
  unreadBy: Record<string, number>;
}

export interface ThreadDetail extends ConversationThreadSummary {
  messages: DirectMessage[];
}

export interface MentionedWorkPayload {
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

export interface TaggedCoAuthorPayload {
  name: string;
  scholarUserId?: string;
  uid?: string;
  university?: string;
}

export interface PostCommentRecord {
  id: string;
  authorUid: string;
  text: string;
  createdAt: string;
}

export interface ResearchPostRecord {
  id: string;
  authorUid: string;
  caption: string;
  mentionedWork?: MentionedWorkPayload | null;
  taggedCoAuthors: TaggedCoAuthorPayload[];
  images: string[];
  video?: { url: string; kind: 'upload' | 'external' } | null;
  likes: string[];
  comments: PostCommentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface DigestWorkItem {
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
}

export interface DigestCoAuthorSummary {
  name: string;
  scholarUserId?: string;
  universityName?: string;
  country?: string;
}

export interface ResearcherWorksDigest {
  scholarUserId: string;
  name: string;
  affiliation: string;
  country: string;
  avatarUrl?: string;
  orcid?: string;
  totalCitations: number;
  hIndex: number;
  publicationCount: number;
  updatedAt: string;
  coAuthors?: DigestCoAuthorSummary[];
  works: DigestWorkItem[];
}

interface SocialMirrorState {
  connections: ConnectionEdge[];
  threadsIndex: Record<string, ConversationThreadSummary>;
  threads: Record<string, DirectMessage[]>;
  postsOrder: string[];
  posts: Record<string, ResearchPostRecord>;
  worksDigests: Record<string, ResearcherWorksDigest>;
}

export function canonicalPairId(uidA: string, uidB: string): string {
  const cleanA = String(uidA || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanB = String(uidB || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  return [cleanA, cleanB].sort().join('__');
}

export function sanitizePostId(rawId: string): string {
  return String(rawId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}

export class SocialValidationError extends Error {
  public readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'SocialValidationError';
  }
}

export class SocialForbiddenError extends Error {
  public readonly statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = 'SocialForbiddenError';
  }
}

export class SocialNotFoundError extends Error {
  public readonly statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'SocialNotFoundError';
  }
}

function parseFirestoreString(field: any): string {
  return typeof field?.stringValue === 'string' ? field.stringValue : '';
}

function parseFirestoreBoolean(field: any): boolean {
  return typeof field?.booleanValue === 'boolean' ? field.booleanValue : false;
}

export function isAllowedImageInput(url: string): boolean {
  const clean = String(url || '').trim();
  if (!clean || clean.length > 360000) return false;
  if (/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(clean)) {
    return true;
  }
  return /^https?:\/\/.+/i.test(clean) && clean.length <= 2000;
}

export function isAllowedVideoInput(url: string): { valid: boolean; kind: 'upload' | 'external' } {
  const clean = String(url || '').trim();
  if (!clean) return { valid: false, kind: 'external' };
  if (/^data:video\/(mp4|webm|ogg);base64,[A-Za-z0-9+/=]+$/i.test(clean)) {
    return { valid: clean.length <= 750000, kind: 'upload' };
  }
  if (/^https?:\/\/.+/i.test(clean) && clean.length <= 2000) {
    return { valid: true, kind: 'external' };
  }
  return { valid: false, kind: 'external' };
}

/**
 * Persistent store for researcher connections, direct messaging threads, and rich feed posts.
 * Uses Firestore backend bridge documents in `appConfig/*` alongside an optional local JSON mirror.
 */
export class SocialNetworkStore {
  private readonly firestoreDocBase: string;
  private readonly getBridgeToken: () => Promise<string | null>;
  private readonly fetchImpl: typeof fetch;
  private readonly mirrorFilePath?: string;
  private readonly fallbackUsersProvider?: () => PublicResearcherSummary[];
  private mirror: SocialMirrorState = {
    connections: [],
    threadsIndex: {},
    threads: {},
    postsOrder: [],
    posts: {},
    worksDigests: {},
  };

  constructor(options: {
    firestoreDocBase: string;
    getBridgeToken: () => Promise<string | null>;
    fetchImpl?: typeof fetch;
    mirrorFilePath?: string;
    fallbackUsersProvider?: () => PublicResearcherSummary[];
  }) {
    this.firestoreDocBase = options.firestoreDocBase.replace(/\/$/, '');
    this.getBridgeToken = options.getBridgeToken;
    this.fetchImpl = options.fetchImpl || fetch;
    this.mirrorFilePath = options.mirrorFilePath;
    this.fallbackUsersProvider = options.fallbackUsersProvider;
    this.loadMirrorFromDisk();
  }

  private loadMirrorFromDisk(): void {
    if (!this.mirrorFilePath) return;
    try {
      if (fs.existsSync(this.mirrorFilePath)) {
        const parsed = JSON.parse(fs.readFileSync(this.mirrorFilePath, 'utf8'));
        this.mirror = {
          connections: Array.isArray(parsed?.connections) ? parsed.connections : [],
          threadsIndex: parsed?.threadsIndex && typeof parsed.threadsIndex === 'object' ? parsed.threadsIndex : {},
          threads: parsed?.threads && typeof parsed.threads === 'object' ? parsed.threads : {},
          postsOrder: Array.isArray(parsed?.postsOrder) ? parsed.postsOrder : [],
          posts: parsed?.posts && typeof parsed.posts === 'object' ? parsed.posts : {},
          worksDigests:
            parsed?.worksDigests && typeof parsed.worksDigests === 'object'
              ? parsed.worksDigests
              : {},
        };
      }
    } catch {
      // Ignore corrupt or unavailable disk mirror
    }
  }

  private persistMirrorToDisk(): void {
    if (!this.mirrorFilePath) return;
    try {
      const dir = path.dirname(this.mirrorFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.mirrorFilePath, JSON.stringify(this.mirror, null, 2), 'utf8');
    } catch {
      // Read-only filesystems (e.g. Vercel Lambda /var/task) silently rely on Firestore
    }
  }

  private async readJsonDoc<T>(docKey: string): Promise<T | null | 'UNAVAILABLE'> {
    try {
      const token = await this.getBridgeToken();
      if (!token || !this.firestoreDocBase) return 'UNAVAILABLE';
      const resp = await this.fetchImpl(
        `${this.firestoreDocBase}/appConfig/${encodeURIComponent(docKey)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(4000),
        }
      );
      if (resp.status === 404) return null;
      if (!resp.ok) return 'UNAVAILABLE';
      const data = (await resp.json()) as { fields?: Record<string, any> };
      const rawJson = parseFirestoreString(data?.fields?.payloadJson);
      if (!rawJson) return null;
      return JSON.parse(rawJson) as T;
    } catch {
      return 'UNAVAILABLE';
    }
  }

  private async writeJsonDoc(docKey: string, payload: unknown): Promise<boolean> {
    const serialized = JSON.stringify(payload);
    if (serialized.length > 900000) {
      throw new SocialValidationError(
        'Attachment payload exceeds storage size limit. Please use smaller compressed images or a video link.'
      );
    }
    try {
      const token = await this.getBridgeToken();
      if (!token || !this.firestoreDocBase) return false;
      const resp = await this.fetchImpl(
        `${this.firestoreDocBase}/appConfig/${encodeURIComponent(docKey)}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              key: { stringValue: docKey },
              payloadJson: { stringValue: serialized },
              updatedAtMs: { integerValue: String(Date.now()) },
            },
          }),
          signal: AbortSignal.timeout(4500),
        }
      );
      return resp.ok;
    } catch {
      return false;
    }
  }

  private async deleteJsonDoc(docKey: string): Promise<boolean> {
    try {
      const token = await this.getBridgeToken();
      if (!token || !this.firestoreDocBase) return false;
      const resp = await this.fetchImpl(
        `${this.firestoreDocBase}/appConfig/${encodeURIComponent(docKey)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(4000),
        }
      );
      return resp.ok || resp.status === 404;
    } catch {
      return false;
    }
  }

  /**
   * Lists sanitized researcher profiles registered on ScholarLens from Firestore `users` + fallback mirror.
   */
  async listRegisteredResearchers(): Promise<PublicResearcherSummary[]> {
    const byUid = new Map<string, PublicResearcherSummary>();

    const fallbackUsers = this.fallbackUsersProvider?.() || [];
    for (const u of fallbackUsers) {
      if (!u.uid) continue;
      byUid.set(u.uid, { ...u });
    }

    try {
      const token = await this.getBridgeToken();
      if (token && this.firestoreDocBase) {
        const resp = await this.fetchImpl(
          `${this.firestoreDocBase}:runQuery`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              structuredQuery: {
                from: [{ collectionId: 'users' }],
                limit: 120,
              },
            }),
            signal: AbortSignal.timeout(4500),
          }
        );
        if (resp.ok) {
          const rows = (await resp.json()) as Array<{
            document?: { name?: string; fields?: Record<string, any> };
          }>;
          for (const row of Array.isArray(rows) ? rows : []) {
            const docItem = row?.document;
            const fields = docItem?.fields;
            if (!fields) continue;
            const docUid =
              parseFirestoreString(fields.uid) ||
              String(docItem?.name || '').split('/').pop() ||
              '';
            if (!docUid) continue;
            const name =
              parseFirestoreString(fields.name) ||
              parseFirestoreString(fields.displayName) ||
              parseFirestoreString(fields.orcidId) ||
              'Researcher';
            const photoURL = parseFirestoreString(fields.photoURL) || undefined;
            const scholarUrl = parseFirestoreString(fields.scholarUrl) || undefined;
            const scholarUserId = parseFirestoreString(fields.scholarUserId) || undefined;
            const orcidId = parseFirestoreString(fields.orcidId) || undefined;
            const verified = parseFirestoreBoolean(fields.verified) || Boolean(orcidId);
            byUid.set(docUid, {
              uid: docUid,
              name,
              ...(photoURL ? { photoURL } : {}),
              ...(scholarUrl ? { scholarUrl } : {}),
              ...(scholarUserId ? { scholarUserId } : {}),
              ...(orcidId ? { orcidId } : {}),
              verified,
            });
          }
        }
      }
    } catch {
      // Fallback to local mirror users if Firestore query fails
    }

    return Array.from(byUid.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  private async loadConnections(): Promise<ConnectionEdge[]> {
    const remote = await this.readJsonDoc<{ edges?: ConnectionEdge[] }>('social_connections');
    if (remote && remote !== 'UNAVAILABLE' && Array.isArray(remote.edges)) {
      this.mirror.connections = remote.edges;
      return remote.edges;
    }
    if (remote === null) {
      this.mirror.connections = [];
      return [];
    }
    return this.mirror.connections;
  }

  private async saveConnections(edges: ConnectionEdge[]): Promise<void> {
    this.mirror.connections = edges;
    this.persistMirrorToDisk();
    await this.writeJsonDoc('social_connections', { edges });
  }

  async getConnectionsOverview(currentUid: string): Promise<{
    acceptedUids: string[];
    incomingRequests: ConnectionEdge[];
    outgoingRequests: ConnectionEdge[];
    statusByUid: Record<string, ConnectionStatus>;
  }> {
    const edges = await this.loadConnections();
    const acceptedUids: string[] = [];
    const incomingRequests: ConnectionEdge[] = [];
    const outgoingRequests: ConnectionEdge[] = [];
    const statusByUid: Record<string, ConnectionStatus> = {};

    for (const edge of edges) {
      if (edge.requesterUid !== currentUid && edge.recipientUid !== currentUid) {
        continue;
      }
      const otherUid =
        edge.requesterUid === currentUid ? edge.recipientUid : edge.requesterUid;
      if (edge.status === 'accepted') {
        acceptedUids.push(otherUid);
        statusByUid[otherUid] = 'connected';
      } else if (edge.recipientUid === currentUid) {
        incomingRequests.push(edge);
        statusByUid[otherUid] = 'pending_received';
      } else {
        outgoingRequests.push(edge);
        statusByUid[otherUid] = 'pending_sent';
      }
    }

    return { acceptedUids, incomingRequests, outgoingRequests, statusByUid };
  }

  async sendConnectionRequest(
    fromUid: string,
    toUid: string,
    note?: string
  ): Promise<{ status: ConnectionStatus; edge: ConnectionEdge }> {
    const cleanFrom = String(fromUid || '').trim();
    const cleanTo = String(toUid || '').trim();
    if (!cleanFrom || !cleanTo) {
      throw new SocialValidationError('Both sender and recipient identifiers are required.');
    }
    if (cleanFrom === cleanTo) {
      throw new SocialValidationError('You cannot send a connection request to yourself.');
    }

    const pairId = canonicalPairId(cleanFrom, cleanTo);
    const edges = await this.loadConnections();
    const existingIdx = edges.findIndex((e) => e.id === pairId);
    const nowIso = new Date().toISOString();

    if (existingIdx >= 0) {
      const existing = edges[existingIdx];
      if (existing.status === 'accepted') {
        return { status: 'connected', edge: existing };
      }
      // Mutual invitation: accept automatically when the other user already requested
      if (existing.requesterUid === cleanTo && existing.recipientUid === cleanFrom) {
        const updated: ConnectionEdge = {
          ...existing,
          status: 'accepted',
          updatedAt: nowIso,
        };
        edges[existingIdx] = updated;
        await this.saveConnections(edges);
        return { status: 'connected', edge: updated };
      }
      return { status: 'pending_sent', edge: existing };
    }

    const created: ConnectionEdge = {
      id: pairId,
      requesterUid: cleanFrom,
      recipientUid: cleanTo,
      status: 'pending',
      ...(note && note.trim() ? { note: note.trim().slice(0, 280) } : {}),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    const next = [...edges, created];
    await this.saveConnections(next);
    return { status: 'pending_sent', edge: created };
  }

  async respondConnectionRequest(
    currentUid: string,
    requesterUid: string,
    action: 'accept' | 'decline'
  ): Promise<{ status: ConnectionStatus }> {
    const pairId = canonicalPairId(currentUid, requesterUid);
    const edges = await this.loadConnections();
    const idx = edges.findIndex((e) => e.id === pairId);
    if (idx < 0) {
      throw new SocialNotFoundError('Connection invitation was not found.');
    }
    const edge = edges[idx];
    if (edge.status === 'pending' && edge.recipientUid !== currentUid) {
      throw new SocialForbiddenError('Only the recipient can respond to a connection invitation.');
    }

    if (action === 'accept') {
      edges[idx] = {
        ...edge,
        status: 'accepted',
        updatedAt: new Date().toISOString(),
      };
      await this.saveConnections(edges);
      return { status: 'connected' };
    }

    const filtered = edges.filter((e) => e.id !== pairId);
    await this.saveConnections(filtered);
    return { status: 'none' };
  }

  async removeConnection(currentUid: string, otherUid: string): Promise<{ status: ConnectionStatus }> {
    const pairId = canonicalPairId(currentUid, otherUid);
    const edges = await this.loadConnections();
    const next = edges.filter((e) => e.id !== pairId);
    if (next.length !== edges.length) {
      await this.saveConnections(next);
    }
    return { status: 'none' };
  }

  private async loadThreadsIndex(): Promise<Record<string, ConversationThreadSummary>> {
    const remote = await this.readJsonDoc<{ threads?: Record<string, ConversationThreadSummary> }>(
      'social_threads_index'
    );
    if (remote && remote !== 'UNAVAILABLE' && remote.threads) {
      this.mirror.threadsIndex = remote.threads;
      return remote.threads;
    }
    if (remote === null) {
      this.mirror.threadsIndex = {};
      return {};
    }
    return this.mirror.threadsIndex;
  }

  private async saveThreadsIndex(threads: Record<string, ConversationThreadSummary>): Promise<void> {
    this.mirror.threadsIndex = threads;
    this.persistMirrorToDisk();
    await this.writeJsonDoc('social_threads_index', { threads });
  }

  private async loadThreadMessages(threadId: string): Promise<DirectMessage[]> {
    const remote = await this.readJsonDoc<{ messages?: DirectMessage[] }>(
      `social_thread_${threadId}`
    );
    if (remote && remote !== 'UNAVAILABLE' && Array.isArray(remote.messages)) {
      this.mirror.threads[threadId] = remote.messages;
      return remote.messages;
    }
    if (remote === null) {
      this.mirror.threads[threadId] = [];
      return [];
    }
    return this.mirror.threads[threadId] || [];
  }

  private async saveThreadMessages(
    threadId: string,
    messages: DirectMessage[]
  ): Promise<void> {
    const trimmed = messages.slice(-250);
    this.mirror.threads[threadId] = trimmed;
    this.persistMirrorToDisk();
    await this.writeJsonDoc(`social_thread_${threadId}`, { messages: trimmed });
  }

  async listConversationsForUser(
    currentUid: string
  ): Promise<ConversationThreadSummary[]> {
    const index = await this.loadThreadsIndex();
    return Object.values(index)
      .filter((t) => Array.isArray(t.participants) && t.participants.includes(currentUid))
      .sort((a, b) => String(b.lastMessageAt).localeCompare(String(a.lastMessageAt)));
  }

  async getThreadWithUser(
    currentUid: string,
    partnerUid: string
  ): Promise<ThreadDetail> {
    const threadId = canonicalPairId(currentUid, partnerUid);
    const [index, messages] = await Promise.all([
      this.loadThreadsIndex(),
      this.loadThreadMessages(threadId),
    ]);

    const summary = index[threadId] || {
      threadId,
      participants: [currentUid, partnerUid].sort() as [string, string],
      lastMessageText: '',
      lastMessageAt: '',
      lastSenderUid: '',
      unreadBy: {},
    };

    if (summary.unreadBy?.[currentUid]) {
      summary.unreadBy = { ...summary.unreadBy, [currentUid]: 0 };
      index[threadId] = summary;
      await this.saveThreadsIndex(index);
    }

    return {
      ...summary,
      messages,
    };
  }

  async sendMessage(
    senderUid: string,
    recipientUid: string,
    rawText: string
  ): Promise<DirectMessage> {
    const cleanSender = String(senderUid || '').trim();
    const cleanRecipient = String(recipientUid || '').trim();
    const cleanText = String(rawText || '').trim();

    if (!cleanSender || !cleanRecipient) {
      throw new SocialValidationError('Sender and recipient are required.');
    }
    if (cleanSender === cleanRecipient) {
      throw new SocialValidationError('You cannot send direct messages to yourself.');
    }
    if (!cleanText) {
      throw new SocialValidationError('Message cannot be empty.');
    }
    if (cleanText.length > 4000) {
      throw new SocialValidationError('Message exceeds maximum length of 4,000 characters.');
    }

    const threadId = canonicalPairId(cleanSender, cleanRecipient);
    const [index, existingMessages] = await Promise.all([
      this.loadThreadsIndex(),
      this.loadThreadMessages(threadId),
    ]);

    const msg: DirectMessage = {
      id: `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      senderUid: cleanSender,
      recipientUid: cleanRecipient,
      text: cleanText,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...existingMessages, msg];
    await this.saveThreadMessages(threadId, nextMessages);

    const prevUnread = Number(index[threadId]?.unreadBy?.[cleanRecipient] || 0);
    index[threadId] = {
      threadId,
      participants: [cleanSender, cleanRecipient].sort() as [string, string],
      lastMessageText: cleanText.slice(0, 140),
      lastMessageAt: msg.createdAt,
      lastSenderUid: cleanSender,
      unreadBy: {
        ...(index[threadId]?.unreadBy || {}),
        [cleanSender]: 0,
        [cleanRecipient]: prevUnread + 1,
      },
    };
    await this.saveThreadsIndex(index);
    return msg;
  }

  private async loadPostsOrder(): Promise<string[]> {
    const remote = await this.readJsonDoc<{ order?: string[] }>('social_posts_index');
    if (remote && remote !== 'UNAVAILABLE' && Array.isArray(remote.order)) {
      this.mirror.postsOrder = remote.order;
      return remote.order;
    }
    if (remote === null) {
      this.mirror.postsOrder = [];
      return [];
    }
    return this.mirror.postsOrder;
  }

  private async savePostsOrder(order: string[]): Promise<void> {
    const trimmed = order.slice(0, 120);
    this.mirror.postsOrder = trimmed;
    this.persistMirrorToDisk();
    await this.writeJsonDoc('social_posts_index', { order: trimmed });
  }

  private async loadPostDoc(postId: string): Promise<ResearchPostRecord | null> {
    const cleanId = sanitizePostId(postId);
    if (!cleanId) return null;
    const remote = await this.readJsonDoc<ResearchPostRecord>(`social_post_${cleanId}`);
    if (remote && remote !== 'UNAVAILABLE' && remote.id) {
      this.mirror.posts[cleanId] = remote;
      return remote;
    }
    if (remote === null) return null;
    return this.mirror.posts[cleanId] || null;
  }

  private async savePostDoc(post: ResearchPostRecord): Promise<void> {
    this.mirror.posts[post.id] = post;
    this.persistMirrorToDisk();
    await this.writeJsonDoc(`social_post_${post.id}`, post);
  }

  async createPost(
    authorUid: string,
    input: {
      caption?: string;
      mentionedWork?: MentionedWorkPayload | null;
      taggedCoAuthors?: TaggedCoAuthorPayload[];
      images?: string[];
      videoUrl?: string;
    }
  ): Promise<ResearchPostRecord> {
    const caption = String(input.caption || '').trim().slice(0, 4000);
    const images: string[] = [];
    for (const rawImg of Array.isArray(input.images) ? input.images : []) {
      const cleanImg = String(rawImg || '').trim();
      if (!cleanImg) continue;
      if (!isAllowedImageInput(cleanImg)) {
        throw new SocialValidationError(
          'Each image must be a valid HTTP(S) URL or compressed JPEG/PNG/WebP/GIF under 350 KB.'
        );
      }
      images.push(cleanImg);
      if (images.length >= 3) break;
    }

    let video: ResearchPostRecord['video'] = null;
    if (input.videoUrl && String(input.videoUrl).trim()) {
      const cleanVideo = String(input.videoUrl).trim();
      const check = isAllowedVideoInput(cleanVideo);
      if (!check.valid) {
        throw new SocialValidationError(
          'Video must be a valid HTTP(S) video link (e.g., YouTube/MP4) or uploaded MP4/WebM clip under 750 KB.'
        );
      }
      video = { url: cleanVideo, kind: check.kind };
    }

    let mentionedWork: MentionedWorkPayload | null = null;
    if (input.mentionedWork && String(input.mentionedWork.title || '').trim()) {
      const w = input.mentionedWork;
      mentionedWork = {
        ...(w.id ? { id: String(w.id).slice(0, 80) } : {}),
        title: String(w.title).trim().slice(0, 320),
        ...(w.venue ? { venue: String(w.venue).trim().slice(0, 200) } : {}),
        ...(typeof w.year === 'number' && Number.isFinite(w.year) ? { year: w.year } : {}),
        ...(typeof w.citations === 'number' && Number.isFinite(w.citations)
          ? { citations: w.citations }
          : {}),
        ...(w.quartile ? { quartile: String(w.quartile).slice(0, 16) } : {}),
        ...(w.type ? { type: String(w.type).slice(0, 32) } : {}),
        ...(w.doi ? { doi: String(w.doi).slice(0, 160) } : {}),
        ...(w.url && /^https?:\/\//i.test(w.url) ? { url: String(w.url).slice(0, 500) } : {}),
      };
    }

    const taggedCoAuthors: TaggedCoAuthorPayload[] = [];
    const seenTags = new Set<string>();
    for (const tag of Array.isArray(input.taggedCoAuthors) ? input.taggedCoAuthors : []) {
      const name = String(tag?.name || '').trim().slice(0, 120);
      if (!name) continue;
      const key = name.toLowerCase();
      if (seenTags.has(key)) continue;
      seenTags.add(key);
      taggedCoAuthors.push({
        name,
        ...(tag.scholarUserId ? { scholarUserId: String(tag.scholarUserId).slice(0, 64) } : {}),
        ...(tag.uid ? { uid: String(tag.uid).slice(0, 128) } : {}),
        ...(tag.university ? { university: String(tag.university).slice(0, 180) } : {}),
      });
      if (taggedCoAuthors.length >= 15) break;
    }

    if (!caption && !mentionedWork && images.length === 0 && !video) {
      throw new SocialValidationError(
        'Please add a caption, mention a research work, or attach an image/video before posting.'
      );
    }

    const nowIso = new Date().toISOString();
    const post: ResearchPostRecord = {
      id: `post_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      authorUid,
      caption,
      mentionedWork,
      taggedCoAuthors,
      images,
      video,
      likes: [],
      comments: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await this.savePostDoc(post);
    const order = await this.loadPostsOrder();
    await this.savePostsOrder([post.id, ...order.filter((id) => id !== post.id)]);
    return post;
  }

  async listPosts(limit: number = 40): Promise<ResearchPostRecord[]> {
    const order = await this.loadPostsOrder();
    const slice = order.slice(0, limit);
    const docs = await Promise.all(slice.map((id) => this.loadPostDoc(id)));
    return docs.filter((p): p is ResearchPostRecord => Boolean(p));
  }

  async toggleLikePost(uid: string, postId: string): Promise<ResearchPostRecord> {
    const post = await this.loadPostDoc(postId);
    if (!post) throw new SocialNotFoundError('Post not found.');
    const likes = Array.isArray(post.likes) ? [...post.likes] : [];
    const idx = likes.indexOf(uid);
    if (idx >= 0) {
      likes.splice(idx, 1);
    } else {
      likes.push(uid);
    }
    const updated: ResearchPostRecord = {
      ...post,
      likes,
      updatedAt: new Date().toISOString(),
    };
    await this.savePostDoc(updated);
    return updated;
  }

  async addCommentToPost(
    uid: string,
    postId: string,
    rawText: string
  ): Promise<ResearchPostRecord> {
    const cleanText = String(rawText || '').trim();
    if (!cleanText) throw new SocialValidationError('Comment cannot be empty.');
    if (cleanText.length > 1500) {
      throw new SocialValidationError('Comment exceeds 1,500 characters.');
    }
    const post = await this.loadPostDoc(postId);
    if (!post) throw new SocialNotFoundError('Post not found.');

    const comment: PostCommentRecord = {
      id: `cmt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      authorUid: uid,
      text: cleanText,
      createdAt: new Date().toISOString(),
    };
    const updated: ResearchPostRecord = {
      ...post,
      comments: [...(post.comments || []), comment].slice(-100),
      updatedAt: new Date().toISOString(),
    };
    await this.savePostDoc(updated);
    return updated;
  }

  async deletePost(uid: string, postId: string): Promise<void> {
    const post = await this.loadPostDoc(postId);
    if (!post) throw new SocialNotFoundError('Post not found.');
    if (post.authorUid !== uid) {
      throw new SocialForbiddenError('Only the author can delete this post.');
    }
    const cleanId = sanitizePostId(postId);
    delete this.mirror.posts[cleanId];
    const order = await this.loadPostsOrder();
    await this.savePostsOrder(order.filter((id) => id !== cleanId));
    await this.deleteJsonDoc(`social_post_${cleanId}`);
  }

  getMirrorWorksDigests(): Record<string, ResearcherWorksDigest> {
    return this.mirror.worksDigests || {};
  }

  async listResearcherWorksDigests(): Promise<Record<string, ResearcherWorksDigest>> {
    const remote = await this.readJsonDoc<{ digests?: Record<string, ResearcherWorksDigest> }>(
      'social_works_digests'
    );
    if (remote && remote !== 'UNAVAILABLE' && remote.digests) {
      this.mirror.worksDigests = remote.digests;
      return remote.digests;
    }
    if (remote === null) {
      if (Object.keys(this.mirror.worksDigests || {}).length > 0) {
        return this.mirror.worksDigests;
      }
      this.mirror.worksDigests = {};
      return {};
    }
    return this.mirror.worksDigests;
  }

  async recordResearcherWorksDigest(digest: ResearcherWorksDigest): Promise<void> {
    const cleanId = String(digest.scholarUserId || '').trim();
    if (!cleanId) return;
    const digests = { ...(await this.listResearcherWorksDigests()) };
    digests[cleanId] = {
      ...digest,
      scholarUserId: cleanId,
      works: (digest.works || []).slice(0, 12),
    };
    // Cap to the 20 most recently updated researchers so Firestore payload stays compact
    const sortedEntries = Object.entries(digests)
      .sort((a, b) => String(b[1].updatedAt).localeCompare(String(a[1].updatedAt)))
      .slice(0, 20);
    const trimmed = Object.fromEntries(sortedEntries);
    this.mirror.worksDigests = trimmed;
    this.persistMirrorToDisk();
    await this.writeJsonDoc('social_works_digests', { digests: trimmed });
  }
}
