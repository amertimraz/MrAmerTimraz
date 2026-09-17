import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Trophy, Timer, Check, X } from 'lucide-react';
import axios from 'axios';
import {
  reviewsApi,
  type ReviewQuizPublic,
  type ReviewLeaderboardEntry,
  type ReviewSubmitResult,
} from '../../api/reviews';

type Step = 'loading' | 'name' | 'quiz' | 'result' | 'not-found';

interface Feedback {
  isCorrect: boolean;
  correctOptionIndex: number;
}

const PAGE_BG = 'radial-gradient(circle at 50% -10%, #1e3a5f 0%, #0b1120 55%, #060a14 100%)';

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getBadge(score: number, total: number) {
  const pct = total > 0 ? score / total : 0;
  if (pct === 1) return { emoji: '🏆', label: 'إجابة كاملة! بطل المراجعة', color: '#fbbf24' };
  if (pct >= 0.8) return { emoji: '🌟', label: 'ممتاز', color: '#34d399' };
  if (pct >= 0.5) return { emoji: '👍', label: 'جيد، تابع كذا', color: '#38bdf8' };
  return { emoji: '📚', label: 'راجع الدرس تاني وجرب من جديد', color: '#94a3b8' };
}

export default function ReviewQuizPage() {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const id = Number(quizId);

  const [step, setStep] = useState<Step>('loading');
  const [quiz, setQuiz] = useState<ReviewQuizPublic | null>(null);
  const [studentName, setStudentName] = useState('');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<Record<number, Feedback>>({});
  const [checking, setChecking] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<ReviewSubmitResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<ReviewLeaderboardEntry[]>([]);

  useEffect(() => {
    reviewsApi.getQuiz(id)
      .then(q => { setQuiz(q); setStep('name'); })
      .catch(() => setStep('not-found'));
  }, [id]);

  useEffect(() => {
    if (step !== 'quiz') return;
    const iv = setInterval(() => setElapsedSeconds(Math.round((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [step, startedAt]);

  const startQuiz = () => {
    if (!studentName.trim()) return;
    setStartedAt(Date.now());
    setElapsedSeconds(0);
    setStep('quiz');
  };

  const selectOption = async (questionId: number, idx: number) => {
    if (feedback[questionId] || checking) return;
    setAnswers(p => ({ ...p, [questionId]: idx }));
    setChecking(true);
    try {
      const res = await reviewsApi.checkAnswer(id, questionId, idx);
      setFeedback(p => ({ ...p, [questionId]: { isCorrect: res.isCorrect, correctOptionIndex: res.correctOptionIndex } }));
    } catch {
      // if the check call fails, keep the selection but without instant feedback
    } finally {
      setChecking(false);
    }
  };

  const submit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
      const answerList = quiz.questions.map(q => ({
        questionId: q.id,
        selectedOptionIndex: answers[q.id] ?? -1,
      }));
      const res = await reviewsApi.submit(id, studentName.trim(), durationSeconds, answerList);
      setResult(res);
      const lb = await reviewsApi.getLeaderboard(id);
      setLeaderboard(lb);
      setStep('result');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setSubmitError('لقد قمت بحل هذه المراجعة من قبل بهذا الاسم');
      } else {
        setSubmitError('حدث خطأ أثناء إرسال إجابتك، حاول مرة أخرى');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PAGE_BG }}>
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (step === 'not-found' || !quiz) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl" style={{ background: PAGE_BG }}>
        <p className="text-lg mb-4">المراجعة غير موجودة أو غير متاحة حالياً</p>
        <button onClick={() => navigate('/reviews')} className="text-primary-400 hover:underline">رجوع للمراحل</button>
      </div>
    );
  }

  if (step === 'name') {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center px-4 py-10" dir="rtl" style={{ background: PAGE_BG }}>
        <div className="max-w-md w-full bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 text-center backdrop-blur-sm">
          <h1 className="text-lg sm:text-xl font-extrabold mb-2">{quiz.title}</h1>
          <p className="text-slate-400 text-sm mb-6">{quiz.questions.length} سؤال — اكتب اسمك عشان تظهر في لوحة الصدارة</p>
          <input
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && startQuiz()}
            placeholder="اسمك بالكامل"
            className="w-full bg-black/20 border border-white/15 rounded-xl px-4 py-3.5 mb-4 text-center text-base focus:outline-none focus:border-primary-500 transition"
            maxLength={100}
          />
          <button
            onClick={startQuiz}
            disabled={!studentName.trim()}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition active:scale-[0.98]"
          >
            ابدأ المراجعة
          </button>
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    const q = quiz.questions[current];
    const answeredCount = Object.keys(answers).length;
    const isLast = current === quiz.questions.length - 1;
    const progressPct = Math.round(((current + 1) / quiz.questions.length) * 100);
    const fb = feedback[q.id];

    return (
      <div className="min-h-screen text-white flex flex-col" dir="rtl" style={{ background: PAGE_BG }}>
        <header className="bg-[#0d9488]/90 backdrop-blur-sm flex items-center justify-between gap-2 px-3 sm:px-4 py-3 shrink-0">
          <span className="font-bold text-xs sm:text-sm truncate">{quiz.title}</span>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm shrink-0">
            <span className="flex items-center gap-1 bg-white/10 px-2.5 sm:px-3 py-1 rounded-full"><Timer size={13} /> {formatTime(elapsedSeconds)}</span>
            <span className="bg-white/10 px-2.5 sm:px-3 py-1 rounded-full">{current + 1} / {quiz.questions.length}</span>
          </div>
        </header>

        <div className="h-1.5 bg-black/30 shrink-0">
          <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 sm:px-6 sm:py-6 flex flex-col">
          <p className="font-extrabold text-lg sm:text-xl leading-relaxed mb-5 sm:mb-6">
            <bdi>{q.text}</bdi>
          </p>

          <div className="flex flex-col gap-2.5 sm:gap-3 flex-1">
            {q.options.map((opt, idx) => {
              const isSel = answers[q.id] === idx;
              let cls = 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]';
              if (fb) {
                if (idx === fb.correctOptionIndex) cls = 'border-emerald-500 bg-emerald-500/10';
                else if (isSel) cls = 'border-rose-500 bg-rose-500/10';
                else cls = 'border-white/5 bg-white/[0.02] opacity-50';
              } else if (isSel) {
                cls = 'border-primary-500 bg-white/[0.08]';
              }
              return (
                <button
                  key={idx}
                  onClick={() => selectOption(q.id, idx)}
                  disabled={!!fb}
                  className={`flex items-center justify-between gap-3 text-right py-3.5 px-4 sm:py-4 sm:px-5 rounded-xl border-2 transition font-bold active:scale-[0.99] ${cls}`}
                >
                  <bdi className="min-w-0">{opt}</bdi>
                  {fb && idx === fb.correctOptionIndex && <Check size={20} className="text-emerald-400 shrink-0" />}
                  {fb && isSel && idx !== fb.correctOptionIndex && <X size={20} className="text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {fb && (
            <p className={`text-center font-bold mt-4 ${fb.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
              {fb.isCorrect ? 'إجابة صحيحة! 🎉' : 'إجابة غير صحيحة'}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 mt-6 sm:mt-8">
            <button
              disabled={current === 0}
              onClick={() => setCurrent(c => c - 1)}
              className="flex items-center gap-1 bg-white/[0.06] border border-white/10 disabled:opacity-30 px-3.5 sm:px-4 py-2.5 rounded-lg text-sm font-bold transition"
            >
              <ChevronRight size={18} /> السابق
            </button>

            {isLast ? (
              <button
                onClick={submit}
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-5 sm:px-6 py-2.5 rounded-lg text-sm font-bold transition active:scale-[0.98]"
              >
                {submitting ? 'جاري الإرسال...' : 'إنهاء وإرسال'}
              </button>
            ) : (
              <button
                onClick={() => setCurrent(c => c + 1)}
                className="flex items-center gap-1 bg-primary-500 hover:bg-primary-600 px-3.5 sm:px-4 py-2.5 rounded-lg text-sm font-bold transition active:scale-[0.98]"
              >
                التالي <ChevronLeft size={18} />
              </button>
            )}
          </div>

          <p className="text-center text-xs text-slate-500 mt-4">مجاب عليها: {answeredCount} / {quiz.questions.length}</p>
          {submitError && <p className="text-center text-rose-400 text-sm mt-2">{submitError}</p>}
        </main>
      </div>
    );
  }

  // step === 'result'
  const badge = getBadge(result!.score, result!.totalQuestions);
  return (
    <div className="min-h-screen text-white flex flex-col items-center px-4 py-10 sm:py-14" dir="rtl" style={{ background: PAGE_BG }}>
      <div className="max-w-md w-full">
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 text-center mb-6 backdrop-blur-sm">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-full flex items-center justify-center text-4xl sm:text-5xl"
            style={{ backgroundColor: `${badge.color}22`, boxShadow: `0 0 30px -6px ${badge.color}` }}
          >
            {badge.emoji}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">{studentName}</h2>
          <p className="text-slate-300 text-lg mb-1">{result!.score} / {result!.totalQuestions}</p>
          <p className="font-bold mb-1" style={{ color: badge.color }}>{badge.label}</p>
          <p className="text-slate-400 text-sm">ترتيبك: #{result!.rank} · الوقت: {formatTime(elapsedSeconds)}</p>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
          <h3 className="font-bold flex items-center gap-2 mb-4"><Trophy size={18} className="text-amber-400" /> لوحة الصدارة</h3>
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                  entry.studentName === studentName ? 'bg-primary-500/20 border border-primary-500' : 'bg-black/20'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-6 text-center text-slate-400 shrink-0">{idx + 1}</span>
                  <bdi className="font-bold truncate">{entry.studentName}</bdi>
                </span>
                <span className="text-slate-300 shrink-0">{entry.score} / {entry.totalQuestions}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate('/reviews')} className="w-full flex items-center justify-center gap-1 text-slate-400 hover:text-white text-sm mt-6 transition">
          <ArrowRight size={16} /> رجوع للمراحل
        </button>
      </div>
    </div>
  );
}
