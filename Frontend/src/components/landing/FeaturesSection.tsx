import { Video, FileText, Gamepad2, Bell, BarChart2, ShieldCheck } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const features = [
  { icon: <Video size={26} />,       title: 'فيديوهات تعليمية',   description: 'شاهد الدروس في أي وقت ومن أي مكان عبر فيديوهات عالية الجودة.',                            color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
  { icon: <FileText size={26} />,    title: 'اختبارات تفاعلية',   description: 'اختبر معلوماتك بأسئلة متنوعة: صح/خطأ، اختياري، أكمل، وترتيب.',                            color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  { icon: <Gamepad2 size={26} />,    title: 'ألعاب تعليمية',      description: 'تعلّم بطريقة ممتعة من خلال ألعاب تفاعلية مبتكرة مرتبطة بالدروس.',                          color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100' },
  { icon: <BarChart2 size={26} />,   title: 'تتبع التقدم',        description: 'راقب أداءك ونتائجك بشكل مفصّل عبر لوحة إحصائيات ذكية.',                                    color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  { icon: <Bell size={26} />,        title: 'إشعارات فورية',      description: 'لا تفوّت أي تحديث أو درس جديد عبر نظام الإشعارات الفوري.',                                  color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-100' },
  { icon: <ShieldCheck size={26} />, title: 'بيئة آمنة',          description: 'منصة آمنة ومحمية تضمن خصوصية بيانات الطلاب والأولياء.',                                     color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-100' },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export default function FeaturesSection() {
  const { ref: titleRef, isInView: titleInView } = useScrollReveal();
  const { ref: gridRef, isInView: gridInView } = useScrollReveal();
  const { ref: bannerRef, isInView: bannerInView } = useScrollReveal();

  return (
    <section dir="rtl" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          ref={titleRef}
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block bg-purple-50 text-purple-600 font-semibold text-sm px-4 py-2 rounded-full mb-4">
            ⭐ مميزات المنصة
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">لماذا تختار منصتنا؟</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            كل ما تحتاجه لتجربة تعليمية متكاملة وممتعة في مكان واحد
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={gridInView ? 'visible' : 'hidden'}
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className={`group p-7 rounded-2xl bg-white border ${feature.border} cursor-default`}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.div
                className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-5`}
                whileHover={{ scale: 1.12, rotate: -5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          ref={bannerRef}
          className="mt-16 rounded-3xl bg-gradient-to-l from-blue-600 to-purple-700 p-10 text-center text-white shadow-2xl overflow-hidden relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={bannerInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* decorative circles */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />

          <h3 className="text-2xl sm:text-3xl font-bold mb-4 relative z-10">
            جاهز لتبدأ رحلتك التعليمية؟
          </h3>
          <p className="text-blue-100 mb-8 text-lg relative z-10">
            انضم لأكثر من 500 طالب يتعلمون معنا الآن
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <motion.a
              href="/register"
              className="px-8 py-3.5 bg-white text-blue-700 font-bold rounded-xl shadow-lg"
              whileHover={{ scale: 1.06, boxShadow: '0 12px 30px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.97 }}
            >
              سجّل مجاناً الآن
            </motion.a>
            <motion.a
              href="/courses"
              className="px-8 py-3.5 bg-white/10 border border-white/30 text-white font-bold rounded-xl"
              whileHover={{ scale: 1.06, backgroundColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.97 }}
            >
              استعرض الدروس
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
