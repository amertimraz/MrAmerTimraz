// Grades from Primary 4 to Secondary 2. `key` is the value stored in Booklet.GradeLevel and
// AssessmentTrack.Stage on the backend.
export interface Grade {
  key: string;
  label: string;
  short: string;
  level: 'الابتدائي' | 'الإعدادي' | 'الثانوي';
  subject: string;
}

const SUBJECT_BY_LEVEL: Record<Grade['level'], string> = {
  'الابتدائي': 'تكنولوجيا المعلومات والاتصالات',
  'الإعدادي': 'الكمبيوتر وتكنولوجيا المعلومات والاتصالات',
  'الثانوي': 'البرمجة والذكاء الاصطناعي',
};

const base: Omit<Grade, 'subject'>[] = [
  { key: 'Prim4', label: 'الصف الرابع الابتدائي', short: 'الرابع', level: 'الابتدائي' },
  { key: 'Prim5', label: 'الصف الخامس الابتدائي', short: 'الخامس', level: 'الابتدائي' },
  { key: 'Prim6', label: 'الصف السادس الابتدائي', short: 'السادس', level: 'الابتدائي' },
  { key: 'Prep1', label: 'الصف الأول الإعدادي', short: 'الأول', level: 'الإعدادي' },
  { key: 'Prep2', label: 'الصف الثاني الإعدادي', short: 'الثاني', level: 'الإعدادي' },
  { key: 'Prep3', label: 'الصف الثالث الإعدادي', short: 'الثالث', level: 'الإعدادي' },
  { key: 'Sec1', label: 'الصف الأول الثانوي', short: 'الأول', level: 'الثانوي' },
  { key: 'Sec2', label: 'الصف الثاني الثانوي', short: 'الثاني', level: 'الثانوي' },
];

export const GRADES: Grade[] = base.map(g => ({ ...g, subject: SUBJECT_BY_LEVEL[g.level] }));

/** Matches a stored GradeLevel (key or Arabic label) to a known grade. */
export function findGrade(value?: string | null): Grade | undefined {
  if (!value) return undefined;
  const v = value.trim();
  return GRADES.find(g => g.key === v || g.label === v);
}

export const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الشرقية', 'الدقهلية', 'الغربية', 'المنوفية',
  'كفر الشيخ', 'البحيرة', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء',
  'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر',
  'الوادي الجديد', 'مطروح',
];
