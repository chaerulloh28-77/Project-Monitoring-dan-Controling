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
  FileCheck2, 
  Layers, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  FolderCheck,
  Check,
  Clock
} from 'lucide-react';
import { ProjectData } from '../types/project';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'has_docs' | 'zero_docs' | 'complete'>('all');
  const [slotFilter, setSlotFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Selected project for modal
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Hidden file input for inline cell uploads
  const [cellTarget, setCellTarget] = useState<{ project: ProjectData; slotKey: DocumentTypeKey } | null>(null);
  const cellFileInputRef = useRef<HTMLInputElement>(null);

  // Trigger re-render when a document is uploaded/deleted
  const [refreshKey, setRefreshKey] = useState(0);

  const stats = useMemo(() => {
    // depend on refreshKey
    return documentStorageService.getDocumentStats(projects);
  }, [projects, refreshKey]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return projects.filter((p) => {
      // 1. Text Search across Description, Project ID, PMO ID
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          (p.pmoId || '').toLowerCase().includes(q) ||
          (p.projectDescription || '').toLowerCase().includes(q) ||
          (p.projectId || '').toLowerCase().includes(q) ||
          (p.picSectionHead || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      const rec = documentStorageService.getDocumentRecord(p);
      const docsCount = Object.keys(rec.documents).length;

      // 2. Status filter
      if (statusFilter === 'complete' && docsCount < DOCUMENT_SLOTS.length) return false;
      if (statusFilter === 'has_docs' && docsCount === 0) return false;
      if (statusFilter === 'zero_docs' && docsCount > 0) return false;

      // 3. Slot specific filter (e.g. "missing:mr" or "has:mr")
      if (slotFilter !== 'all') {
        const [mode, key] = slotFilter.split(':');
        const hasSlotDoc = Boolean(rec.documents[key as DocumentTypeKey]);
        if (mode === 'has' && !hasSlotDoc) return false;
        if (mode === 'missing' && hasSlotDoc) return false;
      }

      return true;
    });
  }, [projects, searchTerm, statusFilter, slotFilter, refreshKey]);

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
    const confirmed = window.confirm(`Hapus dokumen "${slotDef?.label}" untuk ${project.pmoId}?`);
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
    <div className="space-y-3.5">
      {/* Hidden File Input for Cell Uploads */}
      <input
        type="file"
        ref={cellFileInputRef}
        onChange={handleCellFileSelected}
        className="hidden"
      />

      {/* Top Document Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
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

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Berkas Terunggah</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FolderCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-600">{stats.totalUploadedDocs}</span>
            <span className="text-[11px] text-slate-400">
              / {stats.totalPossibleDocs} Berkas
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Berkas Lengkap (13/13)</span>
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-teal-600">{stats.completedProjects}</span>
            <span className="text-[11px] text-slate-400">
              Proyek 100% Lengkap
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kelengkapan Total</span>
            <span className="text-xs font-bold text-cyan-600">
              {stats.totalPossibleDocs > 0 ? Math.round((stats.totalUploadedDocs / stats.totalPossibleDocs) * 100) : 0}%
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${stats.totalPossibleDocs > 0 ? Math.round((stats.totalUploadedDocs / stats.totalPossibleDocs) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search box */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari Project Description, ID, PMO..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50/50"
            />
          </div>

          {/* Status filter dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white cursor-pointer font-medium text-slate-700"
          >
            <option value="all">Semua Status Berkas</option>
            <option value="has_docs">Ada Berkas Terunggah ({stats.partiallyUploadedProjects + stats.completedProjects})</option>
            <option value="complete">Berkas 100% Lengkap ({stats.completedProjects})</option>
            <option value="zero_docs">Belum Ada Berkas ({stats.zeroDocsProjects})</option>
          </select>

          {/* Quick slot filter */}
          <select
            value={slotFilter}
            onChange={(e) => {
              setSlotFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white cursor-pointer font-medium text-slate-700"
          >
            <option value="all">Filter Berdasarkan Jenis Dokumen</option>
            <optgroup label="Belum Upload (Missing)">
              {DOCUMENT_SLOTS.map((slot) => (
                <option key={`missing:${slot.key}`} value={`missing:${slot.key}`}>
                  Belum Upload: #{slot.num} {slot.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Sudah Upload (Available)">
              {DOCUMENT_SLOTS.map((slot) => (
                <option key={`has:${slot.key}`} value={`has:${slot.key}`}>
                  Sudah Upload: #{slot.num} {slot.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Right actions: Export checklist */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => documentStorageService.exportDocumentChecklist(projects)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/90 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Checklist (CSV)</span>
          </button>
        </div>
      </div>

      {/* Main Table Container with Horizontal Scrolling */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
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
                  1. Project Description (text)
                </th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[130px]">
                  2. Project ID (text)
                </th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[140px] text-center">
                  Kelengkapan
                </th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] min-w-[100px] text-center">
                  Aksi
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
                    className="p-10 text-center text-slate-400 bg-slate-50/50"
                  >
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada proyek yang sesuai filter</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba sesuaikan kata kunci pencarian atau ubah filter dokumen.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((project, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const docRecord = documentStorageService.getDocumentRecord(project);
                  const docs = docRecord.documents;
                  const uploadedCount = Object.keys(docs).length;
                  const pct = Math.round((uploadedCount / DOCUMENT_SLOTS.length) * 100);

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

                      {/* Col 3: Project Description (text) */}
                      <td className="px-3.5 py-2.5 font-medium text-slate-800 max-w-[280px]">
                        <span className="line-clamp-2" title={project.projectDescription}>
                          {project.projectDescription}
                        </span>
                      </td>

                      {/* Col 4: Project ID (text) */}
                      <td className="px-3 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                        {project.projectId || <span className="text-slate-400 italic">-</span>}
                      </td>

                      {/* Col 5: Progress Kelengkapan */}
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <div className="flex items-center gap-1.5 justify-center">
                          <span className={`text-[11px] font-bold ${
                            pct === 100 ? 'text-emerald-600' : pct > 0 ? 'text-cyan-700' : 'text-slate-400'
                          }`}>
                            {uploadedCount}/{DOCUMENT_SLOTS.length}
                          </span>
                          <span className="text-[10px] text-slate-400">({pct}%)</span>
                        </div>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-cyan-500' : 'bg-slate-300'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>

                      {/* Col 6: Aksi Cepat / Buka Modal */}
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenDetailModal(project)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-md transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Kelola</span>
                        </button>
                      </td>

                      {/* 13 Document Slot Cells */}
                      {DOCUMENT_SLOTS.map((slot) => {
                        const file = docs[slot.key];

                        return (
                          <td
                            key={slot.key}
                            className="px-2.5 py-2 min-w-[180px] max-w-[220px]"
                          >
                            {file ? (
                              <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] group/chip">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  {getSlotIcon(slot.iconType)}
                                  <span
                                    className="truncate font-medium text-emerald-950"
                                    title={`${file.name} (${formatFileSize(file.size)})`}
                                  >
                                    {file.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => handleCellDownload(file, e)}
                                    title="Download File"
                                    className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                                  >
                                    <Download className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCellRemove(project, slot.key, e)}
                                    title="Hapus File"
                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
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

      {/* Project Document Detail Modal */}
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
