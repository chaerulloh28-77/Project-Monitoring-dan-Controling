import React from 'react';
import { 
  FolderGit2,
  Compass,
  FileCheck2,
  HardHat,
  GitFork,
  Radio,
  Workflow
} from 'lucide-react';
import { TabKey } from '../types/project';

interface TabVisualIconProps {
  tabKey: TabKey;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'badge' | 'minimal';
}

export const TabVisualIcon: React.FC<TabVisualIconProps> = ({
  tabKey,
  isActive = false,
  size = 'md',
  variant = 'badge',
}) => {
  const getTabConfig = () => {
    switch (tabKey) {
      case 'project-list':
        return {
          icon: FolderGit2,
          name: 'Project List',
          num: '1',
          solidColor: 'from-sky-500 to-blue-600 text-white shadow-sky-500/30',
          activeBg: 'bg-gradient-to-br from-sky-500/25 to-blue-600/25 text-sky-300 ring-1 ring-sky-400/40',
          inactiveBg: 'bg-slate-800 text-sky-400 group-hover:bg-slate-700/80 group-hover:text-sky-300 ring-1 ring-slate-700/60',
          lightBg: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
          pulseColor: 'bg-sky-400',
        };
      case 'construction-plan':
        return {
          icon: Compass,
          name: 'Construction & Plan',
          num: '2',
          solidColor: 'from-blue-600 to-indigo-600 text-white shadow-blue-500/30',
          activeBg: 'bg-gradient-to-br from-blue-500/25 to-indigo-600/25 text-blue-300 ring-1 ring-blue-400/40',
          inactiveBg: 'bg-slate-800 text-blue-400 group-hover:bg-slate-700/80 group-hover:text-blue-300 ring-1 ring-slate-700/60',
          lightBg: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
          pulseColor: 'bg-blue-400',
        };
      case 'status-project':
        return {
          icon: FileCheck2,
          name: 'Status Project',
          num: '3',
          solidColor: 'from-amber-500 to-orange-600 text-white shadow-amber-500/30',
          activeBg: 'bg-gradient-to-br from-amber-500/25 to-orange-600/25 text-amber-300 ring-1 ring-amber-400/40',
          inactiveBg: 'bg-slate-800 text-amber-400 group-hover:bg-slate-700/80 group-hover:text-amber-300 ring-1 ring-slate-700/60',
          lightBg: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
          pulseColor: 'bg-amber-400',
        };
      case 'status-construction':
        return {
          icon: HardHat,
          name: 'Status Construction',
          num: '4',
          solidColor: 'from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
          activeBg: 'bg-gradient-to-br from-emerald-500/25 to-teal-600/25 text-emerald-300 ring-1 ring-emerald-400/40',
          inactiveBg: 'bg-slate-800 text-emerald-400 group-hover:bg-slate-700/80 group-hover:text-emerald-300 ring-1 ring-slate-700/60',
          lightBg: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
          pulseColor: 'bg-emerald-400',
        };
      case 'project-tracking-pipeline':
        return {
          icon: Workflow,
          name: 'Tracking Pipeline',
          num: '5',
          solidColor: 'from-purple-500 via-fuchsia-600 to-pink-600 text-white shadow-purple-500/30',
          activeBg: 'bg-gradient-to-br from-purple-500/25 to-fuchsia-600/25 text-purple-300 ring-1 ring-purple-400/40',
          inactiveBg: 'bg-slate-800 text-purple-400 group-hover:bg-slate-700/80 group-hover:text-purple-300 ring-1 ring-slate-700/60',
          lightBg: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
          pulseColor: 'bg-purple-400',
        };
      default:
        return {
          icon: Radio,
          name: 'Sheet',
          num: '•',
          solidColor: 'from-slate-600 to-slate-700 text-white',
          activeBg: 'bg-slate-700 text-white',
          inactiveBg: 'bg-slate-800 text-slate-400',
          lightBg: 'bg-slate-100 text-slate-700',
          pulseColor: 'bg-slate-400',
        };
    }
  };

  const config = getTabConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: {
      wrapper: 'w-6 h-6 rounded-md',
      icon: 'w-3.5 h-3.5',
    },
    md: {
      wrapper: 'w-8 h-8 rounded-lg',
      icon: 'w-4 h-4',
    },
    lg: {
      wrapper: 'w-10 h-10 rounded-xl',
      icon: 'w-5 h-5',
    },
  }[size];

  if (variant === 'solid') {
    return (
      <div className={`${sizeClasses.wrapper} bg-gradient-to-br ${config.solidColor} flex items-center justify-center shrink-0 shadow-sm relative group`}>
        <IconComponent className={sizeClasses.icon} />
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <IconComponent 
        className={`${sizeClasses.icon} shrink-0 transition-colors ${
          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
        }`} 
      />
    );
  }

  // variant === 'badge' (glow, rounded container with glass effect)
  return (
    <div
      className={`${sizeClasses.wrapper} flex items-center justify-center shrink-0 transition-all duration-200 relative overflow-hidden ${
        isActive ? config.activeBg : config.inactiveBg
      } ${isActive ? 'shadow-sm' : ''}`}
    >
      <IconComponent className={`${sizeClasses.icon} transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
    </div>
  );
};
