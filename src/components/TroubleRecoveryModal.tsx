import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  RotateCcw, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Database,
  History
} from 'lucide-react';
import { BackupSnapshot, ProjectData } from '../types/project';
import { storageService } from '../services/storageService';

interface TroubleRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (projects: ProjectData[]) => void;
  currentProjects: ProjectData[];
  lastSavedTime: string;
}

export const TroubleRecoveryModal: React.FC<TroubleRecoveryModalProps> = ({
  isOpen,
  onClose,
  onRestore,
  currentProjects,
  lastSavedTime,
}) => {
  const [backups, setBackups] = useState<BackupSnapshot[]>(storageService.getBackups());
  const [selectedSnapshot, setSelectedSnapshot] = useState<BackupSnapshot | null>(null);
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRestoreSnapshot = (snapshot: BackupSnapshot) => {
    const success = storageService.restoreBackup(snapshot);
    if (success) {
      onRestore(snapshot.data);
      setRestoreNotice(`Berhasil memulihkan ${snapshot.data.length} project dari cadangan: ${new Date(snapshot.timestamp).toLocaleTimeString('id-ID')}`);
      setTimeout(() => {
        setRestoreNotice(null);
        onClose();
      }, 1200);
    }
  };

  const handleResetToFactory = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke data awal bawaan?')) {
      const resetData = storageService.resetToInitial();
      onRestore(resetData);
      setRestoreNotice('Data berhasil dikembalikan ke format awal.');
      setTimeout(() => {
        setRestoreNotice(null);
        onClose();
      }, 1000);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          storageService.saveProjects(parsed, 'Imported from JSON backup');
          onRestore(parsed);
          setRestoreNotice(`Sukses mengimpor ${parsed.length} project.`);
          setTimeout(() => {
            setRestoreNotice(null);
            onClose();
          }, 1200);
        } else {
          alert('Format file JSON tidak sesuai.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON: format tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sistem Proteksi Trouble & Auto-Save</h3>
              <p className="text-xs text-slate-400">
                Penyimpanan otomatis berkelanjutan & riwayat pemulihan darurat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar text-xs">
          {/* Status Alert Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-emerald-900 text-xs">Sistem Auto-Save Berfungsi Normal</h4>
              <p className="text-emerald-700 text-[11px] mt-0.5">
                Setiap kali Anda menambah, mengedit, atau menghapus data, sistem langsung menyimpannya ke memori aman peramban Anda.
                Jika halaman tertutup, reload, atau crash tiba-tiba, data Anda tetap utuh.
              </p>
              <div className="mt-2 text-[11px] font-mono text-emerald-800">
                Waktu simpan terakhir: {lastSavedTime ? new Date(lastSavedTime).toLocaleString('id-ID') : 'Aktif'}
              </div>
            </div>
          </div>

          {restoreNotice && (
            <div className="p-3 bg-sky-50 border border-sky-300 rounded-lg text-sky-800 font-medium">
              {restoreNotice}
            </div>
          )}

          {/* Backup Snapshots History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                <span>Titik Pemulihan Cadangan (Rolling Snapshots)</span>
              </h4>
              <span className="text-[11px] text-slate-400">{backups.length} snapshot tersimpan</span>
            </div>

            {backups.length === 0 ? (
              <p className="text-slate-400 italic">Belum ada snapshot cadangan tambahan.</p>
            ) : (
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto custom-scrollbar">
                {backups.map((snap, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{snap.reason}</span>
                        <span className="text-[11px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                          {snap.count} project
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(snap.timestamp).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestoreSnapshot(snap)}
                      className="px-3 py-1 bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 rounded text-slate-700 font-medium transition-colors cursor-pointer"
                    >
                      Pulihkan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manual Backup & Restore Tools */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2">Pilihan Pemulihan & Ekspor Cadangan</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Download JSON */}
              <button
                onClick={() => storageService.exportToJson(currentProjects)}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
                  <Download className="w-4 h-4 text-sky-600" />
                  <span>Unduh File JSON</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Simpan cadangan ke harddisk komputer Anda.
                </p>
              </button>

              {/* Upload JSON */}
              <label className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer block">
                <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Pulihkan dari File</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload file cadangan JSON untuk pemulihan.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>

              {/* Reset to Factory Default */}
              <button
                onClick={handleResetToFactory}
                className="p-3 bg-rose-50/50 hover:bg-rose-50 border border-rose-200 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 font-semibold text-rose-700 mb-1">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Reset ke Data Asli</span>
                </div>
                <p className="text-[11px] text-rose-600/80">
                  Kembalikan dataset awal 4 sheet bawaan.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
