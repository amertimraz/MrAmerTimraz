import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { GraduationCap, ListChecks, Trophy, ArrowLeft, Sparkles } from 'lucide-react';
import { useReviewStages } from '../../hooks/useReviewData';
import { STAGE_LABELS } from '../../pages/reviews/stageMeta';

const FOCUS =
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 ring-offset-white dark:ring-offset-slate-900';

const steps = [
  {
    n: '1',
    icon: <GraduationCap size={26} />,
    title: 'اختار صفك',
    text: 'من الأول الابتدائي لحد الثالث الثانوي، اختار صفك والدرس اللي عايز تراجعه.',
    card: 'bg-teal-100 dark:bg-teal-900/40',
    chip: 'bg-teal-700 text-white',
  },
  {
    n: '2',
    icon: <ListChecks size={26} />,
    title: 'حلّ الأسئلة',
    text: 'صح وغلط واختيار من متعدد، مع تصحيح فوري وإجابة صحيحة بعد كل سؤال.',
    card: 'bg-orange-100 dark:bg-orange-900/30',
    chip: 'bg-orange-500 text-slate-900',
  },
  {
    n: '3',
    icon: <Trophy size={26} />,
    title: 'شوف ترتيبك',
    text: 'توقيت وشريط تقدم، ولوحة صدارة لكل مراجعة، نافس زمايلك وكن الأول.',
    card: 'bg-amber-100 dark:bg-amber-900/30',
    chip: 'bg-amber-400 text-slate-900',
  },
];

export default function ReviewsPromoSection() {
  const reduce = useReducedMotion();
  const { data: stages } = useReviewStages();
  const available = (stages ?? []).filter(s => s.quizzes.length > 0 && STAGE_LABELS[s.stage]);

  return (
    <section dir="rtl" className="bg-white py-16 dark:bg-slate-900 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-bold text-orange-900 dark:bg-orange-500/15 dark:text-orange-200">
            <Sparkles size={15} aria-hidden />
            مراجعات مجانية، بدون تسجيل دخول
          </span>
          <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 dark:text-white sm:text-4xl">
            راجع دروسك وتنافس في لوحة الصدارة
          </h2>
          <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
            ثلاث خطوات بس، ومن غير ما تعمل حساب.
          </p>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              {...(reduce
                ? {}
                : {
                    initial: { opacity: 0, y: 20 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, margin: '-60px' },
                    transition: { duration: 0.4, delay: i * 0.08, ease: 'easeOut' as const },
                  })}
              className={`relative overflow-hidden rounded-3xl border-[3px] border-slate-900 p-6 shadow-[5px_5px_0_0_theme(colors.slate.900)] dark:border-white/15 dark:shadow-none ${s.card}`}
            >
              <span aria-hidden className="absolute -top-3 left-4 select-none text-8xl font-black leading-none text-slate-900/10 dark:text-white/10">
                {s.n}
              </span>
              <span className={`relative grid size-12 place-items-center rounded-2xl ${s.chip}`} aria-hidden>
                {s.icon}
              </span>
              <h3 className="relative mt-5 text-xl font-extrabold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="relative mt-2 text-base leading-7 text-slate-700 dark:text-slate-300">{s.text}</p>
            </motion.li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col items-center gap-6">
          {available.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">متاح الآن:</span>
              {available.map(s => (
                <Link
                  key={s.stage}
                  to={`/reviews/${s.stage}`}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-teal-700 px-5 text-base font-bold text-teal-800 transition-colors duration-150 hover:bg-teal-700 hover:text-white dark:border-teal-400 dark:text-teal-200 dark:hover:bg-teal-400 dark:hover:text-slate-900 motion-reduce:transition-none ${FOCUS}`}
                >
                  {STAGE_LABELS[s.stage]}
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-extrabold text-teal-900 dark:bg-teal-900 dark:text-teal-100">
                    {s.quizzes.length} مراجعات
                  </span>
                </Link>
              ))}
            </div>
          )}

          <Link
            to="/reviews"
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-8 text-lg font-extrabold text-slate-900 shadow-[0_6px_0_0_theme(colors.orange.700)] transition-[transform,box-shadow,background-color] duration-150 hover:bg-orange-400 active:translate-y-[3px] active:shadow-[0_3px_0_0_theme(colors.orange.700)] motion-reduce:transition-none ${FOCUS}`}
          >
            ابدأ المراجعة الآن
            <ArrowLeft size={20} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
