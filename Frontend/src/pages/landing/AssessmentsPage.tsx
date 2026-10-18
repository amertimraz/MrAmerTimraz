import { useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { ClipboardCheck, ExternalLink, Eye, EyeOff, Printer, Clock, Sparkles } from 'lucide-react';
import { assessmentsApi, type AssessmentContent, type AssessmentTrackSummary, type AssessmentWeekSummary } from '../../api/assessments';
import AssessmentSheet from '../../components/assessments/AssessmentSheet';

const NEW_DAYS = 10;

// Grades shown as cards, Primary 4 → Secondary 2. `key` must match AssessmentTrack.Stage on the backend.
const GRADES = [
  { key: 'Prim4', label: 'الصف الرابع الابتدائي', short: 'الرابع', level: 'الابتدائي' },
  { key: 'Prim5', label: 'الصف الخامس الابتدائي', short: 'الخامس', level: 'الابتدائي' },
  { key: 'Prim6', label: 'الصف السادس الابتدائي', short: 'السادس', level: 'الابتدائي' },
  { key: 'Prep1', label: 'الصف الأول الإعدادي', short: 'الأول', level: 'الإعدادي' },
  { key: 'Prep2', label: 'الصف الثاني الإعدادي', short: 'الثاني', level: 'الإعدادي' },
  { key: 'Prep3', label: 'الصف الثالث الإعدادي', short: 'الثالث', level: 'الإعدادي' },
  { key: 'Sec1', label: 'الصف الأول الثانوي', short: 'الأول', level: 'الثانوي' },
  { key: 'Sec2', label: 'الصف الثاني الثانوي', short: 'الثاني', level: 'الثانوي' },
];

const PRINT_CSS = `
@media print {
  #root > div > *:not(main) { display: none !important; }
  #root > div { background: #fff !important; }
  #root main { padding-top: 0 !important; }
  .no-print { display: none !important; }
  .print-sheet { break-after: page; border: none !important; padding: 0 !important; }
  .print-sheet:last-child { break-after: auto; }
  @page { margin: 14mm; }
}
`;

function isNew(w: AssessmentWeekSummary) {
  if (!w.publishedAt) return false;
  return Date.now() - new Date(w.publishedAt).getTime() < NEW_DAYS * 86_400_000;
}

function formatDate(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AssessmentsPage() {
  const { data: tracks, isLoading, isError } = useQuery({
    queryKey: ['assessments-catalog'],
    queryFn: assessmentsApi.getCatalog,
  });

  const [selected, setSelected] = useState<number | 'all' | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [stageKey, setStageKey] = useState<string | null>(null);
  const [trackKey, setTrackKey] = useState<string | null>(null);

  const tracksByStage = useMemo(() => {
    const map = new Map<string, AssessmentTrackSummary[]>();
    for (const t of tracks ?? []) map.set(t.stage, [...(map.get(t.stage) ?? []), t]);
    return map;
  }, [tracks]);
  const stageTracks = tracksByStage.get(stageKey ?? '') ?? [];
  const track = stageTracks.find(t => t.key === trackKey) ?? stageTracks[0];
  const stage = GRADES.find(g => g.key === stageKey);

  if (stageKey == null && tracks && tracks.length > 0) setStageKey(tracks[0].stage);

  const pickStage = (k: string) => {
    setStageKey(k);
    setTrackKey(null);
    setSelected(null);
  };
  const pickTrack = (k: string) => {
    setTrackKey(k);
    setSelected(null);
  };
  const weeks = useMemo(() => [...(track?.weeks ?? [])].sort((a, b) => a.week - b.week), [track]);
  const solvedWeeks = weeks.filter(w => w.hasSolution);

  const activeWeeks = useMemo(() => {
    if (selected === 'all') return solvedWeeks.map(w => w.week);
    return selected != null ? [selected] : [];
  }, [selected, solvedWeeks]);

  const contents = useQueries({
    queries: activeWeeks.map(week => ({
      queryKey: ['assessment', track?.key, week],
      queryFn: () => assessmentsApi.getWeek(track!.key, week),
      enabled: !!track,
      staleTime: 5 * 60_000,
    })),
  });

  const loaded = contents.map(c => c.data).filter((c): c is AssessmentContent => !!c);

  const lessons = useMemo(() => {
    const map = new Map<string, AssessmentWeekSummary[]>();
    for (const w of weeks) {
      const key = w.lesson ?? 'أسابيع قادمة';
      map.set(key, [...(map.get(key) ?? []), w]);
    }
    return [...map.entries()];
  }, [weeks]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6" dir="rtl">
      <style>{PRINT_CSS}</style>

      <header className="no-print">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-teal-100 px-4 py-1 text-sm font-extrabold text-teal-900 dark:border-teal-300 dark:bg-teal-950 dark:text-teal-100">
          <ClipboardCheck size={16} aria-hidden /> التقييمات الأسبوعية
        </span>
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
          تقييمات {track?.subject ?? 'الحاسب الآلي'}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-8 text-slate-700 dark:text-slate-300">
          {track && stage ? `${stage.label} — الترم ${track.term === 1 ? 'الأول' : 'الثاني'}. ` : ''}
          كل تقييم أسبوعي وواجب منزلي بنسخة منسّقة، بدون حل للتدريب أو مع نموذج الإجابة، مع إمكانية الطباعة أو الحفظ كملف PDF.
          تظهر الأسابيع الجديدة تلقائياً بمجرد نشرها من الوزارة.
        </p>
      </header>

      {isLoading && <p className="no-print mt-10 text-center font-bold text-slate-600 dark:text-slate-300">جاري التحميل…</p>}
      {isError && (
        <p className="no-print mt-10 rounded-xl border-2 border-rose-700 p-4 text-center font-bold text-rose-800 dark:text-rose-300">
          تعذّر تحميل التقييمات، حاول مرة أخرى لاحقاً.
        </p>
      )}

      {tracks && (
        <nav className="no-print mt-6 space-y-4" aria-label="الصف الدراسي">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {GRADES.map(g => {
              const count = (tracksByStage.get(g.key) ?? []).reduce((n, t) => n + t.weeks.length, 0);
              const has = count > 0;
              const on = g.key === stageKey;
              return (
                <li key={g.key}>
                  <button
                    type="button"
                    disabled={!has}
                    aria-pressed={on}
                    onClick={() => pickStage(g.key)}
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
                    <span className="text-xs font-bold">{has ? `${count} أسبوع` : 'قريباً'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {stageTracks.length > 1 && (
            <div role="tablist" aria-label="المادة والفصل الدراسي" className="flex flex-wrap gap-2">
              {stageTracks.map(t => {
                const on = t.key === track?.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => pickTrack(t.key)}
                    className={`min-h-11 rounded-full border-2 border-teal-700 px-4 text-sm font-extrabold ${
                      on ? 'bg-teal-700 text-white' : 'bg-white text-teal-900 hover:bg-teal-50 dark:bg-slate-800 dark:text-teal-100'
                    }`}
                  >
                    {t.subject} — الترم {t.term === 1 ? 'الأول' : 'الثاني'}
                  </button>
                );
              })}
            </div>
          )}
        </nav>
      )}

      {track && (
        <>
          <section className="no-print mt-8 space-y-6" aria-label="أسابيع التقييم">
            {lessons.map(([lesson, list]) => (
              <div key={lesson}>
                <h2 className="mb-3 border-r-4 border-orange-500 pr-3 text-lg font-black text-slate-900 dark:text-white">{lesson}</h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map(w => {
                    const active = selected === w.week;
                    return (
                      <li key={w.week}>
                        <div
                          className={`flex h-full flex-col rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0_0_#0f172a] dark:border-teal-300 dark:bg-slate-900 dark:shadow-[4px_4px_0_0_#5eead4] ${
                            active ? 'ring-4 ring-orange-400' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xl font-black text-slate-900 dark:text-white">الأسبوع {w.week}</span>
                            {isNew(w) && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-extrabold text-slate-900">
                                <Sparkles size={12} aria-hidden /> جديد
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {w.hasSolution ? `${w.itemCount} سؤال` : 'بانتظار التنسيق والحل'}
                            {w.publishedAt ? ` · ${formatDate(w.publishedAt)}` : ''}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {w.hasSolution ? (
                              <button
                                type="button"
                                onClick={() => setSelected(w.week)}
                                aria-pressed={active}
                                className="min-h-11 flex-1 rounded-xl border-2 border-slate-900 bg-orange-500 px-4 font-extrabold text-slate-900 transition-colors hover:bg-orange-400 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-600 dark:border-orange-300"
                              >
                                {active ? 'معروض الآن' : 'عرض التقييم'}
                              </button>
                            ) : (
                              <span className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-500 px-3 text-sm font-extrabold text-slate-700 dark:text-slate-300">
                                <Clock size={15} aria-hidden /> الحل قريباً
                              </span>
                            )}
                            {w.sourceAvailable && (
                              <a
                                href={w.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-slate-900 px-3 text-sm font-extrabold text-slate-900 hover:bg-teal-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-600 dark:border-teal-300 dark:text-white dark:hover:bg-slate-800"
                              >
                                <ExternalLink size={15} aria-hidden /> ملف الوزارة
                              </a>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>

          {solvedWeeks.length > 0 && (
            <section className="no-print mt-8 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-slate-900 bg-teal-50 p-4 dark:border-teal-300 dark:bg-slate-900">
              <div role="group" aria-label="نوع النسخة" className="flex overflow-hidden rounded-xl border-2 border-slate-900 dark:border-teal-300">
                <button
                  type="button"
                  aria-pressed={!showAnswers}
                  onClick={() => setShowAnswers(false)}
                  className={`inline-flex min-h-11 items-center gap-1.5 px-4 font-extrabold ${
                    !showAnswers ? 'bg-slate-900 text-white dark:bg-teal-300 dark:text-slate-900' : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white'
                  }`}
                >
                  <EyeOff size={16} aria-hidden /> بدون حل
                </button>
                <button
                  type="button"
                  aria-pressed={showAnswers}
                  onClick={() => setShowAnswers(true)}
                  className={`inline-flex min-h-11 items-center gap-1.5 px-4 font-extrabold ${
                    showAnswers ? 'bg-slate-900 text-white dark:bg-teal-300 dark:text-slate-900' : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white'
                  }`}
                >
                  <Eye size={16} aria-hidden /> محلول
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelected('all')}
                aria-pressed={selected === 'all'}
                className="min-h-11 rounded-xl border-2 border-slate-900 bg-white px-4 font-extrabold text-slate-900 hover:bg-orange-100 dark:border-teal-300 dark:bg-slate-800 dark:text-white"
              >
                عرض كل الأسابيع
              </button>

              <button
                type="button"
                disabled={loaded.length === 0}
                onClick={() => window.print()}
                className="mr-auto inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-slate-900 bg-orange-500 px-5 font-extrabold text-slate-900 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Printer size={18} aria-hidden /> طباعة / حفظ PDF
              </button>
              <p className="w-full text-sm text-slate-700 dark:text-slate-300">
                لحفظ ملف PDF اختر «حفظ كملف PDF» من نافذة الطباعة. الطباعة تشمل المعروض حالياً فقط.
              </p>
            </section>
          )}

          <section className="mt-8 space-y-8" aria-live="polite">
            {selected == null && solvedWeeks.length > 0 && (
              <p className="no-print rounded-xl border-2 border-dashed border-slate-400 p-6 text-center font-bold text-slate-600 dark:text-slate-300">
                اختر أسبوعاً من الأعلى لعرض تقييمه.
              </p>
            )}
            {selected != null && contents.some(c => c.isLoading) && (
              <p className="no-print text-center font-bold text-slate-600 dark:text-slate-300">جاري تحميل التقييم…</p>
            )}
            {loaded.map(c => (
              <div key={c.week} className="print-sheet">
                <AssessmentSheet content={c} showAnswers={showAnswers} />
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
