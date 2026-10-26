import type { QuantityOffer } from '../../api/teachers';

const fmt = (n: number) => `${n.toLocaleString('ar-EG')} جنيه`;

export default function QuantityTable({ basePrice, offers }: { basePrice?: number | null; offers: QuantityOffer[] }) {
  if (basePrice == null && offers.length === 0) {
    return (
      <p className="rounded-xl border-2 border-dashed border-slate-400 p-4 text-center font-bold text-slate-700 dark:text-slate-300">
        اسأل عن السعر: أرسل طلب عرض سعر وسنرد عليك بأفضل سعر.
      </p>
    );
  }
  const rows = [
    ...(basePrice != null ? [{ label: 'نسخة واحدة أو أكثر', price: basePrice }] : []),
    ...offers.map(o => ({ label: `من ${o.minQuantity.toLocaleString('ar-EG')} نسخة`, price: o.unitPrice })),
  ];
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-slate-900 bg-white dark:border-teal-300 dark:bg-slate-900">
      <table className="w-full text-right">
        <caption className="bg-teal-700 px-4 py-2 text-right text-base font-black text-white">أسعار المدرسين</caption>
        <thead className="sr-only">
          <tr><th scope="col">الكمية</th><th scope="col">سعر النسخة</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
              <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{r.label}</td>
              <td className="px-4 py-3 text-left text-lg font-black text-teal-800 dark:text-teal-300">{fmt(r.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
