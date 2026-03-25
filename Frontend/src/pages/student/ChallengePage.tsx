import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, HelpCircle, Search, Trophy, Printer, ArrowLeft, Share2, Lock, ChevronRight, ChevronLeft, Sparkles, X, Brain } from 'lucide-react';
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
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(1);

  useEffect(() => {
    if (slug) {
      challengesApi.getBySlug(slug)
        .then(data => {
          setTest(data);
          setTimeLeft(data.timeLimitMinutes * 60 || 15 * 60);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 font-sans">جاري تحميل الاختبار...</div>;
  if (!test || !test.questions || test.questions.length === 0) 
    return <div className="min-h-screen flex items-center justify-center font-bold text-rose-500 font-sans">الاختبار غير موجود أو لا يحتوي على أسئلة</div>;

  const currentQuestion = test.questions[currentIdx];
  const isLastQuestion = currentIdx === test.questions.length - 1;

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center py-8 px-4 print:p-0 print:bg-white overflow-x-hidden font-sans" dir="rtl">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-area { width: 297mm !important; height: 210mm !important; margin: 0 !important; border: none !important; border-radius: 0 !important; box-shadow: none !important; }
        }
      `}</style>

      {/* Toolbar / Header */}
      <div className="w-full max-w-[1280px] flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">{test.title}</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                 {showGuide ? 'Educational Guide' : `Question ${currentIdx + 1} / ${test.questions.length}`}
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
             <Clock size={16} className="text-amber-500" />
             <span className="font-mono font-bold text-slate-700">{formatTime(timeLeft)}</span>
          </div>
          <button onClick={shareLink} className="p-2 bg-white text-slate-400 hover:text-primary-500 rounded-xl border border-slate-200 transition"><Share2 size={18} /></button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition font-black"><Printer size={18} /> تحميل PDF</button>
        </div>
      </div>

      {/* Main Experience Container */}
      <div className="print-area w-full max-w-[1280px] min-h-[750px] h-[85vh] bg-white shadow-2xl rounded-[3rem] border border-slate-300 relative overflow-hidden flex flex-col transition-all duration-700">
        
        {/* Notebook Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        {/* Top Decorative Bar */}
        <div className="h-14 bg-slate-800 flex items-center justify-between px-10 relative z-50">
           <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
           </div>
           <div className="flex items-center gap-4 text-slate-400 font-mono text-[10px] uppercase font-black tracking-widest">
             <Lock size={12} /> SECURE TEST ENVIRONMENT / TOFAS-LOGIC-CORE
           </div>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            {showGuide ? (
              <motion.div 
                key="guide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col p-12 overflow-y-auto custom-scrollbar"
              >
                {guideStep === 1 ? (
                  <div className="max-w-4xl mx-auto w-full space-y-12">
                    <div className="text-center space-y-2">
                       <h2 className="text-5xl font-black text-slate-900 tracking-tight">كيف نحلل أي سؤال برمجي؟</h2>
                       <p className="text-2xl text-slate-500 font-bold">(خطوات المحقق البرمجي)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                       {[
                         { step: 1, title: "حدد الهدف", subtitle: "(The Goal)", desc: "ماذا يطلب السؤال أن نخرج؟ (مثال: رقم، أو رسالة نصية محددة). ابدأ دائماً بالنتيجة النهائية.", icon: <Trophy className="text-amber-500" /> },
                         { step: 2, title: "استبعد أخطاء القواعد", subtitle: "(Syntax Errors)", desc: "ابحث عن الأكواد التي لا يمكن للحاسوب قراءتها. (مثل: تسمية المتغيرات بأرقام، أو أخطاء كتابة if).", icon: <X className="text-rose-500" /> },
                         { step: 3, title: "تتبع المنطق والحساب", subtitle: "(Trace Logic)", desc: "للخيارات المتبقية، قم بالتعويض بالأرقام وتتبع العمليات الحسابية بنفسك لمطابقتها للهدف.", icon: <Brain className="text-primary-500" /> }
                       ].map((m) => (
                         <div key={m.step} className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center text-center gap-4 hover:border-primary-200 transition relative">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100">{m.icon}</div>
                            <h4 className="text-xl font-black text-slate-900">{m.title}</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{m.subtitle}</p>
                            <p className="text-slate-600 font-bold text-sm leading-relaxed">{m.desc}</p>
                         </div>
                       ))}
                    </div>

                    <button onClick={() => setGuideStep(2)} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-2xl shadow-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-4">
                      شرح رائع، أرني مصفوفة الفخاخ! <ChevronLeft size={28} />
                    </button>
                  </div>
                ) : (
                  <div className="max-w-5xl mx-auto w-full space-y-12">
                    <div className="text-center space-y-2">
                       <h2 className="text-5xl font-black text-slate-900 tracking-tight">مصفوفة اكتشاف الفخاخ</h2>
                       <p className="text-2xl text-rose-500 font-black tracking-widest uppercase">(احفظ هذه القواعد جيداً!)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-rose-600 text-white rounded-2xl shadow-lg"><Lock size={24} /><h3 className="text-xl font-black">فخاخ القواعد (Syntax Traps)</h3></div>
                        {[
                          { c: "let 5;", t: "تسمية متغير خاطئة", d: "أن يبدأ الاسم برقم" },
                          { c: 'let "Text" = name;', t: "عكس التعيين", d: "وضع القيمة قبل المتغير" },
                          { c: "else (x > 5)", t: "شرط مع Else", d: "كتابة قوسين بعد إلس (else)" },
                          { c: "if else", t: "بداية مشوهة", d: "بدء الجملة الشرطية بـ if else معاً" }
                        ].map((t, i) => (
                          <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                            <div className="space-y-1"><h4 className="font-black text-slate-800">{t.t}</h4><p className="text-[10px] text-slate-400 font-bold">{t.d}</p></div>
                            <code className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg font-mono text-xs font-bold border border-rose-100">{t.c} ❌</code>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-amber-500 text-white rounded-2xl shadow-lg"><Brain size={24} /><h3 className="text-xl font-black">فخاخ المنطق (Logic Traps)</h3></div>
                        <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-4 shadow-sm">
                          <h4 className="font-black text-slate-800 flex items-center gap-2"><Sparkles className="text-amber-500" size={18} /> العمليات المعكوسة</h4>
                          <p className="text-sm text-slate-500 font-bold">استخدام + بدلاً من -، أو / بدلاً من * لتضليل تفكيرك.</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-4 shadow-sm">
                          <h4 className="font-black text-slate-800 flex items-center gap-2">⚠️ وهم التحديث</h4>
                          <p className="text-sm text-slate-500 font-bold">تحديث متغير باستخدام مقارنة {`>`} بدلاً من التعيين =</p>
                          <code className="block bg-slate-50 p-4 rounded-xl text-amber-600 font-mono text-center font-black border border-amber-100 text-sm">x {"<"} x + 5;</code>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setGuideStep(1)} className="flex-1 bg-slate-100 text-slate-600 py-6 rounded-3xl font-black text-xl hover:bg-slate-200 transition">العودة للخطوات</button>
                      <button onClick={() => setShowGuide(false)} className="flex-[2] bg-primary-600 text-white py-6 rounded-3xl font-black text-2xl shadow-2xl hover:bg-primary-700 transition flex items-center justify-center gap-4">فهمت كل شيء، لنبدأ! <ChevronLeft size={28} /></button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="questions" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-row overflow-hidden">
                <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-white/20 backdrop-blur-3xl custom-scrollbar relative">
                   <div className="flex flex-col gap-6">
                     {currentQuestion.snippets.map((snippet, idx) => (
                       <div key={idx} onClick={() => { setSelectedId(idx); setIsRevealed(false); }}
                         className={`relative group cursor-pointer border-2 transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white/50 backdrop-blur-xl ${selectedId === idx ? 'border-primary-500 shadow-2xl scale-[1.01]' : 'border-slate-100 hover:border-primary-300 hover:bg-white'}`}
                       >
                         <div className={`absolute top-0 right-0 w-3 h-full transition duration-500 ${selectedId === idx ? 'bg-primary-500' : 'bg-transparent'}`} />
                         <div className="flex items-stretch min-h-[140px]">
                           <div className="w-24 bg-slate-50/50 flex flex-col items-center justify-center border-l border-slate-100 group-hover:bg-primary-50 transition">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition duration-500 ${selectedId === idx ? 'bg-primary-500 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>{idx + 1}</div>
                           </div>
                           <div className="flex-1 p-8 flex flex-col justify-center">
                             <div className="overflow-x-auto custom-scrollbar-horizontal pl-16">
                               <pre className="font-mono text-slate-800 text-sm leading-relaxed whitespace-pre text-left" dir="ltr" style={{ unicodeBidi: 'isolate' }}>{snippet.code}</pre>
                             </div>
                             <AnimatePresence>{isRevealed && (
                               <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                 className={`absolute top-1/2 -left-4 -translate-y-1/2 z-50 p-6 rounded-[2rem] shadow-2xl max-w-[280px] text-sm font-bold border-2 ${snippet.analysisType === 'Correct' ? 'bg-emerald-600 border-emerald-400 text-white' : snippet.analysisType === 'Syntax' ? 'bg-rose-600 border-rose-400 text-white' : 'bg-amber-500 border-amber-300 text-slate-900'}`}
                               >
                                 <div className="flex items-center gap-2 mb-2">{snippet.analysisType === 'Correct' ? <Trophy size={16} /> : <HelpCircle size={16} />}<span className="text-[10px] uppercase font-black opacity-80">{snippet.analysisType} Analysis</span></div>
                                 {snippet.analysisMessage}
                               </motion.div>
                             )}</AnimatePresence>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="w-[450px] bg-slate-50/80 border-r border-slate-200 p-12 flex flex-col gap-10 no-print">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20"><Sparkles size={12} /> Challenge #{currentIdx + 1}</div>
                    <p className="text-xl text-slate-800 font-bold leading-relaxed pt-4 text-center">{currentQuestion.description || "حلل الأكواد البرمجية الظاهرة أمامك، واختر البرنامج الذي يقوم بإخراج القيمة التالية:"}</p>
                  </div>
                  <div className="p-10 bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex flex-col items-center gap-4 relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-3 bg-slate-800" />
                     <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Desired Output</span>
                     <div className={`font-black text-slate-800 font-mono tracking-tighter transition duration-500 text-center ${currentQuestion.targetOutput.length > 10 ? 'text-2xl' : currentQuestion.targetOutput.length > 5 ? 'text-4xl' : 'text-7xl'}`}>{currentQuestion.targetOutput}</div>
                     <Search size={24} className="text-slate-100 absolute bottom-6 right-6" />
                  </div>
                  <div className="flex-1 flex flex-col justify-end gap-4">
                    <button onClick={() => setIsRevealed(!isRevealed)} disabled={selectedId === null}
                      className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all duration-300 flex items-center justify-center gap-3 ${selectedId === null ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-primary-600 shadow-xl'}`}
                    >
                      {isRevealed ? <Lock size={20} /> : <Search size={20} />} {isRevealed ? 'إخفاء التحليل' : 'كشف التحليل'}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">اختر إجابة أولاً ثم اضغط على زر التحليل لمعرفة السبب</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!showGuide && (
          <div className="h-20 bg-slate-50 border-t border-slate-100 px-10 flex items-center justify-between no-print relative z-[60]">
              <button onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} disabled={currentIdx === 0} className="flex items-center gap-2 font-black text-slate-400 hover:text-slate-800 transition disabled:opacity-20"><ChevronRight size={24} /> السؤال السابق</button>
              <div className="flex gap-2 font-black text-xs text-slate-400">
                {[...Array(test.questions.length)].map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIdx ? 'w-12 bg-primary-500' : 'w-4 bg-slate-200'}`} />
                ))}
              </div>
              <button onClick={() => isLastQuestion ? navigate('/challenges') : setCurrentIdx(prev => Math.min((test?.questions?.length || 1) - 1, prev + 1))} className="flex items-center gap-2 font-black text-primary-600 hover:text-primary-700 transition">
                 {isLastQuestion ? 'إنهاء الاختبار' : 'السؤال التالي'} <ChevronLeft size={24} />
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
