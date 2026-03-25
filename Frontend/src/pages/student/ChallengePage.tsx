import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, HelpCircle, Search, Trophy, Printer, ArrowLeft, Share2, Lock, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { challengesApi } from '../../api/challenges';
import type { TofasTest } from '../../api/challenges';

export default function ChallengePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<TofasTest | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Question-specific state
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (slug) {
      challengesApi.getBySlug(slug)
        .then(data => {
          setTest(data);
          setTimeLeft(data.timeLimitMinutes * 60);
        })
        .catch(() => toast.error('فشل في تحميل الاختبار البرمجي'))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // When changing questions, reset local interaction state
  useEffect(() => {
    setSelectedId(null);
    setIsRevealed(false);
  }, [currentIdx]);

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
    toast.success('تم نسخ الرابط المباشر لهذا الاختبار');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">جاري تحميل الاختبار...</div>;
  if (!test || !test.questions || test.questions.length === 0) 
    return <div className="min-h-screen flex items-center justify-center font-bold text-rose-500">الاختبار غير موجود أو لا يحتوي على أسئلة</div>;

  const currentQuestion = test.questions[currentIdx];
  const isLastQuestion = currentIdx === test.questions.length - 1;

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
          <div>
            <h1 className="text-xl font-black text-slate-800">{test.title}</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-0.5 rounded-full">سؤال {currentIdx + 1} من {test.questions.length}</span>
               <div className="flex gap-1">
                  {test.questions.map((_, i) => (
                    <div key={i} className={`w-2 h-1 rounded-full ${i === currentIdx ? 'bg-primary-500 w-4' : 'bg-slate-300'}`} />
                  ))}
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
             <Clock size={16} className="text-amber-500" />
             <span className="font-mono font-bold text-slate-700">{formatTime(timeLeft)}</span>
          </div>
          
          <button onClick={shareLink} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm transition font-bold border border-slate-200">
            <Share2 size={18} />
          </button>

          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition font-bold">
            <Printer size={18} />
            تحميل PDF
          </button>
        </div>
      </div>

      {/* A4 Landscape Container style (Optimized for viewport) */}
      <div className="print-area w-full max-w-[1280px] min-h-[750px] h-[85vh] bg-white shadow-2xl rounded-[2.5rem] border border-slate-300 relative overflow-hidden flex flex-col transition-all duration-500">
        
        {/* Notebook Grid Background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        {/* Decorative Top Bar */}
        <div className="h-14 bg-slate-800 flex items-center justify-between px-10 relative z-20">
           <div className="flex items-center gap-4">
              <span className="text-white font-black text-lg">Tofas Interactive System</span>
              <div className="h-4 w-px bg-white/20" />
              <span className="text-white/60 text-sm italic">{test.slug} / Q-{currentIdx + 1}</span>
           </div>
           <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
           </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-row overflow-hidden">
          
          {/* Right: Info & Logic (Stay on Right in RTL) */}
          <div className="w-[45%] p-14 bg-slate-50/10 flex flex-col justify-center gap-8 border-l border-slate-100 text-right relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">
                <Sparkles size={12} />
                Challenge #{currentIdx + 1}
              </div>
              
              <p className="text-xl text-slate-800 font-bold leading-relaxed pt-4">
                حلل الأكواد البرمجية الظاهرة أمامك، واختر البرنامج الذي يقوم بإخراج القيمة التالية:
              </p>
            </div>

            <div className="p-10 bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex flex-col items-center gap-4 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-3 bg-slate-800" />
               <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Desired Output</span>
               <div className={`font-black text-slate-800 font-mono tracking-tighter transition duration-500 text-center ${
                 currentQuestion.targetOutput.length > 10 ? 'text-2xl' : 
                 currentQuestion.targetOutput.length > 5 ? 'text-4xl' : 'text-7xl'
               }`}>
                 {currentQuestion.targetOutput}
               </div>
               <Search size={24} className="text-slate-100 absolute bottom-6 right-6" />
            </div>

            <div className="pt-4 no-print flex gap-3">
               <button 
                  onClick={() => setIsRevealed(true)}
                  disabled={!selectedId || isRevealed}
                  className={`
                    flex-1 py-5 rounded-2xl font-black text-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3
                    ${!selectedId || isRevealed ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' : 'bg-slate-900 text-white hover:bg-black hover:-translate-y-1 hover:shadow-2xl active:scale-95'}
                  `}
                >
                  <HelpCircle size={24} />
                  كشف التحليل
                </button>
            </div>

            {/* Achievement Badge */}
            <AnimatePresence>
              {isRevealed && currentQuestion.snippets?.find(s => s.id === selectedId)?.analysisType === 'Correct' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 p-5 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-3xl"
                >
                  <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <Trophy className="text-white" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-800 text-right">أحسنت! إجابة دقيقة</h3>
                    <p className="text-emerald-700 font-medium text-xs text-right">لقد نجحت في استنتاج المنطق البرمجي الصحيح.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Left: Snippets Column */}
          <div className="w-[55%] p-10 space-y-4 overflow-y-auto flex flex-col justify-center">
            {currentQuestion.snippets?.map((snippet, idx) => (
              <div key={snippet.id} className="relative">
                <div 
                  onClick={() => !isRevealed && setSelectedId(snippet.id || null)}
                  className={`
                    relative bg-slate-50 border-2 rounded-[2rem] p-6 cursor-pointer transition-all duration-300
                    ${selectedId === snippet.id ? 'border-primary-500 bg-white shadow-xl shadow-primary-500/5' : 'border-slate-100 hover:border-slate-300'}
                    ${isRevealed && snippet.analysisType === 'Correct' ? 'border-emerald-500 bg-emerald-50/30' : ''}
                    ${isRevealed && selectedId === snippet.id && snippet.analysisType !== 'Correct' ? 'border-rose-500 bg-rose-50/30' : ''}
                  `}
                >
                  <div className="absolute top-5 left-6">
                     <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-sm
                        ${selectedId === snippet.id ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-400'}
                        ${isRevealed && snippet.analysisType === 'Correct' ? 'bg-emerald-600 border-emerald-600 text-white' : ''}
                     `}>
                       {idx + 1}
                     </div>
                  </div>

                  <div className="flex-1 overflow-x-auto custom-scrollbar-horizontal pl-16">
                    <pre className="font-mono text-slate-800 text-sm leading-relaxed whitespace-pre text-left" dir="ltr" style={{ unicodeBidi: 'isolate' }}>
                       {snippet.code}
                    </pre>
                  </div>

                  {/* Bubble Callout */}
                  <AnimatePresence>
                    {isRevealed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className={`
                          absolute -top-10 -left-4 z-50 p-4 rounded-3xl shadow-2xl max-w-[280px] text-xs font-bold
                          after:content-[''] after:absolute after:top-full after:left-[80%] after:-translate-x-1/2 after:border-[10px] after:border-transparent
                          ${snippet.analysisType === 'Correct' ? 'bg-emerald-600 text-white after:border-t-emerald-600' : ''}
                          ${snippet.analysisType === 'Syntax' ? 'bg-rose-600 text-white after:border-t-rose-600' : ''}
                          ${snippet.analysisType === 'Logic' ? 'bg-amber-500 text-slate-900 after:border-t-amber-500' : ''}
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

        {/* Global Footer Navigation (no-print) */}
        <div className="h-20 bg-slate-50 border-t border-slate-100 px-10 flex items-center justify-between no-print">
            <button 
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 font-black text-slate-400 disabled:opacity-30 hover:text-slate-800 transition"
            >
               <ChevronRight size={24} />
               السؤال السابق
            </button>
            <div className="flex gap-2">
               {test.questions.map((_, i) => (
                 <button key={i} onClick={() => setCurrentIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentIdx ? 'bg-primary-500 w-8' : 'bg-slate-300 hover:bg-slate-400'}`} />
               ))}
            </div>
            {!isLastQuestion ? (
              <button 
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="flex items-center gap-2 font-black text-primary-600 hover:text-primary-700 transition"
              >
                 السؤال التالي
                 <ChevronLeft size={24} />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/challenges')}
                className="bg-emerald-600 text-white px-8 py-2 rounded-xl font-black shadow-lg hover:bg-emerald-700 transition"
              >
                 إنهاء الاختبار
              </button>
            )}
        </div>
      </div>

      {!test.isVisible && (
        <div className="mt-8 flex items-center gap-2 text-rose-500 font-bold bg-white px-6 py-2 rounded-xl shadow-sm no-print">
            <Lock size={18} />
            هذا الاختبار مخفي حالياً.
        </div>
      )}
    </div>
  );
}
