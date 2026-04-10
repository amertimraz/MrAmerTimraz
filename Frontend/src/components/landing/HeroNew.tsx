import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Star, ArrowLeft, Play, Award, Clock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

function TeacherPhoto({ className }: { className?: string }) {
  const [err, setErr] = useState(false);

  if (err) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 ${className}`}>
        <span className="text-6xl">👨‍🏫</span>
      </div>
    );
  }

  return (
    <img
      src="/teacher.png"
      alt="الأستاذ عامر تمراز"
      className={`object-cover object-top ${className}`}
      onError={() => setErr(true)}
    />
  );
}

const features = [
  { icon: <CheckCircle size={16} />, text: 'متابعة شخصية' },
  { icon: <CheckCircle size={16} />, text: 'اختبارات تفاعلية' },
  { icon: <CheckCircle size={16} />, text: 'شرح مبسط وممتع' },
];

export default function Hero() {
  const navigate = useNavigate();
  const { isDark } = useAuthStore();

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.18, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)',
              }}
            >
              <Award size={16} className="text-green-500" />
              <span className={isDark ? 'text-green-400' : 'text-green-600'}>
                أفضل منصة تعليمية في مصر
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-2"
            >
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                تعلم البرمجة والذكاء الاصطناعي
              </h1>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-500">
                مع أستاذ عامر تمراز
              </h2>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-base lg:text-lg leading-relaxed max-w-2xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
            >
              انضم لأكثر من 500 طالب وطالبة واكتسب مهارات البرمجة والذكاء الاصطناعي بطريقة مبسطة وممتعة.
              دوراتنا مصممة خصيصاً لطلاب أولى ثانوي.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              {features.map((f, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                    isDark ? 'bg-white/5 text-gray-300' : 'bg-white text-gray-600'
                  }`}
                  style={{ border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb' }}
                >
                  <span className="text-green-500">{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              <motion.button
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
              >
                ابدأ رحلتك الآن
                <ArrowLeft size={18} />
              </motion.button>
              <motion.button
                onClick={() => navigate('/courses')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  isDark
                    ? 'border-white/20 text-white hover:bg-white/5'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Play size={18} className="text-green-500" />
                استعرض الدروس
              </motion.button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-6 pt-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 space-x-reverse">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white flex items-center justify-center text-xs text-white font-bold"
                    >
                      {i === 4 ? '+' : String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  +500 طالب
                </span>
              </div>
              <div className={`h-8 w-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>4.9</span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  تقييم الطلاب
                </span>
              </div>
            </motion.div>
          </div>

          {/* Teacher Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center lg:justify-end relative"
          >
            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-16 h-16 bg-green-500/20 rounded-2xl backdrop-blur-sm border border-green-500/30 flex items-center justify-center"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span className="text-3xl">🚀</span>
            </motion.div>
            <motion.div
              className="absolute top-1/2 -left-8 w-14 h-14 bg-blue-500/20 rounded-2xl backdrop-blur-sm border border-blue-500/30 flex items-center justify-center"
              animate={{
                y: [0, 20, 0],
                rotate: [0, -10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            >
              <span className="text-2xl">💻</span>
            </motion.div>
            <motion.div
              className="absolute -bottom-6 right-1/4 w-12 h-12 bg-purple-500/20 rounded-2xl backdrop-blur-sm border border-purple-500/30 flex items-center justify-center"
              animate={{
                y: [0, -12, 0],
                rotate: [0, 8, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            >
              <span className="text-xl">🤖</span>
            </motion.div>

            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{
                width: 280,
                height: 350,
                background: isDark
                  ? 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(16,185,129,0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(16,185,129,0.05) 100%)',
                border: isDark ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(34,197,94,0.3)',
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.25)',
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Image */}
              <TeacherPhoto className="w-full h-full" />

              {/* Overlay Info */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <h3 className="text-white font-bold text-lg">أ. عامر تمراز</h3>
                <p className="text-green-400 text-sm">معلم البرمجة والذكاء الاصطناعي</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1 text-white/80 text-xs">
                    <BookOpen size={12} />
                    <span>+30 درس</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-xs">
                    <Clock size={12} />
                    <span>500+ ساعة</span>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div
                className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-gray-900">5.0</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
