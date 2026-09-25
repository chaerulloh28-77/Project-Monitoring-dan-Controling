import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { ProjectData } from '../types/project';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  project: ProjectData | null;
  onClose: () => void;
  onConfirm: (project: ProjectData) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  project,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Project</h3>
              <p className="text-xs text-slate-500">Tindakan ini akan menghapus project dari semua sheet</p>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 space-y-1 mb-4">
            <div className="font-semibold text-rose-900">
              {project.pmoId} - {project.projectDescription}
            </div>
            <p className="text-[11px] text-rose-700">
              Data akan dihapus dari 5 sheet: Project List, Construction & Plan, Status Project, Status Construction, dan Tracking Pipeline.
              Sistem akan membuat cadangan otomatis sebelum penghapusan.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Kembali / Batal
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(project);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ya, Hapus Project</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
