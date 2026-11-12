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
  onSelectResearcher?: (name: string, scholarUserId?: string) => void;
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
  onSelectResearcher,
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
      className="scroll-mt-20 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col lg:flex-1 lg:min-h-0 shadow-xs"
    >
      <div className="px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0 bg-white z-10">
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
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
          <table className="w-full min-w-[680px] lg:min-w-0 lg:table-fixed text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-2xs">
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600">
                <th className="py-2.5 pl-5 pr-3 whitespace-nowrap bg-slate-50 lg:w-[26%]">Co-Author</th>
                <th className="py-2.5 px-3 whitespace-nowrap bg-slate-50 lg:w-[32%]">University</th>
                <th className="py-2.5 px-3 whitespace-nowrap bg-slate-50 lg:w-[14%]">Country</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap bg-slate-50 lg:w-[8%]">Papers</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap bg-slate-50 lg:w-[10%]">Citations</th>
                <th className="py-2.5 pl-3 pr-5 text-right whitespace-nowrap bg-slate-50 lg:w-[10%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredCoAuthors.map((ca) => (
                <tr
                  key={ca.name}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2.5 pl-5 pr-3 font-semibold text-slate-900">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectResearcher?.(ca.name, ca.scholarUserId)
                      }
                      title={`View ${ca.name} in ScholarLens`}
                      className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none w-full min-w-0"
                    >
                      <img
                        src={
                          (ca.avatarUrl && ca.avatarUrl.trim()) ||
                          `/api/scholar/avatar?v=4&name=${encodeURIComponent(
                            ca.name
                          )}&uni=${encodeURIComponent(ca.universityName)}${
                            ca.orcid ? `&orcid=${encodeURIComponent(ca.orcid)}` : ''
                          }${
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
                          const fallbackUrl = `/api/scholar/avatar?v=4&name=${encodeURIComponent(
                            ca.name
                          )}&uni=${encodeURIComponent(ca.universityName)}${
                            ca.orcid ? `&orcid=${encodeURIComponent(ca.orcid)}` : ''
                          }`;
                          if (!target.src.endsWith(fallbackUrl)) {
                            target.src = fallbackUrl;
                          }
                        }}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-2xs group-hover:ring-2 group-hover:ring-blue-500/40 transition-all"
                      />
                      <span className="truncate text-slate-900 group-hover:text-blue-600 group-hover:underline transition-colors">
                        {ca.name}
                      </span>
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 truncate" title={ca.universityName}>
                    {ca.universityName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 truncate" title={ca.country}>{ca.country}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {ca.paperCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-900 tabular-nums">
                    {ca.totalCitations.toLocaleString()}
                  </td>
                  <td className="py-2.5 pl-3 pr-5 text-right whitespace-nowrap">
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
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
          <table className="w-full min-w-[700px] lg:min-w-0 lg:table-fixed text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-2xs">
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600">
                <th className="py-2.5 pl-5 pr-3 whitespace-nowrap bg-slate-50 lg:w-[28%]">University</th>
                <th className="py-2.5 px-3 whitespace-nowrap bg-slate-50 lg:w-[14%]">Country</th>
                <th className="py-2.5 px-3 whitespace-nowrap bg-slate-50 lg:w-[27%]">Co-Authors</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap bg-slate-50 lg:w-[7%]">Papers</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap bg-slate-50 lg:w-[6%]">Q1</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap bg-slate-50 lg:w-[9%]">Citations</th>
                <th className="py-2.5 pl-3 pr-5 text-right whitespace-nowrap bg-slate-50 lg:w-[9%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredUniversities.map((u) => {
                const coAuthorNames = u.coAuthors.map((a) => a.name).join(', ');
                return (
                <tr
                  key={u.universityId}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2.5 pl-5 pr-3 font-semibold text-slate-900 truncate" title={u.universityName}>
                    {u.universityName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 truncate" title={u.country}>{u.country}</td>
                  <td className="py-2.5 px-3 text-slate-600 truncate" title={coAuthorNames}>
                    {coAuthorNames}
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
                  <td className="py-2.5 pl-3 pr-5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onFilterByUniversity(u.universityId)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap"
                    >
                      Filter
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Countries */}
      {activeTab === 'countries' && (
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
          <table className="w-full min-w-[700px] lg:min-w-0 lg:table-fixed text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-2xs">
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600">
                <th className="py-2.5 pl-5 pr-3 whitespace-nowrap bg-slate-50 lg:w-[17%]">Country</th>
                <th className="py-2.5 px-3 whitespace-nowrap bg-slate-50 lg:w-[39%]">Universities</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap bg-slate-50 lg:w-[10%]">Co-Authors</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap bg-slate-50 lg:w-[8%]">Papers</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap bg-slate-50 lg:w-[7%]">Share</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap bg-slate-50 lg:w-[10%]">Citations</th>
                <th className="py-2.5 pl-3 pr-5 text-right whitespace-nowrap bg-slate-50 lg:w-[9%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredCountries.map((c) => {
                const uniList = c.universities.join(' · ');
                return (
                <tr
                  key={c.country}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2.5 pl-5 pr-3 font-semibold text-slate-900 truncate" title={c.country}>
                    {c.country}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 truncate" title={uniList}>
                    {uniList}
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
                  <td className="py-2.5 pl-3 pr-5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onFilterByCountry(c.country)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap"
                    >
                      Filter
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Journals & Venues */}
      {activeTab === 'journals' && (
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
          <table className="w-full min-w-[660px] lg:min-w-0 lg:table-fixed text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-2xs">
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600">
                <th className="py-2.5 pl-5 pr-3 whitespace-nowrap bg-slate-50 lg:w-[44%]">Journal / Conference Venue</th>
                <th className="py-2.5 px-3 whitespace-nowrap bg-slate-50 lg:w-[13%]">Type</th>
                <th className="py-2.5 px-3 whitespace-nowrap bg-slate-50 lg:w-[10%]">Quartile</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap bg-slate-50 lg:w-[10%]">Papers</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap bg-slate-50 lg:w-[13%]">Total Citations</th>
                <th className="py-2.5 pl-3 pr-5 text-right whitespace-nowrap bg-slate-50 lg:w-[10%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredJournals.map((j) => (
                <tr
                  key={j.venue}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2.5 pl-5 pr-3 font-semibold text-slate-900 truncate" title={j.venue}>
                    {j.venue}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 truncate">{j.type}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                    {j.quartile}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {j.paperCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-900 tabular-nums">
                    {j.totalCitations.toLocaleString()}
                  </td>
                  <td className="py-2.5 pl-3 pr-5 text-right whitespace-nowrap">
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
