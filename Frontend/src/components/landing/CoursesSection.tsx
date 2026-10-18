import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Monitor, Laptop, Code2, ArrowLeft } from 'lucide-react';

const FOCUS =
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 focus-visible:ring-offset-2 ring-offset-transparent';

const tracks = [
  {
    level: 'المرحلة الابتدائية',
    title: 'تقنية المعلومات',
    text: 'تدريس مادة تقنية المعلومات بأسلوب تفاعلي وممتع يناسب الطلاب الصغار.',
    icon: <Monitor size={28} />,
    card: 'bg-teal-700 text-white border-slate-900 dark:border-white/15',
    chip: 'bg-white/20 text-white',
    iconBox: 'bg-white text-teal-800',
    link: 'bg-white text-teal-900 hover:bg-teal-50',
  },
  {
    level: 'المرحلة الإعدادية',
    title: 'الحاسب الآلي',
    text: 'شرح برامج Office والشبكات والأمن المعلوماتي بأسلوب مبسّط وعملي.',
    icon: <Laptop size={28} />,
    card: 'bg-orange-400 text-slate-900 border-slate-900 dark:border-white/15',
    chip: 'bg-slate-900/15 text-slate-900',
    iconBox: 'bg-slate-900 text-orange-300',
    link: 'bg-slate-900 text-white hover:bg-slate-800',
  },
  {
    level: 'أول ثانوي',
    title: 'البرمجة والذكاء الاصطناعي',
    text: 'تعليم البرمجة من الصفر باستخدام Scratch وPython مع مشاريع تطبيقية ومفاهيم الذكاء الاصطناعي.',
    icon: <Code2 size={28} />,
    card: 'bg-slate-900 text-white border-slate-900 dark:bg-slate-800 dark:border-white/15',
    chip: 'bg-white/15 text-white',
    iconBox: 'bg-teal-400 text-slate-900',
    link: 'bg-teal-400 text-slate-900 hover:bg-teal-300',
  },
];

export default function CoursesSection() {
  const reduce = useReducedMotion();

  return (
    <section dir="rtl" id="courses" className="bg-teal-50 py-16 dark:bg-slate-950 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-teal-800 dark:text-teal-300">المراحل الدراسية</p>
          <h2 className="mt-2 text-3xl font-black leading-tight text-slate-900 dark:text-white sm:text-4xl">
            مادة لكل مرحلة
          </h2>
          <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
            من الابتدائي للثانوي، محتوى مبسّط بيناسب كل سن.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {tracks.map((t, i) => (
            <motion.article
              key={t.title}
              {...(reduce
                ? {}
                : {
                    initial: { opacity: 0, y: 20 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, margin: '-60px' },
                    transition: { duration: 0.4, delay: i * 0.08, ease: 'easeOut' as const },
                  })}
              className={`flex flex-col rounded-3xl border-[3px] p-6 shadow-[5px_5px_0_0_theme(colors.slate.900)] dark:shadow-none ${t.card}`}
            >
              <span className={`grid size-14 place-items-center rounded-2xl ${t.iconBox}`} aria-hidden>
                {t.icon}
              </span>
              <span className={`mt-5 inline-block w-fit rounded-full px-3 py-1 text-sm font-bold ${t.chip}`}>{t.level}</span>
              <h3 className="mt-3 text-2xl font-black leading-snug">{t.title}</h3>
              <p className="mt-2 flex-1 text-base leading-7">{t.text}</p>
              <Link
                to="/courses"
                className={`mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-base font-bold transition-colors duration-150 motion-reduce:transition-none ${t.link} ${FOCUS}`}
              >
                استعرض الدروس
                <ArrowLeft size={18} aria-hidden />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
