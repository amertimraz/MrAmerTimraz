import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, CalendarDays, Download, Eye, FileText, GraduationCap, Layers } from 'lucide-react';
import { visitsApi } from '../../api/assessments';
import { teachersApi } from '../../api/teachers';
import { getMediaUrl } from '../../api/client';
import { findGrade } from '../../data/grades';
import SampleViewer from '../../components/teachers/SampleViewer';
import PriceTable from '../../components/teachers/PriceTable';

export default function TeacherBookletPage() {
  const { id } = useParams();
  const bookletId = Number(id);

  const { data: b, isLoading, isError } = useQuery({
    queryKey: ['teacher-booklet', bookletId],
    queryFn: () => teachersApi.get(bookletId),
    enabled: Number.isFinite(bookletId),
    retry: false,
  });

  const grade = findGrade(b?.gradeLevel);

  // Per-booklet visit counter: one counted visit per browser session.
  const [visits, setVisits] = useState<number | null>(null);
  useEffect(() => {
    if (!Number.isFinite(bookletId)) return;
    const page = `teacher-booklet-${bookletId}`;
    const key = `visit-${page}`;
    let counted = false;
    try { counted = sessionStorage.getItem(key) === '1'; } catch { /* storage blocked */ }
    (counted ? visitsApi.get(page) : visitsApi.hit(page))
      .then(n => {
        setVisits(n);
        try { sessionStorage.setItem(key, '1'); } catch { /* storage blocked */ }
      })
      .catch(() => {});
  }, [bookletId]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6" dir="rtl">
      <Link to="/teachers" className="inline-flex min-h-11 items-center gap-2 font-extrabold text-teal-800 hover:underline dark:text-teal-300">
        <ArrowRight size={18} aria-hidden /> كل المذكرات
      </Link>

      {isLoading && <p className="mt-6 text-center font-bold text-slate-600 dark:text-slate-300">جاري التحميل…</p>}
      {isError && (
        <p className="mt-6 rounded-xl border-2 border-dashed border-slate-400 p-8 text-center font-bold text-slate-700 dark:text-slate-300">
          هذه المذكرة غير متاحة حالياً.
        </p>
      )}

      {b && (
        <>
          <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            {(b.samples[0]?.imageUrl || b.coverImageUrl) && (
              <img src={getMediaUrl(b.samples[0]?.imageUrl ?? b.coverImageUrl)} alt="" className="h-48 w-36 shrink-0 rounded-xl border-2 border-slate-900 object-cover dark:border-teal-300" />
            )}
            <div>
              <h1 className="text-3xl font-black leading-10 text-slate-900 dark:text-white">{b.title}</h1>
              <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="بيانات المذكرة">
                {[
                  { Icon: GraduationCap, text: grade?.label ?? b.gradeLevel },
                  { Icon: BookOpen, text: b.subject ?? grade?.subject },
                  { Icon: CalendarDays, text: b.term },
                  { Icon: FileText, text: b.pageCount ? `${b.pageCount} صفحة` : null },
                  { Icon: Layers, text: 'ملف PDF' },
                ].filter(c => c.text).map(c => (
                  <li key={c.text as string} className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-300 bg-white px-3 py-1 text-sm font-bold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    <c.Icon size={14} aria-hidden /> {c.text}
                  </li>
                ))}
                {visits !== null && (
                  <li className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400" title="زيارات هذه المذكرة">
                    <Eye size={12} aria-hidden /> {visits.toLocaleString('en-US')}
                  </li>
                )}
              </ul>
              {(b.teacherSummary || b.description) && (
                <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-slate-800 dark:text-slate-200">
                  {b.teacherSummary || b.description}
                </p>
              )}
            </div>
          </header>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 border-r-4 border-orange-500 pr-3 text-xl font-black text-slate-900 dark:text-white">عينات من المذكرة</h2>
              <SampleViewer samples={b.samples} />
              {b.samplePdfUrl && (
                <a
                  href={getMediaUrl(b.samplePdfUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 font-extrabold text-slate-900 hover:bg-orange-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-600 dark:border-teal-300 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                >
                  <Download size={18} aria-hidden /> حمّل ملف العينة (PDF)
                </a>
              )}
            </div>
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 border-r-4 border-orange-500 pr-3 text-xl font-black text-slate-900 dark:text-white">الأسعار</h2>
                <PriceTable bookletTitle={b.title} studentPrice={b.studentPrice} teacherPrice={b.teacherPrice} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
