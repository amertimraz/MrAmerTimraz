import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { teachersApi, type InquiryPayload } from '../../api/teachers';
import { GOVERNORATES, findGrade } from '../../data/grades';

interface Props {
  bookletId?: number | null;
  bookletTitle?: string;
  gradeLevel?: string | null;
  subject?: string | null;
}

const inputCls =
  'min-h-11 w-full rounded-xl border-2 border-slate-900 bg-white px-3 text-base text-slate-900 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-600 dark:border-teal-300 dark:bg-slate-800 dark:text-white';

export default function InquiryForm({ bookletId, bookletTitle, gradeLevel, subject }: Props) {
  const [form, setForm] = useState({
    name: '', phone: '', governorate: '', quantity: '10', notes: '', website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const mutation = useMutation({
    mutationFn: (payload: InquiryPayload) => teachersApi.sendInquiry(payload),
    onError: (err: any) => {
      const data = err?.response?.data;
      if (err?.response?.status === 429) setGeneralError('أرسلت طلبات كثيرة، حاول مرة أخرى بعد قليل.');
      else if (data?.errors) setErrors(data.errors);
      else setGeneralError('تعذّر إرسال الطلب. حاول مرة أخرى أو تواصل معنا عبر واتساب.');
    },
  });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    const grade = findGrade(gradeLevel);
    mutation.mutate({
      bookletId: bookletId ?? null,
      name: form.name,
      phone: form.phone,
      governorate: form.governorate,
      gradeLevel: grade?.label ?? gradeLevel ?? undefined,
      subject: subject ?? grade?.subject,
      quantity: Number(form.quantity),
      notes: form.notes,
      website: form.website,
    });
  };

  if (mutation.isSuccess) {
    return (
      <div role="status" className="rounded-2xl border-2 border-emerald-700 bg-emerald-50 p-6 text-center dark:bg-slate-900">
        <CheckCircle2 className="mx-auto text-emerald-700" size={40} aria-hidden />
        <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">وصل طلبك بنجاح</h3>
        <p className="mt-1 text-slate-700 dark:text-slate-300">سنتواصل معك قريباً على رقمك. يمكنك أيضاً مراسلتنا مباشرة:</p>
        {mutation.data?.whatsAppUrl && (
          <a
            href={mutation.data.whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-slate-900 bg-orange-500 px-5 font-extrabold text-slate-900 hover:bg-orange-400"
          >
            <MessageCircle size={18} aria-hidden /> تواصل عبر واتساب
          </a>
        )}
      </div>
    );
  }

  const field = (id: string, label: string, el: React.ReactNode) => (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-extrabold text-slate-900 dark:text-white">{label}</label>
      {el}
      {errors[id] && <p role="alert" className="mt-1 text-sm font-bold text-rose-700 dark:text-rose-300">{errors[id]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border-2 border-slate-900 bg-white p-5 dark:border-teal-300 dark:bg-slate-900">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">اطلب عرض سعر</h2>
      {bookletTitle && <p className="text-sm font-bold text-teal-800 dark:text-teal-300">المذكرة: {bookletTitle}</p>}

      {field('name', 'الاسم', <input id="name" className={inputCls} value={form.name} onChange={set('name')} autoComplete="name" required />)}
      {field('phone', 'رقم الهاتف', (
        <input id="phone" dir="ltr" inputMode="tel" className={`${inputCls} text-left`} placeholder="01012345678"
          value={form.phone} onChange={set('phone')} autoComplete="tel" required />
      ))}
      {field('governorate', 'المحافظة', (
        <select id="governorate" className={inputCls} value={form.governorate} onChange={set('governorate')} required>
          <option value="">اختر المحافظة</option>
          {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      ))}
      {field('quantity', 'الكمية المطلوبة', (
        <input id="quantity" type="number" min={1} max={5000} inputMode="numeric" className={inputCls}
          value={form.quantity} onChange={set('quantity')} required />
      ))}
      {field('notes', 'ملاحظات (اختياري)', (
        <textarea id="notes" rows={3} maxLength={1000} className={`${inputCls} py-2`} value={form.notes} onChange={set('notes')} />
      ))}

      {/* Honeypot: hidden from people, bots fill it. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">اترك هذا الحقل فارغاً</label>
        <input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
      </div>

      {generalError && <p role="alert" className="font-bold text-rose-700 dark:text-rose-300">{generalError}</p>}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-900 bg-orange-500 px-5 font-extrabold text-slate-900 hover:bg-orange-400 disabled:opacity-60"
      >
        <Send size={18} aria-hidden /> {mutation.isPending ? 'جاري الإرسال…' : 'إرسال الطلب'}
      </button>
    </form>
  );
}
