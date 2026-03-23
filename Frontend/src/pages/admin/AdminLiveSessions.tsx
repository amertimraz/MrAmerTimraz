import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { liveSessionsApi } from '../../api/liveSessions';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import type { LiveSession } from '../../types';
import { Plus, Edit2, Trash2, Calendar, Video, DollarSign, X } from 'lucide-react';

export default function AdminLiveSessions() {
  const qc = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['admin-live-sessions'],
    queryFn: liveSessionsApi.getAllAdmin,
  });

  const createMutation = useMutation({
    mutationFn: liveSessionsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-live-sessions'] });
      toast.success('تم إضافة الحصة بنجاح');
      setIsModalOpen(false);
    },
    onError: () => toast.error('فشل في إضافة الحصة'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, session }: { id: number; session: Partial<LiveSession> }) =>
      liveSessionsApi.update(id, session),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-live-sessions'] });
      toast.success('تم تحديث الحصة بنجاح');
      setIsModalOpen(false);
    },
    onError: () => toast.error('فشل في تحديث الحصة'),
  });

  const deleteMutation = useMutation({
    mutationFn: liveSessionsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-live-sessions'] });
      toast.success('تم حذف الحصة');
    },
    onError: () => toast.error('فشل في حذف الحصة'),
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      scheduledAt: formData.get('scheduledAt') as string,
      joinUrl: formData.get('joinUrl') as string,
      price: Number(formData.get('price')),
      isActive: true,
    };

    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, session: { ...data, id: editingSession.id } });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الحصص المباشرة</h1>
          <p className="text-gray-500 text-sm mt-1">يمكنك إضافة وإدارة مواعيد الحصص المباشرة وروابط الانضمام.</p>
        </div>
        <button
          onClick={() => {
            setEditingSession(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> إضافة حصة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions?.map((session) => (
          <div key={session.id} className="card p-6 flex flex-col hover:shadow-lg transition-all border-t-4 border-primary-500">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600">
                <Video size={24} />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingSession(session);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من حذف هذه الحصة؟')) {
                      deleteMutation.mutate(session.id);
                    }
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{session.title}</h3>
            {session.description && (
              <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{session.description}</p>
            )}

            <div className="space-y-3 mt-auto">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={16} className="text-primary-500" />
                <span>{new Date(session.scheduledAt).toLocaleString('ar-EG')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                <DollarSign size={16} />
                <span>{session.price} ج.م</span>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                 <span className={`px-2 py-1 rounded-full ${session.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {session.isActive ? 'نشطة' : 'غير نشطة'}
                 </span>
                 <a href={session.joinUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">رابط الانضمام</a>
              </div>
            </div>
          </div>
        ))}
        {sessions?.length === 0 && (
          <div className="col-span-full card p-12 text-center text-gray-400">
            لا توجد حصص مباشرة حالياً. اضغط على "إضافة حصة جديدة" للبدء.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg p-8 space-y-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingSession ? 'تعديل الحصة المباشرة' : 'إضافة حصة مباشرة جديدة'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">عنوان الحصة</label>
                <input
                  name="title"
                  required
                  defaultValue={editingSession?.title}
                  placeholder="مثال: مراجعة الباب الأول"
                  className="w-full input-field"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">وصف قصير (اختياري)</label>
                <textarea
                  name="description"
                  defaultValue={editingSession?.description}
                  placeholder="اكتب ماذا سيتعلم الطلاب في هذه الحصة..."
                  className="w-full input-field min-h-[100px] py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">الموعد</label>
                  <input
                    name="scheduledAt"
                    type="datetime-local"
                    required
                    defaultValue={editingSession?.scheduledAt ? new Date(editingSession.scheduledAt).toISOString().slice(0, 16) : ''}
                    className="w-full input-field"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">السعر (ج.م)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingSession?.price ?? 0}
                    className="w-full input-field"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">رابط Google Meet / Zoom</label>
                <input
                  name="joinUrl"
                  type="url"
                  required
                  defaultValue={editingSession?.joinUrl}
                  placeholder="https://meet.google.com/..."
                  className="w-full input-field dir-ltr"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 btn-primary py-3"
                >
                  {editingSession ? 'تحديث الحصة' : 'حفظ ونشر الحصة'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
