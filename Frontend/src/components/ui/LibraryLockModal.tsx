import { Lock, MessageCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LibraryLockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LibraryLockModal({ isOpen, onClose }: LibraryLockModalProps) {
  const whatsappNumber = "01096066818";
  const whatsappUrl = `https://wa.me/20${whatsappNumber.replace(/^0+/, '')}`;

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
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <Lock size={32} className="text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">المكتبة متوقفة مؤقتاً عن الإتاحة المجانية</h2>
                <p className="text-white/90 text-sm">نظراً لزيادة تكاليف الاستضافة وإدارة الملفات، تم إيقاف إتاحة المذكرات بشكل مجاني</p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-center mb-3">
                      <div className="bg-green-500 text-white rounded-full px-4 py-2 text-sm font-bold">
                        🎯 عرض خاص
                      </div>
                    </div>
                    <p className="text-green-800 dark:text-green-300 font-bold text-xl mb-2 text-center">
                      📌 الآن يمكنك الحصول على أي مذكرة (PDF + بالإجابات)
                    </p>
                    <div className="text-center">
                      <span className="text-3xl font-black text-green-600 dark:text-green-400">10</span>
                      <span className="text-xl font-bold text-green-700 dark:text-green-500 mr-1">جنيه</span>
                      <span className="text-sm text-green-600 dark:text-green-400 block mt-1">لأي ملف</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    📲 لطلب أي مذكرة، تواصل مباشرة مع مستر عامر عبر واتساب
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      نحن نحرص دائماً على توفير المحتوى بأفضل جودة وبسعر مناسب للجميع.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                      شكراً لدعمكم 🤍
                    </p>
                  </div>
                </div>

                {/* WhatsApp Button */}
                <motion.a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-green-500/25"
                >
                  <MessageCircle size={24} />
                  <span className="text-lg">تواصل معنا عبر الواتساب</span>
                  <Phone size={20} />
                </motion.a>

                {/* Phone Number Display */}
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">أو اتصل مباشرة على الرقم:</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{whatsappNumber}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <button
                  onClick={onClose}
                  className="w-full py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
