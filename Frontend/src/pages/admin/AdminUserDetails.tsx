import { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/auth';
import { uploadsApi } from '../../api/uploads';
import {
  ArrowRight, User, Phone, Shield, Calendar, BookOpen, Award, Clock, Edit, Trash2,
  GraduationCap, ChevronRight, Camera, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const roleBadge = (r: string) => r === 'Admin' ? 'badge-red' : r === 'Teacher' ? 'badge-blue' : 'badge-green';
const roleIcon  = (r: string) => r === 'Admin' ? <Shield size={14} /> : r === 'Teacher' ? <BookOpen size={14} /> : <GraduationCap size={14} />;
const roleLabel = (r: string) => r === 'Admin' ? 'مدير' : r === 'Teacher' ? 'مدرّس' : 'طالب';
const formatDate = (date: string) => new Date(date).toLocaleDateString('ar-EG');

export default function AdminUserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const userId = parseInt(id || '0');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: authApi.getUsers,
  });

  const user = users?.find(u => u.id === userId);

  // Fetch real stats from backend
  const { data: stats } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: () => authApi.getUserStats(userId),
    enabled: !!userId,
  });

  const deleteUser = useMutation({
    mutationFn: () => authApi.deleteUser(userId),
    onSuccess: () => {
      toast.success('تم حذف المستخدم');
      navigate('/admin/users');
    },
    onError: () => toast.error('فشل في حذف المستخدم'),
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadsApi.image(file);
      await authApi.updateUserProfileImage(userId, url);
      toast.success('تم تحديث الصورة بنجاح');
      qc.invalidateQueries({ queryKey: ['all-users'] });
    } catch {
      toast.error('فشل في رفع الصورة');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">المستخدم غير موجود</p>
        <button onClick={() => navigate('/admin/users')} className="btn-primary mt-4">
          العودة للقائمة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/admin/users" className="hover:text-primary-500">المستخدمين</Link>
        <ChevronRight size={16} />
        <span className="text-gray-900 dark:text-white font-medium">{user.name}</span>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ArrowRight size={20} />
          <span>العودة</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/users/${userId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Edit size={18} />
            تعديل
          </button>
          {currentUser?.id !== userId && (
            <button
              onClick={() => { if (confirm(`حذف ${user.name}؟`)) deleteUser.mutate(); }}
              disabled={deleteUser.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <Trash2 size={18} />
              حذف
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar with upload */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shrink-0 overflow-hidden">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            {uploadingImage ? (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-primary-500" />
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors"
                title="تغيير الصورة"
              >
                <Camera size={16} />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
              <p className="text-gray-500">@{user.username}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className={`badge ${roleBadge(user.role)} flex items-center gap-1`}>
                {roleIcon(user.role)}
                {roleLabel(user.role)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Phone size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">رقم الهاتف</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <Calendar size={18} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">تاريخ الانضمام</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.createdAt ? formatDate(user.createdAt) : '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <Clock size={18} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">آخر تسجيل دخول</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'لم يسجل الدخول بعد'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                  <Award size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">آخر نشاط</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.lastActivity || 'لا يوجد نشاط'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <BookOpen size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.enrolledCount ?? '...'}
              </p>
              <p className="text-sm text-gray-500">الدورات المشترك فيها</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
              <Award size={24} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.completedTests ?? '...'}
              </p>
              <p className="text-sm text-gray-500">الاختبارات المكتملة</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <Clock size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats ? (stats.completedTests * 0.5).toFixed(1) : '...'}
              </p>
              <p className="text-sm text-gray-500">ساعات النشاط التقريبية</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses placeholder */}
      <div className="card">
        <div className="p-6 text-center text-gray-500">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
          <p>سيتم إضافة تفاصيل الدورات والتقدم قريباً</p>
        </div>
      </div>
    </div>
  );
}
