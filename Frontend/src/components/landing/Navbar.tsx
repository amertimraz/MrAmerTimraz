import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Menu, X, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ring-offset-white dark:ring-offset-[#0d1117]';

function TeacherLogo({ isDark }: { isDark: boolean }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white select-none shadow-lg"
        style={{ background: 'linear-gradient(135deg,#0d9488,#115e59)' }}
      >
        عا
      </div>
    );
  }
  return (
    <div className={`w-11 h-11 rounded-xl overflow-hidden shadow-lg border-2 ${isDark ? 'border-teal-400/50' : 'border-teal-600/60'}`}>
      <img
        src="/teacher-avatar.webp"
        width={44}
        height={44}
        alt="عامر تمراز"
        className="w-full h-full object-cover object-top"
        onError={() => setErr(true)}
      />
    </div>
  );
}

const navLinks = [
  { to: '/',        label: 'الرئيسية'   },
  { to: '/courses', label: 'الدروس'     },
  { to: '/reviews', label: 'المراجعات'  },
  { to: '/assessments', label: 'التقييمات' },
  { to: '/teachers', label: 'للمدرسين' },
  { to: '/library', label: 'المكتبة'    },
  { to: '/services', label: 'خدماتي'    },
  { to: '/about',   label: 'عن مستر' },
  { to: '/contact', label: 'تواصل معنا' },
];


export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleDark, user } = useAuthStore();

  const dashPath = user?.role === 'Admin' ? '/admin' : user?.role === 'Teacher' ? '/teacher' : '/student';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solidBg = isDark
    ? 'bg-[#0d1117]/95 backdrop-blur-md border-b border-white/5'
    : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/60';

  const headerClass = `fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
    scrolled ? solidBg : 'bg-transparent'
  }`;

  const linkBase = (isActive: boolean) =>
    `px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${FOCUS} ${
      isActive
        ? isDark
          ? 'bg-teal-400/15 text-teal-300'
          : 'bg-teal-600/10 text-teal-800'
        : isDark
          ? 'text-white/75 hover:text-white hover:bg-white/5'
          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-900/5'
    }`;

  const primaryBtn =
    `flex items-center gap-2 min-h-11 px-5 rounded-xl text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-lg shadow-teal-900/20 transition-colors ${FOCUS}`;

  const iconBtn = `grid place-items-center min-h-11 min-w-11 rounded-xl transition-colors ${FOCUS} ${
    isDark ? 'text-gray-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-900/5'
  }`;

  return (
    <header dir="rtl" className={headerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <NavLink to="/" className={`flex items-center gap-3 rounded-xl group ${FOCUS}`}>
            <TeacherLogo isDark={isDark} />
            <div className="hidden sm:block leading-none">
              <p className={`font-bold text-sm transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                MR. AMER TIMRAZ
              </p>
              <p className={`text-xs mt-0.5 font-semibold ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>منصة تعليمية</p>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav aria-label="القائمة الرئيسية" className="hidden xl:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => linkBase(isActive)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden xl:flex items-center gap-3">

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDark}
              aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              className={iconBtn}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <button onClick={() => navigate(dashPath)} className={primaryBtn}>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <LayoutDashboard size={15} />
                لوحة التحكم
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className={`flex items-center gap-2 min-h-11 px-5 rounded-xl text-sm font-bold border-2 transition-colors ${FOCUS} ${
                    isDark
                      ? 'border-white/20 text-white/90 hover:bg-white/5'
                      : 'border-slate-300 text-slate-800 hover:bg-slate-900/5'
                  }`}
                >
                  <LogIn size={15} />
                  دخول
                </button>
                <button onClick={() => navigate('/register')} className={primaryBtn}>
                  <UserPlus size={15} />
                  سجّل الآن
                </button>
              </>
            )}
          </div>

          {/* Mobile actions */}
          <div className="xl:hidden flex items-center gap-1">
            <button
              onClick={toggleDark}
              aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              className={iconBtn}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setOpen(v => !v)}
              aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className={iconBtn}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`xl:hidden overflow-hidden transition-all duration-300 motion-reduce:transition-none ${
          isDark
            ? 'bg-[#0d1117]/98 border-t border-white/5'
            : 'bg-white border-t border-gray-100 shadow-xl'
        } ${open ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'}`}
        {...(open ? {} : { inert: true })}
      >
        <nav aria-label="القائمة الرئيسية للجوال" className="px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block min-h-11 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${FOCUS} ${
                  isActive
                    ? isDark
                      ? 'bg-teal-400/15 text-teal-300'
                      : 'bg-teal-600/10 text-teal-800'
                    : isDark
                      ? 'text-white/75 hover:bg-white/5'
                      : 'text-slate-700 hover:bg-slate-900/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-3 grid grid-cols-2 gap-3">
            {user ? (
              <button
                onClick={() => { navigate(dashPath); setOpen(false); }}
                className={`col-span-2 min-h-11 px-4 rounded-xl text-white bg-teal-700 hover:bg-teal-800 font-bold text-sm text-center flex items-center justify-center gap-2 ${FOCUS}`}
              >
                <LayoutDashboard size={16} />
                لوحة التحكم — {user.name}
              </button>
            ) : (
              <>
                <button
                  onClick={() => { navigate('/login'); setOpen(false); }}
                  className={`min-h-11 px-4 rounded-xl border-2 font-bold text-sm text-center transition-colors ${FOCUS} ${
                    isDark ? 'border-white/20 text-white/90' : 'border-slate-300 text-slate-800'
                  }`}
                >
                  دخول
                </button>
                <button
                  onClick={() => { navigate('/register'); setOpen(false); }}
                  className={`min-h-11 px-4 rounded-xl text-white bg-teal-700 hover:bg-teal-800 font-bold text-sm text-center ${FOCUS}`}
                >
                  سجّل الآن
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
