import { Shield, Database, Layers, ExternalLink, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '../../api/library';
import { useAuthStore } from '../../store/authStore';

export default function AdminSettings() {
  const { isDark } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: lockStatus } = useQuery({
    queryKey: ['library-lock-status'],
    queryFn: () => libraryApi.getLockStatus(),
  });

  const lockMutation = useMutation({
    mutationFn: (isLocked: boolean) => libraryApi.setLockStatus(isLocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-lock-status'] });
    },
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
            <Database size={20} className="text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">معلومات النظام</h3>
        </div>
        <div className="space-y-3 text-sm">
          {[
            { label: 'الإطار', value: 'ASP.NET Core 8' },
            { label: 'قاعدة البيانات', value: 'SQL Server' },
            { label: 'الواجهة الأمامية', value: 'React 18 + TypeScript' },
            { label: 'الإصدار', value: '1.0.0' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900 dark:text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">الأمان</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p className="flex items-center gap-2">✅ تشفير كلمات المرور (BCrypt)</p>
          <p className="flex items-center gap-2">✅ مصادقة JWT مع انتهاء صلاحية 7 أيام</p>
          <p className="flex items-center gap-2">✅ CORS محدود للنطاقات المعتمدة</p>
          <p className="flex items-center gap-2">✅ صلاحيات متدرّجة (Student / Teacher / Admin)</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
            <Layers size={20} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">اختبارات مستويات JavaScript</h3>
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
          <p>✅ النظام مفعل للطلاب في صفحة مستقلة: <span className="font-medium">اختبارات المستويات</span>.</p>
          <p>✅ الشهادة تظهر تلقائيًا عند النجاح بنسبة 70% أو أكثر.</p>
          <p>✅ إدارة المستويات والأسئلة أصبحت في صفحة مستقلة تمامًا.</p>
        </div>

        <Link
          to="/admin/levels"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors"
        >
          <ExternalLink size={14} />
          فتح نظام مستويات JavaScript
        </Link>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
            <Lock size={20} className="text-red-600" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">قفل المكتبة</h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            عند تفعيل قفل المكتبة، سيتم إظهار رسالة للمستخدمين بأن المكتبة مغلقة بسبب عدد التحميلات الكبير مع زر التواصل المباشر عبر الواتساب.
          </p>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">حالة قفل المكتبة</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lockStatus?.isLocked ? 'المكتبة مقفولة حالياً' : 'المكتبة مفتوحة حالياً'}
              </p>
            </div>
            <button
              onClick={() => lockMutation.mutate(!lockStatus?.isLocked)}
              disabled={lockMutation.isPending}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                lockStatus?.isLocked
                  ? 'bg-red-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              } ${lockMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  lockStatus?.isLocked ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {lockStatus?.isLocked && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-800 dark:text-red-300 text-sm">
                ⚠️ المكتبة مقفولة حالياً. يمكن للمستخدمين طلب المذكرات عبر الواتساب مباشرة.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
