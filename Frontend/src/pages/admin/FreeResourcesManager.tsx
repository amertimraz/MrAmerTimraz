import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { freeResourcesApi } from '../../api/freeResources';
import { uploadsApi } from '../../api/uploads';
import { Gift, Plus, FileEdit, Trash2, Link as LinkIcon, AlertCircle, Eye, EyeOff, Image as ImageIcon, Loader2, Upload, Download } from 'lucide-react';
import type { FreeResource } from '../../types';

export default function FreeResourcesManager() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<FreeResource | null>(null);

  const { data: resources, isLoading } = useQuery({
    queryKey: ['admin-free-resources'],
    queryFn: () => freeResourcesApi.getAll(true),
  });

  const deleteMutation = useMutation({
    mutationFn: freeResourcesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-free-resources'] });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: (id: number) => freeResourcesApi.update(id, { isPublished: !resources?.find(r => r.id === id)?.isPublished }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-free-resources'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      deleteMutation.mutate(id);
    }
  };

  const openForm = (resource?: FreeResource) => {
    setEditingResource(resource || null);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center bg-gray-900 border border-gray-800 rounded-xl mt-6 animate-pulse">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-900 p-6 rounded-2xl border border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Gift className="text-green-500" />
            الخدمات المجانية
          </h1>
          <p className="text-gray-400 mt-1">ملفات مجانية (PDF أو PowerPoint) تُحمَّل مباشرة بدون مقابل.</p>
        </div>
        <button
          onClick={() => openForm()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2 rounded-xl transition"
        >
          <Plus size={20} />
          إضافة ملف
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="p-4 text-gray-400 font-medium">الملف</th>
                <th className="p-4 text-gray-400 font-medium text-center">التحميلات</th>
                <th className="p-4 text-gray-400 font-medium text-center">الحالة</th>
                <th className="p-4 text-gray-400 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {resources?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    لا توجد ملفات مضافة حتى الآن.
                  </td>
                </tr>
              ) : (
                resources?.map((resource: FreeResource) => (
                  <tr key={resource.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{resource.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">{resource.description}</div>
                    </td>
                    <td className="p-4 text-center text-gray-300 flex items-center justify-center gap-1.5 mt-1">
                      <Download size={14} /> {resource.downloadCount}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${resource.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                        {resource.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                        {resource.isPublished ? 'مرئي' : 'مخفي'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition" title="عرض الملف">
                          <LinkIcon size={18} />
                        </a>
                        <button
                          onClick={() => togglePublishMutation.mutate(resource.id)}
                          className={`p-2 rounded-lg transition ${resource.isPublished ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'}`}
                          title={resource.isPublished ? 'إخفاء' : 'إظهار'}
                        >
                          {resource.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                          onClick={() => openForm(resource)}
                          className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg transition"
                          title="تعديل"
                        >
                          <FileEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(resource.id)}
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
        <FreeResourceFormModal
          resource={editingResource}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

function FreeResourceFormModal({ resource, onClose }: { resource: FreeResource | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const isEditing = !!resource;
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [coverUrl, setCoverUrl] = useState(resource?.coverImageUrl || '');
  const [fileUrl, setFileUrl] = useState(resource?.fileUrl || '');

  const mutation = useMutation({
    mutationFn: (data: Partial<FreeResource>) =>
      isEditing ? freeResourcesApi.update(resource.id, data) : freeResourcesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-free-resources'] });
      onClose();
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadsApi.image(file);
      setCoverUrl(url);
    } catch {
      alert('فشل رفع الصورة، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingFile(true);
      const url = await uploadsApi.document(file);
      setFileUrl(url);
    } catch {
      alert('فشل رفع الملف، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      fileUrl,
      coverImageUrl: coverUrl,
      isPublished: formData.get('isPublished') === 'on',
    };
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 pr-8">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isEditing ? 'تعديل الملف' : 'إضافة ملف مجاني جديد'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">عنوان الملف</label>
              <input
                name="title"
                defaultValue={resource?.title}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">الوصف التفصيلي</label>
              <textarea
                name="description"
                defaultValue={resource?.description}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors resize-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">الملف (PDF أو PowerPoint)</label>
              <div className="flex gap-2">
                <input
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  type="text"
                  required
                  placeholder="https://... أو ارفع ملف"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
                />
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="free-resource-file-upload"
                  disabled={isUploadingFile}
                />
                <label
                  htmlFor="free-resource-file-upload"
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-gray-700 cursor-pointer transition ${isUploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploadingFile ? <Loader2 size={18} className="animate-spin text-green-500" /> : <Upload size={18} />}
                  <span className="text-sm">ارفع ملف</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">PDF أو PowerPoint — الحد الأقصى: 50 ميجا</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">صورة الغلاف (اختياري)</label>
              <div className="flex gap-4 items-start">
                <div className="w-24 h-32 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={32} className="text-gray-600" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="free-resource-cover-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="free-resource-cover-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 cursor-pointer transition ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-green-500" />
                        <span>جاري الرفع...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        <span>اختر صورة</span>
                      </>
                    )}
                  </label>
                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverUrl('')}
                      className="text-xs text-red-400 hover:text-red-300 transition block"
                    >
                      حذف الصورة
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${resource?.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                  <Eye size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">نشر الملف للزوار</h4>
                  <p className="text-gray-400 text-xs mt-0.5">سيكون متاحًا للتحميل المجاني المباشر عند التفعيل.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isPublished" defaultChecked={resource?.isPublished ?? true} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {mutation.isError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex flex-col gap-1 mt-4">
              <div className="flex gap-3">
                <AlertCircle size={18} className="shrink-0" />
                <span>{(mutation.error as any)?.response?.data?.error || 'حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى.'}</span>
              </div>
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
