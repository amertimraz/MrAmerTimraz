import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, type Variants } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen, GraduationCap, MessageCircle, ArrowRight, Eye,
  Presentation, Users, ListChecks, Trophy, Gamepad2, Sun, Moon,
  Gift, Download, FileText, ChevronLeft, ChevronRight, Sparkles, Percent,
} from 'lucide-react';
import { bookletsApi } from '../../api/booklets';
import { freeResourcesApi } from '../../api/freeResources';
import { teacherPackagesApi } from '../../api/teacherPackages';
import PdfPreviewModal from '../../components/ui/PdfPreviewModal';
import { useAuthStore } from '../../store/authStore';
import type { Booklet, FreeResource, TeacherPackage } from '../../types';

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

type View = 'home' | 'grade' | 'results' | 'free' | 'app' | 'teacherPackages';

function TopBar({ isDark, toggleDark }: { isDark: boolean; toggleDark: () => void }) {
  return (
    <header dir="rtl" className={`sticky top-0 z-40 backdrop-blur-md ${isDark ? 'bg-[#0b0f17]/85 border-b border-white/5' : 'bg-white/85 border-b border-gray-200/60'}`}>
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

function BackButton({ onClick, label, isDark }: { onClick: () => void; label: string; isDark: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-sm font-bold mb-6 px-3.5 py-2 rounded-xl transition-colors ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      <ChevronRight size={16} /> {label}
    </button>
  );
}

function HintBanners({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex flex-col gap-2.5 mb-7">
      <div
        className="flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm"
        style={isDark
          ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#bbf7d0' }
          : { background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', color: '#166534' }}
      >
        <Sparkles size={16} className="shrink-0 mt-0.5" />
        <span>بنشتغل باستمرار على تجهيز كل المذكرات، وأول ما أي مذكرة تخلص بترفع على الموقع على طول.</span>
      </div>
      <a
        href={waLink('مرحبًا، عايز أعرف تفاصيل عرض الباكدج الكامل بخصم')}
        target="_blank" rel="noopener noreferrer"
        className="flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm transition-transform hover:-translate-y-0.5"
        style={isDark
          ? { background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.22)', color: '#bae6fd' }
          : { background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.22)', color: '#075985' }}
      >
        <Percent size={16} className="shrink-0 mt-0.5" />
        <span>عايز الباكدج كامل بخصم كويس؟ تواصل معايا واتساب وهرتبلك.</span>
      </a>
    </div>
  );
}

export default function ServicesPage() {
  const { isDark, toggleDark } = useAuthStore();
  const [view, setView] = useState<View>('home');
  const [gradeFilter, setGradeFilter] = useState<string>('الكل');
  const [termFilter, setTermFilter] = useState<string>('الكل');
  const [previewOpen, setPreviewOpen] = useState<Booklet | null>(null);

  const { data: booklets = [], isLoading } = useQuery({
    queryKey: ['services-booklets'],
    queryFn: () => bookletsApi.getAll(),
  });

  const { data: freeResources = [], isLoading: isLoadingFree } = useQuery({
    queryKey: ['services-free-resources'],
    queryFn: () => freeResourcesApi.getAll(),
  });
  const publishedFree = freeResources.filter(r => r.isPublished);

  const { data: teacherPackages = [], isLoading: isLoadingPackages } = useQuery({
    queryKey: ['services-teacher-packages'],
    queryFn: () => teacherPackagesApi.getAll(),
  });
  const publishedPackages = teacherPackages.filter(p => p.isPublished);

  const published = booklets.filter(b => b.isPublished);
  const grades = Array.from(new Set(published.map(b => b.gradeLevel).filter(Boolean))) as string[];
  const byGrade = gradeFilter === 'الكل' ? published : published.filter(b => b.gradeLevel === gradeFilter);
  const terms = ['الكل', ...Array.from(new Set(byGrade.map(b => b.term).filter(Boolean))) as string[]];
  const visible = termFilter === 'الكل' ? byGrade : byGrade.filter(b => b.term === termFilter);

  const goToGrade = (g: string) => {
    setGradeFilter(g);
    setTermFilter('الكل');
    setView('results');
  };

  const card = isDark
    ? { background: '#141b26', border: '1px solid rgba(255,255,255,0.08)' }
    : { background: '#ffffff', border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };

  const bookletCard = isDark
    ? { background: '#141b26', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 12px 32px -8px rgba(0,0,0,0.5)' }
    : { background: '#ffffff', border: '1px solid rgba(15,23,42,0.07)', boxShadow: '0 12px 32px -12px rgba(15,23,42,0.18)' };

  const text = isDark ? 'text-white' : 'text-gray-900';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-500';

  const pageMotion = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.25 },
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col"
      style={{
        background: isDark ? '#0b0f17' : '#f8fafb',
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      <Helmet>
        <title>خدماتي | منصة الأستاذ عامر تمراز</title>
        <meta name="description" content="كل خدمات الأستاذ عامر تمراز في مكان واحد — مذكرات لكل المراحل الدراسية وتطبيق Active Class لإدارة الحصة." />
      </Helmet>

      <TopBar isDark={isDark} toggleDark={toggleDark} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 flex-1 w-full">
        <motion.div key={view} {...pageMotion}>

          {/* ── Home: pick a path ─────────────────────────────────── */}
          {view === 'home' && (
            <>
              <div className="text-center mb-10">
                <h1 className={`text-3xl sm:text-4xl font-black mb-2 ${text}`}>عايز إيه من خدماتي؟</h1>
                <p className={`text-sm sm:text-base ${subtext}`}>اختار من هنا وهوريك اللي يناسبك على طول</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
                <ChoiceCard
                  icon={BookOpen} color="#22c55e" isDark={isDark}
                  title="المذكرات الدراسية" desc="اختار مرحلتك وشوف المذكرات المتاحة"
                  onClick={() => setView('grade')}
                />
                <ChoiceCard
                  icon={Gift} color="#f59e0b" isDark={isDark}
                  title="ملفات مجانية" desc="PDF أو PowerPoint تحمّلها فورًا"
                  onClick={() => setView('free')}
                />
                <ChoiceCard
                  icon={Presentation} color="#a855f7" isDark={isDark}
                  title="باكدج بوربوينت للمعلمين" desc="دروس بوربوينت جاهزة — عينة وسعر وطلب مباشر"
                  onClick={() => setView('teacherPackages')}
                />
                <ChoiceCard
                  icon={GraduationCap} color="#3b82f6" isDark={isDark}
                  title="تطبيقات المدرس" desc="أدوات لإدارة حصتك الدراسية"
                  onClick={() => setView('app')}
                />
              </div>
            </>
          )}

          {/* ── Grade picker ──────────────────────────────────────── */}
          {view === 'grade' && (
            <>
              <BackButton onClick={() => setView('home')} label="رجوع" isDark={isDark} />
              <div className="text-center mb-9">
                <h1 className={`text-2xl sm:text-3xl font-black mb-2 ${text}`}>اختار مرحلتك الدراسية</h1>
                <p className={`text-sm ${subtext}`}>هنوريك المذكرات المتاحة لمرحلتك بس</p>
              </div>

              {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={card} />)}
                </div>
              ) : grades.length === 0 ? (
                <div className="rounded-2xl p-10 text-center max-w-md mx-auto" style={card}>
                  <p className={subtext}>لا توجد مذكرات منشورة حالياً.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {grades.map(g => (
                    <button
                      key={g}
                      onClick={() => goToGrade(g)}
                      className="flex items-center justify-between gap-3 px-5 py-4 rounded-2xl font-bold transition-all hover:-translate-y-0.5"
                      style={card}
                    >
                      <span className={text}>{g}</span>
                      <ChevronLeft size={18} className="text-green-500 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Results: filtered booklets ────────────────────────── */}
          {view === 'results' && (
            <>
              <BackButton onClick={() => setView('grade')} label="تغيير المرحلة" isDark={isDark} />
              <div className="mb-6">
                <span className="text-xs font-bold text-green-500">{gradeFilter}</span>
                <h1 className={`text-2xl sm:text-3xl font-black ${text}`}>مذكرات هذه المرحلة</h1>
              </div>

              <HintBanners isDark={isDark} />

              {terms.length > 2 && (
                <div className="mb-7">
                  <p className={`text-xs font-bold mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>الفصل الدراسي</p>
                  <div className="flex flex-wrap gap-2">
                    {terms.map(t => (
                      <button
                        key={t}
                        onClick={() => setTermFilter(t)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          termFilter === t
                            ? 'bg-sky-500 text-white'
                            : isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {visible.length === 0 ? (
                <div className="rounded-2xl p-10 text-center" style={card}>
                  <p className={subtext}>لا توجد مذكرات منشورة لهذا الاختيار حاليًا.</p>
                </div>
              ) : (
                <motion.div
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial="hidden" animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } } as Variants}
                >
                  {visible.map(booklet => (
                    <BookletServiceCard key={booklet.id} booklet={booklet} card={bookletCard} isDark={isDark} onPreview={() => setPreviewOpen(booklet)} />
                  ))}
                </motion.div>
              )}
            </>
          )}

          {/* ── Free resources ────────────────────────────────────── */}
          {view === 'free' && (
            <>
              <BackButton onClick={() => setView('home')} label="رجوع" isDark={isDark} />
              <div className="mb-7">
                <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>خدمات مجانية</span>
                <h1 className={`text-2xl sm:text-3xl font-black ${text}`}>ملفات مجانية تقدر تحمّلها فورًا</h1>
                <p className={`text-sm mt-1 ${subtext}`}>PDF أو PowerPoint — بدون أي مقابل، حمّلها بضغطة واحدة</p>
              </div>

              {isLoadingFree ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-72 rounded-3xl animate-pulse" style={card} />)}
                </div>
              ) : publishedFree.length === 0 ? (
                <div className="rounded-2xl p-10 text-center" style={card}>
                  <p className={subtext}>لا توجد ملفات مجانية منشورة حالياً.</p>
                </div>
              ) : (
                <motion.div
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial="hidden" animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } } as Variants}
                >
                  {publishedFree.map(resource => (
                    <FreeResourceCard key={resource.id} resource={resource} card={card} isDark={isDark} />
                  ))}
                </motion.div>
              )}
            </>
          )}

          {/* ── Teacher PowerPoint packages ──────────────────────── */}
          {view === 'teacherPackages' && (
            <>
              <BackButton onClick={() => setView('home')} label="رجوع" isDark={isDark} />
              <div className="mb-7">
                <span className="text-xs font-bold" style={{ color: '#a855f7' }}>خاص بالمعلمين</span>
                <h1 className={`text-2xl sm:text-3xl font-black ${text}`}>باكدجات دروس بوربوينت جاهزة</h1>
                <p className={`text-sm mt-1 ${subtext}`}>عاين عينة من الباكدج، وابعت طلبك على واتساب برسالة جاهزة</p>
              </div>

              {isLoadingPackages ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-72 rounded-3xl animate-pulse" style={card} />)}
                </div>
              ) : publishedPackages.length === 0 ? (
                <div className="rounded-2xl p-10 text-center" style={card}>
                  <p className={subtext}>لا توجد باكدجات منشورة حالياً.</p>
                </div>
              ) : (
                <motion.div
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial="hidden" animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } } as Variants}
                >
                  {publishedPackages.map(pkg => (
                    <TeacherPackageCard key={pkg.id} pkg={pkg} card={card} isDark={isDark} />
                  ))}
                </motion.div>
              )}
            </>
          )}

          {/* ── Teacher app ───────────────────────────────────────── */}
          {view === 'app' && (
            <>
              <BackButton onClick={() => setView('home')} label="رجوع" isDark={isDark} />
              <div className="mb-7">
                <span className="text-xs font-bold text-blue-500">تطبيقات المدرس</span>
                <h1 className={`text-2xl sm:text-3xl font-black ${text}`}>أدوات لإدارة حصتك الدراسية</h1>
              </div>

              <motion.div
                className="rounded-[28px] overflow-hidden max-w-4xl"
                style={isDark
                  ? { background: 'linear-gradient(135deg, rgba(59,130,246,0.14) 0%, #101827 60%)', border: '1px solid rgba(59,130,246,0.25)' }
                  : { background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, #ffffff 55%)', border: '1px solid rgba(59,130,246,0.18)', boxShadow: '0 12px 32px -12px rgba(15,23,42,0.12)' }}
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
              >
                <div className="p-7 sm:p-10">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20"
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
                        style={isDark ? { background: 'rgba(255,255,255,0.06)' } : { background: 'rgba(15,23,42,0.04)' }}
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
                    <span className={`text-xs ${subtext}`}>قريباً — تواصل معي للحصول على أولوية التجربة</span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      {/* Minimal footer */}
      <footer dir="rtl" className={`py-8 text-center text-xs border-t ${isDark ? 'border-white/5 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
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
        transition={{ delay: 0.3, type: 'spring' }}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30"
        style={{ background: '#25D366' }}
        aria-label="تواصل عبر واتساب"
      >
        <MessageCircle size={26} className="text-white" fill="white" />
      </motion.a>

      {previewOpen && (
        <PdfPreviewModal
          url={bookletsApi.getPreviewUrl(previewOpen.id)}
          title={previewOpen.title}
          maxPages={5}
          onClose={() => setPreviewOpen(null)}
          studentWaLink={waLink(`مرحبًا، أنا مهتم بشراء مذكرة "${previewOpen.title}"\nنسخة الطالب${previewOpen.price > 0 ? ` - ${previewOpen.price} ج.م` : ''}`)}
          teacherWaLink={previewOpen.teacherPrice ? waLink(`مرحبًا، أنا مهتم بشراء مذكرة "${previewOpen.title}"\nنسخة المعلم - ${previewOpen.teacherPrice} ج.م`) : undefined}
        />
      )}
    </div>
  );
}

function ChoiceCard({
  icon: Icon, color, title, desc, onClick, isDark,
}: {
  icon: React.ElementType; color: string; title: string; desc: string; onClick: () => void; isDark: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      className="text-center p-7 rounded-3xl transition-shadow"
      style={isDark
        ? { background: '#141b26', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 12px 32px -8px rgba(0,0,0,0.5)' }
        : { background: '#ffffff', border: '1px solid rgba(15,23,42,0.07)', boxShadow: '0 12px 32px -12px rgba(15,23,42,0.15)' }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: `${color}1a`, border: `1px solid ${color}33` }}
      >
        <Icon size={26} style={{ color }} />
      </div>
      <h3 className={`font-black text-lg mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
    </motion.button>
  );
}

function BookletServiceCard({ booklet, card, isDark, onPreview }: { booklet: Booklet; card: React.CSSProperties; isDark: boolean; onPreview: () => void }) {
  const studentMsg = waLink(`مرحبًا، أنا مهتم بشراء مذكرة "${booklet.title}"\nنسخة الطالب${booklet.price > 0 ? ` - ${booklet.price} ج.م` : ''}`);
  const teacherMsg = waLink(`مرحبًا، أنا مهتم بشراء مذكرة "${booklet.title}"\nنسخة المعلم${booklet.teacherPrice ? ` - ${booklet.teacherPrice} ج.م` : ''}`);
  const metaBits = [booklet.term, booklet.subject, booklet.pageCount ? `${booklet.pageCount} صفحة` : null].filter(Boolean);

  return (
    <motion.div
      className="rounded-3xl overflow-hidden flex flex-col transition-shadow"
      style={card}
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } } as Variants}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-900/60 overflow-hidden">
        {booklet.coverImageUrl ? (
          <img src={booklet.coverImageUrl} alt={booklet.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <BookOpen size={40} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
        {booklet.gradeLevel && (
          <span className="absolute top-3 right-3 bg-black/55 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur">
            {booklet.gradeLevel}
          </span>
        )}
        {booklet.pdfUrl && (
          <button
            onClick={onPreview}
            className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur transition-colors"
            style={{ background: 'rgba(34,197,94,0.85)' }}
          >
            <Eye size={12} /> معاينة 5 صفحات
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {metaBits.length > 0 && (
          <p className={`text-[11px] font-medium mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {metaBits.join(' · ')}
          </p>
        )}

        <h3 className={`font-bold text-[17px] mb-1.5 leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{booklet.title}</h3>
        {booklet.description && (
          <p className={`text-[13px] leading-relaxed line-clamp-2 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{booklet.description}</p>
        )}
        {!!booklet.viewCount && (
          <p className={`flex items-center gap-1 text-[11px] mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Eye size={11} /> {booklet.viewCount} مشاهدة
          </p>
        )}

        <div className={`mt-auto grid gap-2.5 pt-4 border-t ${booklet.teacherPrice ? 'grid-cols-2' : 'grid-cols-1'}`}
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.06)' }}>
          <a
            href={studentMsg}
            target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 rounded-2xl px-3 py-3.5 text-center transition-all hover:-translate-y-0.5"
            style={isDark
              ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }
              : { background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            <span className={`flex items-center gap-1 text-[11px] font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
              <GraduationCap size={12} /> نسخة الطالب
            </span>
            <span className="text-2xl font-black leading-none mt-1" style={{ color: '#16a34a' }}>
              {booklet.price > 0 ? booklet.price : 'مجاني'}
              {booklet.price > 0 && <span className="text-xs font-bold mr-1">ج.م</span>}
            </span>
            <span className={`flex items-center gap-1 text-[11px] font-bold mt-1.5 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              <MessageCircle size={12} /> اطلب الآن
            </span>
          </a>
          {!!booklet.teacherPrice && (
            <a
              href={teacherMsg}
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 rounded-2xl px-3 py-3.5 text-center transition-all hover:-translate-y-0.5"
              style={isDark
                ? { background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)' }
                : { background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.25)' }}
            >
              <span className={`flex items-center gap-1 text-[11px] font-bold ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>
                <Users size={12} /> نسخة المعلم
              </span>
              <span className="text-2xl font-black leading-none mt-1" style={{ color: '#0284c7' }}>
                {booklet.teacherPrice}
                <span className="text-xs font-bold mr-1">ج.م</span>
              </span>
              <span className={`flex items-center gap-1 text-[11px] font-bold mt-1.5 ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
                <MessageCircle size={12} /> اطلب الآن
              </span>
            </a>
          )}
        </div>
        {!!booklet.teacherPrice && (
          <p className={`text-[11px] mt-2.5 leading-relaxed text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            * نسخة المعلم بتتعمل خصيصًا ببيانات المعلم الشخصية.
          </p>
        )}
      </div>
    </motion.div>
  );
}

function FreeResourceCard({ resource, card, isDark }: { resource: FreeResource; card: React.CSSProperties; isDark: boolean }) {
  const ext = resource.fileUrl.split('.').pop()?.toLowerCase();
  const isPpt = ext === 'ppt' || ext === 'pptx';

  return (
    <motion.div
      className="rounded-3xl overflow-hidden flex flex-col"
      style={card}
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } } as Variants}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-900/60 overflow-hidden">
        {resource.coverImageUrl ? (
          <img src={resource.coverImageUrl} alt={resource.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <FileText size={40} />
          </div>
        )}
        <span className={`absolute top-3 right-3 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur ${isPpt ? 'bg-orange-600/85' : 'bg-red-600/85'}`}>
          {isPpt ? 'PowerPoint' : 'PDF'}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className={`font-bold text-[17px] mb-1.5 leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{resource.title}</h3>
        {resource.description && (
          <p className={`text-[13px] leading-relaxed line-clamp-2 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{resource.description}</p>
        )}
        {!!resource.downloadCount && (
          <p className={`flex items-center gap-1 text-[11px] mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Download size={11} /> {resource.downloadCount} تحميل
          </p>
        )}
        <a
          href={freeResourcesApi.getDownloadUrl(resource.id)}
          className="mt-auto flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-white text-sm transition-transform hover:-translate-y-0.5 shadow-lg shadow-amber-500/20"
          style={{ background: '#f59e0b' }}
        >
          <Download size={16} /> تحميل مجاني
        </a>
      </div>
    </motion.div>
  );
}

function TeacherPackageCard({ pkg, card, isDark }: { pkg: TeacherPackage; card: React.CSSProperties; isDark: boolean }) {
  return (
    <motion.div
      className="rounded-3xl overflow-hidden flex flex-col"
      style={card}
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } } as Variants}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-900/60 overflow-hidden">
        {pkg.coverImageUrl ? (
          <img src={pkg.coverImageUrl} alt={pkg.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Presentation size={40} />
          </div>
        )}
        {pkg.sampleFileUrl && (
          <a
            href={pkg.sampleFileUrl}
            target="_blank" rel="noopener noreferrer"
            className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur bg-black/55 hover:bg-black/70 transition-colors"
          >
            <Eye size={12} /> عاين عينة
          </a>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className={`font-bold text-[17px] mb-1.5 leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{pkg.title}</h3>
        {pkg.description && (
          <p className={`text-[13px] leading-relaxed line-clamp-2 mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{pkg.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3">
          <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{pkg.price}<span className="text-sm font-bold">ج.م</span></span>
          <a
            href={waLink(`مرحبًا، عايز أطلب باكدج "${pkg.title}"`)}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white text-sm transition-transform hover:-translate-y-0.5 shadow-lg shadow-purple-500/20"
            style={{ background: '#a855f7' }}
          >
            <MessageCircle size={16} /> اطلب الآن
          </a>
        </div>
      </div>
    </motion.div>
  );
}
