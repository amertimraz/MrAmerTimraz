import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, GraduationCap, MessageCircle, RotateCcw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export type TrackId = 'life' | 'engineering' | 'business' | 'arts';

const GUIDE = {
  name: 'مساعد التوجيه',
  tagline: 'معاك خطوة بخطوة — ردود فورية، من غير حكم على إجاباتك',
  /** صورة بشرية للدفء؛ لو فشل التحميل نعرض أيقونة */
  avatarSrc: '/teacher2.png',
};

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

const INTRO_LINES = [
  'أهلاً 👋 أنا مساعد التوجيه على منصة أ. عامر تمراز.',
  'هتكلم معاك كأننا قاعدين سوا — هطرح عليك شوية أسئلة بسيطة، ومفيش صحّ وغلط.',
  'هدفي نلمّ على مسار البكالوريا اللي يقرب من ميولك. لما تكون جاهز، اضغط الزر تحت.',
];

type ChatMsg = { id: string; role: 'guide' | 'user'; body: string };

function uid() {
  return crypto.randomUUID();
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

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

function GuideAvatar({ isDark, imgErr, onImgErr }: { isDark: boolean; imgErr: boolean; onImgErr: () => void }) {
  if (imgErr) {
    return (
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
          isDark ? 'bg-green-500/20 border-green-500/40' : 'bg-green-50 border-green-200'
        }`}
      >
        <Bot className="text-green-600" size={20} />
      </div>
    );
  }
  return (
    <div
      className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 ${
        isDark ? 'border-green-500/35' : 'border-green-400/60'
      }`}
    >
      <img
        src={GUIDE.avatarSrc}
        alt=""
        className="w-full h-full object-cover object-top"
        onError={onImgErr}
      />
    </div>
  );
}

