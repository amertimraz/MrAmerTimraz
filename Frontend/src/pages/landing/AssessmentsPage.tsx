import { useEffect, useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { ClipboardCheck, ExternalLink, Eye, EyeOff, Printer, Clock, Sparkles } from 'lucide-react';
import { assessmentsApi, visitsApi, type AssessmentContent, type AssessmentTrackSummary, type AssessmentWeekSummary } from '../../api/assessments';
import { GRADES } from '../../data/grades';
import AssessmentSheet from '../../components/assessments/AssessmentSheet';

const NEW_DAYS = 10;

// The ministry PDF link is hidden for now; flip to true to bring the "ملف الوزارة" button back.
const SHOW_SOURCE_LINK = false;


// Printing happens in an isolated iframe that holds only the sheets, so the app chrome can never
// leak into (or blank out) the PDF.
const WATERMARK_SVG = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="380" height="280"><g transform="rotate(-30 190 140)" text-anchor="middle" font-family="Tahoma, Arial, sans-serif" fill="#0d9488" fill-opacity="0.13"><text x="190" y="135" font-size="30" font-weight="bold">منصة الأستاذ عامر تمراز</text><text x="190" y="170" font-size="20" font-weight="bold">amertimraz.com</text></g></svg>'
);

const PRINT_CSS = `
  html, body { margin: 0; background: #fff !important; font-family: 'Cairo', sans-serif; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-shadow: none !important; }
  .print-sheet { break-after: page; page-break-after: always; }
  .print-sheet:last-child { break-after: auto; page-break-after: auto; }
  .print-sheet article { border: none !important; padding: 0 !important; position: relative; z-index: 1; }
  .print-sheet li, .print-sheet pre { break-inside: avoid; page-break-inside: avoid; }
  html, body { background: #fff var(--wm) repeat !important; }
  .print-sheet article { background: transparent !important; }
  @page { size: A4; margin: 14mm; }
`;

function printSheets() {
  const sheets = [...document.querySelectorAll('.print-sheet')].map(n => n.outerHTML).join('');
  if (!sheets) return;
  const head = [...document.querySelectorAll('link[rel="stylesheet"], style')]
    .map(n => (n as HTMLElement).outerHTML)
    .join('');
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0;';
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(
    `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقييمات - منصة الأستاذ عامر تمراز</title>${head}<style>:root{--wm:url("data:image/svg+xml,${WATERMARK_SVG}")}${PRINT_CSS}</style></head><body>${sheets}</body></html>`
  );
  doc.close();
  const win = frame.contentWindow!;
  win.addEventListener('afterprint', () => frame.remove());
  setTimeout(() => {
    win.focus();
    win.print();
  }, 800);
}

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

  // Count one visit per browser session, then show the running total.
  const [visits, setVisits] = useState<number | null>(null);
  useEffect(() => {
    let counted = false;
    try { counted = sessionStorage.getItem('assessments-visit') === '1'; } catch { /* storage blocked */ }
    const req = counted ? visitsApi.get('assessments') : visitsApi.hit('assessments');
    req.then(n => {
      setVisits(n);
      try { sessionStorage.setItem('assessments-visit', '1'); } catch { /* storage blocked */ }
    }).catch(() => {});
  }, []);

  const [selected, setSelected] = useState<number | 'all' | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [term, setTerm] = useState<1 | 2>(1);
  const [stageKey, setStageKey] = useState<string | null>(null);
  const [trackKey, setTrackKey] = useState<string | null>(null);

  const tracksByStage = useMemo(() => {
    const map = new Map<string, AssessmentTrackSummary[]>();
    for (const t of tracks ?? []) {
      if (t.term !== term) continue;
      map.set(t.stage, [...(map.get(t.stage) ?? []), t]);
    }
    return map;
  }, [tracks, term]);
  const stageTracks = tracksByStage.get(stageKey ?? '') ?? [];
  const track = stageTracks.find(t => t.key === trackKey) ?? stageTracks[0];
  const stage = GRADES.find(g => g.key === stageKey);

  if (stageKey == null && tracks && tracks.length > 0) setStageKey(tracks[0].stage);

  const pickTerm = (t: 1 | 2) => {
    setTerm(t);
    setTrackKey(null);
    setSelected(null);
  };

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

      <header className="no-print">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-teal-100 px-4 py-1 text-sm font-extrabold text-teal-900 dark:border-teal-300 dark:bg-teal-950 dark:text-teal-100">
          <ClipboardCheck size={16} aria-hidden /> التقييمات الأسبوعية
        </span>
        {visits !== null && (
          <span
            className="mr-2 inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-orange-500 px-4 py-1 text-sm font-extrabold text-slate-900 dark:border-orange-300"
            aria-label={`عدد الزيارات ${visits.toLocaleString('ar-EG')}`}
          >
            <Eye size={16} aria-hidden /> عدد الزيارات: {visits.toLocaleString('ar-EG')}
          </span>
        )}
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
          <div role="group" aria-label="الفصل الدراسي" className="inline-flex overflow-hidden rounded-xl border-2 border-slate-900 dark:border-teal-300">
            {([1, 2] as const).map(t => (
              <button
                key={t}
                type="button"
                aria-pressed={term === t}
                onClick={() => pickTerm(t)}
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

      {tracks && !track && (
        <p className="no-print mt-8 rounded-xl border-2 border-dashed border-slate-400 p-8 text-center font-bold text-slate-600 dark:text-slate-300">
          تقييمات {term === 1 ? 'الترم الأول' : 'الترم الثاني'} لهذا الصف قريباً.
        </p>
      )}

      {track && (
        <>
          <section className="no-print mt-8 space-y-6" aria-label="أسابيع التقييم">
            {lessons.map(([lesson, list]) => (
              <div key={lesson}>
                <h2 className="mb-3 border-r-4 border-orange-500 pr-3 text-lg font-black text-slate-900 dark:text-white">{lesson}</h2>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
                  {list.map(w => {
                    const active = selected === w.week;
                    return (
                      <li key={w.week}>
                        <div
                          className={`flex h-full flex-col rounded-xl border-2 border-slate-900 bg-white p-3 shadow-[3px_3px_0_0_#0f172a] dark:border-teal-300 dark:bg-slate-900 dark:shadow-[3px_3px_0_0_#5eead4] ${
                            active ? 'ring-4 ring-orange-400' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-lg font-black text-slate-900 dark:text-white">الأسبوع {w.week}</span>
                            {isNew(w) && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-extrabold text-slate-900">
                                <Sparkles size={12} aria-hidden /> جديد
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                            {w.hasSolution ? `${w.itemCount} سؤال` : 'بانتظار الحل'}
                            {w.publishedAt ? ` · ${formatDate(w.publishedAt)}` : ''}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {w.hasSolution ? (
                              <button
                                type="button"
                                onClick={() => setSelected(w.week)}
                                aria-pressed={active}
                                className="min-h-11 flex-1 rounded-lg border-2 border-slate-900 bg-orange-500 px-3 text-sm font-extrabold text-slate-900 transition-colors hover:bg-orange-400 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-600 dark:border-orange-300"
                              >
                                {active ? 'معروض الآن' : 'عرض التقييم'}
                              </button>
                            ) : (
                              <span className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-500 px-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                                <Clock size={15} aria-hidden /> الحل قريباً
                              </span>
                            )}
                            {SHOW_SOURCE_LINK && w.sourceAvailable && (
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
                onClick={printSheets}
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
                <AssessmentSheet content={c} showAnswers={showAnswers} stageLabel={stage?.label ?? ''} />
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
