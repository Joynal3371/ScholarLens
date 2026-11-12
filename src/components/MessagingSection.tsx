import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  User,
} from 'lucide-react';
import { AuthenticatedResearcher } from './AuthGateModal';
import { ScholarProfileAvatar } from './ScholarProfileAvatar';
import { SiteResearcher } from './ConnectionsSection';

interface ConversationItem {
  threadId: string;
  partnerUid: string;
  partner: SiteResearcher;
  lastMessageText: string;
  lastMessageAt: string;
  lastSenderUid: string;
  unreadCount: number;
}

interface DirectMessage {
  id: string;
  senderUid: string;
  recipientUid: string;
  text: string;
  createdAt: string;
}

interface MessagingSectionProps {
  authUser: AuthenticatedResearcher | null;
  initialPartner?: SiteResearcher | null;
  onRequireSignIn: () => void;
  onOpenScholarProfile: (name: string, scholarUserId?: string) => void;
  onUnreadUpdated?: () => void;
}

function formatMessageTime(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export const MessagingSection: React.FC<MessagingSectionProps> = ({
  authUser,
  initialPartner,
  onRequireSignIn,
  onOpenScholarProfile,
  onUnreadUpdated,
}) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [allResearchers, setAllResearchers] = useState<SiteResearcher[]>([]);
  const [activePartner, setActivePartner] = useState<SiteResearcher | null>(
    initialPartner || null
  );
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [composerText, setComposerText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingInbox, setIsLoadingInbox] = useState(true);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialPartner?.uid) {
      setActivePartner(initialPartner);
    }
  }, [initialPartner]);

  const loadInbox = useCallback(async () => {
    if (!authUser) {
      setIsLoadingInbox(false);
      return;
    }
    try {
      const [convResp, resResp] = await Promise.all([
        fetch('/api/social/messages/conversations', { credentials: 'include' }),
        fetch('/api/social/researchers', { credentials: 'include' }),
      ]);
      if (convResp.ok) {
        const cData = await convResp.json();
        setConversations(cData.conversations || []);
      }
      if (resResp.ok) {
        const rData = await resResp.json();
        setAllResearchers(
          (rData.researchers || []).filter((r: SiteResearcher) => !r.isSelf)
        );
      }
    } catch {
      // Ignore transient polling failure
    } finally {
      setIsLoadingInbox(false);
    }
  }, [authUser]);

  const loadThread = useCallback(
    async (partnerUid: string, silent = false) => {
      if (!authUser || !partnerUid) return;
      if (!silent) setIsLoadingThread(true);
      try {
        const resp = await fetch(
          `/api/social/messages/thread/${encodeURIComponent(partnerUid)}`,
          { credentials: 'include' }
        );
        if (!resp.ok) throw new Error('Could not open conversation.');
        const data = await resp.json();
        setMessages(data.thread?.messages || []);
        if (data.partner?.uid) {
          setActivePartner((prev) =>
            prev?.uid === data.partner.uid ? { ...prev, ...data.partner } : data.partner
          );
        }
        onUnreadUpdated?.();
      } catch (err: any) {
        if (!silent) setError(err?.message || 'Unable to load thread.');
      } finally {
        if (!silent) setIsLoadingThread(false);
      }
    },
    [authUser, onUnreadUpdated]
  );

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    if (activePartner?.uid) {
      void loadThread(activePartner.uid);
    }
  }, [activePartner?.uid, loadThread]);

  // Auto-poll open thread & conversations every 4 seconds while viewing Messages
  useEffect(() => {
    if (!authUser) return;
    const timer = window.setInterval(() => {
      void loadInbox();
      if (activePartner?.uid) {
        void loadThread(activePartner.uid, true);
      }
    }, 4500);
    return () => window.clearInterval(timer);
  }, [authUser, activePartner?.uid, loadInbox, loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activePartner?.uid]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      onRequireSignIn();
      return;
    }
    if (!activePartner?.uid) return;
    const text = composerText.trim();
    if (!text) return;

    setIsSending(true);
    setError(null);
    try {
      const resp = await fetch('/api/social/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipientUid: activePartner.uid,
          text,
        }),
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody?.error || 'Could not send message.');
      }
      const data = await resp.json();
      setComposerText('');
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
      await loadInbox();
      onUnreadUpdated?.();
    } catch (err: any) {
      setError(err?.message || 'Failed to deliver message.');
    } finally {
      setIsSending(false);
    }
  };

  if (!authUser) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-2xs my-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 font-display">
          Researcher Direct Messaging
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Sign in with your ORCID iD to exchange messages directly with verified researchers using ScholarLens.
        </p>
        <button
          type="button"
          onClick={onRequireSignIn}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors"
        >
          Sign In to Message Researchers
        </button>
      </div>
    );
  }

  const q = searchQuery.trim().toLowerCase();
  const existingPartnerUids = new Set(conversations.map((c) => c.partnerUid));
  const filteredConvos = conversations.filter((c) => {
    if (!q) return true;
    return (
      c.partner.name.toLowerCase().includes(q) ||
      c.lastMessageText.toLowerCase().includes(q)
    );
  });
  const otherResearchers = allResearchers.filter((r) => {
    if (existingPartnerUids.has(r.uid)) return false;
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      (r.affiliation || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-[1120px] mx-auto w-full bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-[540px] max-h-[76vh]">
      {/* Left Sidebar: Conversations & Site Researchers */}
      <div
        className={`border-r border-slate-200 flex flex-col min-h-0 ${
          activePartner ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-3.5 border-b border-slate-200 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Messages</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              {allResearchers.length} researchers
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a researcher to message..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoadingInbox ? (
            <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Loading conversations...</span>
            </div>
          ) : (
            <>
              {filteredConvos.map((conv) => {
                const isSelected = activePartner?.uid === conv.partnerUid;
                return (
                  <button
                    key={conv.threadId}
                    type="button"
                    onClick={() => setActivePartner(conv.partner)}
                    className={`w-full p-3 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border-l-2 border-l-blue-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <ScholarProfileAvatar
                      name={conv.partner.name}
                      scholarUserId={conv.partner.scholarUserId || ''}
                      orcid={conv.partner.orcidId}
                      university={conv.partner.affiliation}
                      avatarUrl={conv.partner.photoURL}
                      compact
                      className="w-10 h-10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {conv.partner.name}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatMessageTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className="text-[11px] text-slate-500 truncate">
                          {conv.lastSenderUid === authUser.uid ? 'You: ' : ''}
                          {conv.lastMessageText || 'Start conversation'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {otherResearchers.length > 0 && (
                <div className="p-2.5 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Other Researchers on ScholarLens
                </div>
              )}

              {otherResearchers.map((r) => {
                const isSelected = activePartner?.uid === r.uid;
                return (
                  <button
                    key={r.uid}
                    type="button"
                    onClick={() => setActivePartner(r)}
                    className={`w-full p-3 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/90' : 'hover:bg-slate-50'
                    }`}
                  >
                    <ScholarProfileAvatar
                      name={r.name}
                      scholarUserId={r.scholarUserId || ''}
                      orcid={r.orcidId}
                      university={r.affiliation}
                      avatarUrl={r.photoURL}
                      compact
                      className="w-9 h-9 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {r.name}
                        </span>
                        {r.verified && (
                          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {r.affiliation || 'Verified ScholarLens Researcher'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat Thread */}
      <div
        className={`flex flex-col min-h-0 bg-slate-50/40 ${
          activePartner ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activePartner ? (
          <>
            <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setActivePartner(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <ScholarProfileAvatar
                  name={activePartner.name}
                  scholarUserId={activePartner.scholarUserId || ''}
                  orcid={activePartner.orcidId}
                  university={activePartner.affiliation}
                  avatarUrl={activePartner.photoURL}
                  compact
                  className="w-9 h-9 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {activePartner.name}
                    </span>
                    {activePartner.verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {activePartner.affiliation ||
                      activePartner.orcidId ||
                      'ScholarLens Researcher'}
                  </p>
                </div>
              </div>

              {activePartner.scholarUserId && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenScholarProfile(
                      activePartner.name,
                      activePartner.scholarUserId
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Scholar Profile</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {isLoadingThread ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-2">
                  <p className="text-xs font-semibold text-slate-600">
                    Start a conversation with {activePartner.name}
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Discuss shared manuscripts, dataset collaborations, or upcoming publications.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderUid === authUser.uid;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        <div
                          className={`text-[9px] mt-1 ${
                            isMine ? 'text-blue-100 text-right' : 'text-slate-400'
                          }`}
                        >
                          {formatMessageTime(m.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="px-4 py-1.5 bg-red-50 text-red-700 text-[11px] border-t border-red-200">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-slate-200 flex items-end gap-2 shrink-0"
            >
              <textarea
                rows={1}
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend(e);
                  }
                }}
                placeholder={`Message ${activePartner.name}...`}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:bg-white focus:border-blue-500 max-h-28"
              />
              <button
                type="submit"
                disabled={isSending || !composerText.trim()}
                aria-label="Send message"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-45 shrink-0"
              >
                {isSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">
              Select a researcher to start messaging
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              Pick an active thread or choose any researcher using ScholarLens from the directory on the left.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
