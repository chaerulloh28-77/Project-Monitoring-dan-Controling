import React from 'react';
import { 
  X, 
  Edit3, 
  ExternalLink, 
  Layers, 
  Building2, 
  Calendar, 
  HardHat, 
  FileCheck2, 
  Activity,
  Ruler,
  Clock,
  ArrowRight,
  GitCommit
} from 'lucide-react';
import { ProjectData, TabKey } from '../types/project';
import { TabVisualIcon } from './TabVisualIcon';

interface ProjectDetailDrawerProps {
  project: ProjectData | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (project: ProjectData) => void;
  onJumpToTab: (tab: TabKey, project: ProjectData) => void;
}

export const ProjectDetailDrawer: React.FC<ProjectDetailDrawerProps> = ({
  project,
  isOpen,
  onClose,
  onEdit,
  onJumpToTab,
}) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-sky-400">{project.pmoId}</span>
                  {project.projectId && (
                    <span className="text-xs text-slate-400 font-mono">({project.projectId})</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white truncate max-w-md">
                  {project.projectDescription}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onEdit(project)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Jump Buttons Across 4 Tabs */}
          <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs">
            <span className="text-slate-500 font-medium text-[11px] whitespace-nowrap">Loncat ke Tab:</span>
            <button
              onClick={() => {
                onJumpToTab('project-list', project);
                onClose();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 font-medium cursor-pointer whitespace-nowrap"
            >
              <TabVisualIcon tabKey="project-list" size="sm" variant="badge" />
              <span>1. Project List</span>
            </button>
            <button
              onClick={() => {
                onJumpToTab('construction-plan', project);
                onClose();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 font-medium cursor-pointer whitespace-nowrap"
            >
              <TabVisualIcon tabKey="construction-plan" size="sm" variant="badge" />
              <span>2. Construction & Plan</span>
            </button>
            <button
              onClick={() => {
                onJumpToTab('status-project', project);
                onClose();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 font-medium cursor-pointer whitespace-nowrap"
            >
              <TabVisualIcon tabKey="status-project" size="sm" variant="badge" />
              <span>3. Status Project</span>
            </button>
            <button
              onClick={() => {
                onJumpToTab('status-construction', project);
                onClose();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 font-medium cursor-pointer whitespace-nowrap"
            >
              <TabVisualIcon tabKey="status-construction" size="sm" variant="badge" />
              <span>4. Status Construction</span>
            </button>
            <button
              onClick={() => {
                onJumpToTab('project-tracking-pipeline', project);
                onClose();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-purple-200 rounded text-purple-700 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300 font-semibold cursor-pointer whitespace-nowrap"
            >
              <TabVisualIcon tabKey="project-tracking-pipeline" size="sm" variant="badge" />
              <span>5. Tracking Pipeline</span>
            </button>
          </div>

          {/* Drawer Body - Interconnected Tab Cards */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5 bg-slate-50/50">
            {/* 1. Tab Sheet 1: Project List Summary */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sky-800 font-semibold text-xs">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>Sheet 1: Project List (Informasi Umum)</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium border border-sky-200">
                  {project.projectStatus || 'Review Dinas'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Kategori</span>
                  <span className="font-medium text-slate-800">{project.projectCategory || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Zona / Area</span>
                  <span className="font-medium text-slate-800">{project.zona || '-'} / {project.areaKota || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Quarter</span>
                  <span className="font-medium text-slate-800">{project.quarter || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">PIC / Section Head</span>
                  <span className="font-medium text-slate-800">{project.picSectionHead || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Project SAP ID</span>
                  <span className="font-mono text-slate-800">{project.projectSapId || project.projectId || '-'}</span>
                </div>
              </div>
            </div>

            {/* 2. Tab Sheet 2: Construction & Plan */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-blue-800 font-semibold text-xs">
                  <HardHat className="w-4 h-4 text-blue-600" />
                  <span>Sheet 2: Construction & Plan (Perencanaan & Vendor)</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {project.bulan || project.tahun ? `${project.bulan} ${project.tahun}`.trim() : '-'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nama Vendor</span>
                  <span className="font-medium text-slate-800">{project.namaVendor || 'Belum Ada'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Date SP Relokasi</span>
                  <span className="font-mono text-slate-800">{project.dateSuratPerintahRelokasi || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Panjang Relokasi</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {project.panjangRelokasi ? `${Number(project.panjangRelokasi).toLocaleString('id-ID')} m` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status APD & KMZ</span>
                  <span className="text-slate-800">APD: {project.apdRelokasi || '-'} | KMZ: {project.kmzRelokasi || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status Audit & Survey</span>
                  <span className="text-slate-800">{project.statusAudit || '-'} / {project.statusSurvey || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">BA Survey & BOQ</span>
                  <span className="text-slate-800">{project.baSurvey || '-'} | {project.sphBoq || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Start & End Project</span>
                  <span className="font-mono text-slate-800">
                    {project.tanggalStartProject || '-'} s/d {project.tanggalEndProject || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Estimasi & Tgl Pemutusan</span>
                  <span className="font-mono text-slate-800">
                    {project.estimasiPemutusan || project.tanggalPemutusan || '-'}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-400 block text-[11px]">Remarks Plan</span>
                  <p className="text-slate-700 italic bg-slate-50 p-2 rounded text-[11px]">
                    {project.remarksPlan || 'Tidak ada catatan tambahan'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Tab Sheet 3: Status Project */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-indigo-800 font-semibold text-xs">
                  <FileCheck2 className="w-4 h-4 text-indigo-600" />
                  <span>Sheet 3: Status Project (Pengajuan MR/PO & Closing)</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                  {project.statusPengajuanProject || 'Normal'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Status Pengajuan MR</span>
                  <span className="font-medium text-slate-800">{project.statusPengajuanMr || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status Pengajuan PO</span>
                  <span className="font-medium text-slate-800">{project.statusPengajuanPo || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">MR / PO Number</span>
                  <span className="font-mono text-slate-800">MR: {project.mrNumber || '-'} | PO: {project.poNumber || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pengambilan Material</span>
                  <span className="text-slate-800">{project.planPengambilanMaterial || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Lokasi Material</span>
                  <span className="text-slate-800">{project.statusMaterialLocation || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Dokumen Closing</span>
                  <span className="text-slate-800">{project.statusDokumenClosing || '-'}</span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-400 block text-[11px]">Project Remarks</span>
                  <p className="text-slate-700 italic bg-slate-50 p-2 rounded text-[11px]">
                    {project.remarksProject || project.pengajuanProjectRemarks || 'Tidak ada catatan'}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Tab Sheet 4: Status Construction */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Sheet 4: Status Construction (Progress Fisik Lapangan)</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                  {project.statusConstruction || 'Not Started'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Pulling FO (Otomatis)</span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    <span>{project.statusPullingCableFo || 'Not Yet'}</span>
                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-1 rounded border border-sky-200">
                      {project.pullingCableFoProgress || (project.statusPullingCableFo === 'Done' ? '100%' : project.statusPullingCableFo === 'In Progress' ? '50%' : '0%')}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pulling COAX (Otomatis)</span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    <span>{project.statusPullingCableCoax || 'Not Yet'}</span>
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1 rounded border border-purple-200">
                      {project.pullingCableCoaxProgress || (project.statusPullingCableCoax === 'Done' ? '100%' : project.statusPullingCableCoax === 'In Progress' ? '50%' : '0%')}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status CO / CO Coax</span>
                  <span className="font-medium text-slate-800">{project.statusCo || '-'} / {project.statusCoCoax || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Galian Sipil Progress</span>
                  <span className="font-medium text-slate-800">{project.galianSipilProgress || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Install HH / Pole</span>
                  <span className="font-medium text-slate-800">{project.installHhProgress || '-'} | {project.installPoleProgress || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Laporan Opname & SAP</span>
                  <span className="text-slate-800">{project.laporanOpname || '-'} | Closing: {project.closingSap || '-'}</span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-400 block text-[11px]">Catatan Konstruksi</span>
                  <p className="text-slate-700 italic bg-slate-50 p-2 rounded text-[11px]">
                    {project.remarksConstruction || 'Tidak ada catatan konstruksi'}
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Tab Sheet 5: Project Tracking Pipeline Summary */}
            <div className="bg-white rounded-lg border border-purple-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-purple-100">
                <div className="flex items-center gap-2 text-purple-900 font-semibold text-xs">
                  <GitCommit className="w-4 h-4 text-purple-600" />
                  <span>Sheet 5: Project Tracking Pipeline (Pelacakan Menyeluruh)</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                  {project.projectStatus || 'In Progress'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Start Project</span>
                  <span className="font-medium text-slate-800">{project.tanggalStartProject || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal End Project</span>
                  <span className="font-medium text-slate-800">{project.tanggalEndProject || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status Pengajuan PO/MR</span>
                  <span className="font-semibold text-indigo-700">MR: {project.statusPengajuanMr || '-'} | PO: {project.statusPengajuanPo || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pulling Cable Progress</span>
                  <span className="font-medium text-slate-800">{project.pullingCableProgress || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Galian Sipil Progress</span>
                  <span className="font-medium text-slate-800">{project.galianSipilProgress || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Closing SAP</span>
                  <span className="font-medium text-slate-800">{project.closingSap || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Terakhir diperbarui: {new Date(project.updatedAt || Date.now()).toLocaleString('id-ID')}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
