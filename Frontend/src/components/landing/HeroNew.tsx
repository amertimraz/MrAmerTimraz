import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, PlayCircle, Trophy, Users, ListChecks, BookOpenCheck } from 'lucide-react';
import { useReviewHighlights } from '../../hooks/useReviewData';

const FOCUS =
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 ring-offset-teal-50 dark:ring-offset-slate-950';

const RANK_STYLES = [
  'bg-amber-400 text-slate-900',
  'bg-slate-300 text-slate-900',
  'bg-orange-300 text-slate-900',
];

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

function LeaderboardCard() {
  const { data, isLoading } = useReviewHighlights();
  const top = (data?.top ?? []).slice(0, 3);

  return (
    <div className="absolute -bottom-8 left-3 sm:-left-8 w-[15.5rem] rounded-2xl border-[3px] border-slate-900 dark:border-teal-200/30 bg-white dark:bg-slate-900 p-3.5 shadow-[4px_4px_0_0_theme(colors.slate.900)] dark:shadow-none">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900 dark:text-white">
          <Trophy size={16} className="text-orange-600 dark:text-orange-400" aria-hidden />
          المتصدرون
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-teal-800 dark:text-teal-300">
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inline-flex size-full rounded-full bg-teal-500 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-teal-600" />
          </span>
          مباشر
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2.5" aria-hidden>
          {[0, 1, 2].map(i => (
            <div key={i} className="h-7 rounded-lg bg-slate-100 dark:bg-white/10 animate-pulse" />
          ))}
        </div>
      ) : top.length > 0 ? (
        <ol className="space-y-2.5">
          {top.map((t, i) => {
            const pct = Math.round((t.score / t.totalQuestions) * 100);
            return (
              <li
                key={i}
                className="flex items-center gap-2"
                aria-label={`المركز ${i + 1}: ${t.score} من ${t.totalQuestions}`}
              >
                <span className={`grid place-items-center size-6 shrink-0 rounded-full text-xs font-black ${RANK_STYLES[i]}`}>
                  {i + 1}
                </span>
                <span className="grid place-items-center size-7 shrink-0 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-900 dark:text-teal-100 text-sm font-bold">
                  {t.initial}
                </span>
                <span className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <span className="block h-full rounded-full bg-teal-600 dark:bg-teal-400" style={{ width: `${pct}%` }} />
                </span>
                <span className="text-xs font-bold tabular-nums text-slate-800 dark:text-slate-200">
                  {t.score}/{t.totalQuestions}
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-6">
          لسه مفيش متصدرين، كن أول واحد!
        </p>
      )}

      <Link
        to="/reviews"
        className={`mt-3 flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-teal-50 dark:bg-white/5 text-sm font-bold text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-white/10 transition-colors ${FOCUS}`}
      >
        شوف الترتيب كامل
        <ArrowLeft size={15} aria-hidden />
      </Link>
    </div>
  );
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-slate-900/10 bg-white/80 px-2 py-3 text-center dark:border-white/10 dark:bg-white/5 sm:flex-row sm:gap-3 sm:px-4 sm:text-start">
      <span className="hidden size-10 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 sm:grid" aria-hidden>
        {icon}
      </span>
      <div>
        <p className="text-2xl font-black leading-none tabular-nums text-slate-900 dark:text-white">{value}</p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">{label}</p>
      </div>
    </div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const { data, isLoading } = useReviewHighlights();

  const enter = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease: 'easeOut' as const },
        };

  const showStats = !!data && data.totalAttempts > 0;

  return (
    <section
      dir="rtl"
      className="relative -mt-20 overflow-hidden bg-teal-50 pt-20 dark:bg-slate-950"
    >
      {/* Static decorative blocks (no infinite motion) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(theme(colors.teal.200)_1.2px,transparent_1.2px)] [background-size:22px_22px] dark:opacity-40 dark:[background-image:radial-gradient(theme(colors.teal.900)_1.2px,transparent_1.2px)]"
      />
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-[3rem] bg-teal-200/70 dark:bg-teal-900/40 rotate-12" />
      <div aria-hidden className="pointer-events-none absolute bottom-10 right-[-3rem] size-40 rounded-full border-[14px] border-orange-300/60 dark:border-orange-500/20" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pb-24 lg:pt-16">
        {/* Text */}
        <div className="lg:col-span-7">
          <motion.h1
            {...enter(0)}
            className="text-[2.5rem] font-black leading-[1.2] text-slate-900 dark:text-white sm:text-6xl lg:text-7xl lg:leading-[1.15]"
          >
            تعلّم{' '}
            <span className="relative inline-block">
              <span className="relative z-10">البرمجة</span>
              <span aria-hidden className="absolute inset-x-[-6px] bottom-1 z-0 h-[40%] rounded bg-orange-400/80 dark:bg-orange-500/60" />
            </span>
            <br />
            والذكاء الاصطناعي
          </motion.h1>

          <motion.p
            {...enter(0.08)}
            className="mt-6 max-w-xl text-lg leading-8 text-slate-700 dark:text-slate-300"
          >
            مراجعات تفاعلية مجانية بتصحيح فوري، ودروس مبسّطة من الابتدائي للثانوي مع الأستاذ عامر تمراز،
            ونافس زمايلك على لوحة الصدارة.
          </motion.p>

          <motion.div {...enter(0.16)} className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/reviews"
              className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 sm:w-auto text-lg font-extrabold text-slate-900 shadow-[0_6px_0_0_theme(colors.orange.700)] transition-[transform,box-shadow,background-color] duration-150 hover:bg-orange-400 active:translate-y-[3px] active:shadow-[0_3px_0_0_theme(colors.orange.700)] motion-reduce:transition-none ${FOCUS}`}
            >
              ابدأ المراجعة المجانية
              <ArrowLeft size={20} aria-hidden />
            </Link>
            <Link
              to="/courses"
              className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-teal-700 px-6 sm:w-auto text-base font-bold text-teal-800 transition-colors duration-150 hover:bg-teal-700 hover:text-white dark:border-teal-400 dark:text-teal-200 dark:hover:bg-teal-400 dark:hover:text-slate-900 motion-reduce:transition-none ${FOCUS}`}
            >
              <PlayCircle size={20} aria-hidden />
              استعرض الدروس
            </Link>
          </motion.div>

          {/* Real numbers from the reviews API; hidden entirely if there is nothing true to show */}
          <motion.div {...enter(0.24)} className="mt-10 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
            {isLoading ? (
              [0, 1, 2].map(i => (
                <div key={i} className="h-[5.25rem] rounded-2xl bg-white/60 dark:bg-white/5 animate-pulse sm:h-[4.25rem]" aria-hidden />
              ))
            ) : showStats ? (
              <>
                <StatTile icon={<Users size={20} />} value={fmt(data!.totalAttempts)} label="محاولة حل" />
                <StatTile icon={<ListChecks size={20} />} value={fmt(data!.totalQuestions)} label="سؤال متاح" />
                <StatTile icon={<BookOpenCheck size={20} />} value={fmt(data!.totalQuizzes)} label="مراجعة" />
              </>
            ) : null}
          </motion.div>
        </div>

        {/* Visual: portrait on a block + live leaderboard */}
        <motion.div
          {...(reduce
            ? {}
            : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5, delay: 0.1, ease: 'easeOut' as const } })}
          className="relative mx-auto mb-10 w-full max-w-[21rem] sm:max-w-sm lg:col-span-5 lg:mb-0 lg:max-w-md"
        >
          <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] bg-orange-400 dark:bg-orange-500/70" />
          <div className="relative aspect-[4/5] rounded-[2rem] border-[3px] border-slate-900 bg-teal-700 dark:border-teal-200/30 dark:bg-teal-800">
            <div aria-hidden className="absolute -right-8 top-8 size-36 rounded-full bg-teal-600 dark:bg-teal-700" />
            <div aria-hidden className="absolute bottom-10 left-6 size-14 rounded-2xl border-4 border-teal-300/70 rotate-12" />
            {/* Taller than the block so the head pokes out above its top edge */}
            <div className="absolute inset-x-[3px] bottom-[3px] top-[-14%] overflow-hidden rounded-b-[calc(2rem-3px)]">
              <img
                src="/teacher-hero.webp"
                width={640}
                height={954}
                fetchPriority="high"
                decoding="async"
                alt="الأستاذ عامر تمراز"
                className="h-full w-full object-contain object-bottom"
              />
            </div>
          </div>

          <LeaderboardCard />
        </motion.div>
      </div>
    </section>
  );
}
