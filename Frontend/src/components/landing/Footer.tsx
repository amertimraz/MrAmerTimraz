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
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-green-500/40 shadow-md">
                <img src="/teacher2.png" alt="عامر تمراز" className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const p = e.currentTarget.parentElement!;
                    p.className = 'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white';
                    p.style.background = 'linear-gradient(135deg,#22c55e,#15803d)';
                    e.currentTarget.replaceWith(document.createTextNode('عا'));
                  }}
                />
              </div>
              <div>
                <p className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>منصة مستر عامر</p>
                <p className="text-xs text-green-500">التعليم الإلكتروني</p>
              </div>
            </div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              منصة تعليمية إلكترونية متكاملة تقدم دروساً في التقنية والحاسب والبرمجة لجميع المراحل الدراسية.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { href: 'https://www.facebook.com/Mr.AmerTimraz', bg: 'bg-blue-600 hover:bg-blue-700', icon: <Facebook size={18} /> },
                { href: 'https://www.youtube.com/@AmerTimraz',  bg: 'bg-red-600 hover:bg-red-700',   icon: <Youtube size={18} /> },
                { href: 'https://instagram.com',bg: 'bg-pink-600 hover:bg-pink-700', icon: <Instagram size={18} /> },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer"
                  className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center transition-colors`}>
                  <span className="text-white">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`font-bold mb-5 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>روابط سريعة</h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/',        label: 'الرئيسية' },
                { to: '/courses', label: 'الدروس' },
                { to: '/about',   label: 'عن مستر' },
                { to: '/contact', label: 'تواصل معنا' },
                { to: '/login',   label: 'تسجيل الدخول' },
                { to: '/register',label: 'إنشاء حساب' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to}
                    className={`transition-colors flex items-center gap-2 ${isDark ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-green-600'}`}
                  >
                    <span className="w-1 h-1 bg-green-500 rounded-full inline-block" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className={`font-bold mb-5 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>المواد الدراسية</h3>
            <ul className="space-y-3 text-sm">
              {['تقنية المعلومات - ابتدائي', 'الحاسب الآلي - إعدادي', 'البرمجة - أول ثانوي'].map(course => (
                <li key={course} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full inline-block" />
                  <Link to="/courses"
                    className={`transition-colors ${isDark ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-green-600'}`}
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
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-green-500 shrink-0" />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>amer.timraz@school.edu</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-green-500 shrink-0" />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>01096066818</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-green-500 shrink-0 mt-0.5" />
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
