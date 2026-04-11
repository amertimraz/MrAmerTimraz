import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  GraduationCap,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  Facebook,
  Youtube,
  ExternalLink,
  Users,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import FloatingAiChat from '../../components/ui/FloatingAiChat';
import { pathResultsApi } from '../../api/pathResults';

export type TrackId = 'life' | 'engineering' | 'business' | 'arts';

/** وسائل التواصل مع أ. عامر تمراز (متطابقة مع صفحة التواصل) */
const MR_AMER_CONTACT = {
  phone: '01096066818',
  phoneDisplay: '٠١٠٩٦٠٦٦٨١٨',
  email: 'amertimraz@gmail.com',
  facebook: 'https://www.facebook.com/Mr.AmerTimraz',
  youtube: 'https://www.youtube.com/@AmerTimraz',
} as const;

const GUIDE = {
  name: 'مساعد التوجيه',
  tagline: 'معاك في خطوة اختيار المسار — ردود آلية بأسلوب بسيط',
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
      'يناسب من يفكّر في كليات الطب والصيدلة والعلاج الطبيعي وعلوم الحياة والمختبرات، ويعتمد على فهم العلوم الطبيعية والتجريب والدقة في التفاصيل.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
  engineering: {
    name: 'مسار الهندسة وعلوم الحاسب',
    emoji: '⚙️',
    short: 'قريب من «علمي رياضة» — رياضيات، فيزياء، وهندسة وحاسب.',
    detail:
      'يناسب من يحب الهندسة، البرمجة، الذكاء الاصطناعي، وتخصصات STEM؛ يعتمد على الرياضيات، التفكير المنطقي، وحل المشكلات عملياً.',
    gradient: 'from-blue-500/20 to-cyan-500/10',
  },
  business: {
    name: 'مسار الأعمال',
    emoji: '📊',
    short: 'قريب من الشعبة التجارية — اقتصاد، محاسبة، وإدارة.',
    detail:
      'يناسب من يميل للاقتصاد، المحاسبة، إدارة الأعمال، التسويق، والريادة؛ يعتمد على التحليل، التخطيط، وفهم السوق والأرقام.',
    gradient: 'from-amber-500/20 to-orange-500/10',
  },
  arts: {
    name: 'مسار الآداب والفنون',
    emoji: '🎭',
    short: 'قريب من الشعبة الأدبية — لغات، علوم اجتماعية، وإبداع.',
    detail:
      'يناسب من يحب اللغات، التاريخ، الجغرافيا، الإعلام، الحقوق، والفنون؛ يعتمد على القراءة، التعبير، والنقاش والتحليل النصي.',
    gradient: 'from-violet-500/20 to-fuchsia-500/10',
  },
};

