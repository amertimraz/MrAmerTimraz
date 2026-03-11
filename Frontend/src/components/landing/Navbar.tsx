import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Menu, X, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

function TeacherLogo({ isDark }: { isDark: boolean }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white select-none shadow-lg"
        style={{ background: 'linear-gradient(135deg,#22c55e,#15803d)' }}
      >
        عا
      </div>
    );
  }
  return (
    <div className={`w-10 h-10 rounded-xl overflow-hidden shadow-lg border-2 ${isDark ? 'border-green-500/40' : 'border-green-500/50'}`}>
      <img
        src="/teacher2.png"
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
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solidBg = isDark
    ? 'bg-[#0d1117]/95 backdrop-blur-md border-b border-white/5'
    : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/60';

  const headerClass = `fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
    scrolled ? solidBg : 'bg-transparent'
  }`;

  const linkBase = (isActive: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-green-500/15 text-green-500'
        : isDark
          ? 'text-white/70 hover:text-white hover:bg-white/5'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <header dir="rtl" className={headerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <TeacherLogo isDark={isDark} />
            <div className="hidden sm:block leading-none">
              <p className={`font-bold text-sm transition-colors ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                MR. AMER TIMRAZ
              </p>
              <p className="text-green-500 text-xs mt-0.5">منصة تعليمية</p>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
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
          <div className="hidden md:flex items-center gap-3">

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDark}
              title={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              className={`p-2 rounded-xl transition-colors ${
                isDark
                  ? 'text-gray-400 hover:bg-white/10'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <button
                onClick={() => navigate(dashPath)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-shadow"
                style={{ background: '#22c55e' }}
              >
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    isDark
                      ? 'border-white/15 text-white/80 hover:bg-white/5'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LogIn size={15} />
                  دخول
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-shadow"
                  style={{ background: '#22c55e' }}
                >
                  <UserPlus size={15} />
                  سجّل الآن
                </button>
              </>
            )}
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDark}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-green-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setOpen(v => !v)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isDark
            ? 'bg-[#0d1117]/98 border-t border-white/5'
            : 'bg-white border-t border-gray-100 shadow-xl'
        } ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <nav className="px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-green-500/15 text-green-500'
                    : isDark
                      ? 'text-white/70 hover:bg-white/5'
                      : 'text-gray-700 hover:bg-gray-50'
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
                className="col-span-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm text-center flex items-center justify-center gap-2"
                style={{ background: '#22c55e' }}
              >
                <LayoutDashboard size={16} />
                لوحة التحكم — {user.name}
              </button>
            ) : (
              <>
            <button
              onClick={() => { navigate('/login'); setOpen(false); }}
              className={`px-4 py-2.5 rounded-xl border font-medium text-sm text-center transition-colors ${
                isDark ? 'border-white/15 text-white/80' : 'border-gray-300 text-gray-700'
              }`}
            >
              دخول
            </button>
            <button
              onClick={() => { navigate('/register'); setOpen(false); }}
              className="px-4 py-2.5 rounded-xl text-white font-medium text-sm text-center"
              style={{ background: '#22c55e' }}
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
