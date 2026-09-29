import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ProjectData } from '../types/project';
import { INITIAL_PROJECTS } from '../data/initialData';
import { calculatePullingFoPercentage, calculatePullingCoaxPercentage, calculatePullingPercentage } from '../data/dropdownOptions';
import { securityGuard } from './securityGuard';
import * as XLSX from 'xlsx';
import { 
  PROJECT_LIST_COLUMNS, 
  CONSTRUCTION_PLAN_COLUMNS, 
  STATUS_PROJECT_COLUMNS, 
  STATUS_CONSTRUCTION_COLUMNS,
  PROJECT_TRACKING_PIPELINE_COLUMNS 
} from '../data/tabColumns';
import { 
  PicExportScope, 
  filterProjectsByPic, 
  getPicScopeInfo 
} from '../utils/picScope';

const COLLECTION_NAME = 'projects';

/**
 * Helper to remove `undefined` fields which Firestore rejects
 */
function sanitizeForFirestore(data: Partial<ProjectData>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Normalizes project properties for display and calculations
 */
function normalizeProject(p: ProjectData, idx: number): ProjectData {
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

  const cleanPmoId = p.pmoId ? p.pmoId.replace(/\s+(GOV.*)$/i, '').trim() : '';

  const foProgress = p.pullingCableFoProgress || calculatePullingFoPercentage(
    p.statusPullingCableFo || 'Not Yet',
    p.pullingFoPanjangSelesai || p.pullingPanjangSelesai,
    p.pullingFoPanjangTotal || p.pullingPanjangTotal || p.panjangRelokasi,
    p.statusConstruction
  );

  const coaxLength = Number(p.panjangRelokasiCoax !== undefined ? p.panjangRelokasiCoax : (p.pullingCoaxPanjangTotal || 0));
  const coaxTotal = Number(p.pullingCoaxPanjangTotal !== undefined ? p.pullingCoaxPanjangTotal : coaxLength);
  const coaxDone = Number(p.pullingCoaxPanjangSelesai || 0);

  const isCoaxNotUsed = !p.statusPullingCableCoax || p.statusPullingCableCoax === 'No COAX' || p.statusPullingCableCoax === 'N/A';
  let coaxProgress = p.pullingCableCoaxProgress;

  if (isCoaxNotUsed && (!coaxProgress || coaxProgress === '0%')) {
    coaxProgress = p.statusPullingCableCoax === 'No COAX' ? 'No COAX' : 'N/A';
  } else if (!coaxProgress || coaxProgress === 'N/A' || coaxProgress === 'No COAX') {
    coaxProgress = calculatePullingCoaxPercentage(
      p.statusPullingCableCoax || 'N/A',
      coaxDone,
      coaxTotal,
      p.statusConstruction
    );
  }

  const overallPulling = p.pullingCableProgress || (
    isCoaxNotUsed
      ? (foProgress || '0%')
      : calculatePullingPercentage(
          p.statusPullingCableFo || 'Not Yet',
          p.statusPullingCableCoax || 'N/A',
          p.statusConstruction
        )
  );

  let vendor = (p.namaVendor || '').trim().toUpperCase();
  if (vendor.includes('MENTARI (RESIGN)') || vendor.includes('MENTARI ( RESIGN )')) {
    vendor = 'PT.MENTARI';
  }

  return {
    ...p,
    no: Number(p.no) || idx + 1,
    namaVendor: vendor,
    pmoId: cleanPmoId || p.pmoId,
    projectCategory: cat || 'GOV IPPJU',
    picSectionHead: pic,
    zona: zona || 'Jabo 1',
    panjangRelokasiCoax: coaxLength,
    pullingCoaxPanjangTotal: coaxTotal,
    pullingCableFoProgress: foProgress,
    pullingCableCoaxProgress: coaxProgress,
    pullingCableProgress: overallPulling,
  };
}

export const storageService = {
  /**
   * Load all projects from Cloud Firestore.
   */
  async loadProjects(): Promise<ProjectData[]> {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(colRef);

      if (snapshot.empty) {
        console.log('Firestore collection is empty. Seeding initial 188 projects...');
        const initial = [...INITIAL_PROJECTS].sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0));
        await this.saveProjects(initial);
        return initial.map(normalizeProject);
      }

      const projects: ProjectData[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ProjectData;
        projects.push({ ...data, id: docSnap.id });
      });

      projects.sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0));
      return projects.map(normalizeProject);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    }
  },

  /**
   * Real-time listener for Firestore projects collection using onSnapshot.
   * Enables seamless multi-user collaboration and live updates across dashboards.
   */
  subscribeProjects(
    onData: (projects: ProjectData[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe {
    const colRef = collection(db, COLLECTION_NAME);

    return onSnapshot(
      colRef,
      (snapshot) => {
        const projects: ProjectData[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ProjectData;
          projects.push({ ...data, id: docSnap.id });
        });

        projects.sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0));
        onData(projects.map(normalizeProject));
      },
      (error) => {
        if (onError) {
          onError(error);
        }
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      }
    );
  },

  /**
   * Save or update a single project in Cloud Firestore
   */
  async saveProject(project: ProjectData): Promise<{ success: boolean; timestamp: string }> {
    const timestamp = new Date().toISOString();
    try {
      const docRef = doc(db, COLLECTION_NAME, project.id);
      const sanitized = sanitizeForFirestore({
        ...project,
        updatedAt: timestamp,
      });
      await setDoc(docRef, sanitized, { merge: true });
      return { success: true, timestamp };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${project.id}`);
    }
  },

  /**
   * Batch save / update multiple projects in Cloud Firestore (chunks of 400 for batch limits)
   */
  async saveProjects(projects: ProjectData[]): Promise<{ success: boolean; timestamp: string }> {
    const timestamp = new Date().toISOString();
    try {
      const BATCH_SIZE = 400;
      for (let i = 0; i < projects.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const slice = projects.slice(i, i + BATCH_SIZE);
        for (const p of slice) {
          const docRef = doc(db, COLLECTION_NAME, p.id);
          const sanitized = sanitizeForFirestore({
            ...p,
            updatedAt: timestamp,
          });
          batch.set(docRef, sanitized, { merge: true });
        }
        await batch.commit();
      }
      return { success: true, timestamp };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    }
  },

  /**
   * Delete a single project from Cloud Firestore
   */
  async deleteProject(projectId: string): Promise<{ success: boolean; timestamp: string }> {
    const timestamp = new Date().toISOString();
    try {
      const docRef = doc(db, COLLECTION_NAME, projectId);
      await deleteDoc(docRef);
      return { success: true, timestamp };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${projectId}`);
    }
  },

  /**
   * Clear all projects from Cloud Firestore
   */
  async clearAllProjects(): Promise<{ success: boolean; timestamp: string }> {
    const timestamp = new Date().toISOString();
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(colRef);
      
      const BATCH_SIZE = 400;
      const docs = snapshot.docs;
      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const slice = docs.slice(i, i + BATCH_SIZE);
        for (const docSnap of slice) {
          batch.delete(docSnap.ref);
        }
        await batch.commit();
      }
      return { success: true, timestamp };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, COLLECTION_NAME);
    }
  },

  /**
   * Restore initial 188 projects into Cloud Firestore
   */
  async restoreDefaultProjects(): Promise<ProjectData[]> {
    try {
      // First clean current collection
      await this.clearAllProjects();
      
      const initial = [...INITIAL_PROJECTS].sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0));
      await this.saveProjects(initial);
      return initial.map(normalizeProject);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    }
  },

  // Export current data to Excel-ready CSV (with optional PIC / Section Head filter)
  exportToCsv(projects: ProjectData[], picFilter?: PicExportScope | string): { success: boolean; count: number; filename: string; label: string } {
    if (!projects || projects.length === 0) return { success: false, count: 0, filename: '', label: '' };

    const scope: PicExportScope = (picFilter as PicExportScope) || 'ALL';
    const targetProjects = filterProjectsByPic(projects, scope);
    const scopeInfo = getPicScopeInfo(scope);

    if (targetProjects.length === 0) return { success: false, count: 0, filename: '', label: scopeInfo.label };

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
      'Panjang Relokasi FO (m)',
      'Panjang Relokasi COAX (m)',
      'Target Meter Galian (m)',
      'Meter Galian Selesai (m)',
      'Galian Sipil Progress',
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
      'Meter Selesai FO (m)',
      'Target Meter FO (m)',
      'Pulling FO Progress',
      'Status Pulling Cable Coax',
      'Meter Selesai COAX (m)',
      'Target Meter COAX (m)',
      'Pulling COAX Progress',
      'Status CO',
      'Status CO Coax',
      'Laporan Opname',
      'Closing SAP',
      'Kebutuhan Material PO SAP',
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
      escapeCsv(p.panjangRelokasiCoax || 0),
      escapeCsv(p.galianPanjangTotal || p.panjangRelokasi || 0),
      escapeCsv(p.galianPanjangSelesai || 0),
      escapeCsv(p.galianSipilProgress || '0%'),
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
      escapeCsv(p.pullingFoPanjangSelesai || 0),
      escapeCsv(p.pullingFoPanjangTotal || p.panjangRelokasi || 0),
      escapeCsv(p.pullingCableFoProgress || '0%'),
      escapeCsv(p.statusPullingCableCoax),
      escapeCsv(p.pullingCoaxPanjangSelesai || 0),
      escapeCsv(p.pullingCoaxPanjangTotal || p.panjangRelokasiCoax || 0),
      escapeCsv(p.pullingCableCoaxProgress || '0%'),
      escapeCsv(p.statusCo),
      escapeCsv(p.statusCoCoax),
      escapeCsv(p.laporanOpname),
      escapeCsv(p.closingSap),
      escapeCsv(p.kebutuhanMaterialPoSap),
      escapeCsv(p.galianAksesProgress),
      escapeCsv(p.galianCrossingProgress),
      escapeCsv(p.installHhProgress),
      escapeCsv(p.installPoleProgress),
      escapeCsv(p.pullingCableProgress),
      escapeCsv(p.projectSapId),
      escapeCsv(p.remarksConstruction),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `Project_Monitoring_Report_${scopeInfo.filenameKey}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      count: targetProjects.length,
      filename,
      label: scopeInfo.label,
    };
  },

  // Export current data to real Multi-Sheet Excel Workbook (.xlsx) with synchronized sheets
  exportToMultiSheetExcel(projects: ProjectData[], picFilter?: PicExportScope | string): {
    success: boolean;
    count: number;
    filename: string;
    label: string;
  } {
    if (!projects || projects.length === 0) {
      return { success: false, count: 0, filename: '', label: '' };
    }

    const scope: PicExportScope = (picFilter as PicExportScope) || 'ALL';
    const targetProjects = filterProjectsByPic(projects, scope);
    const scopeInfo = getPicScopeInfo(scope);

    if (targetProjects.length === 0) {
      return { success: false, count: 0, filename: '', label: scopeInfo.label };
    }

    const wb = XLSX.utils.book_new();

    // Helper to build worksheet from column definition
    const buildSheet = (columns: { key: keyof ProjectData | 'no'; label: string }[], dataList: ProjectData[]) => {
      const headers = columns.map((col) => col.label);
      const rows = dataList.map((p, idx) =>
        columns.map((col) => {
          if (col.key === 'no') return idx + 1;
          const val = p[col.key as keyof ProjectData];
          return val !== undefined && val !== null ? val : '';
        })
      );
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws['!cols'] = columns.map((col) => ({
        wch: Math.max(col.label.length + 3, 14),
      }));
      return ws;
    };

    // Sheet 1: Project List
    XLSX.utils.book_append_sheet(wb, buildSheet(PROJECT_LIST_COLUMNS, targetProjects), 'Project List');

    // Sheet 2: Construction & Plan (includes Galian Sipil & Relokasi Meter)
    XLSX.utils.book_append_sheet(wb, buildSheet(CONSTRUCTION_PLAN_COLUMNS, targetProjects), 'Construction & Plan');

    // Sheet 3: Status Project
    XLSX.utils.book_append_sheet(wb, buildSheet(STATUS_PROJECT_COLUMNS, targetProjects), 'Status Project');

    // Sheet 4: Status Construction
    XLSX.utils.book_append_sheet(wb, buildSheet(STATUS_CONSTRUCTION_COLUMNS, targetProjects), 'Status Construction');

    // Sheet 5: Project Tracking Pipeline
    XLSX.utils.book_append_sheet(wb, buildSheet(PROJECT_TRACKING_PIPELINE_COLUMNS, targetProjects), 'Pipeline Tracking');

    // If exporting ALL, also generate dedicated sheets per PIC (Mega, Aris, Chaerul, Daud)
    if (scope === 'ALL') {
      const pics: ('Mega' | 'Aris' | 'Chaerul' | 'Daud')[] = ['Mega', 'Aris', 'Chaerul', 'Daud'];
      pics.forEach((pic) => {
        const picProjects = filterProjectsByPic(projects, pic);
        if (picProjects.length > 0) {
          XLSX.utils.book_append_sheet(wb, buildSheet(PROJECT_TRACKING_PIPELINE_COLUMNS, picProjects), `PIC ${pic}`);
        }
      });
    }

    const filename = `Project_Monitoring_Report_${scopeInfo.filenameKey}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    wb.Props = {
      Title: `Project Monitoring Report - ${scopeInfo.label}`,
      Subject: `Multi-Sheet Project Management Master Report (${scopeInfo.label} - ${targetProjects.length} Proyek)`,
      Author: 'PAUL',
      Company: 'PMO System © PAUL',
      Comments: scopeInfo.sublabel,
      CreatedDate: new Date(),
    };

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