const QUESTIONS: {
  q: string;
  options: { label: string; track: TrackId }[];
}[] = [
  {
    q: 'أي مجموعة مواد تحس إنك بتذاكرها بسهولة نسبياً وتفهمها من غير ما تحس إنها «تقيلة» عليك؟',
    options: [
      { label: 'أحياء وكيمياء وعلوم صحية', track: 'life' },
      { label: 'رياضيات وفيزياء وحاسب آلي', track: 'engineering' },
      { label: 'اقتصاد ودراسات تجارية', track: 'business' },
      { label: 'لغات وتاريخ وجغرافيا واجتماع', track: 'arts' },
    ],
  },
  {
    q: 'لو فكّرت في شغلك بعد الجامعة (حتى لو الفكرة لسه عامة)، إيه الأقرب لخيالك؟',
    options: [
      { label: 'طب أو صيدلة أو مختبرات أو مجال صحي مباشر', track: 'life' },
      { label: 'هندسة أو برمجة أو ذكاء اصطناعي أو تقنية', track: 'engineering' },
      { label: 'محاسبة أو بنك أو تسويق أو إدارة أعمال', track: 'business' },
      { label: 'حقوق أو إعلام أو ترجمة أو فنون وإبداع', track: 'arts' },
    ],
  },
  {
    q: 'في مشروع مدرسي أو بحث، تحب تشتغل على إيه أكتر؟',
    options: [
      { label: 'تجربة علمية أو بحث في الأحياء/الكيمياء', track: 'life' },
      { label: 'نموذج تقني، برمجة، أو فيزياء تطبيقية', track: 'engineering' },
      { label: 'خطة تسويق، ميزانية، أو دراسة جدوى', track: 'business' },
      { label: 'بحث لغوي، عرض إبداعي، أو مناظرة', track: 'arts' },
    ],
  },
  {
    q: 'لو هتقضي ساعة حرة في التعلّم من غير ما حد يجبرك، هتروح لأنوان إيه؟',
    options: [
      { label: 'فيديوهات عن الجسم، الصحة، أو العلوم الحيوية', track: 'life' },
      { label: 'دورات برمجة، رياضيات، أو فيزياء', track: 'engineering' },
      { label: 'اقتصاد، ريادة أعمال، أو محتوى مالي', track: 'business' },
      { label: 'روايات، تاريخ، لغات، أو فيديوهات تحليلية', track: 'arts' },
    ],
  },
  {
    q: 'لما تحس ضغط المذاكرة — إيه اللي بيريّحك أكتر؟',
    options: [
      { label: 'أراجع ملخصات منظمة وأحل أسئلة على المنهج', track: 'life' },
      { label: 'أحل مسائل وأجرّب حل خطوة بخطوة', track: 'engineering' },
      { label: 'أخطط للمراجعة على جدول وأقسّم الوقت', track: 'business' },
      { label: 'أشرح لحد أو أكتب بإيدي عشان أفهم', track: 'arts' },
    ],
  },
  {
    q: 'أي سيناريو يشدّك أكتر كفكرة لمستقبلك؟',
    options: [
      { label: 'أشتغل في مكان أشوف فيه أثر صحي مباشر على الناس', track: 'life' },
      { label: 'أبني منتج أو نظام تقني وأشوفه يشتغل قدامي', track: 'engineering' },
      { label: 'أدير مال أو فريق أو مشروع له أرقام واضحة', track: 'business' },
      { label: 'أتعامل مع نصوص، جمهور، أو أفكار وإقناع', track: 'arts' },
    ],
  },
  {
    q: 'لو حد سألك: إيه أهم حاجة في شغلك المستقبلي؟ تقول…',
    options: [
      { label: 'الإحساس إني بساعد ناس وبفرق في حياتهم', track: 'life' },
      { label: 'الابتكار والتحدّي التقني المستمر', track: 'engineering' },
      { label: 'الاستقرار والنمو والمسؤولية الإدارية', track: 'business' },
      { label: 'الحرية الفكرية والتعبير والتنوع', track: 'arts' },
    ],
  },
  {
    q: 'بتفضّل تشتغل في بيئة إزاي؟',
    options: [
      { label: 'فريق طبي أو مختبر — دقة وتركيز وتقارير', track: 'life' },
      { label: 'فريق تقني — مشاريع، كود، ومراجعات', track: 'engineering' },
      { label: 'مكتب أو شركة — اجتماعات، أهداف، أرقام', track: 'business' },
      { label: 'صحافة، تعليم، أو مجال فيه تواصل وكتابة', track: 'arts' },
    ],
  },
  {
    q: 'أي مادة من دول «بتفتح دماغك» من غير ما تحس بملل سريع؟',
    options: [
      { label: 'الأحياء أو الكيمياء', track: 'life' },
      { label: 'الرياضيات أو الحاسب الآلي', track: 'engineering' },
      { label: 'الاقتصاد أو الدراسات الاجتماعية (التجارية)', track: 'business' },
      { label: 'العربي أو الأجنبي أو الفلسفة', track: 'arts' },
    ],
  },
  {
    q: 'سؤال أخير للتفكير: إيه اللي يخليك تحس إنك «في مكانك» مهنياً؟',
    options: [
      { label: 'أشوف نتيجة عملي على صحة الناس أو جودة حياتهم', track: 'life' },
      { label: 'أحل مشكلة تقنية وأتعلم حاجة جديدة كل فترة', track: 'engineering' },
      { label: 'أحقق أهداف واضحة وأشوف نمو في الأداء والمسؤولية', track: 'business' },
      { label: 'أتعامل مع قضايا، كلمات، أو جمهور بأسلوبي', track: 'arts' },
    ],
  },
];

const INTRO_TEXT = [
  'أهلاً 👋 أنا مساعد التوجيه على منصة **أ. عامر تمراز**.',
  'هنمشي سوا في خطوات بسيطة عشان نلمّ على مسار بكالوريا يقرب من ميولك — **مفيش إجابة غلط**، المهم الصدق مع نفسك.',
  'قبل ما نبدأ: **اكتب اسمك الأول** في الخانة تحت عشان أكلّمك باسمك طول المحادثة.',
].join('\n\n');

