import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, ChevronDown, ChevronLeft, ListChecks, Trophy, X } from 'lucide-react';
import { reviewsApi, type ReviewQuizSummary, type ReviewLeaderboardEntry } from '../../api/reviews';
import { STAGE_LABELS } from './stageMeta';

type Kind = 'tf' | 'mcq' | 'other';
const KIND_ORDER: Record<Kind, number> = { tf: 0, mcq: 1, other: 2 };

interface LessonItem {
  quiz: ReviewQuizSummary;
  kind: Kind;
  label: string;
}

interface LessonGroup {
  key: string;
  number: number;
  topic?: string;
  firstId: number;
  items: LessonItem[];
}

const ORDINALS = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'];

// Per-lesson accent so neighbouring cards are easy to tell apart (each is paired with text/number, never colour-only).
const ACCENTS = [
  { bar: 'from-teal-400 to-emerald-500', chip: 'bg-teal-400/15 text-teal-300 ring-teal-400/30', ring: 'focus-visible:ring-teal-300' },
  { bar: 'from-orange-400 to-amber-500', chip: 'bg-orange-400/15 text-orange-300 ring-orange-400/30', ring: 'focus-visible:ring-orange-300' },
  { bar: 'from-sky-400 to-blue-500', chip: 'bg-sky-400/15 text-sky-300 ring-sky-400/30', ring: 'focus-visible:ring-sky-300' },
  { bar: 'from-violet-400 to-fuchsia-500', chip: 'bg-violet-400/15 text-violet-300 ring-violet-400/30', ring: 'focus-visible:ring-violet-300' },
];

// Quiz titles follow "<lesson> - <topic> (صح وغلط)" / "<lesson> - صح وغلط (<source>)" / "<lesson> - اختيار من متعدد (n)".
// Anything that doesn't match falls back to its own standalone card.
function parseTitle(title: string): { lesson: string; topic?: string; kind: Kind; label: string } {
  const sep = ' - ';
  const idx = title.indexOf(sep);
  if (idx === -1) return { lesson: title, kind: 'other', label: title };

  const lesson = title.slice(0, idx).trim();
  const rest = title.slice(idx + sep.length).trim();

  if (rest.startsWith('اختيار من متعدد')) return { lesson, kind: 'mcq', label: rest };
  if (rest.startsWith('صح وغلط')) return { lesson, kind: 'tf', label: rest };
  if (rest.includes('اختيار من متعدد')) return { lesson, kind: 'mcq', label: 'اختيار من متعدد' };
  if (rest.includes('صح وغلط')) {
    const topic = rest.replace(/\s*\(?\s*صح وغلط\s*\)?\s*$/, '').trim();
    return { lesson, topic: topic || undefined, kind: 'tf', label: 'صح وغلط' };
  }
  return { lesson, kind: 'other', label: rest };
}

function lessonNumber(key: string, fallback: number) {
  const i = ORDINALS.findIndex(o => key.includes(o));
  return i === -1 ? fallback : i + 1;
}

function groupByLesson(quizzes: ReviewQuizSummary[]): LessonGroup[] {
  const groups = new Map<string, Omit<LessonGroup, 'number'>>();
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
    .map((g, i) => ({
      ...g,
      number: lessonNumber(g.key, i + 1),
      items: [...g.items].sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.quiz.id - b.quiz.id),
    }));
}

function KindIcon({ kind }: { kind: Kind }) {
  if (kind === 'tf') {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5" aria-hidden>
        <Check size={14} className="text-emerald-400" />
        <X size={14} className="text-rose-400" />
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5" aria-hidden>
      <ListChecks size={18} className="text-sky-300" />
    </span>
  );
}

