import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Pencil, Trash2, ClipboardList, Save, Sparkles, Code2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { quizzesApi } from '../../api/quizzes';
import { aiApi } from '../../api/ai';
import type { InteractiveQuestion, InteractiveQuizResult, InteractiveQuizSummary } from '../../types';

interface LevelForm {
  title: string;
  level: number;
  description: string;
  slug: string;
}

interface QuestionForm {
  text: string;
  textAlign: 'auto' | 'rtl' | 'ltr';
  type: 'MCQ' | 'TrueFalse';
  options: { text: string; isCode: boolean; align: 'auto' | 'rtl' | 'ltr' }[];
  correctAnswer: string;
}

const defaultLevelForm: LevelForm = {
  title: '',
  level: 1,
  description: '',
  slug: '',
};

const defaultQuestionForm: QuestionForm = {
  text: '',
  textAlign: 'auto',
  type: 'MCQ',
  options: [
    { text: '', isCode: false, align: 'auto' },
    { text: '', isCode: false, align: 'auto' },
    { text: '', isCode: false, align: 'auto' },
    { text: '', isCode: false, align: 'auto' },
  ],
  correctAnswer: '',
};

const LEVEL_SUBJECT = 'JavaScript Levels';
const CODE_PREFIX = '[code]::';
const ALIGN_PREFIX = '[align=';

function encodeAlignedText(text: string, align: 'auto' | 'rtl' | 'ltr') {
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (align === 'auto') return trimmed;
  return `${ALIGN_PREFIX}${align}]::${trimmed}`;
}

function decodeAlignedText(raw: string): { text: string; align: 'auto' | 'rtl' | 'ltr' } {
  if (raw.startsWith(`${ALIGN_PREFIX}rtl]::`)) {
    return { text: raw.slice(`${ALIGN_PREFIX}rtl]::`.length), align: 'rtl' };
  }
  if (raw.startsWith(`${ALIGN_PREFIX}ltr]::`)) {
    return { text: raw.slice(`${ALIGN_PREFIX}ltr]::`.length), align: 'ltr' };
  }
  return { text: raw, align: 'auto' };
}

function mapAlignToTextAlign(align: 'auto' | 'rtl' | 'ltr'): 'left' | 'right' | undefined {
  if (align === 'rtl') return 'right';
  if (align === 'ltr') return 'left';
  return undefined;
}

function encodeOption(option: { text: string; isCode: boolean; align: 'auto' | 'rtl' | 'ltr' }) {
  const text = option.text.trim();
  if (!text) return '';
  const aligned = encodeAlignedText(text, option.align);
  return option.isCode ? `${CODE_PREFIX}${aligned}` : aligned;
}

function decodeOption(raw: string): { text: string; isCode: boolean; align: 'auto' | 'rtl' | 'ltr' } {
  if (raw.startsWith(CODE_PREFIX)) {
    const decoded = decodeAlignedText(raw.slice(CODE_PREFIX.length));
    return { ...decoded, isCode: true };
  }
  const decoded = decodeAlignedText(raw);
  return { ...decoded, isCode: false };
}

