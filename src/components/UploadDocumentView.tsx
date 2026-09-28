import React, { useState, useMemo, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FileCode, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  FolderOpen, 
  FolderCheck, 
  Check, 
  Clock, 
  RotateCcw,
  Edit3,
  Building2,
  User,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { ProjectData } from '../types/project';
import { NAMA_VENDOR_OPTIONS } from '../data/dropdownOptions';
import { DOCUMENT_SLOTS, DocumentSlotDefinition, UploadedFileMeta, DocumentTypeKey } from '../types/document';
import { documentStorageService } from '../services/documentStorageService';
import { ProjectDocumentDetailModal } from './ProjectDocumentDetailModal';

interface UploadDocumentViewProps {
  projects: ProjectData[];
  onOpenNewProject?: () => void;
  showToast?: (msg: string) => void;
}

export const UploadDocumentView: React.FC<UploadDocumentViewProps> = ({
  projects,
  onOpenNewProject,
  showToast,
}) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'incomplete' | 'zero'>('all');
  const [zonaFilter, setZonaFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [picFilter, setPicFilter] = useState<string>('all');
  const [slotFilter, setSlotFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Selected project for modal
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Hidden file input for inline cell uploads
  const [cellTarget, setCellTarget] = useState<{ project: ProjectData; slotKey: DocumentTypeKey } | null>(null);
  const cellFileInputRef = useRef<HTMLInputElement>(null);

  // Trigger re-render when a document is uploaded/deleted/edited
  const [refreshKey, setRefreshKey] = useState(0);

  // Dynamic filter options extracted from projects
  const uniqueZonas = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.zona && p.zona.trim()) set.add(p.zona.trim());
    });
    return Array.from(set).sort();
  }, [projects]);

  const uniqueAreas = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.areaKota && p.areaKota.trim()) set.add(p.areaKota.trim());
    });
    return Array.from(set).sort();
  }, [projects]);

  const uniqueVendors = useMemo(() => {
    const set = new Set<string>(NAMA_VENDOR_OPTIONS);
    projects.forEach((p) => {
      if (p.namaVendor && p.namaVendor.trim()) {
        const up = p.namaVendor.trim().toUpperCase();
        if (!up.includes('RESIGN')) {
          set.add(up);
        }
      }
    });
    return Array.from(set).sort((a, b) => {
      if (a === 'BELUM ADA VENDOR') return -1;
      if (b === 'BELUM ADA VENDOR') return 1;
      if (a === 'INTERNAL TEAM') return -1;
      if (b === 'INTERNAL TEAM') return 1;
      return a.localeCompare(b);
    });
  }, [projects]);

  const uniquePics = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.picSectionHead && p.picSectionHead.trim()) set.add(p.picSectionHead.trim());
    });
    return Array.from(set).sort();
  }, [projects]);

  // Document statistics across projects
  const stats = useMemo(() => {
    return documentStorageService.getDocumentStats(projects);
  }, [projects, refreshKey]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (statusFilter !== 'all') count++;
    if (zonaFilter !== 'all') count++;
    if (areaFilter !== 'all') count++;
    if (vendorFilter !== 'all') count++;
    if (picFilter !== 'all') count++;
    if (slotFilter !== 'all') count++;
    return count;
  }, [searchTerm, statusFilter, zonaFilter, areaFilter, vendorFilter, picFilter, slotFilter]);

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setZonaFilter('all');
    setAreaFilter('all');
    setVendorFilter('all');
    setPicFilter('all');
    setSlotFilter('all');
    setCurrentPage(1);
    if (showToast) {
      showToast('Seluruh filter telah direset ke default.');
    }
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return projects.filter((p) => {
      // 1. Text Search across Description, Project ID, PMO ID, Vendor, PIC
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          (p.pmoId || '').toLowerCase().includes(q) ||
          (p.projectDescription || '').toLowerCase().includes(q) ||
          (p.projectId || '').toLowerCase().includes(q) ||
          (p.picSectionHead || '').toLowerCase().includes(q) ||
          (p.namaVendor || '').toLowerCase().includes(q) ||
          (p.areaKota || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Zona Filter
      if (zonaFilter !== 'all' && p.zona !== zonaFilter) {
        return false;
      }

      // 3. Area / Kota Filter
      if (areaFilter !== 'all' && p.areaKota !== areaFilter) {
        return false;
      }

      // 4. Vendor Filter
      if (vendorFilter !== 'all' && p.namaVendor !== vendorFilter) {
        return false;
      }

      // 5. PIC Filter
      if (picFilter !== 'all' && p.picSectionHead !== picFilter) {
        return false;
      }

      const rec = documentStorageService.getDocumentRecord(p);
      const docsCount = Object.keys(rec.documents).length;

      // 6. Completeness status filter
      if (statusFilter === 'complete' && docsCount < DOCUMENT_SLOTS.length) return false;
      if (statusFilter === 'incomplete' && (docsCount === 0 || docsCount === DOCUMENT_SLOTS.length)) return false;
      if (statusFilter === 'zero' && docsCount > 0) return false;

      // 7. Slot specific filter (e.g. "missing:mr" or "has:mr")
      if (slotFilter !== 'all') {
        const [mode, key] = slotFilter.split(':');
        const hasSlotDoc = Boolean(rec.documents[key as DocumentTypeKey]);
        if (mode === 'has' && !hasSlotDoc) return false;
        if (mode === 'missing' && hasSlotDoc) return false;
      }

      return true;
    });
  }, [
    projects, 
    searchTerm, 
    statusFilter, 
    zonaFilter, 
    areaFilter, 
    vendorFilter, 
    picFilter, 
    slotFilter, 
    refreshKey
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const handleOpenDetailModal = (project: ProjectData) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  const handleTriggerCellUpload = (project: ProjectData, slotKey: DocumentTypeKey) => {
    setCellTarget({ project, slotKey });
    if (cellFileInputRef.current) {
      const slotDef = DOCUMENT_SLOTS.find((s) => s.key === slotKey);
      cellFileInputRef.current.accept = slotDef ? slotDef.accept : '*';
      cellFileInputRef.current.value = '';
      cellFileInputRef.current.click();
    }
  };

  const handleCellFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cellTarget) return;

    const result = await documentStorageService.uploadDocument(
      cellTarget.project,
      cellTarget.slotKey,
      file
    );

    if (result.success) {
      setRefreshKey((k) => k + 1);
      if (showToast) {
        const slotDef = DOCUMENT_SLOTS.find((s) => s.key === cellTarget.slotKey);
        showToast(`Dokumen "${slotDef?.label}" berhasil diunggah.`);
      }
    } else {
      if (showToast) {
        showToast(result.error || 'Gagal mengunggah file.');
      }
    }

    setCellTarget(null);
  };

  const handleCellDownload = (meta: UploadedFileMeta, e: React.MouseEvent) => {
    e.stopPropagation();
    documentStorageService.downloadDocument(meta);
  };

  const handleCellRemove = (
    project: ProjectData,
    slotKey: DocumentTypeKey,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const slotDef = DOCUMENT_SLOTS.find((s) => s.key === slotKey);
    const confirmed = window.confirm(`Hapus berkas "${slotDef?.label}" untuk ${project.pmoId}?`);
    if (confirmed) {
      documentStorageService.removeDocument(project, slotKey);
      setRefreshKey((k) => k + 1);
      if (showToast) {
        showToast(`Dokumen "${slotDef?.label}" berhasil dihapus.`);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i];
  };

  const getSlotIcon = (type: 'pdf' | 'kmz' | 'excel') => {
    switch (type) {
      case 'kmz':
        return <FileCode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 'excel':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600 shrink-0" />;
      case 'pdf':
      default:
        return <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* Hidden File Input for Cell Uploads */}
      <input
        type="file"
        ref={cellFileInputRef}
        onChange={handleCellFileSelected}
        className="hidden"
      />

      {/* Top Document Summary KPI Cards with Completeness Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Total Proyek */}
        <div 
          onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
          className={`bg-white p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
            statusFilter === 'all' ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Proyek</span>
            <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
              P
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">{projects.length}</span>
            <span className="text-[11px] text-slate-400">Proyek Terdata</span>
          </div>
        </div>

        {/* Card 2: Dokumen Lengkap (13/13) */}
        <div 
          onClick={() => { setStatusFilter('complete'); setCurrentPage(1); }}
          className={`bg-white p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
            statusFilter === 'complete' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Dokumen Lengkap
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              13/13
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-600">{stats.completedProjects}</span>
            <span className="text-[11px] text-slate-400">
              ({projects.length > 0 ? Math.round((stats.completedProjects / projects.length) * 100) : 0}%) Proyek
            </span>
          </div>
        </div>

        {/* Card 3: Dokumen Belum Lengkap (1-12) */}
        <div 
          onClick={() => { setStatusFilter('incomplete'); setCurrentPage(1); }}
          className={`bg-white p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
            statusFilter === 'incomplete' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Belum Lengkap
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
              1-12 Berkas
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-amber-600">{stats.partiallyUploadedProjects}</span>
            <span className="text-[11px] text-slate-400">Perlu Kelengkapan</span>
          </div>
        </div>

        {/* Card 4: Belum Ada Dokumen Sama Sekali (0/13) */}
        <div 
          onClick={() => { setStatusFilter('zero'); setCurrentPage(1); }}
          className={`bg-white p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
            statusFilter === 'zero' ? 'border-rose-400 ring-2 ring-rose-400/20' : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              Belum Ada Dokumen
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
              0 Berkas
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-rose-600">{stats.zeroDocsProjects}</span>
            <span className="text-[11px] text-slate-400">Perlu Diunggah</span>
          </div>
        </div>
      </div>

      {/* Comprehensive Filter Toolbar: Zona, Area, Vendor, PIC, Status, Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        {/* Upper Row: Search & Quick Status Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari Project Description, ID, PMO, Vendor, PIC..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Completeness Segmented Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('complete'); setCurrentPage(1); }}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'complete'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Lengkap ({stats.completedProjects})</span>
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('incomplete'); setCurrentPage(1); }}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'incomplete'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Belum Lengkap ({stats.partiallyUploadedProjects})</span>
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('zero'); setCurrentPage(1); }}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'zero'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/80'
              }`}
            >
              <X className="w-3 h-3" />
              <span>Belum Ada ({stats.zeroDocsProjects})</span>
            </button>
          </div>

          {/* Export Action */}
          <button
            type="button"
            onClick={() => documentStorageService.exportDocumentChecklist(filteredData)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer shrink-0 ml-auto"
            title="Download status kelengkapan berkas seluruh proyek terfilter ke format CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Checklist (CSV)</span>
          </button>
        </div>

        {/* Lower Row: Specific Dropdown Filters (Semua Zona, Semua Area, Semua Vendor, Semua PIC, Jenis Dokumen) */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            Filter Data:
          </span>

          {/* 1. Filter Zona */}
          <select
            value={zonaFilter}
            onChange={(e) => {
              setZonaFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option value="all">Semua Zona</option>
            {uniqueZonas.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>

          {/* 2. Filter Area / Kota */}
          <select
            value={areaFilter}
            onChange={(e) => {
              setAreaFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white font-medium text-slate-700 cursor-pointer max-w-[160px]"
          >
            <option value="all">Semua Area</option>
            {uniqueAreas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* 3. Filter Vendor */}
          <select
            value={vendorFilter}
            onChange={(e) => {
              setVendorFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white font-medium text-slate-700 cursor-pointer max-w-[180px]"
          >
            <option value="all">Semua Vendor</option>
            {uniqueVendors.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {/* 4. Filter PIC Section Head */}
          <select
            value={picFilter}
            onChange={(e) => {
              setPicFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white font-medium text-slate-700 cursor-pointer max-w-[160px]"
          >
            <option value="all">Semua PIC</option>
            {uniquePics.map((pic) => (
              <option key={pic} value={pic}>{pic}</option>
            ))}
          </select>

          {/* 5. Filter Slot Dokumen Spesifik */}
          <select
            value={slotFilter}
            onChange={(e) => {
              setSlotFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white font-medium text-slate-700 cursor-pointer max-w-[210px]"
          >
            <option value="all">Semua Jenis Dokumen</option>
            <optgroup label="Belum Upload (Kurang)">
              {DOCUMENT_SLOTS.map((slot) => (
                <option key={`missing:${slot.key}`} value={`missing:${slot.key}`}>
                  Belum: #{slot.num} {slot.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Sudah Upload (Lengkap)">
              {DOCUMENT_SLOTS.map((slot) => (
                <option key={`has:${slot.key}`} value={`has:${slot.key}`}>
                  Ada: #{slot.num} {slot.label}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Reset Filter Button */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer text-xs ml-auto"
              title="Reset seluruh filter pencarian dan opsi"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container with Horizontal Scrolling */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar max-h-[620px]">
          <table className="w-full text-left border-collapse text-xs select-none">
            {/* Table Header */}
            <thead className="bg-slate-900 text-white sticky top-0 z-20 shadow-xs">
              <tr className="divide-x divide-slate-800">
                {/* Fixed identification columns */}
                <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] w-12 text-center sticky left-0 z-30 bg-slate-900">
                  No.
                </th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[130px] sticky left-12 z-30 bg-slate-900">
                  PMO - ID
                </th>
                <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[260px]">
                  Project Description
                </th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[130px]">
                  Area & Vendor
                </th>
                <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[160px] text-center">
                  Status Kelengkapan
                </th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[100px] text-center">
                  Aksi CRUD
                </th>

                {/* 13 Document Slot Headers */}
                {DOCUMENT_SLOTS.map((slot) => (
                  <th
                    key={slot.key}
                    className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[180px]"
                    title={`${slot.num}. ${slot.label} (${slot.fileHint})`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-mono">
                        {slot.num}
                      </span>
                      <span className="truncate">{slot.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6 + DOCUMENT_SLOTS.length}
                    className="p-12 text-center text-slate-400 bg-slate-50/50"
                  >
                    <AlertCircle className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">Tidak ada proyek yang sesuai filter</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Silakan sesuaikan kata kunci pencarian atau klik tombol "Reset Filter".
                    </p>
                    {activeFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-3 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Reset Semua Filter
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.map((project, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const docRecord = documentStorageService.getDocumentRecord(project);
                  const docs = docRecord.documents;
                  const uploadedCount = Object.keys(docs).length;
                  const totalSlots = DOCUMENT_SLOTS.length; // 13
                  const missingCount = totalSlots - uploadedCount;
                  const pct = Math.round((uploadedCount / totalSlots) * 100);
                  const isFullyComplete = uploadedCount === totalSlots;

                  // Missing slots list for hover tooltip
                  const missingSlots = DOCUMENT_SLOTS.filter((s) => !docs[s.key]);

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-sky-50/40 transition-colors divide-x divide-slate-100 group"
                    >
                      {/* Fixed Col 1: No */}
                      <td className="px-3 py-2.5 text-center font-mono text-slate-500 sticky left-0 z-10 bg-white group-hover:bg-sky-50/40">
                        {globalIdx}
                      </td>

                      {/* Fixed Col 2: PMO - ID */}
                      <td className="px-3 py-2.5 font-mono font-semibold text-sky-800 sticky left-12 z-10 bg-white group-hover:bg-sky-50/40 whitespace-nowrap">
                        {project.pmoId}
                      </td>

                      {/* Col 3: Project Description */}
                      <td className="px-3.5 py-2.5 font-medium text-slate-800 max-w-[280px]">
                        <span className="line-clamp-2" title={project.projectDescription}>
                          {project.projectDescription}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-mono">
                          <span>{project.projectId || '-'}</span>
                          <span>•</span>
                          <span className="text-slate-500">{project.picSectionHead || '-'}</span>
                        </div>
                      </td>

                      {/* Col 4: Area & Vendor */}
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 text-[11px]">
                          {project.zona} • {project.areaKota}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]" title={project.namaVendor}>
                          {project.namaVendor || '-'}
                        </div>
                      </td>

                      {/* Col 5: Indikator Status Kelengkapan Dokumen */}
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {isFullyComplete ? (
                          <div 
                            title="Semua 13 dokumen telah lengkap diunggah!"
                            className="inline-flex flex-col items-center"
                          >
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Check className="w-3 h-3 text-emerald-600" />
                              LENGKAP (13/13)
                            </span>
                            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                              100% Sempurna
                            </span>
                          </div>
                        ) : uploadedCount > 0 ? (
                          <div 
                            title={`Dokumen belum lengkap! Kurang ${missingCount} berkas: ${missingSlots.map((s) => s.label).join(', ')}`}
                            className="inline-flex flex-col items-center"
                          >
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" />
                              BELUM LENGKAP ({uploadedCount}/13)
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-1.5 rounded-full bg-amber-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-amber-700 font-medium">Kurang {missingCount}</span>
                            </div>
                          </div>
                        ) : (
                          <div 
                            title="Belum ada satupun dokumen yang diunggah untuk proyek ini"
                            className="inline-flex flex-col items-center"
                          >
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                              <X className="w-3 h-3 text-slate-400" />
                              BELUM ADA (0/13)
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">0% Terunggah</span>
                          </div>
                        )}
                      </td>

                      {/* Col 6: Aksi CRUD Lengkap (Kelola) */}
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenDetailModal(project)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 mx-auto shadow-2xs hover:shadow-xs"
                          title="Buka panel kelola berkas: Tambah, Lihat, Edit Catatan, Ganti File, dan Hapus"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-cyan-700" />
                          <span>Kelola</span>
                        </button>
                      </td>

                      {/* 13 Document Slot Cells (CRUD In-Cell) */}
                      {DOCUMENT_SLOTS.map((slot) => {
                        const file = docs[slot.key];

                        return (
                          <td
                            key={slot.key}
                            className="px-2.5 py-2 min-w-[180px] max-w-[220px]"
                          >
                            {file ? (
                              <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[11px] group/chip">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  {getSlotIcon(slot.iconType)}
                                  <div className="min-w-0 flex-1">
                                    <span
                                      className="truncate font-semibold text-emerald-950 block"
                                      title={`${file.customName || file.name} (${formatFileSize(file.size)})${file.notes ? ` - Catatan: ${file.notes}` : ''}`}
                                    >
                                      {file.customName || file.name}
                                    </span>
                                    {file.notes && (
                                      <span className="text-[10px] text-emerald-700 italic truncate block">
                                        {file.notes}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-0.5 shrink-0">
                                  {/* Download */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleCellDownload(file, e)}
                                    title="Download File Dokumen"
                                    className="p-1 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                                  >
                                    <Download className="w-3 h-3" />
                                  </button>

                                  {/* Edit / Detail modal */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDetailModal(project)}
                                    title="Edit Catatan atau Ganti File Dokumen"
                                    className="p-1 text-sky-600 hover:text-sky-900 hover:bg-sky-100 rounded transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>

                                  {/* Hapus */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleCellRemove(project, slot.key, e)}
                                    title="Hapus File Dokumen"
                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Upload Trigger */
                              <button
                                type="button"
                                onClick={() => handleTriggerCellUpload(project, slot.key)}
                                className="w-full flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-200 hover:border-slate-300 rounded-md transition-colors cursor-pointer"
                              >
                                <Upload className="w-3 h-3 text-slate-400" />
                                <span>+ Upload</span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination Controls */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Menampilkan{' '}
            <span className="text-slate-800 font-semibold">
              {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            hingga{' '}
            <span className="text-slate-800 font-semibold">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </span>{' '}
            dari <span className="text-slate-800 font-semibold">{filteredData.length}</span> proyek
            {filteredData.length < projects.length && (
              <span className="text-slate-400 ml-1">
                (dari total {projects.length} proyek)
              </span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-mono text-xs text-slate-700">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project Document Detail Modal (Full CRUD Modal) */}
      <ProjectDocumentDetailModal
        isOpen={isDetailModalOpen}
        project={selectedProject}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProject(null);
        }}
        onDocumentChange={() => setRefreshKey((k) => k + 1)}
        showToast={showToast}
      />
    </div>
  );
};
