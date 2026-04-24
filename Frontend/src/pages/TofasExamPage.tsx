import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, ChevronLeft, ChevronRight, PlayCircle, ListChecks, Flag, AlertCircle } from 'lucide-react';

interface TofasOption {
  id: number;
  text: string;
  isCode?: boolean;
}

interface TofasQuestion {
  id: number;
  questionText: string;
  codeSnippet: string;
  explanation?: string;
  options: TofasOption[];
  correctOptionId: number;
}

const MOCK_QUESTIONS: TofasQuestion[] = [
  {
    id: 1,
    questionText: 'حدد البرنامج الذي يقوم بإخراج القائمة المغيرة:',
    codeSnippet: `let menu = "أرز بالكاري";\n\nconsole.log("هذه هي القائمة الحالية.", menu);\nmenu = "طبق النودلز";\nconsole.log(menu);\nconsole.log("القائمة سوف تتغير.", menu);\nconsole.log(menu);`,
    explanation: 'يتم تغيير قيمة المتغير menu مرتين. القيمة الأخيرة هي "طبق النودلز" وتُطبع مرتين.',
    options: [
      { id: 1, text: 'هذه هي القائمة الحالية.\nأرز بالكاري\nالقائمة سوف تتغير.\nطبق النودلز', isCode: true },
      { id: 2, text: 'هذه هي القائمة الحالية.\nأرز بالكاري\nطبق النودلز\nالقائمة سوف تتغير.\nأرز بالكاري', isCode: true },
      { id: 3, text: 'هذه هي القائمة الحالية.\nأرز بالكاري\nطبق النودلز\nالقائمة سوف تتغير.\nطبق النودلز', isCode: true },
      { id: 4, text: 'هذه هي القائمة الحالية.\nطبق النودلز\nأرز بالكاري\nالقائمة سوف تتغير.\nطبق النودلز', isCode: true },
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
  {
    id: 4,
    questionText: 'حدد النتيجة التي سيتم إخراجها عند تنفيذ هذا البرنامج:',
    codeSnippet: `let weekday = "السبت";\nlet periodOfDay = "الصباح";\nlet currentTime = 6;\n\nif (weekday != "الأربعاء") {\n    console.log("اليوم ليس يوم تخفيضات");\n} else {\n    console.log("اليوم هو يوم التخفيضات");\n}\n\nif ((periodOfDay == "الصباح") && (currentTime >= 8)) {\n    console.log("المحل مفتوح الآن");\n} else {\n    console.log("نحن نستعد الآن");\n}`,
    options: [
      { id: 1, text: 'اليوم ليس يوم تخفيضات\nالمحل مفتوح الآن', isCode: true },
      { id: 2, text: 'اليوم ليس يوم تخفيضات\nنحن نستعد الآن', isCode: true },
      { id: 3, text: 'اليوم هو يوم التخفيضات\nالمحل مفتوح الآن', isCode: true },
      { id: 4, text: 'اليوم هو يوم التخفيضات\nنحن نستعد الآن', isCode: true },
    ],
    correctOptionId: 2,
  },
  {
    id: 5,
    questionText: 'في المصفوفات التي تحتوي عناصر مكتوبة بالعربية، يكون ترتيب العناصر من اليمين إلى اليسار، لذلك أول عنصر في المصفوفة يكون في أقصى اليمين.',
    codeSnippet: `مدخل المقعد أ: البوابة الأولى\nمدخل المقعد ب: البوابة الأولى\nمدخل المقعد س: البوابة الثانية`,
    options: [
      { id: 1, text: `let seatTypeList = ["أ", "ب", "س"];\nlet gateName;\n\nfor (let i = 0; i < seatTypeList.length; i++) {\n    if (seatTypeList[i] == "أ") {\n        gateName = "البوابة الأولى";\n    } else {\n        gateName = "البوابة الثانية";\n    }\n}\nconsole.log(seatTypeList[i] + " : " + gateName);`, isCode: true },
      { id: 2, text: `let seatTypeList = ["أ", "ب", "س"];\nlet gateName;\n\nfor (let i = 0; i < seatTypeList.length; i++) {\n    if ((seatTypeList[i] == "أ") || (seatTypeList[i] == "ب")) {\n        gateName = "البوابة الأولى";\n    } else {\n        gateName = "البوابة الثانية";\n    }\n}\nconsole.log(seatTypeList[i] + " : " + gateName);`, isCode: true },
      { id: 3, text: `let seatTypeList = ["أ", "ب", "س"];\nlet gateName;\n\nfor (let i = 0; i < seatTypeList.length; i++) {\n    if ((seatTypeList[i] == "أ") && (seatTypeList[i] == "ب")) {\n        gateName = "البوابة الأولى";\n    } else {\n        gateName = "البوابة الثانية";\n    }\n}\nconsole.log(seatTypeList[i] + " : " + gateName);`, isCode: true },
      { id: 4, text: `let seatTypeList = ["أ", "ب", "س"];\nlet gateName;\n\nfor (let i = 0; i < seatTypeList.length; i++) {\n    if ((seatTypeList[i] != "أ") || (seatTypeList[i] != "ب")) {\n        gateName = "البوابة الأولى";\n    } else {\n        gateName = "البوابة الثانية";\n    }\n}\nconsole.log(seatTypeList[i] + " : " + gateName);`, isCode: true },
    ],
    correctOptionId: 2,
  },
  {
    id: 6,
    questionText: 'حدد البرنامج الذي يقوم بإخراج القائمة التالية:',
    codeSnippet: `يخنة لحم البقر من الأطباق الفرنسية\nيخنة الخضار واللحم من الأطباق الفرنسية`,
    options: [
      { id: 1, text: `let cuisines = ["يخنة لحم البقر", "السمك", "يخنة الخضار واللحم"];\nfor (let i = 0; i < cuisines.length; i++) {\n    if (cuisines[i] == "المسا") {\n        console.log(cuisines[i] + " من الأطباق الفرنسية");\n    }\n}`, isCode: true },
      { id: 2, text: `let cuisines = ["يخنة لحم البقر", "السمك", "يخنة الخضار واللحم"];\nfor (let i = 0; i < cuisines.length; i++) {\n    if (cuisines[i] != "السمك") {\n        console.log(cuisines[i] + " من الأطباق الفرنسية");\n    }\n}`, isCode: true },
      { id: 3, text: `let cuisines = ["يخنة لحم البقر", "السمك", "يخنة الخضار واللحم"];\nfor (let i = 0; i < cuisines.length; i++) {\n    if (cuisines[i] != "المسا") {\n        console.log(cuisines[i] + " من الأطباق الفرنسية");\n    }\n}`, isCode: true },
      { id: 4, text: `let cuisines = ["يخنة لحم البقر", "السمك", "يخنة الخضار واللحم"];\nfor (let i = 0; i < cuisines.length; i++) {\n    if (cuisines[i] == "السمك") {\n        console.log(cuisines[i] + " من الأطباق الفرنسية");\n    }\n}`, isCode: true },
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
  const [timeLeft, setTimeLeft] = useState(40 * 60);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [showMenu, setShowMenu] = useState(false);

  const q = MOCK_QUESTIONS[current];
  const codeLines = q.codeSnippet.split('\n').map((l, i) => ({ n: i + 1, t: l }));
  const letters = ['1', '2', '3', '4'];
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
      <header className="h-14 bg-[#0d9488] text-white flex items-center justify-between px-4 shadow-md shrink-0 relative">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowMenu(true)} className="font-bold text-sm flex items-center gap-1 hover:bg-white/10 px-3 py-1.5 rounded-lg transition">
            <ListChecks size={18} /> قائمة الأسئلة
          </button>
          <span className="hidden sm:inline text-xs opacity-80">تصميم عامر تمراز</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"><Timer size={16} />{formatTime(timeLeft)}</span>
          <span className="bg-white/10 px-3 py-1 rounded-full">{current + 1} / {MOCK_QUESTIONS.length}</span>
          <span className="bg-white/10 px-3 py-1 rounded-full hidden sm:inline">مجاب عليها: {answeredCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <button disabled={current === MOCK_QUESTIONS.length - 1} onClick={() => setCurrent(c => c + 1)} className="flex items-center gap-1 bg-white/10 hover:bg-white/20 disabled:opacity-40 px-3 py-1.5 rounded-lg text-sm transition font-bold">
            السابق <ChevronRight size={16} />
          </button>
          <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="flex items-center gap-1 bg-white/10 hover:bg-white/20 disabled:opacity-40 px-3 py-1.5 rounded-lg text-sm transition font-bold">
            <ChevronLeft size={16} /> التالي
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-auto">
        {/* Blue Question Header */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-lg">السؤال {current + 1}</span>
            <button onClick={() => setFlagged(prev => { const n = new Set(prev); n.has(q.id) ? n.delete(q.id) : n.add(q.id); return n; })} className={`p-2 rounded-lg transition ${flagged.has(q.id) ? 'text-amber-300 bg-white/20' : 'text-white/60 hover:text-amber-300 hover:bg-white/10'}`}>
              <Flag size={20} fill={flagged.has(q.id) ? 'currentColor' : 'none'} />
            </button>
          </div>
          <p className="font-bold text-lg leading-relaxed whitespace-pre-wrap">{q.questionText}</p>
        </div>

        {/* Light Code Panel */}
        <section className="bg-white border-b border-slate-200 p-4" dir="ltr">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 flex items-center gap-1"><PlayCircle size={14} /> JavaScript</span>
            <button onClick={() => setShowExp(v => !v)} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition">{showExp ? 'إخفاء الشرح' : 'عرض الشرح'}</button>
          </div>
          {showExp && q.explanation && (
            <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-slate-700 leading-relaxed">
              <AlertCircle size={14} className="inline ml-1 text-amber-500" />{q.explanation}
            </div>
          )}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 font-mono text-sm leading-7">
            {codeLines.map(ln => (
              <div key={ln.n} className="flex items-start">
                <span className="text-slate-400 select-none w-8 text-right pr-2 text-xs shrink-0">{ln.n}</span>
                <pre className="flex-1 whitespace-pre-wrap break-all text-slate-800">{ln.t || ' '}</pre>
              </div>
            ))}
          </div>
        </section>

        {/* Options in 2x2 Grid */}
        <section className="flex-1 bg-slate-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, idx) => {
              const isSel = answers[q.id] === opt.id;
              return (
                <button key={opt.id} onClick={() => setAnswers(p => ({ ...p, [q.id]: opt.id }))} className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-right transition-all min-h-[120px] ${isSel ? 'border-blue-500 bg-white shadow-md' : 'border-white hover:border-blue-300 bg-white hover:shadow-sm'}`}>
                  <span className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isSel ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{letters[idx]}</span>
                  {opt.isCode ? (
                    <pre className={`flex-1 w-full text-xs font-mono leading-relaxed whitespace-pre-wrap text-start rounded-lg p-2 border mt-8 ${isSel ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'}`} dir="auto">{opt.text}</pre>
                  ) : (
                    <span className="flex-1 w-full text-sm font-medium leading-relaxed whitespace-pre-wrap text-start mt-8">{opt.text}</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between shrink-0">
          <button disabled={current === MOCK_QUESTIONS.length - 1} onClick={() => setCurrent(c => c + 1)} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-4 py-2 rounded-lg text-sm transition font-bold">
            السابق <ChevronRight size={18} />
          </button>
          <button onClick={() => { if (answeredCount < MOCK_QUESTIONS.length && !window.confirm('لم تجب على جميع الأسئلة. هل تريد الإنهاء؟')) return; setSubmitted(true); }} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold transition shadow">
            عرض النتائج
          </button>
          <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="flex items-center gap-1 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 text-slate-700 px-4 py-2 rounded-lg text-sm transition font-bold">
            <ChevronLeft size={18} /> التالي
          </button>
        </div>

        {/* Question List Dropdown */}
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute top-14 right-4 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-72" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-base text-[#0d9488]">قائمة الأسئلة</h2>
                <button onClick={() => setShowMenu(false)} className="text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded hover:bg-slate-100 transition text-sm">X</button>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {MOCK_QUESTIONS.map((qu, i) => {
                  const st = answers[qu.id] !== undefined ? 'answered' : flagged.has(qu.id) ? 'flagged' : 'unanswered';
                  return (
                    <button key={qu.id} onClick={() => { setCurrent(i); setShowMenu(false); }} className={`aspect-square rounded-lg text-sm font-bold transition border flex items-center justify-center ${current === i ? 'ring-2 ring-[#0d9488] ring-offset-1' : ''} ${st === 'answered' ? 'bg-[#0d9488] text-white border-[#0d9488]' : st === 'flagged' ? 'bg-amber-50 text-amber-600 border-amber-300' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 justify-center border-t pt-2">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#0d9488] block"></span> مجاب</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-300 block"></span> مُعلم</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-slate-200 block"></span> غير مجاب</span>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
