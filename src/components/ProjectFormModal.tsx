import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Layers, 
  Building2, 
  Compass, 
  FolderGit2, 
  HardHat,
  FileCheck2,
  Activity,
  AlertCircle,
  GitCommit
} from 'lucide-react';
import { ProjectData, PIC_SECTION_HEAD_OPTIONS } from '../types/project';
import {
  ZONA_OPTIONS,
  TAHUN_OPTIONS,
  APD_RELOKASI_OPTIONS,
  KMZ_RELOKASI_OPTIONS,
  APD_LINKNET_OPTIONS,
  STATUS_SURVEY_OPTIONS,
  BA_SURVEY_OPTIONS,
  SPH_BOQ_OPTIONS,
  STATUS_PENGAJUAN_PROJECT_OPTIONS,
  PLAN_PENGAMBILAN_MATERIAL_OPTIONS,
  STATUS_MATERIAL_LOCATION_OPTIONS,
  STATUS_DOKUMEN_CLOSING_OPTIONS,
  STATUS_AUDIT_OPTIONS,
  STATUS_MATERIAL_OPTIONS,
  STATUS_PULLING_CABLE_FO_OPTIONS,
  STATUS_PULLING_CABLE_COAX_OPTIONS,
  STATUS_CO_OPTIONS,
  LAPORAN_OPNAME_OPTIONS,
  CLOSING_SAP_OPTIONS,
  HH_TYPE_OPTIONS,
  HH_SIZE_OPTIONS,
  POLE_OPTIONS,
  GALVANIS_OPTIONS,
  calculateGalianPercentage,
  calculatePullingPercentage,
  calculatePullingFoPercentage,
  calculatePullingCoaxPercentage,
} from '../data/dropdownOptions';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectData) => void;
  initialData?: ProjectData | null;
  totalProjects: number;
  existingProjects?: ProjectData[];
}

/**
 * Helper to calculate the next sequential PMO-ID based on existing projects.
 * Scans all PMO-IDs (e.g. PMO-GOV-001, PMO-GOV-862) to find the highest number,
 * then returns the next number in sequence (e.g. 863 -> PMO-GOV-863).
 */
