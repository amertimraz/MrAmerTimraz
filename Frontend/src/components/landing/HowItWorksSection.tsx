import { motion, type Variants } from 'framer-motion';
import { UserPlus, BookOpen, Award, TrendingUp } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useAuthStore } from '../../store/authStore';

const steps = [
  {
    icon: <UserPlus size={32} />,
    number: '01',
    title: 'سجّل حسابك مجاناً',
    description: 'أنشئ حسابك في دقائق معدودة وابدأ رحلتك التعليمية معنا.',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: <BookOpen size={32} />,
    number: '02',
    title: 'اختر الدورة المناسبة',
    description: 'تصفح دوراتنا المتنوعة واختر ما يناسب مستواك واهتماماتك.',
    color: 'from-green-500 to-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: <Award size={32} />,
    number: '03',
    title: 'تعلم واختبر نفسك',
    description: 'شاهد الدروس التفاعلية وحل الاختبارات لتعزيز فهمك.',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: <TrendingUp size={32} />,
    number: '04',
    title: 'تابع تقدمك',
    description: 'راقب أداءك ونتائجك عبر لوحة التحكم وتابع تحسنك المستمر.',
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function HowItWorksSection() {
  const { ref: titleRef, isInView: titleInView } = useScrollReveal();
  const { ref: gridRef, isInView: gridInView } = useScrollReveal();
  const { isDark } = useAuthStore();

  return (
    <section dir="rtl" className={`py-20 ${isDark ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          ref={titleRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className={`inline-block font-semibold text-sm px-4 py-2 rounded-full mb-4 ${
            isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}>
            🎯 كيف نعمل؟
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            4 خطوات بسيطة للبدء
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'} max-w-2xl mx-auto`}>
            رحلتك التعليمية تبدأ بخطوات بسيطة وسهلة. اتبع هذه الخطوات وابدأ التعلم معنا اليوم.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={gridInView ? 'visible' : 'hidden'}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`relative group p-8 rounded-3xl border transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-green-500/30 hover:bg-white/10'
                  : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-2xl'
              }`}
              whileHover={{ y: -10 }}
            >
              {/* Step Number Badge */}
              <div className={`absolute -top-4 right-6 w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform`}>
                {step.number}
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 ${step.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <div className={`bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {step.title}
              </h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {step.description}
              </p>

              {/* Connector Line (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-green-500/30 to-transparent" />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={gridInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-14"
        >
          <motion.button
            onClick={() => window.location.href = '/register'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-lg shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all"
            style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
          >
            ابدأ الآن مجاناً
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
