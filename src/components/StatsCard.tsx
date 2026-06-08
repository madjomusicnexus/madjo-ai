import type { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: 'brand' | 'accent' | 'surface';
}

export default function StatsCard({ label, value, icon, trend, color = 'brand' }: StatsCardProps) {
  const bgMap = {
    brand: 'bg-gradient-to-br from-brand-100 to-brand-50',
    accent: 'bg-gradient-to-br from-accent-100 to-accent-50',
    surface: 'bg-gradient-to-br from-surface-100 to-surface-50'
  };
  const iconColorMap = {
    brand: 'text-brand-700',
    accent: 'text-accent-700',
    surface: 'text-surface-600'
  };
  const ringMap = {
    brand: 'ring-brand-200/50',
    accent: 'ring-accent-200/50',
    surface: 'ring-surface-200/50'
  };

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${bgMap[color]} rounded-xl flex items-center justify-center ${iconColorMap[color]} ring-2 ${ringMap[color]} shadow-sm`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-bold text-brand-700 bg-gradient-to-br from-brand-100 to-brand-50 px-3 py-1 rounded-full border border-brand-200/60 shadow-sm">
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-surface-900 mb-1">{value}</p>
      <p className="text-sm font-medium text-surface-500">{label}</p>
    </div>
  );
}
