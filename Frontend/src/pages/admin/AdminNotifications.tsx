import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications';
import { coursesApi } from '../../api/courses';
import { authApi } from '../../api/auth';
import { Send, Image as ImageIcon, Link as LinkIcon, Users, Target, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Course, User } from '../../types';

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [targetType, setTargetType] = useState('All'); // All, Teachers, Students, Course, SpecificUsers
  const [targetCourseId, setTargetCourseId] = useState<number | ''>('');
  
  // Specific users selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<{id: number, name: string}[]>([]);

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['admin-courses'],
    queryFn: () => coursesApi.getAll()
  });

  const { data: searchResults = [] } = useQuery<User[]>({
    queryKey: ['admin-users-search', searchQuery],
    queryFn: () => authApi.getUsers(), // Since there is no dedicated search endpoint, we fetch all and filter in memory, or use a proper endpoint if available.
    select: (users) => users.filter(u => u.name.includes(searchQuery) || u.username.includes(searchQuery)).slice(0, 5),
    enabled: searchQuery.length > 1
  });

  const sendBroadcast = useMutation({
    mutationFn: (formData: FormData) => notificationsApi.broadcast(formData),
    onSuccess: () => {
      toast.success('تم إرسال الإشعار بنجاح!');
      setTitle('');
      setMessage('');
      setLinkUrl('');
      setImageFile(null);
      setImagePreview(null);
      setSelectedUsers([]);
      setTargetCourseId('');
      setTargetType('All');
    },
    onError: () => toast.error('فشل إرسال الإشعار'),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return toast.error('يجب إدخال عنوان ورسالة الإشعار');

    const formData = new FormData();
    formData.append('Title', title);
    formData.append('Message', message);
    if (linkUrl) formData.append('LinkUrl', linkUrl);
    if (imageFile) formData.append('ImageFile', imageFile);
    
    formData.append('TargetType', targetType);
    if (targetType === 'Course' && targetCourseId) formData.append('TargetCourseId', targetCourseId.toString());
    if (targetType === 'SpecificUsers' && selectedUsers.length > 0) {
      formData.append('TargetUserIds', JSON.stringify(selectedUsers.map(u => u.id)));
    }

    sendBroadcast.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
          <Send size={24} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">مركز الإشعارات</h2>
          <p className="text-gray-500">أرسل إشعارات مخصصة، مرفقة بالصور الروابط للفئات المستهدفة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5 card p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
            <Target size={20} className="text-primary-600" />
            تحديد المستهدفين
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {['All', 'Teachers', 'Students', 'Course', 'SpecificUsers'].map((type) => (
              <label key={type} className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${targetType === type ? 'bg-primary-50 border-primary-500 shadow-sm' : 'hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}`}>
                <input type="radio" name="targetType" value={type} checked={targetType === type} onChange={() => setTargetType(type)} className="sr-only" />
                <Users size={20} className={targetType === type ? 'text-primary-600' : 'text-gray-400'} />
                <span className={`text-sm font-medium ${targetType === type ? 'text-primary-700' : 'text-gray-600 dark:text-gray-300'}`}>
                  {type === 'All' && 'الجميع'}
                  {type === 'Teachers' && 'المعلمين فقط'}
                  {type === 'Students' && 'الطلاب فقط'}
                  {type === 'Course' && 'كورس محدد'}
                  {type === 'SpecificUsers' && 'تحديد بالاسم'}
                </span>
              </label>
            ))}
          </div>

          {targetType === 'Course' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium mb-1">اختر الكورس</label>
              <select value={targetCourseId} onChange={e => setTargetCourseId(Number(e.target.value))} className="input-field" required>
                <option value="">-- اختر كورس --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          )}

          {targetType === 'SpecificUsers' && (
            <div className="animate-fade-in space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2"><Search size={16}/> ابحث عن مستخدم (طالب/معلم)</label>
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" className="input-field" placeholder="اكتب اسم المستخدم للبحث..." />
              </div>
              {searchResults.length > 0 && searchQuery && (
                <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50">
                  {searchResults.map(u => (
                    <div key={u.id} className="flex justify-between items-center p-2 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors cursor-pointer" onClick={() => {
                      if (!selectedUsers.find(su => su.id === u.id)) setSelectedUsers([...selectedUsers, {id: u.id, name: u.name}]);
                      setSearchQuery('');
                    }}>
                      <span>{u.name} <span className="text-xs text-gray-500">({u.role})</span></span>
                      <button type="button" className="text-primary-600 text-sm">إضافة</button>
                    </div>
                  ))}
                </div>
              )}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(u => (
                    <span key={u.id} className="bg-primary-100 text-primary-800 text-xs px-3 py-1 rounded-full flex items-center gap-2">
                      {u.name}
                      <button type="button" onClick={() => setSelectedUsers(selectedUsers.filter(su => su.id !== u.id))} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <h3 className="text-lg font-bold mt-8 mb-4 border-b pb-2">محتوى الإشعار</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">عنوان الإشعار</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="مثال: خصم 50% على كورسات الفيزياء" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الرسالة التفصيلية</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} className="input-field resize-none h-32" placeholder="اكتب تفاصيل الإشعار هنا..." required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><LinkIcon size={16}/> رابط خارجي أو داخلي (اختياري)</label>
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} type="url" className="input-field" placeholder="https://example.com/course/1" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2"><ImageIcon size={16}/> إرفاق صورة (اختياري)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" />
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-4" disabled={sendBroadcast.isPending}>
            <Send size={20} />
            إرسال الإشعار الآن
          </button>
        </form>

        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5 sticky top-24">
            <h3 className="font-bold border-b pb-2 mb-4 text-gray-600">معاينة الإشعار (كيف سيظهر؟)</h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border shadow-sm relative overflow-hidden">
              <div className="flex gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Send size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2">{title || 'عنوان الإشعار...'}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-3">{message || 'تفاصيل الرسالة التي ستظهر للمستخدم عند التنبيه...'}</p>
                  
                  {imagePreview && (
                    <div className="mt-3 rounded-lg overflow-hidden border">
                      <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover max-h-48" />
                    </div>
                  )}

                  {linkUrl && (
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium items-center gap-1">
                      <LinkIcon size={14} /> فتح الرابط
                    </a>
                  )}
                  <span className="block text-xs text-gray-400 mt-3">الآن</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-sm text-gray-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <span className="font-bold text-blue-700 dark:text-blue-400 block mb-2">💡 نصائح للإشعارات:</span>
              <ul className="list-disc list-inside space-y-1">
                <li>استخدم العناوين الجذابة والقصيرة.</li>
                <li>استفد من الصور لزيادة التفاعل ولفت الانتباه.</li>
                <li>تأكد من اختيار "الفئة المستهدفة" الصحيحة حتى لا تزعج الجميع.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
