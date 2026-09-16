import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import axios from 'axios';
import {
  reviewsApi,
  type ReviewQuizPublic,
  type ReviewLeaderboardEntry,
  type ReviewSubmitResult,
} from '../../api/reviews';

type Step = 'loading' | 'name' | 'quiz' | 'result' | 'not-found';

export default function ReviewQuizPage() {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const id = Number(quizId);

  const [step, setStep] = useState<Step>('loading');
  const [quiz, setQuiz] = useState<ReviewQuizPublic | null>(null);
  const [studentName, setStudentName] = useState('');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startedAt, setStartedAt] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<ReviewSubmitResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<ReviewLeaderboardEntry[]>([]);

  useEffect(() => {
    reviewsApi.getQuiz(id)
      .then(q => { setQuiz(q); setStep('name'); })
      .catch(() => setStep('not-found'));
  }, [id]);

  const startQuiz = () => {
    if (!studentName.trim()) return;
    setStartedAt(Date.now());
    setStep('quiz');
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

    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col" dir="rtl">
        <header className="h-14 bg-[#0d9488] flex items-center justify-between px-4 shrink-0">
          <span className="font-bold text-sm">{quiz.title}</span>
          <span className="bg-white/10 px-3 py-1 rounded-full text-sm">{current + 1} / {quiz.questions.length}</span>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto p-6 flex flex-col">
          <p className="font-extrabold text-xl leading-relaxed mb-6">{q.text}</p>

          <div className="flex flex-col gap-3 flex-1">
            {q.options.map((opt, idx) => {
              const isSel = answers[q.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setAnswers(p => ({ ...p, [q.id]: idx }))}
                  className={`text-right p-4 rounded-xl border-2 transition font-bold ${
                    isSel ? 'border-primary-500 bg-[#1e293b]' : 'border-[#334155] bg-[#1e293b]/50 hover:border-slate-500'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

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
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center p-6" dir="rtl">
      <div className="max-w-md w-full">
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 text-center mb-6">
          <div className="text-5xl mb-2">{(result!.score / result!.totalQuestions) >= 0.7 ? '🎉' : '📚'}</div>
          <h2 className="text-2xl font-bold mb-1">{studentName}</h2>
          <p className="text-slate-300 text-lg mb-1">{result!.score} / {result!.totalQuestions}</p>
          <p className="text-slate-400 text-sm">ترتيبك: #{result!.rank}</p>
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
