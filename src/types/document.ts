/**
 * Types and Configurations for "Upload Document" Tab
 */

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  dataUrl?: string; // base64 representation for download/preview
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

export interface DocumentSlotDefinition {
  key: DocumentTypeKey;
  num: number;
  label: string;
  accept: string;
  fileHint: string;
  category: 'perizinan' | 'teknis' | 'survey' | 'komersial';
  formatBadge: string;
  iconType: 'pdf' | 'kmz' | 'excel';
}

export const DOCUMENT_SLOTS: DocumentSlotDefinition[] = [
  {
    key: 'mr',
    num: 3,
    label: 'MR',
    accept: 'application/pdf,.pdf',
    fileHint: 'File PDF',
    category: 'komersial',
    formatBadge: 'PDF',
    iconType: 'pdf',
  },
  {
    key: 'suratDinas',
    num: 4,
    label: 'Surat Dinas',
    accept: 'application/pdf,.pdf',
    fileHint: 'File PDF',
    category: 'perizinan',
    formatBadge: 'PDF',
    iconType: 'pdf',
  },
  {
    key: 'rekomtek',
    num: 5,
    label: 'Rekomtek',
    accept: 'application/pdf,.pdf',
    fileHint: 'File PDF',
    category: 'perizinan',
    formatBadge: 'PDF',
    iconType: 'pdf',
  },
  {
    key: 'suratPenunjukanVendor',
    num: 6,
    label: 'Surat Penunjukan Vendor Apjatel',
    accept: 'application/pdf,.pdf',
    fileHint: 'File PDF',
    category: 'perizinan',
    formatBadge: 'PDF',
    iconType: 'pdf',
  },
  {
    key: 'apdRelokasi',
    num: 7,
    label: 'APD Relokasi',
    accept: 'application/pdf,.pdf',
    fileHint: 'File PDF',
    category: 'teknis',
    formatBadge: 'PDF',
    iconType: 'pdf',
  },
  {
    key: 'apdLinknet',
    num: 8,
    label: 'APD Linknet',
    accept: 'application/pdf,.pdf',
    fileHint: 'File PDF',
    category: 'teknis',
    formatBadge: 'PDF',
    iconType: 'pdf',
  },
  {
    key: 'kmzRelokasi',
    num: 9,
    label: 'KMZ Relokasi',
    accept: '.kmz,.kml,application/vnd.google-earth.kmz,application/vnd.google-earth.kml+xml',
    fileHint: 'File KMZ / KML',
    category: 'teknis',
    formatBadge: 'KMZ / KML',
    iconType: 'kmz',
  },
  {
    key: 'baSurveyBersama',
    num: 10,
    label: 'BA Survey Bersama',
    accept: 'application/pdf,.pdf',
    fileHint: 'File PDF',
    category: 'survey',
    formatBadge: 'PDF',
    iconType: 'pdf',
  },
  {
    key: 'baSurveyInternal',
    num: 11,
    label: 'BA Survey Internal',
    accept: 'application/pdf,.pdf',
    fileHint: 'File PDF',
    category: 'survey',
    formatBadge: 'PDF',
    iconType: 'pdf',
  },
  {
    key: 'baSurveyBersama2',
    num: 12,
    label: 'BA Survey Bersama (Instansi / Vendor)',
    accept: 'application/pdf,.pdf',
    fileHint: 'File PDF',
    category: 'survey',
    formatBadge: 'PDF',
    iconType: 'pdf',
  },
  {
    key: 'formBoq',
    num: 13,
    label: 'Form BOQ Material & Labour',
    accept: '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf,.pdf',
    fileHint: 'File Excel / PDF',
    category: 'komersial',
    formatBadge: 'Excel / PDF',
    iconType: 'excel',
  },
  {
    key: 'timelineRelokasi',
    num: 14,
    label: 'Timeline Relokasi',
    accept: '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf,.pdf',
    fileHint: 'File Excel / PDF',
    category: 'teknis',
    formatBadge: 'Excel / PDF',
    iconType: 'excel',
  },
  {
    key: 'timelineInternal',
    num: 15,
    label: 'Timeline Internal',
    accept: '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf,.pdf',
    fileHint: 'File Excel / PDF',
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
  updatedAt: string;
}
