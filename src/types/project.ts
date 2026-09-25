/**
 * Definition of Project Data and Tab Column Configurations
 */

export interface ProjectData {
  id: string; // Internal unique identifier
  no: number;
  
  // Tab 1: Project List Core Info
  pmoId: string; // "PMO - ID", e.g. PMO-GOV-001
  projectCategory: string; // "Project Category", e.g. GOV IPPJU, GOV Apjatel
  projectId: string; // "Project ID", e.g. GOV0000747
  projectDescription: string; // "Project Description", e.g. [Z1-GOV] IPPJU Ampera Raya
  zona: string; // "Zona", e.g. Jabo 1
  areaKota: string; // "Area/Kota", e.g. Central, West, East, South, North
  projectStatus: string; // "Project Status", e.g. Masih Review Dinas, In Progress, Cancelled, Done
  quarter: string; // "Quarter", e.g. Q1-26, Q2-26, Q3-26, Q4-26, -
  picSectionHead: string; // "PIC / Section Head", e.g. Mega

  // Tab 2: Construction & Plan (from Image 2)
  namaVendor: string; // "Nama Vendor", e.g. PT.NATAMA, PT.RPA, PT.ARKON, Belum Ada Vendor
  dateSuratPerintahRelokasi: string; // "Date Surat Perintah Relokasi", e.g. 2026-07-18
  bulan: string; // "Bulan", e.g. November, Januari
  tahun: string; // "Tahun", e.g. 2023, 2024
  panjangRelokasi: number | string; // "Panjang Relokasi", e.g. 10000, 8500, 2600
  apdRelokasi: string; // "APD Relokasi", e.g. Belum, Sudah
  kmzRelokasi: string; // "KMZ Relokasi", e.g. Belum, Sudah
  statusAudit: string; // "Status Audit", e.g. Belum, Belum di Audit, Sudah Audit
  apdLinknet: string; // "APD Linknet", e.g. Not Yet, Done
  statusSurvey: string; // "Status Survey", e.g. Belum, In Progress, Selesai
  baSurvey: string; // "BA Survey", e.g. Belum ada BA, Sudah BA
  ceMaterial: string; // "CE Material"
  sphBoq: string; // "SPH/BOQ"
  ceLn: string; // "CE LN"
  apdLn: string; // "APD LN", e.g. 0
  timelineRelokasi: string; // "Timeline Relokasi"
  tanggalStartProject: string; // "Tanggal Start Project"
  tanggalEndProject: string; // "Tanggal End Project"
  estimasiPemutusan: string; // "Estimasi Pemutusan"
  tanggalPemutusan: string; // "Tanggal Pemutusan"
  remarksPlan: string; // "Remarks" in Tab 2

  // Tab 3: Status Project (from Image 3)
  statusPengajuanProject: string; // "Status Pengajuan Project", e.g. NOSA, Project Cancel, Submitted
  tanggalPengajuanMr: string; // "Tanggal Pengajuan MR"
  tanggalPengajuanPo: string; // "Tanggal Pengajuan PO"
  statusPengajuanMr: string; // "Status Pengajuan MR", e.g. N/A, Released, No Need MR, In Progress
  statusPengajuanPo: string; // "Status Pengajuan PO", e.g. N/A, Released, No Need PO
  mrNumber: string; // "MR Number", e.g. 99434
  poNumber: string; // "PO Number"
  planPengambilanMaterial: string; // "Plan Pengambilan Material"
  statusMaterialLocation: string; // "Status Material Location"
  pengajuanProjectRemarks: string; // "Pengajuan Project Remarks"
  statusMaterialReturn: string; // "Status Material Return"
  tanggalPlanReturn: string; // "Tanggal Plan Return"
  tanggalReturn: string; // "Tanggal Return"
  statusDokumenClosing: string; // "Status Dokumen Closing"
  closingRemarks: string; // "Closing Remarks"
  preProjectRemarks: string; // "Pre-Project Remarks"
  remarksProject: string; // "Remarks" in Tab 3

  // Tab 4: Status Construction (from Image 4)
  statusConstruction: string; // "Status Construction", e.g. Project Not Started, Pulling Cable, Project Cancel, Completed
  statusLabor: string; // "Status Labor", e.g. N/A, Assigned
  statusMaterial: string; // "Status Material", e.g. N/A, Released, No Need MR
  statusPullingCableFo: string; // "Status Pulling Cable FO", e.g. In Progress, Done, Not Started
  statusPullingCableCoax: string; // "Status Pulling Cable Coax", e.g. Done, In Progress, N/A
  statusCo: string; // "Status CO", e.g. In Progress, Done, N/A
  statusCoCoax: string; // "Status CO Coax"
  laporanOpname: string; // "Laporan Opname", e.g. Not Yet, Submitted, Approved
  closingSap: string; // "Closing SAP", e.g. Yes, No
  kebutuhanMaterialPoSap: string; // "Kebutuhan Material PO SAP"
  galianSipilProgress: string; // "Galian Sipil Progress", e.g. 45%, Done, Not Yet
  galianAksesProgress: string; // "Galian Akses Progress"
  galianCrossingProgress: string; // "Galian Crossing Progress"
  installHhProgress: string; // "Install HH Progress"
  installPoleProgress: string; // "Install Pole Progress"
  pullingCableProgress: string; // "Pulling Cable Progress"
  projectSapId: string; // "Project SAP ID", e.g. GOV0000747
  remarksConstruction: string; // "Remarks" in Tab 4
  pipelineStage?: string; // Pipeline Tracking Stage

  // System metadata
  updatedAt: string;
}

export type TabKey = 
  | 'project-list' 
  | 'construction-plan' 
  | 'status-project' 
  | 'status-construction' 
  | 'project-tracking-pipeline';

export interface ColumnDefinition {
  key: keyof ProjectData;
  label: string;
  width?: string;
  isNumeric?: boolean;
  align?: 'left' | 'center' | 'right';
  badgeType?: 'status' | 'category' | 'vendor' | 'default';
}

export const PIC_SECTION_HEAD_OPTIONS = ['Mega', 'Aris', 'Chaerul', 'Daud'] as const;
export type PicSectionHead = typeof PIC_SECTION_HEAD_OPTIONS[number];

export interface BackupSnapshot {
  timestamp: string;
  count: number;
  data: ProjectData[];
  reason: string;
}
