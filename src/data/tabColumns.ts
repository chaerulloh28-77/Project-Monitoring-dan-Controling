import { ColumnDefinition, TabKey } from '../types/project';

// 1. Tab "Project List" columns (Image 1 header)
export const PROJECT_LIST_COLUMNS: ColumnDefinition[] = [
  { key: 'no', label: 'No.', width: '60px', align: 'center', isNumeric: true },
  { key: 'pmoId', label: 'PMO - ID', width: '130px', align: 'left' },
  { key: 'projectCategory', label: 'Project Category', width: '150px', align: 'left', badgeType: 'category' },
  { key: 'projectId', label: 'Project ID', width: '120px', align: 'left' },
  { key: 'projectDescription', label: 'Project Description', width: '280px', align: 'left' },
  { key: 'zona', label: 'Zona', width: '100px', align: 'left' },
  { key: 'areaKota', label: 'Area/Kota', width: '110px', align: 'left' },
  { key: 'projectStatus', label: 'Project Status', width: '160px', align: 'left', badgeType: 'status' },
  { key: 'quarter', label: 'Quarter', width: '100px', align: 'center' },
  { key: 'picSectionHead', label: 'PIC / Section Head', width: '160px', align: 'left' },
];

// 2. Tab "Construction & Plan" columns (Image 2 header)
export const CONSTRUCTION_PLAN_COLUMNS: ColumnDefinition[] = [
  { key: 'pmoId', label: 'PMO - ID', width: '130px', align: 'left' },
  { key: 'projectDescription', label: 'Project Description', width: '240px', align: 'left' },
  { key: 'namaVendor', label: 'Nama Vendor', width: '150px', align: 'left', badgeType: 'vendor' },
  { key: 'dateSuratPerintahRelokasi', label: 'Date Surat Perintah Relokasi', width: '180px', align: 'center' },
  { key: 'bulan', label: 'Bulan', width: '110px', align: 'left' },
  { key: 'tahun', label: 'Tahun', width: '90px', align: 'center', isNumeric: true },
  { key: 'panjangRelokasi', label: 'Panjang Relokasi', width: '140px', align: 'right', isNumeric: true },
  { key: 'apdRelokasi', label: 'APD Relokasi', width: '120px', align: 'center' },
  { key: 'kmzRelokasi', label: 'KMZ Relokasi', width: '120px', align: 'center' },
  { key: 'statusAudit', label: 'Status Audit', width: '130px', align: 'left' },
  { key: 'apdLinknet', label: 'APD Linknet', width: '120px', align: 'center' },
  { key: 'statusSurvey', label: 'Status Survey', width: '130px', align: 'left' },
  { key: 'baSurvey', label: 'BA Survey', width: '130px', align: 'left' },
  { key: 'ceMaterial', label: 'CE Material', width: '130px', align: 'left' },
  { key: 'sphBoq', label: 'SPH/BOQ', width: '120px', align: 'left' },
  { key: 'ceLn', label: 'CE LN', width: '110px', align: 'left' },
  { key: 'apdLn', label: 'APD LN', width: '100px', align: 'center' },
  { key: 'timelineRelokasi', label: 'Timeline Relokasi', width: '150px', align: 'left' },
  { key: 'tanggalStartProject', label: 'Tanggal Start Project', width: '160px', align: 'center' },
  { key: 'tanggalEndProject', label: 'Tanggal End Project', width: '160px', align: 'center' },
  { key: 'estimasiPemutusan', label: 'Estimasi Pemutusan', width: '150px', align: 'center' },
  { key: 'tanggalPemutusan', label: 'Tanggal Pemutusan', width: '150px', align: 'center' },
  { key: 'remarksPlan', label: 'Remarks', width: '200px', align: 'left' },
];

// 3. Tab "Status Project" columns (Image 3 header)
export const STATUS_PROJECT_COLUMNS: ColumnDefinition[] = [
  { key: 'pmoId', label: 'PMO - ID', width: '130px', align: 'left' },
  { key: 'projectDescription', label: 'Project Description', width: '240px', align: 'left' },
  { key: 'statusPengajuanProject', label: 'Status Pengajuan Project', width: '180px', align: 'left', badgeType: 'status' },
  { key: 'tanggalPengajuanMr', label: 'Tanggal Pengajuan MR', width: '170px', align: 'center' },
  { key: 'tanggalPengajuanPo', label: 'Tanggal Pengajuan PO', width: '170px', align: 'center' },
  { key: 'statusPengajuanMr', label: 'Status Pengajuan MR', width: '160px', align: 'left' },
  { key: 'statusPengajuanPo', label: 'Status Pengajuan PO', width: '160px', align: 'left' },
  { key: 'mrNumber', label: 'MR Number', width: '130px', align: 'left' },
  { key: 'poNumber', label: 'PO Number', width: '130px', align: 'left' },
  { key: 'planPengambilanMaterial', label: 'Plan Pengambilan Material', width: '190px', align: 'left' },
  { key: 'statusMaterialLocation', label: 'Status Material Location', width: '180px', align: 'left' },
  { key: 'pengajuanProjectRemarks', label: 'Pengajuan Project Remarks', width: '220px', align: 'left' },
  { key: 'statusMaterialReturn', label: 'Status Material Return', width: '170px', align: 'left' },
  { key: 'tanggalPlanReturn', label: 'Tanggal Plan Return', width: '160px', align: 'center' },
  { key: 'tanggalReturn', label: 'Tanggal Return', width: '150px', align: 'center' },
  { key: 'statusDokumenClosing', label: 'Status Dokumen Closing', width: '180px', align: 'left' },
  { key: 'closingRemarks', label: 'Closing Remarks', width: '180px', align: 'left' },
  { key: 'preProjectRemarks', label: 'Pre-Project Remarks', width: '180px', align: 'left' },
  { key: 'remarksProject', label: 'Remarks', width: '180px', align: 'left' },
];

