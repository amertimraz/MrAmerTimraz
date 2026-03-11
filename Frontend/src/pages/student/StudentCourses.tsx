import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, BookOpen, Upload, X, CreditCard, Clock } from 'lucide-react';
import { coursesApi } from '../../api/courses';
import { paymentsApi } from '../../api/payments';
import CourseCard from '../../components/ui/CourseCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Course } from '../../types';

export default function StudentCourses() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'my'>('my');

  const [payingCourse, setPayingCourse] = useState<Course | null>(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const submitPayment = useMutation({
    mutationFn: () => paymentsApi.createRequest(
      payingCourse!.id,
      parseFloat(amount),
      notes,
      receipt ?? undefined
    ),
    onSuccess: () => {
      toast.success('تم إرسال طلب الدفع! سيتم مراجعته من الإدارة.');
      qc.invalidateQueries({ queryKey: ['my-payment-requests'] });
      closePayModal();
    },
    onError: () => toast.error('فشل إرسال الطلب. ربما أرسلت طلباً من قبل.'),
  });

  const closePayModal = () => {
    setPayingCourse(null);
    setAmount('');
    setNotes('');
    setReceipt(null);
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
      <button onClick={() => { setPayingCourse(course); setAmount(String(course.price)); }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closePayModal}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" dir="rtl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">طلب التسجيل في الكورس</h3>
              <button onClick={closePayModal} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white">{payingCourse.title}</p>
              <p className="text-sm text-gray-500">سعر الكورس: <span className="font-bold text-orange-600">{payingCourse.price} ج.م</span></p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-300">
              قم بتحويل المبلغ على رقم الواتساب: <span className="font-bold">01096066818</span> ثم ارفع إيصال التحويل هنا.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المبلغ المدفوع (ج.م) *</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                className="input-field" placeholder="أدخل المبلغ" min={0} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">إيصال الدفع (صورة)</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => setReceipt(e.target.files?.[0] ?? null)} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 hover:border-primary-400 hover:text-primary-500 transition-colors">
                <Upload size={18} />
                {receipt ? receipt.name : 'اضغط لرفع صورة الإيصال'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات (اختياري)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                className="input-field resize-none" rows={2} placeholder="أي معلومات إضافية..." />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => submitPayment.mutate()} disabled={!amount || submitPayment.isPending}
                className="flex-1 btn-primary">
                {submitPayment.isPending ? 'جاري الإرسال...' : 'إرسال طلب التسجيل'}
              </button>
              <button onClick={closePayModal} className="btn-secondary">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
