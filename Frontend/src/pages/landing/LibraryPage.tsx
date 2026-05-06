import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { libraryApi } from '../../api/library';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, Search, FolderOpen, Eye, Gamepad2, X, Heart, Copy, CheckCircle2, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import PdfThumbnail from '../../components/ui/PdfThumbnail';
import PdfViewerModal from '../../components/ui/PdfViewerModal';
import StudentInfoModal, { type StudentInfo } from '../../components/ui/StudentInfoModal';
import { getMediaUrl } from '../../utils/media';
import type { LibraryItem } from '../../types';

const card: import('framer-motion').Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }),
};

export default function LibraryPage() {
  const { isDark } = useAuthStore();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [viewing, setViewing] = useState<LibraryItem | null>(null);
  const [showDonation, setShowDonation] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [studentInfoModal, setStudentInfoModal] = useState<{
    isOpen: boolean;
    item: LibraryItem | null;
    action: 'view' | 'download';
  }>({ isOpen: false, item: null, action: 'view' });

  useEffect(() => {
    const dismissed = localStorage.getItem('libraryDonationDismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setShowDonation(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('libraryDonationDismissed', 'true');
    setShowDonation(false);
  };

  const copyNumber = (num: string, type: string) => {
    navigator.clipboard.writeText(num).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const { data: items, isLoading } = useQuery({
    queryKey: ['library-public', filterCat],
    queryFn: () => libraryApi.getAll(filterCat || undefined),
  });

  const { data: categories } = useQuery({
    queryKey: ['library-categories'],
    queryFn: libraryApi.getCategories,
  });

  const filtered = items?.filter((item: LibraryItem) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  const text = isDark ? 'text-white' : 'text-gray-900';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <>
      <Helmet>
        <title>المكتبة التعليمية | منصة الأستاذ عامر تمراز</title>
        <meta name="description" content="المكتبة التعليمية لمنصة الأستاذ عامر تمراز — مذكرات وملفات تعليمية مجانية للبرمجة والذكاء الاصطناعي لطلاب أول ثانوي." />
        <meta property="og:title" content="المكتبة التعليمية | منصة الأستاذ عامر تمراز" />
        <meta property="og:description" content="مذكرات وملفات تعليمية مجانية — حمّلها وادرس بكل سهولة" />
        <meta property="og:url" content="https://www.amertimraz.com/library" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.amertimraz.com/teacher.png" />
        <meta name="twitter:title" content="المكتبة التعليمية | منصة الأستاذ عامر تمراز" />
        <meta name="twitter:description" content="مذكرات وملفات تعليمية مجانية — حمّلها وادرس بكل سهولة" />
        <meta name="twitter:image" content="https://www.amertimraz.com/teacher.png" />
      </Helmet>
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" dir="rtl">

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/15 mb-2">
          <FolderOpen size={32} className="text-orange-500" />
        </div>
        <h1 className={`text-4xl font-black ${text}`}>المكتبة التعليمية</h1>
        <p className={`text-lg ${subtext}`}>مذكرات وملفات تعليمية مجانية — حمّلها وادرس بكل سهولة</p>
      </motion.div>

      {/* Social Media Links */}
      <div className="flex justify-center gap-4">
        <a
          href="https://www.facebook.com/Mr.AmerTimraz"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            isDark
              ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
        >
          <Facebook size={20} />
          <span className="text-sm font-medium">فيسبوك</span>
        </a>
        <a
          href="https://www.youtube.com/@AmerTimraz"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            isDark
              ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
              : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}
        >
          <Youtube size={20} />
          <span className="text-sm font-medium">يوتيوب</span>
        </a>
        <a
          href="https://wa.me/201096066818"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            isDark
              ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
        >
          <MessageCircle size={20} />
          <span className="text-sm font-medium">واتساب</span>
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className={`absolute top-1/2 -translate-y-1/2 right-3 ${subtext}`} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن مذكرة..."
            className={`w-full pr-10 pl-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-orange-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
            }`}
          />
        </div>
      </div>

      {!!categories?.length && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCat('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filterCat === ''
                ? 'bg-orange-500 text-white border-orange-500'
                : isDark
                  ? 'border-white/15 text-gray-400 hover:border-orange-400 hover:text-orange-400'
                  : 'border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-500'
            }`}
          >
            الكل
          </button>
          {categories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filterCat === cat
                  ? 'bg-orange-500 text-white border-orange-500'
                  : isDark
                    ? 'border-white/15 text-gray-400 hover:border-orange-400 hover:text-orange-400'
                    : 'border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : !filtered?.length ? (
        <div className="text-center py-24 space-y-3">
          <FolderOpen size={56} className="mx-auto text-gray-300" />
          <p className={`text-xl font-semibold ${text}`}>
            {search ? 'لا توجد نتائج لبحثك' : 'لا توجد ملفات حالياً'}
          </p>
          <p className={`text-sm ${subtext}`}>
            {search ? 'جرّب كلمة بحث مختلفة' : 'سيتم إضافة المذكرات قريباً'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item: LibraryItem, i: number) => (
            <motion.div
              key={item.id}
              custom={i}
              variants={card}
              initial="hidden"
              animate="visible"
              className={`group rounded-2xl border overflow-hidden hover:shadow-xl transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-orange-500/40'
                  : 'bg-white border-gray-100 hover:border-orange-300'
              }`}
            >
              <div
                className="relative cursor-pointer overflow-hidden"
                style={{ aspectRatio: '16/9' }}
                onClick={() => {
                  setViewing(item);
                  libraryApi.incrementView(item.id).catch(() => {});
                }}
              >
                <PdfThumbnail thumbnailUrl={item.thumbnailUrl ? getMediaUrl(item.thumbnailUrl) : undefined} className="w-full h-full" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 text-gray-900 text-sm font-semibold shadow-lg">
                    <Eye size={16} />
                    عرض المذكرة
                  </div>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div>
                  <h3 className={`font-bold text-base leading-snug ${text}`}>{item.title}</h3>
                  {item.category && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium">
                      {item.category}
                    </span>
                  )}
                  {item.description && (
                    <p className={`text-sm ${subtext} mt-1.5 line-clamp-2`}>{item.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                      <Eye size={12} />
                      <span>{(item.viewCount || 0).toLocaleString('ar-EG')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                      <Download size={12} />
                      <span>{(item.downloadCount || 0).toLocaleString('ar-EG')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {item.quizUrl && (
                    <Link
                      to={item.quizUrl}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg active:scale-95"
                    >
                      <Gamepad2 size={16} />
                      اختبار تفاعلي
                    </Link>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setStudentInfoModal({ isOpen: true, item, action: 'view' });
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        isDark
                          ? 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10'
                          : 'border-orange-300 text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      <Eye size={15} />
                      عرض
                    </button>
                    <button
                      onClick={() => {
                        setStudentInfoModal({ isOpen: true, item, action: 'download' });
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                    >
                      <Download size={15} />
                      تحميل
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {viewing && (
        <PdfViewerModal
          url={getMediaUrl(viewing.fileUrl)}
          title={viewing.title}
          onClose={() => setViewing(null)}
        />
      )}

      {/* Student Info Modal */}
      <StudentInfoModal
        isOpen={studentInfoModal.isOpen}
        onClose={() => setStudentInfoModal({ isOpen: false, item: null, action: 'view' })}
        onSubmit={async (info: StudentInfo) => {
          const item = studentInfoModal.item;
          if (!item) return;

          try {
            // Submit student info
            await libraryApi.submitStudentInfo(item.id, {
              ...info,
              noteTitle: item.title,
              action: studentInfoModal.action,
            });

            // Close modal
            setStudentInfoModal({ isOpen: false, item: null, action: 'view' });

            // Perform the action
            if (studentInfoModal.action === 'view') {
              setViewing(item);
              libraryApi.incrementView(item.id).catch(() => {});
            } else {
              // Trigger download
              libraryApi.incrementDownload(item.id).catch(() => {});
              const downloadUrl = getMediaUrl(item.fileUrl);
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = `${item.title}.pdf`;
              link.target = '_blank';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          } catch (error) {
            console.error('Error submitting student info:', error);
            alert('حدث خطأ أثناء إرسال البيانات، يرجى المحاولة مرة أخرى');
          }
        }}
        noteTitle={studentInfoModal.item?.title || ''}
        action={studentInfoModal.action}
      />

      {/* Donation Modal */}
      {showDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-100'}`}
          >
            <button
              onClick={handleDismiss}
              className={`absolute top-3 left-3 p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-3 mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
                <Heart size={28} className="text-white fill-white" />
              </div>
              <h2 className={`text-xl font-bold ${text}`}>ادعم المكتبة التعليمية</h2>
              <p className={`text-sm leading-relaxed ${subtext}`}>
                كل المحتوى هنا مجاني 100% لمساعدة الطلاب 📚<br/>
                لو استفدت من المذكرات، ممكن تدعمنا بأي مبلغ عشان نستمر في تقديم محتوى أكتر وأفضل
              </p>
            </div>

            <div className="space-y-3">
              {/* Vodafone Cash */}
              <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>فودافون كاش</span>
                  <span className={`text-xs ${subtext}`}>تحويل على نفس الرقم</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className={`flex-1 text-sm font-mono p-2 rounded-lg ${isDark ? 'bg-black/30' : 'bg-white'}`}>+20 10 9606 6818</code>
                  <button
                    onClick={() => copyNumber('+201096066818', 'vodafone')}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
                  >
                    {copied === 'vodafone' ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} className={subtext} />}
                  </button>
                </div>
              </div>

              {/* InstaPay */}
              <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>إنستا باي</span>
                  <span className={`text-xs ${subtext}`}>أرسل على يوزر نيم</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className={`flex-1 text-sm font-mono p-2 rounded-lg ${isDark ? 'bg-black/30' : 'bg-white'}`}>01096066818</code>
                  <button
                    onClick={() => copyNumber('01096066818', 'instapay')}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
                  >
                    {copied === 'instapay' ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} className={subtext} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center space-y-3">
              <p className={`text-xs ${subtext}`}>جزاك الله خيراً على دعمك ❤️</p>
              <button
                onClick={handleDismiss}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
              >
                شكراً، سأدعم لاحقاً
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </>
  );
}
