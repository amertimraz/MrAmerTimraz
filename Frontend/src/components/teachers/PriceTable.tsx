import { MessageCircle, UserRound, GraduationCap } from 'lucide-react';
import { waLink } from '../../data/contact';

const fmt = (n: number) => `${n.toLocaleString('en-US')} جنيه`;

interface Props {
  bookletTitle: string;
  studentPrice?: number | null;
  teacherPrice?: number | null;
}

// Prices use Latin digits on purpose. Each booklet is a single PDF delivered either to a student or to a teacher. The two versions differ
// in whose details it carries, so each has its own description and its own WhatsApp message.
export default function PriceTable({ bookletTitle, studentPrice, teacherPrice }: Props) {
  const versions = [
    ...(studentPrice != null && studentPrice > 0
      ? [{
          key: 'student',
          label: 'نسخة الطالب',
          Icon: UserRound,
          detail: 'ملف PDF واحد، ببيانات مستر عامر تمراز كاملة.',
          price: studentPrice,
          message: `السلام عليكم، أريد شراء مذكرة «${bookletTitle}» نسخة الطالب PDF (ببيانات مستر عامر تمراز) بسعر ${studentPrice} جنيه.`,
          button: 'اطلب نسخة الطالب عبر واتساب',
        }]
      : []),
    ...(teacherPrice != null && teacherPrice > 0
      ? [{
          key: 'teacher',
          label: 'نسخة المدرس',
          Icon: GraduationCap,
          detail: 'ملف PDF واحد مخصص ببيانات المدرس كاملة (اسمك ورقمك واسم المدرسة أو السنتر).',
          price: teacherPrice,
          message: `السلام عليكم، أنا مدرس وأريد شراء مذكرة «${bookletTitle}» نسخة المدرس PDF المخصصة ببياناتي بسعر ${teacherPrice} جنيه. سأرسل لك بياناتي (الاسم ورقم الهاتف واسم المدرسة أو السنتر).`,
          button: 'اطلب نسخة المدرس عبر واتساب',
        }]
      : []),
  ];

  if (versions.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-400 p-4 text-center">
        <p className="font-bold text-slate-700 dark:text-slate-300">اسأل عن السعر: تواصل معنا وسنرد عليك.</p>
        <a
          href={waLink(`السلام عليكم، أريد السؤال عن سعر مذكرة «${bookletTitle}».`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-slate-900 bg-orange-500 px-5 font-extrabold text-slate-900 hover:bg-orange-400"
        >
          <MessageCircle size={18} aria-hidden /> تواصل عبر واتساب
        </a>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {versions.map(v => (
        <li key={v.key} className="rounded-2xl border-2 border-slate-900 bg-white p-4 dark:border-teal-300 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
                <v.Icon size={18} aria-hidden /> {v.label}
              </h3>
              <p className="mt-1 text-sm leading-7 text-slate-700 dark:text-slate-300">{v.detail}</p>
            </div>
            <p className="shrink-0 text-xl font-black text-teal-800 dark:text-teal-300">{fmt(v.price)}</p>
          </div>
          <a
            href={waLink(v.message)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-900 bg-orange-500 px-4 font-extrabold text-slate-900 hover:bg-orange-400 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-600"
          >
            <MessageCircle size={18} aria-hidden /> {v.button}
          </a>
        </li>
      ))}
    </ul>
  );
}
