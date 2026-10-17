import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Timer, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const points = [
  { icon: <CheckCircle2 size={18} />, text: 'تصحيح فوري لكل سؤال' },
  { icon: <Timer size={18} />, text: 'توقيت وشريط تقدم' },
  { icon: <Trophy size={18} />, text: 'لوحة صدارة لكل مراجعة' },
];

export default function ReviewsPromoSection() {
  const { isDark } = useAuthStore();

  return (
    <section dir="rtl" className={`py-14 sm:py-16 ${isDark ? 'bg-[#0d1117]' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0d9488] to-[#1e3a8a] p-7 sm:p-10 text-white shadow-xl"
        >
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -right-12 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-block bg-white/15 text-sm font-semibold px-3.5 py-1.5 rounded-full mb-3">
                🏆 مراجعات مجانية — بدون تسجيل دخول
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-snug">
                راجع دروسك وتنافس في لوحة الصدارة
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-5">
                اختار صفك، حل أسئلة صح وغلط واختيار من متعدد، واعرف ترتيبك بين زمايلك.
              </p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90">
                {points.map(p => (
                  <li key={p.text} className="flex items-center gap-1.5">
                    {p.icon}
                    {p.text}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/reviews"
              className="shrink-0 inline-flex items-center justify-center gap-2 bg-white text-[#0f766e] font-bold px-7 py-3.5 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              ابدأ المراجعة الآن
              <ArrowLeft size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
