import { X } from 'lucide-react';
import type { SkillType } from '@/types';

interface SkillBadgeProps {
  skill: string;
  type: SkillType;
  level?: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

const levelDot: Record<string, string> = {
  Beginner: 'bg-slate-400',
  Intermediate: 'bg-amber-400',
  Advanced: 'bg-blue-500',
  Expert: 'bg-emerald-500',
}

export function SkillBadge({ skill, type, level, onRemove, size = 'md' }: SkillBadgeProps) {
  const isHave = type === 'offer';

  return (
    <span
      className={`
        skill-badge group inline-flex items-center gap-1.5 font-semibold rounded-full
        border transition-all duration-200 cursor-default select-none
        ${isHave
          ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200/80 hover:border-blue-400/60 hover:shadow-sm hover:shadow-blue-500/15 dark:from-blue-950/60 dark:to-cyan-950/40 dark:text-blue-300 dark:border-blue-800/60'
          : 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border-violet-200/80 hover:border-violet-400/60 hover:shadow-sm hover:shadow-violet-500/15 dark:from-violet-950/60 dark:to-purple-950/40 dark:text-violet-300 dark:border-violet-800/60'
        }
        ${size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'}
      `}
    >
      {/* Colored dot */}
      <span className={`
        inline-block rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125
        ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'}
        ${isHave ? 'bg-blue-500' : 'bg-violet-500'}
      `} />

      <span>{skill}</span>

      {level && (
        <span className={`
          inline-flex items-center gap-0.5 opacity-60 font-normal
          ${size === 'sm' ? 'text-[10px]' : 'text-xs'}
        `}>
          <span className={`inline-block w-1 h-1 rounded-full ${levelDot[level] ?? 'bg-slate-400'}`} />
          {level}
        </span>
      )}

      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 rounded-full p-0.5 opacity-50 hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 transition-all duration-150"
          aria-label={`Remove ${skill}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
