import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, ImagePlus, Plus, Save, Trash2, GraduationCap } from 'lucide-react';
import { teachersApi, type AdminTeacherBooklet, type QuantityOffer } from '../../api/teachers';
import { getMediaUrl } from '../../api/client';
import { GRADES, findGrade } from '../../data/grades';

const input =
  'min-h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white';

function BookletEditor({ b }: { b: AdminTeacherBooklet }) {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-teacher-booklets'] });

  const [showcase, setShowcase] = useState(b.teacherShowcase);
  const [summary, setSummary] = useState(b.teacherSummary ?? '');
  const [price, setPrice] = useState(b.teacherPrice != null ? String(b.teacherPrice) : '');
  const [offers, setOffers] = useState<{ min: string; price: string }[]>(
    b.quantityOffers.map(o => ({ min: String(o.minQuantity), price: String(o.unitPrice) }))
  );
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setShowcase(b.teacherShowcase);
    setSummary(b.teacherSummary ?? '');
    setPrice(b.teacherPrice != null ? String(b.teacherPrice) : '');
    setOffers(b.quantityOffers.map(o => ({ min: String(o.minQuantity), price: String(o.unitPrice) })));
  }, [b]);

  const errText = (e: any) => (typeof e?.response?.data === 'string' ? e.response.data : 'حدث خطأ، حاول مرة أخرى');

  const save = useMutation({
    mutationFn: async () => {
      const parsed: QuantityOffer[] = offers
        .filter(o => o.min.trim() && o.price.trim())
        .map(o => ({ minQuantity: Number(o.min), unitPrice: Number(o.price) }));
      await teachersApi.updateBooklet(b.id, {
        teacherShowcase: showcase,
        teacherSummary: summary || null,
        teacherPrice: price.trim() === '' ? null : Number(price),
      });
      await teachersApi.replaceOffers(b.id, parsed);
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
    <article className="rounded-2xl border-2 border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{b.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {grade?.label ?? b.gradeLevel ?? 'بدون صف'}
            {!grade && b.gradeLevel && <span className="mr-2 font-bold text-orange-700">⚠ اكتب الصف بصيغة Prim4 … Sec2</span>}
            {!ready && <span className="mr-2 font-bold text-rose-700">⚠ المذكرة غير منشورة في المتجر</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowcase(v => !v)}
          aria-pressed={showcase}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl border-2 px-4 font-extrabold ${
            showcase ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-slate-400 bg-white text-slate-700'
          }`}
        >
          {showcase ? <Eye size={18} /> : <EyeOff size={18} />} {showcase ? 'معروضة للمدرسين' : 'غير معروضة'}
        </button>
      </header>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-bold">سعر المدرس (جنيه)</span>
          <input className={input} inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} placeholder="مثال: 45" />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1 block text-sm font-bold">ملخص موجّه للمدرس (اختياري، حتى 1000 حرف)</span>
          <textarea className={`${input} py-2`} rows={3} maxLength={1000} value={summary} onChange={e => setSummary(e.target.value)} />
        </label>
      </div>

      <section className="mt-4" aria-label="عروض الكميات">
        <h3 className="mb-2 font-extrabold">عروض الكميات</h3>
        {offers.length === 0 && <p className="text-sm text-slate-500">لا توجد عروض.</p>}
        <div className="space-y-2">
          {offers.map((o, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input className={`${input} max-w-[9rem]`} inputMode="numeric" placeholder="من كمية" value={o.min}
                onChange={e => setOffers(os => os.map((x, j) => (j === i ? { ...x, min: e.target.value } : x)))} />
              <input className={`${input} max-w-[9rem]`} inputMode="decimal" placeholder="سعر النسخة" value={o.price}
                onChange={e => setOffers(os => os.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} />
              <button type="button" aria-label="حذف العرض" onClick={() => setOffers(os => os.filter((_, j) => j !== i))}
                className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-rose-300 text-rose-700">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setOffers(os => [...os, { min: '', price: '' }])}
          className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-dashed border-slate-400 px-4 font-bold">
          <Plus size={16} /> إضافة عرض
        </button>
      </section>

      <section className="mt-4" aria-label="العينات">
        <h3 className="mb-2 font-extrabold">صور العينات ({b.samples.length} / 8)</h3>
        <p className="mb-2 text-sm text-slate-500">ارفع صوراً جاهزة بالعلامة المائية (png أو jpg أو webp، حتى 2MB للصورة).</p>
        <div className="flex flex-wrap gap-3">
          {b.samples.map(s => (
            <div key={s.id} className="relative">
              <img src={getMediaUrl(s.imageUrl)} alt="" className="h-28 w-20 rounded-lg border-2 border-slate-300 object-cover" />
              <button type="button" aria-label="حذف العينة" onClick={() => window.confirm('حذف هذه العينة؟') && removeSample.mutate(s.id)}
                className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {b.samples.length < 8 && (
            <label className="flex h-28 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-400 text-xs font-bold text-slate-600">
              <ImagePlus size={20} /> {upload.isPending ? 'جاري الرفع…' : 'رفع'}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={upload.isPending}
                onChange={e => { const f = e.target.files?.[0]; if (f) upload.mutate(f); e.target.value = ''; }} />
            </label>
          )}
        </div>
      </section>

      <footer className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => save.mutate()} disabled={save.isPending}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-slate-900 bg-orange-500 px-5 font-extrabold text-slate-900 disabled:opacity-60">
          <Save size={18} /> {save.isPending ? 'جاري الحفظ…' : 'حفظ'}
        </button>
        {message && (
          <p role="status" className={`font-bold ${message.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{message.text}</p>
        )}
      </footer>
    </article>
  );
}

export default function TeacherShowcaseManager() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['admin-teacher-booklets'], queryFn: teachersApi.adminBooklets });
  const [filter, setFilter] = useState<'all' | 'on' | 'off'>('all');

  const items = (data ?? []).filter(b => (filter === 'all' ? true : filter === 'on' ? b.teacherShowcase : !b.teacherShowcase));

  return (
    <div className="space-y-5" dir="rtl">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white">
          <GraduationCap aria-hidden /> مذكرات المدرسين
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          حدّد المذكرات التي تظهر في صفحة «للمدرسين»، وسعرها وعروض الكميات وعيناتها. يجب أن تكون المذكرة منشورة في المتجر،
          وحقل الصف فيها بصيغة {GRADES.map(g => g.key).join(' / ')}.
        </p>
      </header>

      <div role="group" aria-label="تصفية" className="flex flex-wrap gap-2">
        {([['all', 'الكل'], ['on', 'المعروضة'], ['off', 'غير المعروضة']] as const).map(([k, label]) => (
          <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}
            className={`min-h-11 rounded-xl border-2 px-4 font-bold ${filter === k ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {isLoading && <p>جاري التحميل…</p>}
      {isError && <p className="font-bold text-rose-700">تعذّر تحميل المذكرات.</p>}
      {!isLoading && items.length === 0 && <p className="text-slate-500">لا توجد مذكرات.</p>}
      <div className="space-y-4">{items.map(b => <BookletEditor key={b.id} b={b} />)}</div>
    </div>
  );
}
