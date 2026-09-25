import React from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Ruler, 
  Eye, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  HardHat, 
  Clock, 
  FileCheck2, 
  CheckCircle2, 
  Cable,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { ProjectData, TabKey } from '../types/project';
import { TabVisualIcon } from './TabVisualIcon';

interface ProjectCardGridProps {
  data: ProjectData[];
  activeTab: TabKey;
  onEdit: (project: ProjectData) => void;
  onDelete: (project: ProjectData) => void;
  onViewDetail: (project: ProjectData) => void;
  onJumpToTab: (tab: TabKey, project: ProjectData) => void;
}

export const ProjectCardGrid: React.FC<ProjectCardGridProps> = ({
  data,
  activeTab,
  onEdit,
  onDelete,
  onViewDetail,
  onJumpToTab,
}) => {
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-card-menu]')) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId) {
      document.addEventListener('click', handleDocClick);
    }
    return () => {
      document.removeEventListener('click', handleDocClick);
    };
  }, [activeMenuId]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Tidak ada project ditemukan</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Tidak ada data project yang sesuai dengan filter. Silakan reset filter untuk melihat data.
        </p>
      </div>
    );
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'In Progress':
      case 'Pulling Cable':
      case 'Released':
      case 'Approved':
      case 'Done':
      case 'Sudah Audit':
      case 'Sudah BA':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200/80';
      case 'Masih Review Dinas':
      case 'Not Yet':
      case 'Belum':
      case 'Belum di Audit':
      case 'Drafting':
        return 'text-amber-700 bg-amber-50 border-amber-200/80';
      case 'Cancelled':
      case 'Project Cancel':
      case 'No Need MR':
      case 'No Need PO':
        return 'text-rose-700 bg-rose-50 border-rose-200/80';
      case 'Project Not Started':
        return 'text-slate-600 bg-slate-100 border-slate-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {data.map((proj) => {
        const isMenuOpen = activeMenuId === proj.id;
        const lengthNum = Number(proj.panjangRelokasi) || 0;

        return (
          <div
            key={proj.id}
            onClick={() => onViewDetail(proj)}
            className="group bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-sky-400 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer relative"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/70">
                    {proj.pmoId}
                  </span>
                  {proj.quarter && proj.quarter !== '-' && (
                    <span className="font-mono text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {proj.quarter}
                    </span>
                  )}
                </div>

                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(proj.projectStatus)}`}>
                  {proj.projectStatus || 'Active'}
                </span>
              </div>

              {/* Title & Category */}
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
                {proj.projectDescription}
              </h3>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
                  {proj.projectCategory}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ID: {proj.projectId || '-'}
                </span>
              </div>
            </div>

            {/* Card Body - Key Attributes */}
            <div className="p-4 space-y-2.5 text-xs text-slate-600 flex-1">
              {/* Location & Zone */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Area / Zona:</span>
                </span>
                <span className="font-medium text-slate-800">
                  {proj.areaKota || '-'} ({proj.zona || '-'})
                </span>
              </div>

              {/* Vendor */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <HardHat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Vendor Pelaksana:</span>
                </span>
                <span className="font-semibold text-slate-800 max-w-[170px] truncate text-right">
                  {proj.namaVendor || '-'}
                </span>
              </div>

              {/* Length FO */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Ruler className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Panjang Relokasi:</span>
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {lengthNum > 0 ? `${lengthNum.toLocaleString('id-ID')} m` : '-'}
                </span>
              </div>

              {/* Section-Specific Status Highlight */}
              {activeTab === 'construction-plan' && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Status Audit / BA:</span>
                  <span className="font-medium text-slate-800">
                    {proj.statusAudit} · {proj.baSurvey}
                  </span>
                </div>
              )}

              {activeTab === 'status-project' && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">MR / PO:</span>
                  <span className="font-mono text-indigo-700 font-semibold">
                    MR: {proj.statusPengajuanMr} | PO: {proj.statusPengajuanPo}
                  </span>
                </div>
              )}

              {activeTab === 'status-construction' && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Pulling Cable FO:</span>
                  <span className="font-semibold text-purple-700">
                    {proj.statusPullingCableFo || 'Not Started'}
                  </span>
                </div>
              )}

              {/* PIC Section Head */}
              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>PIC Head:</span>
                </span>
                <span className="text-[11px] font-medium text-slate-700">
                  {proj.picSectionHead || '-'}
                </span>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onViewDetail(proj)}
                  title="Lihat Detail Lengkap 5 Sheet"
                  className="p-1.5 rounded-md text-slate-500 hover:text-sky-600 hover:bg-sky-100/60 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(proj)}
                  title="Edit Data Project"
                  className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-amber-100/60 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(proj)}
                  title="Hapus Project"
                  className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-100/60 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Cross-Tab Jump Navigator Menu */}
              <div className="relative" data-card-menu>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(isMenuOpen ? null : proj.id);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-sky-700 bg-white border border-slate-200 rounded-md hover:border-sky-300 transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Buka Sheet</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>

                {isMenuOpen && (
                  <div 
                    onMouseLeave={() => setActiveMenuId(null)}
                    className="absolute right-0 bottom-full mb-1.5 z-50 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 text-left animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Buka di Tab Lain
                    </div>
                    <button
                      onClick={() => {
                        onJumpToTab('project-list', proj);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 cursor-pointer"
                    >
                      <TabVisualIcon tabKey="project-list" size="sm" variant="badge" />
                      <span>Tab 1. Project List</span>
                    </button>
                    <button
                      onClick={() => {
                        onJumpToTab('construction-plan', proj);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 cursor-pointer"
                    >
                      <TabVisualIcon tabKey="construction-plan" size="sm" variant="badge" />
                      <span>Tab 2. Construction & Plan</span>
                    </button>
                    <button
                      onClick={() => {
                        onJumpToTab('status-project', proj);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 cursor-pointer"
                    >
                      <TabVisualIcon tabKey="status-project" size="sm" variant="badge" />
                      <span>Tab 3. Status Project</span>
                    </button>
                    <button
                      onClick={() => {
                        onJumpToTab('status-construction', proj);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 cursor-pointer"
                    >
                      <TabVisualIcon tabKey="status-construction" size="sm" variant="badge" />
                      <span>Tab 4. Status Construction</span>
                    </button>
                    <button
                      onClick={() => {
                        onJumpToTab('project-tracking-pipeline', proj);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 cursor-pointer"
                    >
                      <TabVisualIcon tabKey="project-tracking-pipeline" size="sm" variant="badge" />
                      <span>Tab 5. Tracking Pipeline</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
