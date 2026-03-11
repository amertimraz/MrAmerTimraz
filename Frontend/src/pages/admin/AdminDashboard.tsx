import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, FileText, TrendingUp } from 'lucide-react';
import { authApi } from '../../api/auth';
import { coursesApi } from '../../api/courses';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';

export default function AdminDashboard() {
  const { user } = useAuthStore();

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: authApi.getUsers,
  });

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['all-courses-admin'],
    queryFn: () => coursesApi.getAll(false),
  });

  if (loadingUsers || loadingCourses) return <LoadingSpinner size="lg" />;

  const students  = users?.filter(u => u.role === 'Student').length  ?? 0;
  const teachers  = users?.filter(u => u.role === 'Teacher').length  ?? 0;
  const published = courses?.filter(c => c.isPublished).length ?? 0;
  const totalEnrollments = courses?.reduce((s, c) => s + c.enrolledCount, 0) ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">لوحة الإدارة الرئيسية</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">أهلاً {user?.name} — نظرة عامة على المنصة</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي المستخدمين" value={users?.length ?? 0}  icon={<Users size={22} />}     color="blue"   subtitle={`${students} طالب، ${teachers} مدرّس`} />
        <StatCard title="إجمالي الدروس"      value={courses?.length ?? 0} icon={<BookOpen size={22} />}  color="green"  subtitle={`${published} منشور`} />
        <StatCard title="إجمالي التسجيلات"   value={totalEnrollments}     icon={<TrendingUp size={22} />} color="purple" />
        <StatCard title="الدروس النشطة"       value={published}            icon={<FileText size={22} />}  color="orange" />
      </div>

      {/* Users breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">توزيع المستخدمين</h3>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'طلاب', count: students, color: 'bg-blue-500', pct: users?.length ? Math.round((students / users.length) * 100) : 0 },
              { label: 'مدرّسون', count: teachers, color: 'bg-green-500', pct: users?.length ? Math.round((teachers / users.length) * 100) : 0 },
              { label: 'مدراء', count: users?.filter(u => u.role === 'Admin').length ?? 0, color: 'bg-purple-500', pct: users?.length ? Math.round(((users?.filter(u => u.role === 'Admin').length ?? 0) / users.length) * 100) : 0 },
            ].map(({ label, count, color, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="text-gray-500">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <div className={`h-2 ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">أكثر الدروس تسجيلاً</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {courses?.sort((a, b) => b.enrolledCount - a.enrolledCount).slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center text-primary-600 text-xs font-bold">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.title}</p>
                  <p className="text-xs text-gray-400">{c.teacherName}</p>
                </div>
                <span className="text-sm font-bold text-primary-600">{c.enrolledCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">آخر المستخدمين المسجّلين</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الاسم</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">البريد</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الدور</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">تاريخ الانضمام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users?.slice(-5).reverse().map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-5 py-3 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={u.role === 'Admin' ? 'badge-red' : u.role === 'Teacher' ? 'badge-blue' : 'badge-green'}>
                      {u.role === 'Admin' ? 'مدير' : u.role === 'Teacher' ? 'مدرّس' : 'طالب'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString('ar-EG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
