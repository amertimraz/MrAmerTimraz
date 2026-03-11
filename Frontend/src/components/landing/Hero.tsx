import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Star } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

function TeacherPhoto({ isDark }: { isDark: boolean }) {
  const [err, setErr] = useState(false);

  if (err) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="text-8xl">👨‍🏫</div>
        <p className={`text-sm text-center ${isDark ? 'text-white/60' : 'text-gray-400'}`}>
          ضع teacher.png في مجلد /public
        </p>
      </div>
    );
  }

  return (
    <img
      src="/teacher.png"
      alt="الأستاذ عامر تمراز"
      className="w-full h-full object-cover object-top select-none"
      onError={() => setErr(true)}
    />
  );
}

const stats = [
  { icon: <Users size={18} />, value: '+500', label: 'طالب' },
  { icon: <BookOpen size={18} />, value: '+30',  label: 'درس' },
  { icon: <Star size={18} />,    value: '98%',   label: 'رضا الطلاب' },
];

const subjects = [
  { emoji: '💻', text: 'تقنية المعلومات — ابتدائي' },
  { emoji: '🖥️', text: 'الحاسب الآلي — إعدادي'   },
  { emoji: '⌨️', text: 'البرمجة — أول ثانوي'      },
];

export default function Hero() {
  const navigate = useNavigate();
  const { isDark } = useAuthStore();

  return (
    <section
      dir="rtl"
      className="relative min-h-[calc(100vh-5rem)] flex flex-col overflow-hidden"
    >
      {/* green glow */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 0% 0%, rgba(34,197,94,0.07) 0%, transparent 70%)',
        }}
      />

      {/* ── Main Content ── */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-16 py-12 grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Text side ── */}
          <div className="text-right order-2 lg:order-1 space-y-6">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border ${
                isDark
                  ? 'border-green-500/30 text-green-400'
                  : 'border-green-500/40 text-green-600'
              }`}
              style={{ background: 'rgba(34,197,94,0.08)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              منصة تعليمية إلكترونية
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-5xl sm:text-6xl font-black leading-tight">
                <span className={isDark ? 'text-white' : 'text-gray-900'}>مستر </span>
                <span className="text-green-500">عامر</span>
                <br />
                <span className="text-green-500">تمراز</span>
              </h1>
            </motion.div>

            {/* Subjects */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-2"
            >
              {subjects.map((s, i) => (
                <div key={i} className="flex items-center justify-end gap-2">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {s.text}
                  </span>
                  <span className="text-lg">{s.emoji}</span>
                </div>
              ))}
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className={`h-px origin-right ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
            />

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <motion.button
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(34,197,94,0.35)' }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 rounded-2xl font-bold text-white text-sm shadow-lg shadow-green-500/20"
                style={{ background: '#22c55e' }}
              >
                🎓 هتقفلها معانا
              </motion.button>
              <motion.button
                onClick={() => navigate('/courses')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className={`px-8 py-3.5 rounded-2xl font-bold text-sm border transition-colors ${
                  isDark
                    ? 'border-white/15 text-white hover:bg-white/5'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                📚 استعرض الدروس
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex gap-6 flex-wrap pt-2"
            >
              {stats.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="text-green-500">{s.icon}</div>
                  <div>
                    <p className={`font-bold text-lg leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {s.value}
                    </p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Photo side ── */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center items-end relative"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* glow behind photo */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 70% 70% at 50% 80%, rgba(34,197,94,0.12) 0%, transparent 70%)',
              }}
            />

            {/* Photo card */}
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                width: 340,
                height: 400,
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(34,197,94,0.2)',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(4px)',
                boxShadow: isDark
                  ? '0 24px 60px rgba(0,0,0,0.4)'
                  : '0 24px 60px rgba(0,0,0,0.1)',
              }}
            >
              <TeacherPhoto isDark={isDark} />

              {/* bottom label */}
              <div
                className="absolute bottom-0 inset-x-0 p-4 flex items-end"
                style={{
                  background: isDark
                    ? 'linear-gradient(to top, rgba(13,17,23,0.95) 0%, transparent 100%)'
                    : 'linear-gradient(to top, rgba(255,255,255,0.97) 0%, transparent 100%)',
                }}
              >
                <div>
                  <p className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    أ. عامر تمراز
                  </p>
                  <p className="text-green-500 text-xs mt-0.5">مدرّس التقنية والحاسب والبرمجة</p>
                </div>
              </div>
            </div>

            {/* floating badge */}
            <motion.div
              className="absolute top-6 right-2 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              style={{
                background: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.35)',
              }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Star size={12} className="text-green-500 fill-green-500" />
              <span className="text-green-600">+500 طالب</span>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
