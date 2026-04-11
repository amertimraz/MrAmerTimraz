import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, GraduationCap, Sparkles, ChevronLeft, RotateCcw, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export type TrackId = 'life' | 'engineering' | 'business' | 'arts';

const TRACKS: Record<
  TrackId,
  { name: string; emoji: string; short: string; detail: string; gradient: string }
> = {
  life: {
    name: 'مسار الطب وعلوم الحياة',
    emoji: '🧬',
    short: 'قريب من «علمي علوم» — تركيز على الأحياء والكيمياء والعلوم الصحية.',
    detail:
      'يناسب من يفكّر في كليات الطب والصيدلة والعلاج الطبيعي وعلوم الحياة والمختبرات. يعتمد على فهم العلوم الطبيعية والتجريب.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
  engineering: {
    name: 'مسار الهندسة وعلوم الحاسب',
    emoji: '⚙️',
    short: 'قريب من «علمي رياضة» — رياضيات، فيزياء، وهندسة وحاسب.',
    detail:
      'يناسب من يحب الهندسة، البرمجة، الذكاء الاصطناعي، وتخصصات STEM. يعتمد على الرياضيات والتفكير المنطقي والمشاريع التقنية.',
    gradient: 'from-blue-500/20 to-cyan-500/10',
  },
  business: {
    name: 'مسار الأعمال',
    emoji: '📊',
    short: 'قريب من الشعبة التجارية — اقتصاد، محاسبة، وإدارة.',
    detail:
      'يناسب من يميل للاقتصاد، المحاسبة، إدارة الأعمال، التسويق، والريادة. يعتمد على التحليل، التخطيط، وفهم السوق.',
    gradient: 'from-amber-500/20 to-orange-500/10',
  },
  arts: {
    name: 'مسار الآداب والفنون',
    emoji: '🎭',
    short: 'قريب من الشعبة الأدبية — لغات، علوم اجتماعية، وإبداع.',
    detail:
      'يناسب من يحب اللغات، التاريخ، الجغرافيا، الإعلام، الحقوق، والفنون. يعتمد على القراءة، التعبير، والنقاش.',
    gradient: 'from-violet-500/20 to-fuchsia-500/10',
  },
};

const QUESTIONS: {
  q: string;
  options: { label: string; track: TrackId }[];
}[] = [
  {
    q: 'أي نوع دروس تحس إنك بتذاكرها بسهولة أكتر؟',
    options: [
      { label: 'أحياء وكيمياء وعلوم صحية', track: 'life' },
      { label: 'رياضيات وفيزياء وحاسب', track: 'engineering' },
      { label: 'اقتصاد ودراسات تجارية', track: 'business' },
      { label: 'لغات وتاريخ وجغرافيا', track: 'arts' },
    ],
  },
  {
    q: 'لو فكّرت في شغلك بعد الجامعة، إيه الأقرب لخيالك؟',
    options: [
      { label: 'طب أو صيدلة أو مختبرات أو صحة', track: 'life' },
      { label: 'هندسة أو برمجة أو ذكاء اصطناعي', track: 'engineering' },
      { label: 'محاسبة أو بنك أو تسويق أو إدارة', track: 'business' },
      { label: 'حقوق أو إعلام أو ترجمة أو فنون', track: 'arts' },
    ],
  },
  {
    q: 'في المشروع المدرسي، تحب تشتغل على…',
    options: [
      { label: 'تجربة علمية أو بحث في الأحياء/الكيمياء', track: 'life' },
      { label: 'نموذج تقني أو برمجة أو فيزياء تطبيقية', track: 'engineering' },
      { label: 'خطة تسويق أو ميزانية أو دراسة جدوى', track: 'business' },
      { label: 'بحث لغوي أو عرض إبداعي أو نقاش', track: 'arts' },
    ],
  },
  {
    q: 'أي سيناريو يشدّك أكتر؟',
    options: [
      { label: 'قراءة عن الجسم والأمراض والأدوية', track: 'life' },
      { label: 'تعلّم لغة برمجة وبناء تطبيق', track: 'engineering' },
      { label: 'متابعة أخبار الاقتصاد والشركات', track: 'business' },
      { label: 'كتابة مقال أو تحليل نص أو مناظرة', track: 'arts' },
    ],
  },
  {
    q: 'لما يكون عندك وقت فراغ للتعلّم الذاتي، تميل لـ…',
    options: [
      { label: 'فيديوهات علوم وصحة', track: 'life' },
      { label: 'دورات برمجة أو رياضيات أو فيزياء', track: 'engineering' },
      { label: 'محتوى عن أعمال وريادة ومالية', track: 'business' },
      { label: 'روايات أو تاريخ أو لغات', track: 'arts' },
    ],
  },
  {
    q: 'أي مادة تحس إنها «بتفتح دماغك» من غير ملل؟',
    options: [
      { label: 'الأحياء أو الكيمياء', track: 'life' },
      { label: 'الرياضيات أو الحاسب الآلي', track: 'engineering' },
      { label: 'الاقتصاد أو الدراسات الاجتماعية التجارية', track: 'business' },
      { label: 'اللغة العربية أو الأجنبية أو الفلسفة', track: 'arts' },
    ],
  },
  {
    q: 'لو حد سألك: إيه اللي يهمّك في شغلك؟ تقول…',
    options: [
      { label: 'أساعد ناس وأشوف أثر صحي مباشر', track: 'life' },
      { label: 'أبني حلول تقنية وأشوف المشروع يشتغل', track: 'engineering' },
      { label: 'أدير فلوس أو فريق أو مشروع تجاري', track: 'business' },
      { label: 'أتعامل مع أفكار وكلمات وجمهور', track: 'arts' },
    ],
  },
];

function tally(choices: TrackId[]): Record<TrackId, number> {
  const base: Record<TrackId, number> = { life: 0, engineering: 0, business: 0, arts: 0 };
  for (const c of choices) base[c] += 1;
  return base;
}

function pickTop(scores: Record<TrackId, number>): { winners: TrackId[]; max: number } {
  const entries = Object.entries(scores) as [TrackId, number][];
  const max = Math.max(...entries.map(([, v]) => v));
  const winners = entries.filter(([, v]) => v === max).map(([k]) => k);
  return { winners, max };
}

export default function PathsGuidePage() {
  const { isDark } = useAuthStore();
  const [phase, setPhase] = useState<'info' | 'quiz' | 'result'>('info');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<TrackId[]>([]);

  const text = isDark ? 'text-white' : 'text-gray-900';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200';
  const mutedBorder = isDark ? 'border-white/10' : 'border-gray-200';

  const scores = useMemo(() => tally(answers), [answers]);
  const result = useMemo(() => {
    if (answers.length < QUESTIONS.length) return null;
    return pickTop(scores);
  }, [answers, scores]);

  const primaryTrack = result && result.winners.length ? result.winners[0] : null;

  function selectOption(track: TrackId) {
    const next = [...answers];
    next[step] = track;
    setAnswers(next);
    if (step + 1 >= QUESTIONS.length) {
      setPhase('result');
    } else {
      setStep(s => s + 1);
    }
  }

  function restart() {
    setAnswers([]);
    setStep(0);
    setPhase('quiz');
  }

  function fullReset() {
    setAnswers([]);
    setStep(0);
    setPhase('info');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-2 ${
            isDark ? 'bg-cyan-500/15' : 'bg-cyan-50'
          }`}
        >
          <Compass size={32} className="text-cyan-500" />
        </div>
        <h1 className={`text-3xl sm:text-4xl font-black ${text}`}>دليل المسارات التوجيهي</h1>
        <p className={`text-base ${subtext} max-w-xl mx-auto leading-relaxed`}>
          نظرة سريعة على مسارات نظام البكالوريا المصرية (تقريبية)، ثم اختبار خفيف يقترح مساراً يناسب ميولك —
          <span className="font-semibold text-amber-600/90"> ليس بديلاً عن قرار المدرسة أو الوزارة</span>.
        </p>
      </motion.div>

      {/* معلومات المسارات */}
      <section className={`rounded-2xl border p-6 sm:p-8 ${cardBg}`}>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="text-green-500" size={22} />
          <h2 className={`text-lg font-bold ${text}`}>المسارات الأربعة (باختصار)</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(TRACKS) as TrackId[]).map(id => {
            const t = TRACKS[id];
            return (
              <div
                key={id}
                className={`rounded-xl border p-4 bg-gradient-to-br ${t.gradient} ${mutedBorder}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>
                    {t.emoji}
                  </span>
                  <div>
                    <h3 className={`font-bold text-sm ${text}`}>{t.name}</h3>
                    <p className={`text-xs mt-1 leading-relaxed ${subtext}`}>{t.short}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className={`text-xs mt-6 leading-relaxed ${subtext} border-t ${mutedBorder} pt-4`}>
          التسميات والمواد تُحدَّد رسمياً من وزارة التربية والتعليم؛ قد يُضاف خيار الثانوية العامة التقليدية
          بجانب البكالوريا — راجع مدرستك لعامك الدراسي.
        </p>
      </section>

      {phase === 'info' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <button
            type="button"
            onClick={() => {
              setPhase('quiz');
              setStep(0);
              setAnswers([]);
            }}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-green-500/25 w-full sm:w-auto"
            style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
          >
            <Sparkles size={18} />
            ابدأ الاختبار التوجيهي
          </button>
          <Link
            to="/library"
            className={`text-sm font-medium underline-offset-4 hover:underline ${subtext}`}
          >
            الرجوع للمكتبة
          </Link>
        </motion.div>
      )}

      {/* الاختبار */}
      {phase === 'quiz' && (
        <section className={`rounded-2xl border p-6 sm:p-8 ${cardBg}`}>
          <div className="flex justify-between items-center mb-6">
            <span className={`text-sm ${subtext}`}>
              سؤال {step + 1} من {QUESTIONS.length}
            </span>
            <div className={`h-2 flex-1 mx-4 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
              <motion.div
                className="h-full bg-green-500"
                initial={false}
                animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className={`text-lg font-bold mb-6 ${text}`}>{QUESTIONS[step].q}</h2>
              <div className="space-y-3">
                {QUESTIONS[step].options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectOption(opt.track)}
                    className={`w-full text-right rounded-xl border px-4 py-3.5 text-sm font-medium transition-all ${
                      isDark
                        ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-green-500/40 text-white'
                        : 'border-gray-200 bg-gray-50/80 hover:bg-white hover:border-green-400 text-gray-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {step > 0 && (
            <button
              type="button"
              onClick={() => {
                setStep(s => Math.max(0, s - 1));
                setAnswers(a => a.slice(0, -1));
              }}
              className={`mt-6 inline-flex items-center gap-1 text-sm ${subtext} hover:text-green-500`}
            >
              <ChevronLeft size={16} />
              السؤال السابق
            </button>
          )}
        </section>
      )}

      {/* النتيجة */}
      {phase === 'result' && primaryTrack && result && (
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl border overflow-hidden ${cardBg}`}
        >
          <div
            className={`p-8 text-center bg-gradient-to-br ${TRACKS[primaryTrack].gradient} border-b ${mutedBorder}`}
          >
            <GraduationCap className="mx-auto mb-3 text-green-500" size={40} />
            <p className={`text-sm font-semibold ${subtext}`}>اقتراح المسار الأنسب لإجاباتك</p>
            <h2 className={`text-2xl font-black mt-2 ${text}`}>
              {TRACKS[primaryTrack].emoji} {TRACKS[primaryTrack].name}
            </h2>
            {result.winners.length > 1 && (
              <p className={`text-xs mt-3 ${subtext}`}>
                تقارب بين:{' '}
                {result.winners.map(w => TRACKS[w].name).join(' — ')}. راجع مع مرشدك أو ولي الأمر؛ التعادل يعني
                إن الميول متنوعة.
              </p>
            )}
          </div>
          <div className="p-6 sm:p-8 space-y-4">
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {TRACKS[primaryTrack].detail}
            </p>
            <div
              className={`rounded-xl p-4 text-xs ${isDark ? 'bg-white/5 text-gray-400' : 'bg-amber-50 text-amber-900/80'}`}
            >
              <strong>تنبيه:</strong> هذا اختبار توجيهي تعليمي داخل المنصة وليس قراراً إدارياً. الاختيار النهائي
              للنظام (بكالوريا / ثانوية عامة) والمسار يخضع لقواعد الوزارة ولي الأمر والمدرسة.
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-green-500/50 text-green-600 font-semibold text-sm hover:bg-green-500/10"
              >
                <RotateCcw size={16} />
                إعادة الاختبار
              </button>
              <button
                type="button"
                onClick={fullReset}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium ${subtext} hover:text-green-500`}
              >
                العودة للمقدمة
              </button>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
