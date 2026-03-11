import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../../api/courses';
import { notificationsApi } from '../../api/notifications';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { Search, Trash2, Eye, EyeOff, Send, DollarSign } from 'lucide-react';
import type { Course } from '../../types';
import toast from 'react-hot-toast';

export default function AdminCourses() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcast, setBroadcast] = useState({ title: '', message: '' });
  const [pricingCourse, setPricingCourse] = useState<Course | null>(null);
  const [priceInput, setPriceInput] = useState('');

  const { data: courses, isLoading } = useQuery({ queryKey: ['all-courses-admin'], queryFn: () => coursesApi.getAll(false) });

  const togglePublish = useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) => coursesApi.update(id, { isPublished: !isPublished }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-courses-admin'] }),
  });

  const deleteCourse = useMutation({
    mutationFn: (id: number) => coursesApi.delete(id),
    onSuccess: () => { toast.success('تم حذف الدرس'); qc.invalidateQueries({ queryKey: ['all-courses-admin'] }); },
    onError: () => toast.error('فشل في حذف الدرس'),
  });

  const updatePrice = useMutation({
    mutationFn: ({ id, price }: { id: number; price: number }) => coursesApi.update(id, { price }),
    onSuccess: () => {
      toast.success('تم تحديث السعر!');
      qc.invalidateQueries({ queryKey: ['all-courses-admin'] });
      setPricingCourse(null);
    },
    onError: () => toast.error('فشل تحديث السعر'),
  });

  const sendBroadcast = useMutation({
    mutationFn: (data: { title: string; message: string }) => notificationsApi.broadcast(data),
    onSuccess: () => { toast.success('تم إرسال الإشعار للجميع!'); setBroadcastModal(false); setBroadcast({ title: '', message: '' }); },
    onError: () => toast.error('فشل الإرسال'),
  });

  const filtered = courses?.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.teacherName.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute right-3 top-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pr-10" placeholder="ابحث بالعنوان أو اسم المدرّس..." />
        </div>
        <button onClick={() => setBroadcastModal(true)} className="btn-primary flex items-center gap-2">
          <Send size={18} /> إشعار جماعي
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 text-sm text-gray-500">
          {filtered?.length} درس
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الدرس</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">المدرّس</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الطلاب</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">السعر</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered?.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{c.title}</p>
                    <p className="text-xs text-gray-400">{c.category ?? 'بدون تصنيف'}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{c.teacherName}</td>
                  <td className="px-5 py-3 font-bold text-primary-600">{c.enrolledCount}</td>
                  <td className="px-5 py-3">
                    {c.isFree ? (
                      <span className="badge-blue">مجاني</span>
                    ) : (
                      <span className="font-bold text-orange-500">{c.price} ج.م</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={c.isPublished ? 'badge-green' : 'badge-yellow'}>
                      {c.isPublished ? 'منشور' : 'مسودة'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setPricingCourse(c); setPriceInput(String(c.price)); }}
                        className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        title="تعديل السعر">
                        <DollarSign size={16} />
                      </button>
                      <button onClick={() => togglePublish.mutate({ id: c.id, isPublished: c.isPublished })}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={c.isPublished ? 'إخفاء' : 'نشر'}>
                        {c.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => { if (confirm('حذف هذا الدرس نهائياً؟')) deleteCourse.mutate(c.id); }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!pricingCourse} onClose={() => setPricingCourse(null)} title={`تعديل سعر: ${pricingCourse?.title}`}>
        <form onSubmit={e => { e.preventDefault(); updatePrice.mutate({ id: pricingCourse!.id, price: parseFloat(priceInput) || 0 }); }} className="space-y-4">
          <p className="text-sm text-gray-500">أدخل 0 لجعل الكورس مجانياً.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السعر (ج.م)</label>
            <input
              type="number"
              value={priceInput}
              onChange={e => setPriceInput(e.target.value)}
              className="input-field"
              placeholder="0 = مجاني"
              min={0}
              step={0.5}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={updatePrice.isPending}>
              {updatePrice.isPending ? 'جاري الحفظ...' : 'حفظ السعر'}
            </button>
            <button type="button" onClick={() => setPricingCourse(null)} className="btn-secondary">إلغاء</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={broadcastModal} onClose={() => setBroadcastModal(false)} title="إرسال إشعار جماعي">
        <form onSubmit={e => { e.preventDefault(); sendBroadcast.mutate(broadcast); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان الإشعار *</label>
            <input value={broadcast.title} onChange={e => setBroadcast(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="عنوان الإشعار" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نص الإشعار *</label>
            <textarea value={broadcast.message} onChange={e => setBroadcast(p => ({ ...p, message: e.target.value }))} className="input-field resize-none" rows={4} placeholder="اكتب نص الإشعار هنا..." required />
          </div>
          <p className="text-xs text-gray-400">سيتم إرسال هذا الإشعار لجميع المستخدمين في المنصة</p>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={sendBroadcast.isPending}>
              <Send size={16} className="inline ml-2" /> إرسال للجميع
            </button>
            <button type="button" onClick={() => setBroadcastModal(false)} className="btn-secondary">إلغاء</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
