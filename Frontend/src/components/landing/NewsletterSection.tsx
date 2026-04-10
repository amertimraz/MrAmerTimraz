import { motion } from 'framer-motion';
import { Mail, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

export default function NewsletterSection() {
  const { isDark } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      // In a real app, you would send this to your backend
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <section dir="rtl" className={`py-20 ${isDark ? 'bg-[#0d1117]' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className={`relative rounded-3xl p-10 sm:p-14 overflow-hidden ${
            isDark
              ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20'
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
          }`}
        >
          {/* Decorative Elements */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />

          <div className="relative z-10 text-center">
            {/* Icon */}
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg mb-6"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Mail size={28} className="text-white" />
            </motion.div>

            {/* Heading */}
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              اشترك في نشرتنا البريدية
            </h2>
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              احصل على أحدث الأخبار والنصائح التعليمية وعروض حصرية مباشرة في بريدك الإلكتروني
            </p>

            {/* Form */}
            {!isSubscribed ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                    className={`w-full px-5 py-4 rounded-xl text-right transition-all duration-300 ${
                      isDark
                        ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                    }`}
                    required
                  />
                  <Sparkles size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
                  style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                >
                  <Send size={18} />
                  اشترك الآن
                </motion.button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-green-500 text-white font-semibold"
              >
                <Sparkles size={20} />
                تم الاشتراك بنجاح! 🎉
              </motion.div>
            )}

            {/* Privacy Note */}
            <p className={`text-sm mt-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              نحن نحترم خصوصيتك ولن نشارك بريدك الإلكتروني مع أي طرف ثالث
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
