import { ProjectData } from '../types/project';

export type JaboExportScope = 'ALL' | 'Jabo 1' | 'Jabo 2' | 'Jabo 3';

/**
 * Filter rules based on business specification:
 * 
 * 1. Jabo 1:
 *    - Area Central dan West
 * 
 * 2. Jabo 2:
 *    - Area South meliputi: Jakarta Timur, Jakarta Selatan, Depok, Kab. Bogor, Kota Bogor,
 *      Tangerang Selatan, Tangerang, Cilegon, Serang, Banten.
 *    - Khusus Jakarta Timur & Jakarta Selatan harus dengan PIC/Section Head Aris/Chaerul.
 * 
 * 3. Jabo 3:
 *    - Area NE, Bekasi, Karawang
 */

export function isProjectInJabo1(p: ProjectData): boolean {
  const area = (p.areaKota || '').toLowerCase().trim();
  
  if (
    area === 'central' || 
    area === 'west' || 
    area.includes('central') || 
    area.includes('west')
  ) {
    return true;
  }
  
  // Fallback: If marked as Jabo 1 and does not belong to Jabo 3 or Jabo 2 areas
  if (p.zona === 'Jabo 1') {
    const isJabo3 = area.includes('ne') || area.includes('beka') || area.includes('karawang');
    const isJabo2 = area.includes('south') || area.includes('tangerang') || area.includes('banten');
    return !isJabo3 && !isJabo2;
  }
  
  return false;
}

export function isProjectInJabo3(p: ProjectData): boolean {
  const area = (p.areaKota || '').toLowerCase().trim();
  const desc = (p.projectDescription || '').toLowerCase();

  // Area NE, Bekasi, Karawang
  if (
    area === 'ne' || 
    area === 'beka' || 
    area === 'bekasi' || 
    area === 'karawang' || 
    area.includes('ne') || 
    area.includes('beka') || 
    area.includes('karawang') ||
    desc.includes('bekasi') ||
    desc.includes('karawang')
  ) {
    return true;
  }

  // Fallback: If marked as Jabo 3 and does not belong to Central/West or South/Tangerang
  if (p.zona === 'Jabo 3') {
    const isJabo1 = area.includes('central') || area.includes('west');
    const isJabo2 = area.includes('south') || area.includes('tangerang');
    return !isJabo1 && !isJabo2;
  }

  return false;
}

export function isProjectInJabo2(p: ProjectData): boolean {
  // Disjoint check: Prioritize explicit Jabo 1 and Jabo 3 rules first
  if (isProjectInJabo1(p)) return false;
  if (isProjectInJabo3(p)) return false;

  const area = (p.areaKota || '').toLowerCase().trim();
  const desc = (p.projectDescription || '').toLowerCase();
  const pic = (p.picSectionHead || '').toLowerCase().trim();
  const zona = (p.zona || '').toLowerCase().trim();

  // Check if project is Jakarta Timur or Jakarta Selatan
  const isJaktimOrJaksel = 
    area.includes('timur') || 
    area.includes('selatan') ||
    desc.includes('jakarta timur') || 
    desc.includes('jakarta selatan') ||
    desc.includes('jak-tim') || 
    desc.includes('jak-sel') ||
    desc.includes('jaktim') || 
    desc.includes('jaksel');

  if (isJaktimOrJaksel) {
    // Specifically restricted to PIC Aris or Chaerul
    return pic.includes('aris') || pic.includes('chaerul');
  }

  // Matches South or Tangerang or coverage areas (Depok, Bogor, Cilegon, Serang, Banten, etc.)
  const matchesArea = 
    area === 'south' || 
    area === 'tangerang' ||
    area.includes('south') || 
    area.includes('tangerang') || 
    area.includes('tangsel') ||
    area.includes('depok') || 
    area.includes('bogor') || 
    area.includes('cilegon') || 
    area.includes('serang') || 
    area.includes('banten') ||
    zona === 'jabo 2';

  return matchesArea;
}

/**
 * Filter projects based on the chosen export scope
 */
export function filterProjectsByScope(projects: ProjectData[], scope: JaboExportScope): ProjectData[] {
  if (scope === 'ALL') {
    return projects;
  }
  if (scope === 'Jabo 1') {
    return projects.filter(isProjectInJabo1);
  }
  if (scope === 'Jabo 2') {
    return projects.filter(isProjectInJabo2);
  }
  if (scope === 'Jabo 3') {
    return projects.filter(isProjectInJabo3);
  }
  return projects;
}

/**
 * Get display info for each Jabo scope
 */
export function getScopeInfo(scope: JaboExportScope) {
  switch (scope) {
    case 'Jabo 1':
      return {
        label: 'Report Khusus Jabo 1',
        description: 'Area Central & West',
        tag: 'Central & West',
        filenameKey: 'Jabo_1_Central_West',
      };
    case 'Jabo 2':
      return {
        label: 'Report Khusus Jabo 2',
        description: 'Area South, Tangerang, Banten, Depok, Bogor (Jaktim & Jaksel khusus PIC Aris/Chaerul)',
        tag: 'South, Banten & PIC Aris/Chaerul',
        filenameKey: 'Jabo_2_South_Banten_Aris_Chaerul',
      };
    case 'Jabo 3':
      return {
        label: 'Report Khusus Jabo 3',
        description: 'Area NE, Bekasi, Karawang',
        tag: 'NE, Bekasi, Karawang',
        filenameKey: 'Jabo_3_NE_Bekasi_Karawang',
      };
    case 'ALL':
    default:
      return {
        label: 'Semua Report (Semua Zona)',
        description: 'Jabo 1, Jabo 2, Jabo 3 • Seluruh Proyek',
        tag: 'Semua Zona',
        filenameKey: 'Semua_Zona',
      };
  }
}
