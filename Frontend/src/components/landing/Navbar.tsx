import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LayoutDashboard, ChevronLeft } from 'lucide-react';
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
    <div className={`w-11 h-11 rounded-xl overflow-hidden shadow-2xl border-2 ${isDark ? 'border-green-500/40' : 'border-green-500/50'} group-hover:scale-110 transition-transform duration-300`}>
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
  { to: '/library', label: 'المكتبة'    },
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
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headerClass = `fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
    scrolled 
      ? isDark ? 'py-2 glass-dark shadow-2xl' : 'py-2 glass shadow-lg'
      : 'py-4 bg-transparent'
  }`;

  return (
    <header dir="rtl" className={headerClass}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-4 group">
            <TeacherLogo isDark={isDark} />
            <div className="hidden sm:block leading-none">
              <p className={`font-black text-lg transition-colors tracking-tight ${
                isDark || !scrolled ? 'text-white' : 'text-gray-900'
              }`}>
                MR. AMER <span className="text-green-500">TIMRAZ</span>
              </p>
              <p className="text-green-500/80 text-[10px] font-bold uppercase tracking-widest mt-0.5">Educational Platform</p>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 glass-dark p-1 rounded-2xl border-white/5">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : (isDark || !scrolled)
                        ? 'text-white/70 hover:text-white hover:bg-white/5'
                        : 'text-gray-900/70 hover:text-gray-900 hover:bg-black/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDark}
              className={`p-2.5 rounded-2xl transition-all duration-300 border border-white/10 ${
                isDark || !scrolled
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <button
                onClick={() => navigate(dashPath)}
                className="group flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-black text-white shadow-2xl hover:scale-105 transition-all bg-green-500 shadow-green-500/20"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-black ring-2 ring-white/10">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>لوحة التحكم</span>
                <LayoutDashboard size={16} className="group-hover:rotate-12 transition-transform" />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold border transition-all ${
                    isDark || !scrolled
                      ? 'border-white/15 text-white hover:bg-white/5'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  دخول
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 rounded-2xl text-sm font-black text-white shadow-2xl hover:scale-105 transition-all bg-green-500 shadow-green-500/20"
                >
                  سجّل الآن
                </button>
              </div>
            )}
          </div>

          {/* Mobile actions */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={toggleDark}
              className="p-2.5 rounded-xl glass-dark text-green-400"
            >
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setOpen(v => !v)}
              className={`p-2.5 rounded-xl transition-all ${
                isDark || !scrolled ? 'text-white' : 'text-gray-900'
              }`}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-x-0 top-[72px] mx-6 p-6 rounded-[32px] glass-dark border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] transition-all duration-500 transform ${
          open ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <nav className="space-y-2">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-green-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {link.label}
              <ChevronLeft size={16} />
            </NavLink>
          ))}
          <div className="pt-4 grid grid-cols-2 gap-3">
            {user ? (
              <button
                onClick={() => { navigate(dashPath); setOpen(false); }}
                className="col-span-2 p-5 rounded-2xl bg-green-500 text-white font-black text-sm flex items-center justify-center gap-3 shadow-xl"
              >
                <LayoutDashboard size={20} />
                <span>لوحة التحكم — {user.name}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => { navigate('/login'); setOpen(false); }}
                  className="p-5 rounded-2xl border border-white/10 text-white font-bold text-sm glass-dark"
                >
                  دخول
                </button>
                <button
                  onClick={() => { navigate('/register'); setOpen(false); }}
                  className="p-5 rounded-2xl bg-green-500 text-white font-black text-sm shadow-xl"
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
