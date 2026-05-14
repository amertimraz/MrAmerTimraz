import { Shield, Database, Layers, ExternalLink, Lock, FileUp, Loader2, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '../../api/library';
import { uploadsApi } from '../../api/uploads';
import { toast } from 'react-hot-toast';

export default function AdminSettings() {
  const queryClient = useQueryClient();

  const { data: lockStatus } = useQuery({
    queryKey: ['library-lock-status'],
    queryFn: () => libraryApi.getLockStatus(),
  });

  const lockMutation = useMutation({
    mutationFn: (data: { isLocked: boolean; modalType?: string; freeDownloadLink?: string }) => 
      libraryApi.setLockStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-lock-status'] });
      toast.success('تم تحديث إعدادات المكتبة');
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadsApi.pdf(file),
    onSuccess: (url) => {
      lockMutation.mutate({
        ...lockStatus,
        isLocked: lockStatus?.isLocked || false,
        freeDownloadLink: url
      });
    }
  });

  const thumbnailUploadMutation = useMutation({
    mutationFn: (file: File) => uploadsApi.image(file),
    onSuccess: (url) => {
      lockMutation.mutate({
        ...lockStatus,
        isLocked: lockStatus?.isLocked || false,
        lockThumbnailUrl: url
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) thumbnailUploadMutation.mutate(file);
  };

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
            عند تفعيل قفل المكتبة، سيتم إظهار رسالة للمستخدمين بأن المكتبة متوقفة عن الإتاحة المجانية بسبب تكاليف الاستضافة مع معلومات الأسعار وزر التواصل المباشر عبر الواتساب.
          </p>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">حالة قفل المكتبة</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lockStatus?.isLocked ? 'المكتبة مقفولة حالياً' : 'المكتبة مفتوحة حالياً'}
              </p>
            </div>
            <button
              onClick={() => lockMutation.mutate({
                ...lockStatus,
                isLocked: !lockStatus?.isLocked
              })}
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
            <>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-800 dark:text-red-300 text-sm">
                  ⚠️ المكتبة مقفولة حالياً. يمكن للمستخدمين طلب المذكرات عبر الواتساب مباشرة.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">نوع الموديل الذي يظهر للطلاب</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'default', label: 'الافتراضي (سعر 10ج)', desc: 'عرض السعر وتواصل واتساب' },
                      { id: 'promo', label: 'ترويجي (تحميل مجاني)', desc: 'رابط للمذكرة + سعر النسخة الكاملة' }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => lockMutation.mutate({ ...lockStatus, modalType: type.id })}
                        className={`p-3 rounded-xl border-2 text-right transition-all ${
                          (lockStatus?.modalType || 'default') === type.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 ring-2 ring-primary-500/20'
                            : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                      >
                        <p className={`font-bold text-sm ${(lockStatus?.modalType || 'default') === type.id ? 'text-primary-600' : ''}`}>{type.label}</p>
                        <p className="text-xs text-gray-500">{type.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {lockStatus?.modalType === 'promo' && (
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">رابط المذكرة المجانية (بدون إجابات)</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={lockStatus?.freeDownloadLink || ''}
                            readOnly
                            placeholder="لم يتم رفع ملف بعد..."
                            className="w-full px-4 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-700 text-sm outline-none"
                          />
                        </div>
                        <label className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-colors">
                          {uploadMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <FileUp size={18} />}
                          <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">صورة مصغرة للمذكرة</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-28 bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                          {lockStatus?.lockThumbnailUrl ? (
                            <img src={lockStatus.lockThumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={24} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                            {thumbnailUploadMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                            <span>{lockStatus?.lockThumbnailUrl ? 'تغيير الصورة' : 'رفع صورة'}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                          </label>
                          <p className="text-[10px] text-gray-500">سيتم عرض هذه الصورة فوق زر التحميل في الموديل</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
