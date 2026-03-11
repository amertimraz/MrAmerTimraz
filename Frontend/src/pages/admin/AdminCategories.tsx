import { useState } from 'react';
import { useCategoriesStore, type Category } from '../../store/categoriesStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Tag, Save, X,
  ChevronUp, ChevronDown, RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = [
  { key: 'blue',   label: 'أزرق',    bg: 'bg-blue-100',   text: 'text-blue-700',   dark: 'dark:bg-blue-900/40 dark:text-blue-300' },
  { key: 'purple', label: 'بنفسجي',  bg: 'bg-purple-100', text: 'text-purple-700', dark: 'dark:bg-purple-900/40 dark:text-purple-300' },
  { key: 'green',  label: 'أخضر',    bg: 'bg-green-100',  text: 'text-green-700',  dark: 'dark:bg-green-900/40 dark:text-green-300' },
  { key: 'red',    label: 'أحمر',    bg: 'bg-red-100',    text: 'text-red-700',    dark: 'dark:bg-red-900/40 dark:text-red-300' },
  { key: 'orange', label: 'برتقالي', bg: 'bg-orange-100', text: 'text-orange-700', dark: 'dark:bg-orange-900/40 dark:text-orange-300' },
  { key: 'teal',   label: 'فيروزي',  bg: 'bg-teal-100',   text: 'text-teal-700',   dark: 'dark:bg-teal-900/40 dark:text-teal-300' },
  { key: 'pink',   label: 'وردي',    bg: 'bg-pink-100',   text: 'text-pink-700',   dark: 'dark:bg-pink-900/40 dark:text-pink-300' },
  { key: 'yellow', label: 'أصفر',    bg: 'bg-yellow-100', text: 'text-yellow-700', dark: 'dark:bg-yellow-900/40 dark:text-yellow-300' },
];

const EMOJIS = ['💻', '🖥️', '⌨️', '📚', '🔬', '🧮', '🎨', '🌍', '📐', '⚡', '🤖', '🎓', '📊', '🔭', '✏️', '🎵'];

const EMPTY_FORM = { name: '', emoji: '📚', description: '', color: 'blue' };

function getColorObj(key: string) {
  return COLORS.find(c => c.key === key) ?? COLORS[0];
}

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories } = useCategoriesStore();

  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form,      setForm]      = useState({ ...EMPTY_FORM });

  const isEditing = editingId !== null;

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, emoji: cat.emoji, description: cat.description, color: cat.color });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('اسم القسم مطلوب'); return; }
    if (isEditing) {
      updateCategory(editingId, form);
      toast.success('✅ تم تحديث القسم');
    } else {
      addCategory(form);
      toast.success('✅ تم إضافة القسم');
    }
    closeForm();
  };

  const handleDelete = (cat: Category) => {
    if (!confirm(`هل تريد حذف قسم "${cat.name}"؟`)) return;
    deleteCategory(cat.id);
    toast.success('تم حذف القسم');
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Tag size={26} className="text-primary-500" />
            إدارة الأقسام والمراحل الدراسية
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            هذه الأقسام تظهر عند إضافة الكورسات وفي الواجهة الرئيسية — {categories.length} قسم
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> إضافة قسم
        </button>
      </div>

      {/* Form Card */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="card p-6 border-2 border-primary-200 dark:border-primary-700"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {isEditing ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h3>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  اسم القسم <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="input-field text-base"
                  placeholder="مثال: تقنية المعلومات - ابتدائي"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  الوصف / الصف الدراسي
                </label>
                <input
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="input-field"
                  placeholder="مثال: الصفوف الرابع والخامس والسادس"
                />
              </div>

              {/* Emoji Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  الأيقونة
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, emoji }))}
                      className={`w-10 h-10 text-xl rounded-xl border-2 transition-all ${
                        form.emoji === emoji
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  اللون
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, color: c.key }))}
                      className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${
                        form.color === c.key
                          ? 'border-primary-500 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${c.bg}`} />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">معاينة:</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${getColorObj(form.color).bg} ${getColorObj(form.color).text} ${getColorObj(form.color).dark}`}>
                  <span className="text-xl">{form.emoji}</span>
                  <div>
                    <p className="font-bold text-sm">{form.name || 'اسم القسم'}</p>
                    {form.description && <p className="text-xs opacity-70">{form.description}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" className="btn-primary flex items-center gap-2 flex-1">
                  <Save size={16} />
                  {isEditing ? 'حفظ التعديلات' : 'إضافة القسم'}
                </button>
                <button type="button" onClick={closeForm} className="btn-secondary px-5">
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="card p-14 text-center">
          <Tag size={56} className="mx-auto mb-4 text-gray-200 dark:text-gray-700" />
          <p className="font-semibold text-gray-500">لا توجد أقسام</p>
          <button onClick={openAdd} className="btn-primary mt-4">
            <Plus size={16} className="inline ml-1" /> إضافة أول قسم
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {categories.map((cat, idx) => {
              const col = getColorObj(cat.color);
              return (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="card p-5 flex items-center gap-4"
                >
                  {/* Order Controls */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => idx > 0 && reorderCategories(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => idx < categories.length - 1 && reorderCategories(idx, idx + 1)}
                      disabled={idx === categories.length - 1}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {/* Emoji Badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${col.bg} ${col.dark}`}>
                    {cat.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 dark:text-white">{cat.name}</p>
                      <span className={`badge text-xs px-2 py-0.5 ${col.bg} ${col.text} ${col.dark}`}>
                        {col.label}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-sm text-gray-400 mt-0.5">{cat.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors"
                      title="تعديل"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Reset to defaults */}
      {categories.length > 0 && (
        <div className="text-center pt-2">
          <button
            onClick={() => {
              if (confirm('هل تريد إعادة تعيين الأقسام للقيم الافتراضية؟ سيتم حذف أي أقسام مضافة.')) {
                localStorage.removeItem('edu-categories');
                window.location.reload();
              }
            }}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1.5 mx-auto transition-colors"
          >
            <RotateCcw size={14} />
            إعادة تعيين للقيم الافتراضية
          </button>
        </div>
      )}
    </div>
  );
}
