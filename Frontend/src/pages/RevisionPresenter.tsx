import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quizzesApi } from '../api/quizzes';
import { 
  Download, X, Eye, EyeOff, 
  Maximize2, Minimize2, Palette, Sparkles, Trophy,
  CheckCircle2, XCircle, BookOpen, Layers, Check, AlertCircle, Code
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CodeBlock } from '../components/ui/CodeBlock';

type ThemeType = 'midnight' | 'emerald' | 'sunset' | 'frost';

interface ThemeConfig {
  bg: string;
  card: string;
  accent: string;
  text: string;
  secondaryText: string;
  border: string;
  glow: string;
}

const THEMES: Record<ThemeType, ThemeConfig> = {
  midnight: {
    bg: 'bg-[#050b1a]',
    card: 'bg-white/5 backdrop-blur-xl border-white/10',
    accent: 'from-indigo-500 to-purple-600',
    text: 'text-white',
    secondaryText: 'text-indigo-400',
    border: 'border-indigo-500/30',
    glow: 'shadow-indigo-500/20'
  },
  emerald: {
    bg: 'bg-[#022c22]',
    card: 'bg-emerald-950/40 backdrop-blur-xl border-emerald-500/20',
    accent: 'from-emerald-400 to-teal-600',
    text: 'text-emerald-50',
    secondaryText: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20'
  },
  sunset: {
    bg: 'bg-[#1a0b05]',
    card: 'bg-orange-950/30 backdrop-blur-xl border-orange-500/20',
    accent: 'from-orange-400 to-rose-600',
    text: 'text-orange-50',
    secondaryText: 'text-orange-400',
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/20'
  },
  frost: {
    bg: 'bg-[#f8fafc]',
    card: 'bg-white border-slate-200 shadow-xl',
    accent: 'from-blue-600 to-indigo-700',
    text: 'text-slate-900',
    secondaryText: 'text-indigo-700 font-bold',
    border: 'border-slate-300',
    glow: 'shadow-blue-500/10'
  }
};

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
  const cleanText = text.replace(/\\n/g, '\n');
  if (!cleanText.includes('```') && !cleanText.includes('<div dir="ltr"')) return <span className="whitespace-pre-line">{cleanText}</span>;
  
  const parts = cleanText.split(/(```[\s\S]*?```|<div dir="ltr"[\s\S]*?<\/div>)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('<div dir="ltr"')) {
           return <div key={i} dangerouslySetInnerHTML={{ __html: part }} />;
        }
        if (part.startsWith('```') && part.endsWith('```')) {
          let content = part.slice(3, -3).trim();
          content = content
            .replace(/<[^>]*>?/gm, '')
            .replace(/class="[^"]*"/g, '')
            .replace(/style="[^"]*"/g, '')
            .replace(/font-bold/g, '')
            .replace(/text-[a-z0-9-]+/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/<.*?>/g, '');
          
          content = content.replace(/\s{2,}/g, ' ').replace(/\n\s+/g, '\n').trim();
          const lines = content.split('\n');
          let lang = 'code';
          let finalCode = content;
          if (lines.length > 0) {
            const firstLine = lines[0].trim().toLowerCase();
            if (['vb', 'visualbasic', 'python', 'javascript', 'js', 'html', 'css', 'csharp', 'cpp'].includes(firstLine)) {
              lang = firstLine;
              finalCode = lines.slice(1).join('\n');
            }
          }
          return (
            <div key={i} className="my-6 relative group">
               <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
               <CodeBlock code={finalCode} language={lang} className="relative z-10 shadow-2xl border border-white/10" />
            </div>
          );
        }
        return <span key={i} className="whitespace-pre-line">{part}</span>;
      })}
    </>
  );
};

