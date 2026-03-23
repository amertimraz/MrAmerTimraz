import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, BookOpen, CreditCard, Clock } from 'lucide-react';
import { coursesApi } from '../../api/courses';
import { paymentsApi } from '../../api/payments';
import CourseCard from '../../components/ui/CourseCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PaymentModal from '../../components/courses/PaymentModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Course } from '../../types';

export default function StudentCourses() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'my'>('my');

  const [payingCourse, setPayingCourse] = useState<Course | null>(null);

  const { data: myCourses, isLoading: loadingMy } = useQuery({
    queryKey: ['student-courses'],
    queryFn: coursesApi.getStudentCourses,
  });

  const { data: allCourses, isLoading: loadingAll } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => coursesApi.getAll(true),
    enabled: tab === 'all',
  });

  const { data: myRequests } = useQuery({
    queryKey: ['my-payment-requests'],
    queryFn: paymentsApi.getMy,
    enabled: tab === 'all',
  });

  const enroll = useMutation({
    mutationFn: (id: number) => coursesApi.enroll(id),
    onSuccess: () => {
      toast.success('تم التسجيل بنجاح!');
      qc.invalidateQueries({ queryKey: ['student-courses'] });
    },
    onError: () => toast.error('أنت مسجّل في هذا الدرس مسبقاً'),
  });

  const closePayModal = () => {
    setPayingCourse(null);
  };

  const myIds = new Set(myCourses?.map(c => c.id));
  const pendingCourseIds = new Set(
    myRequests?.filter(r => r.status === 'Pending' || r.status === 'Approved').map(r => r.courseId)
  );

  const courses = tab === 'my' ? myCourses : allCourses;
  const loading = tab === 'my' ? loadingMy : loadingAll;

  const filtered = courses?.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getAction = (course: Course) => {
    if (tab !== 'all') return undefined;
    if (myIds.has(course.id)) return <span className="badge-green w-full text-center py-1.5">مسجّل ✓</span>;
    if (pendingCourseIds.has(course.id)) {
      const req = myRequests?.find(r => r.courseId === course.id);
      return (
        <div className="w-full flex items-center justify-center gap-2 py-2 text-yellow-600 dark:text-yellow-400 text-sm font-medium bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <Clock size={15} />
          {req?.status === 'Approved' ? 'مقبول — في انتظار التفعيل' : 'قيد المراجعة'}
        </div>
      );
    }
    if (course.isFree) {
      return (
        <button onClick={() => enroll.mutate(course.id)} className="btn-primary text-sm py-1.5 w-full" disabled={enroll.isPending}>
          سجّل الآن — مجاني
        </button>
      );
    }
    return (
      <button onClick={() => setPayingCourse(course)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors">
        <CreditCard size={15} /> ادفع وسجّل — {course.price} ج.م
      </button>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute right-3 top-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pr-10" placeholder="ابحث عن درس..." />
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          <button onClick={() => setTab('my')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'my' ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : 'text-gray-500'}`}>
            دروسي
          </button>
          <button onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'all' ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : 'text-gray-500'}`}>
            كل الدروس
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : filtered?.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p>{tab === 'my' ? 'لم تسجّل في أي درس بعد' : 'لا توجد دروس متاحة'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered?.map(course => (
            <CourseCard key={course.id} course={course}
              onClick={() => myIds.has(course.id) ? navigate(`/student/courses/${course.id}`) : undefined}
              actions={getAction(course)}
            />
          ))}
        </div>
      )}

      {payingCourse && (
        <PaymentModal
          isOpen={!!payingCourse}
          onClose={closePayModal}
          courseId={payingCourse.id}
          courseTitle={payingCourse.title}
          coursePrice={payingCourse.price}
        />
      )}
    </div>
  );
}
