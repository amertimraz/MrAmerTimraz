import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '../../api/library';
import type { LibraryItem } from '../../types';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Copy, X, Check, FolderOpen, ExternalLink, Eye } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MediaUploadField from '../../components/ui/MediaUploadField';
import PdfThumbnail from '../../components/ui/PdfThumbnail';
import PdfViewerModal from '../../components/ui/PdfViewerModal';
import { resolveFileUrl } from '../../config';

const emptyForm = { title: '', description: '', fileUrl: '', category: '', thumbnailUrl: '' };

export default function AdminLibrary() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<LibraryItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterCat, setFilterCat] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [viewing, setViewing] = useState<LibraryItem | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ['library', filterCat],
    queryFn: () => libraryApi.getAll(filterCat || undefined),
  });

  const { data: categories } = useQuery({
    queryKey: ['library-categories'],
    queryFn: libraryApi.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: libraryApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library'] });
      qc.invalidateQueries({ queryKey: ['library-categories'] });
      toast.success('تم إضافة الملف!');
      closeModal();
    },
    onError: () => toast.error('فشل في الإضافة'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof emptyForm }) => libraryApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library'] });
      qc.invalidateQueries({ queryKey: ['library-categories'] });
      toast.success('تم التحديث!');
      closeModal();
    },
    onError: () => toast.error('فشل في التحديث'),
  });

  const deleteMutation = useMutation({
    mutationFn: libraryApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library'] });
      qc.invalidateQueries({ queryKey: ['library-categories'] });
      toast.success('تم الحذف');
    },
    onError: () => toast.error('فشل في الحذف'),
  });

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal('add'); };
  const openEdit = (item: LibraryItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description ?? '',
      fileUrl: item.fileUrl,
      category: item.category ?? '',
      thumbnailUrl: item.thumbnailUrl ?? '',
    });
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditing(null); setForm(emptyForm); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('العنوان مطلوب'); return; }
    if (!form.fileUrl.trim()) { toast.error('الملف مطلوب'); return; }
    const data = {
      title: form.title,
      description: form.description || '',
      fileUrl: form.fileUrl,
      category: form.category || '',
      thumbnailUrl: form.thumbnailUrl || '',
    };
    if (modal === 'edit' && editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const copyUrl = (item: LibraryItem) => {
    navigator.clipboard.writeText(item.fileUrl).then(() => {
      setCopiedId(item.id);
      toast.success('تم نسخ الرابط!');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const confirmDelete = (item: LibraryItem) => {
    if (window.confirm(`هل تريد حذف "${item.title}"؟`)) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <>
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="text-primary-500" size={26} />
            المكتبة التعليمية
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">مذكرات وملفات PDF للطلاب</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> إضافة ملف
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCat('')}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            filterCat === '' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          الكل
        </button>
        {categories?.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              filterCat === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : !items?.length ? (
        <div className="card p-12 text-center">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-lg">لا توجد ملفات في المكتبة بعد</p>
          <button onClick={openAdd} className="btn-primary mt-4">إضافة أول ملف</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div
                className="w-16 h-20 rounded-xl overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setViewing(item)}
                title="عرض PDF"
              >
                <PdfThumbnail thumbnailUrl={item.thumbnailUrl ? resolveFileUrl(item.thumbnailUrl) : undefined} className="w-full h-full" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.title}</h3>
                    {item.category && (
                      <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium rounded-full">
                        {item.category}
                      </span>
                    )}
                    {item.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setViewing(item)}
                      title="عرض PDF"
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <a
                      href={resolveFileUrl(item.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      title="فتح الملف"
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => copyUrl(item)}
                      title="نسخ الرابط"
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                    >
                      {copiedId === item.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      title="تعديل"
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => confirmDelete(item)}
                      title="حذف"
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <code className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg truncate max-w-xs">
                    {item.fileUrl}
                  </code>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(item.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {modal === 'add' ? 'إضافة ملف جديد' : 'تعديل الملف'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">العنوان *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="input-field"
                  placeholder="مثال: مذكرة الفصل الأول — الصف العاشر"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">التصنيف</label>
                <input
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="input-field"
                  placeholder="مثال: الصف الأول الثانوي"
                  list="cats-list"
                />
                <datalist id="cats-list">
                  {categories?.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">الوصف</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="وصف مختصر للمحتوى (اختياري)"
                />
              </div>

              <MediaUploadField
                type="pdf"
                value={form.fileUrl}
                onChange={url => setForm(f => ({ ...f, fileUrl: url }))}
                label="ملف PDF *"
                optional={false}
              />

              <MediaUploadField
                type="image"
                value={form.thumbnailUrl}
                onChange={url => setForm(f => ({ ...f, thumbnailUrl: url }))}
                label="الصورة المصغرة"
                optional={true}
              />

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary flex-1">
                  {createMutation.isPending || updateMutation.isPending ? 'جاري الحفظ...' : modal === 'add' ? 'إضافة' : 'حفظ التعديلات'}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

    {viewing && (
      <PdfViewerModal
        url={resolveFileUrl(viewing.fileUrl)}
        title={viewing.title}
        onClose={() => setViewing(null)}
      />
    )}
    </>
  );
}
