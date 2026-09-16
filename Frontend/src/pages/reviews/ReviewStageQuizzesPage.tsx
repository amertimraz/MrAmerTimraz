import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ListChecks } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center p-6" dir="rtl">
      <div className="max-w-2xl w-full">
        <button onClick={() => navigate('/reviews')} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition">
          <ArrowRight size={16} /> رجوع للمراحل
        </button>

        <h1 className="text-2xl font-extrabold mb-1">{label ?? stage}</h1>
        <p className="text-slate-400 mb-8">اختر المراجعة اللي عايز تحلها</p>

        {loading ? (
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        ) : quizzes.length === 0 ? (
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 text-center text-slate-400">
            لا توجد مراجعات متاحة لهذه المرحلة حالياً، تابعنا على اليوتيوب لمعرفة مواعيد المراجعات الجديدة.
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map(quiz => (
              <button
                key={quiz.id}
                onClick={() => navigate(`/reviews/quiz/${quiz.id}`)}
                className="w-full flex items-center justify-between bg-[#1e293b] border border-[#334155] hover:border-primary-500 rounded-xl p-5 transition text-right"
              >
                <span className="font-bold">{quiz.title}</span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <ListChecks size={16} /> {quiz.questionCount} سؤال
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
