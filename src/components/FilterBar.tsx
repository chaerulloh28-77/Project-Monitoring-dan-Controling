import React from 'react';
import { Search, X, Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { ProjectData, PIC_SECTION_HEAD_OPTIONS } from '../types/project';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedZona: string;
  onZonaChange: (value: string) => void;
  selectedArea: string;
  onAreaChange: (value: string) => void;
  selectedVendor: string;
  onVendorChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedQuarter: string;
  onQuarterChange: (value: string) => void;
  selectedPic?: string;
  onPicChange?: (value: string) => void;
  onResetFilters: () => void;
  totalResults: number;
  allProjects: ProjectData[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedZona,
  onZonaChange,
  selectedArea,
  onAreaChange,
  selectedVendor,
  onVendorChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedQuarter,
  onQuarterChange,
  selectedPic = '',
  onPicChange,
  onResetFilters,
  totalResults,
  allProjects,
}) => {
  // Extract distinct option sets for dropdowns
  const uniqueAreas = Array.from(new Set(allProjects.map((p) => p.areaKota).filter(Boolean))).sort();
  const uniqueVendors = Array.from(new Set(allProjects.map((p) => p.namaVendor).filter(Boolean))).sort();
  const uniqueCategories = Array.from(new Set(allProjects.map((p) => p.projectCategory).filter(Boolean))).sort();
  const uniqueStatuses = Array.from(new Set(allProjects.map((p) => p.projectStatus).filter(Boolean))).sort();
  
  // Standardized options for Category, Zona, Quarter & PIC as requested
  const categoryOptions = ['GOV IPPJU', 'GOV APJATEL', 'GOV SJUT'];
  const zonaOptions = ['Jabo 1', 'Jabo 2', 'Jabo 3'];
  const quarterOptions = ['Q1-26', 'Q2-26', 'Q3-26', 'Q4-26'];
  const picOptions = PIC_SECTION_HEAD_OPTIONS;

  const hasActiveFilters = Boolean(
    searchTerm || selectedZona || selectedArea || selectedVendor || selectedCategory || selectedStatus || selectedQuarter || selectedPic
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-3.5 shadow-2xs mb-3.5 space-y-3">
      {/* Top Filter Row: Search & Dropdowns in a unified grid/flex */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input with fast response */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari PMO ID, Project ID, Deskripsi Project, PIC, Vendor, Lokasi..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9.5 pr-8 py-2 text-xs text-slate-800 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters - Uniform height and alignment */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zona Filter (Jabo 1, Jabo 2, Jabo 3) */}
          <select
            value={selectedZona}
            onChange={(e) => onZonaChange(e.target.value)}
            className="h-8.5 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/60"
          >
            <option value="">Semua Zona</option>
            {zonaOptions.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          {/* Quarter Filter (Q1-26, Q2-26, Q3-26, Q4-26) */}
          <select
            value={selectedQuarter}
            onChange={(e) => onQuarterChange(e.target.value)}
            className="h-8.5 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/60"
          >
            <option value="">Semua Quarter</option>
            {quarterOptions.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-8.5 px-3 py-1 text-xs text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/60"
          >
            <option value="">Semua Status</option>
            {uniqueStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Area Filter */}
          <select
            value={selectedArea}
            onChange={(e) => onAreaChange(e.target.value)}
            className="h-8.5 px-3 py-1 text-xs text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/60"
          >
            <option value="">Semua Area</option>
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          {/* Vendor Filter */}
          <select
            value={selectedVendor}
            onChange={(e) => onVendorChange(e.target.value)}
            className="h-8.5 px-3 py-1 text-xs text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/60"
          >
            <option value="">Semua Vendor</option>
            {uniqueVendors.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-8.5 px-3 py-1 text-xs text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all font-medium hover:bg-slate-100/60"
          >
            <option value="">Semua Kategori</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* PIC / Section Head Filter */}
          {onPicChange && (
            <select
              value={selectedPic}
              onChange={(e) => onPicChange(e.target.value)}
              className="h-8.5 px-3 py-1 text-xs text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all font-medium hover:bg-slate-100/60"
            >
              <option value="">Semua PIC</option>
              {picOptions.map((pic) => (
                <option key={pic} value={pic}>
                  {pic}
                </option>
              ))}
            </select>
          )}

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              title="Reset semua filter dan pencarian"
              className="h-8.5 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter result feedback */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span>Menampilkan <strong className="text-slate-900 font-mono font-bold tabular-nums">{totalResults}</strong> dari <span className="font-mono tabular-nums text-slate-600">{allProjects.length}</span> project</span>
          {hasActiveFilters && (
            <span className="text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              Filter aktif diterapkan
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
