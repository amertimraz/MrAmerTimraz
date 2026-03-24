import { Video, FileText, Gamepad2, BarChart2, Sparkles, Rocket } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const features = [
  { 
    icon: <Video size={32} />,       
    title: 'فيديوهات فائقة الجودة',   
    description: 'شاهد الدروس في أي وقت ومن أي مكان عبر مكتبة فيديوهات ضخمة تدعم الجودات العالية.',                            
    color: 'text-blue-400',   
    bg: 'bg-blue-500/10',   
    className: 'md:col-span-2'
  },
  { 
    icon: <FileText size={32} />,    
    title: 'اختبارات ذكية',   
    description: 'نظام اختبارات متطور يحلل نقاط قوتك وضعفك.',                            
    color: 'text-purple-400', 
    bg: 'bg-purple-500/10',
    className: 'md:col-span-1'
  },
  { 
    icon: <Gamepad2 size={32} />,    
    title: 'تعلم باللعب',      
    description: 'ألعاب تعليمية تجعل من المذاكرة تجربة ممتعة لا تُنسى.',                          
    color: 'text-green-400',  
    bg: 'bg-green-500/10',
    className: 'md:col-span-1'
  },
  { 
    icon: <BarChart2 size={32} />,   
    title: 'إحصائيات دقيقة',        
    description: 'لوحة تحكم ذكية تتبع كل خطوة في تقدمك الدراسي.',                                    
    color: 'text-orange-400', 
    bg: 'bg-orange-500/10',
    className: 'md:col-span-2'
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
  const { ref: titleRef, isInView: titleInView } = useScrollReveal();
  const { ref: gridRef, isInView: gridInView } = useScrollReveal();

  return (
    <section dir="rtl" className="py-32 bg-[#0a0e27] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">

        {/* Header */}
        <motion.div
          ref={titleRef}
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border-purple-500/20 mb-6">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-xs font-black text-purple-400 uppercase tracking-widest">مميزات لا تقاوم</span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-6">تجربة تعليمية متكاملة</h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            لقد قمنا بتصميم كل أداة في المنصة بعناية فائقة لنضمن لك أقصى استفادة تعليمية بأسهل الطرق الممكنة.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          ref={gridRef}
          className="grid md:grid-cols-3 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={gridInView ? 'visible' : 'hidden'}
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`group p-10 rounded-[40px] glass-dark border-white/5 flex flex-col justify-between ${feature.className}`}
            >
              <div>
                <div className={`w-16 h-16 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-8 shadow-inner`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-medium italic">
                  "{feature.description}"
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          className="relative group rounded-[48px] overflow-hidden p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={gridInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative glass-dark rounded-[46px] p-12 sm:p-20 overflow-hidden flex flex-col items-center text-center">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            
            <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
               className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full"
            />
            
            <h3 className="text-4xl sm:text-5xl font-black text-white mb-6 relative z-10 leading-tight">
              جاهز لتبدأ رحلة <span className="text-gradient-green">التفوق</span> الآن؟
            </h3>
            <p className="text-white/60 mb-10 text-lg relative z-10 max-w-xl font-medium">
              انضم لأكثر من 500 طالب وضعوا ثقتهم في منصتنا وبدأوا رحلة التغيير نحو الأفضل.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              <motion.a
                href="/register"
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-white text-[#0a0e27] font-black rounded-2xl flex items-center gap-3 shadow-2xl transition-all"
              >
                <span>سجّل مجاناً وابدأ فوراً</span>
                <Rocket size={20} />
              </motion.a>
              <motion.a
                href="/courses"
                whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl glass backdrop-blur-3xl"
              >
                تصفح الدروس
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
