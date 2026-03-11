import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications';
import { Send, Shield, Database, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [broadcast, setBroadcast] = useState({ title: '', message: '' });

  const sendBroadcast = useMutation({
    mutationFn: (data: { title: string; message: string }) => notificationsApi.broadcast(data),
    onSuccess: () => { toast.success('تم إرسال الإشعار!'); setBroadcast({ title: '', message: '' }); },
    onError: () => toast.error('فشل الإرسال'),
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
            <Bell size={20} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">إشعار جماعي</h3>
        </div>
        <form onSubmit={e => { e.preventDefault(); sendBroadcast.mutate(broadcast); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان</label>
            <input value={broadcast.title} onChange={e => setBroadcast(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="عنوان الإشعار" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرسالة</label>
            <textarea value={broadcast.message} onChange={e => setBroadcast(p => ({ ...p, message: e.target.value }))} className="input-field resize-none" rows={3} placeholder="نص الإشعار..." required />
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={sendBroadcast.isPending}>
            <Send size={16} /> إرسال لجميع المستخدمين
          </button>
        </form>
      </div>

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
    </div>
  );
}