const ASK_NAME_ACK = (name: string) =>
  `تمام يا **${name}** 🌟\nكده نقدر نكمّل بارتياح. جاهز/جاهزة للأسئلة؟ اضغط الزر تحت لما تكون جاهز.`;

type Phase = 'intro' | 'name_entry' | 'quiz' | 'result';

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

/** اسم آمن للعرض في الجمل */
function safeDisplayName(raw: string): string {
  const t = raw.trim().slice(0, 40);
  if (t.length < 2) return 'صديقي';
  return t;
}

const Q_LEADS = [
  'أول سؤال ليك:',
  'سؤال يفكّرك في المستقبل:',
  'نكمّل يا بطل:',
  'سؤال عن أسلوبك:',
  'وبعدين:',
  'لسه معاك:',
  'سؤال عن الضغط والمذاكرة:',
  'نقطة مهمة:',
  'قبل ما نخلص:',
  'سؤال أخير للتأكيد:',
];

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

function renderBody(body: string) {
  return body.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="min-h-[1.2em]">
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} className="font-bold text-green-600 dark:text-green-400">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={j}>{part}</span>;
        })}
      </p>
    );
  });
}

export default function PathsGuidePage() {
  const { isDark } = useAuthStore();
  const [phase, setPhase] = useState<Phase>('intro');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<TrackId[]>([]);
  const [introDone, setIntroDone] = useState(false);
  const [avatarErr, setAvatarErr] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Statistics state
  const [stats, setStats] = useState<{
    totalUsers: number;
    todayCount: number;
    trackDistribution: { trackId: string; trackName: string; count: number }[];
  } | null>(null);

  const displayName = safeDisplayName(studentName);

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

  // Fetch statistics on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await pathResultsApi.getStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const pushMsg = useCallback((role: ChatMsg['role'], body: string) => {
    setMessages(m => [...m, { id: uid(), role, body }]);
  }, []);

  useEffect(() => {
    if (phase !== 'intro' || introDone) return;
    let cancelled = false;

    (async () => {
      setIsTyping(true);
      await delay(900);
      if (cancelled) return;
      setIsTyping(false);
      pushMsg('guide', INTRO_TEXT);
      setIntroDone(true);
      setPhase('name_entry');
    })();

    return () => {
      cancelled = true;
    };
  }, [phase, introDone, pushMsg]);

  function submitName() {
    const raw = nameInput.trim();
    if (raw.length < 2) return;
    setStudentName(raw);
    pushMsg('user', `اسمي: ${raw}`);
    setIsTyping(true);
    void (async () => {
      await delay(600);
      setIsTyping(false);
      const dn = safeDisplayName(raw);
      pushMsg('guide', ASK_NAME_ACK(dn));
    })();
  }

  async function startQuizAfterName() {
    if (!studentName.trim()) return;
    pushMsg('user', 'جاهز، نبدأ الأسئلة ✅');
    setPhase('quiz');
    setStep(0);
    setAnswers([]);
    setIsTyping(true);
    await delay(650);
    setIsTyping(false);
    const dn = safeDisplayName(studentName);
    pushMsg('guide', `${Q_LEADS[0]}\nيا ${dn}، ${QUESTIONS[0].q}`);
  }

  async function selectOption(track: TrackId, label: string) {
    const nextAnswers = [...answers];
    nextAnswers[step] = track;
    setAnswers(nextAnswers);
    pushMsg('user', label);

    if (step + 1 >= QUESTIONS.length) {
      setIsTyping(true);
      await delay(950);
      setIsTyping(false);
      setPhase('result');
      const scores = tally(nextAnswers);
      const { winners } = pickTop(scores);
      const primary = winners[0];
      const dn = displayName;
      const tieNote =
        winners.length > 1
          ? `\n\n⚠️ في **تقارب** بين أكثر من مسار (${winners.map(w => TRACKS[w].name).join(' — ')}) — من الأفضل تراجع مع ولي أمرك أو المرشد في المدرسة.`
          : '';
      
      // Save result to backend
      try {
        await pathResultsApi.create({
          studentName: studentName || undefined,
          trackId: primary,
          trackName: TRACKS[primary].name,
        });
        // Refresh stats after saving
        const updatedStats = await pathResultsApi.getStats();
        setStats(updatedStats);
      } catch (err) {
        console.error('Error saving path result:', err);
      }
      
      pushMsg(
        'guide',
        `يا ${dn}، خلصنا الأسئلة وبناءً على إجاباتك الصادقة، المسار اللي **الأقرب لميولك دلوقتي** هو:\n\n${TRACKS[primary].emoji} **${TRACKS[primary].name}**\n\n${TRACKS[primary].detail}${tieNote}\n\nده **توجيه تعليمي** مش قرار رسمي — القرار النهائي للوزارة والمدرسة.\n\n📌 **لو حابب تستفسر أكتر أو تشوف منصة أ. عامر:** استخدم وسائل التواصل في الأسفل.`
      );
      return;
    }

    const nextStep = step + 1;
    setStep(nextStep);
    setIsTyping(true);
    await delay(700);
    setIsTyping(false);
    const dn = displayName;
    const lead = Q_LEADS[Math.min(nextStep, Q_LEADS.length - 1)];
    pushMsg('guide', `${lead}\nيا ${dn}، ${QUESTIONS[nextStep].q}`);
  }

  function resetConversation() {
    setMessages([]);
    setAnswers([]);
    setStep(0);
    setIntroDone(false);
    setPhase('intro');
    setIsTyping(false);
    setStudentName('');
    setNameInput('');
  }

  function restartQuizOnly() {
    if (!studentName.trim()) {
      resetConversation();
      return;
    }
    setMessages([]);
    setAnswers([]);
    setStep(0);
    setPhase('quiz');
    setIntroDone(true);
    const dn = displayName;
    setIsTyping(true);
    void (async () => {
      await delay(550);
      setIsTyping(false);
      pushMsg('guide', `يا ${dn}، نعيد الأسئلة من الأول — خد راحتك.\n\n${Q_LEADS[0]}\n${QUESTIONS[0].q}`);
    })();
  }

  const primaryTrack =
    phase === 'result' && answers.length === QUESTIONS.length ? pickTop(tally(answers)).winners[0] : null;

  const nameValid = nameInput.trim().length >= 2;

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-4 py-8 sm:py-10 pb-28" dir="rtl">
      <div className={`rounded-3xl border shadow-xl overflow-hidden flex flex-col ${cardBg} min-h-[70vh] max-h-[85vh]`}>
        <header
          className={`shrink-0 px-4 py-3 border-b ${
            isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-100'
          }`}
        >
          {/* Main Header Row */}
          <div className="flex items-center gap-3 mb-2">
            <GuideAvatar isDark={isDark} imgErr={avatarErr} onImgErr={() => setAvatarErr(true)} />
            <div className="min-w-0 flex-1">
              <h1 className={`font-bold text-sm sm:text-base truncate ${text}`}>{GUIDE.name}</h1>
              <p className={`text-[11px] sm:text-xs truncate ${subtext}`}>{GUIDE.tagline}</p>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200/80 text-gray-600'
              }`}
            >
              {studentName.trim() ? `يا ${safeDisplayName(studentName)}` : 'حواري'}
            </span>
          </div>
          
          {/* Statistics Row */}
          {stats && (
            <div className={`flex items-center gap-3 pt-2 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
              <div className={`flex items-center gap-1.5 text-[10px] ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                <Users size={12} />
                <span>{stats.totalUsers.toLocaleString()} مستخدم</span>
              </div>
              <div className={`flex items-center gap-1.5 text-[10px] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <TrendingUp size={12} />
                <span>+{stats.todayCount} اليوم</span>
              </div>
              {stats.trackDistribution.length > 0 && (
                <div className={`flex items-center gap-1 text-[10px] ${subtext} mr-auto`}>
                  <span>الأكثر: </span>
                  <span className="font-medium text-amber-500">
                    {stats.trackDistribution.sort((a, b) => b.count - a.count)[0]?.trackName.split(' ')[2] || '—'}
                  </span>
                </div>
              )}
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3">
          {messages.length === 0 && !isTyping && phase === 'intro' && !introDone && (
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
                      {renderBody(m.body)}
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

        <footer
          className={`shrink-0 border-t p-3 space-y-2 ${
            isDark ? 'bg-black/25 border-white/10' : 'bg-gray-50 border-gray-100'
          }`}
        >
          {phase === 'name_entry' && introDone && (
            <div className="space-y-2">
              {!studentName.trim() ? (
                <>
                  <label className={`block text-xs font-medium ${subtext}`}>اسمك الأول</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && nameValid && submitName()}
                      placeholder="مثال: أحمد، سارة…"
                      maxLength={40}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/40 ${
                        isDark
                          ? 'bg-white/5 border-white/15 text-white placeholder-gray-500'
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                    <button
                      type="button"
                      disabled={!nameValid}
                      onClick={submitName}
                      className="px-4 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                    >
                      تم
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => void startQuizAfterName()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-green-500/20"
                  style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                >
                  <MessageCircle size={18} />
                  يلا نبدأ الأسئلة
                </button>
              )}
            </div>
          )}

          {phase === 'quiz' && !isTyping && (
            <div className="space-y-2">
              <p className={`text-[11px] text-center ${subtext}`}>
                يا {displayName}، سؤال {step + 1} من {QUESTIONS.length}
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
                <p className={`text-xs font-semibold ${subtext}`}>يا {displayName}، ملخّص مسارك المقترح</p>
                <p className={`font-black text-lg ${text}`}>
                  {TRACKS[primaryTrack].emoji} {TRACKS[primaryTrack].name}
                </p>
              </div>

              <div
                className={`rounded-2xl p-4 text-sm space-y-3 border ${mutedBorder} ${
                  isDark ? 'bg-white/5' : 'bg-white'
                }`}
              >
                <p className={`font-bold ${text} flex items-center gap-2`}>
                  <Phone size={16} className="text-green-500 shrink-0" />
                  تواصل مع أ. عامر تمراز
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href={`tel:+20${MR_AMER_CONTACT.phone.slice(1)}`}
                    className={`flex items-center gap-2 ${subtext} hover:text-green-500`}
                  >
                    <Phone size={14} />
                    <span dir="ltr">{MR_AMER_CONTACT.phoneDisplay}</span>
                  </a>
                  <a
                    href={`mailto:${MR_AMER_CONTACT.email}`}
                    className={`flex items-center gap-2 ${subtext} hover:text-green-500 break-all`}
                  >
                    <Mail size={14} />
                    {MR_AMER_CONTACT.email}
                  </a>
                  <a
                    href={MR_AMER_CONTACT.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-2 text-blue-500 hover:underline`}
                  >
                    <Facebook size={14} />
                    صفحة فيسبوك — Mr.AmerTimraz
                    <ExternalLink size={12} className="opacity-60" />
                  </a>
                  <a
                    href={MR_AMER_CONTACT.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-2 text-red-500 hover:underline`}
                  >
                    <Youtube size={14} />
                    قناة يوتيوب — @AmerTimraz
                    <ExternalLink size={12} className="opacity-60" />
                  </a>
                  <Link
                    to="/contact"
                    className={`inline-flex items-center gap-1 text-green-600 font-medium pt-1 hover:underline`}
                  >
                    صفحة التواصل الكاملة على المنصة
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>

              <p className={`text-[11px] leading-relaxed ${subtext} px-1`}>
                <strong className="text-amber-600/90">تذكير:</strong> النتيجة توجيهية فقط؛ راجع المدرسة والوزارة
                للضوابط الرسمية.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={restartQuizOnly}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-green-500/50 text-green-600 font-semibold text-sm"
                >
                  <RotateCcw size={16} />
                  إعادة الأسئلة
                </button>
                <button
                  type="button"
                  onClick={resetConversation}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${subtext} border ${mutedBorder}`}
                >
                  من البداية (اسم جديد)
                </button>
              </div>
              <Link to="/library" className={`block text-center text-xs py-1 ${subtext} hover:text-green-500`}>
                الرجوع للمكتبة
              </Link>
            </div>
          )}

          {phase === 'intro' && !introDone && (
            <p className={`text-[11px] text-center ${subtext}`}>
              <Sparkles size={12} className="inline ml-1 text-amber-500" />
              جاري فتح المحادثة…
            </p>
          )}
        </footer>
      </div>

      <p className={`text-center text-xs mt-4 px-2 ${subtext}`}>
        مسارات البكالوريا الأربعة (تقريبية): طب وعلوم حياة — هندسة وحاسب — أعمال — آداب وفنون. التفاصيل الرسمية من
        وزارة التربية والتعليم ومدرستك.
      </p>

      {/* Floating AI Chat */}
      <FloatingAiChat
        context="أنت مساعد تعليمي متخصص في التوجيه الأكاديمي والتعليم في مصر. أسعد بمساعدة الطلاب في اختيار مساراتهم الدراسية، وفهم الكورسات المتاحة، والإجابة عن استفساراتهم التعليمية."
        initialMessage="أهلاً! أنا هنا لمساعدتك في اختيار مسارك الدراسي أو للإجابة عن أي استفسار تعليمي. كيف يمكنني مساعدتك اليوم؟ 🎓"
      />
    </div>
  );
}
