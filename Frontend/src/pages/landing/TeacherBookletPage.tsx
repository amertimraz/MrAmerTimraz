import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { teachersApi } from '../../api/teachers';
import { getMediaUrl } from '../../api/client';
import { findGrade } from '../../data/grades';
import SampleViewer from '../../components/teachers/SampleViewer';
import QuantityTable from '../../components/teachers/QuantityTable';

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
            {b.coverImageUrl && (
              <img src={getMediaUrl(b.coverImageUrl)} alt="" className="h-48 w-36 shrink-0 rounded-xl border-2 border-slate-900 object-cover dark:border-teal-300" />
            )}
            <div>
              <h1 className="text-3xl font-black leading-10 text-slate-900 dark:text-white">{b.title}</h1>
              <p className="mt-1 font-bold text-slate-600 dark:text-slate-400">
                {[grade?.label ?? b.gradeLevel, b.subject ?? grade?.subject, b.term,
                  b.pageCount ? `${b.pageCount.toLocaleString('ar-EG')} صفحة` : null].filter(Boolean).join(' · ')}
              </p>
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
            </div>
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 border-r-4 border-orange-500 pr-3 text-xl font-black text-slate-900 dark:text-white">الأسعار</h2>
                <QuantityTable basePrice={b.teacherPrice} offers={b.quantityOffers} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
