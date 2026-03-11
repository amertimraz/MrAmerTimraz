import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { testsApi } from '../../api/tests';
import { coursesApi } from '../../api/courses';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Zap, Shuffle, Clock, Target,
  CheckSquare, BookOpen, BarChart3, Sparkles,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Test, Question, Course } from '../../types';

type QType = 'MultipleChoice' | 'TrueFalse' | 'FillBlank' | 'Ordering';

const TYPE_LABELS: Record<QType, string> = {
  MultipleChoice: 'اختيار متعدد',
  TrueFalse:      'صح / خطأ',
  FillBlank:      'أكمل الفراغ',
  Ordering:       'ترتيب',
};

const TYPE_EMOJIS: Record<QType, string> = {
  MultipleChoice: '☑️',
  TrueFalse:      '✅',
  FillBlank:      '✏️',
  Ordering:       '🔢',
};

interface QuestionWithSource extends Question {
  testId: number;
  courseId: number;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function TestGeneratorPage() {
  const navigate = useNavigate();

  const [courseId,       setCourseId]       = useState<number | null>(null);
  const [testTitle,      setTestTitle]       = useState('');
  const [totalCount,     setTotalCount]      = useState(10);
  const [duration,       setDuration]        = useState(30);
  const [passingScore,   setPassingScore]    = useState(60);
  const [selectedTypes,  setSelectedTypes]   = useState<Set<QType>>(new Set(['MultipleChoice', 'TrueFalse']));
  const [generated,      setGenerated]       = useState<QuestionWithSource[] | null>(null);
  const [step,           setStep]            = useState<'config' | 'preview' | 'done'>('config');

  const { data: courses = [], isLoading: loadingCourses } = useQuery<Course[]>({
    queryKey: ['teacher-courses'],
    queryFn: coursesApi.getMyCourses,
  });

  const { data: tests = [], isLoading: loadingTests } = useQuery<Test[]>({
    queryKey: ['my-tests'],
    queryFn: () => testsApi.getMyTests(),
    enabled: true,
  });

  const createTest = useMutation({
    mutationFn: (data: object) => testsApi.create(data),
    onSuccess: async (test) => {
      if (!generated) return;
      for (const q of generated) {
        await testsApi.addQuestion(test.id, {
          questionText:  q.questionText,
          questionType:  q.questionType,
          options:       q.options,
          correctAnswer: q.correctAnswer,
          points:        q.points,
          orderIndex:    generated.indexOf(q) + 1,
          imageUrl:      q.imageUrl,
        });
      }
      toast.success('✅ تم إنشاء الاختبار المولَّد بنجاح!');
      setStep('done');
      setTimeout(() => navigate(`/teacher/tests/${test.id}`), 1500);
    },
    onError: () => toast.error('فشل في إنشاء الاختبار'),
  });

  const poolQuestions = useMemo<QuestionWithSource[]>(() => {
    return tests
      .filter(t => !courseId || t.courseId === courseId)
      .flatMap(t =>
        t.questions.map(q => ({
          ...q,
          testId:   t.id,
          courseId: t.courseId,
        }))
      );
  }, [tests, courseId]);

  const availableByType = useMemo(() => {
    const counts: Partial<Record<QType, number>> = {};
    poolQuestions.forEach(q => {
      const t = q.questionType as QType;
      counts[t] = (counts[t] ?? 0) + 1;
    });
    return counts;
  }, [poolQuestions]);

  const totalAvailable = useMemo(() =>
    poolQuestions.filter(q => selectedTypes.has(q.questionType as QType)).length,
  [poolQuestions, selectedTypes]);

  const toggleType = (t: QType) => {
    setSelectedTypes(prev => {
      const s = new Set(prev);
      if (s.has(t)) { s.delete(t); } else { s.add(t); }
      return s;
    });
  };

  const handleGenerate = () => {
    if (!testTitle.trim()) { toast.error('أدخل اسم الاختبار'); return; }
    if (selectedTypes.size === 0) { toast.error('اختر نوع سؤال واحد على الأقل'); return; }

    const pool = shuffle(
      poolQuestions.filter(q => selectedTypes.has(q.questionType as QType))
    );

    if (pool.length === 0) {
      toast.error('لا توجد أسئلة متطابقة في البنك — أضف أسئلة أولاً');
      return;
    }

    const picked = pool.slice(0, Math.min(totalCount, pool.length));
    setGenerated(picked);
    setStep('preview');
  };

  const handleCreate = () => {
    if (!courseId) { toast.error('اختر الكورس أولاً'); return; }
    createTest.mutate({
      title:           testTitle,
      description:     `اختبار مولَّد تلقائياً — ${generated?.length} سؤال`,
      courseId,
      durationMinutes: duration,
      passingScore,
    });
  };

  const handleReshuffle = () => {
    const pool = shuffle(
      poolQuestions.filter(q => selectedTypes.has(q.questionType as QType))
    );
    setGenerated(pool.slice(0, Math.min(totalCount, pool.length)));
    toast('🔀 تم إعادة الخلط!');
  };

  if (loadingCourses || loadingTests) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => step === 'preview' ? setStep('config') : navigate('/teacher/question-bank')}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap size={26} className="text-yellow-500" />
            مولّد الاختبارات التلقائي
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            اختر الإعدادات وسيُولَّد الاختبار تلقائياً من بنك أسئلتك
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {[{ k: 'config', l: 'الإعدادات' }, { k: 'preview', l: 'معاينة' }, { k: 'done', l: 'تم!' }].map((s, i) => (
          <div key={s.k} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step === s.k ? 'bg-primary-600 text-white' :
              ['config', 'preview', 'done'].indexOf(step) > i ? 'bg-green-500 text-white' :
              'bg-gray-200 dark:bg-gray-700 text-gray-400'
            }`}>{i + 1}</div>
            <span className={step === s.k ? 'text-primary-600 font-semibold' : 'text-gray-400'}>{s.l}</span>
            {i < 2 && <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ─── Config Step ─── */}
        {step === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Test Name + Course */}
            <div className="card p-6 space-y-5">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                <BookOpen size={18} className="text-primary-500" />
                معلومات الاختبار
              </h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  اسم الاختبار <span className="text-red-500">*</span>
                </label>
                <input
                  value={testTitle}
                  onChange={e => setTestTitle(e.target.value)}
                  className="input-field"
                  placeholder="مثال: اختبار الفصل الأول - مولَّد تلقائياً"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  الكورس (للفلترة والتعيين)
                </label>
                <select
                  value={courseId ?? ''}
                  onChange={e => setCourseId(e.target.value ? Number(e.target.value) : null)}
                  className="input-field"
                >
                  <option value="">— كل الكورسات —</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Types */}
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                <CheckSquare size={18} className="text-primary-500" />
                أنواع الأسئلة
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(TYPE_LABELS) as QType[]).map(type => {
                  const avail = availableByType[type] ?? 0;
                  const active = selectedTypes.has(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleType(type)}
                      disabled={avail === 0}
                      className={`p-4 rounded-xl border-2 text-right transition-all relative ${
                        active && avail > 0
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                          : avail === 0
                          ? 'border-gray-200 dark:border-gray-700 opacity-40 cursor-not-allowed'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                      }`}
                    >
                      {active && avail > 0 && (
                        <CheckCircle2 size={16} className="absolute top-2 left-2 text-primary-500" />
                      )}
                      <div className="text-2xl mb-1">{TYPE_EMOJIS[type]}</div>
                      <div className={`text-sm font-bold ${active && avail > 0 ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {TYPE_LABELS[type]}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {avail === 0 ? 'لا توجد أسئلة' : `${avail} سؤال متاح`}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                إجمالي الأسئلة المتاحة للأنواع المختارة:
                <span className="font-bold text-primary-600 mr-2">{totalAvailable} سؤال</span>
              </div>
            </div>

            {/* Count + Duration + Passing */}
            <div className="card p-6 space-y-5">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                <BarChart3 size={18} className="text-primary-500" />
                إعدادات الاختبار
              </h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  عدد الأسئلة: <span className="text-primary-600 text-lg">{totalCount}</span>
                  {totalCount > totalAvailable && totalAvailable > 0 && (
                    <span className="text-yellow-600 text-xs mr-2">(سيتم إنشاء {totalAvailable} فقط)</span>
                  )}
                </label>
                <input
                  type="range"
                  min={3}
                  max={Math.max(50, totalAvailable)}
                  value={totalCount}
                  onChange={e => setTotalCount(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>3</span>
                  <span>{Math.max(50, totalAvailable)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Clock size={14} className="text-primary-500" />
                    المدة (دقيقة)
                  </label>
                  <input
                    type="number" min={5} max={180} value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="input-field text-center font-bold text-lg"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Target size={14} className="text-green-500" />
                    درجة النجاح (%)
                  </label>
                  <input
                    type="number" min={1} max={100} value={passingScore}
                    onChange={e => setPassingScore(Number(e.target.value))}
                    className="input-field text-center font-bold text-lg"
                  />
                </div>
              </div>
            </div>

            {totalAvailable === 0 && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>لا توجد أسئلة في البنك للأنواع المختارة. أضف أسئلة للاختبارات أولاً.</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={totalAvailable === 0 || !testTitle.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50"
            >
              <Shuffle size={18} />
              توليد الاختبار تلقائياً
            </button>
          </motion.div>
        )}

        {/* ─── Preview Step ─── */}
        {step === 'preview' && generated && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Summary Card */}
            <div className="card p-5 bg-gradient-to-l from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800">
              <div className="flex items-start gap-3">
                <Sparkles size={22} className="text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-primary-800 dark:text-primary-200 text-lg">{testTitle}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-primary-700 dark:text-primary-300">
                    <span>📝 {generated.length} سؤال</span>
                    <span>⏱ {duration} دقيقة</span>
                    <span>🎯 نجاح: {passingScore}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Type Distribution */}
            <div className="card p-5">
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">توزيع الأسئلة:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(TYPE_LABELS) as QType[]).map(type => {
                  const count = generated.filter(q => q.questionType === type).length;
                  if (!count) return null;
                  return (
                    <div key={type} className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="text-xl mb-0.5">{TYPE_EMOJIS[type]}</div>
                      <div className="font-bold text-2xl text-primary-600">{count}</div>
                      <div className="text-xs text-gray-400">{TYPE_LABELS[type]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Question List Preview */}
            <div className="card divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {generated.map((q, i) => (
                <div key={q.id} className="flex items-start gap-3 p-4">
                  <span className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{q.questionText}</p>
                    <span className={`badge text-xs mt-1 px-2 py-0.5 inline-block`}>
                      {TYPE_EMOJIS[q.questionType as QType]} {TYPE_LABELS[q.questionType as QType]}
                    </span>
                  </div>
                  <span className="text-xs text-yellow-600 font-bold shrink-0">{q.points}د</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleReshuffle}
                className="btn-secondary flex items-center justify-center gap-2 py-3"
              >
                <Shuffle size={16} />
                خلط مجدداً
              </button>
              <button
                onClick={handleCreate}
                disabled={createTest.isPending || !courseId}
                className="btn-primary flex items-center justify-center gap-2 py-3"
              >
                <Zap size={16} />
                {createTest.isPending ? 'جارٍ الإنشاء...' : 'إنشاء الاختبار'}
              </button>
            </div>
            {!courseId && (
              <p className="text-xs text-yellow-600 text-center">⚠️ اختر كورساً أولاً لربط الاختبار به</p>
            )}
          </motion.div>
        )}

        {/* ─── Done Step ─── */}
        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-14 text-center"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={44} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">تم إنشاء الاختبار!</h2>
            <p className="text-gray-400">جارٍ الانتقال لصفحة الاختبار...</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
