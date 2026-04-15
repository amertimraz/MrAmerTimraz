import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Database, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function PrivacyPolicyPage() {
  const { isDark } = useAuthStore();

  const cardClass = isDark
    ? 'bg-white/5 border border-white/10 text-gray-300'
    : 'bg-white border border-gray-200 text-gray-700';

  return (
    <div dir="rtl" className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/15 text-green-500">
            <ShieldCheck size={28} />
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>سياسة الخصوصية</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
          </p>
        </div>

        <section className={`rounded-2xl p-6 space-y-4 ${cardClass}`}>
          <h2 className="text-xl font-bold flex items-center gap-2"><Database size={18} /> المعلومات التي نجمعها</h2>
          <p>نجمع المعلومات التي يقدّمها المستخدم عند التسجيل واستخدام المنصة مثل الاسم، البريد الإلكتروني، ونتائج الاختبارات بهدف تقديم تجربة تعليمية أفضل.</p>
          <p>قد نجمع بيانات استخدام عامة (مثل الصفحات التي تتم زيارتها) لتحسين جودة المحتوى والأداء.</p>
        </section>

        <section className={`rounded-2xl p-6 space-y-4 ${cardClass}`}>
          <h2 className="text-xl font-bold flex items-center gap-2"><Lock size={18} /> كيف نستخدم البيانات</h2>
          <ul className="list-disc pr-5 space-y-2">
            <li>إدارة حساب المستخدم وتقديم الخدمات التعليمية.</li>
            <li>متابعة تقدم الطالب ونتائج الاختبارات والشهادات.</li>
            <li>تحسين المنصة والمحتوى وتجربة الاستخدام.</li>
            <li>الالتزام بالمتطلبات القانونية وحماية المنصة من إساءة الاستخدام.</li>
          </ul>
        </section>

        <section className={`rounded-2xl p-6 space-y-4 ${cardClass}`}>
          <h2 className="text-xl font-bold">الإعلانات وملفات تعريف الارتباط</h2>
          <p>
            قد تستخدم المنصة خدمات إعلانية مثل Google AdSense، والتي يمكن أن تستخدم ملفات تعريف الارتباط لعرض إعلانات
            ملائمة لاهتمامات المستخدمين.
          </p>
          <p>
            يمكنك إدارة إعدادات الإعلانات من خلال حساب Google الخاص بك، أو التحكم في ملفات تعريف الارتباط من إعدادات المتصفح.
          </p>
        </section>

        <section className={`rounded-2xl p-6 space-y-4 ${cardClass}`}>
          <h2 className="text-xl font-bold flex items-center gap-2"><Mail size={18} /> التواصل</h2>
          <p>لأي استفسار حول الخصوصية أو البيانات، يمكن التواصل عبر صفحة التواصل الرسمية في المنصة.</p>
          <Link to="/contact" className="inline-flex text-green-500 font-bold hover:underline">الانتقال إلى صفحة التواصل</Link>
        </section>
      </div>
    </div>
  );
}
