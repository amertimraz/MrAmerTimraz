import { useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { uploadsApi } from '../../api/uploads';
import { testsApi } from '../../api/tests';
import { coursesApi } from '../../api/courses';
import {
  Camera, User, Phone, Calendar, Award, BookOpen, Clock, Loader2,
  TrendingUp, CheckCircle, Trophy, Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatDate = (date: string) => new Date(date).toLocaleDateString('ar-EG');

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: courses } = useQuery({
    queryKey: ['student-courses'],
    queryFn: coursesApi.getStudentCourses,
  });

  const { data: results } = useQuery({
    queryKey: ['student-results'],
    queryFn: testsApi.getMyResults,
  });

  const updateImageMutation = useMutation({
    mutationFn: (imageUrl: string) => authApi.updateMyProfileImage(imageUrl),
    onSuccess: (updatedUser) => {
      updateUser({ profileImage: updatedUser.profileImage });
      toast.success('تم تحديث صورتك بنجاح! 🎉');
    },
    onError: () => toast.error('فشل في تحديث الصورة'),
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadsApi.image(file);
      await updateImageMutation.mutateAsync(url);
    } catch {
      toast.error('فشل في رفع الصورة');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const passed = results?.filter(r => r.passed).length ?? 0;
  const avg = results?.length
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
    : 0;

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Profile Header Card */}
      <div className="card overflow-hidden">
        {/* Cover Banner */}
        <div className="h-28 bg-gradient-to-r from-primary-500 via-accent-500 to-purple-500 relative" />

        <div className="px-6 pb-6 -mt-14 relative">
          {/* Avatar */}
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-800 overflow-hidden bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                  <Loader2 size={28} className="animate-spin text-white" />
                </div>
              )}
            </div>

            {/* Camera button */}
            <button
              onClick={() => !uploadingImage && fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute -bottom-2 -right-2 w-9 h-9 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed"
              title="تغيير صورتك الشخصية"
            >
              {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            </button>
          </div>

          {/* Hidden input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
            <p className="text-gray-500">@{user.username}</p>
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle size={14} />
              طالب
            </span>
          </div>

          <p className="mt-3 text-sm text-gray-400">
            انقر على أيقونة الكاميرا 📷 لتغيير صورتك الشخصية (JPG, PNG, WEBP — حد أقصى 5MB)
          </p>
        </div>
      </div>

      {/* Info & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-4">المعلومات الشخصية</h2>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">رقم الهاتف</p>
              <p className="font-medium text-gray-900 dark:text-white">{user.phoneNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">تاريخ الانضمام</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.createdAt ? formatDate(user.createdAt) : '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
              <User size={18} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">اسم المستخدم</p>
              <p className="font-medium text-gray-900 dark:text-white">@{user.username}</p>
            </div>
          </div>

          {user.studentCode && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center shrink-0">
                <Hash size={18} className="text-accent-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">كود الطالب</p>
                <p className="font-bold text-lg text-accent-600 dark:text-accent-400 tracking-wider">{user.studentCode}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-2">
              <BookOpen size={20} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{courses?.length ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">الدروس المسجّل بها</p>
          </div>

          <div className="card p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center mb-2">
              <Award size={20} className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{results?.length ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">الاختبارات المكتملة</p>
          </div>

          <div className="card p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-2">
              <Trophy size={20} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{passed}</p>
            <p className="text-xs text-gray-500 mt-1">الاختبارات الناجحة</p>
          </div>

          <div className="card p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center mb-2">
              <TrendingUp size={20} className="text-accent-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{avg}%</p>
            <p className="text-xs text-gray-500 mt-1">متوسط الدرجات</p>
          </div>
        </div>
      </div>

      {/* Recent Results */}
      {results && results.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-primary-500" />
              آخر النتائج
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الاختبار</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الدرجة</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {results.slice(0, 5).map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{r.testTitle}</td>
                  <td className="px-5 py-3 font-bold text-primary-600">{r.percentage.toFixed(0)}%</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${r.passed ? 'badge-green' : 'badge-red'}`}>
                      {r.passed ? 'ناجح ✓' : 'راسب ✗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