export function getNextPmoIdInfo(projects: ProjectData[] = []) {
  let maxPmoNumber = 0;
  for (const p of projects) {
    if (p.pmoId) {
      const match = p.pmoId.match(/PMO-GOV-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxPmoNumber) {
          maxPmoNumber = num;
        }
      }
    }
  }

  const nextNumber = maxPmoNumber > 0 ? maxPmoNumber + 1 : 1;
  const pmoNumberStr = String(nextNumber).padStart(3, '0');
  const pmoId = `PMO-GOV-${pmoNumberStr}`;
  return {
    nextNumber,
    pmoNumberStr,
    pmoId,
    rawPmoId: pmoId
  };
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  totalProjects,
  existingProjects,
}) => {
  const [activeFormTab, setActiveFormTab] = useState<number>(1);
  const [formData, setFormData] = useState<Partial<ProjectData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Initialize or reset form data when opened
  useEffect(() => {
    if (isOpen) {
      setActiveFormTab(1);
      setErrors({});
      setSaveSuccessNotice(false);

      if (initialData) {
        setFormData({ ...initialData });
      } else {
        // Generate new project default template with automatic PMO-ID sequence
        const nextNo = (existingProjects?.length || totalProjects) + 1;
        const initialCategory = 'GOV IPPJU';
        const nextPmo = getNextPmoIdInfo(existingProjects || []);

        setFormData({
          id: `proj-${Date.now()}`,
          no: nextNo,
          pmoId: nextPmo.pmoId,
          projectCategory: initialCategory,
          projectId: '',
          projectDescription: '',
          zona: 'Jabo 1',
          areaKota: 'Central',
          projectStatus: 'Masih Review Dinas',
          quarter: 'Q1-26',
          picSectionHead: 'Mega',
          namaVendor: '',
          dateSuratPerintahRelokasi: '',
          bulan: '',
          tahun: '',
          panjangRelokasi: 0,
          apdRelokasi: '',
          kmzRelokasi: '',
          statusAudit: '',
          apdLinknet: '',
          statusSurvey: '',
          baSurvey: '',
          ceMaterial: '',
          sphBoq: '',
          ceLn: '',
          apdLn: '',
          timelineRelokasi: '',
          tanggalStartProject: '',
          tanggalEndProject: '',
          estimasiPemutusan: '',
          tanggalPemutusan: '',
          remarksPlan: '',
          statusPengajuanProject: 'Not Yet',
          tanggalPengajuanMr: '',
          tanggalPengajuanPo: '',
          statusPengajuanMr: 'N/A',
          statusPengajuanPo: 'N/A',
          mrNumber: '',
          poNumber: '',
          planPengambilanMaterial: 'Not Yet',
          statusMaterialLocation: 'Not Yet',
          pengajuanProjectRemarks: '',
          statusMaterialReturn: '',
          tanggalPlanReturn: '',
          tanggalReturn: '',
          statusDokumenClosing: 'Not Yet',
          closingRemarks: '',
          preProjectRemarks: '',
          remarksProject: '',
          statusConstruction: 'Project Not Started',
          statusLabor: 'N/A',
          statusMaterial: 'Not Yet',
          statusPullingCableFo: 'Not Yet',
          pullingFoPanjangSelesai: 0,
          pullingFoPanjangTotal: 1000,
          pullingCableFoProgress: '0%',
          statusPullingCableCoax: 'Not Yet',
          pullingCoaxPanjangSelesai: 0,
          pullingCoaxPanjangTotal: 1000,
          pullingCableCoaxProgress: '0%',
          statusCo: '',
          statusCoCoax: '',
          laporanOpname: '',
          closingSap: '',
          kebutuhanMaterialPoSap: '',
          galianSipilProgress: '',
          galianAksesProgress: '',
          galianCrossingProgress: '',
          installHhProgress: '',
          installPoleProgress: '',
          pullingCableProgress: '',
          projectSapId: '',
          remarksConstruction: '',
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }, [isOpen, initialData, totalProjects, existingProjects]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ProjectData, value: unknown) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // Auto-compute Galian Sipil Progress if galian parameters or status changed
      if (
        field === 'statusConstruction' ||
        field === 'galianPanjangSelesai' ||
        field === 'galianPanjangTotal' ||
        field === 'panjangRelokasi'
      ) {
        const totalTarget = Number(updated.galianPanjangTotal || updated.panjangRelokasi || 0);
        const doneMeters = Number(updated.galianPanjangSelesai || 0);
        if (totalTarget > 0 && doneMeters > 0) {
          const pct = Math.min(100, Math.round((doneMeters / totalTarget) * 100));
          updated.galianSipilProgress = `${pct}%`;
        } else {
          updated.galianSipilProgress = calculateGalianPercentage(
            updated.statusConstruction || 'Project Not Started',
            updated.galianSipilProgress
          );
        }
      }

      // Auto-compute Pulling Cable Progress from FO & Coax statuses & length
      if (
        field === 'statusPullingCableFo' ||
        field === 'pullingFoPanjangSelesai' ||
        field === 'pullingFoPanjangTotal' ||
        field === 'statusPullingCableCoax' ||
        field === 'pullingCoaxPanjangSelesai' ||
        field === 'pullingCoaxPanjangTotal' ||
        field === 'statusConstruction' ||
        field === 'pullingPanjangSelesai' ||
        field === 'pullingPanjangTotal' ||
        field === 'panjangRelokasi'
      ) {
        const foTotal = Number(updated.pullingFoPanjangTotal || updated.pullingPanjangTotal || updated.panjangRelokasi || 0);
        const foDone = Number(updated.pullingFoPanjangSelesai || 0);

        // Auto compute FO progress
        updated.pullingCableFoProgress = calculatePullingFoPercentage(
          updated.statusPullingCableFo || 'Not Yet',
          foDone,
          foTotal,
          updated.statusConstruction
        );

        const coaxTotal = Number(updated.pullingCoaxPanjangTotal || updated.pullingPanjangTotal || updated.panjangRelokasi || 0);
        const coaxDone = Number(updated.pullingCoaxPanjangSelesai || 0);

        // Auto compute COAX progress
        updated.pullingCableCoaxProgress = calculatePullingCoaxPercentage(
          updated.statusPullingCableCoax || 'Not Yet',
          coaxDone,
          coaxTotal,
          updated.statusConstruction
        );

        // Overall Pulling Cable Progress
        const combinedDone = (foDone > 0 || coaxDone > 0) ? (foDone + coaxDone) : Number(updated.pullingPanjangSelesai || 0);
        const combinedTotal = (foTotal > 0 || coaxTotal > 0) ? (foTotal + coaxTotal) : Number(updated.pullingPanjangTotal || updated.panjangRelokasi || 0);

        if (combinedTotal > 0 && combinedDone > 0) {
          const pct = Math.min(100, Math.round((combinedDone / combinedTotal) * 100));
          updated.pullingCableProgress = `${pct}%`;
        } else {
          updated.pullingCableProgress = calculatePullingPercentage(
            updated.statusPullingCableFo || 'Not Yet',
            updated.statusPullingCableCoax || 'Not Yet',
            updated.statusConstruction
          );
        }
      }

      // Auto-generate installHhProgress label from specifications if edited
      if (field === 'installHhType' || field === 'installHhSize' || field === 'installHhQty') {
        const type = updated.installHhType || 'HH';
        const size = updated.installHhSize || '80x80';
        const qty = updated.installHhQty ? `${updated.installHhQty} Unit` : '';
        if (qty) {
          updated.installHhProgress = `${type} ${size} (${qty})`;
        }
      }

      // Auto-generate installPoleProgress label from pole & galvanis specifications if edited
      if (
        field === 'installPoleType' ||
        field === 'installPoleQty' ||
        field === 'installGalvanisSize' ||
        field === 'installGalvanisLength'
      ) {
        const poleType = updated.installPoleType || 'Tiang 8';
        const poleQty = updated.installPoleQty ? `${updated.installPoleQty} Ea` : '';
        const galvSize = updated.installGalvanisSize || '2"';
        const galvLen = updated.installGalvanisLength ? `${updated.installGalvanisLength}m` : '';
        const parts = [];
        if (poleQty) parts.push(`${poleType} (${poleQty})`);
        if (galvLen) parts.push(`Galv ${galvSize} (${galvLen})`);
        if (parts.length > 0) {
          updated.installPoleProgress = parts.join(' + ');
        }
      }

      return updated;
    });

    // Clear error for field if any
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleValidateAndSave = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.pmoId?.trim()) {
      newErrors.pmoId = 'PMO - ID wajib diisi';
    }
    if (!formData.projectDescription?.trim()) {
      newErrors.projectDescription = 'Deskripsi Project wajib diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setActiveFormTab(1); // Jump to tab 1 where core errors are
      return;
    }

    const payload: ProjectData = {
      ...(formData as ProjectData),
      updatedAt: new Date().toISOString(),
    };

    onSave(payload);
    setSaveSuccessNotice(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialData ? `Edit Project: ${initialData.pmoId}` : 'Tambah Project Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Sistem 5 Tab Sheet Terintegrasi · Simpan otomatis ke database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Connected Form Tabs Selector */}
        <div className="flex border-b border-slate-200 bg-slate-100/80 px-4 pt-2 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveFormTab(1)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeFormTab === 1
                ? 'bg-white text-sky-700 border-sky-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-sky-600" />
            <span>1. Tab Project List</span>
            {errors.pmoId || errors.projectDescription ? (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab(2)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeFormTab === 2
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Tab Construction & Plan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab(3)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeFormTab === 3
                ? 'bg-white text-amber-700 border-amber-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
            <span>3. Tab Status Project</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab(4)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeFormTab === 4
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <HardHat className="w-3.5 h-3.5 text-emerald-600" />
            <span>4. Tab Status Construction</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab(5)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeFormTab === 5
                ? 'bg-white text-purple-700 border-purple-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-purple-600" />
            <span>5. Tab Tracking Pipeline</span>
          </button>
        </div>

        {/* Form Body - Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white space-y-4">
          {/* TAB 1: PROJECT LIST */}
          {activeFormTab === 1 && (
            <div className="space-y-4">
              <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-800">
                Informasi utama identitas project. Kolom ini terhubung langsung dengan Sheet 1 (Project List).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      PMO - ID <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                      Otomatis Terurut
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.pmoId || ''}
                    onChange={(e) => handleChange('pmoId', e.target.value)}
                    placeholder="e.g. PMO-GOV-863"
                    className={`w-full px-3 py-1.5 text-xs rounded-md border font-mono font-medium ${
                      errors.pmoId ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                    } focus:outline-none focus:ring-1 focus:ring-sky-500`}
                  />
                  {errors.pmoId && <p className="text-[11px] text-rose-500 mt-0.5">{errors.pmoId}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Category</label>
                  <select
                    value={formData.projectCategory || 'GOV IPPJU'}
                    onChange={(e) => handleChange('projectCategory', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                  >
                    <option value="GOV IPPJU">GOV IPPJU</option>
                    <option value="GOV APJATEL">GOV APJATEL</option>
                    <option value="GOV SJUT">GOV SJUT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project ID</label>
                  <input
                    type="text"
                    value={formData.projectId || ''}
                    onChange={(e) => handleChange('projectId', e.target.value)}
                    placeholder="e.g. GOV0000747"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.projectDescription || ''}
                  onChange={(e) => handleChange('projectDescription', e.target.value)}
                  placeholder="e.g. [Z1-GOV] IPPJU Ampera Raya"
                  className={`w-full px-3 py-1.5 text-xs rounded-md border ${
                    errors.projectDescription ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  } focus:outline-none focus:ring-1 focus:ring-sky-500`}
                />
                {errors.projectDescription && (
                  <p className="text-[11px] text-rose-500 mt-0.5">{errors.projectDescription}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Zona</label>
                  <select
                    value={formData.zona || 'Jabo 1'}
                    onChange={(e) => handleChange('zona', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                  >
                    {ZONA_OPTIONS.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Area / Kota</label>
                  <select
                    value={formData.areaKota || 'Central'}
                    onChange={(e) => handleChange('areaKota', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Central">Central</option>
                    <option value="West">West</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="North">North</option>
                    <option value="Bogor">Bogor</option>
                    <option value="Tangerang">Tangerang</option>
                    <option value="Bekasi">Bekasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Status</label>
                  <select
                    value={formData.projectStatus || 'Masih Review Dinas'}
                    onChange={(e) => handleChange('projectStatus', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Masih Review Dinas">Masih Review Dinas</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Project Not Started">Project Not Started</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quarter</label>
                  <select
                    value={formData.quarter || 'Q1-26'}
                    onChange={(e) => handleChange('quarter', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                  >
                    <option value="Q1-26">Q1-26</option>
                    <option value="Q2-26">Q2-26</option>
                    <option value="Q3-26">Q3-26</option>
                    <option value="Q4-26">Q4-26</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PIC / Section Head <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.picSectionHead || 'Mega'}
                  onChange={(e) => handleChange('picSectionHead', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white cursor-pointer font-medium"
                >
                  {PIC_SECTION_HEAD_OPTIONS.map((pic) => (
                    <option key={pic} value={pic}>
                      {pic}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: CONSTRUCTION & PLAN */}
          {activeFormTab === 2 && (
            <div className="space-y-4">
              <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-800">
                Detail Perencanaan & Kontraktor (Sheet 2: Construction & Plan).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Vendor</label>
                  <input
                    type="text"
                    value={formData.namaVendor || ''}
                    onChange={(e) => handleChange('namaVendor', e.target.value)}
                    placeholder="e.g. PT.NATAMA, PT.RPA"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date Surat Perintah Relokasi</label>
                  <input
                    type="date"
                    value={formData.dateSuratPerintahRelokasi || ''}
                    onChange={(e) => handleChange('dateSuratPerintahRelokasi', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bulan</label>
                  <select
                    value={formData.bulan || 'November'}
                    onChange={(e) => handleChange('bulan', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun</label>
                  <select
                    value={formData.tahun || '2024'}
                    onChange={(e) => handleChange('tahun', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono cursor-pointer"
                  >
                    {TAHUN_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Panjang Relokasi (meter)</label>
                  <input
                    type="number"
                    value={formData.panjangRelokasi || ''}
                    onChange={(e) => handleChange('panjangRelokasi', e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 10000"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">APD Relokasi</label>
                  <select
                    value={formData.apdRelokasi || 'Belum ada'}
                    onChange={(e) => handleChange('apdRelokasi', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {APD_RELOKASI_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">KMZ Relokasi</label>
                  <select
                    value={formData.kmzRelokasi || 'Belum ada'}
                    onChange={(e) => handleChange('kmzRelokasi', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {KMZ_RELOKASI_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Audit</label>
                  <select
                    value={formData.statusAudit || 'Not Yet'}
                    onChange={(e) => handleChange('statusAudit', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {STATUS_AUDIT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">APD Linknet</label>
                  <select
                    value={formData.apdLinknet || 'Not Yet'}
                    onChange={(e) => handleChange('apdLinknet', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {APD_LINKNET_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Survey</label>
                  <select
                    value={formData.statusSurvey || 'Not Yet'}
                    onChange={(e) => handleChange('statusSurvey', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {STATUS_SURVEY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">BA Survey</label>
                  <select
                    value={formData.baSurvey || 'Not Yet'}
                    onChange={(e) => handleChange('baSurvey', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {BA_SURVEY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SPH / BOQ</label>
                  <select
                    value={formData.sphBoq || 'Not Yet'}
                    onChange={(e) => handleChange('sphBoq', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {SPH_BOQ_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Start Project</label>
                  <input
                    type="date"
                    value={formData.tanggalStartProject || ''}
                    onChange={(e) => handleChange('tanggalStartProject', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal End Project</label>
                  <input
                    type="date"
                    value={formData.tanggalEndProject || ''}
                    onChange={(e) => handleChange('tanggalEndProject', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimasi Pemutusan</label>
                  <input
                    type="date"
                    value={formData.estimasiPemutusan || ''}
                    onChange={(e) => handleChange('estimasiPemutusan', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Pemutusan</label>
                  <input
                    type="date"
                    value={formData.tanggalPemutusan || ''}
                    onChange={(e) => handleChange('tanggalPemutusan', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks (Plan)</label>
                <textarea
                  rows={2}
                  value={formData.remarksPlan || ''}
                  onChange={(e) => handleChange('remarksPlan', e.target.value)}
                  placeholder="Catatan perencanaan, perizinan, vendor..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: STATUS PROJECT */}
          {activeFormTab === 3 && (
            <div className="space-y-4">
              <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-800">
                Pengajuan Project, MR/PO, dan Closing Dokumen (Sheet 3: Status Project).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Pengajuan Project</label>
                  <select
                    value={formData.statusPengajuanProject || 'Not Yet'}
                    onChange={(e) => handleChange('statusPengajuanProject', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {STATUS_PENGAJUAN_PROJECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Pengajuan MR</label>
                  <input
                    type="date"
                    value={formData.tanggalPengajuanMr || ''}
                    onChange={(e) => handleChange('tanggalPengajuanMr', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Pengajuan PO</label>
                  <input
                    type="date"
                    value={formData.tanggalPengajuanPo || ''}
                    onChange={(e) => handleChange('tanggalPengajuanPo', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Pengajuan MR</label>
                  <select
                    value={formData.statusPengajuanMr || 'N/A'}
                    onChange={(e) => handleChange('statusPengajuanMr', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="N/A">N/A</option>
                    <option value="Released">Released</option>
                    <option value="No Need MR">No Need MR</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Pengajuan PO</label>
                  <select
                    value={formData.statusPengajuanPo || 'N/A'}
                    onChange={(e) => handleChange('statusPengajuanPo', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="N/A">N/A</option>
                    <option value="Released">Released</option>
                    <option value="No Need PO">No Need PO</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">MR Number</label>
                  <input
                    type="text"
                    value={formData.mrNumber || ''}
                    onChange={(e) => handleChange('mrNumber', e.target.value)}
                    placeholder="e.g. 99434"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PO Number</label>
                  <input
                    type="text"
                    value={formData.poNumber || ''}
                    onChange={(e) => handleChange('poNumber', e.target.value)}
                    placeholder="e.g. PO-89104"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Pengambilan Material</label>
                  <select
                    value={formData.planPengambilanMaterial || 'Not Yet'}
                    onChange={(e) => handleChange('planPengambilanMaterial', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {PLAN_PENGAMBILAN_MATERIAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Material Location</label>
                  <select
                    value={formData.statusMaterialLocation || 'Not Yet'}
                    onChange={(e) => handleChange('statusMaterialLocation', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {STATUS_MATERIAL_LOCATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Dokumen Closing</label>
                  <select
                    value={formData.statusDokumenClosing || 'Not Yet'}
                    onChange={(e) => handleChange('statusDokumenClosing', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {STATUS_DOKUMEN_CLOSING_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks (Project & Closing)</label>
                <textarea
                  rows={2}
                  value={formData.remarksProject || ''}
                  onChange={(e) => handleChange('remarksProject', e.target.value)}
                  placeholder="Catatan pengajuan project, MR/PO, approval..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: STATUS CONSTRUCTION */}
          {activeFormTab === 4 && (
            <div className="space-y-4">
              <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-800">
                Progress Pelaksanaan Fisik & SAP (Sheet 4: Status Construction).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Construction</label>
                  <select
                    value={formData.statusConstruction || 'Project Not Started'}
                    onChange={(e) => handleChange('statusConstruction', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Project Not Started">Project Not Started</option>
                    <option value="Pulling Cable">Pulling Cable</option>
                    <option value="Project Cancel">Project Cancel</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Material</label>
                  <select
                    value={formData.statusMaterial || 'Not Yet'}
                    onChange={(e) => handleChange('statusMaterial', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {STATUS_MATERIAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Status Pulling FO</label>
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 text-indigo-700 bg-indigo-50 border border-indigo-200 rounded">
                      FO: {formData.pullingCableFoProgress || '0%'}
                    </span>
                  </div>
                  <select
                    value={formData.statusPullingCableFo || 'Not Yet'}
                    onChange={(e) => handleChange('statusPullingCableFo', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                  >
                    {STATUS_PULLING_CABLE_FO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Status Pulling Coax</label>
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 text-purple-700 bg-purple-50 border border-purple-200 rounded">
                      COAX: {formData.pullingCableCoaxProgress || '0%'}
                    </span>
                  </div>
                  <select
                    value={formData.statusPullingCableCoax || 'Not Yet'}
                    onChange={(e) => handleChange('statusPullingCableCoax', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                  >
                    {STATUS_PULLING_CABLE_COAX_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status CO</label>
                  <select
                    value={formData.statusCo || 'Not Yet'}
                    onChange={(e) => handleChange('statusCo', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {STATUS_CO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Laporan Opname</label>
                  <select
                    value={formData.laporanOpname || 'Not Yet'}
                    onChange={(e) => handleChange('laporanOpname', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {LAPORAN_OPNAME_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Closing SAP</label>
                  <select
                    value={formData.closingSap || 'Not Yet'}
                    onChange={(e) => handleChange('closingSap', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {CLOSING_SAP_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project SAP ID</label>
                  <input
                    type="text"
                    value={formData.projectSapId || ''}
                    onChange={(e) => handleChange('projectSapId', e.target.value)}
                    placeholder="e.g. GOV0000747"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Install HH & Pole Progress Configurator */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <HardHat className="w-3.5 h-3.5 text-sky-600" />
                    <span>Spesifikasi Install HH, Pole & Galvanis</span>
                  </h4>
                  <span className="text-[11px] font-mono text-sky-700 font-semibold bg-sky-100/60 px-2 py-0.5 rounded">
                    {formData.installHhProgress || 'Belum dikonfigurasi'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. HH, HB, MH (Unit) */}
                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700">1. HH, HB, MH (Unit)</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={formData.installHhType || 'HH'}
                        onChange={(e) => handleChange('installHhType', e.target.value)}
                        className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        {HH_TYPE_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <select
                        value={formData.installHhSize || '80x80'}
                        onChange={(e) => handleChange('installHhSize', e.target.value)}
                        className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      >
                        {HH_SIZE_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="number"
                        min="0"
                        value={formData.installHhQty || ''}
                        onChange={(e) => handleChange('installHhQty', e.target.value)}
                        placeholder="Jumlah"
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                      />
                      <span className="text-[11px] text-slate-500 font-medium">Unit</span>
                    </div>
                  </div>

                  {/* 2. Pole (Ea) */}
                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700">2. Pole (Ea)</label>
                    <select
                      value={formData.installPoleType || 'Tiang 8'}
                      onChange={(e) => handleChange('installPoleType', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      {POLE_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="number"
                        min="0"
                        value={formData.installPoleQty || ''}
                        onChange={(e) => handleChange('installPoleQty', e.target.value)}
                        placeholder="Jumlah"
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                      />
                      <span className="text-[11px] text-slate-500 font-medium">Ea</span>
                    </div>
                  </div>

                  {/* 3. Galvanis (Meter) */}
                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700">3. Galvanis (meter)</label>
                    <select
                      value={formData.installGalvanisSize || '2"'}
                      onChange={(e) => handleChange('installGalvanisSize', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    >
                      {GALVANIS_OPTIONS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="number"
                        min="0"
                        value={formData.installGalvanisLength || ''}
                        onChange={(e) => handleChange('installGalvanisLength', e.target.value)}
                        placeholder="Panjang"
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                      />
                      <span className="text-[11px] text-slate-500 font-medium">Meter</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Label Ringkasan Install HH</label>
                    <input
                      type="text"
                      value={formData.installHhProgress || ''}
                      onChange={(e) => handleChange('installHhProgress', e.target.value)}
                      placeholder="e.g. HH 80x80 (12 Unit)"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Label Ringkasan Install Pole & Galvanis</label>
                    <input
                      type="text"
                      value={formData.installPoleProgress || ''}
                      onChange={(e) => handleChange('installPoleProgress', e.target.value)}
                      placeholder="e.g. Tiang 8 (10 Ea) + Galv 2 (50m)"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Automatic Progress Calculators (Galian, Pulling Cable Overall, FO, COAX) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Auto Calculated Galian Sipil Progress */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-200/90 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <span>Galian Sipil (Otomatis)</span>
                    </label>
                    <span className="px-2.5 py-0.5 text-xs font-bold font-mono bg-indigo-600 text-white rounded-full">
                      {formData.galianSipilProgress || '0%'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Meter Selesai</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.galianPanjangSelesai || ''}
                        onChange={(e) => handleChange('galianPanjangSelesai', e.target.value)}
                        placeholder="e.g. 800"
                        className="w-full px-2 py-1 text-xs border border-indigo-300 rounded bg-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Target Meter</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.galianPanjangTotal || formData.panjangRelokasi || ''}
                        onChange={(e) => handleChange('galianPanjangTotal', e.target.value)}
                        placeholder="e.g. 1000"
                        className="w-full px-2 py-1 text-xs border border-indigo-300 rounded bg-white font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-indigo-700">
                    Otomatis dari perbandingan meter / status tahapan konstruksi.
                  </p>
                </div>

                {/* Auto Calculated Pulling Cable FO */}
                <div className="p-3 bg-sky-50/70 border border-sky-200/90 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                      <span>Pulling Cable FO (Otomatis)</span>
                    </label>
                    <span className="px-2.5 py-0.5 text-xs font-bold font-mono bg-sky-600 text-white rounded-full">
                      {formData.pullingCableFoProgress || '0%'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-600 block font-medium">Meter Selesai FO</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.pullingFoPanjangSelesai ?? ''}
                        onChange={(e) => handleChange('pullingFoPanjangSelesai', e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-2 py-1 text-xs border border-sky-300 rounded bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-600 block font-medium">Target Meter FO</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.pullingFoPanjangTotal ?? formData.panjangRelokasi ?? ''}
                        onChange={(e) => handleChange('pullingFoPanjangTotal', e.target.value)}
                        placeholder="e.g. 1000"
                        className="w-full px-2 py-1 text-xs border border-sky-300 rounded bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Status FO: <strong className="text-slate-800">{formData.statusPullingCableFo || 'Not Yet'}</strong></span>
                      <span className="font-mono text-[10px] text-sky-800 font-semibold">{formData.pullingCableFoProgress || '0%'}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-0.5">
                      <div
                        className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: formData.pullingCableFoProgress || '0%' }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-sky-700">
                    Otomatis dari perbandingan meter selesai / target meter FO (atau status FO).
                  </p>
                </div>

                {/* Auto Calculated Pulling Cable COAX */}
                <div className="p-3 bg-purple-50/70 border border-purple-200/90 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <span>Pulling Cable COAX (Otomatis)</span>
                    </label>
                    <span className="px-2.5 py-0.5 text-xs font-bold font-mono bg-purple-600 text-white rounded-full">
                      {formData.pullingCableCoaxProgress || '0%'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-600 block font-medium">Meter Selesai COAX</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.pullingCoaxPanjangSelesai ?? ''}
                        onChange={(e) => handleChange('pullingCoaxPanjangSelesai', e.target.value)}
                        placeholder="e.g. 400"
                        className="w-full px-2 py-1 text-xs border border-purple-300 rounded bg-white font-mono focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-600 block font-medium">Target Meter COAX</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.pullingCoaxPanjangTotal ?? formData.panjangRelokasi ?? ''}
                        onChange={(e) => handleChange('pullingCoaxPanjangTotal', e.target.value)}
                        placeholder="e.g. 1000"
                        className="w-full px-2 py-1 text-xs border border-purple-300 rounded bg-white font-mono focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Status COAX: <strong className="text-slate-800">{formData.statusPullingCableCoax || 'Not Yet'}</strong></span>
                      <span className="font-mono text-[10px] text-purple-800 font-semibold">{formData.pullingCableCoaxProgress || '0%'}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-0.5">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: formData.pullingCableCoaxProgress || '0%' }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-purple-700">
                    Otomatis dari perbandingan meter selesai / target meter COAX (atau status COAX).
                  </p>
                </div>
              </div>

              {/* Total Pulling Cable Progress Combined */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-slate-800">Total Pulling Cable Progress (Keseluruhan)</span>
                  <p className="text-[11px] text-slate-500">
                    Kombinasi otomatis progres FO ({formData.pullingCableFoProgress || '0%'}) & COAX ({formData.pullingCableCoaxProgress || '0%'}).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: formData.pullingCableProgress || '0%' }}
                    />
                  </div>
                  <span className="px-3 py-1 text-xs font-bold font-mono bg-emerald-600 text-white rounded-full">
                    {formData.pullingCableProgress || '0%'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks (Construction)</label>
                <textarea
                  rows={2}
                  value={formData.remarksConstruction || ''}
                  onChange={(e) => handleChange('remarksConstruction', e.target.value)}
                  placeholder="Catatan kendala galian, perizinan malam, tim pelaksana..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* TAB 5: PROJECT TRACKING PIPELINE */}
          {activeFormTab === 5 && (
            <div className="space-y-4">
              <div className="bg-purple-50/80 border border-purple-200/80 rounded-lg p-3 text-xs text-purple-900">
                Ringkasan pipeline pelacakan menyeluruh. Kolom ini terhubung langsung dengan Sheet 5 (Project Tracking Pipeline).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Project</label>
                  <input
                    type="date"
                    value={formData.tanggalStartProject || ''}
                    onChange={(e) => handleChange('tanggalStartProject', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Project</label>
                  <input
                    type="date"
                    value={formData.tanggalEndProject || ''}
                    onChange={(e) => handleChange('tanggalEndProject', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Closing SAP</label>
                  <select
                    value={formData.closingSap || 'Not Yet'}
                    onChange={(e) => handleChange('closingSap', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {CLOSING_SAP_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pulling Cable Progress</label>
                  <input
                    type="text"
                    value={formData.pullingCableProgress || ''}
                    onChange={(e) => handleChange('pullingCableProgress', e.target.value)}
                    placeholder="e.g. 75%, Selesai"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Galian Sipil Progress</label>
                  <input
                    type="text"
                    value={formData.galianSipilProgress || ''}
                    onChange={(e) => handleChange('galianSipilProgress', e.target.value)}
                    placeholder="e.g. 50%, Menunggu izin"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Pipeline & Evaluasi</label>
                <textarea
                  rows={2}
                  value={formData.remarksConstruction || ''}
                  onChange={(e) => handleChange('remarksConstruction', e.target.value)}
                  placeholder="Catatan mitigasi risiko, koordinasi antar instansi..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Tab Next / Prev Navigator */}
          <div className="flex items-center gap-1.5">
            {activeFormTab > 1 && (
              <button
                type="button"
                onClick={() => setActiveFormTab((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Tab Sebelumnya</span>
              </button>
            )}

            {activeFormTab < 5 && (
              <button
                type="button"
                onClick={() => setActiveFormTab((prev) => Math.min(5, prev + 1))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>Tab Selanjutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons: Kembali & Simpan */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali / Batal
            </button>

            <button
              type="button"
              onClick={handleValidateAndSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-500 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              {saveSuccessNotice ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
