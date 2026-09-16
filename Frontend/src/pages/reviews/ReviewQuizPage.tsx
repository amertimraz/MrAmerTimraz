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

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getBadge(score: number, total: number) {
  const pct = total > 0 ? score / total : 0;
  if (pct === 1) return { emoji: '🏆', label: 'إجابة كاملة! بطل المراجعة' };
  if (pct >= 0.8) return { emoji: '🌟', label: 'ممتاز' };
  if (pct >= 0.5) return { emoji: '👍', label: 'جيد، تابع كذا' };
  return { emoji: '📚', label: 'راجع الدرس تاني وجرب من جديد' };
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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (step === 'not-found' || !quiz) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <p className="text-lg mb-4">المراجعة غير موجودة أو غير متاحة حالياً</p>
        <button onClick={() => navigate('/reviews')} className="text-primary-400 hover:underline">رجوع للمراحل</button>
      </div>
    );
  }

  if (step === 'name') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6" dir="rtl">
        <div className="max-w-md w-full bg-[#1e293b] border border-[#334155] rounded-2xl p-8 text-center">
          <h1 className="text-xl font-extrabold mb-2">{quiz.title}</h1>
          <p className="text-slate-400 mb-6">{quiz.questions.length} سؤال — اكتب اسمك عشان تظهر في لوحة الصدارة</p>
          <input
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && startQuiz()}
            placeholder="اسمك بالكامل"
            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 mb-4 text-center focus:outline-none focus:border-primary-500"
            maxLength={100}
          />
          <button
            onClick={startQuiz}
            disabled={!studentName.trim()}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition"
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
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col" dir="rtl">
        <header className="h-14 bg-[#0d9488] flex items-center justify-between px-4 shrink-0">
          <span className="font-bold text-sm truncate">{quiz.title}</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"><Timer size={14} /> {formatTime(elapsedSeconds)}</span>
            <span className="bg-white/10 px-3 py-1 rounded-full">{current + 1} / {quiz.questions.length}</span>
          </div>
        </header>

        <div className="h-1.5 bg-[#1e293b] shrink-0">
          <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>

        <main className="flex-1 max-w-2xl w-full mx-auto p-6 flex flex-col">
          <p className="font-extrabold text-xl leading-relaxed mb-6">{q.text}</p>

          <div className="flex flex-col gap-3 flex-1">
            {q.options.map((opt, idx) => {
              const isSel = answers[q.id] === idx;
              let cls = 'border-[#334155] bg-[#1e293b]/50 hover:border-slate-500';
              if (fb) {
                if (idx === fb.correctOptionIndex) cls = 'border-emerald-500 bg-emerald-500/10';
                else if (isSel) cls = 'border-rose-500 bg-rose-500/10';
                else cls = 'border-[#334155] bg-[#1e293b]/30 opacity-60';
              } else if (isSel) {
                cls = 'border-primary-500 bg-[#1e293b]';
              }
              return (
                <button
                  key={idx}
                  onClick={() => selectOption(q.id, idx)}
                  disabled={!!fb}
                  className={`flex items-center justify-between text-right p-4 rounded-xl border-2 transition font-bold ${cls}`}
                >
                  <span>{opt}</span>
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

          <div className="flex items-center justify-between mt-8">
            <button
              disabled={current === 0}
              onClick={() => setCurrent(c => c - 1)}
              className="flex items-center gap-1 bg-[#1e293b] border border-[#334155] disabled:opacity-30 px-4 py-2 rounded-lg text-sm font-bold transition"
            >
              <ChevronRight size={18} /> السابق
            </button>

            {isLast ? (
              <button
                onClick={submit}
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-bold transition"
              >
                {submitting ? 'جاري الإرسال...' : 'إنهاء وإرسال'}
              </button>
            ) : (
              <button
                onClick={() => setCurrent(c => c + 1)}
                className="flex items-center gap-1 bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-lg text-sm font-bold transition"
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
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center p-6" dir="rtl">
      <div className="max-w-md w-full">
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 text-center mb-6">
          <div className="text-5xl mb-2">{badge.emoji}</div>
          <h2 className="text-2xl font-bold mb-1">{studentName}</h2>
          <p className="text-slate-300 text-lg mb-1">{result!.score} / {result!.totalQuestions}</p>
          <p className="font-bold text-primary-400 mb-1">{badge.label}</p>
          <p className="text-slate-400 text-sm">ترتيبك: #{result!.rank} · الوقت: {formatTime(elapsedSeconds)}</p>
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4"><Trophy size={18} className="text-amber-400" /> لوحة الصدارة</h3>
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  entry.studentName === studentName ? 'bg-primary-500/20 border border-primary-500' : 'bg-[#0f172a]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 text-center text-slate-400">{idx + 1}</span>
                  <span className="font-bold">{entry.studentName}</span>
                </span>
                <span className="text-slate-300">{entry.score} / {entry.totalQuestions}</span>
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
