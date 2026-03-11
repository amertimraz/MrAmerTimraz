import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Play } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const courses = [
  {
    id: 1,
    emoji: '💻',
    title: 'تقنية المعلومات',
    level: 'ابتدائي',
    levelColor: 'bg-blue-100 text-blue-700',
    description: 'دروس شاملة في تقنية المعلومات للمرحلة الابتدائية. تشمل أساسيات الحاسب، مهارات الإنترنت، والسلامة الرقمية.',
    lessons: 12,
    hours: 8,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'from-blue-50 to-cyan-50',
    border: 'border-blue-100',
    shadow: 'hover:shadow-blue-200/60',
  },
  {
    id: 2,
    emoji: '🖥️',
    title: 'الحاسب الآلي',
    level: 'إعدادي',
    levelColor: 'bg-purple-100 text-purple-700',
    description: 'منهج الحاسب الآلي للمرحلة الإعدادية. يغطي برامج Office، أساسيات الشبكات، والأمن المعلوماتي.',
    lessons: 16,
    hours: 12,
    gradient: 'from-purple-500 to-indigo-500',
    bg: 'from-purple-50 to-indigo-50',
    border: 'border-purple-100',
    shadow: 'hover:shadow-purple-200/60',
  },
  {
    id: 3,
    emoji: '⌨️',
    title: 'البرمجة',
    level: 'أول ثانوي',
    levelColor: 'bg-green-100 text-green-700',
    description: 'مدخل إلى عالم البرمجة لطلاب أول ثانوي. يشمل Scratch, Python الأساسية، وبناء مشاريع تفاعلية.',
    lessons: 20,
    hours: 16,
    gradient: 'from-green-500 to-emerald-500',
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-100',
    shadow: 'hover:shadow-green-200/60',
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } },
};

export default function CoursesSection() {
  const { ref: headerRef, isInView: headerInView } = useScrollReveal();
  const { ref: cardsRef, isInView: cardsInView } = useScrollReveal();

  return (
    <section dir="rtl" className="py-20 bg-white" id="courses">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="inline-block bg-blue-50 text-blue-600 font-semibold text-sm px-4 py-2 rounded-full mb-4">
            📚 مواد دراسية
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">الدروس المتاحة</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            محتوى تعليمي عالي الجودة مُصمَّم خصيصاً لكل مرحلة دراسية
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          ref={cardsRef}
          className="grid md:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate={cardsInView ? 'visible' : 'hidden'}
        >
          {courses.map(course => (
            <motion.div
              key={course.id}
              variants={cardVariants}
              className={`group relative rounded-3xl border ${course.border} bg-gradient-to-br ${course.bg} p-8 hover:shadow-2xl ${course.shadow} transition-shadow duration-300`}
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Icon */}
              <motion.div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${course.gradient} flex items-center justify-center text-3xl shadow-lg mb-6`}
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {course.emoji}
              </motion.div>

              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${course.levelColor}`}>
                {course.level}
              </span>

              <h3 className="text-xl font-bold text-gray-900 mb-3">{course.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{course.description}</p>

              <div className="flex items-center gap-5 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={15} className="text-gray-400" />
                  <span>{course.lessons} درس</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={15} className="text-gray-400" />
                  <span>{course.hours} ساعة</span>
                </div>
              </div>

              <Link
                to="/register"
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-l ${course.gradient} text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95`}
              >
                <Play size={16} />
                ابدأ التعلم
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={cardsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-blue-600 text-blue-600 font-bold rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-200"
            >
              عرض جميع الدروس
              <ArrowLeft size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
