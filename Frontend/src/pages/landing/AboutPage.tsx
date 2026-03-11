import { Link } from 'react-router-dom';
import { GraduationCap, Award, Users, BookOpen, CheckCircle } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useAuthStore } from '../../store/authStore';

const subjects = [
  { emoji: '💻', title: 'تقنية المعلومات', level: 'المرحلة الابتدائية', description: 'تدريس مادة تقنية المعلومات بأسلوب تفاعلي وممتع يناسب الطلاب الصغار.', accent: '#3b82f6' },
  { emoji: '🖥️', title: 'الحاسب الآلي',   level: 'المرحلة الإعدادية', description: 'شرح برامج Office والشبكات والأمن المعلوماتي بأسلوب مبسّط وعملي.',    accent: '#a855f7' },
  { emoji: '⌨️', title: 'البرمجة',        level: 'أول ثانوي',         description: 'تعليم البرمجة من الصفر باستخدام Scratch وPython مع مشاريع تطبيقية.',  accent: '#22c55e' },
];

const achievements = [
  { value: '10+',  label: 'سنوات خبرة',      icon: '🏆' },
  { value: '500+', label: 'طالب مستفيد',     icon: '👨‍🎓' },
  { value: '3',    label: 'مراحل دراسية',     icon: '📚' },
  { value: '98%',  label: 'نسبة رضا الطلاب', icon: '⭐' },
];

const skills = [
  'تصميم المناهج التفاعلية',
  'تقنيات التعليم الحديثة',
  'إدارة بيئات التعلم الإلكتروني',
  'برمجة Python وScratch',
  'Microsoft Office المتقدم',
  'الأمن المعلوماتي للمبتدئين',
  'التعليم عبر الألعاب',
  'تقييم وتحليل أداء الطلاب',
];