export default function PathsGuidePage() {
  const { isDark } = useAuthStore();
  const [phase, setPhase] = useState<'welcome' | 'quiz' | 'result'>('welcome');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<TrackId[]>([]);
  const [introDone, setIntroDone] = useState(false);
  const [avatarErr, setAvatarErr] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const text = isDark ? 'text-white' : 'text-gray-900';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-[#0f1419]/90 border-white/10' : 'bg-white border-gray-200';
  const mutedBorder = isDark ? 'border-white/10' : 'border-gray-200';

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, phase, scrollToBottom]);

  const pushMsg = useCallback((role: ChatMsg['role'], body: string) => {
    setMessages(m => [...m, { id: uid(), role, body }]);
  }, []);

  /** مقدمة واحدة + مؤشر كتابة (أبسط وأقل عرضة لتعارض Strict Mode) */
  useEffect(() => {
    if (phase !== 'welcome' || introDone) return;
    let cancelled = false;

    (async () => {
      setIsTyping(true);
      await delay(850);
      if (cancelled) return;
      setIsTyping(false);
      pushMsg('guide', INTRO_LINES.join('\n\n'));
      setIntroDone(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [phase, introDone, pushMsg]);

  async function startQuiz() {
    pushMsg('user', 'يلا نبدأ — جاهز للأسئلة 🙌');
    setPhase('quiz');
    setStep(0);
    setAnswers([]);
    setIsTyping(true);
    await delay(700);
    setIsTyping(false);
    pushMsg('guide', `أول سؤال:\n${QUESTIONS[0].q}`);
  }

  async function selectOption(track: TrackId, label: string) {
    const nextAnswers = [...answers];
    nextAnswers[step] = track;
    setAnswers(nextAnswers);
    pushMsg('user', label);

    if (step + 1 >= QUESTIONS.length) {
      setIsTyping(true);
      await delay(900);
      setIsTyping(false);
      setPhase('result');
      const scores = tally(nextAnswers);
      const { winners } = pickTop(scores);
      const primary = winners[0];
      const tieNote =
        winners.length > 1
          ? `\n\nملاحظة: تقارب بين أكثر من مسار (${winners.map(w => TRACKS[w].name).join(' — ')}) — راجع مع مرشدك.`
          : '';
      pushMsg(
        'guide',
        `بناءً على إجاباتك، الأقرب لميولك دلوقتي هو:\n\n${TRACKS[primary].emoji} **${TRACKS[primary].name}**\n\n${TRACKS[primary].detail}${tieNote}`
      );
      return;
    }

    const nextStep = step + 1;
    setStep(nextStep);
    setIsTyping(true);
    await delay(750);
    setIsTyping(false);
    const fillers = ['سؤال تاني:', 'نكمّل:', 'سؤال سريع:', 'وبعدين:', 'لسه معاك:', 'آخر سؤال تقريباً:', 'سؤال أخير:'];
    const lead = fillers[Math.min(nextStep, fillers.length - 1)];
    pushMsg('guide', `${lead}\n${QUESTIONS[nextStep].q}`);
  }

  function resetConversation() {
    setMessages([]);
    setAnswers([]);
    setStep(0);
    setIntroDone(false);
    setPhase('welcome');
    setIsTyping(false);
  }

  function restartQuizOnly() {
    setMessages([]);
    setAnswers([]);
    setStep(0);
    setPhase('quiz');
    setIntroDone(true);
    setIsTyping(true);
    void (async () => {
      await delay(600);
      setIsTyping(false);
      pushMsg('guide', `نبدأ من تاني 👇\n${QUESTIONS[0].q}`);
    })();
  }

  const primaryTrack =
    phase === 'result' && answers.length === QUESTIONS.length ? pickTop(tally(answers)).winners[0] : null;

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-4 py-8 sm:py-10 pb-28" dir="rtl">
      <div className={`rounded-3xl border shadow-xl overflow-hidden flex flex-col ${cardBg} min-h-[70vh] max-h-[85vh]`}>
        {/* شريط المحادثة */}
        <header
          className={`shrink-0 px-4 py-3 border-b flex items-center gap-3 ${
            isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <GuideAvatar isDark={isDark} imgErr={avatarErr} onImgErr={() => setAvatarErr(true)} />
            <div className="min-w-0">
              <h1 className={`font-bold text-sm sm:text-base truncate ${text}`}>{GUIDE.name}</h1>
              <p className={`text-[11px] sm:text-xs truncate ${subtext}`}>{GUIDE.tagline}</p>
            </div>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
              isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200/80 text-gray-600'
            }`}
          >
            حواري
          </span>
        </header>

        {/* فقاعات */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3">
          {messages.length === 0 && !isTyping && phase === 'welcome' && !introDone && (
            <p className={`text-center text-sm ${subtext}`}>جاري الاتصال…</p>
          )}

          <AnimatePresence initial={false}>
            {messages.map(m => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${m.role === 'guide' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'guide' && (
                  <>
                    <div
                      className={`max-w-[88%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm leading-relaxed ${
                        isDark
                          ? 'bg-green-500/15 text-gray-100 border border-green-500/25'
                          : 'bg-green-50 text-gray-900 border border-green-100'
                      }`}
                    >
                      {m.body.split('\n').map((line, i) => {
                        const bold = line.includes('**');
                        if (!bold) return <p key={i}>{line}</p>;
                        const parts = line.split(/\*\*(.+?)\*\*/g);
                        return (
                          <p key={i}>
                            {parts.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : p))}
                          </p>
                        );
                      })}
                    </div>
                    <GuideAvatar isDark={isDark} imgErr={avatarErr} onImgErr={() => setAvatarErr(true)} />
                  </>
                )}
                {m.role === 'user' && (
                  <div
                    className={`max-w-[85%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm ${
                      isDark ? 'bg-white/10 text-white border border-white/10' : 'bg-gray-800 text-white'
                    }`}
                  >
                    {m.body}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-end gap-2 items-center"
            >
              <div
                className={`rounded-2xl rounded-br-md px-4 py-3 text-sm flex gap-1.5 ${
                  isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <GuideAvatar isDark={isDark} imgErr={avatarErr} onImgErr={() => setAvatarErr(true)} />
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* شريط الإجراءات */}
        <footer
          className={`shrink-0 border-t p-3 space-y-2 ${
            isDark ? 'bg-black/25 border-white/10' : 'bg-gray-50 border-gray-100'
          }`}
        >
          {phase === 'welcome' && introDone && (
            <button
              type="button"
              onClick={() => void startQuiz()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-green-500/20"
              style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
            >
              <MessageCircle size={18} />
              يلا نبدأ المحادثة
            </button>
          )}

          {phase === 'quiz' && !isTyping && (
            <div className="space-y-2">
              <p className={`text-[11px] text-center ${subtext}`}>
                سؤال {step + 1} من {QUESTIONS.length} — اختار اللي يعبّر عنك
              </p>
              <div className="grid gap-2">
                {QUESTIONS[step]?.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => void selectOption(opt.track, opt.label)}
                    className={`w-full text-right rounded-xl border px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.99] ${
                      isDark
                        ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-green-500/40 text-white'
                        : 'border-gray-200 bg-white hover:border-green-400 text-gray-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'result' && primaryTrack && (
            <div className="space-y-3">
              <div
                className={`rounded-2xl p-4 text-center border ${mutedBorder} bg-gradient-to-br ${TRACKS[primaryTrack].gradient}`}
              >
                <GraduationCap className="mx-auto text-green-500 mb-1" size={28} />
                <p className={`text-xs font-semibold ${subtext}`}>ملخّص سريع</p>
                <p className={`font-black text-lg ${text}`}>
                  {TRACKS[primaryTrack].emoji} {TRACKS[primaryTrack].name}
                </p>
              </div>
              <p className={`text-[11px] leading-relaxed ${subtext} px-1`}>
                <strong className="text-amber-600/90">تنبيه:</strong> توجيه تعليمي داخل المنصة فقط؛ القرار الرسمي
                للوزارة والمدرسة ولي الأمر.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={restartQuizOnly}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-green-500/50 text-green-600 font-semibold text-sm"
                >
                  <RotateCcw size={16} />
                  محادثة جديدة
                </button>
                <button
                  type="button"
                  onClick={resetConversation}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${subtext} border ${mutedBorder}`}
                >
                  من البداية
                </button>
              </div>
              <Link
                to="/library"
                className={`block text-center text-xs py-1 ${subtext} hover:text-green-500`}
              >
                الرجوع للمكتبة
              </Link>
            </div>
          )}

          {phase === 'welcome' && !introDone && (
            <p className={`text-[11px] text-center ${subtext}`}>
              <Sparkles size={12} className="inline ml-1 text-amber-500" />
              جاري فتح المحادثة…
            </p>
          )}
        </footer>
      </div>

      <p className={`text-center text-xs mt-4 px-2 ${subtext}`}>
        المسارات الأربعة للبكالوريا (تقريبية): طب وعلوم حياة — هندسة وحاسب — أعمال — آداب وفنون. راجع مدرستك للتفاصيل
        الرسمية.
      </p>
    </div>
  );
}
