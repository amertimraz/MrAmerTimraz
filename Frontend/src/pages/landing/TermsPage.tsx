import { Link } from 'react-router-dom';
import { FileText, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function TermsPage() {
  const { isDark } = useAuthStore();

  const cardClass = isDark
    ? 'bg-white/5 border border-white/10 text-gray-300'
    : 'bg-white border border-gray-200 text-gray-700';

  return (
    <div dir="rtl" className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/15 text-blue-500">
            <FileText size={28} />
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>الشروط والأحكام</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
          </p>
        </div>

        <section className={`rounded-2xl p-6 space-y-4 ${cardClass}`}>
          <h2 className="text-xl font-bold flex items-center gap-2"><Scale size={18} /> استخدام المنصة</h2>
          <ul className="list-disc pr-5 space-y-2">
            <li>يُسمح باستخدام المنصة للأغراض التعليمية فقط.</li>
            <li>يلتزم المستخدم بإدخال بيانات صحيحة وعدم انتحال شخصية الغير.</li>
            <li>يُمنع أي استخدام قد يضر المنصة أو يعطّل خدماتها.</li>
          </ul>
        </section>

        <section className={`rounded-2xl p-6 space-y-4 ${cardClass}`}>
          <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck size={18} /> الملكية الفكرية</h2>
          <p>المحتوى التعليمي الموجود داخل المنصة (الدروس، الاختبارات، الملفات، التصميمات) مملوك للمنصة أو لمالكيه الأصليين، ولا يجوز إعادة نشره أو بيعه بدون إذن.</p>
        </section>

        <section className={`rounded-2xl p-6 space-y-4 ${cardClass}`}>
          <h2 className="text-xl font-bold flex items-center gap-2"><AlertTriangle size={18} /> إخلاء المسؤولية</h2>
          <p>نسعى لتقديم خدمة مستقرة ودقيقة، لكن قد تحدث أخطاء تقنية أو توقف مؤقت. المنصة غير مسؤولة عن أي خسائر غير مباشرة تنتج عن انقطاع الخدمة.</p>
          <p>يحق لإدارة المنصة تحديث أو تعديل هذه الشروط في أي وقت، ويعتبر استمرار الاستخدام موافقة على التحديثات.</p>
        </section>

        <section className={`rounded-2xl p-6 space-y-4 ${cardClass}`}>
          <h2 className="text-xl font-bold">روابط مهمة</h2>
          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link to="/privacy-policy" className="text-green-500 hover:underline">سياسة الخصوصية</Link>
            <Link to="/contact" className="text-green-500 hover:underline">تواصل معنا</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
