import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { coursesApi } from '../../api/courses';
import { useCategoriesStore } from '../../store/categoriesStore';
import { motion } from 'framer-motion';
import {
  ArrowRight, BookOpen, Tag, FileText,
  Sparkles, GraduationCap, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AiDescriptionButton from '../../components/ui/AiDescriptionButton';
import MediaUploadField from '../../components/ui/MediaUploadField';

const steps = [
  { n: 1, label: 'معلومات الكورس' },
  { n: 2, label: 'إضافة الدروس' },
  { n: 3, label: 'إضافة الاختبارات' },
  { n: 4, label: 'نشر الكورس' },
];

export default function AddCoursePage() {
  const navigate = useNavigate();
  const { categories } = useCategoriesStore();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    thumbnailUrl: '',
  });


  const createMutation = useMutation({
    mutationFn: (data: object) => coursesApi.create(data),
    onSuccess: (course) => {
      toast.success('✅ تم إنشاء الكورس بنجاح!');
      navigate(`/teacher/courses/${course.id}`);
    },
    onError: () => toast.error('فشل في إنشاء الكورس'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('اسم الكورس مطلوب'); return; }
    createMutation.mutate(form);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/teacher/courses')}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap size={26} className="text-primary-500" />
            إنشاء كورس جديد
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">أدخل معلومات الكورس ثم أضف الدروس والاختبارات</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="card p-4">
        <div className="flex items-center gap-0">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s.n === 1
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                  {s.n === 1 ? <CheckCircle2 size={16} /> : s.n}
                </div>
                <span className={`text-xs hidden sm:block ${s.n === 1 ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 ${s.n < 1 ? 'bg-primary-300' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="card p-6 space-y-6"
      >
        {/* Title */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <BookOpen size={16} className="text-primary-500" />
            اسم الكورس <span className="text-red-500">*</span>
          </label>
          <input
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="input-field text-base"
            placeholder="مثال: تقنية المعلومات - الصف الخامس الابتدائي"
            required
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <FileText size={16} className="text-primary-500" />
              وصف الكورس
            </label>
            <AiDescriptionButton
              title={form.title}
              context="كورس تعليمي"
              onGenerated={text => setForm(p => ({ ...p, description: text }))}
            />
          </div>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="input-field resize-none"
            rows={4}
            placeholder="اكتب وصفاً مختصراً يشرح محتوى الكورس وأهدافه للطلاب..."
          />
          <p className="text-xs text-gray-400 mt-1">{form.description.length} / 500 حرف</p>
        </div>

        {/* Category */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <Tag size={16} className="text-primary-500" />
            المرحلة الدراسية
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm(p => ({ ...p, category: cat.name }))}
                className={`p-4 rounded-xl border-2 text-right transition-all ${
                  form.category === cat.name
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                }`}
              >
                <div className="text-2xl mb-1">{cat.emoji}</div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">{cat.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{cat.description}</div>
              </button>
            ))}
          </div>
          <input
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="input-field mt-3 text-sm"
            placeholder="أو اكتب تصنيفاً مخصصاً..."
          />
        </div>

        {/* Thumbnail */}
        <MediaUploadField
          type="image"
          value={form.thumbnailUrl}
          onChange={url => setForm(p => ({ ...p, thumbnailUrl: url }))}
          label="الصورة المصغرة للكورس"
        />

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p className="font-semibold">💡 بعد إنشاء الكورس ستتمكن من:</p>
          <ul className="list-disc list-inside space-y-0.5 text-blue-600 dark:text-blue-400">
            <li>إضافة دروس فيديو من YouTube</li>
            <li>إنشاء اختبارات تفاعلية بأسئلة متنوعة</li>
            <li>متابعة تقدم الطلاب ونتائجهم</li>
          </ul>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={createMutation.isPending || !form.title.trim()}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-base"
          >
            <Sparkles size={18} />
            {createMutation.isPending ? 'جارٍ الإنشاء...' : 'إنشاء الكورس والبدء بالمحتوى'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/teacher/courses')}
            className="btn-secondary px-5"
          >
            إلغاء
          </button>
        </div>
      </motion.form>
    </div>
  );
}
