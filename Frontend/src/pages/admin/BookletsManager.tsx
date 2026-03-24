import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, FileEdit, Trash2, Link as LinkIcon, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { bookletsApi } from '../../api/booklets';
import type { Booklet } from '../../types';

export default function BookletsManager() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooklet, setEditingBooklet] = useState<Booklet | null>(null);

  const { data: booklets, isLoading } = useQuery({
    queryKey: ['admin-booklets'],
    queryFn: () => bookletsApi.getAll(true),
  });

  const deleteMutation = useMutation({
    mutationFn: bookletsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-booklets'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الملزمة؟')) {
      deleteMutation.mutate(id);
    }
  };

  const openForm = (booklet?: Booklet) => {
    setEditingBooklet(booklet || null);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center bg-gray-900 border border-gray-800 rounded-xl mt-6 animate-pulse">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-900 p-6 rounded-2xl border border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="text-green-500" />
            إدارة الملازم
          </h1>
          <p className="text-gray-400 mt-1">إضافة وتعديل الملازم الدراسية المتاحة للطلاب.</p>
        </div>
        <button
          onClick={() => openForm()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2 rounded-xl transition"
        >
          <Plus size={20} />
          إضافة ملزمة
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="p-4 text-gray-400 font-medium">الملزمة</th>
                <th className="p-4 text-gray-400 font-medium">السنة/المادة</th>
                <th className="p-4 text-gray-400 font-medium text-center">السعر</th>
                <th className="p-4 text-gray-400 font-medium text-center">الحالة</th>
                <th className="p-4 text-gray-400 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {booklets?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    لا توجد ملازم مضافة حتى الآن.
                  </td>
                </tr>
              ) : (
                booklets?.map((booklet: Booklet) => (
                  <tr key={booklet.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{booklet.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">{booklet.description}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-300">{booklet.gradeLevel || '-'}</div>
                      <div className="text-xs text-gray-500">{booklet.subject || '-'}</div>
                    </td>
                    <td className="p-4 text-center font-bold text-emerald-400">
                      {booklet.price > 0 ? `${booklet.price} ج.م` : 'مجاني'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${booklet.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                        {booklet.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                        {booklet.isPublished ? 'مرئي' : 'مخفي'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                         <a href={booklet.pdfUrl} target="_blank" rel="noreferrer" className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition" title="عرض الـ PDF">
                           <LinkIcon size={18} />
                         </a>
                        <button
                          onClick={() => openForm(booklet)}
                          className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg transition"
                          title="تعديل"
                        >
                          <FileEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(booklet.id)}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition"
                          title="حذف"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <BookletFormModal
          booklet={editingBooklet}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

function BookletFormModal({ booklet, onClose }: { booklet: Booklet | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const isEditing = !!booklet;

  const mutation = useMutation({
    mutationFn: (data: Partial<Booklet>) =>
      isEditing ? bookletsApi.update(booklet.id, data) : bookletsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-booklets'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      pdfUrl: formData.get('pdfUrl') as string,
      coverImageUrl: formData.get('coverImageUrl') as string,
      subject: formData.get('subject') as string,
      gradeLevel: formData.get('gradeLevel') as string,
      price: Number(formData.get('price')),
      isPublished: formData.get('isPublished') === 'on',
    };
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 pr-8">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isEditing ? 'تعديل الملزمة' : 'إضافة ملزمة جديدة'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">عنوان الملزمة</label>
                <input
                  name="title"
                  defaultValue={booklet?.title}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">الوصف التفصيلي</label>
                <textarea
                  name="description"
                  defaultValue={booklet?.description}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors resize-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">رابط ملف הـ PDF</label>
                <input
                  name="pdfUrl"
                  defaultValue={booklet?.pdfUrl}
                  type="url"
                  required
                  placeholder="https://..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">المادة</label>
                <input
                  name="subject"
                  defaultValue={booklet?.subject}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="مثل: تقنية المعلومات"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">السنة الدراسية</label>
                <input
                  name="gradeLevel"
                  defaultValue={booklet?.gradeLevel}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="مثل: الصف الأول الإعدادي"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">السعر (ج.م)</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  defaultValue={booklet?.price ?? 0}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">رابط صورة الغلاف (اختياري)</label>
                <input
                  name="coverImageUrl"
                  type="url"
                  defaultValue={booklet?.coverImageUrl}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div className="col-span-2 flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${booklet?.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                    <Eye size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">نشر الملزمة للطلاب</h4>
                    <p className="text-gray-400 text-xs mt-0.5">ستكون مرئية ومتاحة للشراء للجميع عند التفعيل.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isPublished" defaultChecked={booklet?.isPublished ?? true} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
           </div>

           {mutation.isError && (
             <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex gap-3 mt-4">
                <AlertCircle size={18} className="shrink-0" />
                حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى.
             </div>
           )}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition disabled:opacity-50 font-bold"
            >
              {mutation.isPending ? 'جاري الحفظ...' : 'حفظ البيانات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
