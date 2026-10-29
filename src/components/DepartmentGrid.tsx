import React from 'react';
import {
  Cpu,
  Code2,
  Radio,
  Cog,
  Building2,
  Music4,
  Trophy,
  Database,
  Layers,
  Check
} from 'lucide-react';
import { DepartmentInfo } from '../types.ts';

export const DEPARTMENTS_DATA: DepartmentInfo[] = [
  {
    id: 'aiml',
    code: 'AI&ML',
    name: 'Artificial Intelligence & Machine Learning',
    iconName: 'Cpu',
    description: 'Neural networks, LLMs & robotics',
    color: 'from-violet-600 to-indigo-600'
  },
  {
    id: 'cse',
    code: 'CSE',
    name: 'Computer Science & Engineering',
    iconName: 'Code2',
    description: 'Full-stack, cloud & systems',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'ece',
    code: 'ECE',
    name: 'Electronics & Communication',
    iconName: 'Radio',
    description: 'Embedded, VLSI & IoT hardware',
    color: 'from-cyan-600 to-teal-700'
  },
  {
    id: 'mech',
    code: 'MECH',
    name: 'Mechanical Engineering',
    iconName: 'Cog',
    description: 'Robotics, CAD & automotive tech',
    color: 'from-amber-600 to-orange-700'
  },
  {
    id: 'civil',
    code: 'CIVIL',
    name: 'Civil Engineering',
    iconName: 'Building2',
    description: 'Smart infrastructure & eco design',
    color: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'cultural',
    code: 'CULT',
    name: 'Cultural & Arts Council',
    iconName: 'Music4',
    description: 'Music, dance, theatre & literati',
    color: 'from-pink-600 to-rose-700'
  },
  {
    id: 'sports',
    code: 'SPORTS',
    name: 'Sports & Athletics Board',
    iconName: 'Trophy',
    description: 'Inter-collegiate championships',
    color: 'from-red-600 to-amber-700'
  },
  {
    id: 'ise',
    code: 'ISE',
    name: 'Information Science & Eng',
    iconName: 'Database',
    description: 'Cybersecurity, analytics & DevOps',
    color: 'from-sky-600 to-blue-700'
  }
];

interface DepartmentGridProps {
  selectedDepartments: string[];
  onToggleDepartment: (deptName: string) => void;
  onClearAll: () => void;
}

export const DepartmentGrid: React.FC<DepartmentGridProps> = ({
  selectedDepartments,
  onToggleDepartment,
  onClearAll
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Code2':
        return <Code2 className="w-5 h-5" />;
      case 'Radio':
        return <Radio className="w-5 h-5" />;
      case 'Cog':
        return <Cog className="w-5 h-5" />;
      case 'Building2':
        return <Building2 className="w-5 h-5" />;
      case 'Music4':
        return <Music4 className="w-5 h-5" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5" />;
      case 'Database':
        return <Database className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  const isSelected = (name: string) => {
    return selectedDepartments.some(
      d => d.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(d.toLowerCase())
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Explore by Academic Department</span>
            {selectedDepartments.length > 0 && (
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {selectedDepartments.length} Selected (Multi-Filter Active)
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select one or combine multiple departments to filter events instantly.
          </p>
        </div>

        {selectedDepartments.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors underline underline-offset-2 whitespace-nowrap"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Grid: 2 per row as specified in prompt, scaling to 4 on larger desktop */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {DEPARTMENTS_DATA.map(dept => {
          const active = isSelected(dept.name) || isSelected(dept.code);
          return (
            <button
              key={dept.id}
              onClick={() => onToggleDepartment(dept.name)}
              className={`group text-left p-3.5 rounded-xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                active
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${dept.color} shadow-sm group-hover:scale-105 transition-transform`}
                >
                  {getIcon(dept.iconName)}
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-300 text-transparent group-hover:border-slate-400'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-700">
                    {dept.code}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1 mt-0.5">
                  {dept.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {dept.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
