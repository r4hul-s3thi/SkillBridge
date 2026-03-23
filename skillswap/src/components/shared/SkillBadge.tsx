import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { SkillType } from '@/types';

interface SkillBadgeProps {
  skill: string;
  type: SkillType;
  level?: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export function SkillBadge({ skill, type, level, onRemove, size = 'md' }: SkillBadgeProps) {
  const isOffer = type === 'offer';

  return (
    <Badge
      variant="secondary"
      className={`
        inline-flex items-center gap-1.5 font-medium
        ${isOffer
          ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
          : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800'
        }
        ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'}
      `}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${isOffer ? 'bg-blue-500' : 'bg-teal-500'}`} />
      {skill}
      {level && <span className="opacity-60 text-xs">· {level}</span>}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${skill}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Badge>
  );
}
