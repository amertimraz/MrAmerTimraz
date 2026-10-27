import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Eye, EyeOff, ImagePlus, Save, Trash2, GraduationCap } from 'lucide-react';
import { teachersApi, type AdminTeacherBooklet } from '../../api/teachers';
import { getMediaUrl } from '../../api/client';
import { GRADES, findGrade } from '../../data/grades';

const input =
  'min-h-11 w-full min-w-0 rounded-xl border-2 border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
const label = 'mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300';

function BookletEditor({ b }: { b: AdminTeacherBooklet }) {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-teacher-booklets'] });

  const [open, setOpen] = useState(false);
  const [showcase, setShowcase] = useState(b.teacherShowcase);
  const [summary, setSummary] = useState(b.teacherSummary ?? '');
  const [price, setPrice] = useState(b.teacherPrice != null ? String(b.teacherPrice) : '');
  const [studentPrice, setStudentPrice] = useState(b.studentPrice != null ? String(b.studentPrice) : '');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setShowcase(b.teacherShowcase);
    setSummary(b.teacherSummary ?? '');
    setPrice(b.teacherPrice != null ? String(b.teacherPrice) : '');
    setStudentPrice(b.studentPrice != null ? String(b.studentPrice) : '');
  }, [b]);

  const errText = (e: any) => (typeof e?.response?.data === 'string' ? e.response.data : 'حدث خطأ، حاول مرة أخرى');

  const save = useMutation({
    mutationFn: async () => {
      await teachersApi.updateBooklet(b.id, {
        teacherShowcase: showcase,
        teacherSummary: summary || null,
        teacherPrice: price.trim() === '' ? null : Number(price),
        studentPrice: studentPrice.trim() === '' ? undefined : Number(studentPrice),
      });
    },
    onSuccess: () => { setMessage({ ok: true, text: 'تم الحفظ' }); refresh(); },
    onError: e => setMessage({ ok: false, text: errText(e) }),
  });

  const upload = useMutation({
    mutationFn: (file: File) => teachersApi.uploadSample(b.id, file),
    onSuccess: () => { setMessage({ ok: true, text: 'تم رفع العينة' }); refresh(); },
    onError: e => setMessage({ ok: false, text: errText(e) }),
  });

  const removeSample = useMutation({
    mutationFn: (sampleId: number) => teachersApi.deleteSample(b.id, sampleId),
    onSuccess: refresh,
    onError: e => setMessage({ ok: false, text: errText(e) }),
  });

  const grade = findGrade(b.gradeLevel);
  const ready = b.isPublished;

  return (
    <article className="rounded-2xl border-2 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <header className="flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-extrabold text-slate-900 dark:text-white">{b.title}</h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
            <span>{grade?.label ?? b.gradeLevel ?? 'بدون صف'}</span>
            <span>طالب: {b.studentPrice ? b.studentPrice.toLocaleString('ar-EG') : '—'}</span>
            <span>مدرس: {b.teacherPrice ? b.teacherPrice.toLocaleString('ar-EG') : '—'}</span>
            <span>{b.samples.length.toLocaleString('ar-EG')} عينة</span>
            {!grade && b.gradeLevel && <span className="font-bold text-orange-700 dark:text-orange-300">⚠ الصف غير معروف</span>}
            {!ready && <span className="font-bold text-rose-700 dark:text-rose-300">⚠ غير منشورة في المتجر</span>}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={showcase}
          onClick={() => setShowcase(v => !v)}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl border-2 px-4 font-extrabold ${
            showcase
              ? 'border-emerald-700 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              : 'border-slate-400 bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {showcase ? <Eye size={18} aria-hidden /> : <EyeOff size={18} aria-hidden />}
          {showcase ? 'معروضة للمدرسين' : 'غير معروضة'}
        </button>

        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="inline-flex min-h-11 items-center gap-1 rounded-xl border-2 border-slate-300 px-4 font-bold text-slate-800 dark:border-slate-600 dark:text-slate-100"
        >
          {open ? 'إغلاق' : 'تعديل'} {open ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
        </button>
      </header>

      {open && (
        <div className="space-y-5 border-t-2 border-slate-100 p-4 dark:border-slate-800">
          <div className="grid gap-4 md:grid-cols-4">
            <label className="block">
              <span className={label}>سعر الطالب (جنيه)</span>
              <input className={input} inputMode="decimal" value={studentPrice} onChange={e => setStudentPrice(e.target.value)} placeholder="100" />
            </label>
            <label className="block">
              <span className={label}>سعر المدرس (جنيه)</span>
              <input className={input} inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} placeholder="250" />
            </label>
            <label className="block md:col-span-2">
              <span className={label}>ملخص موجّه للمدرس (اختياري)</span>
              <textarea className={`${input} py-2`} rows={2} maxLength={1000} value={summary} onChange={e => setSummary(e.target.value)} />
            </label>
          </div>

          <div>
            <section aria-label="العينات">
              <h3 className="mb-1 font-extrabold text-slate-900 dark:text-white">صور العينات ({b.samples.length} / 8)</h3>
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">صور جاهزة بالعلامة المائية (png أو jpg أو webp، حتى 2MB).</p>
              <div className="flex flex-wrap gap-3">
                {b.samples.map(sm => (
                  <div key={sm.id} className="relative">
                    <img src={getMediaUrl(sm.imageUrl)} alt="" className="h-28 w-20 rounded-lg border-2 border-slate-300 object-cover" />
                    <button type="button" aria-label="حذف العينة" onClick={() => window.confirm('حذف هذه العينة؟') && removeSample.mutate(sm.id)}
                      className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white">
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </div>
                ))}
                {b.samples.length < 8 && (
                  <label className="flex h-28 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-400 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <ImagePlus size={20} aria-hidden /> {upload.isPending ? 'جاري الرفع…' : 'رفع'}
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={upload.isPending}
                      onChange={e => { const f = e.target.files?.[0]; if (f) upload.mutate(f); e.target.value = ''; }} />
                  </label>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      <footer className="flex flex-wrap items-center gap-3 border-t-2 border-slate-100 p-4 dark:border-slate-800">
        <button type="button" onClick={() => save.mutate()} disabled={save.isPending}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-slate-900 bg-orange-500 px-5 font-extrabold text-slate-900 disabled:opacity-60">
          <Save size={18} aria-hidden /> {save.isPending ? 'جاري الحفظ…' : 'حفظ'}
        </button>
        {message && (
          <p role="status" className={`font-bold ${message.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{message.text}</p>
        )}
      </footer>
    </article>
  );
}

export default function TeacherShowcaseManager() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['admin-teacher-booklets'], queryFn: teachersApi.adminBooklets });
  const [filter, setFilter] = useState<'all' | 'on' | 'off'>('all');

  const items = (data ?? []).filter(b => (filter === 'all' ? true : filter === 'on' ? b.teacherShowcase : !b.teacherShowcase));
  const onCount = (data ?? []).filter(b => b.teacherShowcase).length;

  return (
    <div className="space-y-5" dir="rtl">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white">
          <GraduationCap aria-hidden /> مذكرات المدرسين
        </h1>
        <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-400">
          فعّل «معروضة للمدرسين» للمذكرات التي تريد ظهورها في صفحة «للمدرسين»، وحدّد سعر الطالب وسعر المدرس والعينات. كل مذكرة ملف PDF واحد يُرسل للطالب أو المدرس.
          يجب أن تكون المذكرة منشورة في المتجر، وحقل الصف فيها بصيغة{' '}
          <bdi dir="ltr" className="font-bold">{GRADES.map(g => g.key).join(' / ')}</bdi> أو الاسم الكامل للصف.
        </p>
      </header>

      <div role="group" aria-label="تصفية" className="flex flex-wrap gap-2">
        {([['all', `الكل (${(data ?? []).length})`], ['on', `المعروضة (${onCount})`], ['off', 'غير المعروضة']] as const).map(([k, text]) => (
          <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}
            className={`min-h-11 rounded-xl border-2 px-4 font-bold ${
              filter === k
                ? 'border-slate-900 bg-slate-900 text-white dark:border-teal-300 dark:bg-teal-300 dark:text-slate-900'
                : 'border-slate-300 text-slate-800 dark:border-slate-600 dark:text-slate-200'
            }`}>
            {text}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-slate-600 dark:text-slate-300">جاري التحميل…</p>}
      {isError && <p className="font-bold text-rose-700 dark:text-rose-300">تعذّر تحميل المذكرات.</p>}
      {!isLoading && items.length === 0 && <p className="text-slate-500 dark:text-slate-400">لا توجد مذكرات.</p>}
      <div className="space-y-3">{items.map(b => <BookletEditor key={b.id} b={b} />)}</div>
    </div>
  );
}
