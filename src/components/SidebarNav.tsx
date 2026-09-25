import React from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Building2,
  Clock,
  Layers,
  Database,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { TabKey } from '../types/project';
import { TAB_CONFIG } from '../data/tabColumns';
import { TabVisualIcon } from './TabVisualIcon';

interface SidebarNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  totalProjects: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  totalProjects,
}) => {
  const getTabNumberBadge = (id: TabKey) => {
    switch (id) {
      case 'project-list': return '1';
      case 'construction-plan': return '2';
      case 'status-project': return '3';
      case 'status-construction': return '4';
      case 'project-tracking-pipeline': return '5';
      default: return '•';
    }
  };

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 text-slate-200 transition-all duration-200 flex flex-col shrink-0 select-none z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header Brand (When collapsed/expanded) */}
      <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm ring-1 ring-white/10">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="font-bold text-xs tracking-tight text-white block truncate" title="Project Monitoring dan Controling">
                Project Monitoring
              </span>
              <span className="text-[10px] text-slate-400 block truncate" title="dan Controling">
                dan Controling
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Perlebar Menu Samping' : 'Ciutkan Menu Samping'}
          className={`p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
            isCollapsed ? 'hidden' : 'block'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Group */}
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-1">
        {!isCollapsed && (
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Daftar Sheet & Tab
          </div>
        )}

        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.id;
          const isPipeline = tab.id === 'project-tracking-pipeline';
          const tabNum = getTabNumberBadge(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              title={tab.label}
              className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer relative ${
                isActive
                  ? isPipeline
                    ? 'bg-purple-600/20 text-white border border-purple-500/40 shadow-xs'
                    : 'bg-sky-600/20 text-white border border-sky-500/40 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              {/* Active Indicator Bar on Left */}
              {isActive && (
                <span className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r ${
                  isPipeline ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                }`} />
              )}

              {/* Attractive Colorful Tab Icon */}
              <TabVisualIcon 
                tabKey={tab.id} 
                isActive={isActive} 
                size="md" 
                variant="badge" 
              />

              {/* Label & Details when not collapsed */}
              {!isCollapsed && (
                <div className="flex-1 text-left truncate">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`truncate text-xs ${isActive ? 'font-bold text-white' : 'font-medium text-slate-200'}`}>
                      {tab.label}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                      isActive ? 'bg-white/20 text-white font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tabNum}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {tab.id === 'project-list' && 'Daftar & identitas project'}
                    {tab.id === 'construction-plan' && 'Perencanaan teknis & vendor'}
                    {tab.id === 'status-project' && 'Pengadaan MR/PO & closing'}
                    {tab.id === 'status-construction' && 'Progress galian & kabel FO'}
                    {tab.id === 'project-tracking-pipeline' && 'Kanban alur & milestone'}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Terdata</span>
              </span>
              <span className="font-mono font-bold text-slate-200 tabular-nums">
                {totalProjects} Project
              </span>
            </div>
            <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 text-[10px] text-slate-400">
              <span className="text-emerald-400 font-semibold">● Auto-Save Aktif</span>
              <p className="mt-0.5 text-slate-400 line-clamp-1">Data 5 tab saling terhubung</p>
            </div>
          </div>
        ) : (
          <button
            onClick={onToggleCollapse}
            title="Buka Menu Samping"
            className="w-full flex items-center justify-center p-2 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
