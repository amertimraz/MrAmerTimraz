import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, ChevronLeft, ChevronRight, PlayCircle, ListChecks, Flag, AlertCircle } from 'lucide-react';

interface TofasQuestion {
  id: number;
  questionText: string;
  codeSnippet: string;
  explanation?: string;
  options: { id: number; text: string }[];
  correctOptionId: number;
}

const MOCK_QUESTIONS: TofasQuestion[] = [
  {
    id: 1,
    questionText: 'حدد البرنامج الذي يقوم بإخراج القائمة المغيرة:',
    codeSnippet: `let menu = "أرز بالكاري";\n\nconsole.log("هذه هي القائمة الحالية.", menu);\nmenu = "طبق النودلز";\nconsole.log(menu);\nconsole.log("القائمة سوف تتغير.", menu);\nconsole.log(menu);`,
    explanation: 'يتم تغيير قيمة المتغير menu مرتين. القيمة الأخيرة هي "طبق النودلز" وتُطبع مرتين.',
    options: [
      { id: 1, text: 'هذه هي القائمة الحالية.\nأرز بالكاري\nالقائمة سوف تتغير.\nطبق النودلز' },
      { id: 2, text: 'هذه هي القائمة الحالية.\nأرز بالكاري\nطبق النودلز\nالقائمة سوف تتغير.\nأرز بالكاري' },
      { id: 3, text: 'هذه هي القائمة الحالية.\nأرز بالكاري\nطبق النودلز\nالقائمة سوف تتغير.\nطبق النودلز' },
      { id: 4, text: 'هذه هي القائمة الحالية.\nطبق النودلز\nأرز بالكاري\nالقائمة سوف تتغير.\nطبق النودلز' },
    ],
    correctOptionId: 3,
  },
  {
    id: 2,
    questionText: 'ما هو الناتج النهائي المتغير x؟',
    codeSnippet: `let x = 10;\nx = x + 5;\nx = x * 2;\nconsole.log(x);`,
    options: [
      { id: 1, text: '15' },
      { id: 2, text: '20' },
      { id: 3, text: '30' },
      { id: 4, text: '25' },
    ],
    correctOptionId: 3,
  },
  {
    id: 3,
    questionText: 'أي من الخيارات التالية يُعتبر Boolean في JavaScript؟',
    codeSnippet: `let a = true;\nlet b = "true";\nlet c = 1;\nlet d = undefined;`,
    options: [
      { id: 1, text: 'b فقط' },
      { id: 2, text: 'a فقط' },
      { id: 3, text: 'a و c' },
      { id: 4, text: 'جميع ما سبق' },
    ],
    correctOptionId: 2,
  },
];

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function TofasExamPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExp, setShowExp] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(35 * 60 + 29);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  const q = MOCK_QUESTIONS[current];
  const codeLines = q.codeSnippet.split('\n').map((l, i) => ({ n: i + 1, t: l }));
  const letters = ['أ', 'ب', 'ج', 'د'];
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    if (submitted) return;
    const iv = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) { setSubmitted(true); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [submitted]);

  if (submitted) {
    let correct = 0;
    for (const qu of MOCK_QUESTIONS) if (answers[qu.id] === qu.correctOptionId) correct++;
    const pct = Math.round((correct / MOCK_QUESTIONS.length) * 100);
    return (
      <div className="min-h-screen bg-[#0f172a] text-white" dir="rtl">
        <header className="h-14 bg-[#0d9488] flex items-center justify-between px-6 shadow-md">
          <h1 className="font-bold text-lg">نتيجة الاختبار</h1>
          <button onClick={() => navigate('/')} className="text-sm hover:underline">الرئيسية</button>
        </header>
        <main className="max-w-3xl mx-auto p-6 space-y-6">
          <div className="bg-[#1e293b] rounded-2xl p-8 text-center space-y-4 shadow-xl border border-[#334155]">
            <div className="text-5xl mb-2">{pct >= 70 ? '🎉' : '📚'}</div>
            <h2 className="text-2xl font-bold">{pct >= 70 ? 'مبروك! نجحت' : 'لم تنجح هذه المرة'}</h2>
            <p className="text-slate-300 text-lg">{correct} / {MOCK_QUESTIONS.length} ({pct}%)</p>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-lg">مراجعة الإجابات</h3>
            {MOCK_QUESTIONS.map((qu, idx) => {
              const ok = answers[qu.id] === qu.correctOptionId;
              const sel = qu.options.find(o => o.id === answers[qu.id]);
              const cor = qu.options.find(o => o.id === qu.correctOptionId);
              return (
                <div key={qu.id} className={`rounded-xl border p-4 ${ok ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-rose-500/50 bg-rose-900/10'}`}>
                  <p className="font-semibold mb-2">{idx + 1}. {qu.questionText}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-[#0f172a] border border-[#334155] px-3 py-2">
                      <span className="text-slate-400 block text-xs mb-1">إجابتك</span>
                      <span className={ok ? 'text-emerald-400' : 'text-rose-400'}>{sel?.text ?? 'بدون إجابة'}</span>
                    </div>
                    <div className="rounded-lg bg-[#0f172a] border border-[#334155] px-3 py-2">
                      <span className="text-slate-400 block text-xs mb-1">الصحيحة</span>
                      <span className="text-emerald-400">{cor?.text}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col" dir="rtl">
      <header className="h-14 bg-[#0d9488] text-white flex items-center justify-between px-4 shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm flex items-center gap-1"><ListChecks size={18} /> قائمة الأسئلة</span>
          <span className="hidden sm:inline text-xs opacity-80">تصميم مستر عصام فؤاد</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"><Timer size={16} />{formatTime(timeLeft)}</span>
          <span className="bg-white/10 px-3 py-1 rounded-full">{current + 1} / {MOCK_QUESTIONS.length}</span>
          <span className="bg-white/10 px-3 py-1 rounded-full hidden sm:inline">مجاب عليها: {answeredCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="flex items-center gap-1 bg-white/10 hover:bg-white/20 disabled:opacity-40 px-3 py-1.5 rounded-lg text-sm transition">
            <ChevronRight size={16} /> التالي
          </button>
          <button disabled={current === MOCK_QUESTIONS.length - 1} onClick={() => setCurrent(c => c + 1)} className="flex items-center gap-1 bg-white/10 hover:bg-white/20 disabled:opacity-40 px-3 py-1.5 rounded-lg text-sm transition">
            السابق <ChevronLeft size={16} />
          </button>
          <button onClick={() => { if (answeredCount < MOCK_QUESTIONS.length && !window.confirm('لم تجب على جميع الأسئلة. هل تريد الإنهاء؟')) return; setSubmitted(true); }} className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-sm font-bold transition shadow">
            إنهاء الامتحان
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <section className="flex-1 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 overflow-auto">
          <div className="max-w-2xl mx-auto p-5 space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0d9488] bg-[#0d9488]/10 px-2 py-1 rounded">السؤال {current + 1}</span>
                <button onClick={() => setFlagged(prev => { const n = new Set(prev); n.has(q.id) ? n.delete(q.id) : n.add(q.id); return n; })} className={`p-1.5 rounded-lg transition ${flagged.has(q.id) ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}>
                  <Flag size={18} fill={flagged.has(q.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <p className="font-bold text-lg leading-relaxed">{q.questionText}</p>
            </div>

            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                const isSel = answers[q.id] === opt.id;
                return (
                  <button key={opt.id} onClick={() => setAnswers(p => ({ ...p, [q.id]: opt.id }))} className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-right transition-all ${isSel ? 'border-[#0d9488] bg-[#0d9488]/5 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                    <span className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${isSel ? 'bg-[#0d9488] text-white' : 'bg-slate-100 text-slate-600'}`}>{letters[idx]}</span>
                    <span className="flex-1 text-sm font-medium leading-relaxed whitespace-pre-wrap text-start">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {MOCK_QUESTIONS.map((qu, i) => {
                const st = answers[qu.id] !== undefined ? 'answered' : flagged.has(qu.id) ? 'flagged' : 'unanswered';
                return (
                  <button key={qu.id} onClick={() => setCurrent(i)} className={`w-10 h-10 rounded-lg text-sm font-bold transition border ${current === i ? 'ring-2 ring-[#0d9488] ring-offset-1' : ''} ${st === 'answered' ? 'bg-[#0d9488] text-white border-[#0d9488]' : st === 'flagged' ? 'bg-amber-50 text-amber-600 border-amber-300' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="flex-1 bg-[#0b1020] text-[#c9d4f1] overflow-auto p-4 font-mono text-sm leading-6" dir="ltr">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#64748b] flex items-center gap-1"><PlayCircle size={14} /> JavaScript</span>
            <button onClick={() => setShowExp(v => !v)} className="text-xs bg-[#1e293b] hover:bg-[#334155] text-white px-3 py-1.5 rounded-lg transition">{showExp ? 'Hide Explanation' : 'Show Code Explanation'}</button>
          </div>
          {showExp && q.explanation && (
            <div className="mb-4 bg-[#1e293b]/80 border border-[#334155] rounded-lg p-3 text-xs text-slate-300 leading-relaxed">
              <AlertCircle size={14} className="inline ml-1 text-amber-400" />{q.explanation}
            </div>
          )}
          <div className="space-y-0">
            {codeLines.map(ln => (
              <div key={ln.n} className="flex items-start hover:bg-[#1e293b]/30">
                <span className="text-[#475569] select-none w-10 text-right pr-3 text-xs shrink-0">{ln.n}</span>
                <pre className="flex-1 whitespace-pre-wrap break-all text-xs sm:text-sm">{ln.t || ' '}</pre>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
