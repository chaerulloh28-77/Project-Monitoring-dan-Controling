import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  HardHat, 
  Layers, 
  Activity, 
  CheckCircle, 
  Info,
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  GitCommit,
  LayoutGrid,
  Table as TableIcon,
  Grid3X3,
  AlignJustify
} from 'lucide-react';
import { ProjectData, TabKey } from './types/project';
import { 
  PROJECT_LIST_COLUMNS, 
  CONSTRUCTION_PLAN_COLUMNS, 
  STATUS_PROJECT_COLUMNS, 
  STATUS_CONSTRUCTION_COLUMNS,
  PROJECT_TRACKING_PIPELINE_COLUMNS,
  TAB_CONFIG 
} from './data/tabColumns';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { TableView } from './components/TableView';
import { ProjectCardGrid } from './components/ProjectCardGrid';
import { PipelineBoard } from './components/PipelineBoard';
import { SidebarNav } from './components/SidebarNav';
import { TabVisualIcon } from './components/TabVisualIcon';
import { ProjectFormModal } from './components/ProjectFormModal';
import { ProjectDetailDrawer } from './components/ProjectDetailDrawer';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { TroubleRecoveryModal } from './components/TroubleRecoveryModal';

export default function App() {
  // Master projects dataset
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('project-list');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZona, setSelectedZona] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [selectedPic, setSelectedPic] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState<{ key: string; value: string } | null>(null);

  // View Mode: 'normal' (tabel standar) | 'compact' (tabel ringkas/padat) | 'card' (card grid)
  const [tableViewMode, setTableViewMode] = useState<'normal' | 'compact' | 'card'>('normal');

  // Tab 5 Pipeline View Mode: 'board' or 'sheet'
  const [pipelineViewMode, setPipelineViewMode] = useState<'board' | 'sheet'>('board');

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals & Drawers state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<ProjectData | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectData | null>(null);

  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  // Show temporary toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const loaded = storageService.loadProjects();
    setProjects(loaded);
    setLastSavedTime(new Date().toISOString());
  }, []);

  // 2. Auto-save whenever projects state updates
  const persistChanges = useCallback((updatedProjects: ProjectData[], reason = 'Perubahan data') => {
    setProjects(updatedProjects);
    const result = storageService.saveProjects(updatedProjects, reason);
    if (result.success) {
      setLastSavedTime(result.timestamp);
    }
  }, []);

  // Filter projects based on active filters
  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      // Direct KPI Card filter handling for 100% precision
      if (activeKpiFilter) {
        if (activeKpiFilter.key === 'Masih Review Dinas' && item.projectStatus !== 'Masih Review Dinas') {
          return false;
        }
        if (activeKpiFilter.key === 'Has Length' && (!item.panjangRelokasi || Number(item.panjangRelokasi) <= 0)) {
          return false;
        }
        if (activeKpiFilter.key === 'In Progress' && item.projectStatus !== 'In Progress' && item.statusConstruction !== 'Pulling Cable') {
          return false;
        }
        if (activeKpiFilter.key === 'PO Released' && item.statusPengajuanMr !== 'Released' && item.statusPengajuanPo !== 'Released') {
          return false;
        }
        if (activeKpiFilter.key === 'Pulling Cable' && item.statusPullingCableFo !== 'In Progress' && item.statusPullingCableCoax !== 'In Progress' && item.statusConstruction !== 'Pulling Cable') {
          return false;
        }
      }

      // Search term matches across multiple fields
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQuery = 
          (item.pmoId || '').toLowerCase().includes(query) ||
          (item.projectDescription || '').toLowerCase().includes(query) ||
          (item.projectId || '').toLowerCase().includes(query) ||
          (item.picSectionHead || '').toLowerCase().includes(query) ||
          (item.namaVendor || '').toLowerCase().includes(query) ||
          (item.mrNumber || '').toLowerCase().includes(query) ||
          (item.poNumber || '').toLowerCase().includes(query) ||
          (item.areaKota || '').toLowerCase().includes(query) ||
          (item.zona || '').toLowerCase().includes(query) ||
          (item.projectCategory || '').toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      if (selectedZona && item.zona !== selectedZona) return false;
      if (selectedArea && item.areaKota !== selectedArea) return false;
      if (selectedVendor && item.namaVendor !== selectedVendor) return false;
      if (selectedCategory && item.projectCategory !== selectedCategory) return false;
      if (selectedStatus && item.projectStatus !== selectedStatus) return false;
      if (selectedQuarter && item.quarter !== selectedQuarter) return false;
      if (selectedPic && item.picSectionHead !== selectedPic) return false;

      return true;
    });
  }, [projects, activeKpiFilter, searchTerm, selectedZona, selectedArea, selectedVendor, selectedCategory, selectedStatus, selectedQuarter, selectedPic]);

  // Current tab columns mapping
  const currentColumns = useMemo(() => {
    switch (activeTab) {
      case 'project-list':
        return PROJECT_LIST_COLUMNS;
      case 'construction-plan':
        return CONSTRUCTION_PLAN_COLUMNS;
      case 'status-project':
        return STATUS_PROJECT_COLUMNS;
      case 'status-construction':
        return STATUS_CONSTRUCTION_COLUMNS;
      case 'project-tracking-pipeline':
        return PROJECT_TRACKING_PIPELINE_COLUMNS;
      default:
        return PROJECT_LIST_COLUMNS;
    }
  }, [activeTab]);

  // Handler: Add / Update Project (CRUD: Create & Edit)
  const handleSaveProject = (data: ProjectData) => {
    const isEdit = projects.some((p) => p.id === data.id);
    let updated: ProjectData[];

    if (isEdit) {
      updated = projects.map((p) => (p.id === data.id ? data : p));
      persistChanges(updated, `Edit project ${data.pmoId}`);
      showToast(`Project ${data.pmoId} berhasil disimpan otomatis.`);
    } else {
      updated = [data, ...projects];
      persistChanges(updated, `Tambah project ${data.pmoId}`);
      showToast(`Project baru ${data.pmoId} berhasil ditambahkan dan disimpan.`);
    }

    // Also update detail drawer if viewing
    if (detailProject && detailProject.id === data.id) {
      setDetailProject(data);
    }
  };

  // Handler: Delete Project (CRUD: Delete)
  const handleDeleteProject = (target: ProjectData) => {
    const updated = projects.filter((p) => p.id !== target.id);
    persistChanges(updated, `Hapus project ${target.pmoId}`);
    showToast(`Project ${target.pmoId} berhasil dihapus dari semua sheet.`);
    
    if (detailProject && detailProject.id === target.id) {
      setIsDetailDrawerOpen(false);
      setDetailProject(null);
    }
  };

  // Handler: Inline cell quick update
  const handleQuickUpdateCell = (projectId: string, field: keyof ProjectData, value: string) => {
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          [field]: value,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    persistChanges(updated, `Quick edit sel ${String(field)}`);
    showToast(`Perubahan sel disimpan otomatis.`);
  };

  // Handler: Quick jumping across tabs for a project
  const handleJumpToTab = (tab: TabKey, project: ProjectData) => {
    setActiveTab(tab);
    setSearchTerm(project.pmoId); // Filter immediately to this project
    showToast(`Membuka ${project.pmoId} di ${tab}`);
  };

  // Handler: Quick filter from StatsBar cards
  const handleQuickFilter = (key: string, value: string) => {
    if (key === 'all') {
      handleResetFilters();
      showToast('Menampilkan seluruh data project');
      return;
    }
    
    // Toggle active KPI filter
    if (activeKpiFilter?.key === value) {
      setActiveKpiFilter(null);
      showToast('Filter status dinonaktifkan');
    } else {
      setActiveKpiFilter({ key: value, value });
      showToast(`Memfilter tampilan: ${value}`);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedZona('');
    setSelectedArea('');
    setSelectedVendor('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedQuarter('');
    setSelectedPic('');
    setActiveKpiFilter(null);
  };

  const currentTabMeta = TAB_CONFIG.find((t) => t.id === activeTab) || TAB_CONFIG[0];

  return (
    <div className="h-screen bg-slate-100 flex flex-col antialiased text-slate-800 overflow-hidden">
      {/* 1. Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onNewProject={() => {
          setEditingProject(null);
          setIsFormModalOpen(true);
        }}
        onOpenRecovery={() => setIsRecoveryModalOpen(true)}
        onExportCsv={() => storageService.exportToCsv(projects)}
        lastSavedTime={lastSavedTime}
        totalProjects={projects.length}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Main Body Container with Left Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Menu */}
        <SidebarNav
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          totalProjects={projects.length}
        />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {/* KPI Stats Summary Bar */}
            <StatsBar 
              projects={projects} 
              onQuickFilter={handleQuickFilter}
              activeFilterValue={activeKpiFilter?.key || selectedStatus || (searchTerm ? 'Search' : '')}
            />

        {/* Tab Header Banner with Sheet Information & Modern Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3.5 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-3">
            <TabVisualIcon tabKey={activeTab} isActive={true} size="lg" variant="solid" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">{currentTabMeta.label}</h2>
                <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  {filteredProjects.length} data
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {/* View Mode Switcher: Tabel Standar, Tabel Compact, Card Grid */}
            {activeTab !== 'project-tracking-pipeline' || pipelineViewMode === 'sheet' ? (
              <div className="flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200/90 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTableViewMode('normal');
                    showToast('Tampilan Tabel Standar aktif');
                  }}
                  title="Tampilan Tabel Standar (Lebar baris normal)"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    tableViewMode === 'normal'
                      ? 'bg-white text-sky-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tabel Normal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTableViewMode('compact');
                    showToast('Tampilan Tabel Compact (Rapat & Padat) aktif');
                  }}
                  title="Tampilan Tabel Compact (Baris lebih padat, muat lebih banyak data)"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    tableViewMode === 'compact'
                      ? 'bg-white text-sky-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tabel Compact</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTableViewMode('card');
                    showToast('Tampilan Card Grid aktif');
                  }}
                  title="Tampilan Kartu Kotak Grid (Card Grid)"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    tableViewMode === 'card'
                      ? 'bg-white text-sky-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Card Grid</span>
                </button>
              </div>
            ) : null}

            {/* View Switcher for Tab 5 Pipeline */}
            {activeTab === 'project-tracking-pipeline' && (
              <div className="flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200/90 text-xs">
                <button
                  type="button"
                  onClick={() => setPipelineViewMode('board')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    pipelineViewMode === 'board'
                      ? 'bg-white text-purple-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Pipeline Board</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPipelineViewMode('sheet')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    pipelineViewMode === 'sheet'
                      ? 'bg-white text-purple-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Sheet Table</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setEditingProject(null);
                setIsFormModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg transition-all shadow-sm shadow-sky-600/25 active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Data Baru</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedZona={selectedZona}
          onZonaChange={setSelectedZona}
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
          selectedVendor={selectedVendor}
          onVendorChange={setSelectedVendor}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedQuarter={selectedQuarter}
          onQuarterChange={setSelectedQuarter}
          selectedPic={selectedPic}
          onPicChange={setSelectedPic}
          onResetFilters={handleResetFilters}
          totalResults={filteredProjects.length}
          allProjects={projects}
        />

        {/* 3. Main View Area (Board, Card Grid, or Table View) */}
        {activeTab === 'project-tracking-pipeline' && pipelineViewMode === 'board' ? (
          <PipelineBoard
            projects={filteredProjects}
            onViewDetail={(proj) => {
              setDetailProject(proj);
              setIsDetailDrawerOpen(true);
            }}
            onEdit={(proj) => {
              setEditingProject(proj);
              setIsFormModalOpen(true);
            }}
            onJumpToTab={handleJumpToTab}
          />
        ) : tableViewMode === 'card' ? (
          <ProjectCardGrid
            data={filteredProjects}
            activeTab={activeTab}
            onEdit={(proj) => {
              setEditingProject(proj);
              setIsFormModalOpen(true);
            }}
            onDelete={(proj) => {
              setProjectToDelete(proj);
              setIsDeleteModalOpen(true);
            }}
            onViewDetail={(proj) => {
              setDetailProject(proj);
              setIsDetailDrawerOpen(true);
            }}
            onJumpToTab={handleJumpToTab}
          />
        ) : (
          <TableView
            columns={currentColumns}
            data={filteredProjects}
            activeTab={activeTab}
            isCompact={tableViewMode === 'compact'}
            onEdit={(proj) => {
              setEditingProject(proj);
              setIsFormModalOpen(true);
            }}
            onDelete={(proj) => {
              setProjectToDelete(proj);
              setIsDeleteModalOpen(true);
            }}
            onViewDetail={(proj) => {
              setDetailProject(proj);
              setIsDetailDrawerOpen(true);
            }}
            onJumpToTab={handleJumpToTab}
            onQuickUpdateCell={handleQuickUpdateCell}
          />
        )}
          </div>
        </main>
      </div>

      {/* 4. CRUD Modals & Drawers */}
      
      {/* Create / Edit Project Modal */}
      <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        initialData={editingProject}
        totalProjects={projects.length}
      />

      {/* Complete Project Detail Drawer (All Tabs for selected row) */}
      <ProjectDetailDrawer
        isOpen={isDetailDrawerOpen}
        project={detailProject}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setDetailProject(null);
        }}
        onEdit={(proj) => {
          setIsDetailDrawerOpen(false);
          setEditingProject(proj);
          setIsFormModalOpen(true);
        }}
        onJumpToTab={handleJumpToTab}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        project={projectToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDeleteProject}
      />

      {/* Trouble Recovery & Auto-save Management Modal */}
      <TroubleRecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        onRestore={(restored) => {
          setProjects(restored);
          setLastSavedTime(new Date().toISOString());
          showToast('Data berhasil dipulihkan dari cadangan.');
        }}
        currentProjects={projects}
        lastSavedTime={lastSavedTime}
      />

      {/* Live Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
