import { ProjectData, BackupSnapshot } from '../types/project';
import { INITIAL_PROJECTS } from '../data/initialData';

const STORAGE_KEY = 'PMO_PROJECTS_DATA_V1';
const BACKUPS_KEY = 'PMO_PROJECTS_BACKUPS_V1';
const CRASH_GUARD_KEY = 'PMO_CRASH_GUARD_FLAG';

export const storageService = {
  // Load data with error resilience and category migration
  loadProjects(): ProjectData[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveProjects(INITIAL_PROJECTS, 'Initial load initialization');
        return INITIAL_PROJECTS;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Normalize any old category names to standard: GOV IPPJU, GOV APJATEL, GOV SJUT
        const normalized = parsed.map((p: ProjectData) => {
          let cat = p.projectCategory;
          if (cat === 'GOV Apjatel') cat = 'GOV APJATEL';
          if (cat === 'GOV Bina Marga' || cat === 'B2B Commercial' || cat === 'FTTH Relocation') {
            cat = 'GOV SJUT';
          }

          // Normalize any non-standard PIC
          let pic = p.picSectionHead;
          if (!pic || pic === 'Budi Santoso') {
            pic = 'Aris';
          }

          return {
            ...p,
            projectCategory: cat || 'GOV IPPJU',
            picSectionHead: pic,
          };
        });
        return normalized;
      }
      return INITIAL_PROJECTS;
    } catch (err) {
      console.error('Failed to load projects from localStorage:', err);
      return INITIAL_PROJECTS;
    }
  },

  // Save data automatically and create rolling backup snapshots
  saveProjects(projects: ProjectData[], reason = 'Auto save'): { success: boolean; timestamp: string } {
    const timestamp = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      
      // Also maintain disaster-recovery snapshots (keep last 8)
      try {
        const rawBackups = localStorage.getItem(BACKUPS_KEY);
        const backups: BackupSnapshot[] = rawBackups ? JSON.parse(rawBackups) : [];
        const newSnapshot: BackupSnapshot = {
          timestamp,
          count: projects.length,
          data: projects,
          reason,
        };
        const updatedBackups = [newSnapshot, ...backups.slice(0, 7)];
        localStorage.setItem(BACKUPS_KEY, JSON.stringify(updatedBackups));
      } catch (backupErr) {
        console.warn('Backup snapshot rotation warning:', backupErr);
      }

      return { success: true, timestamp };
    } catch (err) {
      console.error('Storage save error:', err);
      return { success: false, timestamp };
    }
  },

  // Retrieve backup snapshots for disaster recovery
  getBackups(): BackupSnapshot[] {
    try {
      const raw = localStorage.getItem(BACKUPS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Failed to read backups:', err);
      return [];
    }
  },

  // Restore from a specific backup
  restoreBackup(snapshot: BackupSnapshot): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot.data));
      return true;
    } catch (err) {
      console.error('Failed to restore backup:', err);
      return false;
    }
  },

  // Reset to factory initial data
  resetToInitial(): ProjectData[] {
    this.saveProjects(INITIAL_PROJECTS, 'Reset to default data');
    return INITIAL_PROJECTS;
  },

  // Export current data to Excel-ready CSV
  exportToCsv(projects: ProjectData[]): void {
    if (!projects || projects.length === 0) return;

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
      'Tanggal Pengajuan MR',
      'Tanggal Pengajuan PO',
      'Status Pengajuan MR',
      'Status Pengajuan PO',
      'MR Number',
      'PO Number',
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

    const rows = projects.map((p, idx) => [
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
      escapeCsv(p.tanggalPengajuanMr),
      escapeCsv(p.tanggalPengajuanPo),
      escapeCsv(p.statusPengajuanMr),
      escapeCsv(p.statusPengajuanPo),
      escapeCsv(p.mrNumber),
      escapeCsv(p.poNumber),
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

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PMO_Telecom_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Export current data to JSON
  exportToJson(projects: ProjectData[]): void {
    const jsonStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PMO_Telecom_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
