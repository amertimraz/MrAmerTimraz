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

function parseOptions(raw?: string | null): { text: string; isCode: boolean }[] {
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as string[]).map((opt) => {
      if (opt.startsWith(CODE_PREFIX)) return { text: opt.slice(CODE_PREFIX.length), isCode: true };
      return { text: opt, isCode: false };
    });
  } catch {
    return [];
  }
}

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
  const options = q?.type === 'MCQ'
    ? parseOptions(q.options)
    : [{ text: 'صح', isCode: false }, { text: 'خطأ', isCode: false }];

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
        <div className="bg-[#0b1020] border border-[#1f2a44] rounded-xl p-4 text-[#c9d4f1] font-mono text-sm leading-7">
          {q.text}
        </div>

        {q.type === 'MCQ' ? (
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => answerQuestion(idx)}
                className={`w-full text-right p-3 rounded-xl border transition-colors ${
                  answers[q.id] === idx
                    ? 'bg-primary-600 text-white border-primary-500'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="opacity-70">{'>'}</span>
                  {opt.isCode && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/25 border border-white/20 font-mono">{'</>'}</span>
                  )}
                  <span className={opt.isCode ? 'font-mono' : ''}>{opt.text}</span>
                </div>
                {opt.isCode && (
                  <div className="mt-2 rounded-lg bg-[#0b1020] border border-[#1f2a44] px-3 py-2 font-mono text-xs text-cyan-200 overflow-auto">
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
