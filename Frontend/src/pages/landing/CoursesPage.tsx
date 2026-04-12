import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Play, Search, Filter, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { coursesApi } from '../../api/courses';
import type { Course } from '../../types';

const levels = ['الكل', 'ابتدائي', 'إعدادي', 'أول ثانوي'];

// Helper to get emoji based on category/title
const getEmoji = (title: string, category?: string) => {
  if (title?.includes('برمج') || category?.includes('برمج')) return '⌨️';
  if (title?.includes('حاسب') || category?.includes('حاسب')) return '🖥️';
  if (title?.includes('تقنية') || category?.includes('تقنية')) return '�';
  if (title?.includes('شبكات') || category?.includes('شبكات')) return '🌐';
  if (title?.includes('أمن') || category?.includes('أمن')) return '🔒';
  return '📚';
};

// Helper to get accent color based on category
const getAccent = (category?: string) => {
  if (category?.includes('برمج')) return '#22c55e';
  if (category?.includes('حاسب')) return '#a855f7';
  if (category?.includes('تقنية')) return '#3b82f6';
  return '#22c55e';
};

// Helper to get level from category
const getLevel = (category?: string) => {
  if (category?.includes('ابتدائي')) return 'ابتدائي';
  if (category?.includes('إعدادي')) return 'إعدادي';
  if (category?.includes('ثانوي')) return 'أول ثانوي';
  return 'عام';
};

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [activeLevel, setActiveLevel] = useState('الكل');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useAuthStore();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await coursesApi.getAll(true); // publishedOnly = true
        setCourses(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('فشل في تحميل الكورسات');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const card = isDark
    ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
    : { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };

  const filtered = courses.filter(c => {
    const level = getLevel(c.category);
    const matchLevel = activeLevel === 'الكل' || level === activeLevel;
    const matchSearch = c.title?.includes(search) || c.description?.includes(search) || false;
    return matchLevel && matchSearch;
  });

  // Get the newest course for the announcement banner
  const newestCourse = courses.length > 0 
    ? courses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

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

        {/* New Course Announcement Banner */}
        {newestCourse && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className={`mb-6 rounded-2xl p-5 border-2 ${isDark 
              ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border-amber-500/50' 
              : 'bg-gradient-to-r from-amber-100 via-orange-100 to-red-100 border-amber-400'}`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className={`flex items-center justify-center w-14 h-14 rounded-full ${isDark ? 'bg-amber-500/30' : 'bg-amber-500'} shrink-0`}>
                <span className="text-2xl">🎉</span>
              </div>
              <div className="flex-1 text-center sm:text-right">
                <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  ✨ كورس جديد تم إضافته للتو!
                </p>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {newestCourse.title}
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {newestCourse.description?.slice(0, 100)}...
                </p>
              </div>
              <Link
                to={`/courses/${newestCourse.id}`}
                className={`shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 ${isDark 
                  ? 'bg-amber-500 text-white hover:bg-amber-400' 
                  : 'bg-amber-600 text-white hover:bg-amber-700'}`}
              >
                👈 اضغط هنا للدخول
              </Link>
            </div>
          </motion.div>
        )}

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
          {loading ? (
            <motion.div
              key="loading"
              className={`text-center py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <Loader2 size={48} className="mx-auto mb-4 animate-spin" />
              <p className="text-lg">جاري تحميل الكورسات...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              className="text-center py-20 text-red-500"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <p className="text-lg">{error}</p>
            </motion.div>
          ) : filtered.length === 0 ? (
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
              {filtered.map(course => {
                const accent = getAccent(course.category);
                const level = getLevel(course.category);
                const emoji = getEmoji(course.title, course.category);
                const levelColor = level === 'ابتدائي' ? 'text-blue-500' : level === 'إعدادي' ? 'text-purple-500' : 'text-green-500';
                const levelBg = level === 'ابتدائي' ? 'bg-blue-500/15 border border-blue-500/30' : level === 'إعدادي' ? 'bg-purple-500/15 border border-purple-500/30' : 'bg-green-500/15 border border-green-500/30';
                
                return (
                  <motion.div
                    key={course.id}
                    className="group rounded-3xl overflow-hidden flex flex-col"
                    style={card}
                    variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } } as Variants}
                    whileHover={{ y: -6, borderColor: accent + '60' }}
                    transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                  >
                    {/* Card Header - Thumbnail Image */}
                    <div
                      className="h-40 flex items-center justify-center relative overflow-hidden bg-gray-100"
                      style={{ borderBottom: `1px solid ${accent}20` }}
                    >
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <motion.span
                          className="text-5xl"
                          whileHover={{ scale: 1.2, rotate: 8 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          {emoji}
                        </motion.span>
                      )}
                      <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${levelBg} ${levelColor} z-10`}>
                        {level}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.title}</h3>
                      <p className={`text-sm leading-relaxed mb-4 line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {course.description || 'لا يوجد وصف'}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                          style={isDark ? { background: 'rgba(255,255,255,0.06)' } : { background: 'rgba(0,0,0,0.05)' }}
                        >
                          {course.videoCount || 0} درس
                        </span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                          style={isDark ? { background: 'rgba(255,255,255,0.06)' } : { background: 'rgba(0,0,0,0.05)' }}
                        >
                          {course.enrolledCount || 0} طالب
                        </span>
                      </div>

                      <div
                        className={`flex items-center justify-between text-xs mb-5 pb-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
                        style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
                      >
                        <span className="flex items-center gap-1"><BookOpen size={13} /> {course.videoCount || 0} درس</span>
                        <span className="flex items-center gap-1"><Clock size={13} /> {course.price > 0 ? course.price + ' ج.م' : 'مجاني'}</span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>👤 {course.teacherName || 'أ. عامر تمراز'}</span>
                      </div>

                      <motion.div className="mt-auto" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        <Link
                          to={`/courses/${course.id}`}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                          style={{ background: accent }}
                        >
                          <Play size={15} />
                          {course.isFree || course.price <= 0 ? 'ابدأ التعلم مجاناً' : 'شاهد التفاصيل'}
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
