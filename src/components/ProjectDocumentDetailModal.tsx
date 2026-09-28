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
  ExternalLink
} from 'lucide-react';
import { ProjectData } from '../types/project';
import { DOCUMENT_SLOTS, DocumentSlotDefinition, UploadedFileMeta, DocumentTypeKey } from '../types/document';
import { documentStorageService } from '../services/documentStorageService';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !project) return null;

  const docRecord = documentStorageService.getDocumentRecord(project);
  const docs = docRecord.documents;
  const uploadedCount = Object.keys(docs).length;
  const totalSlots = DOCUMENT_SLOTS.length; // 13
  const completionPct = Math.round((uploadedCount / totalSlots) * 100);

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
    const result = await documentStorageService.uploadDocument(project, activeSlot, file);
    setUploadingSlot(null);

    if (result.success) {
      if (showToast) {
        const slotDef = DOCUMENT_SLOTS.find((s) => s.key === activeSlot);
        showToast(`Dokumen "${slotDef?.label}" berhasil diunggah.`);
      }
      if (onDocumentChange) onDocumentChange();
    } else {
      if (showToast) {
        showToast(result.error || 'Gagal mengunggah file.');
      }
    }
  };

  const handleRemove = (slotKey: DocumentTypeKey, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const slotDef = DOCUMENT_SLOTS.find((s) => s.key === slotKey);
    const confirmed = window.confirm(`Hapus dokumen "${slotDef?.label}" untuk proyek ini?`);
    if (confirmed) {
      documentStorageService.removeDocument(project, slotKey);
      if (showToast) {
        showToast(`Dokumen "${slotDef?.label}" berhasil dihapus.`);
      }
      if (onDocumentChange) onDocumentChange();
    }
  };

  const handleDownload = (meta: UploadedFileMeta, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    documentStorageService.downloadDocument(meta);
  };

  const getSlotIcon = (type: 'pdf' | 'kmz' | 'excel') => {
    switch (type) {
      case 'kmz':
        return <FileCode className="w-5 h-5 text-emerald-500" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-teal-600" />;
      case 'pdf':
      default:
        return <FileText className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
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
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <FolderCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-400/30">
                  {project.pmoId}
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {project.projectId ? `[${project.projectId}]` : '[Belum Ada ID]'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-300">
                  {project.zona} • {project.areaKota}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5" title={project.projectDescription}>
                {project.projectDescription}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Context & Progress Banner */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Project Category</span>
              <span className="font-semibold text-slate-700">{project.projectCategory}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Status Project</span>
              <span className="font-semibold text-slate-700">{project.projectStatus}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">PIC Section Head</span>
              <span className="font-semibold text-slate-700">{project.picSectionHead}</span>
            </div>
          </div>

          {/* Progress Completion Indicator */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-800">
                {uploadedCount} dari {totalSlots} Dokumen
              </span>
              <span className="text-[11px] text-slate-500 block">
                {completionPct}% Kelengkapan Berkas
              </span>
            </div>
            <div className="w-24 bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  completionPct === 100 
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

        {/* Document Cards Grid (13 Documents) */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {DOCUMENT_SLOTS.map((slot) => {
              const file = docs[slot.key];
              const isUploading = uploadingSlot === slot.key;

              return (
                <div
                  key={slot.key}
                  className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all duration-150 ${
                    file
                      ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs hover:border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Top info */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        #{slot.num}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        file 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {slot.formatBadge}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 mt-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        file ? 'bg-emerald-100' : 'bg-slate-100'
                      }`}>
                        {getSlotIcon(slot.iconType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-800 leading-snug truncate" title={slot.label}>
                          {slot.label}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {slot.fileHint}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: File Status & Action Buttons */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    {file ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span className="truncate font-medium text-slate-700 max-w-[150px]" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-slate-400 shrink-0 font-mono text-[10px]">
                            {formatFileSize(file.size)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleDownload(file, e)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/80 rounded-lg transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTriggerFileInput(slot.key)}
                            title="Ganti file dengan versi baru"
                            className="px-2 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Ganti
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleRemove(slot.key, e)}
                            title="Hapus file dokumen"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTriggerFileInput(slot.key)}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isUploading ? 'Mengunggah...' : '+ Unggah File'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Format didukung: PDF, KMZ, KML, XLSX, XLS. Tersimpan otomatis di peramban.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
