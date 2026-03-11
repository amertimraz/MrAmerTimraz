import { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Youtube, Instagram, Twitter, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useAuthStore } from '../../store/authStore';

const socialLinks = [
  { icon: <Facebook size={22} />,  label: 'Facebook',    href: 'https://www.facebook.com/Mr.AmerTimraz', color: 'bg-blue-600 hover:bg-blue-700' },
  { icon: <Youtube size={22} />,   label: 'YouTube',     href: 'https://www.youtube.com/@AmerTimraz',    color: 'bg-red-600 hover:bg-red-700' },
  { icon: <Instagram size={22} />, label: 'Instagram',   href: 'https://instagram.com',                  color: 'bg-pink-600 hover:bg-pink-700' },
  { icon: <Twitter size={22} />,   label: 'Twitter / X', href: 'https://twitter.com',                    color: 'bg-sky-500 hover:bg-sky-600' },
];

const contactInfo = [
  { icon: <Mail size={20} />,   title: 'البريد الإلكتروني', value: 'amer.timraz@school.edu', accent: '#3b82f6' },
  { icon: <Phone size={20} />,  title: 'رقم التواصل',       value: '01096066818',             accent: '#22c55e' },
  { icon: <MapPin size={20} />, title: 'الموقع',            value: 'مصر',                     accent: '#a855f7' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDark } = useAuthStore();

  const { ref: formRef, isInView: formInView } = useScrollReveal();
  const { ref: infoRef, isInView: infoInView } = useScrollReveal();

  const card = isDark
    ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
    : { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };

  const inputStyle = isDark
    ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
    : { background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)' };

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-green-500 ${
    isDark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
  }`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div dir="rtl" className="min-h-screen">

      {/* Header */}
      <div className="pt-28 pb-14 text-center relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border border-green-500/30 mb-5 ${isDark ? 'text-green-400' : 'text-green-600'}`}
            style={{ background: 'rgba(34,197,94,0.08)' }}
          >
            📬 تواصل معنا
          </span>
          <h1 className={`text-4xl sm:text-5xl font-black mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>نحن هنا للمساعدة</h1>
          <p className={`text-base max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>لا تتردد في التواصل معنا في أي وقت. سنرد عليك في أقرب وقت ممكن.</p>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* Form */}
          <motion.div
            ref={formRef}
            className="lg:col-span-3 rounded-2xl p-7"
            style={card}
            initial={{ opacity: 0, x: -32 }}
            animate={formInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Send size={20} className="text-green-500" />
              أرسل رسالة
            </h2>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  className="flex flex-col items-center justify-center py-16 text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle size={56} className="text-green-500 mb-4" />
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>تم إرسال رسالتك!</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>سنتواصل معك قريباً إن شاء الله</p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className={`mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${isDark ? 'text-white border-white/15 hover:bg-white/5' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    إرسال رسالة أخرى
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>الاسم الكامل</label>
                      <input required value={form.name} onChange={update('name')} placeholder="أدخل اسمك" className={inputClass} style={inputStyle} />
                    </div>
                    <div>
                      <label className={`block text-xs mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>البريد الإلكتروني</label>
                      <input type="email" required value={form.email} onChange={update('email')} placeholder="example@email.com" className={inputClass} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>موضوع الرسالة</label>
                    <select value={form.subject} onChange={update('subject')} className={inputClass} style={inputStyle}>
                      <option value="" style={{ background: isDark ? '#1f2937' : '#fff' }}>اختر الموضوع</option>
                      <option value="general" style={{ background: isDark ? '#1f2937' : '#fff' }}>استفسار عام</option>
                      <option value="technical" style={{ background: isDark ? '#1f2937' : '#fff' }}>دعم تقني</option>
                      <option value="content" style={{ background: isDark ? '#1f2937' : '#fff' }}>محتوى دراسي</option>
                      <option value="other" style={{ background: isDark ? '#1f2937' : '#fff' }}>أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>الرسالة</label>
                    <textarea required rows={5} value={form.message} onChange={update('message')} placeholder="اكتب رسالتك هنا..." className={`${inputClass} resize-none`} style={inputStyle} />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                    style={{ background: '#22c55e' }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Send size={16} /> إرسال الرسالة</>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Info */}
          <motion.div
            ref={infoRef}
            className="lg:col-span-2 space-y-5"
            initial={{ opacity: 0, x: 32 }}
            animate={infoInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.title}
                className="rounded-2xl p-5 flex items-center gap-4"
                style={card}
                initial={{ opacity: 0, y: 20 }}
                animate={infoInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: item.accent + '20', color: item.accent }}>
                  {item.icon}
                </div>
                <div>
                  <p className={`text-xs mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{item.title}</p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                </div>
              </motion.div>
            ))}

            {/* Social */}
            <div className="rounded-2xl p-5" style={card}>
              <h3 className={`font-bold text-sm mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>تابعنا على</h3>
              <div className="grid grid-cols-2 gap-3">
                {socialLinks.map(s => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className={`${s.color} flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white text-xs font-medium transition-colors`}
                  >
                    {s.icon}
                    {s.label}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div className="rounded-2xl p-5 text-center"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <p className="text-4xl mb-2">⚡</p>
              <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>وقت الرد</p>
              <p className="text-green-500 font-black text-xl mt-1">خلال 24 ساعة</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>في أيام العمل الرسمية</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
