import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CalendarClock, Gamepad2, GraduationCap, Layers, ListChecks, Lock, MessageCircle, Presentation } from 'lucide-react';
import { waLink } from '../../data/contact';

const FEATURES = [
  { icon: Presentation, title: 'شرائح متحركة جاهزة للشاشة', text: 'شرح كل درس في شرائح متحركة بتتعرض على الشاشة التفاعلية في الفصل، بدل ما تحضّر من الصفر.' },
  { icon: Gamepad2, title: 'ألعاب تفاعلية', text: 'في كل درس لعبة تشد انتباه الطلاب وتثبّت المعلومة وتكسر ملل الحصة.' },
  { icon: ListChecks, title: 'أسئلة وتقييم في الحصة', text: 'أسئلة بتتحل مع الطلاب قدام الشاشة عشان تتأكد إنهم فهموا قبل ما تكمّل.' },
  { icon: BadgeCheck, title: 'ببياناتك أنت', text: 'اسمك وصورتك ورقمك وشعارك بيظهروا على العرض، فيتقدّم باسمك قدام الطلاب وأولياء الأمور.' },
];

interface Row { label: string; lessons: string }
const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: 'تكنولوجيا المعلومات — الابتدائي',
    rows: [
      { label: 'الصف الرابع الابتدائي · الترم الأول', lessons: '12 درس' },
      { label: 'الصف الخامس الابتدائي · الترم الأول', lessons: '12 درس' },
      { label: 'الصف السادس الابتدائي · الترم الأول', lessons: '12 درس' },
    ],
  },
  {
    title: 'الكمبيوتر وتكنولوجيا المعلومات — الإعدادي',
    rows: [
      { label: 'الصف الأول الإعدادي · الترم الأول', lessons: '9 دروس' },
      { label: 'الصف الثاني الإعدادي · الترم الأول', lessons: '8 دروس' },
      { label: 'الصف الثالث الإعدادي · الترم الأول', lessons: '9 دروس' },
    ],
  },
  {
    title: 'البرمجة والذكاء الاصطناعي — الثانوي',
    rows: [
      { label: 'الصف الأول الثانوي · الترم الأول', lessons: '18 درس' },
      { label: 'الصف الثاني الثانوي · الترم الأول', lessons: '14 درس' },
      { label: 'الصف الثاني الثانوي · الترم الثاني', lessons: 'بيتضاف تباعاً' },
    ],
  },
];

const STEPS = [
  { n: 1, title: 'اطلب الاشتراك', text: 'ابعتلنا على واتساب وقولنا اسمك والصفوف اللي بتدرّسها.' },
  { n: 2, title: 'نجهّز حسابك', text: 'بنفتح لك حساب ونحدد الصفوف اللي هتشتغل عليها، وتتحط بياناتك على العرض.' },
  { n: 3, title: 'شغّل في الفصل', text: 'تدخل بحسابك وتشغّل العرض على الشاشة التفاعلية وتبدأ الحصة.' },
];

const MESSAGE = 'السلام عليكم أستاذ عامر، أريد الاشتراك في العرض التفاعلي للمدرسين. الاسم: ... والصفوف التي أدرّسها: ...';

