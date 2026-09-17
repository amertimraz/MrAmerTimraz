import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ListChecks, ChevronLeft, Trophy } from 'lucide-react';
import { reviewsApi, type ReviewQuizSummary, type ReviewLeaderboardEntry } from '../../api/reviews';
import { STAGE_LABELS } from './stageMeta';

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export default function ReviewStageQuizzesPage() {
  const navigate = useNavigate();
  const { stage } = useParams<{ stage: string }>();
  const [quizzes, setQuizzes] = useState<ReviewQuizSummary[]>([]);
  const [leaderboards, setLeaderboards] = useState<Record<number, ReviewLeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);

  const label = stage ? STAGE_LABELS[stage] : undefined;

  useEffect(() => {
    reviewsApi.getStages()
      .then(async stages => {
        const found = stages.find(s => s.stage === stage);
        const list = found?.quizzes ?? [];
        setQuizzes(list);

        const boards = await Promise.all(
          list.map(q => reviewsApi.getLeaderboard(q.id).catch(() => []))
        );
        setLeaderboards(Object.fromEntries(list.map((q, i) => [q.id, boards[i]])));
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
          <div className="space-y-4">
            {quizzes.map(quiz => {
              const board = (leaderboards[quiz.id] ?? []).slice(0, 10);
              return (
                <div key={quiz.id} className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => navigate(`/reviews/quiz/${quiz.id}`)}
                    className="w-full flex items-center justify-between gap-3 hover:bg-white/[0.05] active:scale-[0.99] p-4 sm:p-5 transition text-right"
                  >
                    <bdi className="font-bold text-sm sm:text-base min-w-0">{quiz.title}</bdi>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                        <ListChecks size={14} /> {quiz.questionCount} سؤال
                      </span>
                      <ChevronLeft size={18} className="text-slate-500" />
                    </span>
                  </button>

                  {board.length > 0 && (
                    <div className="border-t border-white/10 px-4 sm:px-5 py-4">
                      <h3 className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-3">
                        <Trophy size={14} /> أفضل 10 نتائج
                      </h3>
                      <div className="space-y-1.5">
                        {board.map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-black/20 rounded-lg px-3 py-1.5">
                            <span className="flex items-center gap-2 min-w-0">
                              <span className="w-6 text-center shrink-0">{RANK_MEDALS[idx] ?? idx + 1}</span>
                              <bdi className="font-bold truncate">{entry.studentName}</bdi>
                            </span>
                            <span className="text-slate-400 shrink-0">{entry.score} / {entry.totalQuestions}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
