import { Lock, MessageCircle, Phone, Download, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMediaUrl } from '../../utils/media';
import { libraryApi } from '../../api/library';

interface LibraryLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType?: string;
  freeDownloadLink?: string;
  lockThumbnailUrl?: string;
  lockMemoTitle?: string;
  freeDownloadCount?: number;
}

export default function LibraryLockModal({ isOpen, onClose, modalType = 'default', freeDownloadLink, lockThumbnailUrl, lockMemoTitle, freeDownloadCount }: LibraryLockModalProps) {
  const whatsappNumber = "01096066818";
  const whatsappUrl = `https://wa.me/20${whatsappNumber.replace(/^0+/, '')}`;
  const isPromo = modalType === 'promo';

  const handleDownload = () => {
    libraryApi.incrementFreeDownload().catch(() => {});
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className={`p-6 text-white text-center ${isPromo ? 'bg-gradient-to-r from-blue-600 to-indigo-700' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <Lock size={32} className="text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">
                  {isPromo ? (lockMemoTitle || 'تحميل المذكرة متاح الآن') : 'المكتبة متوقفة مؤقتاً'}
                </h2>
                <p className="text-white/90 text-sm">
                  {isPromo 
                    ? 'يمكنك الآن تحميل نسخة المذكرة (بدون إجابات) مجاناً' 
                    : 'نظراً لزيادة تكاليف الاستضافة وإدارة الملفات، تم إيقاف إتاحة المذكرات بشكل مجاني'}
                </p>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {isPromo ? (
                  <div className="space-y-4">
                    {/* Free Download Button */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 rounded-2xl p-4 text-center">
                      {lockThumbnailUrl && (
                        <div className="w-32 h-44 mx-auto mb-4 rounded-lg overflow-hidden shadow-md border-2 border-white dark:border-gray-800">
                          <img src={getMediaUrl(lockThumbnailUrl)} alt="memo thumbnail" className="w-full h-full object-cover" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-3">
                        <CheckCircle2 size={18} />
                        <span>{lockMemoTitle ? `تحميل ${lockMemoTitle}` : 'نسخة بدون إجابات (مجاناً)'}</span>
                      </div>
                      
                      {freeDownloadLink ? (
                        <motion.a
                          href={getMediaUrl(freeDownloadLink)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleDownload}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg"
                        >
                          <Download size={20} />
                          <span>تحميل المذكرة مجاناً</span>
                        </motion.a>
                      ) : (
                        <div className="text-gray-400 text-sm py-2">سيتم إضافة الرابط قريباً</div>
                      )}

                      {isPromo && freeDownloadLink && (
                        <p className="text-[10px] text-blue-500/70 dark:text-blue-400/50 mt-2 font-medium">
                          تم التحميل {freeDownloadCount?.toLocaleString('ar-EG') || 0} مرة حتى الآن
                        </p>
                      )}
                    </div>

                    {/* Paid Version Info */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800/50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-green-700 dark:text-green-400">النسخة الكاملة (بالإجابات)</span>
                        <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Premium</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-green-600 dark:text-green-400">25</span>
                          <span className="text-sm font-bold text-green-700 dark:text-green-500">جنيه فقط</span>
                        </div>
                        <motion.a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ x: -5 }}
                          className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-bold"
                        >
                          <span>اطلبها الآن</span>
                          <MessageCircle size={16} />
                        </motion.a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-4 shadow-lg">
                      <div className="flex items-center justify-center mb-2">
                        <div className="bg-green-500 text-white rounded-full px-3 py-1 text-xs font-bold">
                          🎯 عرض خاص
                        </div>
                      </div>
                      <p className="text-green-800 dark:text-green-300 font-bold text-lg mb-1 text-center">
                        أي مذكرة (PDF + بالإجابات)
                      </p>
                      <div className="text-center">
                        <span className="text-2xl font-black text-green-600 dark:text-green-400">10</span>
                        <span className="text-lg font-bold text-green-700 dark:text-green-500 mr-1">جنيه</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main WhatsApp Button (Always visible or primary for default) */}
                {!isPromo && (
                  <motion.a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/25"
                  >
                    <MessageCircle size={20} />
                    <span>تواصل عبر الواتساب</span>
                    <Phone size={16} />
                  </motion.a>
                )}

                <p className="text-gray-400 dark:text-gray-500 text-[10px] text-center pt-2">
                  📞 {whatsappNumber} | شكراً لدعمكم المستمر 🤍
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
