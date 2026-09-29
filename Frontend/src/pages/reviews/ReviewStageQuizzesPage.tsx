import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ListChecks, ChevronLeft, ChevronDown, Trophy } from 'lucide-react';
import { reviewsApi, type ReviewQuizSummary, type ReviewLeaderboardEntry } from '../../api/reviews';
import { STAGE_LABELS } from './stageMeta';

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export default function ReviewStageQuizzesPage() {
  const navigate = useNavigate();
  const { stage } = useParams<{ stage: string }>();
  const [quizzes, setQuizzes] = useState<ReviewQuizSummary[]>([]);
  const [leaderboards, setLeaderboards] = useState<Record<number, ReviewLeaderboardEntry[]>>({});
  const [loadingBoard, setLoadingBoard] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
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

  const toggleLeaderboard = async (quizId: number) => {
    const willOpen = !expanded[quizId];
    setExpanded(p => ({ ...p, [quizId]: willOpen }));
    if (willOpen && !leaderboards[quizId]) {
      setLoadingBoard(p => ({ ...p, [quizId]: true }));
      try {
        const board = await reviewsApi.getLeaderboard(quizId);
        setLeaderboards(p => ({ ...p, [quizId]: board }));
      } catch {
        setLeaderboards(p => ({ ...p, [quizId]: [] }));
      } finally {
        setLoadingBoard(p => ({ ...p, [quizId]: false }));
      }
    }
  };

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
          <div className="space-y-2.5">
            {quizzes.map(quiz => {
              const isOpen = !!expanded[quiz.id];
              const board = leaderboards[quiz.id]?.slice(0, 10);
              return (
                <div key={quiz.id} className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => navigate(`/reviews/quiz/${quiz.id}`)}
                      className="flex-1 min-w-0 flex items-center justify-between gap-3 hover:bg-white/[0.05] active:scale-[0.99] p-3.5 sm:p-4 transition text-right"
                    >
                      <bdi className="font-bold text-sm sm:text-base min-w-0 truncate">{quiz.title}</bdi>
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                          <ListChecks size={14} /> {quiz.questionCount} سؤال
                        </span>
                        <ChevronLeft size={18} className="text-slate-500" />
                      </span>
                    </button>
                    <button
                      onClick={() => toggleLeaderboard(quiz.id)}
                      className={`shrink-0 flex items-center gap-1 text-xs font-bold px-2.5 sm:px-3 py-2 h-full transition ${
                        isOpen ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
                      }`}
                    >
                      <Trophy size={14} />
                      <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="border-t border-white/10 px-4 sm:px-5 py-4">
                      {loadingBoard[quiz.id] ? (
                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : board && board.length > 0 ? (
                        <>
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
                        </>
                      ) : (
                        <p className="text-center text-xs text-slate-500">محدش حل المراجعة دي لسه</p>
                      )}
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
