import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useState } from 'react';

const pageTitles: Record<string, string> = {
  '/student': 'لوحة تحكم الطالب',
  '/student/courses': 'دروسي',
  '/student/tests': 'الاختبارات',
  '/student/results': 'نتائجي',
  '/student/games': 'الألعاب التعليمية',
  '/student/notifications': 'الإشعارات',
  '/teacher': 'لوحة تحكم المدرّس',
  '/teacher/courses': 'إدارة الدروس',
  '/teacher/courses/new': 'إنشاء كورس جديد',
  '/teacher/students': 'الطلاب',
  '/teacher/tests': 'الاختبارات',
  '/teacher/tests/generate': 'مولّد الاختبارات',
  '/teacher/question-bank': 'بنك الأسئلة',
  '/teacher/notifications': 'الإشعارات',
  '/admin': 'لوحة تحكم الإدارة',
  '/admin/users': 'إدارة المستخدمين',
  '/admin/courses': 'إدارة الدروس',
  '/admin/tests': 'الاختبارات',
  '/admin/notifications': 'الإشعارات',
  '/admin/categories': 'الأقسام الدراسية',
  '/admin/library': 'المكتبة التعليمية',
  '/admin/settings': 'الإعدادات',
};

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const title = Object.entries(pageTitles)
    .filter(([path]) => pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? 'المنصة التعليمية';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className={`fixed inset-0 z-40 bg-black/50 lg:hidden ${mobileSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setMobileSidebarOpen(false)} />

      <div className={`fixed lg:relative z-40 lg:z-auto transform transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} onMenuToggle={() => setMobileSidebarOpen(v => !v)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