function extractLevel(title: string): number | null {
  const m = title.match(/(?:level|lvl|المستوى)\s*([0-9]+)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function parseOptions(options?: string | null) {
  if (!options) return [];
  try {
    return JSON.parse(options) as string[];
  } catch {
    return [];
  }
}

export default function AdminLevelAssessments() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | 'questions' | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<InteractiveQuizSummary | null>(null);
  const [levelForm, setLevelForm] = useState<LevelForm>(defaultLevelForm);
  const [questionForm, setQuestionForm] = useState<QuestionForm>(defaultQuestionForm);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [improveLoading, setImproveLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InteractiveQuestion | null>(null);
  const [editQuestionForm, setEditQuestionForm] = useState<QuestionForm>(defaultQuestionForm);

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['interactive-quizzes'],
    queryFn: quizzesApi.getAll,
  });

  const levelQuizzes = useMemo(() => {
    return quizzes
      .filter(q => (q.subject ?? '').toLowerCase() === LEVEL_SUBJECT.toLowerCase())
      .sort((a, b) => (extractLevel(a.title) ?? 999) - (extractLevel(b.title) ?? 999));
  }, [quizzes]);
  const levelQuizIds = useMemo(() => levelQuizzes.map(q => q.id), [levelQuizzes]);

  const { data: levelStats = {} } = useQuery({
    queryKey: ['admin-levels-stats', levelQuizIds.join(',')],
    queryFn: async () => {
      const rows = await Promise.all(
        levelQuizzes.map(async (quiz) => {
          try {
            const results = await quizzesApi.getLeaderboard(quiz.id);
            const participants = results.length;
            const avgPct = participants
              ? Math.round(results.reduce((sum: number, r: InteractiveQuizResult) => sum + (r.pct || 0), 0) / participants)
              : 0;
            const bestPct = participants
              ? Math.max(...results.map((r: InteractiveQuizResult) => r.pct || 0))
              : 0;
            return [quiz.id, { participants, avgPct, bestPct }] as const;
          } catch {
            return [quiz.id, { participants: 0, avgPct: 0, bestPct: 0 }] as const;
          }
        }),
      );
      return Object.fromEntries(rows) as Record<number, { participants: number; avgPct: number; bestPct: number }>;
    },
    enabled: levelQuizIds.length > 0,
  });

  const { data: selectedQuiz, isLoading: loadingQuiz } = useQuery({
    queryKey: ['interactive-quiz', selectedQuizId],
    queryFn: () => quizzesApi.getById(selectedQuizId!),
    enabled: !!selectedQuizId,
  });

  const createMutation = useMutation({
    mutationFn: quizzesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interactive-quizzes'] });
      toast.success('تم إنشاء مستوى JavaScript');
      closeModal();
    },
    onError: () => toast.error('فشل إنشاء المستوى'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => quizzesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interactive-quizzes'] });
      toast.success('تم تحديث المستوى');
      closeModal();
    },
    onError: () => toast.error('فشل تحديث المستوى'),
  });

  const deleteMutation = useMutation({
    mutationFn: quizzesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interactive-quizzes'] });
      toast.success('تم حذف المستوى');
    },
    onError: () => toast.error('فشل الحذف'),
  });

  const addQuestionMutation = useMutation({
    mutationFn: ({ quizId, payload }: { quizId: number; payload: any }) =>
      quizzesApi.bulkAddQuestions(quizId, [payload]),
    onSuccess: () => {
      if (selectedQuizId) {
        qc.invalidateQueries({ queryKey: ['interactive-quiz', selectedQuizId] });
        qc.invalidateQueries({ queryKey: ['interactive-quizzes'] });
      }
      setQuestionForm(defaultQuestionForm);
      toast.success('تم إضافة السؤال');
    },
    onError: () => toast.error('فشل إضافة السؤال'),
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: quizzesApi.deleteQuestion,
    onSuccess: () => {
      if (selectedQuizId) {
        qc.invalidateQueries({ queryKey: ['interactive-quiz', selectedQuizId] });
        qc.invalidateQueries({ queryKey: ['interactive-quizzes'] });
      }
      toast.success('تم حذف السؤال');
    },
    onError: () => toast.error('فشل حذف السؤال'),
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({ questionId, payload }: { questionId: number; payload: any }) =>
      quizzesApi.updateQuestion(questionId, payload),
    onSuccess: () => {
      if (selectedQuizId) {
        qc.invalidateQueries({ queryKey: ['interactive-quiz', selectedQuizId] });
      }
      toast.success('تم تحديث السؤال');
      setEditingQuestion(null);
      setEditQuestionForm(defaultQuestionForm);
    },
    onError: () => toast.error('فشل تعديل السؤال'),
  });

  const closeModal = () => {
    setModal(null);
    setEditingQuiz(null);
    setSelectedQuizId(null);
    setLevelForm(defaultLevelForm);
    setQuestionForm(defaultQuestionForm);
    setEditingQuestion(null);
    setEditQuestionForm(defaultQuestionForm);
  };

  const openCreate = () => {
    const nextLevel = (levelQuizzes[levelQuizzes.length - 1] ? (extractLevel(levelQuizzes[levelQuizzes.length - 1].title) ?? 0) : 0) + 1;
    setLevelForm({
      title: `JavaScript Level ${nextLevel}`,
      level: nextLevel,
      description: '',
      slug: `javascript-level-${nextLevel}`,
    });
    setModal('create');
  };

  const openEdit = (quiz: InteractiveQuizSummary) => {
    setEditingQuiz(quiz);
    setLevelForm({
      title: quiz.title,
      level: extractLevel(quiz.title) ?? 1,
      description: quiz.description ?? '',
      slug: quiz.slug ?? '',
    });
    setModal('edit');
  };

  const openQuestions = (quiz: InteractiveQuizSummary) => {
    setSelectedQuizId(quiz.id);
    setModal('questions');
  };

  const submitLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelForm.title.trim()) return toast.error('عنوان المستوى مطلوب');
    const payload = {
      title: levelForm.title.trim(),
      subject: LEVEL_SUBJECT,
      grade: `Level ${levelForm.level}`,
      description: levelForm.description.trim(),
      slug: levelForm.slug.trim() || undefined,
    };
    if (modal === 'edit' && editingQuiz) {
      updateMutation.mutate({ id: editingQuiz.id, data: payload });
      return;
    }
    createMutation.mutate(payload);
  };

  const submitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) return;
    if (!questionForm.text.trim()) return toast.error('نص السؤال مطلوب');

    if (questionForm.type === 'TrueFalse') {
      if (!['true', 'false'].includes(questionForm.correctAnswer)) {
        toast.error('اختر الإجابة الصحيحة (صح/خطأ)');
        return;
      }
      addQuestionMutation.mutate({
        quizId: selectedQuizId,
        payload: {
          text: encodeAlignedText(questionForm.text, questionForm.textAlign),
          type: 'TrueFalse',
          options: JSON.stringify(['صح', 'خطأ']),
          correctAnswer: questionForm.correctAnswer,
        },
      });
      return;
    }

    const options = questionForm.options
      .map(encodeOption)
      .filter(Boolean);
    if (options.length < 2) return toast.error('أدخل على الأقل خيارين');
    const idx = Number(questionForm.correctAnswer);
    if (!Number.isInteger(idx) || idx < 0 || idx >= options.length) {
      return toast.error('رقم الإجابة الصحيحة غير صحيح');
    }

    addQuestionMutation.mutate({
      quizId: selectedQuizId,
      payload: {
        text: encodeAlignedText(questionForm.text, questionForm.textAlign),
        type: 'MCQ',
        options: JSON.stringify(options),
        correctAnswer: String(idx),
      },
    });
  };

  const improveQuestionWithAI = async () => {
    if (!questionForm.text.trim()) {
      toast.error('اكتب السؤال أولًا');
      return;
    }
    setImproveLoading(true);
    try {
      const result = await aiApi.describe(
        'Improve JavaScript MCQ question wording',
        `Rewrite and improve this Arabic JavaScript question while keeping intent:\n${questionForm.text}`,
      );
      setQuestionForm(f => ({ ...f, text: result.description.trim() }));
      toast.success('تم تحسين صياغة السؤال');
    } catch {
      toast.error('فشل تحسين السؤال بالذكاء الاصطناعي');
    } finally {
      setImproveLoading(false);
    }
  };

  const generateOptionsWithAI = async () => {
    if (!questionForm.text.trim()) {
      toast.error('اكتب السؤال أولًا');
      return;
    }
    setOptionsLoading(true);
    try {
      const parsed = await aiApi.parseQuiz(questionForm.text, 'MCQ');
      const generated = parsed.questions?.[0]?.options?.filter(Boolean) ?? [];
      if (generated.length < 2) {
        toast.error('لم يتمكن الذكاء الاصطناعي من توليد اختيارات كافية');
        return;
      }
      setQuestionForm(f => ({
        ...f,
        type: 'MCQ',
        options: generated.map(v => decodeOption(v)).concat(
          Array.from({ length: Math.max(0, 4 - generated.length) }).map(() => ({ text: '', isCode: false, align: 'auto' })),
        ).slice(0, 6),
        correctAnswer: f.correctAnswer || '0',
      }));
      toast.success('تم توليد اختيارات تلقائيًا');
    } catch {
      toast.error('فشل توليد الاختيارات بالذكاء الاصطناعي');
    } finally {
      setOptionsLoading(false);
    }
  };

  const openEditQuestion = (q: InteractiveQuestion) => {
    const decodedQuestion = decodeAlignedText(q.text);
    const opts = parseOptions(q.options).map(decodeOption);
    setEditingQuestion(q);
    setEditQuestionForm({
      text: decodedQuestion.text,
      textAlign: decodedQuestion.align,
      type: q.type,
      options: q.type === 'MCQ'
        ? (opts.length ? opts : defaultQuestionForm.options)
        : [{ text: 'صح', isCode: false, align: 'auto' }, { text: 'خطأ', isCode: false, align: 'auto' }],
      correctAnswer: q.correctAnswer ?? '',
    });
  };

  const submitEditQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    if (!editQuestionForm.text.trim()) return toast.error('نص السؤال مطلوب');

    if (editQuestionForm.type === 'TrueFalse') {
      if (!['true', 'false'].includes(editQuestionForm.correctAnswer)) {
        return toast.error('اختر الإجابة الصحيحة');
      }
      updateQuestionMutation.mutate({
        questionId: editingQuestion.id,
        payload: {
          text: encodeAlignedText(editQuestionForm.text, editQuestionForm.textAlign),
          type: 'TrueFalse',
          options: JSON.stringify(['صح', 'خطأ']),
          correctAnswer: editQuestionForm.correctAnswer,
        },
      });
      return;
    }

    const options = editQuestionForm.options.map(encodeOption).filter(Boolean);
    if (options.length < 2) return toast.error('أدخل خيارين على الأقل');
    const idx = Number(editQuestionForm.correctAnswer);
    if (!Number.isInteger(idx) || idx < 0 || idx >= options.length) {
      return toast.error('حدد الإجابة الصحيحة');
    }
    updateQuestionMutation.mutate({
      questionId: editingQuestion.id,
      payload: {
        text: encodeAlignedText(editQuestionForm.text, editQuestionForm.textAlign),
        type: 'MCQ',
        options: JSON.stringify(options),
        correctAnswer: String(idx),
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة مستويات JavaScript</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">نظام مستقل لإنشاء مستويات JS وإدارة أسئلتها.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> إضافة مستوى
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : !levelQuizzes.length ? (
        <div className="card p-10 text-center text-gray-500 dark:text-gray-400">
          لا توجد مستويات بعد. ابدأ بإضافة Level 1.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {levelQuizzes.map(quiz => (
            <div key={quiz.id} className="card p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{quiz.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.questionCount} سؤال</p>
                </div>
                <BookOpen size={20} className="text-primary-500" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
                  <p className="text-xs text-slate-500">دخلوا الاختبار</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{levelStats[quiz.id]?.participants ?? 0}</p>
                </div>
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
                  <p className="text-xs text-slate-500">متوسط النسبة</p>
                  <p className="text-lg font-bold text-amber-600">{levelStats[quiz.id]?.avgPct ?? 0}%</p>
                </div>
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
                  <p className="text-xs text-slate-500">أعلى نسبة</p>
                  <p className="text-lg font-bold text-emerald-600">{levelStats[quiz.id]?.bestPct ?? 0}%</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => openQuestions(quiz)} className="btn-secondary flex items-center gap-1.5">
                  <ClipboardList size={14} /> إدارة الأسئلة
                </button>
                <button onClick={() => openEdit(quiz)} className="btn-secondary flex items-center gap-1.5">
                  <Pencil size={14} /> تعديل
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`حذف ${quiz.title}؟`)) deleteMutation.mutate(quiz.id);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 text-sm font-semibold flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modal === 'create' || modal === 'edit'}
        onClose={closeModal}
        title={modal === 'create' ? 'إضافة مستوى JavaScript' : 'تعديل المستوى'}
      >
        <form onSubmit={submitLevel} className="space-y-4" dir="rtl">
          <div>
            <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">عنوان المستوى</label>
            <input
              className="input-field"
              value={levelForm.title}
              onChange={e => setLevelForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">رقم المستوى</label>
            <input
              type="number"
              min={1}
              className="input-field"
              value={levelForm.level}
              onChange={e => {
                const lvl = Number(e.target.value) || 1;
                setLevelForm(f => ({ ...f, level: lvl, title: `JavaScript Level ${lvl}` }));
              }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">Slug (اختياري)</label>
            <input
              className="input-field"
              value={levelForm.slug}
              onChange={e => setLevelForm(f => ({ ...f, slug: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">وصف</label>
            <textarea
              className="input-field min-h-[90px] resize-none"
              value={levelForm.description}
              onChange={e => setLevelForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save size={16} />
            {modal === 'create' ? 'إنشاء المستوى' : 'حفظ التعديلات'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={modal === 'questions'} onClose={closeModal} title="إدارة أسئلة المستوى" size="xl">
        {loadingQuiz || !selectedQuiz ? (
          <LoadingSpinner size="md" />
        ) : (
          <div className="space-y-6" dir="rtl">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{selectedQuiz.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedQuiz.questions.length} سؤال</p>
            </div>

            <form onSubmit={submitQuestion} className="card p-4 space-y-3">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">إضافة سؤال يدويًا</h4>
              <textarea
                className="input-field min-h-[80px] resize-none"
                placeholder="اكتب السؤال"
                value={questionForm.text}
                onChange={e => setQuestionForm(f => ({ ...f, text: e.target.value }))}
              />
              <select
                className="input-field"
                value={questionForm.textAlign}
                onChange={e => setQuestionForm(f => ({ ...f, textAlign: e.target.value as 'auto' | 'rtl' | 'ltr' }))}
              >
                <option value="auto">محاذاة السؤال: تلقائي</option>
                <option value="rtl">محاذاة السؤال: يمين</option>
                <option value="ltr">محاذاة السؤال: يسار</option>
              </select>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={improveQuestionWithAI}
                  disabled={improveLoading}
                  className="btn-secondary flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> {improveLoading ? 'جاري التحسين...' : 'تحسين السؤال بالذكاء الاصطناعي'}
                </button>
              </div>
              <select
                className="input-field"
                value={questionForm.type}
                onChange={e => setQuestionForm(f => ({
                  ...f,
                  type: e.target.value as 'MCQ' | 'TrueFalse',
                  options: e.target.value === 'MCQ'
                    ? defaultQuestionForm.options
                    : [{ text: 'صح', isCode: false, align: 'auto' }, { text: 'خطأ', isCode: false, align: 'auto' }],
                  correctAnswer: '',
                }))}
              >
                <option value="MCQ">اختيار متعدد</option>
                <option value="TrueFalse">صح / خطأ</option>
              </select>

              {questionForm.type === 'MCQ' ? (
                <>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={generateOptionsWithAI}
                      disabled={optionsLoading}
                      className="btn-secondary flex items-center gap-1.5"
                    >
                      <Sparkles size={14} /> {optionsLoading ? 'جاري التوليد...' : 'توليد اختيارات تلقائيًا'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {questionForm.options.map((opt, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-start">
                        <textarea
                          className="input-field min-h-[72px] resize-y leading-6"
                          placeholder={`الخيار ${idx + 1}`}
                          value={opt.text}
                          onChange={e => setQuestionForm(f => ({
                            ...f,
                            options: f.options.map((o, i) => (i === idx ? { ...o, text: e.target.value } : o)),
                          }))}
                        />
                        <select
                          className="px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          value={opt.align}
                          onChange={e => setQuestionForm(f => ({
                            ...f,
                            options: f.options.map((o, i) => (i === idx ? { ...o, align: e.target.value as 'auto' | 'rtl' | 'ltr' } : o)),
                          }))}
                        >
                          <option value="auto">تلقائي</option>
                          <option value="rtl">يمين</option>
                          <option value="ltr">يسار</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setQuestionForm(f => ({ ...f, correctAnswer: String(idx) }))}
                          className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 ${questionForm.correctAnswer === String(idx) ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200'}`}
                        >
                          <CheckCircle2 size={13} /> صح
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuestionForm(f => ({
                            ...f,
                            options: f.options.map((o, i) => (i === idx ? { ...o, isCode: !o.isCode } : o)),
                          }))}
                          className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 ${opt.isCode ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200'}`}
                        >
                          <Code2 size={13} /> كود
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <select
                  className="input-field"
                  value={questionForm.correctAnswer}
                  onChange={e => setQuestionForm(f => ({ ...f, correctAnswer: e.target.value }))}
                >
                  <option value="">اختر الإجابة الصحيحة</option>
                  <option value="true">صح</option>
                  <option value="false">خطأ</option>
                </select>
              )}

              <button type="submit" className="btn-primary" disabled={addQuestionMutation.isPending}>
                إضافة السؤال
              </button>
            </form>

            <div className="space-y-3">
              {selectedQuiz.questions.map((q: InteractiveQuestion) => {
                const decodedQuestion = decodeAlignedText(q.text);
                const options = parseOptions(q.options);
                const correct = q.type === 'TrueFalse'
                  ? (q.correctAnswer === 'true' ? 'صح' : q.correctAnswer === 'false' ? 'خطأ' : 'غير محدد')
                  : (q.correctAnswer != null ? decodeOption(options[Number(q.correctAnswer)] ?? '').text || 'غير محدد' : 'غير محدد');
                return (
                  <div key={q.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap"
                          dir={decodedQuestion.align}
                          style={{ textAlign: mapAlignToTextAlign(decodedQuestion.align) }}
                        >
                          {decodedQuestion.text}
                        </p>
                        {q.type === 'MCQ' && (
                          <div className="mt-2 space-y-1">
                            {options.map((opt, idx) => {
                              const decoded = decodeOption(opt);
                              const isCorrect = String(idx) === (q.correctAnswer ?? '');
                              return (
                                <div key={idx} className={`text-xs rounded px-2 py-1 flex items-start gap-2 ${decoded.isCode ? 'bg-slate-900 text-cyan-200 font-mono' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200'}`}>
                                  {decoded.isCode && <Code2 size={12} />}
                                  <span
                                    className="whitespace-pre-wrap"
                                    dir={decoded.align}
                                    style={{ textAlign: mapAlignToTextAlign(decoded.align) }}
                                  >
                                    {decoded.text}
                                  </span>
                                  {isCorrect && <span className="text-emerald-400">✓</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">الإجابة الصحيحة: {correct}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditQuestion(q)}
                          className="text-blue-600 hover:text-blue-500"
                          title="تعديل السؤال"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteQuestionMutation.mutate(q.id)}
                          className="text-red-600 hover:text-red-500"
                          title="حذف السؤال"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!editingQuestion} onClose={() => setEditingQuestion(null)} title="تعديل السؤال" size="xl">
        <form onSubmit={submitEditQuestion} className="space-y-4" dir="rtl">
          <textarea
            className="input-field min-h-[90px] resize-none"
            value={editQuestionForm.text}
            onChange={e => setEditQuestionForm(f => ({ ...f, text: e.target.value }))}
          />
          <select
            className="input-field"
            value={editQuestionForm.textAlign}
            onChange={e => setEditQuestionForm(f => ({ ...f, textAlign: e.target.value as 'auto' | 'rtl' | 'ltr' }))}
          >
            <option value="auto">محاذاة السؤال: تلقائي</option>
            <option value="rtl">محاذاة السؤال: يمين</option>
            <option value="ltr">محاذاة السؤال: يسار</option>
          </select>
          <select
            className="input-field"
            value={editQuestionForm.type}
            onChange={e => setEditQuestionForm(f => ({
              ...f,
              type: e.target.value as 'MCQ' | 'TrueFalse',
              options: e.target.value === 'MCQ'
                ? defaultQuestionForm.options
                : [{ text: 'صح', isCode: false, align: 'auto' }, { text: 'خطأ', isCode: false, align: 'auto' }],
              correctAnswer: '',
            }))}
          >
            <option value="MCQ">اختيار متعدد</option>
            <option value="TrueFalse">صح / خطأ</option>
          </select>

          {editQuestionForm.type === 'MCQ' ? (
            <div className="space-y-2">
              {editQuestionForm.options.map((opt, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-start">
                  <textarea
                    className="input-field min-h-[72px] resize-y leading-6"
                    value={opt.text}
                    onChange={e => setEditQuestionForm(f => ({
                      ...f,
                      options: f.options.map((o, i) => (i === idx ? { ...o, text: e.target.value } : o)),
                    }))}
                  />
                  <select
                    className="px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    value={opt.align}
                    onChange={e => setEditQuestionForm(f => ({
                      ...f,
                      options: f.options.map((o, i) => (i === idx ? { ...o, align: e.target.value as 'auto' | 'rtl' | 'ltr' } : o)),
                    }))}
                  >
                    <option value="auto">تلقائي</option>
                    <option value="rtl">يمين</option>
                    <option value="ltr">يسار</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setEditQuestionForm(f => ({ ...f, correctAnswer: String(idx) }))}
                    className={`px-3 py-2 rounded-lg text-xs font-bold ${editQuestionForm.correctAnswer === String(idx) ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200'}`}
                  >
                    صح
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditQuestionForm(f => ({
                      ...f,
                      options: f.options.map((o, i) => (i === idx ? { ...o, isCode: !o.isCode } : o)),
                    }))}
                    className={`px-3 py-2 rounded-lg text-xs font-bold ${opt.isCode ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200'}`}
                  >
                    كود
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <select
              className="input-field"
              value={editQuestionForm.correctAnswer}
              onChange={e => setEditQuestionForm(f => ({ ...f, correctAnswer: e.target.value }))}
            >
              <option value="">اختر الإجابة الصحيحة</option>
              <option value="true">صح</option>
              <option value="false">خطأ</option>
            </select>
          )}

          <button type="submit" className="btn-primary" disabled={updateQuestionMutation.isPending}>
            حفظ التعديل
          </button>
        </form>
      </Modal>
    </div>
  );
}
