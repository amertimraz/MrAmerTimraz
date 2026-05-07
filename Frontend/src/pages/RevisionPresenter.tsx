import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quizzesApi } from '../api/quizzes';
import { 
  ChevronRight, ChevronLeft, Video, Square, Download, 
  X, HelpCircle, Eye, EyeOff, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMediaUrl } from '../api/client';
import toast from 'react-hot-toast';
import { CodeBlock } from '../components/ui/CodeBlock';

/* --- Helpers --- */
function parseOptions(raw?: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function getCorrectIdx(q: any): number {
  if (q.type === 'TrueFalse') return q.correctAnswer === 'true' ? 0 : 1;
  const n = Number(q.correctAnswer);
  return isNaN(n) ? -1 : n;
}

const renderContent = (text: string) => {
  if (!text.includes('```')) return <>{text}</>;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const content = part.slice(3, -3).trim();
          const firstLine = content.split('\n')[0].trim();
          const hasLang = /^[a-z]+$/i.test(firstLine);
          const lang = hasLang ? firstLine : 'code';
          const code = hasLang ? content.slice(firstLine.length).trim() : content;
          return <CodeBlock key={i} code={code} language={lang} className="my-4" />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export default function RevisionPresenter() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<'slide' | 'paper'>('paper');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | null>>({});
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ['interactive-quiz', id, slug],
    queryFn: () => {
      if (id) return quizzesApi.getById(Number(id));
      if (slug) return quizzesApi.getBySlug(slug);
      throw new Error('No ID or Slug provided');
    },
    enabled: !!(id || slug),
  });

  const questions = quiz?.questions || [];
  const isCyberTech = quiz?.theme === 'CyberTech';

  /* --- Recording Logic --- */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true
      });
      
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      mediaRecorderRef.current = recorder;
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revision-${quiz?.title || 'video'}.webm`;
        a.click();
        setIsRecording(false);
        toast.success('تم حفظ تسجيل المراجعة!');
      };

      recorder.start();
      setIsRecording(true);
      toast.success('بدأ التسجيل... بالتوفيق!');
    } catch (err) {
      console.error(err);
      toast.error('فشل بدء التسجيل. تأكد من إعطاء الصلاحيات.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
    }
  };

  /* --- Interaction --- */
  const handleSelect = (qIdx: number, optIdx: number) => {
    setSelectedOptions(prev => ({ ...prev, [qIdx]: optIdx }));
    setRevealed(prev => ({ ...prev, [qIdx]: true }));
  };

  const toggleShowAnswer = (qIdx: number) => {
    setShowAnswers(prev => ({ ...prev, [qIdx]: !prev[qIdx] }));
  };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (error || !quiz) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white"><p>حدث خطأ في تحميل الاختبار</p><button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-indigo-600 rounded-xl">العودة</button></div>;

  return (
    <div className={`min-h-screen ${viewMode === 'paper' ? (isCyberTech ? 'bg-slate-950' : 'bg-slate-200 dark:bg-slate-900') : 'bg-[#0f172a]'} text-white flex flex-col font-sans`} dir="rtl">
      {/* Header (ToolBar) */}
      <header className="sticky top-0 z-50 p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/90 backdrop-blur-md shadow-xl no-print">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Video size={20} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black text-white">{quiz.title}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase">نمط المراجعة والتسجيل</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/5 rounded-full p-1 flex gap-1 mr-4">
            <button 
              onClick={() => setViewMode('paper')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewMode === 'paper' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              نمط الملزمة 📄
            </button>
            <button 
              onClick={() => setViewMode('slide')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewMode === 'slide' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              نمط العرض 📽️
            </button>
          </div>

          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-black transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500'}`}
          >
            {isRecording ? <Square size={16} fill="currentColor" /> : <Video size={16} />}
            <span className="hidden md:inline">{isRecording ? 'إيقاف التسجيل' : 'بدء تسجيل المراجعة'}</span>
          </button>
          
          <button onClick={() => window.print()} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300" title="طباعة الملزمة">
            <Download size={18} />
          </button>
          
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {viewMode === 'paper' ? (
          /* --- PAPER MODE (Booklet Style) --- */
          <div className="flex-1 py-12 px-4 flex justify-center">
             <div className={`w-full max-w-4xl rounded-sm shadow-2xl relative min-h-[1400px] flex flex-col border-[12px] border-double ${isCyberTech ? 'bg-slate-950 border-indigo-500/50 shadow-indigo-500/20 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                {/* Decorative Frame inside */}
                <div className={`absolute inset-0 border-2 m-2 pointer-events-none ${isCyberTech ? 'border-indigo-500/30' : 'border-slate-300'}`} />
                
                {/* Branding Header */}
                <div className={`p-8 border-b-4 border-double flex items-center justify-between relative z-10 ${isCyberTech ? 'border-indigo-500/50 bg-slate-900/50' : 'border-slate-900 bg-white'}`}>
                   <div className="text-right">
                      <h2 className={`text-3xl font-black mb-1 ${isCyberTech ? 'text-indigo-400' : 'text-slate-900'}`}>مستر عامر تمراز</h2>
                      <p className={`text-xl font-bold ${isCyberTech ? 'text-emerald-400' : 'text-indigo-700'}`}>خبير البرمجة والذكاء الاصطناعي</p>
                      <div className="mt-4 flex flex-col gap-1">
                         <span className={`text-sm font-black px-3 py-1 rounded-md w-fit ${isCyberTech ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-900 text-white'}`}>المادة: {quiz.subject || 'تكنولوجيا المعلومات'}</span>
                         <span className={`text-sm font-black px-3 py-0.5 rounded-md w-fit border-2 ${isCyberTech ? 'border-emerald-500/30 text-emerald-300' : 'border-slate-900 text-slate-900'}`}>الصف: {quiz.grade || 'الأول الثانوي'}</span>
                      </div>
                   </div>
                   <div className="text-center">
                      <div className={`w-24 h-24 rounded-full border-4 p-1 overflow-hidden mb-2 mx-auto ${isCyberTech ? 'border-indigo-500 shadow-lg shadow-indigo-500/40' : 'border-slate-900 bg-slate-50'}`}>
                         {quiz.teacherImage ? (
                           <img src={getMediaUrl(quiz.teacherImage)} alt="Teacher" className="w-full h-full object-cover rounded-full" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300"><HelpCircle size={40} /></div>
                         )}
                      </div>
                      <p className={`text-xs font-black uppercase tracking-widest ${isCyberTech ? 'text-indigo-400' : 'text-slate-400'}`}>Official Revision</p>
                   </div>
                   <div className="text-left">
                      <h3 className={`text-4xl font-black opacity-20 ${isCyberTech ? 'text-indigo-500' : 'text-slate-900'}`}>2026</h3>
                      <p className={`text-sm font-bold ${isCyberTech ? 'text-slate-400' : 'text-slate-500'}`}>ترم ثاني - مراجعة ليلة الامتحان</p>
                   </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 p-10 relative">
                   {/* Watermark */}
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
                      <span className={`text-[120px] font-black -rotate-45 uppercase whitespace-nowrap opacity-[0.03] ${isCyberTech ? 'text-indigo-500' : 'text-slate-900'}`}>AMER TIMRAZ</span>
                   </div>

                   <div className="relative z-10 space-y-12">
                      <div className="text-center mb-12">
                         <h4 className="inline-block border-b-4 border-indigo-600 pb-2 text-2xl font-black text-slate-900 px-8 italic">
                            « أقوى مراجعة نهائية - {quiz.title} »
                         </h4>
                      </div>

                      {questions.map((q, qIdx) => {
                        const qOptions = parseOptions(q.options);
                        const qCorrect = getCorrectIdx(q);
                        const isRevealed = !!revealed[qIdx];
                        const selOpt = selectedOptions[qIdx];
                        const isShowingAns = !!showAnswers[qIdx];

                        return (
                          <div key={q.id} className="group relative">
                             <div className="flex items-start gap-4 mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-black text-xl shadow-lg ${isCyberTech ? 'bg-indigo-500 text-white shadow-indigo-500/50' : 'bg-slate-900 text-white'}`}>
                                   {qIdx + 1}
                                </div>
                                <div className="flex-1 pt-1">
                                   <div className={`text-2xl font-bold leading-relaxed ${isCyberTech ? 'text-white' : 'text-slate-900'}`}>
                                      {renderContent(q.text)}
                                   </div>
                                </div>
                                <div className="flex gap-1 no-print">
                                   <button 
                                     onClick={() => toggleShowAnswer(qIdx)}
                                     className={`p-2 rounded-lg transition-colors ${isShowingAns ? 'bg-indigo-600 text-white' : isCyberTech ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                   >
                                     <Eye size={18} />
                                   </button>
                                </div>
                             </div>

                             {/* Options Area */}
                             <div className={`grid gap-3 mr-14 ${q.type === 'TrueFalse' ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                                {qOptions.map((opt, optIdx) => {
                                   const isCorrect = optIdx === qCorrect;
                                   const isSelected = optIdx === selOpt;
                                   const status = (isRevealed && isCorrect) || (isShowingAns && isCorrect) ? 'correct' : 
                                                 (isRevealed && isSelected && !isCorrect) ? 'wrong' : 'idle';

                                   return (
                                     <button
                                       key={optIdx}
                                       onClick={() => handleSelect(qIdx, optIdx)}
                                       className={`
                                         p-4 rounded-xl border-2 text-lg font-bold flex items-center gap-3 transition-all text-right
                                         ${status === 'correct' ? (isCyberTech ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-emerald-50 border-emerald-500 text-emerald-700') : 
                                           status === 'wrong' ? (isCyberTech ? 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/20' : 'bg-red-50 border-red-500 text-red-700') : 
                                           (isCyberTech ? 'bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/50 text-slate-300 hover:text-white' : 'bg-slate-50 border-slate-200 hover:border-slate-400 text-slate-600')}
                                       `}
                                     >
                                       <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-sm border ${status === 'correct' ? 'bg-emerald-500 text-white border-emerald-600' : status === 'wrong' ? 'bg-red-500 text-white border-red-600' : (isCyberTech ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-white border-slate-300')}`}>
                                          {q.type === 'TrueFalse' ? (optIdx === 0 ? '✔️' : '❌') : String.fromCharCode(65 + optIdx)}
                                       </span>
                                       <span className="flex-1">{opt}</span>
                                     </button>
                                   );
                                })}
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </div>

                {/* Footer Branding */}
                <div className={`p-8 border-t-2 flex items-center justify-between font-black text-xs uppercase tracking-widest mt-auto ${isCyberTech ? 'bg-slate-900 border-indigo-500/30 text-indigo-400' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                   <span>© 2026 MR AMER TIMRAZ</span>
                   <span>ممنوع التداول أو النسخ دون إذن المؤلف</span>
                   <span>WWW.AMERTIMRAZ.COM</span>
                </div>
             </div>
          </div>
        ) : (
          /* --- SLIDE MODE (Original Modern Presenter) --- */
          <div className="flex-1 flex flex-col">
             <div className="h-1.5 w-full bg-white/5 relative z-20">
                <motion.div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
             </div>

             <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl">
                   <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
                   <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentIdx}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full max-w-5xl z-10"
                  >
                    <div className="flex flex-col gap-8">
                      {(() => {
                         const q = questions[currentIdx];
                         const qOptions = parseOptions(q.options);
                         const qCorrect = getCorrectIdx(q);
                         const isRevealed = revealed[currentIdx];
                         const selOpt = selectedOptions[currentIdx];
                         const isShowingAns = showAnswers[currentIdx];

                         return (
                           <>
                              <div className="bg-slate-900/40 border border-white/10 rounded-[2.5rem] p-10 md:p-16 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
                                <div className="relative">
                                  <div className="flex items-center gap-3 mb-8">
                                    <span className="px-4 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 text-sm font-black border border-indigo-500/20">سؤال {currentIdx + 1} من {questions.length}</span>
                                    <span className={`px-4 py-1.5 rounded-xl text-sm font-black border flex items-center gap-2 ${q.type === 'TrueFalse' ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'}`}>
                                       <HelpCircle size={16} /> {q.type === 'TrueFalse' ? 'صح أو خطأ' : 'اختيار من متعدد'}
                                    </span>
                                  </div>
                                  <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">{renderContent(q.text)}</h2>
                                </div>
                              </div>

                              <div className={`grid gap-4 ${q.type === 'TrueFalse' ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                                {qOptions.map((opt, i) => {
                                   const status = (isRevealed && i === qCorrect) || (isShowingAns && i === qCorrect) ? 'correct' : 
                                                 (isRevealed && i === selOpt && i !== qCorrect) ? 'wrong' : 'idle';
                                   return (
                                     <motion.button
                                       key={i}
                                       whileHover={{ scale: 1.02 }}
                                       whileTap={{ scale: 0.98 }}
                                       onClick={() => handleSelect(currentIdx, i)}
                                       className={`p-6 md:p-8 rounded-[2rem] border-2 text-2xl font-bold flex items-center gap-6 transition-all text-right relative overflow-hidden ${status === 'correct' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20' : status === 'wrong' ? 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/20' : 'bg-slate-900/40 border-white/10 text-slate-300 hover:text-white'}`}
                                     >
                                       <span className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl font-black ${status === 'correct' ? 'bg-emerald-50 text-emerald-600' : status === 'wrong' ? 'bg-red-50 text-red-600' : 'bg-white/10'}`}>
                                          {q.type === 'TrueFalse' ? (i === 0 ? '✔️' : '❌') : String.fromCharCode(65 + i)}
                                       </span>
                                       <span className="flex-1">{opt}</span>
                                     </motion.button>
                                   );
                                })}
                              </div>
                           </>
                         )
                      })()}
                    </div>
                  </motion.div>
                </AnimatePresence>
             </main>

             <footer className="p-8 bg-slate-900/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-between z-20">
                <button onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0} className="w-16 h-16 rounded-[1.5rem] bg-white/5 hover:bg-white/10 flex items-center justify-center disabled:opacity-20"><ChevronRight size={36} /></button>
                <div className="flex items-center gap-6">
                   <button onClick={() => toggleShowAnswer(currentIdx)} className={`flex items-center gap-3 font-black text-lg px-8 py-4 rounded-[1.5rem] transition-all ${showAnswers[currentIdx] ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                      {showAnswers[currentIdx] ? <EyeOff size={24} /> : <Eye size={24} />} {showAnswers[currentIdx] ? 'إخفاء الإجابة' : 'عرض الإجابة'}
                   </button>
                   <button onClick={() => { setRevealed(prev => ({...prev, [currentIdx]: false})); setSelectedOptions(prev => ({...prev, [currentIdx]: null})); setShowAnswers(prev => ({...prev, [currentIdx]: false})); }} className="px-8 py-4 rounded-[1.5rem] bg-white/5 text-slate-400 hover:text-white border border-white/10 transition-all"><RotateCcw size={24} /></button>
                </div>
                <button onClick={() => currentIdx < questions.length - 1 && setCurrentIdx(currentIdx + 1)} disabled={currentIdx === questions.length - 1} className="w-16 h-16 rounded-[1.5rem] bg-white/5 hover:bg-white/10 flex items-center justify-center disabled:opacity-20"><ChevronLeft size={36} /></button>
             </footer>
          </div>
        )}
      </div>
    </div>
  );
}