// 4. Tab "Status Construction" columns (Image 4 header)
export const STATUS_CONSTRUCTION_COLUMNS: ColumnDefinition[] = [
  { key: 'pmoId', label: 'PMO - ID', width: '130px', align: 'left' },
  { key: 'projectDescription', label: 'Project Description', width: '240px', align: 'left' },
  { key: 'statusConstruction', label: 'Status Construction', width: '180px', align: 'left', badgeType: 'status' },
  { key: 'statusLabor', label: 'Status Labor', width: '130px', align: 'left' },
  { key: 'statusMaterial', label: 'Status Material', width: '150px', align: 'left' },
  { key: 'statusPullingCableFo', label: 'Status Pulling Cable FO', width: '180px', align: 'left' },
  { key: 'pullingFoPanjangSelesai', label: 'Meter Selesai FO', width: '140px', align: 'right', isNumeric: true },
  { key: 'pullingFoPanjangTotal', label: 'Target Meter FO', width: '140px', align: 'right', isNumeric: true },
  { key: 'pullingCableFoProgress', label: 'Pulling Cable FO (Otomatis)', width: '180px', align: 'center' },
  { key: 'statusPullingCableCoax', label: 'Status Pulling Cable Coax', width: '180px', align: 'left' },
  { key: 'pullingCoaxPanjangSelesai', label: 'Meter Selesai COAX', width: '150px', align: 'right', isNumeric: true },
  { key: 'pullingCoaxPanjangTotal', label: 'Target Meter COAX', width: '150px', align: 'right', isNumeric: true },
  { key: 'pullingCableCoaxProgress', label: 'Pulling Cable COAX (Otomatis)', width: '190px', align: 'center' },
  { key: 'statusCo', label: 'Status CO', width: '130px', align: 'left' },
  { key: 'statusCoCoax', label: 'Status CO Coax', width: '130px', align: 'left' },
  { key: 'laporanOpname', label: 'Laporan Opname', width: '150px', align: 'left' },
  { key: 'closingSap', label: 'Closing SAP', width: '130px', align: 'center' },
  { key: 'kebutuhanMaterialPoSap', label: 'Kebutuhan Material PO SAP', width: '200px', align: 'left' },
  { key: 'galianSipilProgress', label: 'Galian Sipil Progress', width: '160px', align: 'left' },
  { key: 'galianAksesProgress', label: 'Galian Akses Progress', width: '160px', align: 'left' },
  { key: 'galianCrossingProgress', label: 'Galian Crossing Progress', width: '180px', align: 'left' },
  { key: 'installHhProgress', label: 'Install HH Progress', width: '160px', align: 'left' },
  { key: 'installPoleProgress', label: 'Install Pole Progress', width: '160px', align: 'left' },
  { key: 'pullingCableProgress', label: 'Pulling Cable Progress', width: '170px', align: 'left' },
  { key: 'projectSapId', label: 'Project SAP ID', width: '140px', align: 'left' },
  { key: 'remarksConstruction', label: 'Remarks', width: '180px', align: 'left' },
];

// 5. Tab "Project Tracking Pipeline" columns
export const PROJECT_TRACKING_PIPELINE_COLUMNS: ColumnDefinition[] = [
  { key: 'no', label: 'No.', width: '60px', align: 'center', isNumeric: true },
  { key: 'pmoId', label: 'PMO - ID', width: '130px', align: 'left' },
  { key: 'projectDescription', label: 'Project Description', width: '260px', align: 'left' },
  { key: 'zona', label: 'Zona', width: '100px', align: 'center' },
  { key: 'quarter', label: 'Quarter', width: '100px', align: 'center' },
  { key: 'projectStatus', label: 'Project Status', width: '160px', align: 'left', badgeType: 'status' },
  { key: 'statusConstruction', label: 'Status Construction', width: '160px', align: 'left', badgeType: 'status' },
  { key: 'namaVendor', label: 'Nama Vendor', width: '140px', align: 'left', badgeType: 'vendor' },
  { key: 'panjangRelokasi', label: 'Panjang Relokasi', width: '130px', align: 'right', isNumeric: true },
  { key: 'statusPengajuanPo', label: 'Status PO/MR', width: '130px', align: 'left' },
  { key: 'pullingCableProgress', label: 'Pulling Progress', width: '140px', align: 'center' },
  { key: 'galianSipilProgress', label: 'Galian Sipil', width: '130px', align: 'center' },
  { key: 'tanggalStartProject', label: 'Start Project', width: '130px', align: 'center' },
  { key: 'tanggalEndProject', label: 'End Project', width: '130px', align: 'center' },
  { key: 'closingSap', label: 'Closing SAP', width: '110px', align: 'center' },
  { key: 'remarksConstruction', label: 'Pipeline Remarks', width: '220px', align: 'left' },
];

export const TAB_CONFIG = [
  { id: 'project-list' as TabKey, label: '1. Project List', description: 'Master identitas proyek, PIC Section Head, area & status' },
  { id: 'construction-plan' as TabKey, label: '2. Construction & Plan', description: 'Perencanaan teknis, vendor & perizinan' },
  { id: 'status-project' as TabKey, label: '3. Status Project', description: 'Pengajuan project, MR, PO & closing dokumen' },
  { id: 'status-construction' as TabKey, label: '4. Status Construction', description: 'Progress fisik, galian, kabel & SAP closing' },
  { id: 'project-tracking-pipeline' as TabKey, label: '5. Project Tracking Pipeline', description: 'Pelacakan menyeluruh pipeline, tahapan & progres lintas sheet' },
];
