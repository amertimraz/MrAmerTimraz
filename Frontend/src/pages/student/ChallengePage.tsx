import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, HelpCircle, Search, Trophy, ArrowLeft, Lock, ChevronRight, ChevronLeft, Sparkles, X, Brain, Maximize2, Minimize2, User as UserIcon, Award, Medal, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { challengesApi, type TofasTest } from '../../api/challenges';
import { useAuthStore } from '../../store/authStore';

export default function ChallengePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [test, setTest] = useState<TofasTest | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0); // 0: Welcome/Leaderboard, 1: Process, 2: Syntax Traps, 3: Logic Traps
  
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [finalScore, setFinalScore] = useState<{ score: number; total: number; correct: number } | null>(null);

  useEffect(() => {
    if (slug) {
      challengesApi.getBySlug(slug)
        .then(data => {
          setTest(data);
          setTimeLeft(data.timeLimitMinutes * 60 || 15 * 60);
          // Fetch leaderboard
          challengesApi.getResults(data.id).then(setLeaderboard);
        })
        .catch((err: any) => {
          if (err.response?.status === 403) {
             toast.error(err.response.data || 'عذراً، يجب شراء الكورس/الدرس المقترن بهذا التحدي أولاً.');
             navigate('/challenges');
          } else {
             toast.error('فشل في تحميل الاختبار البرمجي');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  useEffect(() => {
    if (!showGuide && !isTestFinished) {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showGuide, isTestFinished]);

  useEffect(() => {
    setSelectedId(null);
    setIsRevealed(false);
  }, [currentIdx]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const handleSelectAnswer = (idx: number) => {
    if (isRevealed) return;
    setSelectedId(idx);
    setUserAnswers(prev => ({ ...prev, [currentIdx]: idx }));
  };

  const calculateScore = (force = false) => {
    if (!test || !test.questions) return;
    
    // Prevent submitting early if not all questions are answered
    if (!force && Object.keys(userAnswers).length < test.questions.length) {
      toast.error('عذراً، يجب الإجابة على جميع الأسئلة أولاً قبل إنهاء الاختبار!', {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      return;
    }

    let correct = 0;
    test.questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      const correctSnippetIndex = q.snippets.findIndex(s => s.analysisType === 'Correct');
      if (selected === correctSnippetIndex) correct++;
    });
    
    const scoreData = {
      score: Math.round((correct / test.questions.length) * 100),
      total: test.questions.length,
      correct: correct
    };
    
    setFinalScore(scoreData);
    setIsTestFinished(true);
    
    // Submit to backend
    challengesApi.submitResult(test.id, {
      score: scoreData.score,
      totalQuestions: scoreData.total,
      correctCount: scoreData.correct
    }).then(() => {
      challengesApi.getResults(test.id).then(setLeaderboard);
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 font-cairo">جاري تحميل الاختبار...</div>;
  if (!test || !test.questions || test.questions.length === 0) 
    return <div className="min-h-screen flex items-center justify-center font-bold text-rose-500 font-cairo">الاختبار غير موجود أو لا يحتوي على أسئلة</div>;

  const currentQuestion = test.questions?.[currentIdx];
  const isLastQuestion = currentIdx === (test.questions?.length || 0) - 1;

  if (!currentQuestion) return null;

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-200 flex flex-col items-center py-8 px-4 print:p-0 print:bg-white overflow-x-hidden font-cairo" dir="rtl">
      
      {/* Dynamic Printing Style (Force all content to print) */}
      <style>{`
        @font-face { font-family: 'Cairo'; font-style: normal; font-weight: 400; font-display: swap; }
        .font-cairo { font-family: 'Cairo', sans-serif !important; }
        @media print {
          @page { size: A4 landscape; margin: 1cm; }
          html, body, #root, [data-reactroot], .min-h-screen { 
            height: auto !important; 
            min-height: 0 !important;
            overflow: visible !important; 
            display: block !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .print-area-full { width: 100% !important; height: auto !important; display: block !important; visibility: visible !important; }
          .question-card { 
            break-inside: avoid !important; 
            page-break-inside: avoid !important; 
            display: block !important; 
            border-bottom: 3px dashed #e2e8f0 !important; 
            padding-bottom: 40px !important; 
            margin-bottom: 40px !important;
            page-break-after: auto !important;
          }
          pre { 
            white-space: pre-wrap !important; 
            word-break: break-all !important; 
            font-family: monospace !important; 
            font-size: 11px !important; 
            background-color: #f8fafc !important; 
            border: 1px solid #e2e8f0 !important; 
            padding: 15px !important;
            border-radius: 10px !important;
          }
          /* High-Contrast Print Colors (Hex) */
          .bg-emerald-50 { background-color: #ecfdf5 !important; }
          .bg-emerald-100 { background-color: #d1fae5 !important; }
          .bg-rose-50 { background-color: #fff1f2 !important; }
          .bg-rose-100 { background-color: #ffe4e6 !important; }
          .bg-amber-50 { background-color: #fffbeb !important; }
          .bg-amber-100 { background-color: #fef3c7 !important; }
          .bg-slate-50 { background-color: #f8fafc !important; }
          .text-emerald-800 { color: #065f46 !important; }
          .text-rose-800 { color: #9f1239 !important; }
          .text-amber-800 { color: #92400e !important; }
          .border-emerald-300 { border-color: #6ee7b7 !important; }
          .border-slate-200 { border-color: #e2e8f0 !important; }
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
                 {showGuide ? 'Educational Tutorial' : isTestFinished ? 'Test Results' : `Question ${currentIdx + 1} / ${test.questions.length}`}
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'Admin' && (
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-lg shadow-indigo-500/20 transition">
              <FileText size={18} />
              <span className="hidden md:inline">تحميل مرجع المعلم (PDF)</span>
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
             <Clock size={16} className="text-amber-500" />
             <span className="font-mono font-bold text-slate-700">{formatTime(timeLeft)}</span>
          </div>
          <button onClick={toggleFullScreen} className="p-2 bg-white text-slate-400 hover:text-primary-500 rounded-xl border border-slate-200 transition">
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={() => window.location.reload()} className="p-2 bg-white text-slate-400 hover:text-primary-500 rounded-xl border border-slate-200 transition">
             <Sparkles size={18} />
          </button>
        </div>
      </div>

      {/* Main Experience Container */}
      <div className="no-print w-full max-w-[1280px] min-h-[750px] h-[85vh] bg-white shadow-2xl rounded-[3rem] border border-slate-300 relative overflow-hidden flex flex-col transition-all duration-700">
        
        {/* Notebook Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        {/* Top Decorative Bar */}
        <div className="h-10 bg-slate-800 flex items-center justify-between px-10 relative z-50">
           <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
           </div>
           <div className="flex items-center gap-4 text-slate-400 font-mono text-[8px] uppercase font-black tracking-widest">
             <Lock size={10} /> SECURE TEST ENVIRONMENT / STUDENT_ID: {user?.id}
           </div>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            {showGuide ? (
              <motion.div 
                key="guide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col p-12 overflow-y-auto custom-scrollbar"
              >
                {guideStep === 0 ? (
                  <div className="max-w-4xl mx-auto w-full space-y-12">
                     <div className="text-center space-y-4">
                        <div className="bg-primary-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                           <UserIcon size={48} className="text-primary-600" />
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tight">أهلاً بك يا {user?.name}!</h2>
                        <p className="text-2xl text-slate-500 font-bold">مستعد لتحدي الذكاء البرمجي اليوم؟</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col gap-6">
                           <h4 className="text-xl font-black text-slate-800 flex items-center gap-2"><Trophy className="text-amber-500" /> قائمة المتصدرين</h4>
                           <div className="space-y-3">
                              {leaderboard.length > 0 ? (
                                leaderboard.slice(0, 5).map((res, i) => (
                                  <div key={i} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                     <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div>
                                        <span className="font-bold text-slate-700">{res.studentName}</span>
                                     </div>
                                     <span className="font-black text-primary-600">{res.score}%</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-10 text-slate-300 font-bold italic">كن أنت أول المتصدرين!</div>
                              )}
                           </div>
                        </div>

                        <div className="flex flex-col gap-6 justify-center">
                           <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-2">
                              <h4 className="font-black text-emerald-800">معلومات التحدي:</h4>
                              <p className="text-sm text-emerald-700 font-bold">عدد الأسئلة: {test.questions?.length}</p>
                              <p className="text-sm text-emerald-700 font-bold">الوقت المتاح: {test.timeLimitMinutes} دقيقة</p>
                              <p className="text-xs text-emerald-600 leading-relaxed pt-2 opacity-80">نصيحة: لا تتسرع! أخطاء المنطق قد تكون في أبسط التفاصيل.</p>
                           </div>
                           <button onClick={() => setGuideStep(1)} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-2xl shadow-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-4">
                             ابدأ الشرح التعليمي <ChevronLeft size={28} />
                           </button>
                        </div>
                     </div>
                  </div>
                ) : guideStep === 1 ? (
                  <div className="max-w-4xl mx-auto w-full space-y-12">
                    <div className="text-center space-y-2 text-slate-900">
                       <h2 className="text-5xl font-black tracking-tight">كيف نحلل أي سؤال برمجي؟</h2>
                       <p className="text-2xl text-slate-500 font-bold">(خطوات المحقق البرمجي)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                       {[
                         { step: 1, title: "حدد الهدف", subtitle: "(The Goal)", desc: "ماذا يطلب السؤال أن نخرج؟ (مثال: رقم، أو رسالة نصية محددة). ابدأ دائماً بالنتيجة النهائية.", icon: <Medal className="text-amber-500" /> },
                         { step: 2, title: "استبعد أخطاء القواعد", subtitle: "(Syntax Errors)", desc: "ابحث عن الأكواد التي لا يمكن للحاسوب قراءتها. (مثل: تسمية المتغيرات بأرقام، أو أخطاء كتابة if).", icon: <X size={24} className="text-rose-500" /> },
                         { step: 3, title: "تتبع المنطق والحساب", subtitle: "(Trace Logic)", desc: "للخيارات المتبقية، قم بالتعويض بالأرقام وتتبع العمليات الحسابية بنفسك لمطابقتها للهدف.", icon: <Brain className="text-primary-500" /> }
                       ].map((m) => (
                         <div key={m.step} className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center text-center gap-4 hover:border-primary-200 transition relative">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100">{m.icon}</div>
                            <h4 className="text-xl font-black text-slate-900">{m.title}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.subtitle}</p>
                            <p className="text-slate-600 font-bold text-sm leading-relaxed">{m.desc}</p>
                         </div>
                       ))}
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setGuideStep(0)} className="flex-1 bg-slate-100 text-slate-600 py-6 rounded-3xl font-black text-xl">العودة</button>
                       <button onClick={() => setGuideStep(2)} className="flex-[2] bg-slate-900 text-white py-6 rounded-3xl font-black text-2xl shadow-xl hover:bg-primary-600 transition flex items-center justify-center gap-4">
                        شرح رائع، أرني مصفوفة الأسرار! <ChevronLeft size={28} />
                       </button>
                    </div>
                  </div>
                ) : guideStep === 2 ? (
                   <div className="max-w-5xl mx-auto w-full space-y-10">
                     <div className="text-center space-y-2">
                        <h2 className="text-5xl font-black text-slate-900 tracking-tight">مصفوفة أسرار القواعد (Syntax)</h2>
                        <p className="text-2xl text-rose-500 font-black tracking-widest uppercase">الأخطاء التي تجعل الكود لا يعمل نهائياً</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {[
                          { title: "تسمية المتغيرات", desc: "لا يمكن أن يبدأ اسم المتغير برقم", good: "let name5 = 'x';", bad: "let 5name = 'x';", icon: <Lock className="text-rose-600" /> },
                          { title: "عكس التعيين", desc: "المتغير دائماً لليسار والقيمة لليمين", good: "age = 20;", bad: "20 = age;", icon: <Lock className="text-rose-600" /> },
                          { title: "أقواس الشرط", desc: "Else لا تأخذ أقواس أبداً، IF تأخذ أقواس للصواب والخطأ", good: "if (x>5) { } else { }", bad: "else (x>5) { }", icon: <Lock className="text-rose-600" /> },
                          { title: "بداية الأكواد", desc: "لا يمكن البدء بـ Else أو Else If مباشرة", good: "if (x) { }", bad: "else if (x) { }", icon: <Lock className="text-rose-600" /> }
                        ].map((item, i) => (
                           <div key={i} className="bg-white border-2 border-slate-100 p-8 rounded-[3rem] shadow-xl space-y-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">{item.icon}</div>
                                 <h4 className="text-xl font-black text-slate-800">{item.title}</h4>
                              </div>
                              <p className="text-slate-500 font-bold text-sm">{item.desc}</p>
                              <div className="space-y-3">
                                 <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black text-emerald-500">صح ✅</span>
                                    <code className="bg-slate-50 p-4 rounded-xl text-emerald-600 font-mono text-sm block" dir="ltr">{item.good}</code>
                                 </div>
                                 <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black text-rose-500">خطأ ❌</span>
                                    <code className="bg-slate-50 p-4 rounded-xl text-rose-600 font-mono text-sm block" dir="ltr">{item.bad}</code>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="flex gap-4">
                        <button onClick={() => setGuideStep(1)} className="flex-1 bg-slate-100 text-slate-600 py-6 rounded-3xl font-black text-xl">العودة</button>
                        <button onClick={() => setGuideStep(3)} className="flex-[2] bg-slate-900 text-white py-6 rounded-3xl font-black text-2xl shadow-xl hover:bg-primary-600 transition flex items-center justify-center gap-4">
                         الآن، أرني أسرار المنطق والذكاء! <ChevronLeft size={28} />
                        </button>
                     </div>
                   </div>
                ) : (
                  <div className="max-w-5xl mx-auto w-full space-y-12">
                    <div className="text-center space-y-2">
                       <h2 className="text-5xl font-black text-slate-900 tracking-tight">مصفوفة أسرار المنطق (Logic)</h2>
                       <p className="text-2xl text-amber-500 font-black tracking-widest uppercase">الكود يعمل.. لكن النتيجة خاطئة!</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-amber-500 text-white rounded-2xl shadow-lg"><Brain size={24} /><h3 className="text-xl font-black">أسرار العمليات الحسابية</h3></div>
                        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-4">
                           <h4 className="font-black text-slate-800">1. تبديل المعاملات:</h4>
                           <p className="text-sm text-slate-500 font-bold">استخدام + بدلاً من - أو * بدلاً من / لتغيير النتيجة النهائية.</p>
                           <div className="bg-slate-50 p-6 rounded-2xl">
                              <code className="block text-amber-600 font-mono text-sm font-black" dir="ltr">{`let x = 10; \nlet y = x + 5; // توقعت 15 \nlet z = x - 5; // قد يكون الفخ هنا!`}</code>
                           </div>
                        </div>
                        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-4">
                           <h4 className="font-black text-slate-800">2. مقارنة لا تعويض:</h4>
                           <p className="text-sm text-slate-500 font-bold">استخدام مقارنة {"<"} بدلاً من تعيين =. لا يتم تغيير القيمة!</p>
                           <div className="bg-slate-50 p-6 rounded-2xl">
                              <code className="block text-amber-600 font-mono text-sm font-black" dir="ltr">{`x < x + 10; // لا يفعل شيء! \nx = x + 10; // هو التعديل الحقيقي.`}</code>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                         <div className="flex items-center gap-3 p-4 bg-slate-800 text-white rounded-2xl shadow-lg"><Search size={24} /><h3 className="text-xl font-black">أسرار الطباعة والثوابت</h3></div>
                         <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-4">
                            <h4 className="font-black text-slate-800">3. تتبع المتغير النهائي:</h4>
                            <p className="text-sm text-slate-500 font-bold">تغيير المتغير عدة مرات ثم طباعة القيمة البدائية.</p>
                            <div className="bg-slate-50 p-6 rounded-2xl space-y-3">
                               <code className="block text-slate-400 font-mono text-[10px]" dir="ltr">{`let score = 0; \nscore = 10; \nscore = score + 5;`}</code>
                               <code className="block text-rose-500 font-mono text-xs font-black underline decoration-2" dir="ltr">{`print(0); // الفخ: طباعة 0 بدلاً من 15`}</code>
                            </div>
                         </div>
                         <div className="bg-primary-600 p-8 rounded-[2.5rem] text-white space-y-4 shadow-2xl">
                            <h4 className="font-black text-xl flex items-center gap-2"><Sparkles /> نصيحة ذهبية:</h4>
                            <p className="font-bold text-sm leading-relaxed">دائماً تتبع القيمة النهائية لكل متغير قبل إصدار حكمك على الخيار الصحيح.</p>
                         </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setGuideStep(2)} className="flex-1 bg-slate-100 text-slate-600 py-6 rounded-3xl font-black text-xl">العودة</button>
                      <button onClick={() => setShowGuide(false)} className="flex-[2] bg-emerald-600 text-white py-6 rounded-3xl font-black text-2xl shadow-2xl hover:bg-emerald-700 transition flex items-center justify-center gap-4">فهمت كل شيء، لنبدأ الاختبار! <ChevronLeft size={28} /></button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : isTestFinished ? (
               <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-10">
                  <div className="relative">
                    <div className="w-48 h-48 bg-primary-600 rounded-[3rem] flex items-center justify-center text-white shadow-2xl rotate-3">
                       <Award size={96} />
                    </div>
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center shadow-lg -rotate-12 border-4 border-white">
                       <Medal size={32} className="text-slate-800" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                     <h2 className="text-6xl font-black text-slate-900">أداء رائع يا {user?.name}!</h2>
                     <p className="text-3xl text-slate-500 font-bold">لقد حصلت على درجة {finalScore?.score}%</p>
                  </div>

                  <div className="grid grid-cols-3 gap-8 w-full max-w-3xl">
                     <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100">
                        <span className="text-4xl font-black text-slate-800">{finalScore?.correct}</span>
                        <p className="text-xs font-black text-slate-400 uppercase mt-2">إجابة صحيحة</p>
                     </div>
                     <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100">
                        <span className="text-4xl font-black text-slate-800">{(finalScore?.total || 0) - (finalScore?.correct || 0)}</span>
                        <p className="text-xs font-black text-slate-400 uppercase mt-2">إجابة خاطئة</p>
                     </div>
                     <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100">
                        <span className="text-4xl font-black text-slate-800">{finalScore?.total}</span>
                        <p className="text-xs font-black text-slate-400 uppercase mt-2">إجمالي الأسئلة</p>
                     </div>
                  </div>

                  <div className="flex gap-4 w-full max-w-lg">
                     <button onClick={() => window.location.reload()} className="flex-1 py-6 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-xl hover:bg-black transition">إعادة المحاولة</button>
                     <button onClick={() => navigate('/challenges')} className="flex-1 py-6 bg-white border-2 border-slate-200 text-slate-800 rounded-3xl font-black text-xl hover:bg-slate-50 transition">العودة للرئيسية</button>
                  </div>
                  <button onClick={handlePrint} className="w-full max-w-lg py-5 bg-emerald-100 text-emerald-700 rounded-3xl font-black text-lg hover:bg-emerald-200 transition flex items-center justify-center gap-3 no-print">
                      <FileText size={24} />
                      حفظ كافة الأسئلة والتحليلات بصيغة PDF
                  </button>
               </motion.div>
            ) : (
              <motion.div key="questions" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-row overflow-hidden">
                {/* Question Sidebar (NOW FIRST CHILD -> RIGHT IN RTL) */}
                <div className="w-[450px] bg-slate-50/80 border-l border-slate-200 p-12 flex flex-col gap-10 no-print">
                   <div className="space-y-6">
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20"><Sparkles size={12} /> تحدي #{currentIdx + 1}</div>
                     <div className="p-8 bg-primary-50 border-2 border-primary-100 rounded-[2.5rem] shadow-sm">
                        <p className="text-xl text-slate-800 font-bold leading-relaxed text-center">{currentQuestion.description || "حلل الأكواد البرمجية الظاهرة أمامك، واختر البرنامج الذي يقوم بإخراج القيمة التالية:"}</p>
                     </div>
                   </div>
                   <div className="p-10 bg-white border-2 border-slate-800/10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex flex-col items-center gap-4 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-3 bg-slate-800" />
                      <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">المخرجات المطلوبة</span>
                      <div className={`font-black text-slate-800 font-mono tracking-tighter transition duration-500 text-center ${currentQuestion.targetOutput.length > 10 ? 'text-2xl' : currentQuestion.targetOutput.length > 5 ? 'text-4xl' : 'text-7xl'}`}>{currentQuestion.targetOutput}</div>
                      <Search size={24} className="text-slate-100 absolute bottom-6 right-6" />
                   </div>
                   <div className="flex-1 flex flex-col justify-end gap-4 font-cairo">
                     <button onClick={() => setIsRevealed(!isRevealed)} disabled={selectedId === null}
                       className={`w-full py-6 rounded-[2.5rem] font-black text-xl transition-all duration-300 flex items-center justify-center gap-3 ${selectedId === null ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-primary-600 shadow-xl'}`}
                     >
                       {isRevealed ? <Lock size={20} /> : <Search size={20} />} {isRevealed ? 'إخفاء الإجابة' : 'ظهور الإجابة'}
                     </button>
                     <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">اختر إجابة أولاً ثم اضغط على زر ظهور الإجابة لمعرفة السبب</p>
                   </div>
                </div>

                {/* Choices List (NOW SECOND CHILD -> LEFT IN RTL) */}
                <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-white/40 backdrop-blur-3xl custom-scrollbar relative no-print">
                   <div className="flex flex-col gap-6">
                     {currentQuestion.snippets.sort((a,b) => a.orderIndex - b.orderIndex).map((snippet, idx) => (
                       <div key={idx} onClick={() => handleSelectAnswer(idx)}
                         className={`relative group cursor-pointer border-[3px] transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl ${selectedId === idx ? 'border-primary-500 shadow-2xl scale-[1.01]' : 'border-slate-100 hover:border-primary-200 hover:bg-white'} ${isRevealed && snippet.analysisType === 'Correct' ? 'border-emerald-500 bg-emerald-50/50' : isRevealed && selectedId === idx && snippet.analysisType !== 'Correct' ? 'border-rose-500 bg-rose-50/50' : ''}`}
                       >
                         <div className={`absolute top-0 right-0 w-3 h-full transition duration-500 z-20 ${selectedId === idx ? 'bg-primary-500' : 'bg-transparent'}`} />
                         <div className="flex flex-col md:flex-row items-stretch min-h-[140px]">
                           <div className="w-20 bg-slate-50/80 flex flex-col items-center justify-center border-l border-slate-100 group-hover:bg-primary-50 transition no-print z-10">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition duration-500 ${selectedId === idx ? 'bg-primary-500 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>{idx + 1}</div>
                           </div>
                           <div className="flex-1 p-8 flex flex-col justify-center relative z-10">
                             <div className="overflow-x-auto custom-scrollbar-horizontal">
                               <pre className="font-mono text-slate-800 text-sm leading-relaxed whitespace-pre text-left font-sans" dir="ltr" style={{ unicodeBidi: 'isolate' }}>{snippet.code}</pre>
                             </div>
                           </div>
                           <AnimatePresence>
                             {isRevealed && (
                               <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                                 className={`overflow-hidden flex flex-col justify-center border-r-2 border-dashed z-0 ${snippet.analysisType === 'Correct' ? 'bg-emerald-50 border-emerald-200' : snippet.analysisType === 'Syntax' ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}
                               >
                                 <div className={`w-[300px] p-6 text-sm font-bold ${snippet.analysisType === 'Correct' ? 'text-emerald-800' : snippet.analysisType === 'Syntax' ? 'text-rose-800' : 'text-amber-800'}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                      {snippet.analysisType === 'Correct' ? <Trophy size={18} /> : <HelpCircle size={18} />}
                                      <span className="text-[11px] uppercase font-black opacity-80 text-slate-500">التحليل التفصيلي</span>
                                    </div>
                                    <div className="leading-relaxed whitespace-pre-wrap">{snippet.analysisMessage}</div>
                                 </div>
                               </motion.div>
                             )}
                           </AnimatePresence>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!showGuide && !isTestFinished && (
          <div className="h-20 bg-slate-50 border-t border-slate-100 px-10 flex items-center justify-between no-print relative z-[60] font-cairo">
              <button onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} disabled={currentIdx === 0} className="flex items-center gap-2 font-black text-slate-400 hover:text-slate-800 transition disabled:opacity-20"><ChevronRight size={24} /> السؤال السابق</button>
              <div className="flex gap-2 font-black text-xs text-slate-400 px-10">
                {test.questions && [...Array(test.questions.length)].map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIdx ? 'w-12 bg-primary-500' : userAnswers[i] !== undefined ? 'w-4 bg-emerald-400' : 'w-4 bg-slate-200'}`} />
                ))}
              </div>
              <button 
                onClick={isLastQuestion ? () => calculateScore() : () => setCurrentIdx(prev => prev + 1)} 
                className="flex items-center gap-2 font-black text-primary-600 hover:text-primary-800 transition"
              >
                 {isLastQuestion ? 'إنهاء الاختبار' : 'السؤال التالي'} <ChevronLeft size={24} />
              </button>
          </div>
        )}
      </div>

      {/* Persistent PDF Layout (Hidden normally, shown physically when printing) */}
      {/* Ensures it prints perfectly even on the final results page */}
      <div className="hidden print:block print-area-full mt-20" dir="rtl">
         {/* Tutorial Content */}
         <div className="question-card p-10 font-cairo">
            <h1 className="text-4xl font-black mb-6 text-slate-900 border-b-4 border-slate-200 pb-4 inline-block tracking-tight">الدليل التعليمي السريع للمنصة</h1>
            
            <div className="space-y-12">
               <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-800">1. خطوات المحقق البرمجي:</h2>
                  <div className="grid grid-cols-1 gap-4">
                     <p className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold"><strong className="text-primary-600 block">✓ حدد الهدف:</strong> اسأل نفسك: ماذا يطلب السؤال أن نخرج؟ ابدأ دائماً بالنتيجة النهائية.</p>
                     <p className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold"><strong className="text-rose-600 block">✓ استبعد أخطاء القواعد (Syntax):</strong> ابحث عن الأكواد التي لا يمكن للحاسوب قراءتها مثل تسمية المتغيرات بأرقام.</p>
                     <p className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold"><strong className="text-amber-600 block">✓ تتبع المنطق والحساب (Logic):</strong> قم بالتعويض بالأرقام وتتبع العمليات الحسابية بنفسك.</p>
                  </div>
               </div>

               <div className="space-y-6 border-t-2 border-dashed border-slate-200 pt-8">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">2. ملخص التحليل البرمجي (الأسباب الشائعة للأخطاء):</h2>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <h3 className="font-black text-lg text-rose-600">أ. أخطاء التسمية والتعيين</h3>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">لا يمكن أن يبدأ اسم المتغير برقم ابداً. وعند التعيين، المتغير يسار والقيمة يمين (مثل: <code>age = 20;</code> وليس العكس).</p>
                     </div>
                     <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <h3 className="font-black text-lg text-rose-600">ب. أقواس الشرط</h3>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">جملة <code>Else</code> لا تأخذ أقواس 조건 أبداً. بينما <code>IF</code> أو <code>Else If</code> تتطلب أقواس.</p>
                     </div>
                     <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <h3 className="font-black text-lg text-amber-600">ج. مقارنة وليس تعديل</h3>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">كود مثل <code>x {"<"} 5</code> لا يُعدّل قيمة x وإنما يفحصها فقط. لتعديلها تستعمل <code>x = 5</code> أو <code>x++</code>.</p>
                     </div>
                     <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <h3 className="font-black text-lg text-amber-600">د. تتبع قيمة المخرجات</h3>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">انتبه للقيمة النهائية وقت الطباعة <code>print(x)</code> هل تطبع x معدلة أم تطبع رقماً ثابتاً يخدعك؟</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="w-full border-t-4 border-slate-900 my-16 opacity-10"></div>

         <div className="mb-10 text-center">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">أسئلة وإجابات الاختبار</h1>
            <p className="text-xl text-slate-500 font-bold mt-2">"{test.title}"</p>
         </div>

         {test.questions?.map((q, qIdx) => (
           <div key={`print-q-${qIdx}`} className="question-card p-10 font-cairo mb-12">
              <h2 className="text-2xl font-black mb-8 leading-relaxed">السؤال {qIdx + 1}: {q.description}</h2>
              <div className="mt-4 mb-6 p-4 bg-slate-100 text-slate-600 rounded-xl font-black text-lg border-2 border-slate-200 inline-block w-full text-center">
                 أوجد المخرجات المطلوبة: <span className="font-mono text-xl">{q.targetOutput}</span>
              </div>
              <div className="grid grid-cols-2 gap-8">
                 {q.snippets.map((s, sIdx) => {
                    const isCorrect = s.analysisType === 'Correct';
                    return (
                      <div key={`print-s-${sIdx}`} className={`border-2 p-6 rounded-3xl ${isCorrect ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="flex justify-between items-center mb-4">
                           <span className="font-black text-sm block">الخيار {sIdx + 1}</span>
                           {isCorrect && <span className="text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full text-xs font-black">الإجابة الصحيحة ✅</span>}
                        </div>
                        <pre className="text-sm bg-white p-4 rounded-xl border border-slate-100 font-mono text-left leading-relaxed mb-4 overflow-x-hidden min-h-[100px]" dir="ltr">{s.code}</pre>
                        <div className={`text-sm mt-3 font-bold leading-relaxed p-4 rounded-xl ${isCorrect ? 'text-emerald-800 bg-emerald-100' : s.analysisType === 'Syntax' ? 'text-rose-800 bg-rose-100' : 'text-amber-800 bg-amber-100'}`}>
                           <strong className="block mb-1 text-xs uppercase opacity-80">التحليل التفصيلي:</strong> {s.analysisMessage}
                        </div>
                      </div>
                    )
                 })}
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
