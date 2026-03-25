import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, HelpCircle, Search, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Snippet {
  id: number;
  code: string;
  analysis?: {
    type: 'syntax' | 'logic' | 'correct';
    message: string;
    position: 'top' | 'bottom' | 'inline';
  };
}

const PUZZLE_DATA = {
  title: "اللغز الأول: العمليات الحسابية والمتغيرات",
  targetOutput: "50",
  question: "حدد البرنامج الذي يقوم بإخراج ما يلي:",
  snippets: [
    { 
      id: 1, 
      code: "let 5;\nlet 10;\n\nnum1 = num2 * num1;\nconsole.log(num1);",
      analysis: { type: 'syntax', message: "خطأ قواعدي (Syntax):\nلا يمكن تسمية المتغيرات بأرقام فقط. يجب أن يبدأ اسم المتغير بحرف.", position: 'inline' }
    },
    { 
      id: 2, 
      code: "let 5;\nlet 10;\n\nnum1 = num2 / num1;\nconsole.log(num1);",
      analysis: { type: 'syntax', message: "خطأ قواعدي (Syntax):\nبدأ اسم المتغير برقم وهذا غير مسموح.", position: 'inline' }
    },
    { 
      id: 3, 
      code: "let num1 = 5;\nlet num2 = 10;\n\nnum1 = num2 / num1;\nconsole.log(num1);",
      analysis: { type: 'logic', message: "خطأ حسابي (Logic):\nالعملية هنا قسمة 10/5 = 2.\nالنتيجة لا تساوي الهدف (50).", position: 'inline' }
    },
    { 
      id: 4, 
      code: "let num1 = 5;\nlet num2 = 10;\n\nnum1 = num2 * num1;\nconsole.log(num1);",
      analysis: { type: 'correct', message: "الإجابة الصحيحة ✅\nالمتغيرات مسماة بشكل صحيح، والعملية الحسابية دقيقة: 10 * 5 = 50.", position: 'inline' }
    }
  ] as Snippet[]
};

export default function CodingPuzzle() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-[#0e3a5a] text-white p-4 flex items-center justify-between shadow-lg z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition text-sm flex items-center gap-2">
            رجوع
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-white/10 px-3 py-1 rounded-md">السؤال 1 / 20</span>
            <div className="flex items-center gap-1.5 text-yellow-400">
              <Clock size={16} />
              <span className="font-mono">متبقي {formatTime(timeLeft)} دقيقة</span>
            </div>
          </div>
        </div>
        <button className="bg-white text-[#0e3a5a] px-6 py-1.5 rounded-full font-bold hover:bg-gray-200 transition">
          التالي
        </button>
      </header>

      {/* Main Content Area with Notebook Grid */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Notebook Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        
        {/* Left Side: Snippets */}
        <div className="w-1/2 p-8 overflow-y-auto space-y-4 relative z-10 border-l border-gray-300">
          {PUZZLE_DATA.snippets.map((snippet) => (
            <div key={snippet.id} className="relative group">
              <div 
                onClick={() => !isRevealed && setSelectedId(snippet.id)}
                className={`
                  relative bg-white border-2 rounded-xl p-6 cursor-pointer transition-all duration-300
                  ${selectedId === snippet.id ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-lg' : 'border-gray-200 hover:border-blue-300'}
                  ${isRevealed && snippet.analysis?.type === 'correct' ? 'border-green-500 ring-4 ring-green-500/10' : ''}
                  ${isRevealed && selectedId === snippet.id && snippet.analysis?.type !== 'correct' ? 'border-red-500 ring-4 ring-red-500/10' : ''}
                `}
              >
                <div className="absolute top-4 left-4 flex flex-col items-center gap-2">
                   <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm
                      ${selectedId === snippet.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-500'}
                      ${isRevealed && snippet.analysis?.type === 'correct' ? 'bg-green-600 border-green-600 text-white' : ''}
                   `}>
                     {snippet.id}
                   </div>
                   <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${selectedId === snippet.id ? 'border-blue-600 bg-blue-600 p-0.5' : 'border-gray-300'}
                   `}>
                     {selectedId === snippet.id && <div className="w-full h-full bg-white rounded-full" />}
                   </div>
                   <Search size={16} className="text-gray-300 group-hover:text-blue-400" />
                </div>

                <pre className="font-mono text-gray-800 text-lg leading-relaxed whitespace-pre-wrap mt-2 pr-12">
                   {snippet.code.split('\n').map((line, i) => (
                     <div key={i} className="relative group/line">
                        {isRevealed && snippet.analysis?.type === 'syntax' && (i === 0 || i === 1) && (
                          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500/50 decoration-wavy underline" />
                        )}
                        {line}
                     </div>
                   ))}
                </pre>

                {/* Analysis Callouts (Speech Bubbles) */}
                <AnimatePresence>
                  {isRevealed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`
                        absolute -top-10 -left-6 z-30 p-4 rounded-2xl shadow-xl max-w-[250px] text-sm font-medium
                        after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent
                        ${snippet.analysis?.type === 'correct' ? 'bg-emerald-600 text-white after:border-t-emerald-600' : ''}
                        ${snippet.analysis?.type === 'syntax' ? 'bg-rose-600 text-white after:border-t-rose-600' : ''}
                        ${snippet.analysis?.type === 'logic' ? 'bg-amber-500 text-gray-900 after:border-t-amber-500' : ''}
                      `}
                    >
                      {snippet.analysis?.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Question & Target Output */}
        <div className="w-1/2 p-12 bg-gray-50/50 relative z-10">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-8 max-w-xl mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-bold">السؤال 1</span>
              <span className={`px-4 py-1 rounded-full text-sm font-medium border ${selectedId ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {selectedId ? 'تم الاختيار' : 'غير مجاب'}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-800 mb-4">{PUZZLE_DATA.title}</h2>
              <p className="text-gray-600 leading-relaxed font-bold">{PUZZLE_DATA.question}</p>
            </div>

            <div className="relative group">
               <div className="absolute inset-y-0 left-4 flex items-center">
                  <Search size={24} className="text-gray-200" />
               </div>
               <div className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 text-center text-4xl font-black text-gray-800 shadow-inner">
                 {PUZZLE_DATA.targetOutput}
               </div>
            </div>

            <div className="pt-8">
              <button 
                onClick={() => setIsRevealed(true)}
                disabled={!selectedId || isRevealed}
                className={`
                  w-full py-4 rounded-xl font-black text-xl transition shadow-lg flex items-center justify-center gap-3
                  ${!selectedId || isRevealed ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0e3a5a] text-white hover:bg-[#1a557e] active:scale-95'}
                `}
              >
                <HelpCircle size={24} />
                عرض شرح الكود
              </button>
            </div>
          </div>

          {/* Correct Answer Celebration */}
          <AnimatePresence>
            {isRevealed && selectedId === 4 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 p-6 bg-green-500/10 border-2 border-green-500/20 rounded-3xl text-center"
              >
                <Trophy className="mx-auto text-yellow-500 mb-2" size={48} />
                <h3 className="text-2xl font-black text-green-700">أحسنت! إجابة دقيقة</h3>
                <p className="text-green-600 font-bold mt-1">لقد نجحت في حل اللغز الأول باحترافية.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
