import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '../../api/courses';
import { authApi } from '../../api/auth';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Users, BookOpen } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';

export default function TeacherStudents() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: coursesApi.getMyCourses,
  });

  const { data: allUsers } = useQuery({
    queryKey: ['all-users-teacher'],
    queryFn: authApi.getUsers,
  });

  const students = allUsers?.filter(u => u.role === 'Student') ?? [];
  const totalEnrolled = courses?.reduce((s, c) => s + c.enrolledCount, 0) ?? 0;

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="إجمالي الطلاب" value={students.length} icon={<Users size={22} />} color="blue" />
        <StatCard title="تسجيلات الدروس" value={totalEnrolled} icon={<BookOpen size={22} />} color="purple" />
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">إحصاءات الدروس</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {courses?.map(c => (
            <div key={c.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{c.title}</p>
                <p className="text-sm text-gray-400">{c.videoCount} فيديو | {c.testCount} اختبار</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600 text-lg">{c.enrolledCount}</p>
                <p className="text-xs text-gray-400">طالب مسجّل</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
