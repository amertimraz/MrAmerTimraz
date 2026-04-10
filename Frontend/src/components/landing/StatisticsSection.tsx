import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, BookOpen, Clock, Award } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface StatItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  color: string;
  bg: string;
}

const stats: StatItem[] = [
  { icon: <Users size={28} />, value: 500, suffix: '+', label: 'طالب وطالبة', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: <BookOpen size={28} />, value: 30, suffix: '+', label: 'درس تعليمي', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: <Clock size={28} />, value: 500, suffix: '+', label: 'ساعة محتوى', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: <Award size={28} />, value: 4.9, suffix: '/5', label: 'تقييم عام', color: 'text-orange-600', bg: 'bg-orange-50' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const stepValue = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += stepValue;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current * 10) / 10);
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref}>
      <span className="text-4xl sm:text-5xl font-black">
        {count}{suffix}
      </span>
    </div>
  );
}

export default function StatisticsSection() {
  const { isDark } = useAuthStore();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      dir="rtl"
      className={`py-16 relative overflow-hidden ${isDark ? 'bg-[#0d1117]' : 'bg-white'}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className={`inline-block font-semibold text-sm px-4 py-2 rounded-full mb-4 ${
            isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'
          }`}>
            📊 إنجازاتنا
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            أرقام تتحدث عنا
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            نفتخر بما حققناه من إنجازات مع طلابنا
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`group p-6 rounded-2xl border transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-green-500/30 hover:bg-white/10'
                  : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-xl'
              }`}
              whileHover={{ y: -8 }}
            >
              <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <p className={`text-sm font-medium mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
