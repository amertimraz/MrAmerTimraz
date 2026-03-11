import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  subtitle?: string;
}

const colors = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'bg-blue-500',   text: 'text-blue-600 dark:text-blue-400' },
  green:  { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'bg-green-500',  text: 'text-green-600 dark:text-green-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
};

export default function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const c = colors[color];
  return (
    <div className={`card p-6 flex items-center gap-4 animate-fade-in`}>
      <div className={`${c.icon} p-3 rounded-xl text-white shadow-md`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
