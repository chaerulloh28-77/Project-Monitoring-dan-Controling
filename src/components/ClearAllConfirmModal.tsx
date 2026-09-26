import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ClearAllConfirmModalProps {
  isOpen: boolean;
  totalProjects: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearAllConfirmModal: React.FC<ClearAllConfirmModalProps> = ({
  isOpen,
  totalProjects,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hapus Semua Data Project</h3>
              <p className="text-xs text-slate-500">Kosongkan seluruh data pada 5 sheet sistem</p>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 text-xs text-rose-900 space-y-2 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-rose-950">
                  Seluruh {totalProjects} project akan dihapus dari aplikasi.
                </span>
                <p className="text-[11px] text-rose-800 mt-1">
                  Data pada semua sheet (Project List, Construction & Plan, Status Project, Status Construction, dan Tracking Pipeline) akan dikosongkan.
                </p>
                <p className="text-[11px] text-rose-700 font-medium mt-1">
                  Catatan: Anda tetap dapat memuat ulang 387 data default kapan saja melalui tombol &quot;Muat Ulang Data Awal&quot;.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ya, Hapus Semua Project</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