export default function AboutPage() {
  const { isDark } = useAuthStore();
  const { ref: bioRef, isInView: bioInView } = useScrollReveal();
  const { ref: subRef, isInView: subInView } = useScrollReveal();
  const { ref: quoteRef, isInView: quoteInView } = useScrollReveal();
  const { ref: ctaRef, isInView: ctaInView } = useScrollReveal();

  const card = isDark
    ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
    : { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };

  return (
    <div dir="rtl" className="min-h-screen">

      {/* Header */}
      <div className="pt-28 pb-14 text-center relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="mb-6 inline-block"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-500/40 shadow-2xl mx-auto"
              style={{ boxShadow: '0 0 40px rgba(34,197,94,0.25)' }}>
              <img src="/teacher2.png" alt="عامر تمراز" className="w-full h-full object-cover object-top"
                onError={(e) => {
                  const p = e.currentTarget.parentElement!;
                  p.className = 'w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-2xl mx-auto';
                  p.style.background = 'linear-gradient(135deg,#22c55e,#15803d)';
                  p.style.boxShadow = '0 0 40px rgba(34,197,94,0.3)';
                  e.currentTarget.replaceWith(document.createTextNode('عا'));
                }}
              />
            </div>
          </motion.div>
          <motion.h1
            className={`text-4xl sm:text-5xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          >
            مستر عامر تمراز
          </motion.h1>
          <motion.p
            className="text-green-500 text-base font-medium mb-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          >
            معلم متميز في مجال التقنية والحاسب والبرمجة
          </motion.p>
          <motion.div className="flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            {['تقنية المعلومات', 'الحاسب الآلي', 'البرمجة'].map(tag => (
              <span key={tag}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                style={isDark
                  ? { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }
                  : { background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)' }
                }
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Stats bar */}
      <motion.div
        className="max-w-4xl mx-auto px-4 mb-16"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center" style={card}>
          {achievements.map((a, i) => (
            <motion.div key={a.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }}>
              <p className="text-2xl mb-1">{a.icon}</p>
              <p className="text-2xl font-black text-green-500">{a.value}</p>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{a.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Bio */}
        <motion.div
          ref={bioRef}
          className="grid lg:grid-cols-2 gap-6 mb-14"
          initial={{ opacity: 0, y: 32 }}
          animate={bioInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="rounded-2xl p-7" style={card}>
            <span
              className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-5 ${isDark ? 'text-green-400' : 'text-green-600'}`}
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              👨‍🏫 نبذة تعريفية
            </span>
            <h2 className={`text-2xl font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>من هو مستر عامر؟</h2>
            <div className={`space-y-4 text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>مستر <strong className={isDark ? 'text-white' : 'text-gray-900'}>عامر تمراز</strong> معلم متخصص في مجال تقنية المعلومات والحاسب الآلي والبرمجة، يمتلك خبرة تدريسية تمتد لأكثر من 10 سنوات.</p>
              <p>يؤمن بأن التعلم يجب أن يكون ممتعاً وتفاعلياً، لذلك طوّر منهجاً تعليمياً خاصاً يجمع بين الشرح المبسّط والتطبيق العملي والألعاب التعليمية.</p>
              <p>أسّس هذه المنصة التعليمية لتكون مرجعاً شاملاً لطلابه، حيث يتمكنون من مراجعة الدروس وأداء الاختبارات التفاعلية وتتبع تقدمهم.</p>
            </div>
          </div>

          <div className="rounded-2xl p-7" style={card}>
            <h3 className={`font-bold text-lg mb-5 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Award size={20} className="text-green-500" />
              المهارات والتخصصات
            </h3>
            <div className="space-y-2.5">
              {skills.map((skill, i) => (
                <motion.div
                  key={skill}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -16 }}
                  animate={bioInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <CheckCircle size={15} className="text-green-500 shrink-0" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{skill}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Subjects */}
        <div ref={subRef} className="mb-14">
          <motion.div className="text-center mb-8"
            initial={{ opacity: 0, y: 24 }} animate={subInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <span
              className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
            >
              📚 المواد الدراسية
            </span>
            <h2 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>ماذا يُدرّس مستر عامر؟</h2>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-3 gap-5"
            initial="hidden"
            animate={subInView ? 'visible' : 'hidden'}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } } as Variants}
          >
            {subjects.map(subject => (
              <motion.div
                key={subject.title}
                className="rounded-2xl overflow-hidden"
                style={card}
                variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } } as Variants}
                whileHover={{ y: -5, borderColor: subject.accent + '50' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="h-20 flex items-center justify-center text-4xl"
                  style={{ background: `linear-gradient(135deg, ${subject.accent}22, ${subject.accent}08)`, borderBottom: `1px solid ${subject.accent}20` }}>
                  {subject.emoji}
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium mb-1.5" style={{ color: subject.accent }}>{subject.level}</p>
                  <h3 className={`font-bold text-base mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{subject.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{subject.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Quote */}
        <motion.div
          ref={quoteRef}
          className="rounded-3xl p-10 text-center mb-14 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(15,23,42,0.6) 100%)', border: '1px solid rgba(34,197,94,0.2)' }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={quoteInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7 }}
        >
          <GraduationCap size={44} className="mx-auto mb-4 text-green-500" />
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>فلسفتي في التعليم</h3>
          <blockquote className={`text-base leading-relaxed max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            "أؤمن بأن كل طالب لديه القدرة على التعلم والإبداع. مهمتي هي تقديم المعرفة بأسلوب يُلهم الفضول ويُشعل شغف التعلم، لأن العلم الحقيقي يبدأ من الاستمتاع بالتعلم."
          </blockquote>
          <p className="text-green-500 mt-4 font-bold">— أ. عامر تمراز</p>
        </motion.div>

        {/* CTA */}
        <motion.div
          ref={ctaRef}
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>هل أنت مستعد للبدء؟</h3>
          <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>انضم لمئات الطلاب الذين يتعلمون مع مستر عامر</p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="px-8 py-3.5 rounded-xl font-bold text-white flex items-center gap-2 text-sm"
                style={{ background: '#22c55e' }}>
                <Users size={17} /> سجّل الآن مجاناً
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/courses"
                className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 text-sm border transition-colors ${isDark ? 'text-white border-white/15 hover:bg-white/5' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
              >
                <BookOpen size={17} /> استعرض الدروس
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
