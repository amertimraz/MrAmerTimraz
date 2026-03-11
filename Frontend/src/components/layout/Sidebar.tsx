import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, Trophy,
  Gamepad2, Bell, Users, LogOut, GraduationCap, Settings,
  Database, Zap, Tag, Home, CreditCard, FolderOpen,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface NavItem { to: string; icon: React.ReactNode; label: string }

const studentLinks: NavItem[] = [
  { to: '/student', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم' },
  { to: '/student/courses', icon: <BookOpen size={20} />, label: 'دروسي' },
  { to: '/student/tests', icon: <FileText size={20} />, label: 'الاختبارات' },
  { to: '/student/results', icon: <Trophy size={20} />, label: 'نتائجي' },
  { to: '/student/games', icon: <Gamepad2 size={20} />, label: 'الألعاب التعليمية' },
  { to: '/student/notifications', icon: <Bell size={20} />, label: 'الإشعارات' },
];

const teacherLinks: NavItem[] = [
  { to: '/teacher',              icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم' },
  { to: '/teacher/courses',      icon: <BookOpen size={20} />,        label: 'دروسي' },
  { to: '/teacher/students',     icon: <Users size={20} />,           label: 'الطلاب' },
  { to: '/teacher/tests',        icon: <FileText size={20} />,        label: 'الاختبارات' },
  { to: '/teacher/question-bank',icon: <Database size={20} />,        label: 'بنك الأسئلة' },
  { to: '/teacher/tests/generate',icon: <Zap size={20} />,           label: 'مولّد الاختبارات' },
  { to: '/teacher/notifications',icon: <Bell size={20} />,            label: 'الإشعارات' },
];

const adminLinks: NavItem[] = [
  { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم' },
  { to: '/admin/users', icon: <Users size={20} />, label: 'المستخدمون' },
  { to: '/admin/courses', icon: <BookOpen size={20} />, label: 'الدروس' },
  { to: '/admin/payments', icon: <CreditCard size={20} />, label: 'طلبات الدفع' },
  { to: '/admin/tests', icon: <FileText size={20} />, label: 'الاختبارات' },
  { to: '/admin/notifications', icon: <Bell size={20} />, label: 'الإشعارات' },
  { to: '/admin/categories',    icon: <Tag size={20} />,      label: 'الأقسام الدراسية' },
  { to: '/admin/library',       icon: <FolderOpen size={20} />, label: 'المكتبة التعليمية' },
  { to: '/admin/settings',      icon: <Settings size={20} />, label: 'الإعدادات' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const links =
    user?.role === 'Admin' ? adminLinks :
    user?.role === 'Teacher' ? teacherLinks : studentLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center shadow-md">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white text-sm">منصة مستر عامر</h1>
            <p className="text-xs text-gray-400">
              {user?.role === 'Admin' ? 'مدير النظام' : user?.role === 'Teacher' ? 'مدرّس' : 'طالب'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <Link to="/" className="sidebar-link text-gray-500 dark:text-gray-400 hover:text-green-500 border-b border-gray-100 dark:border-gray-700 mb-2 pb-2">
          <Home size={20} />
          <span>الرئيسية</span>
        </Link>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to.split('/').length <= 2}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <span className="text-primary-600 dark:text-primary-300 font-bold text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
