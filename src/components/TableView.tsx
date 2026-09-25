import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Eye, 
  ExternalLink,
  ChevronDown,
  Layers,
  Check,
  Building,
  AlertCircle
} from 'lucide-react';
import { ProjectData, ColumnDefinition, TabKey, PIC_SECTION_HEAD_OPTIONS } from '../types/project';
import { TabVisualIcon } from './TabVisualIcon';

interface TableViewProps {
  columns: ColumnDefinition[];
  data: ProjectData[];
  activeTab: TabKey;
  isCompact?: boolean;
  onEdit: (project: ProjectData) => void;
  onDelete: (project: ProjectData) => void;
  onViewDetail: (project: ProjectData) => void;
  onJumpToTab: (tab: TabKey, project: ProjectData) => void;
  onQuickUpdateCell?: (projectId: string, field: keyof ProjectData, value: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  columns,
  data,
  activeTab,
  isCompact = false,
  onEdit,
  onDelete,
  onViewDetail,
  onJumpToTab,
  onQuickUpdateCell,
}) => {
  const [sortKey, setSortKey] = useState<keyof ProjectData | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  
  // Inline quick editing state
  const [editingCell, setEditingCell] = useState<{ id: string; key: keyof ProjectData } | null>(null);
  const [cellTempText, setCellTempText] = useState('');

  // Close popup menu on click outside
  React.useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-action-menu]')) {
        setActiveActionMenuId(null);
      }
    };
    if (activeActionMenuId) {
      document.addEventListener('click', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [activeActionMenuId]);

  // Sorting handler
  const handleSort = (key: keyof ProjectData) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Process data sorting
  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey] ?? '';
      const valB = b[sortKey] ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === 'asc'
        ? strA.localeCompare(strB, 'id-ID', { numeric: true })
        : strB.localeCompare(strA, 'id-ID', { numeric: true });
    });
  }, [data, sortKey, sortDirection]);

  // Handle cell edit submit
  const commitCellEdit = (projectId: string, key: keyof ProjectData) => {
    if (onQuickUpdateCell) {
      onQuickUpdateCell(projectId, key, cellTempText);
    }
    setEditingCell(null);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'In Progress':
      case 'Pulling Cable':
      case 'Released':
      case 'Approved':
      case 'Done':
      case 'Sudah Audit':
      case 'Sudah BA':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200/60 font-medium';
      case 'Masih Review Dinas':
      case 'Not Yet':
      case 'Belum':
      case 'Belum di Audit':
      case 'Belum ada BA':
      case 'Drafting':
        return 'text-amber-700 bg-amber-50 border border-amber-200/60 font-medium';
      case 'Cancelled':
      case 'Project Cancel':
      case 'No Need MR':
      case 'No Need PO':
        return 'text-rose-700 bg-rose-50 border border-rose-200/60 font-medium';
      case 'Project Not Started':
        return 'text-slate-600 bg-slate-100 border border-slate-200 font-medium';
      default:
        return 'text-slate-700 bg-slate-50 border border-slate-200/60';
    }
  };

  if (sortedData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-xs">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Tidak ada data ditemukan</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Tidak ada data project yang sesuai dengan kriteria pencarian atau filter yang dipilih. Silakan reset filter atau tambahkan project baru.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
      {/* Spreadsheet Container with custom horizontal scroll */}
      <div className="overflow-x-auto custom-scrollbar relative max-h-[calc(100vh-270px)]">
        <table className="w-full text-xs border-collapse">
          {/* Table Header matching Excel Blue screenshots */}
          <thead>
            <tr className="excel-header-bg text-white border-b excel-header-border sticky top-0 z-20 shadow-xs">
              {/* Fixed Left Actions Header */}
              <th className={`${isCompact ? 'py-1 px-2' : 'py-2.5 px-3'} font-semibold text-center w-[110px] sticky left-0 z-30 excel-header-bg shadow-[2px_0_4px_-1px_rgba(0,0,0,0.2)]`}>
                <div className="flex items-center justify-center gap-1">
                  <span>Aksi</span>
                </div>
              </th>

              {/* Dynamic Columns from Tab Definition */}
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    style={{ minWidth: col.width || '130px', width: col.width }}
                    onClick={() => handleSort(col.key)}
                    className={`${isCompact ? 'py-1 px-2 text-[11px]' : 'py-2.5 px-3'} font-semibold text-white border-r border-sky-600/40 select-none cursor-pointer hover:bg-[#346f96] transition-colors`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="truncate">{col.label}</span>
                      <div className="flex items-center shrink-0">
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-sky-200" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-sky-200" />
                          )
                        ) : (
                          <div className="flex items-center text-sky-200/70 hover:text-white">
                            {/* Excel-like dropdown arrow */}
                            <div className="w-3 h-3 bg-sky-800/60 rounded-xs flex items-center justify-center">
                              <ChevronDown className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-150">
            {sortedData.map((row, index) => {
              const isEven = index % 2 === 0;
              const isHovered = hoveredRowId === row.id;

              return (
                <tr
                  key={row.id}
                  onMouseEnter={() => setHoveredRowId(row.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                  className={`transition-colors ${
                    isHovered
                      ? 'bg-sky-50/70'
                      : isEven
                      ? 'bg-white'
                      : 'bg-slate-50/50'
                  }`}
                >
                  {/* Fixed Sticky Action Column */}
                  <td className={`${isCompact ? 'py-1 px-1.5' : 'py-2 px-2.5'} text-center sticky left-0 z-10 border-r border-slate-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] ${
                    isHovered ? 'bg-sky-50/90' : isEven ? 'bg-white' : 'bg-slate-50'
                  }`}>
                    <div className="flex items-center justify-center gap-1">
                      {/* View Drawer Button */}
                      <button
                        onClick={() => onViewDetail(row)}
                        title="Lihat Detail Semua Tab"
                        className="p-1 rounded text-slate-500 hover:text-sky-600 hover:bg-sky-100/60 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Modal Button */}
                      <button
                        onClick={() => onEdit(row)}
                        title="Edit Project Lengkap"
                        className="p-1 rounded text-slate-500 hover:text-amber-600 hover:bg-amber-100/60 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(row)}
                        title="Hapus Project"
                        className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-100/60 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Cross Tab Navigator Menu Trigger */}
                      <div className="relative" data-action-menu>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionMenuId(activeActionMenuId === row.id ? null : row.id);
                          }}
                          title="Navigasi ke Tab Terkait"
                          className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-100/60 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown for Cross Tab Navigation */}
                        {activeActionMenuId === row.id && (
                          <div 
                            onMouseLeave={() => setActiveActionMenuId(null)}
                            className="absolute left-full top-0 ml-1 z-50 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 text-left"
                          >
                            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                              Loncat ke Tab untuk {row.pmoId}
                            </div>
                            <button
                              onClick={() => {
                                onJumpToTab('project-list', row);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 cursor-pointer"
                            >
                              <TabVisualIcon tabKey="project-list" size="sm" variant="badge" />
                              <span>Tab 1. Project List</span>
                            </button>
                            <button
                              onClick={() => {
                                onJumpToTab('construction-plan', row);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 cursor-pointer"
                            >
                              <TabVisualIcon tabKey="construction-plan" size="sm" variant="badge" />
                              <span>Tab 2. Construction & Plan</span>
                            </button>
                            <button
                              onClick={() => {
                                onJumpToTab('status-project', row);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 cursor-pointer"
                            >
                              <TabVisualIcon tabKey="status-project" size="sm" variant="badge" />
                              <span>Tab 3. Status Project</span>
                            </button>
                            <button
                              onClick={() => {
                                onJumpToTab('status-construction', row);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 cursor-pointer"
                            >
                              <TabVisualIcon tabKey="status-construction" size="sm" variant="badge" />
                              <span>Tab 4. Status Construction</span>
                            </button>
                            <button
                              onClick={() => {
                                onJumpToTab('project-tracking-pipeline', row);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 cursor-pointer"
                            >
                              <TabVisualIcon tabKey="project-tracking-pipeline" size="sm" variant="badge" />
                              <span>Tab 5. Tracking Pipeline</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Dynamic Cell Values */}
                  {columns.map((col) => {
                    const rawValue = row[col.key];
                    const isCellEditing = editingCell?.id === row.id && editingCell?.key === col.key;
                    const valueStr = rawValue !== undefined && rawValue !== null ? String(rawValue) : '';

                    return (
                      <td
                        key={col.key}
                        onDoubleClick={() => {
                          if (onQuickUpdateCell && col.key !== 'no') {
                            setEditingCell({ id: row.id, key: col.key });
                            setCellTempText(valueStr);
                          }
                        }}
                        className={`${isCompact ? 'py-1 px-2 text-[11px]' : 'py-2 px-3 text-xs'} text-slate-800 border-r border-slate-200/70 whitespace-nowrap text-${col.align || 'left'} ${
                          col.isNumeric ? 'font-mono tabular-nums' : ''
                        }`}
                      >
                        {isCellEditing ? (
                          col.key === 'picSectionHead' ? (
                            <select
                              autoFocus
                              value={cellTempText}
                              onChange={(e) => {
                                setCellTempText(e.target.value);
                                if (onQuickUpdateCell) {
                                  onQuickUpdateCell(row.id, col.key, e.target.value);
                                }
                                setEditingCell(null);
                              }}
                              onBlur={() => commitCellEdit(row.id, col.key)}
                              className="w-full px-1 py-0.5 text-xs border border-sky-500 rounded bg-white focus:outline-none shadow-xs font-medium cursor-pointer"
                            >
                              {PIC_SECTION_HEAD_OPTIONS.map((pic) => (
                                <option key={pic} value={pic}>
                                  {pic}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                autoFocus
                                value={cellTempText}
                                onChange={(e) => setCellTempText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') commitCellEdit(row.id, col.key);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                onBlur={() => commitCellEdit(row.id, col.key)}
                                className="w-full px-1.5 py-0.5 text-xs border border-sky-500 rounded bg-white focus:outline-none shadow-xs"
                              />
                              <button
                                onClick={() => commitCellEdit(row.id, col.key)}
                                className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )
                        ) : col.key === 'pmoId' ? (
                          <button
                            onClick={() => onViewDetail(row)}
                            className="font-mono font-semibold text-sky-700 hover:text-sky-900 hover:underline cursor-pointer"
                          >
                            {valueStr}
                          </button>
                        ) : col.key === 'projectDescription' ? (
                          <span
                            onClick={() => onViewDetail(row)}
                            title={valueStr}
                            className="font-medium text-slate-900 hover:text-sky-700 cursor-pointer block truncate max-w-[280px]"
                          >
                            {valueStr}
                          </span>
                        ) : col.key === 'panjangRelokasi' ? (
                          <span>
                            {valueStr ? Number(valueStr).toLocaleString('id-ID') : '-'}
                          </span>
                        ) : col.badgeType === 'category' && valueStr ? (
                          <span className={`inline-block px-2 py-0.5 text-[11px] rounded font-semibold ${
                            valueStr === 'GOV IPPJU'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : valueStr === 'GOV APJATEL'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : valueStr === 'GOV SJUT'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {valueStr}
                          </span>
                        ) : col.badgeType === 'status' && valueStr ? (
                          <span className={`inline-block px-2 py-0.5 text-[11px] rounded ${getStatusBadgeStyle(valueStr)}`}>
                            {valueStr}
                          </span>
                        ) : (
                          <span className={!valueStr ? 'text-slate-300' : ''}>
                            {valueStr || '-'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Spreadsheet Bottom Status Bar */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-medium">Total: <strong className="text-slate-800 font-mono tabular-nums">{sortedData.length}</strong> baris ditampilkan</span>
          <span>·</span>
          <span className="text-[11px] text-slate-400">Klik dua kali pada sel untuk edit cepat</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Tampilan Spreadsheet Terhubung</span>
        </div>
      </div>
    </div>
  );
};
