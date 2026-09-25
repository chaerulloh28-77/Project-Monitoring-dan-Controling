/**
 * Standardized dropdown option constants based on business operational requirements
 */

// Zona: jabo 1, jabo 2, jabo 3
export const ZONA_OPTIONS = [
  'Jabo 1',
  'Jabo 2',
  'Jabo 3',
] as const;

// Tahun: list of relevant years
export const TAHUN_OPTIONS = [
  '2022',
  '2023',
  '2024',
  '2025',
  '2026',
  '2027',
] as const;

// APD Relokasi: Ada, Belum ada
export const APD_RELOKASI_OPTIONS = [
  'Ada',
  'Belum ada',
] as const;

// KMZ Relokasi: Ada, Belum ada
export const KMZ_RELOKASI_OPTIONS = [
  'Ada',
  'Belum ada',
] as const;

// APD Linknet: Not Yet, Request, Release
export const APD_LINKNET_OPTIONS = [
  'Not Yet',
  'Request',
  'Release',
] as const;

// Status Survey: Not Yet, Done survey
export const STATUS_SURVEY_OPTIONS = [
  'Not Yet',
  'Done survey',
] as const;

// BA Survey: Not Yet, Ada
export const BA_SURVEY_OPTIONS = [
  'Not Yet',
  'Ada',
] as const;

// SPH / BOQ: Not Yet, Submit, Release
export const SPH_BOQ_OPTIONS = [
  'Not Yet',
  'Submit',
  'Release',
] as const;

// Status Pengajuan Project: Not Yet, Submit, Approved, Release
export const STATUS_PENGAJUAN_PROJECT_OPTIONS = [
  'Not Yet',
  'Submit',
  'Approved',
  'Release',
] as const;

// Plan Pengambilan Material: Warehouse LN, Warehouse CKT
export const PLAN_PENGAMBILAN_MATERIAL_OPTIONS = [
  'Warehouse LN',
  'Warehouse CKT',
] as const;

// Status Material Location: Warehouse CKT, Warehouse Vendor
export const STATUS_MATERIAL_LOCATION_OPTIONS = [
  'Warehouse CKT',
  'Warehouse Vendor',
] as const;

// Status Dokumen Closing:
// Completed waspang mobility, Submit dokumen SAP, Approval completed SAP, Approval BALAP, Approval BAST, Teco done
export const STATUS_DOKUMEN_CLOSING_OPTIONS = [
  'Completed waspang mobility',
  'Submit dokumen SAP',
  'Approval completed SAP',
  'Approval BALAP',
  'Approval BAST',
  'Teco done',
] as const;

// Status Material: Not Yet, No need MR, Release
export const STATUS_MATERIAL_OPTIONS = [
  'Not Yet',
  'No need MR',
  'Release',
] as const;

// Status Pulling Cable FO: Not Yet, In Progress, Done
export const STATUS_PULLING_CABLE_FO_OPTIONS = [
  'Not Yet',
  'In Progress',
  'Done',
] as const;

// Status Pulling Cable COAX: Not Yet, In Progress, Done
export const STATUS_PULLING_CABLE_COAX_OPTIONS = [
  'Not Yet',
  'In Progress',
  'Done',
] as const;

// Status CO: Not Yet, In Progress, Done
export const STATUS_CO_OPTIONS = [
  'Not Yet',
  'In Progress',
  'Done',
] as const;

// Laporan Opname: Not Yet, Done
export const LAPORAN_OPNAME_OPTIONS = [
  'Not Yet',
  'Done',
] as const;

// Closing SAP: Not Yet, In Progress, Done
export const CLOSING_SAP_OPTIONS = [
  'Not Yet',
  'In Progress',
  'Done',
] as const;

// Install HH & Pole Progress specifications
// HH, HB, MH (Unit): 80x80, 90x90, 100x100, 110x110, 120x120
export const HH_TYPE_OPTIONS = ['HH', 'HB', 'MH'] as const;
export const HH_SIZE_OPTIONS = ['80x80', '90x90', '100x100', '110x110', '120x120'] as const;

// Pole (Ea): Tiang 8, Tiang 9
export const POLE_OPTIONS = ['Tiang 8', 'Tiang 9'] as const;

// Galvanis (meter): 2", 4", 6"
export const GALVANIS_OPTIONS = ['2"', '4"', '6"'] as const;

/**
 * Helper to calculate Galian Sipil Progress percentage automatically:
 * Based on inputs: target (meters or segments), progress done, or status stages.
 */
export function calculateGalianPercentage(statusConstruction: string, galianInput?: string | number): string {
  if (statusConstruction === 'Completed') return '100%';
  if (statusConstruction === 'Project Cancel' || statusConstruction === 'Cancelled') return '0%';
  if (galianInput === undefined || galianInput === null || galianInput === '') {
    if (statusConstruction === 'Pulling Cable') return '80%';
    if (statusConstruction === 'In Progress') return '40%';
    return '0%';
  }
  const str = String(galianInput).trim();
  if (str.endsWith('%')) {
    const num = parseFloat(str);
    if (!isNaN(num)) return `${Math.min(100, Math.max(0, Math.round(num)))}%`;
  }
  const num = parseFloat(str);
  if (!isNaN(num)) {
    if (num <= 1 && num > 0) return `${Math.round(num * 100)}%`;
    return `${Math.min(100, Math.max(0, Math.round(num)))}%`;
  }
  if (str.toLowerCase() === 'done' || str.toLowerCase() === 'selesai') return '100%';
  return '0%';
}

/**
 * Helper to calculate Pulling Cable Progress percentage automatically:
 * Computed from statusPullingCableFo, statusPullingCableCoax, and statusConstruction
 */
export function calculatePullingPercentage(
  statusFo: string,
  statusCoax: string,
  statusConstruction?: string
): string {
  if (statusConstruction === 'Completed') return '100%';
  if (statusConstruction === 'Project Cancel' || statusConstruction === 'Cancelled') return '0%';

  let foWeight = 0;
  if (statusFo === 'Done') foWeight = 60;
  else if (statusFo === 'In Progress') foWeight = 30;

  let coaxWeight = 0;
  if (statusCoax === 'Done') coaxWeight = 40;
  else if (statusCoax === 'In Progress') coaxWeight = 20;

  // If FO is done and no coax is required or applicable
  if (statusFo === 'Done' && (!statusCoax || statusCoax === 'Not Yet')) {
    return '85%';
  }
  if (statusFo === 'Done' && statusCoax === 'Done') {
    return '100%';
  }
  if (statusFo === 'Not Yet' && statusCoax === 'Not Yet') {
    if (statusConstruction === 'Pulling Cable') return '25%';
    return '0%';
  }

  const total = Math.min(100, foWeight + coaxWeight);
  return `${total}%`;
}
