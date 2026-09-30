import React, { useState } from 'react';
import { 
  X, 
  HardDrive, 
  ExternalLink, 
  Copy, 
  Check, 
  Cloud, 
  RefreshCw, 
  FolderCheck, 
  FileText, 
  Download, 
  FolderOpen,
  ArrowUpRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ProjectData } from '../types/project';
import { documentStorageService } from '../services/documentStorageService';
import { DOCUMENT_SLOTS } from '../types/document';

interface GoogleDriveModalProps {
  isOpen: boolean;
  project: ProjectData | null;
  onClose: () => void;
  onDriveUpdated?: () => void;
  showToast?: (msg: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  project,
  onClose,
  onDriveUpdated,
  showToast,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStage, setSyncStage] = useState('');
  const [customDriveUrl, setCustomDriveUrl] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !project) return null;

  const record = documentStorageService.getDocumentRecord(project);
  const docs = record.documents;
  const uploadedSlots = DOCUMENT_SLOTS.filter((s) => docs[s.key]);
  const activeDriveUrl = customDriveUrl.trim() || record.driveFolderUrl || `https://drive.google.com/drive/folders/pmo-${project.pmoId.toLowerCase()}`;

  const handleSyncToDrive = async () => {
    setIsSyncing(true);
    setSyncProgress(10);
    setSyncStage('Mengemas seluruh berkas proyek...');

    try {
      const result = await documentStorageService.syncToGoogleDrive(project, (pct, stage) => {
        setSyncProgress(pct);
        setSyncStage(stage);
      });

      if (result.success) {
        setCustomDriveUrl(result.driveUrl);
        if (showToast) {
          showToast(`Dokumen project ${project.pmoId} berhasil dicadangkan ke Google Drive!`);
        }
        if (onDriveUpdated) onDriveUpdated();
      } else {
        if (showToast) showToast(result.error || 'Gagal sinkronisasi ke Google Drive.');
      }
    } catch {
      if (showToast) showToast('Terjadi kesalahan saat memproses Google Drive.');
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
        setSyncStage('');
      }, 1000);
    }
  };

  const handleSaveCustomUrl = () => {
    if (!customDriveUrl.trim()) {
      if (showToast) showToast('Masukkan URL Google Drive yang valid.');
      return;
    }

    const ok = documentStorageService.setDriveFolderUrl(project, customDriveUrl.trim());
    if (ok) {
      if (showToast) showToast('Tautan Google Drive folder proyek berhasil disimpan.');
      if (onDriveUpdated) onDriveUpdated();
    } else {
      if (showToast) showToast('Gagal menyimpan tautan Google Drive.');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(activeDriveUrl);
      setCopied(true);
      if (showToast) showToast('Tautan Google Drive berhasil disalin.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      if (showToast) showToast('Gagal menyalin tautan.');
    }
  };

  const handleOpenDrive = () => {
    window.open(activeDriveUrl, '_blank', 'noopener,noreferrer');
    if (showToast) showToast('Membuka Google Drive di tab baru...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/20">
              <HardDrive className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Simpan & Share ke Google Drive</h3>
              <p className="text-xs text-emerald-200">
                {project.pmoId} • {project.projectDescription}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Sync Progress Bar Banner (Active during sync) */}
          {isSyncing && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between font-semibold text-emerald-900">
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>{syncStage || 'Menghubungkan ke Google Drive...'}</span>
                </span>
                <span className="font-mono">{syncProgress}%</span>
              </div>
              <div className="w-full bg-emerald-200/80 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Google Drive Folder Link & Controls */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span>Tautan Folder Google Drive Proyek</span>
              </label>
              {record.driveFolderUrl && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <FolderCheck className="w-3 h-3" />
                  <span>Tersambung</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={customDriveUrl || record.driveFolderUrl || activeDriveUrl}
                onChange={(e) => setCustomDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={handleSaveCustomUrl}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-colors cursor-pointer shrink-0"
              >
                Simpan
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenDrive}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Buka Google Drive</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tautan Tersalin' : 'Salin Tautan'}</span>
              </button>
            </div>
          </div>

          {/* Sync Trigger Card */}
          <div className="p-4 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Cadangkan & Perbarui Dokumen ke Drive</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Secara otomatis mengemas {uploadedSlots.length} dokumen yang telah diunggah ke Google Drive Workspace.
              </p>
            </div>
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleSyncToDrive}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
            >
              {isSyncing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyinkronkan...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sinkronkan Sekarang</span>
                </>
              )}
            </button>
          </div>

          {/* List of Project Documents */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-700 font-semibold px-0.5">
              <span>Berkas yang Terkoneksi ({uploadedSlots.length} Dokumen)</span>
              <span className="text-[11px] font-normal text-slate-500">
                Total slot: {DOCUMENT_SLOTS.length}
              </span>
            </div>

            {uploadedSlots.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                Belum ada dokumen yang diunggah untuk proyek ini. Silakan unggah dokumen di Tab Upload Document terlebih dahulu.
              </div>
            ) : (
              <div className="divide-y divide-slate-200/80 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto custom-scrollbar">
                {uploadedSlots.map((slot) => {
                  const file = docs[slot.key]!;
                  return (
                    <div key={slot.key} className="p-2.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate text-[11px]">
                            {slot.label}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate font-mono">
                            {file.name} • {(file.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => documentStorageService.downloadDocument(file)}
                        title="Unduh file berkas"
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tersinkronisasi otomatis dengan database proyek</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
