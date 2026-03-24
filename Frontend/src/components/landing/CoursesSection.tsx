import { ArrowLeft, Clock, BookOpen, Play, TrendingUp } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const courses = [
  {
    id: 1,
    emoji: '💻',
    title: 'تقنية المعلومات',
    level: 'المرحلة الابتدائية',
    description: 'دروس شاملة في أساسيات الحاسب، مهارات الإنترنت، والسلامة الرقمية بأسلوب مبسط للصغار.',
    lessons: 12,
    hours: 8,
    accent: 'blue',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    id: 2,
    emoji: '🖥️',
    title: 'الحاسب الآلي',
    level: 'المرحلة الإعدادية',
    description: 'تغطية كاملة لبرامج المكتب، أساسيات الشبكات، والأمن المعلوماتي والذكاء الاصطناعي.',
    lessons: 16,
    hours: 12,
    accent: 'purple',
    gradient: 'from-purple-500 to-indigo-400',
  },
  {
    id: 3,
    emoji: '⌨️',
    title: 'البرمجة',
    level: 'الصف الأول الثانوي',
    description: 'مدخل احترافي لعالم البرمجة باستخدام Python و Scratch مع بناء مشاريع واقعية وتفاعلية.',
    lessons: 20,
    hours: 16,
    accent: 'green',
    gradient: 'from-green-500 to-emerald-400',
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export default function CoursesSection() {
  const { ref: headerRef, isInView: headerInView } = useScrollReveal();
  const { ref: cardsRef, isInView: cardsInView } = useScrollReveal();

  return (
    <section dir="rtl" className="py-32 relative bg-[#0a0e27] overflow-hidden" id="courses">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-0 w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[20%] h-[20%] rounded-full bg-green-500/5 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">

        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border-blue-500/20 mb-6 font-cairo">
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-xs font-black text-blue-400 uppercase tracking-widest">مستقبلك يبدأ هنا</span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-6">الدروس المميزة</h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            محتوى تعليمي عالي الجودة مُصمَّم بمعايير عالمية ليناسب تطلعاتك في كل مرحلة دراسية.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          ref={cardsRef}
          className="grid md:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={cardsInView ? 'visible' : 'hidden'}
        >
          {courses.map(course => (
            <motion.div
              key={course.id}
              variants={cardVariants}
              whileHover={{ y: -12 }}
              className="group relative rounded-[40px] p-1 glass-dark border-white/5 transition-all duration-500 h-full flex flex-col"
            >
              <div className="p-8 flex-1 flex flex-col">
                {/* Icon */}
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${course.gradient} flex items-center justify-center text-4xl shadow-2xl mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  {course.emoji}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full bg-current ${course.accent === 'blue' ? 'text-blue-400' : course.accent === 'purple' ? 'text-purple-400' : 'text-green-400'}`} />
                  <span className="text-xs font-black text-white/50 uppercase tracking-widest">{course.level}</span>
                </div>

                <h3 className="text-2xl font-black text-white mb-4 leading-tight">{course.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-8 flex-1 font-medium italic">
                  "{course.description}"
                </p>

                <div className="flex items-center gap-6 pt-6 border-t border-white/5 mb-8">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-white/20" />
                    <span className="text-sm font-bold text-white/60">{course.lessons} درس</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-white/20" />
                    <span className="text-sm font-bold text-white/60">{course.hours} ساعة</span>
                  </div>
                </div>

                <Link
                  to="/register"
                  className={`group/btn relative h-14 rounded-2xl bg-gradient-to-r ${course.gradient} p-0.5 overflow-hidden transition-all active:scale-95 shadow-2xl`}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 pointer-events-none" />
                  <div className="relative w-full h-full flex items-center justify-center gap-2 px-6">
                    <Play size={18} className="fill-white" />
                    <span className="font-black text-white text-sm">ابدأ رحلة التعلم</span>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={cardsInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          <Link
            to="/courses"
            className="group flex items-center gap-4 px-10 py-5 rounded-2xl glass-dark border-white/5 text-white font-black hover:bg-white/5 transition-all"
          >
            <span>استكشف كل المناهج المتاحة</span>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all">
               <ArrowLeft size={20} />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
