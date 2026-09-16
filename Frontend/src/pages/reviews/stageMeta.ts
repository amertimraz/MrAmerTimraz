export interface YearMeta {
  key: string;
  label: string;
}

export interface StageGroupMeta {
  key: string;
  label: string;
  emoji: string;
  accent: string;
  years: YearMeta[];
}

export const STAGE_GROUPS: StageGroupMeta[] = [
  {
    key: 'primary',
    label: 'المرحلة الابتدائية',
    emoji: '💻',
    accent: '#3b82f6',
    years: [
      { key: 'Primary1', label: 'الأول الابتدائي' },
      { key: 'Primary2', label: 'الثاني الابتدائي' },
      { key: 'Primary3', label: 'الثالث الابتدائي' },
      { key: 'Primary4', label: 'الرابع الابتدائي' },
      { key: 'Primary5', label: 'الخامس الابتدائي' },
      { key: 'Primary6', label: 'السادس الابتدائي' },
    ],
  },
  {
    key: 'preparatory',
    label: 'المرحلة الإعدادية',
    emoji: '🖥️',
    accent: '#a855f7',
    years: [
      { key: 'Prep1', label: 'الأول الإعدادي' },
      { key: 'Prep2', label: 'الثاني الإعدادي' },
      { key: 'Prep3', label: 'الثالث الإعدادي' },
    ],
  },
  {
    key: 'secondary',
    label: 'المرحلة الثانوية',
    emoji: '⌨️',
    accent: '#22c55e',
    years: [
      { key: 'Secondary1', label: 'الأول الثانوي' },
      { key: 'Secondary2', label: 'الثاني الثانوي' },
      { key: 'Secondary3', label: 'الثالث الثانوي' },
    ],
  },
];

export const STAGE_LABELS: Record<string, string> = Object.fromEntries(
  STAGE_GROUPS.flatMap(g => g.years.map(y => [y.key, `${y.label}`]))
);
