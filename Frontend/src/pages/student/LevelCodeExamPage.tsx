import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { quizzesApi } from '../../api/quizzes';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  canOpenLevel,
  isJavaScriptLevelQuiz,
  saveLevelAttempt,
} from '../../utils/levelAssessments';
const CODE_PREFIX = '[code]::';
const ALIGN_PREFIX = '[align=';

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

function parseOptions(raw?: string | null): { text: string; isCode: boolean; align: 'auto' | 'rtl' | 'ltr' }[] {
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as string[]).map((opt) => {
      if (opt.startsWith(CODE_PREFIX)) {
        const decoded = decodeAlignedText(opt.slice(CODE_PREFIX.length));
        return { ...decoded, isCode: true };
      }
      const decoded = decodeAlignedText(opt);
      return { ...decoded, isCode: false };
    });
  } catch {
    return [];
  }
}

type ParsedOption = { text: string; isCode: boolean; align: 'auto' | 'rtl' | 'ltr' };

export default function LevelCodeExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const lockNoticeRef = useRef(false);

  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ['interactive-quiz-level-take', id],
    queryFn: () => {
      const clean = id?.trim() ?? '';
      return /^\d+$/.test(clean) ? quizzesApi.getById(Number(clean)) : quizzesApi.getBySlug(clean);
    },
    enabled: !!id,
  });

  const { data: allQuizzes = [] } = useQuery({
    queryKey: ['interactive-quizzes-level-take-all'],
    queryFn: quizzesApi.getAll,
    enabled: !!quiz,
  });

  const levelQuizzes = allQuizzes.filter(isJavaScriptLevelQuiz);
  const isLocked = quiz ? !canOpenLevel(quiz, levelQuizzes, user?.id) : false;
  const questions = quiz?.questions ?? [];
  const q = questions[current];
  const questionText = decodeAlignedText(q?.text ?? '');
  const options: ParsedOption[] = q?.type === 'MCQ'
    ? parseOptions(q.options)
    : [{ text: 'صح', isCode: false, align: 'auto' }, { text: 'خطأ', isCode: false, align: 'auto' }];

  const result = useMemo(() => {
    let correct = 0;
    for (const question of questions) {
      const ans = answers[question.id];
      if (ans === undefined) continue;
      if (question.type === 'TrueFalse') {
        const target = question.correctAnswer === 'true';
        if (ans === target) correct++;
      } else {
        const target = Number(question.correctAnswer);
        if (ans === target) correct++;
      }
    }
    const total = questions.length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return { correct, total, pct };
  }, [answers, questions]);

  const reviewRows = useMemo(() => {
    return questions.map((question, index) => {
      if (question.type === 'TrueFalse') {
        const selected = answers[question.id];
        const studentAnswer = selected === true ? 'صح' : selected === false ? 'خطأ' : 'بدون إجابة';
        const correctAnswer = question.correctAnswer === 'true' ? 'صح' : 'خطأ';
        const isCorrect = selected === (question.correctAnswer === 'true');
        return {
          id: question.id,
          index: index + 1,
          text: decodeAlignedText(question.text),
          studentAnswer,
          correctAnswer,
          isCorrect,
        };
      }

      const optionsForQuestion = parseOptions(question.options);
      const selected = answers[question.id];
      const selectedIdx = typeof selected === 'number' ? selected : -1;
      const correctIdx = Number(question.correctAnswer);
      const studentOpt = selectedIdx >= 0 ? optionsForQuestion[selectedIdx] : undefined;
      const correctOpt = correctIdx >= 0 ? optionsForQuestion[correctIdx] : undefined;
      return {
        id: question.id,
        index: index + 1,
        text: decodeAlignedText(question.text),
        studentAnswer: studentOpt?.text ?? 'بدون إجابة',
        correctAnswer: correctOpt?.text ?? 'غير محدد',
        isCorrect: selectedIdx === correctIdx,
      };
    });
  }, [questions, answers]);

  useEffect(() => {
    if (!isLocked || lockNoticeRef.current) return;
    lockNoticeRef.current = true;
    toast.error('هذا المستوى مقفول حتى تجتاز المستوى السابق.');
    navigate('/student/levels', { replace: true });
  }, [isLocked, navigate]);

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (error || !quiz) return <div className="card p-8 text-center">لم يتم العثور على الاختبار.</div>;
  if (isLocked) return null;

  const answerQuestion = (value: number | boolean) => {
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q.id]: value }));
  };

  const finishExam = () => {
    const isPassed = result.pct >= 70;
    saveLevelAttempt(user?.id, {
      quizId: quiz.id,
      quizTitle: quiz.title,
      score: result.correct,
      total: result.total,
      pct: result.pct,
    });
    setSubmitted(true);
    toast.success(isPassed ? 'مبروك! تم اجتياز المستوى.' : 'تم حفظ النتيجة. حاول مرة أخرى لتحسين الدرجة.');
  };

  if (submitted) {
    return (
      <div className="space-y-5">
        <div className="card p-8 text-center space-y-3">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-lg">النتيجة: {result.correct}/{result.total} ({result.pct}%)</p>
          <p className={result.pct >= 70 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {result.pct >= 70 ? '✅ ناجح - الشهادة متاحة الآن' : '❌ لم تصل لنسبة النجاح (70%)'}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={() => navigate('/student/levels')} className="btn-secondary">العودة للمستويات</button>
            {result.pct >= 70 && (
              <button onClick={() => navigate(`/student/levels/certificate/${quiz.id}`)} className="btn-primary">
                فتح الشهادة
              </button>
            )}
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">مراجعة الإجابات</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">راجع كل سؤال لمعرفة إجابتك والإجابة الصحيحة.</p>

          <div className="space-y-3">
            {reviewRows.map((row) => (
              <div
                key={row.id}
                className={`rounded-xl border p-4 space-y-3 ${
                  row.isCorrect
                    ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-900/10'
                    : 'border-rose-200 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-900/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p
                    className="font-semibold text-gray-900 dark:text-white whitespace-pre-wrap"
                    dir={row.text.align}
                    style={{ textAlign: mapAlignToTextAlign(row.text.align) }}
                  >
                    {row.index}. {row.text.text}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${row.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                    {row.isCorrect ? 'إجابة صحيحة' : 'إجابة خاطئة'}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-white/70 dark:bg-slate-900/40 border border-white/60 dark:border-slate-700 px-3 py-2">
                    <p className="text-xs text-slate-500 mb-1">إجابتك</p>
                    <p className="font-medium whitespace-pre-wrap">{row.studentAnswer}</p>
                  </div>
                  <div className="rounded-lg bg-white/70 dark:bg-slate-900/40 border border-white/60 dark:border-slate-700 px-3 py-2">
                    <p className="text-xs text-slate-500 mb-1">الإجابة الصحيحة</p>
                    <p className="font-medium whitespace-pre-wrap">{row.correctAnswer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="card p-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">{quiz.title}</h1>
        <span className="text-sm text-gray-500">سؤال {current + 1} من {questions.length}</span>
      </div>

      <div className="card p-5 space-y-4">
        <div
          className="bg-[#0b1020] border border-[#1f2a44] rounded-xl p-4 text-[#c9d4f1] font-mono text-sm leading-7 whitespace-pre-wrap"
          dir={questionText.align}
          style={{ textAlign: mapAlignToTextAlign(questionText.align) }}
        >
          {questionText.text}
        </div>

        {q.type === 'MCQ' ? (
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => answerQuestion(idx)}
                className={`w-full p-3 rounded-xl border transition-colors ${
                  answers[q.id] === idx
                    ? 'bg-primary-600 text-white border-primary-500'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="opacity-70">{'>'}</span>
                  {opt.isCode && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/25 border border-white/20 font-mono">{'</>'}</span>
                  )}
                  {!opt.isCode && (
                    <div
                      className="flex-1 min-w-0"
                      dir={opt.align}
                      style={{ textAlign: mapAlignToTextAlign(opt.align) }}
                    >
                      <span className="block whitespace-pre-wrap">{opt.text}</span>
                    </div>
                  )}
                </div>
                {opt.isCode && (
                  <div
                    className="mt-2 rounded-lg bg-[#0b1020] border border-[#1f2a44] px-3 py-2 font-mono text-xs text-cyan-200 overflow-auto whitespace-pre-wrap"
                    dir={opt.align}
                    style={{ textAlign: mapAlignToTextAlign(opt.align) }}
                  >
                    {opt.text}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => answerQuestion(true)}
              className={`btn-secondary ${answers[q.id] === true ? '!bg-green-600 !text-white' : ''}`}
            >
              صح
            </button>
            <button
              onClick={() => answerQuestion(false)}
              className={`btn-secondary ${answers[q.id] === false ? '!bg-red-600 !text-white' : ''}`}
            >
              خطأ
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            disabled={current === 0}
            onClick={() => setCurrent(v => Math.max(0, v - 1))}
            className="btn-secondary disabled:opacity-50"
          >
            السابق
          </button>
          <button
            disabled={current === questions.length - 1}
            onClick={() => setCurrent(v => Math.min(questions.length - 1, v + 1))}
            className="btn-secondary disabled:opacity-50"
          >
            التالي
          </button>
          {questions.length > 0 && current === questions.length - 1 && (
            <button onClick={finishExam} className="btn-primary">إنهاء الاختبار</button>
          )}
        </div>
      </div>
    </div>
  );
}
