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

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectData) => void;
  initialData?: ProjectData | null;
  totalProjects: number;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  totalProjects,
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
        // Generate new project default template
        const nextNo = totalProjects + 1;
        const pmoNumber = String(nextNo).padStart(3, '0');
        setFormData({
          id: `proj-${Date.now()}`,
          no: nextNo,
          pmoId: `PMO-GOV-${pmoNumber}`,
          projectCategory: 'GOV IPPJU',
          projectId: '',
          projectDescription: '',
          zona: 'Jabo 1',
          areaKota: 'Central',
          projectStatus: 'Masih Review Dinas',
          quarter: 'Q1-26',
          picSectionHead: 'Mega',
          namaVendor: 'Belum Ada Vendor',
          dateSuratPerintahRelokasi: '',
          bulan: 'November',
          tahun: '2024',
          panjangRelokasi: 1000,
          apdRelokasi: 'Belum',
          kmzRelokasi: 'Belum',
          statusAudit: 'Belum',
          apdLinknet: 'Not Yet',
          statusSurvey: 'Belum',
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
          statusPengajuanProject: '',
          tanggalPengajuanMr: '',
          tanggalPengajuanPo: '',
          statusPengajuanMr: 'N/A',
          statusPengajuanPo: 'N/A',
          mrNumber: '',
          poNumber: '',
          planPengambilanMaterial: '',
          statusMaterialLocation: '',
          pengajuanProjectRemarks: '',
          statusMaterialReturn: '',
          tanggalPlanReturn: '',
          tanggalReturn: '',
          statusDokumenClosing: '',
          closingRemarks: '',
          preProjectRemarks: '',
          remarksProject: '',
          statusConstruction: 'Project Not Started',
          statusLabor: 'N/A',
          statusMaterial: 'N/A',
          statusPullingCableFo: '',
          statusPullingCableCoax: '',
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
  }, [isOpen, initialData, totalProjects]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ProjectData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PMO - ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pmoId || ''}
                    onChange={(e) => handleChange('pmoId', e.target.value)}
                    placeholder="e.g. PMO-GOV-001"
                    className={`w-full px-3 py-1.5 text-xs rounded-md border font-mono ${
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
                    <option value="Jabo 1">Jabo 1</option>
                    <option value="Jabo 2">Jabo 2</option>
                    <option value="Jabo 3">Jabo 3 / Jobo 3</option>
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
                  <input
                    type="text"
                    value={formData.tahun || '2024'}
                    onChange={(e) => handleChange('tahun', e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
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
                  <input
                    type="text"
                    value={formData.apdRelokasi || ''}
                    onChange={(e) => handleChange('apdRelokasi', e.target.value)}
                    placeholder="e.g. Belum, Sudah"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">KMZ Relokasi</label>
                  <input
                    type="text"
                    value={formData.kmzRelokasi || ''}
                    onChange={(e) => handleChange('kmzRelokasi', e.target.value)}
                    placeholder="e.g. Belum, Ada"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Audit</label>
                  <input
                    type="text"
                    value={formData.statusAudit || ''}
                    onChange={(e) => handleChange('statusAudit', e.target.value)}
                    placeholder="e.g. Belum, Belum di Audit"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">APD Linknet</label>
                  <input
                    type="text"
                    value={formData.apdLinknet || ''}
                    onChange={(e) => handleChange('apdLinknet', e.target.value)}
                    placeholder="e.g. Not Yet, Done"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Survey</label>
                  <input
                    type="text"
                    value={formData.statusSurvey || ''}
                    onChange={(e) => handleChange('statusSurvey', e.target.value)}
                    placeholder="e.g. Belum, Selesai"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">BA Survey</label>
                  <input
                    type="text"
                    value={formData.baSurvey || ''}
                    onChange={(e) => handleChange('baSurvey', e.target.value)}
                    placeholder="e.g. Belum ada BA, Sudah BA"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SPH / BOQ</label>
                  <input
                    type="text"
                    value={formData.sphBoq || ''}
                    onChange={(e) => handleChange('sphBoq', e.target.value)}
                    placeholder="e.g. SPH-401"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
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
                  <input
                    type="text"
                    value={formData.statusPengajuanProject || ''}
                    onChange={(e) => handleChange('statusPengajuanProject', e.target.value)}
                    placeholder="e.g. NOSA, Project Cancel"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
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
                  <input
                    type="text"
                    value={formData.planPengambilanMaterial || ''}
                    onChange={(e) => handleChange('planPengambilanMaterial', e.target.value)}
                    placeholder="e.g. Warehouse Cikupa"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Material Location</label>
                  <input
                    type="text"
                    value={formData.statusMaterialLocation || ''}
                    onChange={(e) => handleChange('statusMaterialLocation', e.target.value)}
                    placeholder="e.g. On Site, Warehouse"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Dokumen Closing</label>
                  <input
                    type="text"
                    value={formData.statusDokumenClosing || ''}
                    onChange={(e) => handleChange('statusDokumenClosing', e.target.value)}
                    placeholder="e.g. In Progress, Completed"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
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
                  <input
                    type="text"
                    value={formData.statusMaterial || ''}
                    onChange={(e) => handleChange('statusMaterial', e.target.value)}
                    placeholder="e.g. N/A, Released, No Need MR"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Pulling Cable FO</label>
                  <input
                    type="text"
                    value={formData.statusPullingCableFo || ''}
                    onChange={(e) => handleChange('statusPullingCableFo', e.target.value)}
                    placeholder="e.g. In Progress, Done"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Pulling Cable Coax</label>
                  <input
                    type="text"
                    value={formData.statusPullingCableCoax || ''}
                    onChange={(e) => handleChange('statusPullingCableCoax', e.target.value)}
                    placeholder="e.g. Done, In Progress"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status CO</label>
                  <input
                    type="text"
                    value={formData.statusCo || ''}
                    onChange={(e) => handleChange('statusCo', e.target.value)}
                    placeholder="e.g. In Progress, Done"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Laporan Opname</label>
                  <input
                    type="text"
                    value={formData.laporanOpname || ''}
                    onChange={(e) => handleChange('laporanOpname', e.target.value)}
                    placeholder="e.g. Not Yet, Done"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Closing SAP</label>
                  <input
                    type="text"
                    value={formData.closingSap || ''}
                    onChange={(e) => handleChange('closingSap', e.target.value)}
                    placeholder="e.g. In Progress, Yes, No"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Galian Sipil Progress</label>
                  <input
                    type="text"
                    value={formData.galianSipilProgress || ''}
                    onChange={(e) => handleChange('galianSipilProgress', e.target.value)}
                    placeholder="e.g. 80%, Selesai"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Install HH & Pole Progress</label>
                  <input
                    type="text"
                    value={formData.installHhProgress || ''}
                    onChange={(e) => handleChange('installHhProgress', e.target.value)}
                    placeholder="e.g. 12/12 HH"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pulling Cable Progress</label>
                  <input
                    type="text"
                    value={formData.pullingCableProgress || ''}
                    onChange={(e) => handleChange('pullingCableProgress', e.target.value)}
                    placeholder="e.g. 65%"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
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
                    value={formData.closingSap || 'No'}
                    onChange={(e) => handleChange('closingSap', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="In Progress">In Progress</option>
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
