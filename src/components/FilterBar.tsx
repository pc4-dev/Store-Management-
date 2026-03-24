import React from "react";
import { Search, X, Filter } from "lucide-react";

interface FilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: string[] | { label: string; value: string }[];
  }[];
  dateRange?: {
    startDate: string;
    endDate: string;
    onStartChange: (val: string) => void;
    onEndChange: (val: string) => void;
  };
  onClear: () => void;
  resultsCount?: number;
  totalCount?: number;
}

export const FilterBar = ({
  search,
  setSearch,
  searchPlaceholder = "Search...",
  filters = [],
  dateRange,
  onClear,
  resultsCount,
  totalCount,
}: FilterBarProps) => {
  return (
    <div className="p-4 border-b border-[#E8ECF0] bg-white space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-10 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dynamic Filters */}
        {filters.map((filter, idx) => (
          <div key={idx} className="flex flex-col">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="px-3 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316] bg-white min-w-[140px]"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt, oIdx) => {
                const label = typeof opt === "string" ? opt : opt.label;
                const value = typeof opt === "string" ? opt : opt.value;
                return (
                  <option key={oIdx} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        ))}

        {/* Date Range */}
        {dateRange && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase">From:</span>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => dateRange.onStartChange(e.target.value)}
                className="px-3 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase">To:</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => dateRange.onEndChange(e.target.value)}
                className="px-3 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>
        )}

        {/* Clear Button */}
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-2 text-[13px] text-gray-500 hover:text-[#F97316] transition-colors"
        >
          <Filter className="w-4 h-4" />
          Clear Filters
        </button>
      </div>

      {(resultsCount !== undefined && totalCount !== undefined) && (
        <div className="text-[12px] text-[#6B7280]">
          Showing {resultsCount} of {totalCount} records
        </div>
      )}
    </div>
  );
};
