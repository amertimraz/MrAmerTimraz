import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { testsApi } from '../../api/tests';
import { coursesApi } from '../../api/courses';
import { motion } from 'framer-motion';
import {
  ArrowRight, Clock, Target, FileText, Zap,
  ListChecks, CheckCircle2, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AiDescriptionButton from '../../components/ui/AiDescriptionButton';

const DURATION_PRESETS = [
  { label: '15 دقيقة', value: 15 },
  { label: '30 دقيقة', value: 30 },
  { label: '45 دقيقة', value: 45 },
  { label: '60 دقيقة', value: 60 },
];

const PASS_PRESETS = [
  { label: '50%', value: 50 },
  { label: '60%', value: 60 },
  { label: '70%', value: 70 },
  { label: '80%', value: 80 },
];

export default function CreateTestPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    durationMinutes: 30,
    passingScore: 60,
  });

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getById(Number(courseId)),
  });

  const createTest = useMutation({
    mutationFn: (data: object) => testsApi.create(data),
    onSuccess: (test) => {
      toast.success('✅ تم إنشاء الاختبار! أضف الأسئلة الآن.');
      navigate(`/teacher/tests/${test.id}/questions/new`);
    },
    onError: () => toast.error('فشل في إنشاء الاختبار'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('اسم الاختبار مطلوب'); return; }
    createTest.mutate({ ...form, courseId: Number(courseId) });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/teacher/courses/${courseId}`)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ListChecks size={26} className="text-primary-500" />
            إنشاء اختبار جديد
          </h1>
          {course && (
            <p className="text-sm text-gray-400 mt-0.5">
              الكورس: <span className="text-primary-500">{course.title}</span>
            </p>
          )}
        </div>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-5"
      >
        {/* Test Info */}
        <div className="card p-6 space-y-5">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <FileText size={18} className="text-primary-500" />
            معلومات الاختبار
          </h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              اسم الاختبار <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="input-field text-base"
              placeholder="مثال: اختبار الدرس الأول – خدمات الإنترنت"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                تعليمات الاختبار للطالب
              </label>
              <AiDescriptionButton
                title={form.title}
                context="اختبار تعليمي"
                onGenerated={text => setForm(p => ({ ...p, description: text }))}
              />
            </div>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="input-field resize-none"
              rows={3}
              placeholder="مثال: اقرأ الأسئلة بعناية وأجب على جميعها خلال الوقت المحدد..."
            />
          </div>
        </div>

        {/* Duration */}
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <Clock size={18} className="text-primary-500" />
            مدة الاختبار
          </h3>

          <div className="grid grid-cols-4 gap-2">
            {DURATION_PRESETS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, durationMinutes: p.value }))}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.durationMinutes === p.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 whitespace-nowrap">أو أدخل مدة مخصصة:</span>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="number"
                min={1}
                max={240}
                value={form.durationMinutes}
                onChange={e => setForm(p => ({ ...p, durationMinutes: Number(e.target.value) }))}
                className="input-field w-24 text-center font-bold text-lg"
              />
              <span className="text-sm text-gray-400">دقيقة</span>
            </div>
          </div>
        </div>

        {/* Passing Score */}
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <Target size={18} className="text-green-500" />
            درجة النجاح
          </h3>

          <div className="grid grid-cols-4 gap-2">
            {PASS_PRESETS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, passingScore: p.value }))}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.passingScore === p.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 whitespace-nowrap">أو أدخل نسبة مخصصة:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={100}
                value={form.passingScore}
                onChange={e => setForm(p => ({ ...p, passingScore: Number(e.target.value) }))}
                className="input-field w-24 text-center font-bold text-lg"
              />
              <span className="text-sm text-gray-400">%</span>
            </div>
          </div>

          {/* Visual Score Preview */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>0%</span>
              <span className="font-semibold text-green-600">النجاح: {form.passingScore}%</span>
              <span>100%</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-red-400 to-green-500 rounded-full transition-all duration-300"
                style={{ width: `${form.passingScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps Guide */}
        <div className="card p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2 mb-3">
            <Info size={18} />
            خطوات إنشاء الاختبار
          </p>
          <div className="space-y-2">
            {[
              'أدخل معلومات الاختبار هنا',
              'ستنتقل تلقائياً لإضافة الأسئلة',
              'أضف أسئلة بأنواع مختلفة (اختياري، صح/خطأ، أكمل...)',
              'انشر الاختبار ليصبح متاحاً للطلاب',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-blue-500" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createTest.isPending || !form.title.trim()}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-base"
          >
            <Zap size={18} />
            {createTest.isPending ? 'جارٍ الإنشاء...' : 'إنشاء الاختبار والبدء بالأسئلة'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/teacher/courses/${courseId}`)}
            className="btn-secondary px-6"
          >
            إلغاء
          </button>
        </div>
      </motion.form>
    </div>
  );
}
