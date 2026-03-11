import { useQuery } from '@tanstack/react-query';
import { BookOpen, Users, FileText, TrendingUp } from 'lucide-react';
import { coursesApi } from '../../api/courses';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/ui/StatCard';
import CourseCard from '../../components/ui/CourseCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: coursesApi.getMyCourses,
  });

  const totalStudents = courses?.reduce((s, c) => s + c.enrolledCount, 0) ?? 0;
  const totalTests   = courses?.reduce((s, c) => s + c.testCount, 0) ?? 0;
  const published    = courses?.filter(c => c.isPublished).length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">أهلاً، {user?.name} 👨‍🏫</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة دروسك واختباراتك</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي الدروس"   value={courses?.length ?? 0} icon={<BookOpen size={22} />} color="blue" />
        <StatCard title="دروس منشورة"      value={published}            icon={<TrendingUp size={22} />} color="green" />
        <StatCard title="إجمالي الطلاب"    value={totalStudents}         icon={<Users size={22} />}    color="purple" />
        <StatCard title="إجمالي الاختبارات" value={totalTests}           icon={<FileText size={22} />} color="orange" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">دروسي الأخيرة</h2>
          <button onClick={() => navigate('/teacher/courses')} className="text-sm text-primary-600 font-medium hover:underline">
            إدارة الدروس
          </button>
        </div>

        {isLoading ? <LoadingSpinner /> : courses?.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
            <p>لم تنشئ أي درس بعد</p>
            <button onClick={() => navigate('/teacher/courses')} className="btn-primary mt-4">
              إنشاء درس جديد
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses?.slice(0, 3).map(course => (
              <CourseCard key={course.id} course={course}
                onClick={() => navigate(`/teacher/courses/${course.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
