import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, type Variants } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen, GraduationCap, ShoppingBag, MessageCircle,
  Presentation, Users, ListChecks, Trophy, Gamepad2, Sparkles,
} from 'lucide-react';
import { bookletsApi } from '../../api/booklets';
import { useAuthStore } from '../../store/authStore';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import type { Booklet } from '../../types';

const appFeatures = [
  { icon: Presentation, label: 'سبورة تفاعلية' },
  { icon: Users, label: 'مجموعات وطلاب' },
  { icon: ListChecks, label: 'اختبارات فورية' },
  { icon: Trophy, label: 'مسابقات صفية' },
  { icon: Gamepad2, label: 'ألعاب تعليمية' },
];

export default function ServicesPage() {
  const { isDark } = useAuthStore();
  const [gradeFilter, setGradeFilter] = useState<string>('الكل');
  const { ref: notesRef, isInView: notesInView } = useScrollReveal();
  const { ref: appRef, isInView: appInView } = useScrollReveal();

  const { data: booklets = [], isLoading } = useQuery({
    queryKey: ['services-booklets'],
    queryFn: () => bookletsApi.getAll(),
  });

  const published = booklets.filter(b => b.isPublished);
  const grades = ['الكل', ...Array.from(new Set(published.map(b => b.gradeLevel).filter(Boolean))) as string[]];
  const visible = gradeFilter === 'الكل' ? published : published.filter(b => b.gradeLevel === gradeFilter);

  const card = isDark
    ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
    : { background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };

  const text = isDark ? 'text-white' : 'text-gray-900';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <div dir="rtl" className="min-h-screen">
      <Helmet>
        <title>خدماتي | منصة الأستاذ عامر تمراز</title>
        <meta name="description" content="كل خدمات الأستاذ عامر تمراز في مكان واحد — مذكرات لكل المراحل الدراسية وتطبيق Active Class لإدارة الحصة." />
      </Helmet>

      {/* Header */}
      <div className="pt-28 pb-14 text-center relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <motion.span
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-5 ${isDark ? 'text-green-400' : 'text-green-600'}`}
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <Sparkles size={13} className="inline ml-1 -mt-0.5" /> خدماتي
          </motion.span>
          <motion.h1
            className={`text-4xl sm:text-5xl font-black mb-4 ${text}`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            كل خدماتي في مكان واحد
          </motion.h1>
          <motion.p
            className={`text-base leading-relaxed ${subtext}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            مذكرات دراسية لمختلف المراحل، وتطبيق متخصص لمساعدة المدرسين على إدارة حصصهم بكفاءة.
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Booklets / Notes */}
        <div ref={notesRef} className="mb-20">
          <motion.div className="flex flex-wrap items-center justify-between gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }} animate={notesInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <div>
              <span
                className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
              >
                <BookOpen size={13} className="inline ml-1 -mt-0.5" /> المذكرات الدراسية
              </span>
              <h2 className={`text-2xl sm:text-3xl font-black ${text}`}>مذكرات لكل المراحل الدراسية</h2>
              <p className={`text-sm mt-1.5 ${subtext}`}>لكل مذكرة نسخة للطالب ونسخة للمعلم بسعر خاص</p>
            </div>
            <Link
              to="/booklet-store"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-green-500/20"
              style={{ background: '#22c55e' }}
            >
              <ShoppingBag size={16} /> متجر المذكرات
            </Link>
          </motion.div>

          {grades.length > 2 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {grades.map(g => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    gradeFilter === g
                      ? 'bg-green-500 text-white'
                      : isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-2xl animate-pulse" style={card} />)}
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={card}>
              <p className={subtext}>لا توجد مذكرات منشورة حالياً في هذا القسم.</p>
            </div>
          ) : (
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial="hidden"
              animate={notesInView ? 'visible' : 'hidden'}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } } as Variants}
            >
              {visible.map(booklet => (
                <BookletServiceCard key={booklet.id} booklet={booklet} card={card} isDark={isDark} />
              ))}
            </motion.div>
          )}
        </div>

        {/* Teacher Apps */}
        <div ref={appRef}>
          <motion.div className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }} animate={appInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <span
              className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              <GraduationCap size={13} className="inline ml-1 -mt-0.5" /> تطبيقات المدرس
            </span>
            <h2 className={`text-2xl sm:text-3xl font-black ${text}`}>أدوات لإدارة حصتك الدراسية</h2>
          </motion.div>

          <motion.div
            className="rounded-3xl overflow-hidden max-w-4xl mx-auto"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(15,23,42,0.6) 100%)', border: '1px solid rgba(59,130,246,0.2)' }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={appInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#1e40af)' }}>
                  <Presentation size={28} className="text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${text}`}>Active Class</h3>
                  <p className={`text-sm ${subtext}`}>تطبيق متكامل لإدارة الحصة الدراسية</p>
                </div>
              </div>
              <p className={`text-sm leading-relaxed mb-6 ${subtext}`}>
                تطبيق يساعد المدرس على إدارة حصته بكل سهولة: سبورة تفاعلية، تقسيم الطلاب لمجموعات، إجراء اختبارات ومسابقات فورية، وألعاب تعليمية تزيد من تفاعل الطلاب داخل الفصل.
              </p>
              <div className="flex flex-wrap gap-2 mb-7">
                {appFeatures.map(f => (
                  <span key={f.label}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                    style={isDark ? { background: 'rgba(255,255,255,0.06)' } : { background: 'rgba(0,0,0,0.05)' }}
                  >
                    <f.icon size={13} /> {f.label}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/contact"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg shadow-blue-500/20"
                  style={{ background: '#3b82f6' }}
                >
                  <MessageCircle size={16} /> تواصل معي لمعرفة التفاصيل
                </Link>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>قريباً — تواصل معي للحصول على أولوية التجربة</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function BookletServiceCard({ booklet, card, isDark }: { booklet: Booklet; card: React.CSSProperties; isDark: boolean }) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={card}
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } } as Variants}
      whileHover={{ y: -4 }}
    >
      <div className="relative aspect-[3/2] bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {booklet.coverImageUrl ? (
          <img src={booklet.coverImageUrl} alt={booklet.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <BookOpen size={40} />
          </div>
        )}
        {booklet.gradeLevel && (
          <span className="absolute top-3 right-3 bg-black/60 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur">
            {booklet.gradeLevel}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        {booklet.subject && (
          <span className="text-[11px] font-bold text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-full self-start mb-2">
            {booklet.subject}
          </span>
        )}
        <h3 className={`font-bold text-base mb-1.5 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{booklet.title}</h3>
        {booklet.description && (
          <p className={`text-xs leading-relaxed line-clamp-2 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{booklet.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
          <div className="text-xs">
            <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>سعر الطالب</p>
            <p className="font-black text-green-500">{booklet.price > 0 ? `${booklet.price} ج.م` : 'مجاني'}</p>
          </div>
          {!!booklet.teacherPrice && (
            <div className="text-xs text-left">
              <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>سعر المعلم</p>
              <p className="font-black text-sky-500">{booklet.teacherPrice} ج.م</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
