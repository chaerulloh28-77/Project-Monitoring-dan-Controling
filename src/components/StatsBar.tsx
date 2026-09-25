import React from 'react';
import { 
  FolderKanban, 
  Clock, 
  HardHat, 
  Ruler, 
  FileCheck2, 
  Cable,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ProjectData } from '../types/project';

interface StatsBarProps {
  projects: ProjectData[];
  onQuickFilter: (key: string, value: string) => void;
  activeFilterValue?: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ projects, onQuickFilter, activeFilterValue }) => {
  // Aggregate KPI stats across the projects
  const totalCount = projects.length;
  
  const inProgressCount = projects.filter(
    (p) => p.projectStatus === 'In Progress' || p.statusConstruction === 'Pulling Cable'
  ).length;

  const reviewDinasCount = projects.filter(
    (p) => p.projectStatus === 'Masih Review Dinas'
  ).length;

  const totalLengthMeters = projects.reduce((acc, curr) => {
    const num = Number(curr.panjangRelokasi) || 0;
    return acc + num;
  }, 0);

  const poReleasedCount = projects.filter(
    (p) => p.statusPengajuanMr === 'Released' || p.statusPengajuanPo === 'Released'
  ).length;

  const pullingCableActive = projects.filter(
    (p) => p.statusPullingCableFo === 'In Progress' || p.statusPullingCableCoax === 'In Progress' || p.statusConstruction === 'Pulling Cable'
  ).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {/* 1. Total Project */}
      <div 
        onClick={() => onQuickFilter('all', '')}
        className={`group bg-white rounded-xl p-3.5 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[84px] ${
          !activeFilterValue 
            ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-xs bg-gradient-to-b from-sky-50/50 to-white' 
            : 'border-slate-200/90 hover:border-sky-300'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">Total Project</span>
          <div className="w-6 h-6 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <FolderKanban className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">{totalCount}</span>
          <span className="text-[11px] font-medium text-slate-400">paket total</span>
        </div>
      </div>

      {/* 2. Total Relokasi (Sebelah Total Project) */}
      <div 
        onClick={() => onQuickFilter('panjangRelokasi', 'Has Length')}
        className={`group bg-white rounded-xl p-3.5 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[84px] ${
          activeFilterValue === 'Has Length' 
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs bg-gradient-to-b from-blue-50/50 to-white' 
            : 'border-slate-200/90 hover:border-blue-300'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">Total Relokasi</span>
          <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Ruler className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {totalLengthMeters.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] font-medium text-slate-400">meter FO</span>
        </div>
      </div>

      {/* 3. Review Dinas */}
      <div 
        onClick={() => onQuickFilter('projectStatus', 'Masih Review Dinas')}
        className={`group bg-white rounded-xl p-3.5 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[84px] ${
          activeFilterValue === 'Masih Review Dinas' 
            ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs bg-gradient-to-b from-amber-50/50 to-white' 
            : 'border-slate-200/90 hover:border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">Review Dinas</span>
          <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono tabular-nums text-amber-600 tracking-tight">{reviewDinasCount}</span>
          <span className="text-[11px] font-medium text-amber-600/80">tertahan</span>
        </div>
      </div>

      {/* 4. In Progress */}
      <div 
        onClick={() => onQuickFilter('projectStatus', 'In Progress')}
        className={`group bg-white rounded-xl p-3.5 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[84px] ${
          activeFilterValue === 'In Progress' 
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs bg-gradient-to-b from-emerald-50/50 to-white' 
            : 'border-slate-200/90 hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">Konstruksi</span>
          <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <HardHat className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 tracking-tight">{inProgressCount}</span>
          <span className="text-[11px] font-medium text-emerald-600/80">aktif</span>
        </div>
      </div>

      {/* 5. PO / MR Released */}
      <div 
        onClick={() => onQuickFilter('statusPengajuanMr', 'PO Released')}
        className={`group bg-white rounded-xl p-3.5 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[84px] ${
          activeFilterValue === 'PO Released' 
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs bg-gradient-to-b from-indigo-50/50 to-white' 
            : 'border-slate-200/90 hover:border-indigo-300'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">MR/PO Approved</span>
          <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <FileCheck2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono tabular-nums text-indigo-600 tracking-tight">{poReleasedCount}</span>
          <span className="text-[11px] font-medium text-indigo-600/80">disetujui</span>
        </div>
      </div>

      {/* 6. Pulling Cable Progress */}
      <div 
        onClick={() => onQuickFilter('statusPullingCableFo', 'Pulling Cable')}
        className={`group bg-white rounded-xl p-3.5 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[84px] ${
          activeFilterValue === 'Pulling Cable' 
            ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-xs bg-gradient-to-b from-purple-50/50 to-white' 
            : 'border-slate-200/90 hover:border-purple-300'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">Pulling Cable</span>
          <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Cable className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono tabular-nums text-purple-600 tracking-tight">{pullingCableActive}</span>
          <span className="text-[11px] font-medium text-purple-600/80">lokasi FO</span>
        </div>
      </div>
    </div>
  );
};
