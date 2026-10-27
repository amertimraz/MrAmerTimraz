const fmt = (n: number) => `${n.toLocaleString('ar-EG')} جنيه`;

interface Props {
  studentPrice?: number | null;
  teacherPrice?: number | null;
}

// Each booklet is a single PDF delivered either to a student or to a teacher.
export default function PriceTable({ studentPrice, teacherPrice }: Props) {
  const rows = [
    ...(studentPrice != null && studentPrice > 0 ? [{ label: 'نسخة الطالب', price: studentPrice }] : []),
    ...(teacherPrice != null && teacherPrice > 0 ? [{ label: 'نسخة المدرس', price: teacherPrice }] : []),
  ];

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border-2 border-dashed border-slate-400 p-4 text-center font-bold text-slate-700 dark:text-slate-300">
        اسأل عن السعر: تواصل معنا وسنرد عليك.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-slate-900 bg-white dark:border-teal-300 dark:bg-slate-900">
      <table className="w-full text-right">
        <caption className="bg-teal-700 px-4 py-2 text-right text-base font-black text-white">الأسعار</caption>
        <thead className="sr-only">
          <tr><th scope="col">النسخة</th><th scope="col">السعر</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.label} className="border-t border-slate-200 dark:border-slate-700">
              <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{r.label}</td>
              <td className="px-4 py-3 text-left text-lg font-black text-teal-800 dark:text-teal-300">{fmt(r.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
