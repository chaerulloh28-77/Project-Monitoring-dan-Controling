import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Download, 
  Menu,
  Trash2,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  MapPin,
  FileSpreadsheet,
  LogOut
} from 'lucide-react';
import { TabKey, ProjectData } from '../types/project';
import { 
  PicExportScope, 
  filterProjectsByPic, 
  PIC_EXPORT_OPTIONS 
} from '../utils/picScope';

interface HeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onNewProject: () => void;
  onExportCsv?: (scope: PicExportScope) => void;
  onExportExcel?: (scope: PicExportScope) => void;
  projects?: ProjectData[];
  lastSavedTime: string;
  totalProjects: number;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onClearAll?: () => void;
  onRestoreDefaults?: () => void;
  onOpenSecurity?: () => void;
  currentUser?: { email: string; name: string } | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onNewProject,
  onExportCsv,
  onExportExcel,
  projects = [],
  lastSavedTime,
  totalProjects,
  onToggleSidebar,
  isSidebarCollapsed,
  onClearAll,
  onRestoreDefaults,
  onOpenSecurity,
  currentUser,
  onLogout,
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isExportMenuOpen]);

  // Compute live project counts per PIC scope
  const picCounts = useMemo(() => {
    return {
      ALL: projects.length,
      Mega: filterProjectsByPic(projects, 'Mega').length,
      Aris: filterProjectsByPic(projects, 'Aris').length,
      Chaerul: filterProjectsByPic(projects, 'Chaerul').length,
      Daud: filterProjectsByPic(projects, 'Daud').length,
    };
  }, [projects]);

  const handleTriggerExcel = (scope: PicExportScope) => {
    setIsExportMenuOpen(false);
    if (onExportExcel) {
      onExportExcel(scope);
    }
  };

  const handleTriggerCsv = (scope: PicExportScope) => {
    setIsExportMenuOpen(false);
    if (onExportCsv) {
      onExportCsv(scope);
    }
  };
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
              </div>
            </div>
          </div>

          {/* Right: Actions & Status */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

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
                title="Muat ulang data project awal"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-sky-300 bg-sky-950/40 border border-sky-800/60 rounded-lg hover:bg-sky-900/60 hover:text-white transition-all cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Muat Ulang Data Awal</span>
              </button>
            )}

            {/* Export Multi-Sheet Excel & CSV Dropdown (Semua Report & Per PIC Mega, Aris, Chaerul, Daud) */}
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setIsExportMenuOpen((prev) => !prev)}
                disabled={totalProjects === 0}
                title="Pilih opsi export Excel (.xlsx) atau CSV (.csv) untuk Semua PIC atau per PIC Section Head"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-700/70 rounded-lg hover:text-white hover:bg-emerald-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Export Excel / CSV</span>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-400 transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-96 max-w-[95vw] bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/40">
                  <div className="px-4 py-3 bg-slate-950/95 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        Export Report PIC / Section Head
                      </span>
                      <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
                        <span className="text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">.XLSX</span>
                        <span className="text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded border border-sky-500/30">.CSV</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Unduh laporan lengkap seluruh PIC atau per PIC Section Head:
                    </p>
                  </div>

                  <div className="p-2 space-y-1.5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {PIC_EXPORT_OPTIONS.map((opt) => {
                      const count = picCounts[opt.scope] ?? 0;
                      const isAll = opt.scope === 'ALL';

                      return (
                        <div
                          key={opt.scope}
                          className={`w-full p-2.5 rounded-lg border transition-all ${
                            isAll
                              ? 'bg-slate-850/90 hover:bg-slate-800/90 border-emerald-700/50 hover:border-emerald-500/60'
                              : 'bg-slate-850/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                                  isAll
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : opt.scope === 'Mega'
                                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                    : opt.scope === 'Aris'
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : opt.scope === 'Chaerul'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                }`}
                              >
                                {isAll ? 'ALL' : opt.scope.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-white block truncate">
                                  {opt.label}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate block">
                                  {opt.sublabel}
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-800 text-slate-300 rounded border border-slate-700 shrink-0">
                              {count} Proyek
                            </span>
                          </div>

                          {/* Action Buttons: Excel and CSV */}
                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/70">
                            <button
                              type="button"
                              onClick={() => handleTriggerExcel(opt.scope)}
                              disabled={count === 0}
                              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 hover:text-white border border-emerald-700/60 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title={`Unduh ${opt.label} format Excel Multi-Sheet (.xlsx)`}
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                              <span>Excel (.xlsx)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTriggerCsv(opt.scope)}
                              disabled={count === 0}
                              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-sky-300 bg-sky-950/60 hover:bg-sky-900 hover:text-white border border-sky-700/60 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title={`Unduh ${opt.label} format CSV (.csv)`}
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>CSV (.csv)</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-4 py-2 bg-slate-950/95 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Excel Multi-Sheet & CSV UTF-8</span>
                    <span className="text-emerald-400 font-medium">© PAUL Security System</span>
                  </div>
                </div>
              )}
            </div>

            {/* Add New Project Button */}
            <button
              onClick={onNewProject}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg transition-all shadow-sm shadow-sky-600/30 hover:shadow-sky-600/40 active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Project</span>
            </button>

            {/* Logout button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Keluar dari akun (Logout)"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-900/60 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline text-[11px]">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
