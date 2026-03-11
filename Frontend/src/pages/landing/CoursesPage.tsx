import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Play, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

const courses = [
  {
    id: 1,
    emoji: '💻',
    title: 'تقنية المعلومات - ابتدائي',
    level: 'ابتدائي',
    levelColor: 'text-blue-500',
    levelBg: 'bg-blue-500/15 border border-blue-500/30',
    description: 'دروس شاملة في تقنية المعلومات للمرحلة الابتدائية. يشمل المنهج أساسيات الحاسب الآلي، مهارات الإنترنت والبحث الآمن، التعامل مع الملفات والمجلدات، والسلامة الرقمية.',
    lessons: 12,
    hours: 8,
    teacher: 'أ. عامر تمراز',
    accent: '#3b82f6',
    topics: ['أساسيات الحاسب', 'الإنترنت الآمن', 'إدارة الملفات', 'السلامة الرقمية'],
  },
  {
    id: 2,
    emoji: '🖥️',
    title: 'الحاسب الآلي - إعدادي',
    level: 'إعدادي',
    levelColor: 'text-purple-500',
    levelBg: 'bg-purple-500/15 border border-purple-500/30',
    description: 'منهج الحاسب الآلي للمرحلة الإعدادية. يغطي برامج Microsoft Office كاملاً (Word, Excel, PowerPoint)، أساسيات الشبكات، والأمن المعلوماتي.',
    lessons: 16,
    hours: 12,
    teacher: 'أ. عامر تمراز',
    accent: '#a855f7',
    topics: ['Microsoft Word', 'Excel & Spreadsheets', 'PowerPoint', 'أمن المعلومات'],
  },
  {
    id: 3,
    emoji: '⌨️',
    title: 'البرمجة - أول ثانوي',
    level: 'أول ثانوي',
    levelColor: 'text-green-500',
    levelBg: 'bg-green-500/15 border border-green-500/30',
    description: 'مدخل إلى عالم البرمجة لطلاب أول ثانوي. يبدأ من Scratch للمبتدئين، ثم ينتقل لأساسيات Python، ويختتم ببناء مشاريع تفاعلية بسيطة.',
    lessons: 20,
    hours: 16,
    teacher: 'أ. عامر تمراز',
    accent: '#22c55e',
    topics: ['Scratch للمبتدئين', 'أساسيات Python', 'المتغيرات والحلقات', 'مشاريع تفاعلية'],
  },
];

const levels = ['الكل', 'ابتدائي', 'إعدادي', 'أول ثانوي'];

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [activeLevel, setActiveLevel] = useState('الكل');
  const { isDark } = useAuthStore();

  const card = isDark
    ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
    : { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };

  const filtered = courses.filter(c => {
    const matchLevel = activeLevel === 'الكل' || c.level === activeLevel;
    const matchSearch = c.title.includes(search) || c.description.includes(search);
    return matchLevel && matchSearch;
  });

  return (
    <div dir="rtl" className="min-h-screen">

      {/* Page Header */}
      <div className="pt-28 pb-14 text-center relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border border-green-500/30 mb-5 ${isDark ? 'text-green-400' : 'text-green-600'}`}
            style={{ background: 'rgba(34,197,94,0.08)' }}
          >
            📚 مكتبة الدروس
          </span>
          <h1 className={`text-4xl sm:text-5xl font-black mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>الدروس المتاحة</h1>
          <p className={`text-base max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>استعرض جميع المواد الدراسية المتاحة على المنصة</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Filters */}
        <motion.div
          className="rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center"
          style={card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-1 min-w-52">
            <Search size={16} className={`absolute right-3 top-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="ابحث عن مادة..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pr-9 pl-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}`}
              style={isDark
                ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                : { background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)' }
              }
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
            {levels.map(level => (
              <motion.button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeLevel === level
                    ? 'text-white'
                    : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeLevel === level
                  ? { background: '#22c55e' }
                  : isDark ? { background: 'rgba(255,255,255,0.05)' } : { background: 'rgba(0,0,0,0.05)' }
                }
                whileTap={{ scale: 0.95 }}
              >
                {level}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.p
          className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          يتم عرض <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{filtered.length}</span> مادة
        </motion.p>

        {/* Cards */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              className={`text-center py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">لا توجد نتائج مطابقة</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } } as Variants}
            >
              {filtered.map(course => (
                <motion.div
                  key={course.id}
                  className="group rounded-3xl overflow-hidden flex flex-col"
                  style={card}
                  variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } } as Variants}
                  whileHover={{ y: -6, borderColor: course.accent + '60' }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                >
                  {/* Card Header */}
                  <div
                    className="h-32 flex items-center justify-center text-5xl relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${course.accent}22, ${course.accent}08)`, borderBottom: `1px solid ${course.accent}20` }}
                  >
                    <motion.span className="relative z-10" whileHover={{ scale: 1.2, rotate: 8 }} transition={{ type: 'spring', stiffness: 400 }}>
                      {course.emoji}
                    </motion.span>
                    <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${course.levelBg} ${course.levelColor}`}>
                      {course.level}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.title}</h3>
                    <p className={`text-sm leading-relaxed mb-4 line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{course.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.topics.map(topic => (
                        <span
                          key={topic}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                          style={isDark ? { background: 'rgba(255,255,255,0.06)' } : { background: 'rgba(0,0,0,0.05)' }}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div
                      className={`flex items-center justify-between text-xs mb-5 pb-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
                      style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
                    >
                      <span className="flex items-center gap-1"><BookOpen size={13} /> {course.lessons} درس</span>
                      <span className="flex items-center gap-1"><Clock size={13} /> {course.hours} ساعة</span>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>👤 {course.teacher}</span>
                    </div>

                    <motion.div className="mt-auto" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        to="/register"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                        style={{ background: course.accent }}
                      >
                        <Play size={15} />
                        ابدأ التعلم مجاناً
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
