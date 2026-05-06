import { useQuery } from '@tanstack/react-query';
import { libraryApi } from '../../api/library';
import { Users, Download, Eye, GraduationCap, User, BookOpen, Search, Filter } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useState } from 'react';
import type { LibraryStudentInfo } from '../../types';

export default function AdminLibraryStudentStats() {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<'all' | 'view' | 'download'>('all');
  const [filterUserType, setFilterUserType] = useState<'all' | 'student' | 'parent' | 'teacher'>('all');

  const { data: studentInfos, isLoading } = useQuery({
    queryKey: ['library-student-info'],
    queryFn: libraryApi.getStudentInfos,
  });

  const filteredData = studentInfos?.filter((info: LibraryStudentInfo) => {
    const matchesSearch = 
      info.name.toLowerCase().includes(search.toLowerCase()) ||
      info.noteTitle.toLowerCase().includes(search.toLowerCase()) ||
      info.phone.includes(search);
    
    const matchesAction = filterAction === 'all' || info.action === filterAction;
    const matchesUserType = filterUserType === 'all' || info.userType === filterUserType;
    
    return matchesSearch && matchesAction && matchesUserType;
  });

  const stats = {
    total: studentInfos?.length ?? 0,
    views: studentInfos?.filter((i: LibraryStudentInfo) => i.action === 'view').length ?? 0,
    downloads: studentInfos?.filter((i: LibraryStudentInfo) => i.action === 'download').length ?? 0,
    students: studentInfos?.filter((i: LibraryStudentInfo) => i.userType === 'student').length ?? 0,
    parents: studentInfos?.filter((i: LibraryStudentInfo) => i.userType === 'parent').length ?? 0,
    teachers: studentInfos?.filter((i: LibraryStudentInfo) => i.userType === 'teacher').length ?? 0,
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'student': return { label: 'طالب', icon: GraduationCap, color: 'text-blue-600 bg-blue-100' };
      case 'parent': return { label: 'ولي أمر', icon: User, color: 'text-purple-600 bg-purple-100' };
      case 'teacher': return { label: 'مدرس', icon: User, color: 'text-green-600 bg-green-100' };
      default: return { label: type, icon: User, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const getActionLabel = (action: string) => {
    return action === 'download' 
      ? { label: 'تحميل', icon: Download, color: 'text-emerald-600 bg-emerald-100' }
      : { label: 'معاينة', icon: Eye, color: 'text-orange-600 bg-orange-100' };
  };

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">بيانات المذكرات</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">سجل الطلاب الذين قاموا بتحميل أو معاينة المذكرات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">إجمالي التفاعلات</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total.toLocaleString('ar-EG')}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Eye size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">المعاينات</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.views.toLocaleString('ar-EG')}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Download size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">التحميلات</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.downloads.toLocaleString('ar-EG')}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <GraduationCap size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">الطلاب</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.students.toLocaleString('ar-EG')}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <User size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">أولياء الأمور</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.parents.toLocaleString('ar-EG')}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <BookOpen size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">المدرسون</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.teachers.toLocaleString('ar-EG')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث بالاسم، المذكرة، أو رقم التليفون..."
              className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as 'all' | 'view' | 'download')}
              className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="all">الكل</option>
              <option value="view">معاينة</option>
              <option value="download">تحميل</option>
            </select>
          </div>

          {/* User Type Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterUserType}
              onChange={(e) => setFilterUserType(e.target.value as 'all' | 'student' | 'parent' | 'teacher')}
              className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="all">كل الأنواع</option>
              <option value="student">طلاب</option>
              <option value="parent">أولياء أمور</option>
              <option value="teacher">مدرسون</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">سجل التفاعلات</h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredData?.length ?? 0} نتيجة
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">الاسم</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">النوع</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">رقم التليفون</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">المحافظة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">المذكرة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">الإجراء</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredData?.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    لا توجد بيانات
                  </td>
                </tr>
              )}
              {filteredData?.map((info: LibraryStudentInfo) => {
                const userType = getUserTypeLabel(info.userType);
                const action = getActionLabel(info.action);
                const UserIcon = userType.icon;
                const ActionIcon = action.icon;
                
                return (
                  <tr key={info.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{info.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${userType.color}`}>
                        <UserIcon size={14} />
                        {userType.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono text-left" dir="ltr">
                      {info.phone}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {info.governorate}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-orange-500" />
                        <span className="font-medium text-gray-900 dark:text-white">{info.noteTitle}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${action.color}`}>
                        <ActionIcon size={14} />
                        {action.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(info.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