export default function TeachersInteractivePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6" dir="rtl">
      <Link
        to="/teachers"
        className="mb-5 inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-bold text-slate-700 hover:text-slate-900 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-600 dark:text-slate-300 dark:hover:text-white"
      >
        <ArrowRight size={16} aria-hidden /> رجوع لصفحة المدرسين
      </Link>

      <header>
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-teal-100 px-4 py-1 text-sm font-extrabold text-teal-900 dark:border-teal-300 dark:bg-teal-950 dark:text-teal-100">
          <GraduationCap size={16} aria-hidden /> خدمة للمدرسين
        </span>
        <h1 className="mt-3 text-3xl font-black leading-snug text-slate-900 dark:text-white sm:text-4xl">
          العرض التفاعلي للفصل — باسمك وباشتراك شهري
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-8 text-slate-700 dark:text-slate-300">
          عرض تقديمي تفاعلي كامل لمناهج تكنولوجيا المعلومات والكمبيوتر والبرمجة، جاهز تشغّله على الشاشة التفاعلية في الفصل.
          اشترك في الصفوف اللي بتدرّسها بس، وبياناتك تظهر على العرض.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href={waLink(MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-slate-900 bg-orange-500 px-6 font-black text-slate-900 shadow-[4px_4px_0_0_#0f172a] transition-colors hover:bg-orange-400 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-600 dark:border-teal-300 dark:shadow-[4px_4px_0_0_#5eead4]"
          >
            <MessageCircle size={20} aria-hidden /> اطلب الاشتراك على واتساب
          </a>
          <a
            href="https://learn.amertimraz.com/login.php"
            className="inline-flex min-h-12 items-center rounded-xl border-2 border-slate-900 bg-white px-5 font-extrabold text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-600 dark:border-teal-300 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            دخول المشتركين
          </a>
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">السعر والتفاصيل عند التواصل</span>
        </div>
      </header>

      <section className="mt-10" aria-labelledby="features">
        <h2 id="features" className="text-2xl font-black text-slate-900 dark:text-white">إيه اللي هتاخده؟</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3 rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0_0_#0f172a] dark:border-teal-300 dark:bg-slate-900 dark:shadow-[4px_4px_0_0_#5eead4]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300" aria-hidden>
                <Icon size={24} />
              </span>
              <div>
                <h3 className="text-lg font-black leading-7 text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm leading-7 text-slate-700 dark:text-slate-300">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="grades">
        <h2 id="grades" className="flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white">
          <Layers size={22} aria-hidden /> المناهج المتاحة
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">اختار الصفوف اللي بتدرّسها، وكل صف مفتوح بدروسه كاملة.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {GROUPS.map(g => (
            <div key={g.title} className="rounded-2xl border-2 border-slate-900 bg-white p-4 dark:border-teal-300 dark:bg-slate-900">
              <h3 className="text-base font-black leading-7 text-teal-900 dark:text-teal-300">{g.title}</h3>
              <ul className="mt-2 divide-y divide-slate-200 dark:divide-slate-700">
                {g.rows.map(r => (
                  <li key={r.label} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">{r.label}</span>
                    <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-extrabold text-orange-900 dark:bg-orange-950 dark:text-orange-200">{r.lessons}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="how">
        <h2 id="how" className="text-2xl font-black text-slate-900 dark:text-white">إزاي الاشتراك بيشتغل؟</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {STEPS.map(s => (
            <li key={s.n} className="rounded-2xl border-2 border-slate-900 bg-teal-50 p-4 dark:border-teal-300 dark:bg-teal-950">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-lg font-black text-white dark:bg-teal-300 dark:text-slate-900" aria-hidden>{s.n}</span>
              <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-white">{s.title}</h3>
              <p className="mt-1 text-sm leading-7 text-slate-700 dark:text-slate-300">{s.text}</p>
            </li>
          ))}
        </ol>
        <ul className="mt-4 grid gap-3 text-sm font-bold text-slate-800 dark:text-slate-200 sm:grid-cols-2">
          <li className="flex items-center gap-2"><CalendarClock size={18} className="text-teal-700 dark:text-teal-300" aria-hidden /> اشتراك شهري، وتقدر تمدّده في أي وقت.</li>
          <li className="flex items-center gap-2"><Lock size={18} className="text-teal-700 dark:text-teal-300" aria-hidden /> بتشوف الصفوف المشترك فيها بس.</li>
        </ul>
      </section>

      <section className="mt-10 rounded-3xl border-2 border-slate-900 bg-slate-900 p-6 text-center text-white dark:border-teal-300 sm:p-8" aria-label="اطلب الاشتراك">
        <h2 className="text-2xl font-black">جاهز تبدأ؟</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-200">
          ابعتلنا اسمك والصفوف اللي بتدرّسها، ونرد عليك بالتفاصيل والسعر ونجهّز حسابك.
        </p>
        <a
          href={waLink(MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-500 px-7 font-black text-slate-900 transition-colors hover:bg-orange-400 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-300"
        >
          <MessageCircle size={20} aria-hidden /> تواصل على واتساب
        </a>
      </section>
    </div>
  );
}
