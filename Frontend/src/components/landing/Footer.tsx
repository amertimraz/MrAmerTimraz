import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Youtube, Instagram } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Footer() {
  const { isDark } = useAuthStore();

  return (
    <footer
      dir="rtl"
      style={{
        background: isDark ? 'rgba(5,8,15,0.95)' : 'rgba(241,245,249,0.95)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
        transition: 'background 0.3s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-teal-500/40 shadow-md">
                <img src="/teacher-avatar.webp" alt="عامر تمراز" className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const p = e.currentTarget.parentElement!;
                    p.className = 'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white';
                    p.style.background = 'linear-gradient(135deg,#0d9488,#115e59)';
                    e.currentTarget.replaceWith(document.createTextNode('عا'));
                  }}
                />
              </div>
              <div>
                <p className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>منصة مستر عامر</p>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">التعليم الإلكتروني</p>
              </div>
            </div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              منصة تعليمية إلكترونية متكاملة تقدم دروساً في التقنية والحاسب والبرمجة لجميع المراحل الدراسية.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { href: 'https://www.facebook.com/Mr.AmerTimraz', label: 'فيسبوك', bg: 'bg-blue-700 hover:bg-blue-800', icon: <Facebook size={18} /> },
                { href: 'https://www.youtube.com/@AmerTimraz', label: 'يوتيوب', bg: 'bg-red-700 hover:bg-red-800', icon: <Youtube size={18} /> },
                { href: 'https://instagram.com', label: 'إنستجرام', bg: 'bg-pink-700 hover:bg-pink-800', icon: <Instagram size={18} /> },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                  className={`w-11 h-11 ${s.bg} rounded-lg flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2`}>
                  <span className="text-white">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`font-bold mb-5 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>روابط سريعة</h3>
            <ul className="space-y-0.5 lg:space-y-3 text-sm">
              {[
                { to: '/',        label: 'الرئيسية' },
                { to: '/courses', label: 'الدروس' },
                { to: '/reviews', label: 'المراجعات' },
                { to: '/services', label: 'خدماتي' },
                { to: '/about',   label: 'عن مستر' },
                { to: '/contact', label: 'تواصل معنا' },
                { to: '/privacy-policy', label: 'سياسة الخصوصية' },
                { to: '/terms', label: 'الشروط والأحكام' },
                { to: '/login',   label: 'تسجيل الدخول' },
                { to: '/register',label: 'إنشاء حساب' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to}
                    className={`transition-colors flex items-center gap-2 min-h-11 lg:min-h-0 ${isDark ? 'text-gray-400 hover:text-teal-300' : 'text-gray-600 hover:text-teal-700'}`}
                  >
                    <span className="w-1 h-1 bg-teal-500 rounded-full inline-block" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className={`font-bold mb-5 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>المواد الدراسية</h3>
            <ul className="space-y-0.5 lg:space-y-3 text-sm">
              {['تقنية المعلومات - ابتدائي', 'الحاسب الآلي - إعدادي', 'البرمجة - أول ثانوي'].map(course => (
                <li key={course} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-teal-500 rounded-full inline-block" />
                  <Link to="/courses"
                    className={`transition-colors inline-flex items-center min-h-11 lg:min-h-0 ${isDark ? 'text-gray-400 hover:text-teal-300' : 'text-gray-600 hover:text-teal-700'}`}
                  >
                    {course}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className={`font-bold mb-5 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>تواصل معنا</h3>
            <ul className="space-y-0.5 lg:space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-teal-600 dark:text-teal-300 shrink-0" />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>amertimraz@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-teal-600 dark:text-teal-300 shrink-0" />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>01096066818</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-teal-600 dark:text-teal-300 shrink-0 mt-0.5" />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>مصر</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${isDark ? 'text-gray-600 border-t border-gray-800' : 'text-gray-500 border-t border-gray-200'}`}
        >
          <p>© {new Date().getFullYear()} منصة مستر عامر. جميع الحقوق محفوظة.</p>
          <p>صُمِّمت بـ ❤️ للطلاب</p>
        </div>
      </div>
    </footer>
  );
}
