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
  User,
  LogOut
} from 'lucide-react';
import { TabKey, ProjectData } from '../types/project';
import { TAB_CONFIG } from '../data/tabColumns';
import { TabVisualIcon } from './TabVisualIcon';
import { 
  isProjectInJabo1, 
  isProjectInJabo2, 
  isProjectInJabo3,
  JaboExportScope 
} from '../utils/jaboScope';

interface HeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onNewProject: () => void;
  onExportCsv?: () => void;
  onExportExcel?: (zonaFilter: 'ALL' | 'Jabo 1' | 'Jabo 2' | 'Jabo 3') => void;
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

  // Compute live project counts per scope
  const jabo1Count = useMemo(() => projects.filter(isProjectInJabo1).length, [projects]);
  const jabo2Count = useMemo(() => projects.filter(isProjectInJabo2).length, [projects]);
  const jabo3Count = useMemo(() => projects.filter(isProjectInJabo3).length, [projects]);

  const handleTriggerExport = (zona: JaboExportScope) => {
    setIsExportMenuOpen(false);
    if (onExportExcel) {
      onExportExcel(zona);
    } else if (onExportCsv) {
      onExportCsv();
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
                <span className="text-slate-600 text-xs hidden sm:inline">•</span>
                <p className="text-xs text-emerald-400 font-medium hidden sm:inline flex items-center gap-1">
                  Cloud Firestore Real-Time
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions & Status */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Cloud Firestore Live Sync status badge */}
            <div 
              title="Sistem menyimpan dan menyinkronkan otomatis setiap perubahan data dengan Cloud Firestore."
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] text-slate-300">
                Firestore {lastSavedTime ? new Date(lastSavedTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Live'}
              </span>
            </div>

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

            {/* Export Multi-Sheet Excel Dropdown (All or per Jabo 1, Jabo 2, Jabo 3) */}
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setIsExportMenuOpen((prev) => !prev)}
                disabled={totalProjects === 0}
                title="Pilih opsi export Excel 4 Sheet (Semua Report atau per Jabo 1, Jabo 2, Jabo 3)"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-700/60 rounded-lg hover:text-white hover:bg-emerald-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Export Excel</span>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-400 transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/40">
                  <div className="px-3.5 py-2.5 bg-slate-950/90 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                        Export Excel (4 Sheet)
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        .XLSX
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Pilih cakupan data untuk diekspor ke file Excel:
                    </p>
                  </div>

                  <div className="p-1.5 space-y-1">
                    {/* Option 1: Semua Report */}
                    <button
                      type="button"
                      onClick={() => handleTriggerExport('ALL')}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg hover:bg-emerald-950/50 hover:border-emerald-800/60 border border-transparent text-slate-200 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white block group-hover:text-emerald-300 transition-colors">
                            Semua Report (Semua Zona)
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            Jabo 1, Jabo 2, Jabo 3 • 4 Sheet
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-800 group-hover:bg-emerald-900/60 text-slate-300 group-hover:text-emerald-200 rounded border border-slate-700 group-hover:border-emerald-700/60 shrink-0 ml-2">
                        {totalProjects}
                      </span>
                    </button>

                    <div className="h-px bg-slate-800/80 my-1 mx-2" />

                    {/* Option 2: Jabo 1 */}
                    <button
                      type="button"
                      onClick={() => handleTriggerExport('Jabo 1')}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg hover:bg-sky-950/50 hover:border-sky-800/60 border border-transparent text-slate-200 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-sky-200 block group-hover:text-sky-100 transition-colors">
                            Report Khusus Jabo 1
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            Area Central & West
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-sky-950 group-hover:bg-sky-900/60 text-sky-300 rounded border border-sky-800/60 shrink-0 ml-2">
                        {jabo1Count}
                      </span>
                    </button>

                    {/* Option 3: Jabo 2 */}
                    <button
                      type="button"
                      onClick={() => handleTriggerExport('Jabo 2')}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg hover:bg-purple-950/50 hover:border-purple-800/60 border border-transparent text-slate-200 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-purple-200 block group-hover:text-purple-100 transition-colors">
                            Report Khusus Jabo 2
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            Area South, Tangsel, Banten, Depok, Bogor (Jaktim & Jaksel PIC Aris/Chaerul)
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-purple-950 group-hover:bg-purple-900/60 text-purple-300 rounded border border-purple-800/60 shrink-0 ml-2">
                        {jabo2Count}
                      </span>
                    </button>

                    {/* Option 4: Jabo 3 */}
                    <button
                      type="button"
                      onClick={() => handleTriggerExport('Jabo 3')}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg hover:bg-amber-950/50 hover:border-amber-800/60 border border-transparent text-slate-200 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-amber-200 block group-hover:text-amber-100 transition-colors">
                            Report Khusus Jabo 3
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            Area NE, Bekasi, Karawang
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-amber-950 group-hover:bg-amber-900/60 text-amber-300 rounded border border-amber-800/60 shrink-0 ml-2">
                        {jabo3Count}
                      </span>
                    </button>
                  </div>

                  <div className="px-3.5 py-2 bg-slate-950/90 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>1 File berisi 4 Sheet terstruktur</span>
                    <span className="text-emerald-400 font-medium">© PAUL Security</span>
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

            {/* Current Logged-in User Profile & Logout */}
            {currentUser && (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-700/80">
                <div 
                  title={`Petugas: ${currentUser.name} (${currentUser.email})`}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200"
                >
                  <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <User className="w-3 h-3" />
                  </div>
                  <span className="font-medium truncate max-w-[120px] text-[11px] text-slate-300">
                    {currentUser.name}
                  </span>
                </div>

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
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Interactive Tab Bar: 1. Project List, 2. Construction & Plan, 3. Status Project, 4. Status Construction, etc. */}
      <div className="border-t border-slate-800/90 bg-slate-950/80 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center overflow-x-auto custom-scrollbar gap-1.5 py-1.5 max-w-[1600px] mx-auto">
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                title={tab.description}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white border border-sky-500/60 shadow-xs font-semibold ring-1 ring-sky-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <TabVisualIcon tabKey={tab.id} isActive={isActive} size="sm" variant="badge" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
