import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FileCode, 
  FileSpreadsheet, 
  FolderCheck,
  Building2,
  Clock,
  Edit3,
  Save,
  Check,
  Filter,
  Info,
  Tag,
  RefreshCw,
  FolderOpen,
  Mail,
  HardDrive,
  Eye,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { ProjectData } from '../types/project';
import { DOCUMENT_SLOTS, DocumentSlotDefinition, UploadedFileMeta, DocumentTypeKey, DocumentFormatType } from '../types/document';
import { documentStorageService } from '../services/documentStorageService';
import { EmailShareModal } from './EmailShareModal';
import { GoogleDriveModal } from './GoogleDriveModal';

interface ProjectDocumentDetailModalProps {
  isOpen: boolean;
  project: ProjectData | null;
  onClose: () => void;
  onDocumentChange?: () => void;
  showToast?: (msg: string) => void;
}

export const ProjectDocumentDetailModal: React.FC<ProjectDocumentDetailModalProps> = ({
  isOpen,
  project,
  onClose,
  onDocumentChange,
  showToast,
}) => {
  const [activeSlot, setActiveSlot] = useState<DocumentTypeKey | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<DocumentTypeKey | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ pct: number; stage: string } | null>(null);
  const [editingSlot, setEditingSlot] = useState<DocumentTypeKey | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editCustomName, setEditCustomName] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'perizinan' | 'teknis' | 'survey' | 'komersial'>('all');
  const [completenessFilter, setCompletenessFilter] = useState<'all' | 'completed' | 'missing'>('all');
  const [confirmDeleteSlot, setConfirmDeleteSlot] = useState<DocumentTypeKey | null>(null);
  const [isConfirmClearAll, setIsConfirmClearAll] = useState(false);

  // Modals for Email and Google Drive
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSpecificSlot, setEmailSpecificSlot] = useState<DocumentTypeKey | undefined>(undefined);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Lightbox preview for images / documents
  const [previewMeta, setPreviewMeta] = useState<UploadedFileMeta | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !project) return null;

  const docRecord = documentStorageService.getDocumentRecord(project);
  const docs = docRecord.documents;
  const uploadedCount = Object.keys(docs).length;
  const totalSlots = DOCUMENT_SLOTS.length; // 13
  const missingCount = totalSlots - uploadedCount;
  const completionPct = Math.round((uploadedCount / totalSlots) * 100);
  const isFullyComplete = uploadedCount === totalSlots;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleTriggerFileInput = (slotKey: DocumentTypeKey) => {
    setActiveSlot(slotKey);
    if (fileInputRef.current) {
      const slotDef = DOCUMENT_SLOTS.find((s) => s.key === slotKey);
      fileInputRef.current.accept = slotDef ? slotDef.accept : '*';
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSlot) return;

    setUploadingSlot(activeSlot);
    setUploadProgress({ pct: 15, stage: 'Memulai pengunggahan...' });

    try {
      const result = await documentStorageService.uploadDocument(
        project, 
        activeSlot, 
        file,
        (pct, stage) => {
          setUploadProgress({ pct, stage });
        }
      );

      if (result.success) {
        const slotDef = DOCUMENT_SLOTS.find((s) => s.key === activeSlot);
        if (showToast) {
          showToast(`Dokumen "${slotDef?.label}" (${file.name}) berhasil diunggah.`);
        }
        if (onDocumentChange) onDocumentChange();
      } else {
        if (showToast) {
          showToast(result.error || 'Gagal mengunggah file.');
        }
      }
    } catch {
      if (showToast) showToast('Terjadi kesalahan tak terduga saat mengunggah.');
    } finally {
      setUploadingSlot(null);
      setUploadProgress(null);
    }
  };

  const handleStartEdit = (slotKey: DocumentTypeKey, file: UploadedFileMeta) => {
    setEditingSlot(slotKey);
    setEditNotes(file.notes || '');
    setEditCustomName(file.customName || file.name);
  };

  const handleSaveEdit = (slotKey: DocumentTypeKey) => {
    const success = documentStorageService.updateDocumentMeta(project, slotKey, {
      notes: editNotes.trim(),
      customName: editCustomName.trim(),
    });

    if (success) {
      setEditingSlot(null);
      if (showToast) {
        showToast('Keterangan & catatan dokumen berhasil disimpan.');
      }
      if (onDocumentChange) onDocumentChange();
    } else {
      if (showToast) {
        showToast('Gagal menyimpan perubahan catatan dokumen.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setEditNotes('');
    setEditCustomName('');
  };

  const handleExecuteDelete = (slotKey: DocumentTypeKey) => {
    const slotDef = DOCUMENT_SLOTS.find((s) => s.key === slotKey);
    const success = documentStorageService.removeDocument(project, slotKey);
    setConfirmDeleteSlot(null);

    if (success) {
      if (showToast) {
        showToast(`Dokumen "${slotDef?.label}" berhasil dihapus.`);
      }
      if (onDocumentChange) onDocumentChange();
    }
  };

  const handleClearAllDocs = () => {
    const success = documentStorageService.clearAllDocuments(project);
    setIsConfirmClearAll(false);

    if (success) {
      if (showToast) {
        showToast(`Seluruh dokumen untuk proyek ${project.pmoId} berhasil dikosongkan.`);
      }
      if (onDocumentChange) onDocumentChange();
    }
  };

  const handleDownload = (meta: UploadedFileMeta, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    documentStorageService.downloadDocument(meta);
  };

  const getSlotIcon = (type: DocumentFormatType) => {
    switch (type) {
      case 'kmz':
        return <FileCode className="w-5 h-5 text-emerald-500" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-teal-600" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-purple-600" />;
      case 'pdf':
      default:
        return <FileText className="w-5 h-5 text-rose-500" />;
    }
  };

  // Filter slots based on category & completeness
  const filteredSlots = DOCUMENT_SLOTS.filter((slot) => {
    if (categoryFilter !== 'all' && slot.category !== categoryFilter) {
      return false;
    }
    const hasDoc = Boolean(docs[slot.key]);
    if (completenessFilter === 'completed' && !hasDoc) return false;
    if (completenessFilter === 'missing' && hasDoc) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Hidden Input for File Selection */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          className="hidden"
        />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${
              isFullyComplete ? 'bg-emerald-600' : 'bg-cyan-600'
            }`}>
              {isFullyComplete ? <CheckCircle2 className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-400/30">
                  {project.pmoId}
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {project.projectId ? `[${project.projectId}]` : '[Belum Ada ID]'}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-300">
                  {project.zona} • {project.areaKota}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5" title={project.projectDescription}>
                {project.projectDescription}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Share via Email button */}
            <button
              type="button"
              onClick={() => {
                setEmailSpecificSlot(undefined);
                setIsEmailModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-200 hover:text-white bg-sky-900/60 hover:bg-sky-850 border border-sky-600/40 rounded-lg transition-colors cursor-pointer"
              title="Kirim dan bagikan ringkasan berkas proyek melalui Email"
            >
              <Mail className="w-3.5 h-3.5 text-sky-300" />
              <span className="hidden sm:inline">Share Email</span>
            </button>

            {/* Google Drive button */}
            <button
              type="button"
              onClick={() => setIsDriveModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/40 rounded-lg transition-colors cursor-pointer"
              title="Simpan, cadangkan, dan bagikan folder Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Google Drive</span>
            </button>

            {uploadedCount > 0 && (
              <button
                type="button"
                onClick={() => setIsConfirmClearAll(true)}
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition-colors cursor-pointer"
                title="Hapus seluruh dokumen yang telah diunggah untuk proyek ini"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Hapus Semua</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Interactive Upload Progress Bar */}
        {uploadProgress && (
          <div className="bg-sky-50 border-b border-sky-200 px-5 py-2.5 flex items-center justify-between gap-3 text-xs text-sky-900 animate-in fade-in duration-200 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
              <span className="font-semibold">{uploadProgress.stage}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-36 bg-sky-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.pct}%` }}
                />
              </div>
              <span className="font-mono font-bold text-sky-700">{uploadProgress.pct}%</span>
            </div>
          </div>
        )}

        {/* Project Context & Completeness Status Indicator Banner */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Vendor</span>
              <span className="font-semibold text-slate-700">{project.namaVendor || '-'}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Status Project</span>
              <span className="font-semibold text-slate-700">{project.projectStatus || '-'}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">PIC Section Head</span>
              <span className="font-semibold text-slate-700">{project.picSectionHead || '-'}</span>
            </div>
          </div>

          {/* Indikator Kelengkapan Dokumen */}
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div className="text-right">
              {isFullyComplete ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  DOKUMEN LENGKAP (13/13)
                </span>
              ) : uploadedCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  BELUM LENGKAP ({uploadedCount}/13 • Kurang {missingCount})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                  BELUM ADA DOKUMEN (0/13)
                </span>
              )}
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Progres: <strong>{completionPct}%</strong>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-24 bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isFullyComplete
                    ? 'bg-emerald-500' 
                    : completionPct > 50 
                    ? 'bg-cyan-500' 
                    : 'bg-amber-500'
                }`}
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Toolbar Inside Modal */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5">
            <span className="text-slate-500 text-[11px] font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Kategori:
            </span>
            {(['all', 'perizinan', 'teknis', 'survey', 'komersial'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'Semua (13)' : cat}
              </button>
            ))}
          </div>

          {/* Completeness Filter Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCompletenessFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                completenessFilter === 'all'
                  ? 'bg-cyan-700 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Semua ({totalSlots})
            </button>
            <button
              type="button"
              onClick={() => setCompletenessFilter('completed')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                completenessFilter === 'completed'
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              Sudah Ada ({uploadedCount})
            </button>
            <button
              type="button"
              onClick={() => setCompletenessFilter('missing')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                completenessFilter === 'missing'
                  ? 'bg-amber-700 text-white font-semibold'
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              Belum Ada ({missingCount})
            </button>
          </div>
        </div>

        {/* Clear All Documents Confirmation Alert */}
        {isConfirmClearAll && (
          <div className="bg-rose-50 border-b border-rose-200 p-3 px-5 flex items-center justify-between gap-3 text-xs text-rose-800 animate-in fade-in duration-150 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Apakah Anda yakin ingin menghapus seluruh ({uploadedCount}) berkas dokumen proyek ini?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearAllDocs}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md transition-colors cursor-pointer"
              >
                Ya, Kosongkan Semua
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmClearAll(false)}
                className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-md border border-slate-300 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Document Cards Grid (13 Documents) */}
        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSlots.map((slot) => {
              const file = docs[slot.key];
              const isUploading = uploadingSlot === slot.key;
              const isEditing = editingSlot === slot.key;
              const isConfirmingDelete = confirmDeleteSlot === slot.key;

              return (
                <div
                  key={slot.key}
                  className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all duration-150 ${
                    file
                      ? 'bg-white border-emerald-300 shadow-2xs hover:shadow-xs ring-1 ring-emerald-500/15'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Top info */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          #{slot.num}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 capitalize bg-slate-100/80 px-1.5 py-0.5 rounded">
                          {slot.category}
                        </span>
                      </div>

                      {/* Indikator Status Slot */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        file 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {file ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            SUDAH ADA
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-500" />
                            BELUM ADA
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 mt-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        file ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {getSlotIcon(slot.iconType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-800 leading-snug truncate" title={slot.label}>
                          {slot.label}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {slot.fileHint} • Format: <span className="font-semibold text-slate-600">{slot.formatBadge}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Middle / Editing Form (CRUD: Edit Catatan / Nomor Surat / Custom Name) */}
                  {isEditing ? (
                    <div className="mt-3 p-2.5 bg-sky-50/80 border border-sky-200 rounded-lg space-y-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                          Nama / Label Dokumen
                        </label>
                        <input
                          type="text"
                          value={editCustomName}
                          onChange={(e) => setEditCustomName(e.target.value)}
                          placeholder="Nama dokumen..."
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                          Catatan / No. Surat / Keterangan
                        </label>
                        <textarea
                          rows={2}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Contoh: No. Surat 021/DISPU/2026, status approved..."
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(slot.key)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          <span>Simpan</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 bg-white border border-slate-300 rounded transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : file?.notes ? (
                    <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 mb-0.5">
                        <Tag className="w-3 h-3 text-sky-600" />
                        <span>Catatan / Keterangan:</span>
                      </div>
                      <p className="line-clamp-2 italic text-slate-700">{file.notes}</p>
                    </div>
                  ) : null}

                  {/* Inline Delete Confirmation */}
                  {isConfirmingDelete && (
                    <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1.5 text-rose-800">
                      <p className="text-[11px] font-medium">Hapus file dokumen ini?</p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleExecuteDelete(slot.key)}
                          className="px-2.5 py-0.5 bg-rose-600 text-white rounded text-[11px] font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
                        >
                          Ya, Hapus
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteSlot(null)}
                          className="px-2 py-0.5 bg-white text-slate-600 border border-slate-300 rounded text-[11px] hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bottom: File Status & Action Buttons (CRUD) */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    {file ? (
                      <div className="space-y-2">
                        {/* File details & timestamp */}
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span className="truncate font-medium text-slate-800 max-w-[150px]" title={file.customName || file.name}>
                            {file.customName || file.name}
                          </span>
                          <span className="text-slate-400 shrink-0 font-mono text-[10px]">
                            {formatFileSize(file.size)}
                          </span>
                        </div>

                        {/* CRUD & Share Buttons */}
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          {/* 1. Download (Read) */}
                          <button
                            type="button"
                            onClick={(e) => handleDownload(file, e)}
                            title="Unduh file dokumen"
                            className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Unduh</span>
                          </button>

                          {/* 2. Preview (if dataUrl or image exists) */}
                          {file.dataUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewMeta(file)}
                              title="Lihat Pratinjau Dokumen"
                              className="p-1.5 text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 3. Share via Email */}
                          <button
                            type="button"
                            onClick={() => {
                              setEmailSpecificSlot(slot.key);
                              setIsEmailModalOpen(true);
                            }}
                            title="Bagikan dokumen ini via Email"
                            className="p-1.5 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {/* 4. Simpan ke Google Drive */}
                          <button
                            type="button"
                            onClick={() => setIsDriveModalOpen(true)}
                            title="Simpan dokumen ke Google Drive"
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                          </button>

                          {/* 5. Edit Catatan (Edit) */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(slot.key, file)}
                            title="Edit catatan atau nama dokumen"
                            className="p-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          {/* 6. Ganti File (Update / Re-upload) */}
                          <button
                            type="button"
                            onClick={() => handleTriggerFileInput(slot.key)}
                            title="Ganti dengan file versi baru"
                            className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Ganti
                          </button>

                          {/* 7. Hapus (Delete) */}
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteSlot(slot.key)}
                            title="Hapus file dokumen"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Upload Button (Create) */
                      <button
                        type="button"
                        onClick={() => handleTriggerFileInput(slot.key)}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isUploading ? 'Mengunggah...' : '+ Unggah File (PDF/Gambar/Excel)'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer with Save & Close */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Semua unggahan dan catatan dokumen tersimpan secara instan dan aman.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Simpan & Selesai</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Modal: Email Share */}
      <EmailShareModal
        isOpen={isEmailModalOpen}
        project={project}
        specificSlot={emailSpecificSlot}
        onClose={() => {
          setIsEmailModalOpen(false);
          setEmailSpecificSlot(undefined);
        }}
        showToast={showToast}
      />

      {/* Sub-Modal: Google Drive Sync & Share */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        project={project}
        onClose={() => setIsDriveModalOpen(false)}
        onDriveUpdated={() => {
          if (onDocumentChange) onDocumentChange();
        }}
        showToast={showToast}
      />

      {/* Lightbox Preview for Images & PDFs */}
      {previewMeta && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewMeta(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm truncate font-mono">{previewMeta.name}</span>
              <button 
                onClick={() => setPreviewMeta(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex items-center justify-center overflow-auto flex-1 max-h-[75vh]">
              {previewMeta.type.startsWith('image/') || previewMeta.name.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                <img 
                  src={previewMeta.dataUrl} 
                  alt={previewMeta.name} 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-xl shadow-xs border border-slate-200 max-w-md">
                  <FileText className="w-12 h-12 text-sky-600 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{previewMeta.name}</h4>
                  <p className="text-xs text-slate-500 mb-4">{formatFileSize(previewMeta.size)} • {previewMeta.type}</p>
                  <button
                    onClick={() => documentStorageService.downloadDocument(previewMeta)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
