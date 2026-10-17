import { Video, FileText, BarChart2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

const features = [
  { icon: <Video size={22} />,       title: 'فيديوهات تعليمية',  description: 'شاهد الدروس في أي وقت ومن أي مكان.',        color: 'text-blue-600',   bg: 'bg-blue-50' },
  { icon: <FileText size={22} />,    title: 'اختبارات تفاعلية', description: 'أسئلة صح/خطأ واختياري وأكمل وترتيب.',        color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: <BarChart2 size={22} />,   title: 'تتبع التقدم',      description: 'راقب أداءك ونتائجك أولاً بأول.',            color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: <ShieldCheck size={22} />, title: 'بيئة آمنة',        description: 'خصوصية بيانات الطلاب والأولياء محمية.',      color: 'text-teal-600',   bg: 'bg-teal-50' },
];

export default function FeaturesSection() {
  const { isDark } = useAuthStore();

  return (
    <section dir="rtl" className={`py-14 sm:py-16 ${isDark ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          لماذا تختار منصتنا؟
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {features.map(f => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className={`rounded-2xl p-4 sm:p-6 border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'
              }`}
            >
              <div className={`w-11 h-11 ${isDark ? 'bg-white/10' : f.bg} ${f.color} rounded-xl flex items-center justify-center mb-3`}>
                {f.icon}
              </div>
              <h3 className={`font-bold text-sm sm:text-base mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.title}</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