export default function RevisionPresenter() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<ThemeType>('midnight');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | null>>({});
  const [completionAnswers, setCompletionAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const activeTheme = THEMES[theme];

  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ['interactive-quiz', id, slug],
    queryFn: () => {
      if (id) return quizzesApi.getById(Number(id));
      if (slug) return quizzesApi.getBySlug(slug);
      throw new Error('No ID or Slug provided');
    },
    enabled: !!(id || slug),
  });

  // Filter questions by type and position
  const goldenQuestions = useMemo(() => quiz?.questions.slice(0, 8) || [], [quiz]);
  const tfQuestions = useMemo(() => quiz?.questions.slice(8).filter(q => String(q.type) === 'TrueFalse' || Number(q.type) === 1) || [], [quiz]);
  
  const allOtherQuestions = useMemo(() => quiz?.questions.slice(8).filter(q => String(q.type) !== 'TrueFalse' && Number(q.type) !== 1) || [], [quiz]);
  
  const mcqQuestions = useMemo(() => allOtherQuestions.filter(q => (String(q.type) === 'MCQ' || Number(q.type) === 0) && !q.text.includes('```')), [allOtherQuestions]);
  
  const codeQuestions = useMemo(() => allOtherQuestions.filter(q => (String(q.type) === 'MCQ' || Number(q.type) === 0) && q.text.includes('```')), [allOtherQuestions]);
  
  const completionQuestions = useMemo(() => allOtherQuestions.filter(q => String(q.type) === 'Completion' || Number(q.type) === 2), [allOtherQuestions]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 30 } }, audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
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
    } catch (err) { toast.error('فشل بدء التسجيل.'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#050b1a] flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (error || !quiz) return <div className="min-h-screen bg-[#050b1a] flex flex-col items-center justify-center text-white font-['Cairo']"><p>حدث خطأ في تحميل المراجعة</p><button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-indigo-600 rounded-xl">العودة</button></div>;

  const renderQuestionList = (questions: any[], startIdx: number) => {
    return questions.map((q, qIdx) => {
      const options = parseOptions(q.options);
      const correctIdx = getCorrectIdx(q);
      const absoluteIdx = startIdx + qIdx;
      const isRevealed = revealed[absoluteIdx] || showAnswers[absoluteIdx];
      const selIdx = selectedOptions[absoluteIdx];
      const currentInput = completionAnswers[absoluteIdx] || '';
      const isCorrectCompletion = currentInput.trim() === q.correctAnswer?.trim();

      const rawType = String(q.type);
      const questionType = (rawType === 'MCQ' || Number(q.type) === 0) ? 'MCQ' : (rawType === 'TrueFalse' || Number(q.type) === 1) ? 'TrueFalse' : 'Completion';

      return (
        <motion.div key={q.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`${activeTheme.card} p-8 rounded-[2rem] border hover:border-white/20 transition-all duration-500 shadow-xl group relative overflow-hidden`}>
          <div className="flex items-start gap-6 relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeTheme.accent} flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg`}>{absoluteIdx + 1}</div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className={`text-2xl font-black leading-relaxed flex flex-wrap items-center gap-3 ${activeTheme.text}`}>
                  {questionType === 'Completion' ? (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-4">
                       {q.text.split('......').map((part: string, pIdx: number, arr: any[]) => (
                         <span key={pIdx} className="flex items-center gap-3">
                           {renderContent(part)}
                           {pIdx < arr.length - 1 && (
                             <div className="relative group/input inline-block">
                               <input 
                                 type="text"
                                 value={currentInput}
                                 onChange={(e) => setCompletionAnswers(p => ({...p, [absoluteIdx]: e.target.value}))}
                                 disabled={isRevealed}
                                 placeholder="اكتب الإجابة..."
                                 className={`
                                   px-4 py-2 rounded-xl border-2 transition-all font-bold text-lg min-w-[180px] text-center
                                   ${isRevealed 
                                      ? (isCorrectCompletion ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-400')
                                      : `${activeTheme.bg} border-white/10 text-white focus:border-indigo-500 outline-none shadow-inner`
                                   }
                                 `}
                               />
                               {isRevealed && (
                                 <div className="absolute -top-1 -right-1">
                                   {isCorrectCompletion ? <Check className="text-emerald-500" size={20} /> : <AlertCircle className="text-red-500" size={20} />}
                                 </div>
                               )}
                             </div>
                           )}
                         </span>
                       ))}
                       {questionType === 'Completion' && !isRevealed && (
                         <button 
                           onClick={() => setRevealed(p => ({...p, [absoluteIdx]: true}))}
                           className={`ms-4 px-6 py-2 rounded-xl bg-gradient-to-r ${activeTheme.accent} text-white text-sm font-black shadow-lg hover:scale-105 transition-all`}
                         >
                           تحقق
                         </button>
                       )}
                    </div>
                  ) : renderContent(q.text)}
                  
                  {questionType === 'TrueFalse' && (
                    <div className="flex items-center gap-2 ms-auto shrink-0">
                      {[0, 1].map(btnIdx => {
                        const isCorrect = btnIdx === correctIdx;
                        const isSelected = btnIdx === selIdx;
                        const state = (isRevealed && isCorrect) ? 'correct' : (revealed[absoluteIdx] && isSelected && !isCorrect) ? 'wrong' : 'idle';
                        return (
                          <button
                            key={btnIdx}
                            onClick={() => { setSelectedOptions(p => ({...p, [absoluteIdx]: btnIdx})); setRevealed(p => ({...p, [absoluteIdx]: true})); }}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all border-2 shadow-sm ${
                              state === 'correct' ? 'bg-emerald-500 border-emerald-600 text-white scale-105' :
                              state === 'wrong' ? 'bg-red-500 border-red-600 text-white scale-105' :
                              (btnIdx === 0 ? 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10' : 'border-red-500 text-red-500 hover:bg-red-500/10')
                            } ${theme === 'frost' && state === 'idle' ? 'bg-white' : ''}`}
                          >
                            {btnIdx === 0 ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button onClick={() => setShowAnswers(p => ({...p, [absoluteIdx]: !p[absoluteIdx]}))} className={`p-3 rounded-xl transition-all ${showAnswers[absoluteIdx] ? 'bg-indigo-600 text-white shadow-lg' : (theme === 'frost' ? 'bg-slate-100 text-slate-400 hover:text-slate-600' : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white')}`}>
                  {showAnswers[absoluteIdx] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {questionType === 'MCQ' && (
                <div className="flex flex-wrap gap-3 mt-8">
                  {options.map((opt, optIdx) => {
                    const isCorrect = optIdx === correctIdx;
                    const isSelected = optIdx === selIdx;
                    const state = (isRevealed && isCorrect) ? 'correct' : (revealed[absoluteIdx] && isSelected && !isCorrect) ? 'wrong' : 'idle';
                    return (
                      <button
                        key={optIdx}
                        onClick={() => { setSelectedOptions(p => ({...p, [absoluteIdx]: optIdx})); setRevealed(p => ({...p, [absoluteIdx]: true})); }}
                        className={`flex-1 min-w-[200px] p-4 rounded-2xl border-2 text-right font-bold text-base flex items-center gap-3 transition-all ${state === 'correct' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : state === 'wrong' ? 'bg-red-500/20 border-red-500 text-red-400' : (theme === 'frost' ? 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400' : 'bg-white/5 border-white/5 text-white/70 hover:border-white/20')}`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-black border ${state === 'correct' ? 'bg-emerald-500 text-white border-emerald-600' : state === 'wrong' ? 'bg-red-500 text-white border-red-600' : 'bg-white/10 border-white/10'}`}>{String.fromCharCode(65 + optIdx)}</span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {isRevealed && (questionType === 'Completion' || q.explanation) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-sm">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400 font-black"><Sparkles size={16} /><span>{questionType === 'Completion' ? 'الإجابة الصحيحة:' : 'توضيح الإجابة:'}</span></div>
                  <p className={`leading-relaxed font-black text-xl ${theme === 'frost' ? 'text-indigo-900' : 'text-white'}`}>{q.correctAnswer}</p>
                  {q.explanation && <p className={`mt-2 leading-relaxed font-medium ${theme === 'frost' ? 'text-slate-600' : 'text-white/60'}`}>{q.explanation}</p>}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-1000 flex flex-col font-['Cairo'] overflow-hidden relative`} dir="rtl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[150px] bg-gradient-to-br ${activeTheme.accent}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-10 blur-[120px] bg-gradient-to-tl ${activeTheme.accent}`} />
      </div>

      <header className="fixed top-6 left-6 right-6 z-[100] no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-3 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-4 px-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-500" />
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20">
                <img src="/teacher.png" alt="Amer Timraz" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-black text-white leading-tight">{quiz.title}</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-white/50 font-bold tracking-wider">مباشر • أ. عامر تمراز</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-black/20 p-1 rounded-xl mr-2 border border-white/5">
              {(Object.keys(THEMES) as ThemeType[]).map(t => (
                <button key={t} onClick={() => setTheme(t)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${theme === t ? 'bg-white/20 scale-110 shadow-lg' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`} title={t}><Palette size={14} className={theme === t ? 'text-white' : 'text-white/40'} /></button>
              ))}
            </div>
            <button onClick={toggleFullscreen} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/5">{isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
            <button onClick={isRecording ? stopRecording : startRecording} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all ${isRecording ? 'bg-red-500 text-white' : (theme === 'frost' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white hover:bg-white/20')}`}><div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white animate-ping' : (theme === 'frost' ? 'bg-white' : 'bg-red-500')}`} /><span className="hidden md:inline">{isRecording ? 'إيقاف' : 'تسجيل'}</span></button>
            <div className="h-6 w-px bg-white/10 mx-1" />
            <button onClick={() => window.print()} className={`p-2.5 rounded-xl transition-all ${theme === 'frost' ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}><Download size={18} /></button>
            <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"><X size={18} /></button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pt-28 pb-12 px-6 scrollbar-hide no-print">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header Card */}
          <div className={`${activeTheme.card} p-10 rounded-[3rem] border flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${activeTheme.accent} opacity-10 blur-[100px]`} />
            <div className="relative text-center md:text-right flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                <span className={`px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] ${activeTheme.bg} ${activeTheme.text} border ${activeTheme.border} shadow-lg`}>
                  Premium Revision 2026
                </span>
              </div>
              <h2 className={`text-4xl md:text-6xl font-black mb-4 ${activeTheme.text} leading-tight`}>{quiz.title}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${activeTheme.bg} border ${activeTheme.border}`}>
                  <BookOpen size={18} className={theme === 'frost' ? 'text-indigo-600' : 'text-indigo-400'} />
                  <span className={`text-sm font-bold ${activeTheme.text}`}>{quiz.subject}</span>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${activeTheme.bg} border ${activeTheme.border}`}>
                  <Layers size={18} className={theme === 'frost' ? 'text-indigo-600' : 'text-indigo-400'} />
                  <span className={`text-sm font-bold ${activeTheme.text}`}>{quiz.grade}</span>
                </div>
              </div>
              
              <div className="mt-8 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 inline-block">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-amber-400" size={20} />
                  <p className={`text-lg font-black ${theme === 'frost' ? 'text-indigo-900' : 'text-white'}`}>
                    هذه هي الأسئلة الأكثر تكراراً في امتحانات المحافظات
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-2 mb-2"><Trophy size={24} className="text-amber-400" /><span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Teacher Info</span></div>
              <h3 className="text-white font-black text-2xl">مستر عامر تمراز</h3>
              <div className="flex gap-6 mt-2">
                <div className="flex flex-col items-center"><span className="text-3xl font-black text-white">{quiz.questions.length}</span><span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">سؤالاً</span></div>
                <div className="w-px h-10 bg-white/10" /><div className="flex flex-col items-center"><span className="text-3xl font-black text-white">45</span><span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">دقيقة</span></div>
              </div>
            </div>
          </div>

          {/* 0. Golden Questions Section */}
          {goldenQuestions.length > 0 && (
            <section className="space-y-6 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 to-transparent blur-3xl -z-10" />
              <div className="flex items-center gap-4 mb-8">
                 <div className={`h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/30`} />
                 <h3 className={`text-2xl font-black px-6 py-2 rounded-2xl border-2 ${activeTheme.card} ${activeTheme.text} border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center gap-3 animate-pulse`}>
                    <Sparkles className="text-amber-400" size={24} />
                    الأسئلة الأكثر تكراراً (الأسئلة الذهبية)
                 </h3>
                 <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/30`} />
              </div>
              <div className="grid gap-6">
                {renderQuestionList(goldenQuestions, 0)}
              </div>
            </section>
          )}

          {/* 1. True/False Section */}
          {tfQuestions.length > 0 && (
            <section className="space-y-6 mt-16">
              <div className="flex items-center gap-4 mb-8">
                 <div className={`h-px flex-1 bg-gradient-to-l from-transparent to-${theme === 'frost' ? 'indigo-200' : 'indigo-500/30'}`} />
                 <h3 className={`text-2xl font-black px-6 py-2 rounded-2xl border-2 ${activeTheme.card} ${activeTheme.text} ${activeTheme.border} shadow-xl flex items-center gap-3`}>
                    <CheckCircle2 className="text-emerald-500" size={24} />
                    أولاً: أسئلة الصواب والخطأ (True / False)
                 </h3>
                 <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-${theme === 'frost' ? 'indigo-200' : 'indigo-500/30'}`} />
              </div>
              <div className="grid gap-6">
                {renderQuestionList(tfQuestions, goldenQuestions.length)}
              </div>
            </section>
          )}

          {/* 2. MCQ Section */}
          {mcqQuestions.length > 0 && (
            <section className="space-y-6 mt-16">
              <div className="flex items-center gap-4 mb-8">
                 <div className={`h-px flex-1 bg-gradient-to-l from-transparent to-${theme === 'frost' ? 'indigo-200' : 'indigo-500/30'}`} />
                 <h3 className={`text-2xl font-black px-6 py-2 rounded-2xl border-2 ${activeTheme.card} ${activeTheme.text} ${activeTheme.border} shadow-xl flex items-center gap-3`}>
                    <Layers className="text-blue-500" size={24} />
                    ثانياً: أسئلة الاختيار من متعدد (MCQ)
                 </h3>
                 <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-${theme === 'frost' ? 'indigo-200' : 'indigo-500/30'}`} />
              </div>
              <div className="grid gap-6">
                {renderQuestionList(mcqQuestions, goldenQuestions.length + tfQuestions.length)}
              </div>
            </section>
          )}

          {/* 3. Code Questions Section */}
          {codeQuestions.length > 0 && (
            <section className="space-y-6 mt-16">
              <div className="flex items-center gap-4 mb-8">
                 <div className={`h-px flex-1 bg-gradient-to-l from-transparent to-${theme === 'frost' ? 'indigo-200' : 'indigo-500/30'}`} />
                 <h3 className={`text-2xl font-black px-6 py-2 rounded-2xl border-2 ${activeTheme.card} ${activeTheme.text} ${activeTheme.border} shadow-xl flex items-center gap-3`}>
                    <Code className="text-purple-500" size={24} />
                    ثالثاً: أسئلة قراءة الأكواد وفهمها
                 </h3>
                 <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-${theme === 'frost' ? 'indigo-200' : 'indigo-500/30'}`} />
              </div>
              <div className="grid gap-6">
                {renderQuestionList(codeQuestions, goldenQuestions.length + tfQuestions.length + mcqQuestions.length)}
              </div>
            </section>
          )}

          {/* 4. Completion Section */}
          {completionQuestions.length > 0 && (
            <section className="space-y-6 mt-16">
              <div className="flex items-center gap-4 mb-8">
                 <div className={`h-px flex-1 bg-gradient-to-l from-transparent to-${theme === 'frost' ? 'indigo-200' : 'indigo-500/30'}`} />
                 <h3 className={`text-2xl font-black px-6 py-2 rounded-2xl border-2 ${activeTheme.card} ${activeTheme.text} ${activeTheme.border} shadow-xl flex items-center gap-3`}>
                    <Sparkles className="text-amber-500" size={24} />
                    رابعاً: أسئلة الإكمال التفاعلية
                 </h3>
                 <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-${theme === 'frost' ? 'indigo-200' : 'indigo-500/30'}`} />
              </div>
              <div className="grid gap-6">
                {renderQuestionList(completionQuestions, goldenQuestions.length + tfQuestions.length + mcqQuestions.length + codeQuestions.length)}
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="p-8 text-center relative z-10 no-print">
        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'frost' ? 'text-slate-400' : 'text-white/20'}`}>Created with ❤️ for Mr. Amer Timraz Platform • 2026</p>
      </footer>
    </div>
  );
}
