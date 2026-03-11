import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { videosApi } from '../../api/videos';
import { coursesApi } from '../../api/courses';
import { motion } from 'framer-motion';
import {
  ArrowRight, Youtube, Play, Link2, FileText,
  Hash, Clock, Eye, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AiDescriptionButton from '../../components/ui/AiDescriptionButton';
import MediaUploadField from '../../components/ui/MediaUploadField';

const getYTId = (url: string) => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]+)/);
  return m ? m[1] : null;
};

type VideoSource = 'YouTube' | 'Vimeo' | 'Upload';

export default function AddLessonPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    url: '',
    description: '',
    source: 'YouTube' as VideoSource,
    durationSeconds: 0,
    orderIndex: 1,
  });
  const [pdfUrl, setPdfUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getById(Number(courseId)),
  });

  const addLesson = useMutation({
    mutationFn: (data: object) => videosApi.create(data),
    onSuccess: () => {
      toast.success('✅ تم إضافة الدرس!');
      navigate(`/teacher/courses/${courseId}`);
    },
    onError: () => toast.error('فشل في إضافة الدرس'),
  });

  const ytId = form.source === 'YouTube' ? getYTId(form.url) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('عنوان الدرس مطلوب'); return; }
    if (!form.url.trim()) { toast.error('رابط الفيديو مطلوب'); return; }

    const payload = {
      ...form,
      courseId: Number(courseId),
      pdfUrl: pdfUrl || undefined,
    };
    addLesson.mutate(payload);
  };

  const sourceTabs: { key: VideoSource; label: string; icon: string }[] = [
    { key: 'YouTube', label: 'YouTube', icon: '▶' },
    { key: 'Vimeo',   label: 'Vimeo',   icon: '🎬' },
    { key: 'Upload',  label: 'رفع فيديو', icon: '📤' },
  ];

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
            <Play size={24} className="text-primary-500" />
            إضافة درس جديد
          </h1>
          {course && (
            <p className="text-sm text-gray-400 mt-0.5">
              <span className="text-primary-500">{course.title}</span>
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Basic Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 space-y-5"
        >
          <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <FileText size={18} className="text-primary-500" />
            معلومات الدرس
          </h3>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              عنوان الدرس <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="input-field text-base"
              placeholder="مثال: خدمات الإنترنت وتطبيقاته في الحياة"
              required
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                الشرح النصي / ملاحظات الدرس
              </label>
              <AiDescriptionButton
                title={form.title}
                context="درس تعليمي"
                onGenerated={text => setForm(p => ({ ...p, description: text }))}
              />
            </div>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="input-field resize-none"
              rows={5}
              placeholder="اكتب شرحاً نصياً مفصلاً أو ملاحظات مهمة يحتاجها الطالب لفهم الدرس..."
            />
          </div>

          {/* Order + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Hash size={14} className="text-primary-500" />
                ترتيب الدرس
              </label>
              <input
                type="number" min={1} value={form.orderIndex}
                onChange={e => setForm(p => ({ ...p, orderIndex: Number(e.target.value) }))}
                className="input-field text-center font-bold"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Clock size={14} className="text-primary-500" />
                المدة (بالثواني)
              </label>
              <input
                type="number" min={0} value={form.durationSeconds}
                onChange={e => setForm(p => ({ ...p, durationSeconds: Number(e.target.value) }))}
                className="input-field text-center"
                placeholder="600 = 10 دقائق"
              />
            </div>
          </div>
        </motion.div>

        {/* Video Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 space-y-5"
        >
          <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <Youtube size={18} className="text-red-500" />
            فيديو الدرس
          </h3>

          {/* Source Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 gap-1">
            {sourceTabs.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm(p => ({ ...p, source: key, url: '' }))}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  form.source === key
                    ? 'bg-white dark:bg-gray-600 shadow text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>

          {/* URL Input */}
          {form.source === 'Upload' ? (
            <MediaUploadField
              type="video"
              value={form.url}
              onChange={url => setForm(p => ({ ...p, url }))}
              label="فيديو الدرس"
              optional={false}
            />
          ) : (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {form.source === 'YouTube' ? 'رابط YouTube' : 'رابط Vimeo'}
              <span className="text-red-500"> *</span>
            </label>
            <div className="relative">
              <input
                value={form.url}
                onChange={e => { setForm(p => ({ ...p, url: e.target.value })); setShowPreview(false); }}
                className="input-field pl-10"
                placeholder={
                  form.source === 'YouTube'
                    ? 'https://www.youtube.com/watch?v=xxxxx'
                    : 'https://vimeo.com/xxxxx'
                }
              />
              {form.source === 'YouTube' && (
                <Youtube size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
              )}
            </div>

            {/* Preview Button */}
            {form.url && (
              <button
                type="button"
                onClick={() => setShowPreview(p => !p)}
                className="mt-2 text-sm text-primary-600 flex items-center gap-1.5 hover:underline"
              >
                <Eye size={14} />
                {showPreview ? 'إخفاء المعاينة' : 'معاينة الفيديو'}
              </button>
            )}
          </div>
          )}

          {/* YouTube Embed Preview */}
          {showPreview && ytId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                className="w-full aspect-video"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </motion.div>
          )}
          {showPreview && form.url && !ytId && form.source === 'YouTube' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 text-sm">
              <AlertCircle size={16} />
              الرابط لا يبدو رابط YouTube صحيحاً
            </div>
          )}
        </motion.div>

        {/* PDF Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 space-y-4"
        >
          <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <Link2 size={18} className="text-orange-500" />
            ملف PDF مرفق <span className="text-xs text-gray-400 font-normal">(اختياري)</span>
          </h3>
          <MediaUploadField
            type="pdf"
            value={pdfUrl}
            onChange={setPdfUrl}
            label="ملف PDF"
            optional={true}
          />
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={addLesson.isPending}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-base"
          >
            <Play size={18} />
            {addLesson.isPending ? 'جارٍ الإضافة...' : 'إضافة الدرس'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/teacher/courses/${courseId}`)}
            className="btn-secondary px-6"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
