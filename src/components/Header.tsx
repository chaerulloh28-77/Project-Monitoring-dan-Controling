import React from 'react';
import { 
  Building2, 
  Plus, 
  Download, 
  ShieldCheck, 
  Menu
} from 'lucide-react';
import { TabKey } from '../types/project';

interface HeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onNewProject: () => void;
  onOpenRecovery: () => void;
  onExportCsv: () => void;
  lastSavedTime: string;
  totalProjects: number;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onNewProject,
  onOpenRecovery,
  onExportCsv,
  lastSavedTime,
  totalProjects,
  onToggleSidebar,
  isSidebarCollapsed,
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
                  Telecom Relocation Ops
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

          {/* Right: Actions & Status (Symmetrical height and padding) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Auto-save status badge */}
            <div 
              onClick={onOpenRecovery}
              title="Sistem menyimpan otomatis setiap perubahan. Klik untuk melihat riwayat cadangan."
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition-all"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] text-slate-300">
                Tersimpan {lastSavedTime ? new Date(lastSavedTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Auto'}
              </span>
            </div>

            {/* Recovery / Disaster Protection Button */}
            <button
              onClick={onOpenRecovery}
              title="Pemulihan Data & Cadangan Sistem"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/90 border border-slate-700/80 rounded-lg hover:text-white hover:bg-slate-750 hover:border-slate-600 transition-all cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span className="hidden xl:inline">Cadangan & Pulihkan</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={onExportCsv}
              title="Ekspor seluruh data ke file Excel CSV"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/90 border border-slate-700/80 rounded-lg hover:text-white hover:bg-slate-750 hover:border-slate-600 transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            {/* Add New Project Button (Prominent CTA) */}
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
