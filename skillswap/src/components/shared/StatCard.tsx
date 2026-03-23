import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'blue' | 'teal' | 'green' | 'amber';
}

const colorMap = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950', icon: 'text-blue-600 dark:text-blue-400', value: 'text-blue-700 dark:text-blue-300' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-950', icon: 'text-teal-600 dark:text-teal-400', value: 'text-teal-700 dark:text-teal-300' },
  green: { bg: 'bg-green-50 dark:bg-green-950', icon: 'text-green-600 dark:text-green-400', value: 'text-green-700 dark:text-green-300' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950', icon: 'text-amber-600 dark:text-amber-400', value: 'text-amber-700 dark:text-amber-300' },
};

export function StatCard({ label, value, icon: Icon, trend, trendUp, color = 'blue' }: StatCardProps) {
  const colors = colorMap[color];
  return (
    <Card className="border border-border/60 shadow-xs hover:shadow-sm transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold ${colors.value}`}>{value}</p>
            {trend && (
              <p className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-muted-foreground'}`}>
                {trendUp ? '↑' : '↓'} {trend}
              </p>
            )}
          </div>
          <div className={`${colors.bg} p-2.5 rounded-lg`}>
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
