import { Shield, Database } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
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
