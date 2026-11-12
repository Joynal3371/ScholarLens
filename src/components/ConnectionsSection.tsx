import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  UserCheck,
  Clock,
  Check,
  X,
  MessageSquare,
  ExternalLink,
  Search,
  Users,
  ShieldCheck,
  Loader2,
  UserMinus,
  Sparkles,
} from 'lucide-react';
import { AuthenticatedResearcher } from './AuthGateModal';
import { ScholarProfileAvatar } from './ScholarProfileAvatar';

export type ConnectionStatus =
  | 'none'
  | 'pending_sent'
  | 'pending_received'
  | 'connected';

export interface SiteResearcher {
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
  isSelf?: boolean;
  connectionStatus?: ConnectionStatus;
}

interface PendingRequestItem {
  id: string;
  requesterUid: string;
  recipientUid: string;
  note?: string;
  createdAt: string;
  researcher: SiteResearcher;
}

interface ConnectionsSectionProps {
  authUser: AuthenticatedResearcher | null;
  onRequireSignIn: () => void;
  onOpenMessage: (researcher: SiteResearcher) => void;
  onOpenScholarProfile: (name: string, scholarUserId?: string) => void;
  onSummaryChanged?: () => void;
}

type NetworkTab = 'discover' | 'invitations' | 'connections';

