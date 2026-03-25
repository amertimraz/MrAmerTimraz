import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, HelpCircle, Search, Trophy, Printer, ArrowLeft, Share2, Lock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { challengesApi } from '../../api/challenges';
import type { Challenge } from '../../api/challenges';

export default function ChallengePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (slug) {
      challengesApi.getBySlug(slug)
        .then(data => {
          setChallenge(data);
          setTimeLeft(data.timeLimitMinutes * 60);
        })
        .catch(() => toast.error('فشل في تحميل التحدي البرمجي'))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrint = () => {
    if (!isRevealed) {
      toast.error('يرجى كشف الإجابة أولاً ليظهر التحليل في الـ PDF');
      return;
    }
    window.print();
  };

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('تم نسخ الرابط المباشر لهذا التحدي');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">جاري تحميل التحدي...</div>;
  if (!challenge) return <div className="min-h-screen flex items-center justify-center font-bold text-rose-500">التحدي غير موجود</div>;

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center py-8 px-4 print:p-0 print:bg-white overflow-x-hidden" dir="rtl">
      
      {/* Dynamic Print Styles */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-area { 
            width: 297mm !important; 
            height: 210mm !important; 
            margin: 0 !important; 
            border: none !important; 
            border-radius: 0 !important;
            box-shadow: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Toolbar / Header */}
      <div className="w-full max-w-[1123px] flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-slate-800">إختبار Tofas: {challenge.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
             <Clock size={16} className="text-amber-500" />
             <span className="font-mono font-bold text-slate-700">{formatTime(timeLeft)}</span>
          </div>
          
          <button 
            onClick={shareLink}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition font-bold"
          >
            <Share2 size={18} />
            مشاركة الرابط
          </button>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition font-bold"
          >
            <Printer size={18} />
            تحميل PDF (A4)
          </button>
        </div>
      </div>

      {/* A4 Landscape Container */}
      <div className="print-area w-full max-w-[1123px] aspect-[297/210] bg-white shadow-2xl rounded-[2.5rem] border border-slate-300 relative overflow-hidden flex flex-col transition-all duration-500">
        
        {/* Notebook Grid Background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        {/* Decorative Top Bar */}
        <div className="h-14 bg-slate-800 flex items-center justify-between px-10 relative z-20">
           <div className="flex items-center gap-4">
              <span className="text-white font-black text-lg">Workshop Interactive</span>
              <div className="h-4 w-px bg-white/20" />
              <span className="text-white/60 text-sm">{challenge.slug}</span>
           </div>
           <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
           </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-row-reverse overflow-hidden">
          
          {/* Right: Info & Logic (Now on Right side) */}
          <div className="w-[45%] p-14 bg-slate-50/30 flex flex-col justify-center gap-8 border-l border-slate-100 text-right">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800 text-white rounded-full text-xs font-black uppercase tracking-widest">
                Coding Challenge
              </div>
              
              <h2 className="text-4xl font-black text-slate-800 leading-tight">
                {challenge.title}
              </h2>
              
              <p className="text-xl text-slate-600 font-bold leading-relaxed">
                حدد البرنامج الذي يقوم بإخراج ما يلي:
              </p>
            </div>

            <div className="p-10 bg-white border-2 border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col items-center gap-4 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-2 bg-primary-600" />
               <span className="text-slate-400 font-bold text-sm uppercase">Desired Output</span>
               <div className="text-7xl font-black text-slate-800 font-mono tracking-tighter group-hover:scale-110 transition duration-500">
                 {challenge.targetOutput}
               </div>
               <Search size={24} className="text-slate-100 absolute bottom-6 right-6" />
            </div>

            <div className="pt-4 no-print">
               <button 
                  onClick={() => setIsRevealed(true)}
                  disabled={!selectedId || isRevealed}
                  className={`
                    w-full py-5 rounded-2xl font-black text-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3
                    ${!selectedId || isRevealed ? 'bg-slate-100 text-slate-400 cursor-not-allowed scale-95 opacity-50' : 'bg-slate-800 text-white hover:bg-black hover:-translate-y-1 hover:shadow-2xl active:scale-95'}
                  `}
                >
                  <HelpCircle size={24} />
                  عرض شرح الكود والتحليل
                </button>
            </div>

            {/* Achievement Badge */}
            <AnimatePresence>
              {isRevealed && challenge.snippets?.find(s => s.id === selectedId)?.analysisType === 'Correct' && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-5 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-3xl"
                >
                  <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                    <Trophy className="text-white" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-800 underline decoration-wavy decoration-emerald-300 text-right">أحسنت! إجابة دقيقة</h3>
                    <p className="text-emerald-700 font-medium text-sm text-right">تم حل التحدي بنجاح.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Left: Snippets Column (Now on Left side) */}
          <div className="w-[55%] p-10 space-y-4 overflow-y-auto relative z-10 flex flex-col justify-center">
            {challenge.snippets?.map((snippet, idx) => (
              <div key={snippet.id} className="relative">
                <div 
                  onClick={() => !isRevealed && setSelectedId(snippet.id || null)}
                  className={`
                    relative bg-slate-50 border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300
                    ${selectedId === snippet.id ? 'border-primary-500 bg-white ring-8 ring-primary-500/5' : 'border-slate-100 hover:border-slate-300'}
                    ${isRevealed && snippet.analysisType === 'Correct' ? 'border-emerald-500 ring-8 ring-emerald-500/10' : ''}
                    ${isRevealed && selectedId === snippet.id && snippet.analysisType !== 'Correct' ? 'border-rose-500 ring-8 ring-rose-500/10' : ''}
                  `}
                >
                  <div className="absolute top-4 left-4 flex flex-col items-center gap-2">
                     <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-sm
                        ${selectedId === snippet.id ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-400'}
                        ${isRevealed && snippet.analysisType === 'Correct' ? 'bg-emerald-600 border-emerald-600 text-white' : ''}
                     `}>
                       {idx + 1}
                     </div>
                  </div>

                  <pre className="font-mono text-slate-800 text-lg leading-relaxed whitespace-pre-wrap pr-10">
                     {snippet.code.split('\n').map((line, i) => (
                       <div key={i} className="relative">
                          {isRevealed && snippet.analysisType === 'Syntax' && (i === 0 || i === 1) && (
                            <span className="absolute bottom-1 left-0 w-full h-1 border-b-4 border-rose-500 opacity-30 border-dotted" />
                          )}
                          {line}
                       </div>
                     ))}
                  </pre>

                  {/* Bubble Callouts */}
                  <AnimatePresence>
                    {isRevealed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className={`
                          absolute -top-6 -left-12 z-50 p-4 rounded-3xl shadow-2xl max-w-[280px] text-[13px] font-bold leading-snug tracking-tight
                          after:content-[''] after:absolute after:top-full after:left-[80%] after:-translate-x-1/2 after:border-[10px] after:border-transparent
                          ${snippet.analysisType === 'Correct' ? 'bg-emerald-600 text-white after:border-t-emerald-600 shadow-emerald-500/20' : ''}
                          ${snippet.analysisType === 'Syntax' ? 'bg-rose-600 text-white after:border-t-rose-600 shadow-rose-500/20' : ''}
                          ${snippet.analysisType === 'Logic' ? 'bg-amber-500 text-slate-900 after:border-t-amber-500 shadow-amber-500/20' : ''}
                        `}
                      >
                        {snippet.analysisMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info (only visible in print) */}
        <div className="hidden print:flex absolute bottom-8 left-1/2 -translate-x-1/2 items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
           <span>Mr Amer Educational Platform</span>
           <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
           <span>© 2026 Interactive Challenges</span>
        </div>
      </div>

      {!challenge.isVisible && (
        <div className="mt-8 flex items-center gap-2 text-rose-500 font-bold bg-white px-6 py-2 rounded-xl shadow-sm no-print">
            <Lock size={18} />
            هذا التحدي مخفي حالياً عن الطلاب.
        </div>
      )}

      <p className="mt-8 text-slate-500 text-sm font-medium no-print">
        💡 نصيحة: استخدم متصفح Google Chrome للحصول على أفضل جودة عند حفظ الـ PDF.
      </p>
    </div>
  );
}
