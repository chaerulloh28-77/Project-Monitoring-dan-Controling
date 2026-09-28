import { ProjectData } from '../types/project';
import { INITIAL_PROJECTS } from '../data/initialData';
import { calculatePullingFoPercentage, calculatePullingCoaxPercentage } from '../data/dropdownOptions';
import { securityGuard } from './securityGuard';
import * as XLSX from 'xlsx';
import { 
  PROJECT_LIST_COLUMNS, 
  CONSTRUCTION_PLAN_COLUMNS, 
  STATUS_PROJECT_COLUMNS, 
  STATUS_CONSTRUCTION_COLUMNS 
} from '../data/tabColumns';
import { 
  JaboExportScope, 
  filterProjectsByScope, 
  getScopeInfo 
} from '../utils/jaboScope';

const STORAGE_KEY = 'PMO_PROJECTS_DATA_V8';

// Stale legacy keys that previously bloated localStorage
const STALE_STORAGE_KEYS = [
  'PMO_PROJECTS_DATA_V7',
  'PMO_PROJECTS_DATA',
  'PMO_PROJECTS_BACKUPS_V6',
  'PMO_PROJECTS_BACKUPS_V5',
  'PMO_PROJECTS_DATA_V6',
  'PMO_PROJECTS_DATA_V5',
  'PMO_PROJECTS_DATA_V4',
  'PMO_PROJECTS_DATA_V3',
  'PMO_PROJECTS_DATA_V2',
  'PMO_CRASH_GUARD_FLAG',
];

