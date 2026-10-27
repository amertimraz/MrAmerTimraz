import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Eye, GraduationCap } from 'lucide-react';
import { teachersApi } from '../../api/teachers';
import { visitsApi } from '../../api/assessments';
import { getMediaUrl } from '../../api/client';
import { GRADES, findGrade } from '../../data/grades';

// A booklet's free-text Term ("الترم الأول" / "الترم الثاني"); anything else is shown in both terms.
const termOf = (v?: string | null): 1 | 2 | null => (!v ? null : v.includes('الثاني') || v.includes('2') ? 2 : v.includes('الأول') || v.includes('1') ? 1 : null);

const fmt = (n: number) => `${n.toLocaleString('en-US')} جنيه`;

export default function TeachersPage() {
  const { data: booklets, isLoading, isError } = useQuery({
    queryKey: ['teacher-booklets'],
    queryFn: teachersApi.list,
  });

  const [stage, setStage] = useState<string | null>(null);
  const [term, setTerm] = useState<1 | 2>(1);
  const [visits, setVisits] = useState<number | null>(null);

  // One counted visit per browser session.
  useEffect(() => {
    let counted = false;
    try { counted = sessionStorage.getItem('teachers-visit') === '1'; } catch { /* storage blocked */ }
    (counted ? visitsApi.get('teachers') : visitsApi.hit('teachers'))
      .then(n => {
        setVisits(n);
        try { sessionStorage.setItem('teachers-visit', '1'); } catch { /* storage blocked */ }
      })
      .catch(() => {});
  }, []);

  const byGrade = useMemo(() => {
    const map = new Map<string, NonNullable<typeof booklets>>();
    for (const b of booklets ?? []) {
      const t = termOf(b.term);
      if (t !== null && t !== term) continue;
      const key = findGrade(b.gradeLevel)?.key ?? 'other';
      map.set(key, [...(map.get(key) ?? []), b]);
    }
    return map;
  }, [booklets, term]);

  const shown = stage ? byGrade.get(stage) ?? [] : [...byGrade.values()].flat();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6" dir="rtl">
      <header>
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-teal-100 px-4 py-1 text-sm font-extrabold text-teal-900 dark:border-teal-300 dark:bg-teal-950 dark:text-teal-100">
          <GraduationCap size={16} aria-hidden /> للمدرسين
        </span>
        {visits !== null && (
          <span className="mr-2 inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-orange-500 px-4 py-1 text-sm font-extrabold text-slate-900 dark:border-orange-300">
            <Eye size={16} aria-hidden /> عدد الزيارات: {visits.toLocaleString('ar-EG')}
          </span>
        )}
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">مذكرات جاهزة للمدرسين</h1>
        <p className="mt-2 max-w-2xl text-base leading-8 text-slate-700 dark:text-slate-300">
          شاهد عينات من كل مذكرة، واعرف الأسعار وعروض الكميات.
        </p>
      </header>

      <nav aria-label="الصف الدراسي" className="mt-6">
        <div role="group" aria-label="الفصل الدراسي" className="mb-4 inline-flex overflow-hidden rounded-xl border-2 border-slate-900 dark:border-teal-300">
          {([1, 2] as const).map(t => (
            <button
              key={t}
              type="button"
              aria-pressed={term === t}
              onClick={() => { setTerm(t); setStage(null); }}
              className={`min-h-11 px-5 font-extrabold ${
                term === t ? 'bg-slate-900 text-white dark:bg-teal-300 dark:text-slate-900' : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white'
              }`}
            >
              {t === 1 ? 'الترم الأول' : 'الترم الثاني'}
            </button>
          ))}
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {GRADES.map(g => {
            const count = byGrade.get(g.key)?.length ?? 0;
            const has = count > 0;
            const on = stage === g.key;
            return (
              <li key={g.key}>
                <button
                  type="button"
                  disabled={!has}
                  aria-pressed={on}
                  onClick={() => setStage(on ? null : g.key)}
                  className={`flex min-h-28 w-full flex-col items-start justify-between rounded-2xl border-2 p-4 text-right transition-colors focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-600 ${
                    has
                      ? `border-slate-900 shadow-[4px_4px_0_0_#0f172a] dark:border-teal-300 dark:shadow-[4px_4px_0_0_#5eead4] ${
                          on ? 'bg-orange-500 text-slate-900' : 'bg-white text-slate-900 hover:bg-orange-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800'
                        }`
                      : 'cursor-not-allowed border-dashed border-slate-400 bg-transparent text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span className="text-xs font-extrabold opacity-80">{g.level}</span>
                  <span className="text-lg font-black leading-7">الصف {g.short}</span>
                  <span className="text-xs font-bold">{has ? `${count.toLocaleString('ar-EG')} مذكرة` : 'قريباً'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <section className="mt-8" aria-label="المذكرات">
        {isLoading && <p className="text-center font-bold text-slate-600 dark:text-slate-300">جاري التحميل…</p>}
        {isError && (
          <p className="rounded-xl border-2 border-rose-700 p-4 text-center font-bold text-rose-800 dark:text-rose-300">
            تعذّر تحميل المذكرات، حاول مرة أخرى لاحقاً.
          </p>
        )}
        {!isLoading && !isError && shown.length === 0 && (
          <p className="rounded-xl border-2 border-dashed border-slate-400 p-8 text-center font-bold text-slate-600 dark:text-slate-300">
            مذكرات هذا الترم قريباً.
          </p>
        )}
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(b => (
            <li key={b.id}>
              <Link
                to={`/teachers/${b.id}`}
                className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-slate-900 bg-white shadow-[4px_4px_0_0_#0f172a] transition-colors hover:bg-orange-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-600 dark:border-teal-300 dark:bg-slate-900 dark:shadow-[4px_4px_0_0_#5eead4] dark:hover:bg-slate-800"
              >
                {b.firstSampleUrl || b.coverImageUrl ? (
                  <img src={getMediaUrl(b.firstSampleUrl ?? b.coverImageUrl)} alt="" loading="lazy" className="h-44 w-full border-b-2 border-slate-900 object-cover dark:border-teal-300" />
                ) : (
                  <div className="flex h-44 items-center justify-center border-b-2 border-slate-900 bg-teal-100 dark:border-teal-300 dark:bg-teal-950">
                    <BookOpen size={44} className="text-teal-800 dark:text-teal-300" aria-hidden />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="text-lg font-black leading-7 text-slate-900 dark:text-white">{b.title}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {[findGrade(b.gradeLevel)?.label ?? b.gradeLevel, b.term].filter(Boolean).join(' · ')}
                  </p>
                  <p className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-3 text-base font-extrabold text-teal-800 dark:text-teal-300">
                    {b.studentPrice != null && b.studentPrice > 0 && <span>طالب: {fmt(b.studentPrice)}</span>}
                    {b.teacherPrice != null && b.teacherPrice > 0 && <span>مدرس: {fmt(b.teacherPrice)}</span>}
                    {!(b.studentPrice && b.studentPrice > 0) && !(b.teacherPrice && b.teacherPrice > 0) && <span>اسأل عن السعر</span>}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
