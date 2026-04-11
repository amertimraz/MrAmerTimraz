import { Star, Quote } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useAuthStore } from '../../store/authStore';

const testimonials = [
  {
    name: 'محمد السيد',
    role: 'طالب - أولى ثانوي',
    avatar: 'م',
    color: 'from-blue-400 to-blue-600',
    rating: 5,
    text: 'مادة البرمجة والذكاء الاصطناعي كانت صعبة في أولها، لكن الشرح على المنصة واضح والاختبارات خلّتني أفهم Python والمفاهيم خطوة بخطوة.',
  },
  {
    name: 'سارة محمود',
    role: 'طالبة - أولى ثانوي',
    avatar: 'س',
    color: 'from-purple-400 to-purple-600',
    rating: 5,
    text: 'مستر عامر بيوصّل الفكرة بطريقة عملية؛ فهمت إزاي أكتب كود وأربطه بموضوعات الذكاء الاصطناعي من غير تعقيد.',
  },
  {
    name: 'عبدالرحمن علي',
    role: 'طالب - أولى ثانوي',
    avatar: 'ع',
    color: 'from-green-400 to-green-600',
    rating: 5,
    text: 'البرمجة غيّرت تفكيري في المذاكرة. المحتوى مرتب من أول السنة، والتمارين والاختبارات على المنصة فادتني جداً.',
  },
  {
    name: 'نور حسن',
    role: 'طالبة - أولى ثانوي',
    avatar: 'ن',
    color: 'from-pink-400 to-pink-600',
    rating: 5,
    text: 'الدروس التفاعلية والفيديوهات خلّتني أذاكر الحاسب في أي وقت؛ حسّيت إن منهج أولى ثانوي بقى أسهل مع التنظيم ده.',
  },
  {
    name: 'خالد إبراهيم',
    role: 'ولي أمر - طالب أولى ثانوي',
    avatar: 'خ',
    color: 'from-orange-400 to-orange-600',
    rating: 5,
    text: 'ابني بقى مهتم بالبرمجة أكتر من أي مادة تانية؛ المنصة منظمة والمتابعة من خلال الاختبارات والنتائج واضحة لينا كأولياء أمور.',
  },
  {
    name: 'ريم عادل',
    role: 'طالبة - أولى ثانوي',
    avatar: 'ر',
    color: 'from-teal-400 to-teal-600',
    rating: 5,
    text: 'الشرح مبسّط والمراجعة من غير ما أضيع وقت؛ الفيديوهات والأسئلة التفاعلية خلّتني أستعد للامتحانات براحة.',
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export default function Testimonials() {
  const { ref: titleRef, isInView: titleInView } = useScrollReveal();
  const { ref: gridRef, isInView: gridInView } = useScrollReveal();
  const { isDark } = useAuthStore();

  return (
    <section dir="rtl" className={`py-20 ${isDark ? 'bg-[#0d1117]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          ref={titleRef}
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span
            className={`inline-block font-semibold text-sm px-4 py-2 rounded-full mb-4 ${
              isDark ? 'bg-yellow-500/15 text-yellow-400' : 'bg-yellow-50 text-yellow-600'
            }`}
          >
            💬 آراء الطلاب
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ماذا يقول طلابنا؟
          </h2>
          <p className={`text-lg max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            آراء من طلاب أولى ثانوي يتابعون مادة البرمجة والذكاء الاصطناعي على المنصة
          </p>
          <div className="flex items-center justify-center gap-1 mt-4">
            {[1, 2, 3, 4, 5].map(s => (
              <motion.div
                key={s}
                initial={{ opacity: 0, scale: 0 }}
                animate={titleInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.4 + s * 0.07, type: 'spring', stiffness: 400 }}
              >
                <Star size={22} className="fill-yellow-400 text-yellow-400" />
              </motion.div>
            ))}
            <span className={`text-sm mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              4.9/5 من 200+ تقييم
            </span>
          </div>
        </motion.div>

        {/* Grid */}
        <motion.div
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={gridInView ? 'visible' : 'hidden'}
        >
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className={`rounded-2xl p-7 border relative overflow-hidden ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-gray-50 border-gray-100'
              }`}
              whileHover={{
                y: -6,
                boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.35)' : '0 20px 40px rgba(0,0,0,0.08)',
                borderColor: isDark ? 'rgba(34,197,94,0.35)' : '#bfdbfe',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.div
                className={`absolute top-5 left-5 ${isDark ? 'text-white/10' : 'text-gray-100'}`}
                whileHover={{ scale: 1.3, rotate: 10, color: '#bfdbfe' }}
              >
                <Quote size={36} />
              </motion.div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={15} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className={`text-sm leading-relaxed mb-6 relative z-10 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                  whileHover={{ scale: 1.1 }}
                >
                  {t.avatar}
                </motion.div>
                <div>
                  <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
