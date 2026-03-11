import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/auth';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { Trash2, Search, UserPlus, Shield, GraduationCap, BookOpen, Pencil, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import type { User } from '../../types';

const roleLabel = (r: string) => r === 'Admin' ? 'مدير' : r === 'Teacher' ? 'مدرّس' : 'طالب';
const roleBadge = (r: string) => r === 'Admin' ? 'badge-red' : r === 'Teacher' ? 'badge-blue' : 'badge-green';
const roleIcon  = (r: string) => r === 'Admin' ? <Shield size={14} /> : r === 'Teacher' ? <BookOpen size={14} /> : <GraduationCap size={14} />;

const EMPTY_CREATE = { name: '', username: '', phoneNumber: '', password: '', role: 'Student' };
const EMPTY_EDIT   = { name: '', username: '', phoneNumber: '', password: '', role: 'Student' };

export default function AdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ ...EMPTY_CREATE });
  const [showCreatePass, setShowCreatePass] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_EDIT });
  const [showEditPass, setShowEditPass] = useState(false);

  const { data: users, isLoading } = useQuery({ queryKey: ['all-users'], queryFn: authApi.getUsers });

  const createUser = useMutation({
    mutationFn: (data: typeof EMPTY_CREATE) => authApi.register(data),
    onSuccess: () => {
      toast.success('تم إنشاء المستخدم!');
      qc.invalidateQueries({ queryKey: ['all-users'] });
      setShowCreateModal(false);
      setCreateForm({ ...EMPTY_CREATE });
    },
    onError: () => toast.error('فشل في إنشاء المستخدم. اسم المستخدم أو رقم الهاتف مستخدم بالفعل.'),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => authApi.updateUser(id, data),
    onSuccess: () => {
      toast.success('تم تحديث المستخدم');
      qc.invalidateQueries({ queryKey: ['all-users'] });
      setEditingUser(null);
    },
    onError: () => toast.error('فشل في تحديث المستخدم'),
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => authApi.deleteUser(id),
    onSuccess: () => { toast.success('تم حذف المستخدم'); qc.invalidateQueries({ queryKey: ['all-users'] }); },
    onError: () => toast.error('فشل في حذف المستخدم'),
  });

  const openEdit = (u: User) => {
    setEditingUser(u);
    setEditForm({ name: u.name, username: u.username, phoneNumber: u.phoneNumber, password: u.plainPassword ?? '', role: u.role });
    setShowEditPass(false);
  };

  const filtered = users?.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase())
      || u.username.toLowerCase().includes(search.toLowerCase())
      || u.phoneNumber.includes(search);
    const matchRole = roleFilter ? u.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute right-3 top-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pr-10" placeholder="ابحث بالاسم أو اسم المستخدم أو الهاتف..." />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field sm:w-40">
          <option value="">كل الأدوار</option>
          <option value="Student">طالب</option>
          <option value="Teacher">مدرّس</option>
          <option value="Admin">مدير</option>
        </select>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <UserPlus size={18} /> مستخدم جديد
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 text-sm text-gray-500">
          {filtered?.length} مستخدم
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">المستخدم</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">رقم الهاتف</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الدور</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">تاريخ الانضمام</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered?.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-400">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{u.phoneNumber}</td>
                  <td className="px-5 py-3">
                    <span className={`${roleBadge(u.role)} flex items-center gap-1 w-fit`}>
                      {roleIcon(u.role)} {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => { if (confirm(`حذف ${u.name}؟`)) deleteUser.mutate(u.id); }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="حذف"
                      >
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

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="إضافة مستخدم جديد">
        <form onSubmit={e => { e.preventDefault(); createUser.mutate(createForm); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم الكامل *</label>
            <input value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="الاسم الكامل" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المستخدم *</label>
            <input value={createForm.username} onChange={e => setCreateForm(p => ({ ...p, username: e.target.value }))} className="input-field" placeholder="username" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف *</label>
            <input type="tel" value={createForm.phoneNumber} onChange={e => setCreateForm(p => ({ ...p, phoneNumber: e.target.value }))} className="input-field" placeholder="01xxxxxxxxx" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور *</label>
            <div className="relative">
              <input type={showCreatePass ? 'text' : 'password'} value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} className="input-field pl-10" placeholder="6 أحرف على الأقل" required minLength={6} />
              <button type="button" onClick={() => setShowCreatePass(v => !v)} className="absolute left-3 top-3 text-gray-400 hover:text-gray-600">
                {showCreatePass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الدور</label>
            <select value={createForm.role} onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))} className="input-field">
              <option value="Student">طالب</option>
              <option value="Teacher">مدرّس</option>
              <option value="Admin">مدير</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={createUser.isPending}>إنشاء المستخدم</button>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">إلغاء</button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title={`تعديل: ${editingUser?.name}`}>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!editingUser) return;
            updateUser.mutate({ id: editingUser.id, data: editForm });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم الكامل *</label>
            <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المستخدم *</label>
            <input value={editForm.username} onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف *</label>
            <input type="tel" value={editForm.phoneNumber} onChange={e => setEditForm(p => ({ ...p, phoneNumber: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الدور</label>
            <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} className="input-field">
              <option value="Student">طالب</option>
              <option value="Teacher">مدرّس</option>
              <option value="Admin">مدير</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              كلمة المرور
              <span className="text-xs text-gray-400 font-normal mr-2">(عدّلها لتغييرها)</span>
            </label>
            <div className="relative">
              <input
                type={showEditPass ? 'text' : 'password'}
                value={editForm.password}
                onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))}
                className="input-field pl-10"
                placeholder="••••••••"
                minLength={editForm.password.length > 0 ? 6 : undefined}
              />
              <button type="button" onClick={() => setShowEditPass(v => !v)} className="absolute left-3 top-3 text-gray-400 hover:text-gray-600">
                {showEditPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={updateUser.isPending}>
              {updateUser.isPending ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </button>
            <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary">إلغاء</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
