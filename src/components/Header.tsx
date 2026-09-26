import React from 'react';
import { 
  Building2, 
  Plus, 
  Download, 
  Menu,
  Trash2,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { TabKey } from '../types/project';

interface HeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onNewProject: () => void;
  onExportCsv: () => void;
  lastSavedTime: string;
  totalProjects: number;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onClearAll?: () => void;
  onRestoreDefaults?: () => void;
  onOpenSecurity?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onNewProject,
  onExportCsv,
  lastSavedTime,
  totalProjects,
  onToggleSidebar,
  isSidebarCollapsed,
  onClearAll,
  onRestoreDefaults,
  onOpenSecurity,
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-30 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Sidebar Toggle + Brand Identity */}
          <div className="flex items-center gap-3.5 min-w-0">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                title={isSidebarCollapsed ? 'Buka Menu Samping' : 'Ciutkan Menu Samping'}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/70 transition-all cursor-pointer shrink-0"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-600/20 ring-1 ring-white/10 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
                  Project Monitoring dan Controling
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-sky-500/15 text-sky-300 rounded-md border border-sky-400/25">
                  © PAUL
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">{totalProjects}</span> Project Terdata
                </p>
                <span className="text-slate-600 text-xs hidden sm:inline">•</span>
                <p className="text-xs text-slate-400 hidden sm:inline">
                  Multi-Sheet Synchronized
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions & Status */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Auto-save status badge */}
            <div 
              title="Sistem menyimpan otomatis setiap perubahan data."
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] text-slate-300">
                Tersimpan {lastSavedTime ? new Date(lastSavedTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Auto'}
              </span>
            </div>

            {/* Security Guard Shield Badge */}
            {onOpenSecurity && (
              <button
                type="button"
                onClick={onOpenSecurity}
                title="Sistem Keamanan & Anti-Kloning Aktif (Klik untuk melihat sertifikat lisensi © PAUL)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60 hover:text-white transition-all cursor-pointer text-xs shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden md:inline font-mono text-[11px] font-medium">Security Guard</span>
              </button>
            )}

            {/* Clear all projects button when projects exist */}
            {totalProjects > 0 && onClearAll && (
              <button
                onClick={onClearAll}
                title="Hapus / Kosongkan seluruh data project"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-lg hover:bg-rose-900/60 hover:text-white transition-all cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden xl:inline">Hapus Semua Data</span>
              </button>
            )}

            {/* Restore defaults button when projects are empty */}
            {totalProjects === 0 && onRestoreDefaults && (
              <button
                onClick={onRestoreDefaults}
                title="Muat ulang 387 data project awal"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-sky-300 bg-sky-950/40 border border-sky-800/60 rounded-lg hover:bg-sky-900/60 hover:text-white transition-all cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Muat Ulang Data Awal</span>
              </button>
            )}

            {/* Export CSV Button */}
            <button
              onClick={onExportCsv}
              disabled={totalProjects === 0}
              title={totalProjects === 0 ? 'Tidak ada data untuk diekspor' : 'Ekspor seluruh data ke file Excel CSV'}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/90 border border-slate-700/80 rounded-lg hover:text-white hover:bg-slate-750 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            {/* Add New Project Button */}
            <button
              onClick={onNewProject}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg transition-all shadow-sm shadow-sky-600/30 hover:shadow-sky-600/40 active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Project</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
