import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Play, Users, Star } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useAuthStore } from '../../store/authStore';

const courses = [
  {
    id: 1,
    emoji: '⌨️',
    title: 'البرمجة والذكاء الاصطناعي',
    level: 'أول ثانوي',
    levelColor: 'bg-green-100 text-green-700',
    description: 'منهج البرمجة والذكاء الاصطناعي لطلاب أول ثانوي. يشمل أساسيات البرمجة، Python، ومفاهيم الذكاء الاصطناعي وبناء مشاريع تفاعلية.',
    lessons: 20,
    hours: 16,
    students: 500,
    rating: 4.9,
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
  const { isDark } = useAuthStore();

  return (
    <section
      dir="rtl"
      className={`py-20 ${isDark ? 'bg-[#0d1117]' : 'bg-white'}`}
      id="courses"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span
            className={`inline-block font-semibold text-sm px-4 py-2 rounded-full mb-4 ${
              isDark ? 'bg-green-500/15 text-green-400' : 'bg-green-50 text-green-600'
            }`}
          >
            📚 المادة الدراسية
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            البرمجة والذكاء الاصطناعي
          </h2>
          <p className={`text-lg max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            محتوى تعليمي عالي الجودة مُصمَّم خصيصاً لطلاب أول ثانوي
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          ref={cardsRef}
          className="flex justify-center mb-12"
          variants={containerVariants}
          initial="hidden"
          animate={cardsInView ? 'visible' : 'hidden'}
        >
          {courses.map(course => (
            <motion.div
              key={course.id}
              variants={cardVariants}
              className={`group relative rounded-3xl border p-8 transition-all duration-500 w-full max-w-sm overflow-hidden ${
                isDark
                  ? 'border-green-500/25 bg-gradient-to-br from-white/[0.06] to-white/[0.02]'
                  : `${course.border} bg-gradient-to-br ${course.bg}`
              }`}
              whileHover={{ 
                y: -12,
                boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.25)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Decorative Background Gradient */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${course.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
              <div className={`absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br ${course.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />

              {/* Icon */}
              <motion.div
                className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${course.gradient} flex items-center justify-center text-4xl shadow-xl mb-6`}
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {course.emoji}
              </motion.div>

              <span
                className={`relative inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${
                  isDark ? 'bg-green-500/20 text-green-400' : course.levelColor
                }`}
              >
                {course.level}
              </span>

              <h3
                className={`relative text-xl font-bold mb-3 transition-colors ${
                  isDark ? 'text-white group-hover:text-green-400' : 'text-gray-900 group-hover:text-green-600'
                }`}
              >
                {course.title}
              </h3>
              <p className={`relative text-sm leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {course.description}
              </p>

              <div
                className={`relative flex items-center gap-5 text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen size={15} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                  <span>{course.lessons} درس</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={15} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                  <span>{course.hours} ساعة</span>
                </div>
              </div>

              {/* Additional Info */}
              <div
                className={`relative flex items-center justify-between text-sm mb-6 pb-6 border-b ${
                  isDark ? 'text-gray-400 border-white/10' : 'text-gray-500 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Users size={15} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                  <span>{course.students} طالب</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{course.rating}</span>
                </div>
              </div>

              <Link
                to="/register"
                className={`relative flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-l ${course.gradient} text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95 group-hover:shadow-green-500/30`}
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
              className={`inline-flex items-center gap-2 px-8 py-3.5 border-2 font-bold rounded-2xl transition-all duration-200 ${
                isDark
                  ? 'border-blue-400 text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500'
                  : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
              }`}
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
