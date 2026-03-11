import { useQuery } from '@tanstack/react-query';
import { BookOpen, Trophy, FileText, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { coursesApi } from '../../api/courses';
import { testsApi } from '../../api/tests';
import StatCard from '../../components/ui/StatCard';
import CourseCard from '../../components/ui/CourseCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['student-courses'],
    queryFn: coursesApi.getStudentCourses,
  });

  const { data: results } = useQuery({
    queryKey: ['student-results'],
    queryFn: testsApi.getMyResults,
  });

  const passed = results?.filter(r => r.passed).length ?? 0;
  const avg = results?.length
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          أهلاً، {user?.name} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">استمر في التعلم وحقق أهدافك</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="الدروس المسجّل بها" value={courses?.length ?? 0}
          icon={<BookOpen size={22} />} color="blue" />
        <StatCard title="الاختبارات المكتملة" value={results?.length ?? 0}
          icon={<FileText size={22} />} color="purple" />
        <StatCard title="الاختبارات الناجحة" value={passed}
          icon={<Trophy size={22} />} color="green" />
        <StatCard title="متوسط الدرجات" value={`${avg}%`}
          icon={<TrendingUp size={22} />} color="orange" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">دروسي</h2>
          <button onClick={() => navigate('/student/courses')} className="text-sm text-primary-600 font-medium hover:underline">
            عرض الكل
          </button>
        </div>

        {loadingCourses ? (
          <LoadingSpinner />
        ) : courses?.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
            <p>لم تسجّل في أي درس بعد</p>
            <button onClick={() => navigate('/student/courses')} className="btn-primary mt-4">
              استعرض الدروس
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses?.slice(0, 3).map(course => (
              <CourseCard key={course.id} course={course}
                onClick={() => navigate(`/student/courses/${course.id}`)} />
            ))}
          </div>
        )}
      </div>

      {results && results.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">آخر النتائج</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">الاختبار</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">الدرس</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">الدرجة</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {results.slice(0, 5).map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-medium">{r.testTitle}</td>
                    <td className="px-4 py-3 text-gray-500">{r.courseTitle}</td>
                    <td className="px-4 py-3 font-bold text-primary-600">{r.percentage.toFixed(0)}%</td>
                    <td className="px-4 py-3">
                      <span className={r.passed ? 'badge-green' : 'badge-red'}>
                        {r.passed ? 'ناجح' : 'راسب'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
