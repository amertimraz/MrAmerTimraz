import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'تقنية المعلومات - ابتدائي',
    emoji: '💻',
    description: 'الصفوف الرابع والخامس والسادس',
    color: 'blue',
  },
  {
    id: '2',
    name: 'الحاسب الآلي - إعدادي',
    emoji: '🖥️',
    description: 'الصفوف السابع والثامن والتاسع',
    color: 'purple',
  },
  {
    id: '3',
    name: 'البرمجة - أول ثانوي',
    emoji: '⌨️',
    description: 'الصف العاشر',
    color: 'green',
  },
];

interface CategoriesState {
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (from: number, to: number) => void;
}

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set) => ({
      categories: DEFAULT_CATEGORIES,

      addCategory: (cat) =>
        set((s) => ({
          categories: [
            ...s.categories,
            { ...cat, id: Date.now().toString() },
          ],
        })),

      updateCategory: (id, cat) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...cat } : c
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),

      reorderCategories: (from, to) =>
        set((s) => {
          const cats = [...s.categories];
          const [moved] = cats.splice(from, 1);
          cats.splice(to, 0, moved);
          return { categories: cats };
        }),
    }),
    { name: 'edu-categories' }
  )
);
