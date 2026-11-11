import React, { useState } from 'react';
import { Users, Building2, Globe2, BookOpen } from 'lucide-react';
import {
  CoAuthorSummary,
  UniversityCollaboration,
  CountryCollaboration,
  JournalSummary,
  ResearcherProfile,
} from '../utils/scholarAnalytics';

interface ResearchDirectoriesSectionProps {
  profile: ResearcherProfile;
  coAuthors: CoAuthorSummary[];
  universities: UniversityCollaboration[];
  countries: CountryCollaboration[];
  journals: JournalSummary[];
  onFilterByCoAuthor: (name: string) => void;
  onFilterByUniversity: (universityId: string) => void;
  onFilterByCountry: (country: string) => void;
  onFilterByVenue: (venue: string) => void;
  onInspectUniversityOnGlobe: (universityId: string) => void;
}

type DirectoryTab = 'coauthors' | 'universities' | 'countries' | 'journals';

export const ResearchDirectoriesSection: React.FC<
  ResearchDirectoriesSectionProps
> = ({
  coAuthors,
  universities,
  countries,
  journals,
  onFilterByCoAuthor,
  onFilterByUniversity,
  onFilterByCountry,
  onFilterByVenue,
  onInspectUniversityOnGlobe,
}) => {
  const [activeTab, setActiveTab] = useState<DirectoryTab>('coauthors');
  const [directorySearch, setDirectorySearch] = useState<string>('');

  const q = directorySearch.trim().toLowerCase();

  const filteredCoAuthors = coAuthors.filter(
    (ca) =>
      !q ||
      ca.name.toLowerCase().includes(q) ||
      ca.universityName.toLowerCase().includes(q) ||
      ca.country.toLowerCase().includes(q)
  );

  const filteredUniversities = universities.filter(
    (u) =>
      !q ||
      u.universityName.toLowerCase().includes(q) ||
      u.country.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q)
  );

  const filteredCountries = countries.filter(
    (c) =>
      !q ||
      c.country.toLowerCase().includes(q) ||
      c.continent.toLowerCase().includes(q) ||
      c.universities.some((u) => u.toLowerCase().includes(q))
  );

  const filteredJournals = journals.filter(
    (j) =>
      !q ||
      j.venue.toLowerCase().includes(q) ||
      j.quartile.toLowerCase().includes(q)
  );

  return (
    <section
      id="directories"
      aria-labelledby="directories-heading"
      className="scroll-mt-20 bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      <div className="px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <h2 id="directories-heading" className="sr-only">
            Institutional &amp; Co-Author Registry
          </h2>
          <button
            type="button"
            onClick={() => setActiveTab('coauthors')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'coauthors'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Co-Authors ({coAuthors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('universities')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'universities'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Partner Institutions ({universities.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('countries')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'countries'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Collaborating Nations ({countries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('journals')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'journals'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Publication Venues ({journals.length})</span>
          </button>
        </div>

        <div className="w-full sm:w-60">
          <label htmlFor="directory-search-input" className="sr-only">
            Filter directory
          </label>
          <input
            id="directory-search-input"
            type="text"
            value={directorySearch}
            onChange={(e) => setDirectorySearch(e.target.value)}
            placeholder="Filter directory..."
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
          />
        </div>
      </div>

      {/* Tab 1: Co-Authors */}
      {activeTab === 'coauthors' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 pl-6 pr-3">Co-Author</th>
                <th className="py-2.5 px-3">University</th>
                <th className="py-2.5 px-3">Country</th>
                <th className="py-2.5 px-3 text-right">Papers</th>
                <th className="py-2.5 px-3 text-right">Citations</th>
                <th className="py-2.5 pl-3 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredCoAuthors.map((ca) => (
                <tr
                  key={ca.name}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2.5 pl-6 pr-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          ca.avatarUrl ||
                          `/api/scholar/avatar?name=${encodeURIComponent(
                            ca.name
                          )}&uni=${encodeURIComponent(ca.universityName)}${
                            ca.scholarUserId
                              ? `&userId=${encodeURIComponent(ca.scholarUserId)}`
                              : ''
                          }`
                        }
                        alt={ca.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallbackUrl = `/api/scholar/avatar?name=${encodeURIComponent(
                            ca.name
                          )}&uni=${encodeURIComponent(ca.universityName)}`;
                          if (!target.src.endsWith(fallbackUrl)) {
                            target.src = fallbackUrl;
                          }
                        }}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-2xs"
                      />
                      <span className="truncate">{ca.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {ca.universityName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{ca.country}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {ca.paperCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-900 tabular-nums">
                    {ca.totalCitations.toLocaleString()}
                  </td>
                  <td className="py-2.5 pl-3 pr-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onFilterByCoAuthor(ca.name)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap"
                    >
                      Filter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Universities */}
      {activeTab === 'universities' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 pl-6 pr-3">University</th>
                <th className="py-2.5 px-3">Country</th>
                <th className="py-2.5 px-3">Co-Authors</th>
                <th className="py-2.5 px-3 text-right">Papers</th>
                <th className="py-2.5 px-3 text-right">Q1</th>
                <th className="py-2.5 px-3 text-right">Citations</th>
                <th className="py-2.5 pl-3 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredUniversities.map((u) => (
                <tr
                  key={u.universityId}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2.5 pl-6 pr-3 font-semibold text-slate-900">
                    {u.universityName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">{u.country}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {u.coAuthors.map((a) => a.name).join(', ')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {u.paperCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-blue-700 tabular-nums">
                    {u.q1PaperCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-900 tabular-nums">
                    {u.totalCitations.toLocaleString()}
                  </td>
                  <td className="py-2.5 pl-3 pr-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onFilterByUniversity(u.universityId)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap"
                    >
                      Filter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Countries */}
      {activeTab === 'countries' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 pl-6 pr-3">Country</th>
                <th className="py-2.5 px-3">Universities</th>
                <th className="py-2.5 px-3 text-right">Co-Authors</th>
                <th className="py-2.5 px-3 text-right">Papers</th>
                <th className="py-2.5 px-3 text-right">Share</th>
                <th className="py-2.5 px-3 text-right">Citations</th>
                <th className="py-2.5 pl-3 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredCountries.map((c) => (
                <tr
                  key={c.country}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2.5 pl-6 pr-3 font-semibold text-slate-900">
                    {c.country}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {c.universities.join(' · ')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                    {c.coAuthorCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {c.paperCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                    {c.percentageOfTotalPapers}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-900 tabular-nums">
                    {c.totalCitations.toLocaleString()}
                  </td>
                  <td className="py-2.5 pl-3 pr-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onFilterByCountry(c.country)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap"
                    >
                      Filter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Journals & Venues */}
      {activeTab === 'journals' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 pl-6 pr-3">Journal / Conference Venue</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Quartile</th>
                <th className="py-2.5 px-3 text-right">Papers</th>
                <th className="py-2.5 px-3 text-right">Total Citations</th>
                <th className="py-2.5 pl-3 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredJournals.map((j) => (
                <tr
                  key={j.venue}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2.5 pl-6 pr-3 font-semibold text-slate-900">
                    {j.venue}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{j.type}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                    {j.quartile}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {j.paperCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-900 tabular-nums">
                    {j.totalCitations.toLocaleString()}
                  </td>
                  <td className="py-2.5 pl-3 pr-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onFilterByVenue(j.venue)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap"
                    >
                      Filter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
