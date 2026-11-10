import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  ExternalLink,
  Filter as FilterIcon,
  ChevronDown,
  ChevronUp,
  X,
  Building2,
  Users,
  Globe2,
} from 'lucide-react';
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
];

interface SearchableSelectOption {
  id: string;
  label: string;
  sublabel?: string;
  count?: number;
}

interface SearchableSelectProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allOptionLabel: string;
  allCount: number;
  selectedValue: string;
  onSelect: (value: string) => void;
  options: SearchableSelectOption[];
  searchPlaceholder: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  icon: Icon,
  allOptionLabel,
  allCount,
  selectedValue,
  onSelect,
  options,
  searchPlaceholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const selectedOption = options.find((opt) => opt.id === selectedValue);
  const displayLabel =
    selectedValue === 'All'
      ? `${allOptionLabel} (${allCount})`
      : selectedOption
      ? selectedOption.label
      : selectedValue;

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-slate-500" />
          <span>{label}</span>
        </label>
        {selectedValue !== 'All' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect('All');
            }}
            className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSearchQuery('');
        }}
        className={`w-full px-2.5 py-1.5 text-xs bg-white border rounded-lg flex items-center justify-between gap-1.5 transition-colors cursor-pointer text-left ${
          selectedValue !== 'All'
            ? 'border-blue-600 text-blue-900 bg-blue-50/40 font-medium ring-1 ring-blue-600/20'
            : 'border-slate-200 text-slate-800 hover:border-slate-300'
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs">
          {/* Real-time search input */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-7 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options list narrows down smoothly as user types */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 p-1">
            {!searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSelect('All');
                  setIsOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-md text-left flex items-center justify-between transition-colors cursor-pointer ${
                  selectedValue === 'All'
                    ? 'bg-blue-50 font-semibold text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{allOptionLabel}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {allCount}
                </span>
              </button>
            )}

            {filteredOptions.map((opt) => {
              const isSelected = selectedValue === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSelect(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-md text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 font-semibold text-blue-700'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate">{opt.label}</div>
                    {opt.sublabel && (
                      <div className="text-[10px] text-slate-400 truncate">
                        {opt.sublabel}
                      </div>
                    )}
                  </div>
                  {opt.count !== undefined && (
                    <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                      {opt.count} {opt.count === 1 ? 'paper' : 'papers'}
                    </span>
                  )}
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="py-4 px-3 text-center text-xs text-slate-400">
                No matching {label.toLowerCase()} found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);

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

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filter.minCitations !== '' || filter.maxCitations !== '') count++;
    if (filter.minYear !== '' || filter.maxYear !== '') count++;
    if (filter.quartiles.length > 0) count += filter.quartiles.length;
    if (filter.types.length > 0) count += filter.types.length;
    if (filter.authorshipRole !== 'All') count++;
    if (filter.openAccessOnly) count++;
    if (filter.universityId !== 'All') count++;
    if (filter.coAuthorName !== 'All') count++;
    if (filter.country !== 'All') count++;
    return count;
  }, [filter]);

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
      className="scroll-mt-20 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
    >
      {/* Header & Live Summary */}
      <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <h2
          id="publications-explorer-heading"
          className="text-base font-bold text-slate-900 tracking-tight"
        >
          Publication Portfolio ({filteredPublications.length} / {allPublications.length})
        </h2>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="font-mono tabular-nums text-slate-600">
            Publications:{' '}
            <strong
              data-testid="filtered-publications-count"
              className="text-slate-900 font-bold"
            >
              {filteredPublications.length}
            </strong>
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
            Portfolio h-index:{' '}
            <strong className="text-slate-900 font-bold">
              {filteredHIndex}
            </strong>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Criteria</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Search & Filter Toggle Bar */}
      <div className="p-3.5 sm:p-4 bg-slate-50/80 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Main Title/Venue/Co-Author Search */}
          <div className="relative flex-1">
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
              placeholder="Search publication title, venue, or co-author..."
              aria-label="Search publication title, venue, or co-author"
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* The dedicated Filter toggle button */}
            <button
              type="button"
              onClick={() => setIsFiltersOpen((prev) => !prev)}
              aria-expanded={isFiltersOpen}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                isFiltersOpen || activeFiltersCount > 0
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FilterIcon className="w-3.5 h-3.5" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 bg-white/25 text-white rounded-full text-[10px] font-bold font-mono">
                  {activeFiltersCount}
                </span>
              )}
              {isFiltersOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              id="filter-sort-select"
              value={filter.sortBy}
              onChange={(e) =>
                onChangeFilter((prev) => ({
                  ...prev,
                  sortBy: e.target.value as SortOption,
                }))
              }
              aria-label="Sort publications by"
              className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="citations-desc">Citations: High to Low</option>
              <option value="citations-asc">Citations: Low to High</option>
              <option value="year-desc">Year: Newest First</option>
              <option value="year-asc">Year: Oldest First</option>
              <option value="quartile-asc">Quartile: Q1 to Q4</option>
              <option value="title-asc">Title: A to Z</option>
            </select>
          </div>
        </div>

        {/* Collapsible Complete Filter Panel */}
        {isFiltersOpen && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-200 space-y-3.5 animate-in fade-in duration-150">
            {/* Row 1: Searchable Select Comboboxes for University, Co-Author, and Country */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SearchableSelect
                label="Collaborating University"
                icon={Building2}
                allOptionLabel="All Universities"
                allCount={universities.length}
                selectedValue={filter.universityId}
                onSelect={(val) =>
                  onChangeFilter((prev) => ({ ...prev, universityId: val }))
                }
                options={universities.map((u) => ({
                  id: u.universityId,
                  label: u.universityName,
                  sublabel: `${u.city}, ${u.country}`,
                  count: u.paperCount,
                }))}
                searchPlaceholder="Search university or city..."
              />

              <SearchableSelect
                label="Co-Author"
                icon={Users}
                allOptionLabel="All Co-Authors"
                allCount={coAuthors.length}
                selectedValue={filter.coAuthorName}
                onSelect={(val) =>
                  onChangeFilter((prev) => ({ ...prev, coAuthorName: val }))
                }
                options={coAuthors.map((ca) => ({
                  id: ca.name,
                  label: ca.name,
                  sublabel:
                    ca.universityName &&
                    ca.universityName !== 'Independent / Unlisted'
                      ? `${ca.universityName} · ${ca.totalCitations.toLocaleString()} cit.`
                      : `${ca.totalCitations.toLocaleString()} citations`,
                  count: ca.paperCount,
                }))}
                searchPlaceholder="Search co-author..."
              />

              <SearchableSelect
                label="Country"
                icon={Globe2}
                allOptionLabel="All Countries"
                allCount={countries.length}
                selectedValue={filter.country}
                onSelect={(val) =>
                  onChangeFilter((prev) => ({ ...prev, country: val }))
                }
                options={countries.map((c) => ({
                  id: c.country,
                  label: c.country,
                  sublabel: c.continent,
                  count: c.paperCount,
                }))}
                searchPlaceholder="Search country..."
              />
            </div>

            {/* Row 2: Quartiles, Publication Types, and Year Range */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end pt-2 border-t border-slate-200/70">
              <div className="lg:col-span-4">
                <span className="block text-xs font-semibold text-slate-700 mb-1">
                  Journal Quartile
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
                        className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
                <span className="block text-xs font-semibold text-slate-700 mb-1">
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
                        className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
                <span className="block text-xs font-semibold text-slate-700 mb-1">
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

            {/* Row 3: Citations, Authorship Role, and Open Access */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pt-2 border-t border-slate-200/70">
              <div className="md:col-span-6">
                <span className="block text-xs font-semibold text-slate-700 mb-1">
                  Citation Count Range
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
                <label
                  htmlFor="filter-role-select"
                  className="block text-xs font-semibold text-slate-700 mb-1"
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
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  <option value="First Author">First Author</option>
                  <option value="Corresponding Author">Corresponding Author</option>
                  <option value="Co-Author">Co-Author</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center h-[34px]">
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
                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                  />
                  <span>Open Access Only</span>
                </label>
              </div>
            </div>
          </div>
        )}
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
                            ? 'text-emerald-700'
                            : cat === 'Q3'
                            ? 'text-amber-700'
                            : cat === 'Q4'
                            ? 'text-rose-700'
                            : cat === 'Conference'
                            ? 'text-purple-700'
                            : 'text-slate-700'
                        }
                      >
                        {cat === 'Non-Indexed' ? 'Others' : cat}
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
