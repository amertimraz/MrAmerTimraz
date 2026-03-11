import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../../api/courses';
import { videosApi } from '../../api/videos';
import { testsApi } from '../../api/tests';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import type { Video, Test } from '../../types';
import {
  Plus, Trash2, ArrowRight, Play, FileText, Users,
  ChevronDown, ChevronUp, BookOpen, CheckCircle,
  Clock, Eye, EyeOff, Pencil, Link2, Youtube,
} from 'lucide-react';

const emptyVideoForm = { title: '', url: '', description: '', source: 'YouTube', durationSeconds: 0, orderIndex: 0 };
const emptyTestForm  = { title: '', description: '', durationMinutes: 30, passingScore: 60 };

export default function CourseManager() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [tab, setTab]           = useState<'lessons' | 'tests' | 'students'>('lessons');
  const [expanded, setExpanded] = useState<number | null>(null);

  const [videoModal, setVideoModal] = useState(false);
  const [testModal, setTestModal]   = useState(false);
  const [videoForm, setVideoForm]   = useState({ ...emptyVideoForm });
  const [testForm, setTestForm]     = useState({ ...emptyTestForm });

  const courseId = Number(id);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.getById(courseId),
  });
  const { data: lessons = [] } = useQuery({
    queryKey: ['videos', id],
    queryFn: () => videosApi.getByCourse(courseId),
  });
  const { data: tests = [] } = useQuery({
    queryKey: ['tests', id],
    queryFn: () => testsApi.getByCourse(courseId),
  });

  const addLesson = useMutation({
    mutationFn: (data: object) => videosApi.create(data),
    onSuccess: () => {
      toast.success('✅ تم إضافة الدرس!');
      qc.invalidateQueries({ queryKey: ['videos', id] });
      setVideoModal(false);
      setVideoForm({ ...emptyVideoForm });
    },
    onError: () => toast.error('فشل في إضافة الدرس'),
  });

  const deleteLesson = useMutation({
    mutationFn: (vid: number) => videosApi.delete(vid),
    onSuccess: () => { toast.success('تم حذف الدرس'); qc.invalidateQueries({ queryKey: ['videos', id] }); },
  });

  const createTest = useMutation({
    mutationFn: (data: object) => testsApi.create(data),
    onSuccess: (res) => {
      toast.success('✅ تم إنشاء الاختبار!');
      qc.invalidateQueries({ queryKey: ['tests', id] });
      setTestModal(false);
      setTestForm({ ...emptyTestForm });
      navigate(`/teacher/tests/${res.id}`);
    },
    onError: () => toast.error('فشل في إنشاء الاختبار'),
  });

  const deleteTest = useMutation({
    mutationFn: (tid: number) => testsApi.deleteTest(tid),
    onSuccess: () => { toast.success('تم حذف الاختبار'); qc.invalidateQueries({ queryKey: ['tests', id] }); },
  });

  const togglePublish = useMutation({
    mutationFn: (t: Test) => testsApi.publish(t.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tests', id] }),
  });

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (!course)   return <div className="text-center text-gray-400 mt-20">الكورس غير موجود</div>;

  const totalQuestions = tests.reduce((sum, t) => sum + t.questions.length, 0);

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">

      {/* ─── Breadcrumb Header ─── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => navigate('/teacher/courses')}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>دروسي</span>
            <span>/</span>
            <span className="text-primary-600 font-medium">{course.title}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{course.title}</h1>
          {course.description && <p className="text-sm text-gray-400 mt-0.5 truncate">{course.description}</p>}
        </div>
        <span className={`badge ${course.isPublished ? 'badge-green' : 'badge-yellow'}`}>
          {course.isPublished ? '🟢 منشور' : '🟡 مسودة'}
        </span>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <BookOpen size={20} />,   label: 'الدروس',    value: lessons.length,         color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: <FileText size={20} />,   label: 'الاختبارات', value: tests.length,           color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { icon: <CheckCircle size={20} />, label: 'الأسئلة',  value: totalQuestions,         color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: <Users size={20} />,       label: 'الطلاب',   value: course.enrolledCount,   color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map(s => (
          <div key={s.label} className={`card p-4 flex items-center gap-3 ${s.bg}`}>
            <div className={`${s.color} shrink-0`}>{s.icon}</div>
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 w-fit gap-1">
        {[
          { k: 'lessons',  l: `الدروس (${lessons.length})`,      icon: <BookOpen size={15} /> },
          { k: 'tests',    l: `الاختبارات (${tests.length})`,     icon: <FileText size={15} /> },
          { k: 'students', l: `الطلاب (${course.enrolledCount})`, icon: <Users size={15} /> },
        ].map(({ k, l, icon }) => (
          <button
            key={k}
            onClick={() => setTab(k as 'lessons' | 'tests' | 'students')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === k
                ? 'bg-white dark:bg-gray-600 shadow text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {icon}{l}
          </button>
        ))}
      </div>

      {/* ═══════════════ LESSONS TAB ═══════════════ */}
      {tab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              كل درس يحتوي على فيديو تعليمي ويمكن ربطه باختبار
            </p>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/teacher/courses/${id}/lessons/new`)} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> إضافة درس
              </button>
              <button onClick={() => setVideoModal(true)} className="btn-secondary text-sm flex items-center gap-1 py-2 px-3">
                ⚡ سريع
              </button>
            </div>
          </div>

          {lessons.length === 0 ? (
            <div className="card p-14 text-center">
              <BookOpen size={56} className="mx-auto mb-4 text-gray-200 dark:text-gray-600" />
              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-2">لا توجد دروس بعد</p>
              <p className="text-sm text-gray-400 mb-5">ابدأ بإضافة أول درس للكورس</p>
              <button onClick={() => navigate(`/teacher/courses/${id}/lessons/new`)} className="btn-primary">
                <Plus size={16} className="inline ml-1" /> إضافة أول درس
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(lessons as Video[]).map((lesson, idx) => (
                <div key={lesson.id} className="card overflow-hidden">
                  {/* Lesson Header */}
                  <button
                    onClick={() => setExpanded(expanded === lesson.id ? null : lesson.id)}
                    className="w-full flex items-center gap-4 p-5 text-right hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="w-9 h-9 bg-primary-100 dark:bg-primary-900/40 text-primary-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{lesson.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          {lesson.source === 'YouTube'
                            ? <Youtube size={12} className="text-red-500" />
                            : <Link2 size={12} />}
                          {lesson.source}
                        </span>
                        {lesson.durationSeconds > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {Math.floor(lesson.durationSeconds / 60)} دقيقة
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-300 shrink-0">
                      {expanded === lesson.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  {/* Lesson Expanded Content */}
                  {expanded === lesson.id && (
                    <div className="border-t border-gray-100 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-700/30">
                      <div className="grid md:grid-cols-2 gap-5">
                        {/* Video Preview */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">رابط الفيديو</p>
                          <a
                            href={lesson.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-primary-300 transition-colors text-sm text-primary-600 truncate"
                          >
                            <Play size={15} className="shrink-0" />
                            <span className="truncate">{lesson.url}</span>
                          </a>
                          {lesson.description && (
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                              {lesson.description}
                            </p>
                          )}
                          {lesson.pdfUrl && (
                            <a
                              href={lesson.pdfUrl.startsWith('/') ? `http://localhost:5001${lesson.pdfUrl}` : lesson.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 text-sm hover:bg-orange-100 transition-colors"
                            >
                              <FileText size={14} />
                              <span className="truncate">ملف PDF مرفق</span>
                            </a>
                          )}
                        </div>

                        {/* Lesson Actions */}
                        <div className="flex flex-col gap-3">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">الإجراءات</p>
                          <a
                            href={lesson.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary text-sm flex items-center gap-2 justify-center"
                          >
                            <Play size={15} /> مشاهدة الفيديو
                          </a>
                          <button
                            onClick={() => {
                              if (confirm(`هل تريد حذف درس "${lesson.title}"؟`))
                                deleteLesson.mutate(lesson.id);
                            }}
                            className="btn-danger text-sm flex items-center gap-2 justify-center"
                          >
                            <Trash2 size={15} /> حذف الدرس
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ TESTS TAB ═══════════════ */}
      {tab === 'tests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              أنشئ اختبارات لقياس فهم الطلاب
            </p>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/teacher/courses/${id}/tests/new`)} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> إنشاء اختبار
              </button>
              <button onClick={() => setTestModal(true)} className="btn-secondary text-sm flex items-center gap-1 py-2 px-3">
                ⚡ سريع
              </button>
            </div>
          </div>

          {tests.length === 0 ? (
            <div className="card p-14 text-center">
              <FileText size={56} className="mx-auto mb-4 text-gray-200 dark:text-gray-600" />
              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-2">لا توجد اختبارات بعد</p>
              <p className="text-sm text-gray-400 mb-5">أنشئ اختباراً وأضف إليه أسئلة متنوعة</p>
              <button onClick={() => navigate(`/teacher/courses/${id}/tests/new`)} className="btn-primary">
                <Plus size={16} className="inline ml-1" /> إنشاء أول اختبار
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(tests as Test[]).map((test, idx) => (
                <div key={test.id} className="card p-5 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4 flex-wrap">
                    {/* Number Badge */}
                    <span className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-xl flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>

                    {/* Test Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-base">{test.title}</p>
                      {test.description && (
                        <p className="text-sm text-gray-400 mt-0.5 truncate">{test.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <CheckCircle size={13} className="text-green-500" />
                          {test.questions.length} سؤال
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={13} className="text-blue-500" />
                          {test.durationMinutes} دقيقة
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FileText size={13} className="text-orange-500" />
                          نجاح: {test.passingScore}%
                        </span>
                        <span className={test.isPublished ? 'badge-green' : 'badge-yellow'}>
                          {test.isPublished ? 'منشور' : 'مسودة'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/teacher/tests/${test.id}`)}
                        className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
                      >
                        <Pencil size={14} /> إدارة الأسئلة
                      </button>
                      <button
                        onClick={() => togglePublish.mutate(test)}
                        className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5"
                        title={test.isPublished ? 'إخفاء' : 'نشر'}
                      >
                        {test.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                        {test.isPublished ? 'إخفاء' : 'نشر'}
                      </button>
                      <button
                        onClick={() => { if (confirm(`حذف اختبار "${test.title}"؟`)) deleteTest.mutate(test.id); }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ STUDENTS TAB ═══════════════ */}
      {tab === 'students' && (
        <div className="card p-10 text-center">
          <Users size={56} className="mx-auto mb-4 text-gray-200 dark:text-gray-600" />
          <p className="font-bold text-gray-700 dark:text-gray-300 text-lg mb-2">
            {course.enrolledCount} طالب مسجّل
          </p>
          <p className="text-sm text-gray-400 mb-6">في كورس "{course.title}"</p>
          <button onClick={() => navigate('/teacher/students')} className="btn-primary">
            <Users size={16} className="inline ml-1" /> عرض تفاصيل الطلاب
          </button>
        </div>
      )}

      {/* ═══════════════ MODAL: Add Lesson ═══════════════ */}
      <Modal isOpen={videoModal} onClose={() => setVideoModal(false)} title="➕ إضافة درس جديد">
        <form
          onSubmit={e => { e.preventDefault(); addLesson.mutate({ ...videoForm, courseId }); }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              عنوان الدرس *
            </label>
            <input
              value={videoForm.title}
              onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))}
              className="input-field" placeholder="مثال: درس خدمات الإنترنت" required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              رابط الفيديو *
            </label>
            <input
              value={videoForm.url}
              onChange={e => setVideoForm(p => ({ ...p, url: e.target.value }))}
              className="input-field" placeholder="https://youtube.com/watch?v=..." required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                مصدر الفيديو
              </label>
              <select
                value={videoForm.source}
                onChange={e => setVideoForm(p => ({ ...p, source: e.target.value }))}
                className="input-field"
              >
                <option value="YouTube">YouTube</option>
                <option value="Vimeo">Vimeo</option>
                <option value="Upload">رفع مباشر</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الترتيب
              </label>
              <input
                type="number"
                value={videoForm.orderIndex}
                onChange={e => setVideoForm(p => ({ ...p, orderIndex: Number(e.target.value) }))}
                className="input-field" min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              المدة (بالثواني)
            </label>
            <input
              type="number"
              value={videoForm.durationSeconds}
              onChange={e => setVideoForm(p => ({ ...p, durationSeconds: Number(e.target.value) }))}
              className="input-field" min={0} placeholder="مثال: 600 = 10 دقائق"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              وصف الدرس
            </label>
            <textarea
              value={videoForm.description}
              onChange={e => setVideoForm(p => ({ ...p, description: e.target.value }))}
              className="input-field resize-none" rows={3}
              placeholder="اكتب وصفاً مختصراً عن محتوى الدرس..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={addLesson.isPending}>
              {addLesson.isPending ? 'جارٍ الإضافة...' : '✅ إضافة الدرس'}
            </button>
            <button type="button" onClick={() => setVideoModal(false)} className="btn-secondary">
              إلغاء
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════ MODAL: Create Test ═══════════════ */}
      <Modal isOpen={testModal} onClose={() => setTestModal(false)} title="➕ إنشاء اختبار جديد">
        <form
          onSubmit={e => { e.preventDefault(); createTest.mutate({ ...testForm, courseId }); }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              اسم الاختبار *
            </label>
            <input
              value={testForm.title}
              onChange={e => setTestForm(p => ({ ...p, title: e.target.value }))}
              className="input-field" placeholder="مثال: اختبار الوحدة الأولى" required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              وصف الاختبار
            </label>
            <textarea
              value={testForm.description}
              onChange={e => setTestForm(p => ({ ...p, description: e.target.value }))}
              className="input-field resize-none" rows={2}
              placeholder="وصف مختصر للاختبار..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                المدة (دقيقة)
              </label>
              <input
                type="number"
                value={testForm.durationMinutes}
                onChange={e => setTestForm(p => ({ ...p, durationMinutes: Number(e.target.value) }))}
                className="input-field" min={5} max={180}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                درجة النجاح (%)
              </label>
              <input
                type="number"
                value={testForm.passingScore}
                onChange={e => setTestForm(p => ({ ...p, passingScore: Number(e.target.value) }))}
                className="input-field" min={1} max={100}
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-300">
            💡 بعد إنشاء الاختبار، ستنتقل مباشرة لصفحة إضافة الأسئلة
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={createTest.isPending}>
              {createTest.isPending ? 'جارٍ الإنشاء...' : '✅ إنشاء الاختبار'}
            </button>
            <button type="button" onClick={() => setTestModal(false)} className="btn-secondary">
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
