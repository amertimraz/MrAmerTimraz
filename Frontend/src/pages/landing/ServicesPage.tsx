import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, type Variants } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen, GraduationCap, MessageCircle, ArrowRight, Eye,
  Presentation, Users, ListChecks, Trophy, Gamepad2, Sparkles, Sun, Moon, Cpu,
} from 'lucide-react';
import { bookletsApi } from '../../api/booklets';
import PdfPreviewModal from '../../components/ui/PdfPreviewModal';
import { useAuthStore } from '../../store/authStore';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import type { Booklet } from '../../types';

const WHATSAPP_NUMBER = '201096066818';
function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const appFeatures = [
  { icon: Presentation, label: 'سبورة تفاعلية' },
  { icon: Users, label: 'مجموعات وطلاب' },
  { icon: ListChecks, label: 'اختبارات فورية' },
  { icon: Trophy, label: 'مسابقات صفية' },
  { icon: Gamepad2, label: 'ألعاب تعليمية' },
];

function TopBar({ isDark, toggleDark }: { isDark: boolean; toggleDark: () => void }) {
  return (
    <header dir="rtl" className={`sticky top-0 z-40 backdrop-blur-md ${isDark ? 'bg-[#0d1117]/80 border-b border-white/5' : 'bg-white/80 border-b border-gray-200/60'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className={`w-9 h-9 rounded-xl overflow-hidden shadow-md border-2 ${isDark ? 'border-green-500/40' : 'border-green-500/50'}`}>
            <img src="/teacher2.png" alt="عامر تمراز" className="w-full h-full object-cover object-top"
              onError={(e) => {
                const p = e.currentTarget.parentElement!;
                p.className = 'w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white';
                p.style.background = 'linear-gradient(135deg,#22c55e,#15803d)';
                e.currentTarget.replaceWith(document.createTextNode('عا'));
              }}
            />
          </div>
          <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>مستر عامر تمراز</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to="/"
            className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            الرئيسية <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function ServicesPage() {
  const { isDark, toggleDark } = useAuthStore();
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

  const bookletCard = isDark
    ? { background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(34,197,94,0.35)', boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }
    : { background: '#ffffff', border: '2px solid rgba(34,197,94,0.3)', boxShadow: '0 6px 24px rgba(0,0,0,0.08)' };

  const text = isDark ? 'text-white' : 'text-gray-900';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col"
      style={{
        background: isDark
          ? 'linear-gradient(160deg, #0d1117 0%, #111827 60%, #0d1117 100%)'
          : 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 60%, #f8fafc 100%)',
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      <Helmet>
        <title>خدماتي | منصة الأستاذ عامر تمراز</title>
        <meta name="description" content="كل خدمات الأستاذ عامر تمراز في مكان واحد — مذكرات لكل المراحل الدراسية وتطبيق Active Class لإدارة الحصة." />
      </Helmet>

      <TopBar isDark={isDark} toggleDark={toggleDark} />

      {/* Hero */}
      <div className="pt-16 pb-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(34,197,94,0.12) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <motion.span
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-5 ${isDark ? 'text-green-400' : 'text-green-600'}`}
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <Sparkles size={13} className="inline ml-1 -mt-0.5" /> خدماتي
          </motion.span>
          <motion.h1
            className={`text-4xl sm:text-6xl font-black mb-5 leading-tight ${text}`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            كل خدماتي في <span style={{ color: '#22c55e' }}>مكان واحد</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}
            style={isDark
              ? { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }
              : { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            <Cpu size={16} style={{ color: '#22c55e' }} /> تخصصي: التكنولوجيا والبرمجة والذكاء الاصطناعي
          </motion.div>
          <motion.p
            className={`text-base sm:text-lg leading-relaxed mb-8 ${subtext}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            مذكرات دراسية لمختلف المراحل بنسخة للطالب ونسخة للمعلم، وتطبيق متخصص لمساعدة المدرسين على إدارة حصصهم بكفاءة.
          </motion.p>
          <motion.a
            href={waLink('مرحبًا، عندي استفسار عن خدمات المنصة')}
            target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white text-sm shadow-lg shadow-green-500/25"
            style={{ background: '#22c55e' }}
          >
            <MessageCircle size={18} /> تواصل معي واتساب
          </motion.a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 flex-1 w-full">

        {/* Booklets / Notes */}
        <div ref={notesRef} className="mb-20">
          <motion.div className="mb-8"
            initial={{ opacity: 0, y: 20 }} animate={notesInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <span
              className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
            >
              <BookOpen size={13} className="inline ml-1 -mt-0.5" /> المذكرات الدراسية
            </span>
            <h2 className={`text-2xl sm:text-3xl font-black ${text}`}>مذكرات لكل المراحل الدراسية</h2>
            <p className={`text-sm mt-1.5 ${subtext}`}>لكل مذكرة نسخة للطالب ونسخة للمعلم — اطلب مباشرة على واتساب</p>
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
              {[1, 2, 3].map(i => <div key={i} className="h-80 rounded-2xl animate-pulse" style={card} />)}
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
                <BookletServiceCard key={booklet.id} booklet={booklet} card={bookletCard} isDark={isDark} />
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
                <a
                  href={waLink('مرحبًا، عايز أعرف تفاصيل أكتر عن تطبيق Active Class لإدارة الحصة الدراسية')}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg shadow-blue-500/20"
                  style={{ background: '#3b82f6' }}
                >
                  <MessageCircle size={16} /> تواصل معي لمعرفة التفاصيل
                </a>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>قريباً — تواصل معي للحصول على أولوية التجربة</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Minimal footer */}
      <footer dir="rtl" className={`py-8 text-center text-xs border-t ${isDark ? 'border-white/5 text-gray-600' : 'border-gray-200 text-gray-500'}`}>
        <p>© {new Date().getFullYear()} مستر عامر تمراز — جميع الحقوق محفوظة</p>
      </footer>

      {/* Floating WhatsApp button */}
      <motion.a
        href={waLink('مرحبًا، عندي استفسار عن خدمات المنصة')}
        target="_blank" rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30"
        style={{ background: '#25D366' }}
        aria-label="تواصل عبر واتساب"
      >
        <MessageCircle size={26} className="text-white" fill="white" />
      </motion.a>
    </div>
  );
}

function BookletServiceCard({ booklet, card, isDark }: { booklet: Booklet; card: React.CSSProperties; isDark: boolean }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const studentMsg = waLink(`مرحبًا، أنا مهتم بشراء مذكرة "${booklet.title}"\nنسخة الطالب${booklet.price > 0 ? ` - ${booklet.price} ج.م` : ''}`);
  const teacherMsg = waLink(`مرحبًا، أنا مهتم بشراء مذكرة "${booklet.title}"\nنسخة المعلم${booklet.teacherPrice ? ` - ${booklet.teacherPrice} ج.م` : ''}`);

  return (
    <motion.div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={card}
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } } as Variants}
      whileHover={{ y: -6, borderColor: '#22c55e' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative aspect-[3/2] bg-gray-100 dark:bg-gray-900 overflow-hidden group/cover">
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
        {!!booklet.pageCount && (
          <span className="absolute top-3 left-3 bg-black/60 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur flex items-center gap-1">
            <BookOpen size={11} /> {booklet.pageCount} صفحة
          </span>
        )}
        {booklet.pdfUrl && (
          <button
            onClick={() => setPreviewOpen(true)}
            className="absolute inset-x-0 bottom-0 py-2.5 flex items-center justify-center gap-1.5 text-white text-xs font-bold opacity-0 group-hover/cover:opacity-100 transition-opacity"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}
          >
            <Eye size={14} /> معاينة أول 5 صفحات
          </button>
        )}
      </div>

      {previewOpen && (
        <PdfPreviewModal
          url={bookletsApi.getPreviewUrl(booklet.id)}
          title={booklet.title}
          maxPages={5}
          onClose={() => setPreviewOpen(false)}
          studentWaLink={studentMsg}
          teacherWaLink={booklet.teacherPrice ? teacherMsg : undefined}
        />
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          {booklet.subject ? (
            <span className="text-[11px] font-bold text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-full">
              {booklet.subject}
            </span>
          ) : <span />}
          {booklet.pdfUrl && (
            <button
              onClick={() => setPreviewOpen(true)}
              className={`shrink-0 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${isDark ? 'text-green-400 border-green-500/30 hover:bg-green-500/10' : 'text-green-700 border-green-300 hover:bg-green-50'}`}
            >
              <Eye size={12} /> معاينة
            </button>
          )}
        </div>

        <h3 className={`font-bold text-base mb-1.5 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{booklet.title}</h3>
        {booklet.description && (
          <p className={`text-xs leading-relaxed line-clamp-2 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{booklet.description}</p>
        )}

        <div className={`mt-auto grid gap-2.5 pt-4 border-t ${booklet.teacherPrice ? 'grid-cols-2' : 'grid-cols-1'}`}
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
          <a
            href={studentMsg}
            target="_blank" rel="noopener noreferrer"
            className="group/price flex flex-col items-center gap-1 rounded-2xl px-3 py-3.5 text-center transition-all hover:-translate-y-0.5"
            style={isDark
              ? { background: 'rgba(34,197,94,0.12)', border: '1.5px solid rgba(34,197,94,0.4)' }
              : { background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.35)' }}
          >
            <span className={`text-[11px] font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>نسخة الطالب</span>
            <span className="text-2xl font-black leading-none" style={{ color: '#16a34a' }}>
              {booklet.price > 0 ? booklet.price : 'مجاني'}
              {booklet.price > 0 && <span className="text-xs font-bold mr-1">ج.م</span>}
            </span>
            <span className={`flex items-center gap-1 text-[11px] font-bold mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              <MessageCircle size={12} /> اطلب الآن
            </span>
          </a>
          {!!booklet.teacherPrice && (
            <a
              href={teacherMsg}
              target="_blank" rel="noopener noreferrer"
              className="group/price flex flex-col items-center gap-1 rounded-2xl px-3 py-3.5 text-center transition-all hover:-translate-y-0.5"
              style={isDark
                ? { background: 'rgba(14,165,233,0.12)', border: '1.5px solid rgba(14,165,233,0.4)' }
                : { background: 'rgba(14,165,233,0.08)', border: '1.5px solid rgba(14,165,233,0.35)' }}
            >
              <span className={`text-[11px] font-bold ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>نسخة المعلم</span>
              <span className="text-2xl font-black leading-none" style={{ color: '#0284c7' }}>
                {booklet.teacherPrice}
                <span className="text-xs font-bold mr-1">ج.م</span>
              </span>
              <span className={`flex items-center gap-1 text-[11px] font-bold mt-1 ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
                <MessageCircle size={12} /> اطلب الآن
              </span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
