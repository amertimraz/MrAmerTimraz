import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Star, Play, ArrowRight, ShieldCheck, Award } from 'lucide-react';

function TeacherPhoto({ isDark }: { isDark: boolean }) {
  const [err, setErr] = useState(false);

  if (err) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-100 dark:bg-gray-800">
        <div className="text-8xl animate-bounce">👨‍🏫</div>
        <p className={`text-sm text-center font-medium ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          Teacher Photo Not Found
        </p>
      </div>
    );
  }

  return (
    <img
      src="/teacher.png"
      alt="الأستاذ عامر تمراز"
      className="w-full h-full object-cover object-top select-none transition-transform duration-700 hover:scale-110"
      onError={() => setErr(true)}
    />
  );
}

function Counter({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center p-4 rounded-2xl glass-dark min-w-[120px]">
      <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500 mb-2">
        {icon}
      </div>
      <p className="text-2xl font-black text-white leading-none mb-1">{value}</p>
      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold font-cairo">{label}</p>
    </div>
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      dir="rtl"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0a0e27]"
    >
      {/* Mesh Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[120px]" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} 
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="order-2 lg:order-1 space-y-8 text-right">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-dark border-green-500/20"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span className="text-sm font-bold text-green-400">منصة مستر عامر تمراز التعليمية</span>
              <Award size={16} className="text-green-500" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight">
                ابدأ رحلة <br />
                <span className="text-gradient-green">التمكن </span> 
                من الحاسب
              </h1>
              <p className="text-lg sm:text-xl text-white/60 max-w-xl leading-relaxed font-medium">
                تعلم تقنية المعلومات، الحاسب الآلي، والبرمجة بأسلوب عصري ممتع وتفاعلي يضمن لك التميز والتفوق الدراسي.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-10 py-5 bg-green-500 text-white rounded-2xl font-black flex items-center gap-3 overflow-hidden shadow-2xl transition-all"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 text-lg">سجل الآن مجاناً</span>
                <Play className="relative z-10 fill-white" size={20} />
              </motion.button>

              <motion.button
                onClick={() => navigate('/courses')}
                whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 rounded-2xl border border-white/10 text-white font-bold flex items-center gap-3 transition-colors glass-dark"
              >
                <span>استعرض الكورسات</span>
                <ArrowRight size={20} className="rotate-180" />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Counter value="+500" label="طالب نشط" icon={<Users size={20} />} />
              <Counter value="+30" label="درس تفاعلي" icon={<BookOpen size={20} />} />
              <Counter value="98%" label="نسبة النجاح" icon={<Star size={20} />} />
            </motion.div>
          </div>

          {/* Teacher Photo Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: 'spring', damping: 20, delay: 0.2 }}
            className="order-1 lg:order-2 flex justify-center"
            style={{ 
              transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`
            }}
          >
            <div className="relative group">
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-green-500/30 to-blue-500/30 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Main Card */}
              <div className="relative w-[320px] sm:w-[380px] h-[480px] sm:h-[540px] rounded-[40px] p-1.5 overflow-hidden glass-dark border-white/10">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-gray-950 sm:bg-transparent">
                  <TeacherPhoto isDark={true} />
                  
                  {/* Overlay Labels */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-6 inset-x-6 p-6 rounded-3xl glass backdrop-blur-2xl border-white/5 space-y-1">
                    <p className="text-2xl font-black text-white">أ. عامر تمراز</p>
                    <p className="text-green-400 font-bold text-sm">خبير تكنولوجيا التعليم والبرمجة</p>
                    <div className="flex gap-1 pt-2">
                       <ShieldCheck size={16} className="text-green-500" />
                       <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest leading-none flex items-center">Verified Educator</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Element */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -right-6 p-4 rounded-2xl glass-dark border-green-500/30 shadow-2xl hidden sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                    <Star size={20} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">الأفضل تميزاً</p>
                    <p className="text-white/40 text-[10px] uppercase font-bold">للعام الدراسي 2024</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
