import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ListChecks, ChevronLeft } from 'lucide-react';
import { reviewsApi, type ReviewQuizSummary } from '../../api/reviews';
import { STAGE_LABELS } from './stageMeta';

export default function ReviewStageQuizzesPage() {
  const navigate = useNavigate();
  const { stage } = useParams<{ stage: string }>();
  const [quizzes, setQuizzes] = useState<ReviewQuizSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const label = stage ? STAGE_LABELS[stage] : undefined;

  useEffect(() => {
    reviewsApi.getStages()
      .then(stages => {
        const found = stages.find(s => s.stage === stage);
        setQuizzes(found?.quizzes ?? []);
      })
      .finally(() => setLoading(false));
  }, [stage]);

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center px-4 py-10 sm:px-6 sm:py-14"
      dir="rtl"
      style={{ background: 'radial-gradient(circle at 50% -10%, #1e3a5f 0%, #0b1120 55%, #060a14 100%)' }}
    >
      <div className="max-w-2xl w-full">
        <button onClick={() => navigate('/reviews')} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition">
          <ArrowRight size={16} /> رجوع للمراحل
        </button>

        <h1 className="text-xl sm:text-2xl font-extrabold mb-1">{label ?? stage}</h1>
        <p className="text-slate-400 text-sm mb-6 sm:mb-8">اختر المراجعة اللي عايز تحلها</p>

        {loading ? (
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        ) : quizzes.length === 0 ? (
          <div className="rounded-2xl p-8 text-center text-slate-400 bg-white/[0.03] border border-white/10">
            لا توجد مراجعات متاحة لهذه المرحلة حالياً، تابعنا على اليوتيوب لمعرفة مواعيد المراجعات الجديدة.
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map(quiz => (
              <button
                key={quiz.id}
                onClick={() => navigate(`/reviews/quiz/${quiz.id}`)}
                className="w-full flex items-center justify-between gap-3 bg-white/[0.04] border border-white/10 hover:border-primary-500/60 hover:bg-white/[0.07] active:scale-[0.99] rounded-xl p-4 sm:p-5 transition text-right"
              >
                <span className="font-bold text-sm sm:text-base">{quiz.title}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                    <ListChecks size={14} /> {quiz.questionCount} سؤال
                  </span>
                  <ChevronLeft size={18} className="text-slate-500" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
