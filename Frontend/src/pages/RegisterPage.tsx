import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, AtSign } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', username: '', phoneNumber: '', password: '', role: 'Student' });
  const [countryCode, setCountryCode] = useState('+20');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullPhone = `${countryCode}${form.phoneNumber}`;
      const res = await authApi.register({ ...form, phoneNumber: fullPhone });
      setAuth(res.user, res.token);
      toast.success('تم إنشاء الحساب بنجاح!');
      navigate('/student');
    } catch {
      toast.error('فشل في إنشاء الحساب. اسم المستخدم أو رقم الهاتف مستخدم بالفعل.');
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
          <h1 className="text-2xl font-bold text-white">منصة مستر عامر</h1>
        </div>

        <div className="card p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">إنشاء حساب جديد</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم الكامل</label>
              <div className="relative">
                <User size={18} className="absolute right-3 top-3.5 text-gray-400" />
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="input-field pr-10" placeholder="أدخل اسمك الكامل" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم المستخدم</label>
              <div className="relative">
                <AtSign size={18} className="absolute right-3 top-3.5 text-gray-400" />
                <input type="text" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  className="input-field pr-10" placeholder="اسم المستخدم" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الهاتف</label>
              <div className="flex gap-2" dir="ltr">
                <div className="relative w-32 shrink-0">
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="input-field w-full appearance-none px-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer text-left font-medium"
                  >
                    <option value="+20">🇪🇬 +20</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+965">🇰🇼 +965</option>
                    <option value="+974">🇶🇦 +974</option>
                    <option value="+973">🇧🇭 +973</option>
                    <option value="+968">🇴🇲 +968</option>
                    <option value="+218">🇱🇾 +218</option>
                    <option value="+249">🇸🇩 +249</option>
                    <option value="+962">🇯🇴 +962</option>
                    <option value="+970">🇵🇸 +970</option>
                    <option value="+964">🇮🇶 +964</option>
                    <option value="+963">🇸🇾 +963</option>
                    <option value="+961">🇱🇧 +961</option>
                    <option value="+213">🇩🇿 +213</option>
                    <option value="+212">🇲🇦 +212</option>
                    <option value="+216">🇹🇳 +216</option>
                    <option value="+967">🇾🇪 +967</option>
                  </select>
                </div>
                <div className="relative flex-1">
                  <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input type="tel" value={form.phoneNumber}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setForm(p => ({ ...p, phoneNumber: val }));
                    }}
                    className="input-field pl-10" placeholder="1xxxxxxxxx" required />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock size={18} className="absolute right-3 top-3.5 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field pr-10 pl-10" placeholder="6 أحرف على الأقل" required minLength={6} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>



            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">سجّل دخولك</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
