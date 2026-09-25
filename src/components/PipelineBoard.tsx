import React, { useState } from 'react';
import { 
  GitCommit, 
  CheckCircle2, 
  Clock, 
  HardHat, 
  Cable, 
  FileCheck2, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  Edit3, 
  MapPin, 
  Layers,
  Building2,
  Calendar,
  XCircle,
  TrendingUp,
  Tag
} from 'lucide-react';
import { ProjectData, TabKey } from '../types/project';

interface PipelineBoardProps {
  projects: ProjectData[];
  onViewDetail: (project: ProjectData) => void;
  onEdit: (project: ProjectData) => void;
  onJumpToTab: (tab: TabKey, project: ProjectData) => void;
  onQuickUpdateStage?: (project: ProjectData, newStage: string) => void;
}

interface StageColumn {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ElementType;
  colorClass: string;
  borderClass: string;
  badgeBg: string;
  filterFn: (p: ProjectData) => boolean;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  projects,
  onViewDetail,
  onEdit,
  onJumpToTab,
}) => {
  // Define pipeline stages
  const stages: StageColumn[] = [
    {
      id: 'stage-review',
      title: '1. Review & Dinas',
      shortDesc: 'Review Dinas, Audit & Survey',
      icon: Clock,
      colorClass: 'text-amber-700',
      borderClass: 'border-amber-300',
      badgeBg: 'bg-amber-100 text-amber-800',
      filterFn: (p) => 
        p.projectStatus === 'Masih Review Dinas' || 
        p.statusSurvey === 'Belum' || 
        p.statusAudit === 'Belum di Audit',
    },
    {
      id: 'stage-procurement',
      title: '2. Procurement & PO',
      shortDesc: 'Pengajuan MR / PO Released',
      icon: FileCheck2,
      colorClass: 'text-sky-700',
      borderClass: 'border-sky-300',
      badgeBg: 'bg-sky-100 text-sky-800',
      filterFn: (p) => 
        (p.statusPengajuanMr === 'Released' || p.statusPengajuanPo === 'Released') && 
        p.statusConstruction === 'Project Not Started' &&
        p.projectStatus !== 'Cancelled',
    },
    {
      id: 'stage-civil',
      title: '3. Civil & Galian',
      shortDesc: 'Galian Sipil & Install HH/Pole',
      icon: HardHat,
      colorClass: 'text-indigo-700',
      borderClass: 'border-indigo-300',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      filterFn: (p) => 
        (Boolean(p.galianSipilProgress && p.galianSipilProgress !== '100%') || 
         Boolean(p.installHhProgress && p.installHhProgress !== 'Done')) &&
        p.statusConstruction !== 'Pulling Cable' &&
        p.projectStatus !== 'Cancelled',
    },
    {
      id: 'stage-pulling',
      title: '4. Pulling Cable FO',
      shortDesc: 'Penarikan Kabel & Splicing',
      icon: Cable,
      colorClass: 'text-purple-700',
      borderClass: 'border-purple-300',
      badgeBg: 'bg-purple-100 text-purple-800',
      filterFn: (p) => 
        p.statusConstruction === 'Pulling Cable' || 
        p.statusPullingCableFo === 'In Progress' ||
        p.statusPullingCableCoax === 'In Progress',
    },
    {
      id: 'stage-closing',
      title: '5. Testing & Closing',
      shortDesc: 'CO, Opname & SAP Closing',
      icon: CheckCircle2,
      colorClass: 'text-emerald-700',
      borderClass: 'border-emerald-300',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      filterFn: (p) => 
        (p.statusCo === 'Done' || p.laporanOpname === 'Submitted' || p.projectStatus === 'Completed') &&
        p.projectStatus !== 'Cancelled',
    },
    {
      id: 'stage-cancelled',
      title: '6. Cancelled / On-Hold',
      shortDesc: 'Project Batal atau Ditangguhkan',
      icon: XCircle,
      colorClass: 'text-rose-700',
      borderClass: 'border-rose-300',
      badgeBg: 'bg-rose-100 text-rose-800',
      filterFn: (p) => 
        p.projectStatus === 'Cancelled' || 
        p.statusConstruction === 'Project Cancel' || 
        p.statusPengajuanProject === 'Project Cancel',
    },
  ];

  // Helper to determine which stage a project belongs to
  const getStageForProject = (project: ProjectData): string => {
    if (project.projectStatus === 'Cancelled' || project.statusConstruction === 'Project Cancel') {
      return 'stage-cancelled';
    }
    if (project.statusCo === 'Done' || project.projectStatus === 'Completed' || project.closingSap === 'Yes') {
      return 'stage-closing';
    }
    if (project.statusConstruction === 'Pulling Cable' || project.statusPullingCableFo === 'In Progress') {
      return 'stage-pulling';
    }
    if (project.galianSipilProgress && project.galianSipilProgress !== '0%') {
      return 'stage-civil';
    }
    if (project.statusPengajuanMr === 'Released' || project.statusPengajuanPo === 'Released') {
      return 'stage-procurement';
    }
    return 'stage-review';
  };

  const getProgressPercentage = (p: ProjectData): number => {
    if (p.projectStatus === 'Cancelled') return 0;
    if (p.projectStatus === 'Completed') return 100;
    if (p.pullingCableProgress) {
      const match = p.pullingCableProgress.match(/\d+/);
      if (match) return Math.min(100, parseInt(match[0], 10));
    }
    if (p.statusConstruction === 'Pulling Cable') return 65;
    if (p.statusPengajuanMr === 'Released') return 35;
    return 15;
  };

  return (
    <div className="space-y-4">
      {/* Pipeline Intro Bar */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-800 to-indigo-900 rounded-xl p-4 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Pipeline Tahapan & Milestone Project
            </h3>
            <p className="text-xs text-slate-300">
              Visualisasi alur terpadu dari pengajuan dinas hingga penarikan kabel dan serah terima dokumen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg border border-white/10 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono">{projects.length} Project Terdistribusi</span>
          </div>
        </div>
      </div>

      {/* 6 Stage Columns Horizon Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {stages.map((stage) => {
          const StageIcon = stage.icon;
          // Filter projects that fall into this stage
          const stageProjects = projects.filter((p) => getStageForProject(p) === stage.id);

          return (
            <div
              key={stage.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col min-h-[480px] overflow-hidden"
            >
              {/* Stage Header */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                    <StageIcon className={`w-3.5 h-3.5 ${stage.colorClass}`} />
                    <span className="truncate">{stage.title}</span>
                  </div>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${stage.badgeBg}`}>
                    {stageProjects.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">{stage.shortDesc}</p>
              </div>

              {/* Cards Container */}
              <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5 custom-scrollbar bg-slate-50/30">
                {stageProjects.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-slate-400">
                    <AlertCircle className="w-5 h-5 text-slate-300 mb-1" />
                    <span className="text-[11px]">Tidak ada project di tahap ini</span>
                  </div>
                ) : (
                  stageProjects.map((p) => {
                    const progressPct = getProgressPercentage(p);

                    return (
                      <div
                        key={p.id}
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs hover:shadow-md hover:border-sky-400 transition-all cursor-pointer group space-y-2.5"
                        onClick={() => onViewDetail(p)}
                      >
                        {/* Header: PMO ID & Category */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-xs font-bold text-sky-700 group-hover:text-sky-800">
                            {p.pmoId}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            p.projectCategory === 'GOV IPPJU'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : p.projectCategory === 'GOV APJATEL'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : p.projectCategory === 'GOV SJUT'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {p.projectCategory || 'GOV IPPJU'}
                          </span>
                        </div>

                        {/* Title / Description */}
                        <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                          {p.projectDescription}
                        </p>

                        {/* Badges: Zona & Quarter */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200/60 font-semibold font-mono">
                            <MapPin className="w-2.5 h-2.5" />
                            {p.zona || 'Jabo 1'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-semibold font-mono">
                            <Calendar className="w-2.5 h-2.5" />
                            {p.quarter || 'Q1-26'}
                          </span>
                          {p.areaKota && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {p.areaKota}
                            </span>
                          )}
                        </div>

                        {/* Vendor & Length */}
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                          <span className="truncate max-w-[110px]" title={p.namaVendor}>
                            {p.namaVendor || 'Belum Vendor'}
                          </span>
                          <span className="font-mono font-medium text-slate-800">
                            {p.panjangRelokasi ? `${Number(p.panjangRelokasi).toLocaleString('id-ID')} m` : '-'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                            <span>Estimasi Progres</span>
                            <span className="font-mono font-semibold">{progressPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                stage.id === 'stage-cancelled'
                                  ? 'bg-rose-400'
                                  : progressPct >= 80
                                  ? 'bg-emerald-500'
                                  : progressPct >= 40
                                  ? 'bg-sky-500'
                                  : 'bg-amber-400'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Action buttons on hover */}
                        <div className="pt-1.5 flex items-center justify-between gap-1 text-[11px]">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(p);
                              }}
                              title="Edit Data Project"
                              className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewDetail(p);
                              }}
                              title="Lihat Detail 4 Sheet"
                              className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onJumpToTab('status-construction', p);
                            }}
                            className="text-[10px] text-sky-600 hover:text-sky-800 flex items-center gap-0.5 font-medium cursor-pointer"
                          >
                            <span>Sheet Fisik</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