const RANK_STYLES = [
  'bg-amber-400/20 text-amber-300 ring-amber-400/40',
  'bg-slate-300/15 text-slate-200 ring-slate-300/30',
  'bg-orange-500/20 text-orange-300 ring-orange-400/40',
];

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
  const totalQuestions = quizzes.reduce((s, q) => s + q.questionCount, 0);

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
      className="min-h-dvh text-white flex flex-col items-center px-4 py-8 sm:px-6 sm:py-12"
      dir="rtl"
      style={{ background: 'radial-gradient(circle at 50% -10%, #1e3a5f 0%, #0b1120 55%, #060a14 100%)' }}
    >
      <div className="w-full max-w-5xl">
        <button
          onClick={() => navigate('/reviews')}
          className="mb-6 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          <ArrowRight size={16} aria-hidden /> رجوع للمراحل
        </button>

        <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{label ?? stage}</h1>
            <p className="mt-1 text-sm text-slate-300">اختر الدرس ثم نوع المراجعة اللي عايز تحلها</p>
          </div>
          {!loading && lessons.length > 0 && (
            <div className="flex gap-2 text-xs text-slate-200">
              <span className="rounded-full bg-white/[0.06] px-3 py-1.5 ring-1 ring-white/10">{lessons.length} دروس</span>
              <span className="rounded-full bg-white/[0.06] px-3 py-1.5 ring-1 ring-white/10">{totalQuestions} سؤال</span>
            </div>
          )}
        </header>

        {loading ? (
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent motion-reduce:animate-none" role="status" aria-label="جاري التحميل" />
        ) : lessons.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-slate-300">
            لا توجد مراجعات متاحة لهذه المرحلة حالياً، تابعنا على اليوتيوب لمعرفة مواعيد المراجعات الجديدة.
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 sm:gap-5 lg:grid-cols-2">
            {lessons.map((lesson, li) => {
              const total = lesson.items.reduce((sum, i) => sum + i.quiz.questionCount, 0);
              const accent = ACCENTS[li % ACCENTS.length];
              return (
                <section
                  key={lesson.key}
                  aria-labelledby={`lesson-${li}`}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-xl shadow-black/20 backdrop-blur-sm"
                >
                  <div className={`h-1.5 bg-gradient-to-l ${accent.bar}`} aria-hidden />

                  <header className="flex items-start gap-3.5 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
                    <span
                      className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl text-xl font-black leading-none ring-1 ${accent.chip}`}
                      aria-hidden
                    >
                      {lesson.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 id={`lesson-${li}`} className="text-base font-extrabold leading-snug sm:text-lg">{lesson.key}</h2>
                      {lesson.topic && (
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-300 sm:text-sm"><bdi>{lesson.topic}</bdi></p>
                      )}
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-300">
                        <BookOpen size={13} aria-hidden />
                        {lesson.items.length} مراجعات · {total} سؤال
                      </p>
                    </div>
                  </header>

                  <ul className="space-y-2 px-3 pb-4 sm:px-4">
                    {lesson.items.map(({ quiz, kind, label: kindLabel }) => {
                      const isOpen = !!expanded[quiz.id];
                      const board = leaderboards[quiz.id]?.slice(0, 10);
                      return (
                        <li key={quiz.id} className="overflow-hidden rounded-2xl border border-white/5 bg-black/25">
                          <div className="flex items-stretch">
                            <button
                              onClick={() => navigate(`/reviews/quiz/${quiz.id}`)}
                              className={`group flex min-h-14 min-w-0 flex-1 items-center gap-3 p-2.5 text-right transition motion-reduce:transition-none hover:bg-white/[0.06] active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset ${accent.ring}`}
                            >
                              <KindIcon kind={kind} />
                              <span className="min-w-0 flex-1">
                                <bdi className="block text-sm font-bold leading-snug">{kindLabel}</bdi>
                                <span className="text-xs text-slate-300">{quiz.questionCount} سؤال</span>
                              </span>
                              <ChevronLeft size={18} className="shrink-0 text-slate-400 transition-transform motion-reduce:transition-none group-hover:-translate-x-0.5" aria-hidden />
                            </button>
                            <button
                              onClick={() => toggleLeaderboard(quiz.id)}
                              aria-expanded={isOpen}
                              aria-label="لوحة الصدارة"
                              className={`flex min-w-14 shrink-0 items-center justify-center gap-1 border-r border-white/5 px-3 text-xs font-bold transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 ${
                                isOpen ? 'bg-amber-400/10 text-amber-300' : 'text-slate-300 hover:bg-white/[0.06] hover:text-amber-300'
                              }`}
                            >
                              <Trophy size={15} aria-hidden />
                              <ChevronDown size={14} className={`transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                            </button>
                          </div>

                          {isOpen && (
                            <div className="border-t border-white/5 px-3 py-3 sm:px-4">
                              {loadingBoard[quiz.id] ? (
                                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent motion-reduce:animate-none" role="status" aria-label="جاري التحميل" />
                              ) : board && board.length > 0 ? (
                                <>
                                  <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                                    <Trophy size={14} aria-hidden /> أفضل 10 نتائج
                                  </h3>
                                  <ol className="space-y-1.5">
                                    {board.map((entry, idx) => (
                                      <li key={idx} className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-1.5 text-sm">
                                        <span className="flex min-w-0 items-center gap-2.5">
                                          <span
                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ring-1 ${
                                              RANK_STYLES[idx] ?? 'bg-white/5 text-slate-300 ring-white/10'
                                            }`}
                                          >
                                            {idx + 1}
                                          </span>
                                          <bdi className="truncate font-bold">{entry.studentName}</bdi>
                                        </span>
                                        <span className="shrink-0 text-slate-300">{entry.score} / {entry.totalQuestions}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </>
                              ) : (
                                <p className="text-center text-xs text-slate-400">محدش حل المراجعة دي لسه</p>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
