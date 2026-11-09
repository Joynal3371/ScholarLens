import React from 'react';
import { Search, RotateCcw, ExternalLink } from 'lucide-react';
import {
  Publication,
  PublicationFilterState,
  Quartile,
  PublicationType,
  AuthorshipRole,
  SortOption,
  UniversityCollaboration,
  CoAuthorSummary,
  CountryCollaboration,
  calculateHIndex,
  DEFAULT_FILTER_STATE,
  getPublicationUrl,
  getPublicationPortfolioCategory,
} from '../utils/scholarAnalytics';

interface PublicationsExplorerProps {
  allPublications: Publication[];
  filteredPublications: Publication[];
  filter: PublicationFilterState;
  onChangeFilter: React.Dispatch<React.SetStateAction<PublicationFilterState>>;
  universities: UniversityCollaboration[];
  coAuthors: CoAuthorSummary[];
  countries: CountryCollaboration[];
  onInspectUniversityOnGlobe: (universityId: string) => void;
}

const QUARTILE_OPTIONS: Quartile[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Unranked'];
const TYPE_OPTIONS: PublicationType[] = [
  'Journal',
  'Conference',
  'Review',
  'Book Chapter',
  'Preprint',
];

const CITATION_PRESETS: { label: string; min: string; max: string }[] = [
  { label: 'All', min: '', max: '' },
  { label: '0–100', min: '0', max: '100' },
  { label: '100–5,000', min: '100', max: '5000' },
  { label: '5,000–25,000', min: '5000', max: '25000' },
  { label: '25,000+', min: '25000', max: '' },
];

export const PublicationsExplorer: React.FC<PublicationsExplorerProps> = ({
  allPublications,
  filteredPublications,
  filter,
  onChangeFilter,
  universities,
  coAuthors,
  countries,
  onInspectUniversityOnGlobe,
}) => {
  const toggleQuartile = (q: Quartile) => {
    onChangeFilter((prev) => ({
      ...prev,
      quartiles: prev.quartiles.includes(q)
        ? prev.quartiles.filter((item) => item !== q)
        : [...prev.quartiles, q],
    }));
  };

  const toggleType = (t: PublicationType) => {
    onChangeFilter((prev) => ({
      ...prev,
      types: prev.types.includes(t)
        ? prev.types.filter((item) => item !== t)
        : [...prev.types, t],
    }));
  };

  const resetFilters = () => {
    onChangeFilter(DEFAULT_FILTER_STATE);
  };

  const hasActiveFilters =
    filter.searchQuery.trim() !== '' ||
    filter.minCitations !== '' ||
    filter.maxCitations !== '' ||
    filter.minYear !== '' ||
    filter.maxYear !== '' ||
    filter.quartiles.length > 0 ||
    filter.types.length > 0 ||
    filter.authorshipRole !== 'All' ||
    filter.openAccessOnly ||
    filter.universityId !== 'All' ||
    filter.coAuthorName !== 'All' ||
    filter.country !== 'All' ||
    filter.venue !== 'All';

  const filteredCitationsSum = filteredPublications.reduce(
    (acc, p) => acc + p.citations,
    0
  );
  const filteredHIndex = calculateHIndex(
    filteredPublications.map((p) => p.citations)
  );

  return (
    <section
      id="publications"
      aria-labelledby="publications-explorer-heading"
      className="scroll-mt-20 bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      {/* Header & Live Summary */}
      <div className="px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <h2
          id="publications-explorer-heading"
          className="text-base font-bold text-slate-900 tracking-tight"
        >
          Publications Filter ({filteredPublications.length} / {allPublications.length})
        </h2>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="font-mono tabular-nums text-slate-600">
            Showing{' '}
            <strong
              data-testid="filtered-publications-count"
              className="text-slate-900 font-bold"
            >
              {filteredPublications.length}
            </strong>{' '}
            papers
          </div>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <div className="font-mono tabular-nums text-slate-600">
            Citations:{' '}
            <strong className="text-slate-900 font-bold">
              {filteredCitationsSum.toLocaleString()}
            </strong>
          </div>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <div className="font-mono tabular-nums text-slate-600">
            Subset h-index:{' '}
            <strong className="text-slate-900 font-bold">
              {filteredHIndex}
            </strong>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Clean Filter Controls */}
      <div className="p-5 bg-slate-50/70 border-b border-slate-200 space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4">
            <label
              htmlFor="pub-search-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Search Title, Venue, or Co-Author
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="pub-search-input"
                type="text"
                value={filter.searchQuery}
                onChange={(e) =>
                  onChangeFilter((prev) => ({
                    ...prev,
                    searchQuery: e.target.value,
                  }))
                }
                placeholder="Search publications..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <span className="block text-xs font-medium text-slate-700 mb-1">
              Citation-Count Range
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                id="min-citations-input"
                type="number"
                min={0}
                value={filter.minCitations}
                onChange={(e) =>
                  onChangeFilter((prev) => ({
                    ...prev,
                    minCitations: e.target.value,
                  }))
                }
                placeholder="Min citations"
                aria-label="Minimum Citations"
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 tabular-nums"
              />
              <input
                id="max-citations-input"
                type="number"
                min={0}
                value={filter.maxCitations}
                onChange={(e) =>
                  onChangeFilter((prev) => ({
                    ...prev,
                    maxCitations: e.target.value,
                  }))
                }
                placeholder="Max citations"
                aria-label="Maximum Citations"
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 tabular-nums"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <span className="block text-xs font-medium text-slate-700 mb-1">
              Quick Citation Range
            </span>
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
              {CITATION_PRESETS.map((preset) => {
                const isCurrent =
                  filter.minCitations === preset.min &&
                  filter.maxCitations === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      onChangeFilter((prev) => ({
                        ...prev,
                        minCitations: preset.min,
                        maxCitations: preset.max,
                      }))
                    }
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      isCurrent
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quartile, Type, Year & Dropdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end pt-2 border-t border-slate-200/70">
          <div className="lg:col-span-4">
            <span className="block text-xs font-medium text-slate-700 mb-1">
              Quartile
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {QUARTILE_OPTIONS.map((q) => {
                const active = filter.quartiles.includes(q);
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => toggleQuartile(q)}
                    aria-pressed={active}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {q}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <span className="block text-xs font-medium text-slate-700 mb-1">
              Publication Type
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {TYPE_OPTIONS.map((t) => {
                const active = filter.types.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleType(t)}
                    aria-pressed={active}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            <span className="block text-xs font-medium text-slate-700 mb-1">
              Year Range
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                id="min-year-input"
                type="number"
                value={filter.minYear}
                onChange={(e) =>
                  onChangeFilter((prev) => ({
                    ...prev,
                    minYear: e.target.value,
                  }))
                }
                placeholder="From"
                aria-label="From Year"
                className="w-full px-2.5 py-1 text-xs font-mono bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 tabular-nums"
              />
              <input
                id="max-year-input"
                type="number"
                value={filter.maxYear}
                onChange={(e) =>
                  onChangeFilter((prev) => ({
                    ...prev,
                    maxYear: e.target.value,
                  }))
                }
                placeholder="To"
                aria-label="To Year"
                className="w-full px-2.5 py-1 text-xs font-mono bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Row 3 Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 items-end pt-2 border-t border-slate-200/70">
          <div>
            <label
              htmlFor="filter-university-select"
              className="block text-[11px] font-medium text-slate-600 mb-1"
            >
              University
            </label>
            <select
              id="filter-university-select"
              value={filter.universityId}
              onChange={(e) =>
                onChangeFilter((prev) => ({
                  ...prev,
                  universityId: e.target.value,
                }))
              }
              className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-900"
            >
              <option value="All">All ({universities.length})</option>
              {universities.map((u) => (
                <option key={u.universityId} value={u.universityId}>
                  {u.universityName} ({u.paperCount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-coauthor-select"
              className="block text-[11px] font-medium text-slate-600 mb-1"
            >
              Co-Author
            </label>
            <select
              id="filter-coauthor-select"
              value={filter.coAuthorName}
              onChange={(e) =>
                onChangeFilter((prev) => ({
                  ...prev,
                  coAuthorName: e.target.value,
                }))
              }
              className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-900"
            >
              <option value="All">All ({coAuthors.length})</option>
              {coAuthors.map((ca) => (
                <option key={ca.name} value={ca.name}>
                  {ca.name} ({ca.paperCount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-country-select"
              className="block text-[11px] font-medium text-slate-600 mb-1"
            >
              Country
            </label>
            <select
              id="filter-country-select"
              value={filter.country}
              onChange={(e) =>
                onChangeFilter((prev) => ({
                  ...prev,
                  country: e.target.value,
                }))
              }
              className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-900"
            >
              <option value="All">All ({countries.length})</option>
              {countries.map((c) => (
                <option key={c.country} value={c.country}>
                  {c.country} ({c.paperCount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-role-select"
              className="block text-[11px] font-medium text-slate-600 mb-1"
            >
              Authorship Role
            </label>
            <select
              id="filter-role-select"
              value={filter.authorshipRole}
              onChange={(e) =>
                onChangeFilter((prev) => ({
                  ...prev,
                  authorshipRole: e.target.value as 'All' | AuthorshipRole,
                }))
              }
              className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-900"
            >
              <option value="All">All Roles</option>
              <option value="First Author">First Author</option>
              <option value="Corresponding Author">Corresponding Author</option>
              <option value="Co-Author">Co-Author</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-sort-select"
              className="block text-[11px] font-medium text-slate-600 mb-1"
            >
              Sort By
            </label>
            <select
              id="filter-sort-select"
              value={filter.sortBy}
              onChange={(e) =>
                onChangeFilter((prev) => ({
                  ...prev,
                  sortBy: e.target.value as SortOption,
                }))
              }
              className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-900"
            >
              <option value="citations-desc">Citations: High to Low</option>
              <option value="citations-asc">Citations: Low to High</option>
              <option value="year-desc">Year: Newest First</option>
              <option value="year-asc">Year: Oldest First</option>
              <option value="quartile-asc">Quartile: Q1 to Q4</option>
              <option value="title-asc">Title: A to Z</option>
            </select>
          </div>

          <div className="flex items-center h-[28px]">
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filter.openAccessOnly}
                onChange={(e) =>
                  onChangeFilter((prev) => ({
                    ...prev,
                    openAccessOnly: e.target.checked,
                  }))
                }
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
              />
              <span>Open Access</span>
            </label>
          </div>
        </div>
      </div>

      {/* Compact Publications Table */}
      {filteredPublications.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 pl-6 pr-3">Publication &amp; Co-Authors</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Venue</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Type</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Quartile</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Year</th>
                <th className="py-2.5 pl-3 pr-6 text-right whitespace-nowrap">
                  Citations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredPublications.map((pub) => {
                const cat = getPublicationPortfolioCategory(pub);
                return (
                  <tr
                    key={pub.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 pl-4 sm:pl-6 pr-3 max-w-xl">
                      <div className="font-semibold text-slate-900 text-sm">
                        <a
                          href={getPublicationUrl(pub)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 hover:underline inline-flex items-start gap-1.5 group"
                        >
                          <span>{pub.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400 group-hover:text-blue-600" />
                        </a>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-1.5">
                        {pub.coAuthors.map((ca, idx) => (
                          <React.Fragment key={`${pub.id}-${ca.name}-${idx}`}>
                            <button
                              type="button"
                              onClick={() =>
                                onInspectUniversityOnGlobe(ca.universityId)
                              }
                              className="hover:text-blue-700 hover:underline transition-colors cursor-pointer"
                            >
                              {ca.name} ({ca.universityName})
                            </button>
                            {idx < pub.coAuthors.length - 1 && (
                              <span aria-hidden="true">·</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top text-slate-700 max-w-[210px] truncate">
                      {pub.venue}
                    </td>

                    <td className="py-3 px-3 align-top whitespace-nowrap text-slate-600">
                      {pub.type}
                    </td>

                    <td className="py-3 px-3 align-top whitespace-nowrap font-mono font-bold">
                      <span
                        className={
                          cat === 'Q1'
                            ? 'text-blue-700'
                            : cat === 'Q2'
                            ? 'text-sky-700'
                            : cat === 'Q3'
                            ? 'text-amber-700'
                            : cat === 'Q4'
                            ? 'text-slate-600'
                            : cat === 'Conference'
                            ? 'text-indigo-700'
                            : 'text-slate-500'
                        }
                      >
                        {cat}
                      </span>
                    </td>

                    <td className="py-3 px-3 align-top text-right whitespace-nowrap font-mono text-slate-700 tabular-nums">
                      {pub.year}
                    </td>

                    <td className="py-3 pl-3 pr-4 sm:pr-6 align-top text-right whitespace-nowrap font-mono font-bold text-slate-900 text-sm tabular-nums">
                      {pub.citations.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-10 px-6 text-center">
          <p className="text-sm font-medium text-slate-800">
            No publications match your active filter criteria.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </section>
  );
};