export const ConnectionsSection: React.FC<ConnectionsSectionProps> = ({
  authUser,
  onRequireSignIn,
  onOpenMessage,
  onOpenScholarProfile,
  onSummaryChanged,
}) => {
  const [activeTab, setActiveTab] = useState<NetworkTab>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  const [allResearchers, setAllResearchers] = useState<SiteResearcher[]>([]);
  const [accepted, setAccepted] = useState<SiteResearcher[]>([]);
  const [incoming, setIncoming] = useState<PendingRequestItem[]>([]);
  const [outgoing, setOutgoing] = useState<PendingRequestItem[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (authUser) {
        const resp = await fetch('/api/social/connections', {
          credentials: 'include',
        });
        if (resp.ok) {
          const data = await resp.json();
          setAllResearchers(data.allResearchers || []);
          setAccepted(data.accepted || []);
          setIncoming(data.incoming || []);
          setOutgoing(data.outgoing || []);
          return;
        }
      }
      const pubResp = await fetch('/api/social/researchers', {
        credentials: 'include',
      });
      if (!pubResp.ok) throw new Error('Unable to load researcher directory.');
      const pubData = await pubResp.json();
      setAllResearchers(pubData.researchers || []);
      setAccepted([]);
      setIncoming([]);
      setOutgoing([]);
    } catch (err: any) {
      setError(err?.message || 'Could not load connections.');
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleConnect = async (targetUid: string) => {
    if (!authUser) {
      onRequireSignIn();
      return;
    }
    setBusyUid(targetUid);
    try {
      const resp = await fetch('/api/social/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetUid }),
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody?.error || 'Could not send connection request.');
      }
      await loadData();
      onSummaryChanged?.();
    } catch (err: any) {
      setError(err?.message || 'Connection request failed.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleRespond = async (
    requesterUid: string,
    action: 'accept' | 'decline'
  ) => {
    if (!authUser) {
      onRequireSignIn();
      return;
    }
    setBusyUid(requesterUid);
    try {
      const resp = await fetch('/api/social/connections/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requesterUid, action }),
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody?.error || 'Could not respond to invitation.');
      }
      await loadData();
      onSummaryChanged?.();
    } catch (err: any) {
      setError(err?.message || 'Failed to update invitation.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleRemove = async (otherUid: string) => {
    if (!authUser) {
      onRequireSignIn();
      return;
    }
    setBusyUid(otherUid);
    try {
      const resp = await fetch(
        `/api/social/connections/${encodeURIComponent(otherUid)}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (!resp.ok) throw new Error('Could not update connection.');
      await loadData();
      onSummaryChanged?.();
    } catch (err: any) {
      setError(err?.message || 'Action failed.');
    } finally {
      setBusyUid(null);
    }
  };

  const q = searchQuery.trim().toLowerCase();
  const matchesSearch = (r: SiteResearcher) => {
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      (r.affiliation || '').toLowerCase().includes(q) ||
      (r.country || '').toLowerCase().includes(q) ||
      (r.orcidId || '').toLowerCase().includes(q)
    );
  };

  const discoverList = allResearchers.filter((r) => !r.isSelf && matchesSearch(r));
  const acceptedList = accepted.filter(matchesSearch);

  return (
    <div className="max-w-[1120px] mx-auto w-full space-y-5">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Researcher Network</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Connect with Verified Researchers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Build your academic network across institutions, manage invitations, and collaborate directly.
          </p>
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, university, ORCID..."
            aria-label="Search researchers on ScholarLens"
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Researchers ({allResearchers.filter((r) => !r.isSelf).length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!authUser) {
                onRequireSignIn();
                return;
              }
              setActiveTab('invitations');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'invitations'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Invitations</span>
            {incoming.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'invitations'
                    ? 'bg-white text-blue-600'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {incoming.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!authUser) {
                onRequireSignIn();
                return;
              }
              setActiveTab('connections');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'connections'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>My Connections ({accepted.length})</span>
          </button>
        </div>

        {!authUser && (
          <button
            type="button"
            onClick={onRequireSignIn}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Sign in with ORCID to Connect
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading researcher network...</span>
        </div>
      ) : activeTab === 'invitations' ? (
        <div className="space-y-4">
          {/* Incoming invitations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Incoming Invitations ({incoming.length})
            </h3>
            {incoming.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">
                No pending connection invitations right now.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {incoming.map((inv) => {
                  const r = inv.researcher;
                  const isBusy = busyUid === inv.requesterUid;
                  return (
                    <div
                      key={inv.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ScholarProfileAvatar
                          name={r.name}
                          scholarUserId={r.scholarUserId || ''}
                          orcid={r.orcidId}
                          university={r.affiliation}
                          avatarUrl={r.photoURL}
                          compact
                          className="w-11 h-11 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                onOpenScholarProfile(r.name, r.scholarUserId)
                              }
                              className="text-sm font-semibold text-slate-900 hover:text-blue-600 truncate cursor-pointer"
                            >
                              {r.name}
                            </button>
                            {r.verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {r.affiliation || r.orcidId || 'ScholarLens Researcher'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleRespond(inv.requesterUid, 'decline')}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 cursor-pointer disabled:opacity-50"
                        >
                          Ignore
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleRespond(inv.requesterUid, 'accept')}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Outgoing sent requests */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Sent Requests ({outgoing.length})
            </h3>
            {outgoing.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">
                You have not sent any pending invitations.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {outgoing.map((reqItem) => {
                  const r = reqItem.researcher;
                  const isBusy = busyUid === reqItem.recipientUid;
                  return (
                    <div
                      key={reqItem.id}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ScholarProfileAvatar
                          name={r.name}
                          scholarUserId={r.scholarUserId || ''}
                          orcid={r.orcidId}
                          university={r.affiliation}
                          avatarUrl={r.photoURL}
                          compact
                          className="w-10 h-10 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {r.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {r.affiliation || 'Pending invitation'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRemove(reqItem.recipientUid)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 cursor-pointer disabled:opacity-50"
                      >
                        Withdraw
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Discover OR My Connections Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeTab === 'connections' ? acceptedList : discoverList).length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                {activeTab === 'connections'
                  ? 'No connections yet'
                  : 'No matching researchers found'}
              </p>
              <p className="text-xs text-slate-500">
                {activeTab === 'connections'
                  ? 'Explore the Researchers tab to connect with peers using ScholarLens.'
                  : 'Try another search term or check back as more researchers sign up.'}
              </p>
            </div>
          ) : (
            (activeTab === 'connections' ? acceptedList : discoverList).map((r) => {
              const status: ConnectionStatus =
                activeTab === 'connections'
                  ? 'connected'
                  : r.connectionStatus || 'none';
              const isBusy = busyUid === r.uid;
              return (
                <div
                  key={r.uid}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-4 hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <ScholarProfileAvatar
                        name={r.name}
                        scholarUserId={r.scholarUserId || ''}
                        orcid={r.orcidId}
                        university={r.affiliation}
                        avatarUrl={r.photoURL}
                        compact
                        className="w-12 h-12 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenScholarProfile(r.name, r.scholarUserId)
                            }
                            className="text-sm font-bold text-slate-900 hover:text-blue-600 truncate text-left cursor-pointer"
                          >
                            {r.name}
                          </button>
                          {r.verified && (
                            <span title="Verified ORCID iD">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {r.affiliation || 'Academic Researcher'}
                          {r.country ? ` · ${r.country}` : ''}
                        </p>
                        {r.orcidId && (
                          <a
                            href={`https://orcid.org/${r.orcidId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 hover:underline mt-1"
                          >
                            <span>ORCID: {r.orcidId}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {(r.publicationCount || r.totalCitations) ? (
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {r.publicationCount || 0}
                          </div>
                          <div className="text-[10px] text-slate-500">Works</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {r.totalCitations || 0}
                          </div>
                          <div className="text-[10px] text-slate-500">Citations</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {r.hIndex || 0}
                          </div>
                          <div className="text-[10px] text-slate-500">h-index</div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    {status === 'connected' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenMessage(r)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleRemove(r.uid)}
                          title="Remove connection"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : status === 'pending_sent' ? (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleRemove(r.uid)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenMessage(r)}
                          title="Send direct message"
                          className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : status === 'pending_received' ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRespond(r.uid, 'accept')}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Request</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleConnect(r.uid)}
                          className="flex-1 py-1.5 px-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenMessage(r)}
                          title="Message researcher"
                          className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {r.scholarUserId && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenScholarProfile(r.name, r.scholarUserId)
                        }
                        title="Open Google Scholar analytics"
                        className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium cursor-pointer"
                      >
                        Profile
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
