import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ListChecks, ChevronLeft, ChevronDown, Trophy, Check, X } from 'lucide-react';
import { reviewsApi, type ReviewQuizSummary, type ReviewLeaderboardEntry } from '../../api/reviews';
import { STAGE_LABELS } from './stageMeta';

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

type Kind = 'tf' | 'mcq' | 'other';
const KIND_ORDER: Record<Kind, number> = { tf: 0, mcq: 1, other: 2 };

interface LessonItem {
  quiz: ReviewQuizSummary;
  kind: Kind;
  label: string;
}

interface LessonGroup {
  key: string;
  topic?: string;
  firstId: number;
  items: LessonItem[];
}

// Quiz titles follow "<lesson> - <topic> (صح وغلط)" / "<lesson> - اختيار من متعدد".
// Anything that doesn't match falls back to its own standalone card.
function parseTitle(title: string): { lesson: string; topic?: string; kind: Kind; label: string } {
  const sep = ' - ';
  const idx = title.indexOf(sep);
  if (idx === -1) return { lesson: title, kind: 'other', label: title };

  const lesson = title.slice(0, idx).trim();
  const rest = title.slice(idx + sep.length).trim();

  if (rest.includes('اختيار من متعدد')) return { lesson, kind: 'mcq', label: 'اختيار من متعدد' };
  if (rest.includes('صح وغلط')) {
    const topic = rest.replace(/\s*\(?\s*صح وغلط\s*\)?\s*$/, '').trim();
    return { lesson, topic: topic || undefined, kind: 'tf', label: 'صح وغلط' };
  }
  return { lesson, kind: 'other', label: rest };
}

function groupByLesson(quizzes: ReviewQuizSummary[]): LessonGroup[] {
  const groups = new Map<string, LessonGroup>();
  for (const quiz of quizzes) {
    const p = parseTitle(quiz.title);
    const existing = groups.get(p.lesson);
    const item: LessonItem = { quiz, kind: p.kind, label: p.label };
    if (existing) {
      existing.items.push(item);
      existing.firstId = Math.min(existing.firstId, quiz.id);
      if (!existing.topic && p.topic) existing.topic = p.topic;
    } else {
      groups.set(p.lesson, { key: p.lesson, topic: p.topic, firstId: quiz.id, items: [item] });
    }
  }
  return [...groups.values()]
    .sort((a, b) => a.firstId - b.firstId)
    .map(g => ({ ...g, items: [...g.items].sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]) }));
}

function KindIcon({ kind }: { kind: Kind }) {
  if (kind === 'tf') {
    return (
      <span className="flex items-center gap-0.5 text-slate-300">
        <Check size={14} className="text-emerald-400" />
        <X size={14} className="text-rose-400" />
      </span>
    );
  }
  return <ListChecks size={16} className="text-primary-400" />;
}

export default function ReviewStageQuizzesPage() {
  const navigate = useNavigate();
  const { stage } = useParams<{ stage: string }>();
  const [quizzes, setQuizzes] = useState<ReviewQuizSummary[]>([]);
  const [leaderboards, setLeaderboards] = useState<Record<number, ReviewLeaderboardEntry[]>>({});
  const [loadingBoard, setLoadingBoard] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  const label = stage ? STAGE_LABELS[stage] : undefined;
  const lessons = useMemo(() => groupByLesson(quizzes), [quizzes]);

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
        <p className="text-slate-400 text-sm mb-6 sm:mb-8">اختر الدرس ثم نوع المراجعة اللي عايز تحلها</p>

        {loading ? (
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        ) : lessons.length === 0 ? (
          <div className="rounded-2xl p-8 text-center text-slate-400 bg-white/[0.03] border border-white/10">
            لا توجد مراجعات متاحة لهذه المرحلة حالياً، تابعنا على اليوتيوب لمعرفة مواعيد المراجعات الجديدة.
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map(lesson => {
              const total = lesson.items.reduce((sum, i) => sum + i.quiz.questionCount, 0);
              return (
                <section key={lesson.key} className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
                  <header className="flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 pb-3">
                    <div className="min-w-0">
                      <h2 className="font-extrabold text-base sm:text-lg">{lesson.key}</h2>
                      {lesson.topic && (
                        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                          <bdi>{lesson.topic}</bdi>
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                      {total} سؤال
                    </span>
                  </header>

                  <div className="px-3 sm:px-4 pb-3 space-y-2">
                    {lesson.items.map(({ quiz, kind, label: kindLabel }) => {
                      const isOpen = !!expanded[quiz.id];
                      const board = leaderboards[quiz.id]?.slice(0, 10);
                      return (
                        <div key={quiz.id} className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                          <div className="flex items-stretch">
                            <button
                              onClick={() => navigate(`/reviews/quiz/${quiz.id}`)}
                              className="flex-1 min-w-0 flex items-center justify-between gap-2 hover:bg-white/[0.05] active:scale-[0.99] p-3 sm:p-3.5 transition text-right"
                            >
                              <span className="flex items-center gap-2 font-bold text-sm min-w-0">
                                <KindIcon kind={kind} />
                                <bdi className="truncate">{kindLabel}</bdi>
                              </span>
                              <span className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                                  {quiz.questionCount} سؤال
                                </span>
                                <ChevronLeft size={18} className="text-slate-500" />
                              </span>
                            </button>
                            <button
                              onClick={() => toggleLeaderboard(quiz.id)}
                              aria-label="لوحة الصدارة"
                              className={`shrink-0 flex items-center gap-1 text-xs font-bold px-2.5 sm:px-3 border-r border-white/5 transition ${
                                isOpen ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
                              }`}
                            >
                              <Trophy size={14} />
                              <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                          </div>

                          {isOpen && (
                            <div className="border-t border-white/5 px-3 sm:px-4 py-3">
                              {loadingBoard[quiz.id] ? (
                                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                              ) : board && board.length > 0 ? (
                                <>
                                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2.5">
                                    <Trophy size={14} /> أفضل 10 نتائج
                                  </h3>
                                  <div className="space-y-1.5">
                                    {board.map((entry, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-sm bg-white/[0.04] rounded-lg px-3 py-1.5">
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
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
