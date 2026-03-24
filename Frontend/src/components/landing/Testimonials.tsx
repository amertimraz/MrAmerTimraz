import { Star, Quote, Heart } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const testimonials = [
  { name: 'محمد السيد',    role: 'طالب - ابتدائي',   avatar: 'م', color: 'from-blue-400 to-blue-600',    rating: 5, text: 'المنصة رائعة جداً! الدروس واضحة ومبسّطة، والاختبارات ساعدتني أفهم المادة بشكل أعمق. شكراً مستر عامر.' },
  { name: 'سارة محمود',    role: 'طالبة - إعدادي',   avatar: 'س', color: 'from-purple-400 to-purple-600', rating: 5, text: 'أحسن طريقة للمذاكرة! الألعاب التعليمية ممتعة جداً وبتساعدني أحفظ وأفهم في نفس الوقت.' },
  { name: 'عبدالرحمن علي', role: 'طالب - ثانوي',     avatar: 'ع', color: 'from-green-400 to-green-600',   rating: 5, text: 'درس البرمجة غيّر تفكيري أوي. مستر عامر بيشرح بطريقة عملية ومبسّطة تخلي البرمجة سهلة وممتعة.' },
  { name: 'نور حسن',       role: 'طالبة - إعدادي',   avatar: 'ن', color: 'from-pink-400 to-pink-600',     rating: 5, text: 'استمتعت جداً بالدروس التفاعلية. بقيت أتقدم في مادة الحاسب بشكل واضح بفضل المنصة دي.' },
  { name: 'خالد إبراهيم',  role: 'ولي أمر',           avatar: 'خ', color: 'from-orange-400 to-orange-600', rating: 5, text: 'ابني بقى أكتر شغفاً بالتعلم من وقت ما انضم للمنصة. المحتوى عالي الجودة وطريقة الشرح ممتازة.' },
  { name: 'ريم عادل',      role: 'طالبة - ابتدائي',  avatar: 'ر', color: 'from-teal-400 to-teal-600',     rating: 5, text: 'الفيديوهات التعليمية واضحة ومرتبة. أقدر أذاكر في أي وقت وده ساعدني كتير في الاختبارات.' },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Testimonials() {
  const { ref: titleRef, isInView: titleInView } = useScrollReveal();
  const { ref: gridRef, isInView: gridInView } = useScrollReveal();

  return (
    <section dir="rtl" className="py-32 bg-[#0a0e27] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">

        {/* Header */}
        <motion.div
          ref={titleRef}
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border-yellow-500/20 mb-6">
            <Heart size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-black text-yellow-400 uppercase tracking-widest">ثقة واعتزاز</span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-6">ماذا يقول طلابنا؟</h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            شهادات نعتز بها من طلابنا وأولياء الأمور الذين شاركونا رحلة النجاح والتميز.
          </p>
          
          <div className="flex items-center justify-center gap-1.5 mt-8">
            {[1, 2, 3, 4, 5].map(s => (
              <motion.div
                key={s}
                initial={{ opacity: 0, scale: 0 }}
                animate={titleInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.4 + s * 0.1, type: 'spring', stiffness: 400 }}
              >
                <Star size={24} className="fill-yellow-400 text-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
              </motion.div>
            ))}
            <span className="text-white/40 text-sm font-bold mr-3 tracking-wide">4.9/5 متوسط التقييمات</span>
          </div>
        </motion.div>

        {/* Grid */}
        <motion.div
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={gridInView ? 'visible' : 'hidden'}
        >
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -8, backgroundColor: 'rgba(255,255,255,0.03)' }}
              className="glass-dark rounded-[40px] p-10 border-white/5 relative group overflow-hidden transition-all duration-500"
            >
              <div className="absolute top-8 left-8 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
                <Quote size={64} />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-8">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-white/60 text-base leading-relaxed mb-10 font-medium italic relative z-10">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-lg shadow-2xl`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {t.avatar}
                </motion.div>
                <div>
                  <p className="font-black text-white text-base">{t.name}</p>
                  <p className="text-green-500/60 text-xs font-bold uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
