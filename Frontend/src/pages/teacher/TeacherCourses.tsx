import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { coursesApi } from '../../api/courses';
import CourseCard from '../../components/ui/CourseCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function TeacherCourses() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: '', thumbnailUrl: '' });

  const { data: courses, isLoading } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: coursesApi.getMyCourses,
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => coursesApi.create(data),
    onSuccess: () => { toast.success('تم إنشاء الدرس!'); qc.invalidateQueries({ queryKey: ['teacher-courses'] }); closeModal(); },
    onError: () => toast.error('فشل في إنشاء الدرس'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => coursesApi.update(id, data),
    onSuccess: () => { toast.success('تم تحديث الدرس!'); qc.invalidateQueries({ queryKey: ['teacher-courses'] }); closeModal(); },
    onError: () => toast.error('فشل في تحديث الدرس'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => coursesApi.delete(id),
    onSuccess: () => { toast.success('تم حذف الدرس'); qc.invalidateQueries({ queryKey: ['teacher-courses'] }); },
    onError: () => toast.error('فشل في حذف الدرس'),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) =>
      coursesApi.update(id, { isPublished: !isPublished }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teacher-courses'] }),
  });

  const closeModal = () => { setShowModal(false); setEditing(null); setForm({ title: '', description: '', category: '', thumbnailUrl: '' }); };

  const openEdit = (c: { id: number; title: string; description?: string; category?: string; thumbnailUrl?: string }) => {
    setEditing(c.id);
    setForm({ title: c.title, description: c.description ?? '', category: c.category ?? '', thumbnailUrl: c.thumbnailUrl ?? '' });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing, data: form });
    else createMutation.mutate(form);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">دروسي ({courses?.length ?? 0})</h2>
        <div className="flex gap-2">
          <button onClick={() => navigate('/teacher/courses/new')} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> كورس جديد
          </button>
          <button onClick={() => setShowModal(true)} className="btn-secondary text-sm flex items-center gap-1 py-2 px-3">
            ⚡ سريع
          </button>
        </div>
      </div>

      {isLoading ? <LoadingSpinner /> : courses?.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">لم تنشئ أي درس بعد</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses?.map(course => (
            <CourseCard key={course.id} course={course}
              onClick={() => navigate(`/teacher/courses/${course.id}`)}
              actions={
                <div className="flex gap-2 w-full">
                  <button onClick={() => togglePublish.mutate({ id: course.id, isPublished: course.isPublished })}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 flex-1">
                    {course.isPublished ? <><EyeOff size={14} /> إخفاء</> : <><Eye size={14} /> نشر</>}
                  </button>
                  <button onClick={() => openEdit(course)} className="btn-secondary text-xs py-1.5 px-3">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => { if (confirm('هل تريد حذف هذا الدرس؟')) deleteMutation.mutate(course.id); }}
                    className="btn-danger text-xs py-1.5 px-3">
                    <Trash2 size={14} />
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'تعديل الدرس' : 'إنشاء درس جديد'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الدرس *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="input-field" placeholder="أدخل اسم الدرس" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="input-field resize-none" rows={3} placeholder="وصف مختصر للدرس" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التصنيف</label>
            <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="input-field" placeholder="مثال: رياضيات، علوم..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رابط الصورة المصغرة</label>
            <input value={form.thumbnailUrl} onChange={e => setForm(p => ({ ...p, thumbnailUrl: e.target.value }))}
              className="input-field" placeholder="https://..." type="url" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1"
              disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'تحديث الدرس' : 'إنشاء الدرس'}
            </button>
            <button type="button" onClick={closeModal} className="btn-secondary">إلغاء</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
