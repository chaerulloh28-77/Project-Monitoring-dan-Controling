import { ProjectData } from '../types/project';

export type PicExportScope = 'ALL' | 'Mega' | 'Aris' | 'Chaerul' | 'Daud';

export interface PicExportOption {
  scope: PicExportScope;
  label: string;
  sublabel: string;
  filenameKey: string;
  picName: string;
  color: string;
}

export const PIC_EXPORT_OPTIONS: PicExportOption[] = [
  {
    scope: 'ALL',
    label: 'Semua Report (Semua PIC)',
    sublabel: 'Mega, Aris, Chaerul, Daud • Seluruh Data Proyek',
    filenameKey: 'Semua_PIC_All_Report',
    picName: 'Semua PIC',
    color: 'emerald',
  },
  {
    scope: 'Mega',
    label: 'Report PIC Mega',
    sublabel: 'Proyek Relokasi Area Central & West (Jabo 1)',
    filenameKey: 'Report_PIC_Mega',
    picName: 'Mega',
    color: 'sky',
  },
  {
    scope: 'Aris',
    label: 'Report PIC Aris',
    sublabel: 'Proyek Relokasi Area South & Jaktim/Jaksel',
    filenameKey: 'Report_PIC_Aris',
    picName: 'Aris',
    color: 'purple',
  },
  {
    scope: 'Chaerul',
    label: 'Report PIC Chaerul',
    sublabel: 'Proyek Relokasi Area Jaktim/Jaksel & South (Jabo 2)',
    filenameKey: 'Report_PIC_Chaerul',
    picName: 'Chaerul',
    color: 'amber',
  },
  {
    scope: 'Daud',
    label: 'Report PIC Daud',
    sublabel: 'Proyek Relokasi Area NE, Bekasi, Karawang (Jabo 3)',
    filenameKey: 'Report_PIC_Daud',
    picName: 'Daud',
    color: 'teal',
  },
];

/**
 * Filter projects based on PIC / Section Head
 */
export function filterProjectsByPic(projects: ProjectData[], scope: PicExportScope): ProjectData[] {
  if (!projects || projects.length === 0) return [];
  if (scope === 'ALL') {
    return projects;
  }

  const target = scope.toLowerCase().trim();
  return projects.filter((p) => {
    const pic = (p.picSectionHead || '').toLowerCase().trim();
    if (target === 'chaerul') {
      return pic.includes('chaerul') || pic.includes('chaerulloh');
    }
    if (target === 'aris') {
      return pic.includes('aris') || pic.includes('budi');
    }
    return pic.includes(target);
  });
}

/**
 * Get display info for PIC export scope
 */
export function getPicScopeInfo(scope: PicExportScope) {
  const found = PIC_EXPORT_OPTIONS.find((opt) => opt.scope === scope);
  if (found) {
    return found;
  }
  return PIC_EXPORT_OPTIONS[0];
}
