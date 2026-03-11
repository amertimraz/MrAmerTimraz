import { Bell, Moon, Sun, Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

interface TopbarProps {
  title: string;
  onMenuToggle?: () => void;
}

export default function Topbar({ title, onMenuToggle }: TopbarProps) {
  const { user, isDark, toggleDark, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30000,
    enabled: !!user,
  });

  const notifPath =
    user?.role === 'Admin' ? '/admin/notifications' :
    user?.role === 'Teacher' ? '/teacher/notifications' : '/student/notifications';

  const profilePath =
    user?.role === 'Admin' ? '/admin' :
    user?.role === 'Teacher' ? '/teacher' : '/student';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden">
            <Menu size={20} />
          </button>
        )}
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDark}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          onClick={() => navigate(notifPath)}
          className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
        >
          <Bell size={20} />
          {(data?.count ?? 0) > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {data!.count}
            </span>
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(v => !v)}
            className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-1"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          {showMenu && (
            <div className="absolute left-0 top-12 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fade-in" dir="rtl">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">@{user?.username}</p>
                <p className="text-xs text-gray-400">{user?.phoneNumber}</p>
              </div>

              <button
                onClick={() => { navigate(profilePath); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <User size={16} className="text-gray-400" />
                الملف الشخصي
              </button>

              <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={16} />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
