import { Video, FileText, BarChart2, ShieldCheck } from 'lucide-react';

const features = [
  { icon: <Video size={22} />,       title: 'فيديوهات تعليمية',  text: 'شاهد الدروس في أي وقت ومن أي مكان.' },
  { icon: <FileText size={22} />,    title: 'اختبارات ومراجعات', text: 'صح/خطأ واختيار من متعدد وأكمل وترتيب.' },
  { icon: <BarChart2 size={22} />,   title: 'تتبع التقدم',       text: 'راقب أداءك ونتائجك أولاً بأول.' },
  { icon: <ShieldCheck size={22} />, title: 'بيئة آمنة',         text: 'خصوصية بيانات الطلاب والأولياء محمية.' },
];

export default function FeaturesSection() {
  return (
    <section dir="rtl" aria-labelledby="features-heading" className="bg-teal-900 py-14 text-white dark:bg-slate-900 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 id="features-heading" className="text-center text-2xl font-black sm:text-3xl">
          لماذا تختار منصتنا؟
        </h2>

        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
          {features.map(f => (
            <li key={f.title} className="flex flex-col items-center text-center sm:items-start sm:text-start">
              <span className="grid size-12 place-items-center rounded-2xl bg-teal-400 text-slate-900" aria-hidden>
                {f.icon}
              </span>
              <h3 className="mt-4 text-lg font-extrabold">{f.title}</h3>
              <p className="mt-1 text-base leading-7 text-teal-50 dark:text-slate-300">{f.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
