import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AtSign, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      setAuth(res.user, res.token);
      const paths: Record<string, string> = { Admin: '/admin', Teacher: '/teacher', Student: '/student' };
      navigate(paths[res.user.role] ?? '/student');
    } catch {
      toast.error('اسم المستخدم أو رقم الهاتف أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 shadow-xl overflow-hidden border-4 border-white/30">
            <img src="/teacher2.png" alt="المعلم" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-white">منصة مستر عامر</h1>
          <p className="text-primary-200 mt-2 text-sm">منصة التعليم الإلكتروني المتكاملة</p>
        </div>

        <div className="card p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">تسجيل الدخول</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                اسم المستخدم أو رقم الهاتف
              </label>
              <div className="relative">
                <AtSign size={18} className="absolute right-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={form.identifier}
                  onChange={e => setForm(p => ({ ...p, identifier: e.target.value }))}
                  className="input-field pr-10"
                  placeholder="اسم المستخدم أو 01xxxxxxxxx"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock size={18} className="absolute right-3 top-3.5 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field pr-10 pl-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              سجّل الآن
            </Link>
          </p>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">بيانات تجريبية:</p>
            <p>👤 مدير: admin / Admin@123</p>
            <p>👨‍🏫 مدرس: teacher / Teacher@123</p>
            <p>👨‍🎓 طالب: student / Student@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
