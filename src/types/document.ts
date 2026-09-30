/**
 * Types and Configurations for "Upload Document" Tab
 */

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  dataUrl?: string; // base64 representation for download/preview
  notes?: string;   // catatan tambahan / nomor surat / keterangan
  customName?: string; // nama kustom / alias dokumen
  updatedAt?: string;  // waktu pembaruan terakhir
}

export type DocumentTypeKey =
  | 'mr'
  | 'suratDinas'
  | 'rekomtek'
  | 'suratPenunjukanVendor'
  | 'apdRelokasi'
  | 'apdLinknet'
  | 'kmzRelokasi'
  | 'baSurveyBersama'
  | 'baSurveyInternal'
  | 'baSurveyBersama2'
  | 'formBoq'
  | 'timelineRelokasi'
  | 'timelineInternal';

export type DocumentFormatType = 'pdf' | 'kmz' | 'excel' | 'image' | 'file';

export interface DocumentSlotDefinition {
  key: DocumentTypeKey;
  num: number;
  label: string;
  accept: string;
  fileHint: string;
  category: 'perizinan' | 'teknis' | 'survey' | 'komersial';
  formatBadge: string;
  iconType: DocumentFormatType;
}

export const DOCUMENT_SLOTS: DocumentSlotDefinition[] = [
  {
    key: 'mr',
    num: 3,
    label: 'MR',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp,.xlsx,.xls',
    fileHint: 'PDF / Gambar / Excel',
    category: 'komersial',
    formatBadge: 'PDF / Scan',
    iconType: 'pdf',
  },
  {
    key: 'suratDinas',
    num: 4,
    label: 'Surat Dinas',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp',
    fileHint: 'PDF / Gambar Scan',
    category: 'perizinan',
    formatBadge: 'PDF / Gambar',
    iconType: 'pdf',
  },
  {
    key: 'rekomtek',
    num: 5,
    label: 'Rekomtek',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp',
    fileHint: 'PDF / Gambar Scan',
    category: 'perizinan',
    formatBadge: 'PDF / Gambar',
    iconType: 'pdf',
  },
  {
    key: 'suratPenunjukanVendor',
    num: 6,
    label: 'Surat Penunjukan Vendor Apjatel',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp',
    fileHint: 'PDF / Gambar Scan',
    category: 'perizinan',
    formatBadge: 'PDF / Gambar',
    iconType: 'pdf',
  },
  {
    key: 'apdRelokasi',
    num: 7,
    label: 'APD Relokasi',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp,.xlsx,.xls',
    fileHint: 'PDF / Gambar / Excel',
    category: 'teknis',
    formatBadge: 'PDF / Gambar',
    iconType: 'pdf',
  },
  {
    key: 'apdLinknet',
    num: 8,
    label: 'APD Linknet',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp,.xlsx,.xls',
    fileHint: 'PDF / Gambar / Excel',
    category: 'teknis',
    formatBadge: 'PDF / Gambar',
    iconType: 'pdf',
  },
  {
    key: 'kmzRelokasi',
    num: 9,
    label: 'KMZ Relokasi',
    accept: '.kmz,.kml,application/vnd.google-earth.kmz,application/vnd.google-earth.kml+xml,application/pdf,.pdf',
    fileHint: 'KMZ / KML / PDF GIS',
    category: 'teknis',
    formatBadge: 'KMZ / KML',
    iconType: 'kmz',
  },
  {
    key: 'baSurveyBersama',
    num: 10,
    label: 'BA Survey Bersama',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp',
    fileHint: 'PDF / Foto Berita Acara',
    category: 'survey',
    formatBadge: 'PDF / Foto',
    iconType: 'pdf',
  },
  {
    key: 'baSurveyInternal',
    num: 11,
    label: 'BA Survey Internal',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp',
    fileHint: 'PDF / Foto Berita Acara',
    category: 'survey',
    formatBadge: 'PDF / Foto',
    iconType: 'pdf',
  },
  {
    key: 'baSurveyBersama2',
    num: 12,
    label: 'BA Survey Bersama (Instansi / Vendor)',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp',
    fileHint: 'PDF / Foto Berita Acara',
    category: 'survey',
    formatBadge: 'PDF / Foto',
    iconType: 'pdf',
  },
  {
    key: 'formBoq',
    num: 13,
    label: 'Form BOQ Material & Labour',
    accept: '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf,.pdf',
    fileHint: 'File Excel (.xlsx/.xls) atau PDF',
    category: 'komersial',
    formatBadge: 'Excel / PDF',
    iconType: 'excel',
  },
  {
    key: 'timelineRelokasi',
    num: 14,
    label: 'Timeline Relokasi',
    accept: '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf,.pdf',
    fileHint: 'File Excel (.xlsx/.xls) atau PDF',
    category: 'teknis',
    formatBadge: 'Excel / PDF',
    iconType: 'excel',
  },
  {
    key: 'timelineInternal',
    num: 15,
    label: 'Timeline Internal',
    accept: '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf,.pdf',
    fileHint: 'File Excel (.xlsx/.xls) atau PDF',
    category: 'teknis',
    formatBadge: 'Excel / PDF',
    iconType: 'excel',
  },
];

export interface ProjectDocumentRecord {
  projectId: string; // Primary key (project id or pmoId)
  pmoId: string;
  projectDescription: string;
  sapProjectId: string;
  documents: Partial<Record<DocumentTypeKey, UploadedFileMeta>>;
  driveFolderUrl?: string; // Tautan Google Drive folder proyek
  updatedAt: string;
}

export interface EmailSharePayload {
  toEmail: string;
  ccEmail?: string;
  subject: string;
  message?: string;
  includeChecklist: boolean;
  includeDriveLink: boolean;
}

export interface GoogleDriveSyncState {
  isSyncing: boolean;
  progress: number;
  stageMessage: string;
  driveFolderUrl?: string;
  error?: string;
}
