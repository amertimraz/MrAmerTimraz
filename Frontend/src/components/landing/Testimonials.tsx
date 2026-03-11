import { Star, Quote } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const testimonials = [
  { name: 'محمد العمري',      role: 'طالب - ابتدائي',   avatar: 'م', color: 'from-blue-400 to-blue-600',   rating: 5, text: 'المنصة رائعة جداً! الدروس واضحة ومبسّطة، والاختبارات ساعدتني أفهم المادة بشكل أعمق. شكراً مستر عامر.' },
  { name: 'سارة الزهراني',    role: 'طالبة - إعدادي',   avatar: 'س', color: 'from-purple-400 to-purple-600', rating: 5, text: 'أفضل طريقة للمذاكرة! الألعاب التعليمية ممتعة جداً وتساعدني على الحفظ والفهم في نفس الوقت.' },
  { name: 'عبدالله القحطاني', role: 'طالب - ثانوي',     avatar: 'ع', color: 'from-green-400 to-green-600',   rating: 5, text: 'درس البرمجة غيّر تفكيري كثيراً. مستر عامر يشرح بطريقة عملية ومبسّطة تجعل البرمجة سهلة وممتعة.' },
  { name: 'نورة الشمري',      role: 'طالبة - إعدادي',   avatar: 'ن', color: 'from-pink-400 to-pink-600',     rating: 5, text: 'استمتعت كثيراً بالدروس التفاعلية. أصبحت أتقدم في مادة الحاسب بشكل ملحوظ بفضل هذه المنصة.' },
  { name: 'خالد المطيري',     role: 'ولي أمر',           avatar: 'خ', color: 'from-orange-400 to-orange-600', rating: 5, text: 'ابني أصبح أكثر شغفاً بالتعلم منذ انضم للمنصة. المحتوى عالي الجودة وطريقة الشرح ممتازة.' },
  { name: 'ريم العتيبي',      role: 'طالبة - ابتدائي',  avatar: 'ر', color: 'from-teal-400 to-teal-600',     rating: 5, text: 'الفيديوهات التعليمية واضحة ومرتبة. أستطيع المراجعة في أي وقت وهذا ساعدني كثيراً في الاختبارات.' },
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

  return (
    <section dir="rtl" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          ref={titleRef}
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block bg-yellow-50 text-yellow-600 font-semibold text-sm px-4 py-2 rounded-full mb-4">
            💬 آراء الطلاب
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">ماذا يقول طلابنا؟</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            آراء حقيقية من طلاب يتعلمون على منصتنا يومياً
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
            <span className="text-gray-500 text-sm mr-2">4.9/5 من 200+ تقييم</span>
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
              className="bg-gray-50 rounded-2xl p-7 border border-gray-100 relative overflow-hidden"
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', borderColor: '#bfdbfe' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="absolute top-5 left-5 text-gray-100"
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

              <p className="text-gray-600 text-sm leading-relaxed mb-6 relative z-10">
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
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