export const storageService = {
  // Purge any old bloated keys to ensure localStorage has zero quota errors
  purgeStaleStorage(): void {
    try {
      for (const key of STALE_STORAGE_KEYS) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('Failed to purge stale storage keys:', e);
    }
  },

  // Load projects from localStorage (loads clean 387 initial projects on fresh load)
  loadProjects(): ProjectData[] {
    this.purgeStaleStorage();

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        // Load clean initial 387 projects
        const initial = [...INITIAL_PROJECTS].sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0));
        this.saveProjects(initial);
        return initial;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          return [];
        }

        // Normalize categories, PICs, clean PMO IDs, and ensure data integrity
        const normalized = parsed.map((p: ProjectData, idx: number) => {
          let cat = p.projectCategory;
          if (cat === 'GOV Apjatel') cat = 'GOV APJATEL';
          if (cat === 'GOV Bina Marga' || cat === 'B2B Commercial' || cat === 'FTTH Relocation') {
            cat = 'GOV SJUT';
          }

          let pic = p.picSectionHead;
          if (pic === 'Chaerulloh' || !pic) {
            pic = 'Chaerul';
          }
          if (pic === 'Budi Santoso') {
            pic = 'Aris';
          }

          let zona = p.zona;
          if (zona === 'Jobo 3' || zona === 'Jabo 3 / Jobo 3') {
            zona = 'Jabo 3';
          }

          // Ensure PMO-ID is clean (remove any trailing GOV, IPPJU, GOV Apjatel, GOV SJUT)
          const cleanPmoId = p.pmoId ? p.pmoId.replace(/\s+(GOV.*)$/i, '').trim() : '';

          const foProgress = p.pullingCableFoProgress || calculatePullingFoPercentage(
            p.statusPullingCableFo || 'Not Yet',
            p.pullingPanjangSelesai,
            p.pullingPanjangTotal || p.panjangRelokasi,
            p.statusConstruction
          );

          const coaxProgress = p.pullingCableCoaxProgress || calculatePullingCoaxPercentage(
            p.statusPullingCableCoax || 'Not Yet',
            p.pullingPanjangSelesai,
            p.pullingPanjangTotal || p.panjangRelokasi,
            p.statusConstruction
          );

          let vendor = (p.namaVendor || '').trim().toUpperCase();
          if (vendor.includes('MENTARI (RESIGN)') || vendor.includes('MENTARI ( RESIGN )')) {
            vendor = 'PT.MENTARI';
          }

          return {
            ...p,
            no: idx + 1,
            namaVendor: vendor,
            pmoId: cleanPmoId || p.pmoId,
            projectCategory: cat || 'GOV IPPJU',
            picSectionHead: pic,
            zona: zona || 'Jabo 1',
            pullingCableFoProgress: foProgress,
            pullingCableCoaxProgress: coaxProgress,
          };
        });

        normalized.sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0));
        return normalized;
      }

      const initial = [...INITIAL_PROJECTS].sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0));
      this.saveProjects(initial);
      return initial;
    } catch (err) {
      console.error('Failed to load projects from localStorage:', err);
      return INITIAL_PROJECTS;
    }
  },

  // Save data to localStorage with zero quota bloat
  saveProjects(projects: ProjectData[]): { success: boolean; timestamp: string } {
    const timestamp = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      return { success: true, timestamp };
    } catch (err) {
      console.error('Storage save error, purging stale data and retrying...', err);
      try {
        this.purgeStaleStorage();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        return { success: true, timestamp };
      } catch (retryErr) {
        console.error('Storage retry failed:', retryErr);
        return { success: false, timestamp };
      }
    }
  },

  // Clear all projects completely (0 items)
  clearAllProjects(): ProjectData[] {
    this.purgeStaleStorage();
    this.saveProjects([]);
    return [];
  },

  // Restore 387 initial default projects
  restoreDefaultProjects(): ProjectData[] {
    this.purgeStaleStorage();
    const initial = [...INITIAL_PROJECTS].sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0));
    this.saveProjects(initial);
    return initial;
  },

  // Export current data to Excel-ready CSV (with optional Jabo Scope filter)
  exportToCsv(projects: ProjectData[], zonaFilter?: JaboExportScope | string): void {
    if (!projects || projects.length === 0) return;

    const scope: JaboExportScope = (zonaFilter as JaboExportScope) || 'ALL';
    const targetProjects = filterProjectsByScope(projects, scope);
    const scopeInfo = getScopeInfo(scope);

    if (targetProjects.length === 0) return;

    const headers = [
      'No',
      'PMO - ID',
      'Project Category',
      'Project ID',
      'Project Description',
      'Zona',
      'Area/Kota',
      'Project Status',
      'Quarter',
      'PIC / Section Head',
      'Nama Vendor',
      'Date Surat Perintah Relokasi',
      'Bulan',
      'Tahun',
      'Panjang Relokasi (m)',
      'APD Relokasi',
      'KMZ Relokasi',
      'Status Audit',
      'APD Linknet',
      'Status Survey',
      'BA Survey',
      'CE Material',
      'SPH/BOQ',
      'CE LN',
      'APD LN',
      'Timeline Relokasi',
      'Tanggal Start Project',
      'Tanggal End Project',
      'Estimasi Pemutusan',
      'Tanggal Pemutusan',
      'Status Pengajuan Project',
      'Project Create Date',
      'MR Number',
      'Plan Pengambilan Material',
      'Status Material Location',
      'Pengajuan Project Remarks',
      'Status Material Return',
      'Tanggal Plan Return',
      'Tanggal Return',
      'Status Dokumen Closing',
      'Closing Remarks',
      'Pre-Project Remarks',
      'Status Construction',
      'Status Labor',
      'Status Material',
      'Status Pulling Cable FO',
      'Status Pulling Cable Coax',
      'Status CO',
      'Status CO Coax',
      'Laporan Opname',
      'Closing SAP',
      'Kebutuhan Material PO SAP',
      'Galian Sipil Progress',
      'Galian Akses Progress',
      'Galian Crossing Progress',
      'Install HH Progress',
      'Install Pole Progress',
      'Pulling Cable Progress',
      'Project SAP ID',
      'Remarks Construction',
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = targetProjects.map((p, idx) => [
      idx + 1,
      escapeCsv(p.pmoId),
      escapeCsv(p.projectCategory),
      escapeCsv(p.projectId),
      escapeCsv(p.projectDescription),
      escapeCsv(p.zona),
      escapeCsv(p.areaKota),
      escapeCsv(p.projectStatus),
      escapeCsv(p.quarter),
      escapeCsv(p.picSectionHead),
      escapeCsv(p.namaVendor),
      escapeCsv(p.dateSuratPerintahRelokasi),
      escapeCsv(p.bulan),
      escapeCsv(p.tahun),
      escapeCsv(p.panjangRelokasi),
      escapeCsv(p.apdRelokasi),
      escapeCsv(p.kmzRelokasi),
      escapeCsv(p.statusAudit),
      escapeCsv(p.apdLinknet),
      escapeCsv(p.statusSurvey),
      escapeCsv(p.baSurvey),
      escapeCsv(p.ceMaterial),
      escapeCsv(p.sphBoq),
      escapeCsv(p.ceLn),
      escapeCsv(p.apdLn),
      escapeCsv(p.timelineRelokasi),
      escapeCsv(p.tanggalStartProject),
      escapeCsv(p.tanggalEndProject),
      escapeCsv(p.estimasiPemutusan),
      escapeCsv(p.tanggalPemutusan),
      escapeCsv(p.statusPengajuanProject),
      escapeCsv(p.projectCreateDate),
      escapeCsv(p.mrNumber),
      escapeCsv(p.planPengambilanMaterial),
      escapeCsv(p.statusMaterialLocation),
      escapeCsv(p.pengajuanProjectRemarks),
      escapeCsv(p.statusMaterialReturn),
      escapeCsv(p.tanggalPlanReturn),
      escapeCsv(p.tanggalReturn),
      escapeCsv(p.statusDokumenClosing),
      escapeCsv(p.closingRemarks),
      escapeCsv(p.preProjectRemarks),
      escapeCsv(p.statusConstruction),
      escapeCsv(p.statusLabor),
      escapeCsv(p.statusMaterial),
      escapeCsv(p.statusPullingCableFo),
      escapeCsv(p.statusPullingCableCoax),
      escapeCsv(p.statusCo),
      escapeCsv(p.statusCoCoax),
      escapeCsv(p.laporanOpname),
      escapeCsv(p.closingSap),
      escapeCsv(p.kebutuhanMaterialPoSap),
      escapeCsv(p.galianSipilProgress),
      escapeCsv(p.galianAksesProgress),
      escapeCsv(p.galianCrossingProgress),
      escapeCsv(p.installHhProgress),
      escapeCsv(p.installPoleProgress),
      escapeCsv(p.pullingCableProgress),
      escapeCsv(p.projectSapId),
      escapeCsv(p.remarksConstruction),
    ].join(','));

    const digitalSeal = securityGuard.generateExportSeal();
    const csvContent = '\uFEFF' + [headers.join(','), ...rows, `"# [SECURITY_AUDIT] Hak Cipta Dilindungi © PAUL | Scope: ${scopeInfo.label} | ${digitalSeal}"`].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Project_Monitoring_Report_${scopeInfo.filenameKey}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Export 1 Excel File consisting of 4 distinct sheets as requested:
  // 1. Project list
  // 2. Construction & Plan
  // 3. Status Project
  // 4. Status Construction
  // Option: Semua Report (Semua Zona) or per Jabo 1 (Central/West), Jabo 2 (South/Banten/PIC Aris/Chaerul), Jabo 3 (NE/Bekasi/Karawang)
  exportToMultiSheetExcel(
    projects: ProjectData[], 
    zonaFilter?: JaboExportScope | string
  ): { success: boolean; count: number; filename: string; label: string } {
    if (!projects || projects.length === 0) {
      return { success: false, count: 0, filename: '', label: '' };
    }

    const scope: JaboExportScope = (zonaFilter as JaboExportScope) || 'ALL';
    const targetProjects = filterProjectsByScope(projects, scope);
    const scopeInfo = getScopeInfo(scope);

    if (targetProjects.length === 0) {
      return { success: false, count: 0, filename: '', label: scopeInfo.label };
    }

    const wb = XLSX.utils.book_new();

    // Sheet 1: Project list
    const ws1Headers = PROJECT_LIST_COLUMNS.map((col) => col.label);
    const ws1Rows = targetProjects.map((p, idx) =>
      PROJECT_LIST_COLUMNS.map((col) => {
        if (col.key === 'no') return idx + 1;
        const val = p[col.key];
        return val !== undefined && val !== null ? val : '';
      })
    );
    const ws1 = XLSX.utils.aoa_to_sheet([ws1Headers, ...ws1Rows]);
    ws1['!cols'] = PROJECT_LIST_COLUMNS.map((col) => ({
      wch: Math.max(col.label.length + 3, 14),
    }));
    XLSX.utils.book_append_sheet(wb, ws1, 'Project list');

    // Sheet 2: Construction & Plan
    const ws2Headers = CONSTRUCTION_PLAN_COLUMNS.map((col) => col.label);
    const ws2Rows = targetProjects.map((p, idx) =>
      CONSTRUCTION_PLAN_COLUMNS.map((col) => {
        if (col.key === 'no') return idx + 1;
        const val = p[col.key];
        return val !== undefined && val !== null ? val : '';
      })
    );
    const ws2 = XLSX.utils.aoa_to_sheet([ws2Headers, ...ws2Rows]);
    ws2['!cols'] = CONSTRUCTION_PLAN_COLUMNS.map((col) => ({
      wch: Math.max(col.label.length + 3, 14),
    }));
    XLSX.utils.book_append_sheet(wb, ws2, 'Construction & Plan');

    // Sheet 3: Status Project
    const ws3Headers = STATUS_PROJECT_COLUMNS.map((col) => col.label);
    const ws3Rows = targetProjects.map((p, idx) =>
      STATUS_PROJECT_COLUMNS.map((col) => {
        if (col.key === 'no') return idx + 1;
        const val = p[col.key];
        return val !== undefined && val !== null ? val : '';
      })
    );
    const ws3 = XLSX.utils.aoa_to_sheet([ws3Headers, ...ws3Rows]);
    ws3['!cols'] = STATUS_PROJECT_COLUMNS.map((col) => ({
      wch: Math.max(col.label.length + 3, 14),
    }));
    XLSX.utils.book_append_sheet(wb, ws3, 'Status Project');

    // Sheet 4: Status Construction
    const ws4Headers = STATUS_CONSTRUCTION_COLUMNS.map((col) => col.label);
    const ws4Rows = targetProjects.map((p, idx) =>
      STATUS_CONSTRUCTION_COLUMNS.map((col) => {
        if (col.key === 'no') return idx + 1;
        const val = p[col.key];
        return val !== undefined && val !== null ? val : '';
      })
    );
    const ws4 = XLSX.utils.aoa_to_sheet([ws4Headers, ...ws4Rows]);
    ws4['!cols'] = STATUS_CONSTRUCTION_COLUMNS.map((col) => ({
      wch: Math.max(col.label.length + 3, 14),
    }));
    XLSX.utils.book_append_sheet(wb, ws4, 'Status Construction');

    const filename = `Project_Monitoring_Report_${scopeInfo.filenameKey}_4_Sheets_${new Date().toISOString().slice(0, 10)}.xlsx`;

    // Set workbook metadata & digital security seal
    wb.Props = {
      Title: `Project Monitoring dan Controling Report - ${scopeInfo.label}`,
      Subject: `Multi-Sheet Project Management Master Report (${scopeInfo.tag} - ${targetProjects.length} Proyek)`,
      Author: 'PAUL',
      Company: 'PMO System © PAUL',
      Comments: scopeInfo.description,
      CreatedDate: new Date(),
    };

    // Generate binary buffer and download .xlsx
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { 
      success: true, 
      count: targetProjects.length, 
      filename, 
      label: scopeInfo.label 
    };
  },

  // Export current data to JSON
  exportToJson(projects: ProjectData[]): void {
    const digitalSeal = securityGuard.generateExportSeal();
    const payload = {
      system: 'Project Monitoring dan Controling',
      author: 'PAUL',
      security_seal: digitalSeal,
      export_date: new Date().toISOString(),
      total_records: projects.length,
      data: projects,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Project_Monitoring_dan_Controling_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
