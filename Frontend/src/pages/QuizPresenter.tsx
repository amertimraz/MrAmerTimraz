import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quizzesApi } from '../api/quizzes';
import type { InteractiveQuestion } from '../types';
import { ChevronRight, ChevronLeft, Eye, Shuffle, RotateCcw, Settings, X, Home, Timer, Star, Layers, Trophy, User, Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

/* ─── Constants ─────────────────────────────────────────── */
const OPTION_COLORS = [
  { bg: 'bg-red-500',     hover: 'hover:bg-red-400',     dim: 'bg-red-900/30',     letter: 'أ' },
  { bg: 'bg-blue-500',    hover: 'hover:bg-blue-400',    dim: 'bg-blue-900/30',    letter: 'ب' },
  { bg: 'bg-amber-500',   hover: 'hover:bg-amber-400',   dim: 'bg-amber-900/30',   letter: 'ج' },
  { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-400', dim: 'bg-emerald-900/30', letter: 'د' },
];

const STAGE_META = [
  { emoji: '🚀', name: 'الإحماء',      color: 'from-blue-600 to-cyan-500' },
  { emoji: '🔥', name: 'التحدي',       color: 'from-orange-500 to-red-500' },
  { emoji: '⚡', name: 'الاندفاع',     color: 'from-purple-600 to-pink-500' },
  { emoji: '💎', name: 'الماس',        color: 'from-teal-500 to-emerald-400' },
  { emoji: '🏆', name: 'البطولة',      color: 'from-yellow-400 to-amber-500' },
  { emoji: '🌪️', name: 'الإعصار',     color: 'from-cyan-600 to-blue-700' },
  { emoji: '🦁', name: 'الأسد',        color: 'from-amber-600 to-orange-700' },
  { emoji: '🌟', name: 'النجوم',       color: 'from-indigo-500 to-purple-600' },
  { emoji: '🎯', name: 'الدقة المطلقة', color: 'from-rose-500 to-red-600' },
  { emoji: '👑', name: 'التاج الذهبي', color: 'from-yellow-500 to-amber-600' },
];

const CORRECT_MSGS  = ['🔥 ممتاز!', '💪 كمل كده!', '🚀 أنت بطل!', '⭐ رائع جداً!', '🎯 إصابة في الصميم!', '🌟 أحسنت!', '👏 برافو عليك!'];
const WRONG_MSGS    = ['💪 في المرة الجاية!', '🔄 ركّز أكثر', '😤 حاول تاني!', '📚 راجع وحاول', '💡 اقرأ السؤال تاني'];
const GOLDEN_MSGS   = ['✨ سؤال ذهبي! نقطة مضاعفة!', '🌟 فرصة ذهبية!', '💰 السؤال الذهبي!'];

/* ─── Helpers ────────────────────────────────────────────── */
function parseOptions(raw?: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function getCorrectIdx(q: InteractiveQuestion): number {
  if (q.type === 'TrueFalse') return q.correctAnswer === 'true' ? 0 : 1;
  const n = Number(q.correctAnswer);
  return isNaN(n) ? -1 : n;
}

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function buildMixedOrder(
  qs: InteractiveQuestion[],
  mcqPerStage: number,
  tfPerStage: number,
  stageCount: number,
): { ordered: InteractiveQuestion[]; stageSize: number } {
  if (!qs.length) return { ordered: [], stageSize: 1 };

  const mcqPool = qs.filter(q => q.type !== 'TrueFalse');
  const tfPool  = qs.filter(q => q.type === 'TrueFalse');

  const sc = Math.max(stageCount, 1);
  const mcqSz = mcqPerStage > 0 ? mcqPerStage
    : (mcqPool.length > 0 ? Math.ceil(mcqPool.length / sc) : 0);
  const tfSz  = tfPerStage  > 0 ? tfPerStage
    : (tfPool.length  > 0 ? Math.ceil(tfPool.length  / sc) : 0);

  const stageSize = Math.max(mcqSz + tfSz, 1);

  const numStages = Math.max(
    mcqSz > 0 ? Math.ceil(mcqPool.length / mcqSz) : (mcqPool.length > 0 ? 1 : 0),
    tfSz  > 0 ? Math.ceil(tfPool.length  / tfSz)  : (tfPool.length  > 0 ? 1 : 0),
    1,
  );

  const result: InteractiveQuestion[] = [];
  for (let i = 0; i < numStages; i++) {
    const stageTF  = tfPool.slice( i * tfSz,  tfSz  > 0 ? (i + 1) * tfSz  : tfPool.length);
    const stageMCQ = mcqPool.slice(i * mcqSz, mcqSz > 0 ? (i + 1) * mcqSz : mcqPool.length);
    result.push(...stageTF, ...stageMCQ);
  }
  return { ordered: result, stageSize };
}

function getQuestionIcon(text: string): string {
  const t = text;
  if (t.includes('هاتف') || t.includes('موبايل') || t.includes('تليفون') || t.includes('ذكي')) return '📱';
  if (t.includes('كمبيوتر') || t.includes('حاسوب') || t.includes('لابتوب') || t.includes('جهاز')) return '💻';
  if (t.includes('إنترنت') || t.includes('انترنت') || t.includes('شبكة') || t.includes('واي فاي')) return '🌐';
  if (t.includes('تطبيق') || t.includes('برنامج') || t.includes('موقع')) return '📲';
  if (t.includes('كاميرا') || t.includes('صورة') || t.includes('فيديو') || t.includes('يوتيوب')) return '📷';
  if (t.includes('بطارية') || t.includes('شحن') || t.includes('طاقة') || t.includes('كهرباء')) return '🔋';
  if (t.includes('ذكاء') || t.includes('روبوت') || t.includes('آلي')) return '🤖';
  if (t.includes('لعب') || t.includes('ألعاب') || t.includes('لعبة')) return '🎮';
  if (t.includes('موسيقى') || t.includes('صوت') || t.includes('سماعة')) return '🎵';
  if (t.includes('رسالة') || t.includes('واتس') || t.includes('اتصال') || t.includes('تواصل')) return '💬';
  if (t.includes('أمن') || t.includes('حماية') || t.includes('كلمة مرور') || t.includes('خصوصية')) return '🔒';
  if (t.includes('بيانات') || t.includes('معلومات') || t.includes('ملف') || t.includes('مصدر')) return '💾';
  if (t.includes('خريطة') || t.includes('gps') || t.includes('GPS') || t.includes('طائرة') || t.includes('سفر') || t.includes('تذكرة')) return '✈️';
  if (t.includes('تسوق') || t.includes('شراء') || t.includes('دفع') || t.includes('فاتورة') || t.includes('مالية')) return '🛒';
  if (t.includes('طباعة') || t.includes('طابعة')) return '🖨️';
  if (t.includes('شاشة') || t.includes('تلفزيون') || t.includes('عرض')) return '🖥️';
  if (t.includes('مجتمع') || t.includes('اجتماعي') || t.includes('ناس') || t.includes('أشخاص')) return '👥';
  if (t.includes('صحة') || t.includes('طبي') || t.includes('مستشفى')) return '🏥';
  if (t.includes('تعليم') || t.includes('مدرسة') || t.includes('تعلم') || t.includes('دراسة')) return '📚';
  if (t.includes('رقمي') || t.includes('تكنولوجيا') || t.includes('أداة') || t.includes('أدوات')) return '⚙️';
  if (t.includes('سريع') || t.includes('سرعة') || t.includes('تطور') || t.includes('تقدم')) return '🚀';
  if (t.includes('ساعة') || t.includes('وقت') || t.includes('مؤقت')) return '⌚';
  if (t.includes('إيجابي') || t.includes('فائدة') || t.includes('فوائد') || t.includes('نجاح')) return '🌟';
  if (t.includes('خطر') || t.includes('سلبي') || t.includes('ضرر') || t.includes('مشكلة')) return '⚠️';
  if (t.includes('حجز') || t.includes('مواعيد') || t.includes('تسجيل')) return '📅';
  if (t.includes('بحث') || t.includes('معرفة') || t.includes('تحقق')) return '🔍';
  const fallbacks = ['💡', '🔧', '📡', '⌨️', '🖱️', '💻', '📲', '🤖', '⚙️', '🌐', '📶', '💡'];
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) & 0xffff;
  return fallbacks[Math.abs(hash) % fallbacks.length];
}

function getRank(pct: number) {
  if (pct >= 90) return { emoji: '🏆', title: 'بطل', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' };
  if (pct >= 80) return { emoji: '🔥', title: 'خبير', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30' };
  if (pct >= 65) return { emoji: '🌟', title: 'ممتاز', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' };
  if (pct >= 50) return { emoji: '⚡', title: 'متقدم', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' };
  if (pct >= 30) return { emoji: '📚', title: 'متعلم', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' };
  return { emoji: '🌱', title: 'مبتدئ', color: 'text-gray-400', bg: 'bg-gray-500/20 border-gray-500/30' };
}

function getStageMeta(stageIdx: number) {
  return STAGE_META[stageIdx % STAGE_META.length];
}

/* ─── Sound FX ───────────────────────────────────────────── */
type SoundType = 'correct' | 'wrong' | 'golden' | 'select' | 'stage' | 'end' | 'tick';

function useSoundFX(volume: number, enabled: boolean) {
  return useCallback((type: SoundType) => {
    if (!enabled || volume === 0) return;
    try {
      const ctx = new AudioContext();
      const beep = (freq: number, start: number, dur: number, shape: OscillatorType = 'sine', vol = 0.5) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = shape;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(vol * volume, ctx.currentTime + start);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.01);
      };
      switch (type) {
        case 'select':
          beep(700, 0, 0.06, 'sine', 0.25); break;
        case 'correct':
          beep(523, 0,    0.12, 'sine', 0.5);
          beep(659, 0.1,  0.12, 'sine', 0.5);
          beep(784, 0.2,  0.22, 'sine', 0.65); break;
        case 'wrong':
          beep(280, 0,    0.15, 'sawtooth', 0.4);
          beep(190, 0.15, 0.22, 'sawtooth', 0.35); break;
        case 'golden':
          beep(880,  0,    0.08, 'sine', 0.5);
          beep(1100, 0.09, 0.08, 'sine', 0.5);
          beep(1320, 0.18, 0.08, 'sine', 0.5);
          beep(1760, 0.27, 0.25, 'sine', 0.65); break;
        case 'stage':
          beep(440, 0,    0.1, 'sine', 0.5);
          beep(554, 0.11, 0.1, 'sine', 0.5);
          beep(659, 0.22, 0.1, 'sine', 0.5);
          beep(880, 0.33, 0.3, 'sine', 0.6); break;
        case 'end':
          [523, 659, 784, 1047].forEach((f, i) => beep(f, i * 0.13, 0.15, 'sine', 0.55));
          beep(1047, 0.54, 0.55, 'sine', 0.75); break;
        case 'tick':
          beep(1000, 0, 0.05, 'sine', 0.18); break;
      }
      setTimeout(() => ctx.close(), 3000);
    } catch { /* AudioContext not available */ }
  }, [volume, enabled]);
}

/* ─── Component ──────────────────────────────────────────── */
export default function QuizPresenter() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark, toggleDark } = useAuthStore();

  const isNumeric = !!id && /^\d+$/.test(id);

  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ['interactive-quiz', id],
    queryFn: () => isNumeric ? quizzesApi.getById(Number(id)) : quizzesApi.getBySlug(id!),
    enabled: !!id,
  });

  /* questions */
  const [questions, setQuestions] = useState<InteractiveQuestion[]>([]);
  const [shuffled, setShuffled] = useState(false);

  /* navigation */
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);

  /* player */
  const [playerName, setPlayerName] = useState('');
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number; correct: number; total: number; pct: number; date: string }[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  /* screens */
  const [screen, setScreen] = useState<'name' | 'start' | 'stage-transition' | 'play' | 'end'>('name');
  const [pendingStageIdx, setPendingStageIdx] = useState(0);

  /* gamification */
  const [score, setScore] = useState(0);
  const [pointAnim, setPointAnim] = useState<{ v: number; key: number } | null>(null);
  const [motivMsg, setMotivMsg] = useState('');
  const [showMotiv, setShowMotiv] = useState(false);
  const [answeredCorrect, setAnsweredCorrect] = useState<boolean[]>([]);

  /* sound */
  const [soundVolume, setSoundVolume] = useState(() => {
    const v = localStorage.getItem('quiz-sound-volume');
    return v !== null ? Number(v) : 0.6;
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('quiz-sound-enabled') !== 'false';
  });
  const playSound = useSoundFX(soundVolume, soundEnabled);
  const setVolume = (v: number) => { setSoundVolume(v); localStorage.setItem('quiz-sound-volume', String(v)); };
  const toggleSound = () => { const n = !soundEnabled; setSoundEnabled(n); localStorage.setItem('quiz-sound-enabled', String(n)); };

  /* support modal */
  const [supportOpen, setSupportOpen] = useState(false);

  /* view count */
  const [viewCount, setViewCount] = useState<number | null>(null);
  const viewCalledRef = useRef(false);

  /* settings */
  const [showSettings, setShowSettings] = useState(false);
  const [stageCount, setStageCount] = useState(3);
  const [questionsPerStage, setQuestionsPerStage] = useState(0);
  const [mcqPerStage, setMcqPerStage] = useState(0);
  const [tfPerStage, setTfPerStage] = useState(0);
  const [effectiveStageSz, setEffectiveStageSz] = useState(0);
  const [goldenEvery, setGoldenEvery] = useState(10);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* init questions + load settings */
  useEffect(() => {
    if (quiz?.id && !viewCalledRef.current) {
      viewCalledRef.current = true;
      quizzesApi.incrementView(quiz.id).then(setViewCount).catch(() => setViewCount(quiz.viewCount ?? null));
    }
  }, [quiz?.id]);

  useEffect(() => {
    if (quiz?.questions) setQuestions([...quiz.questions]);
    if (quiz?.id) {
      const saved = localStorage.getItem(`quiz-settings-${quiz.id}`);
      if (saved) try {
        const s = JSON.parse(saved);
        if (s.stageCount) setStageCount(s.stageCount);
        if (s.questionsPerStage !== undefined) setQuestionsPerStage(s.questionsPerStage);
        if (s.mcqPerStage  !== undefined) setMcqPerStage(s.mcqPerStage);
        if (s.tfPerStage   !== undefined) setTfPerStage(s.tfPerStage);
        if (s.goldenEvery !== undefined) setGoldenEvery(s.goldenEvery);
        if (s.timerEnabled !== undefined) setTimerEnabled(s.timerEnabled);
        if (s.timerDuration) { setTimerDuration(s.timerDuration); setTimeLeft(s.timerDuration); }
      } catch { }
      const lb = localStorage.getItem(`quiz-leaderboard-${quiz.id}`);
      if (lb) try { setLeaderboard(JSON.parse(lb)); } catch { }
    }
  }, [quiz]);

  /* stage calculations */
  const stageSize = effectiveStageSz > 0 ? effectiveStageSz
    : (questionsPerStage > 0 ? questionsPerStage : Math.max(1, Math.ceil(questions.length / stageCount)));
  const effectiveStageCount = Math.max(1, Math.ceil(questions.length / stageSize));
  const currentStageIdx = Math.floor(currentIdx / stageSize);
  const stageStart = currentStageIdx * stageSize;
  const stageEnd = Math.min(stageStart + stageSize, questions.length);
  const idxInStage = currentIdx - stageStart;
  const stageProgress = stageSize > 0 ? ((idxInStage + 1) / stageSize) * 100 : 0;
  const overallProgress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;
  const isGolden = goldenEvery > 0 && (currentIdx + 1) % goldenEvery === 0;
  const pointsForQ = isGolden ? 20 : 10;
  const currentMeta = getStageMeta(currentStageIdx);

  /* timer */
  const playSoundRef = useRef(playSound);
  useEffect(() => { playSoundRef.current = playSound; }, [playSound]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(timerDuration);
    if (timerEnabled) {
      setTimerRunning(true);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current!); setTimerRunning(false); setRevealed(true); return 0; }
          playSoundRef.current('tick');
          return t - 1;
        });
      }, 1000);
    }
  }, [timerEnabled, timerDuration]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  /* navigate to question */
  const goTo = useCallback((idx: number) => {
    setCurrentIdx(idx);
    setRevealed(false);
    setSelectedOption(null);
    setAnimKey(k => k + 1);
    resetTimer();
  }, [resetTimer]);

  /* reveal answer */
  const reveal = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    setRevealed(true);
  }, []);

  /* handle correct/wrong */
  const handleRevealResult = useCallback((optionClicked?: number) => {
    if (revealed) return;
    if (optionClicked !== undefined) setSelectedOption(optionClicked);
    reveal();

    const q = questions[currentIdx];
    const correct = optionClicked !== undefined && optionClicked === getCorrectIdx(q);

    if (correct || optionClicked === undefined) {
      const pts = correct ? pointsForQ : 0;
      if (pts > 0) {
        setScore(s => s + pts);
        setPointAnim({ v: pts, key: Date.now() });
        setTimeout(() => setPointAnim(null), 1200);
      }
      if (correct) playSound(isGolden ? 'golden' : 'correct');
      else playSound('wrong');
      const msg = isGolden ? rand(GOLDEN_MSGS) : correct ? rand(CORRECT_MSGS) : rand(WRONG_MSGS);
      setMotivMsg(msg);
      setShowMotiv(true);
      setTimeout(() => setShowMotiv(false), 2000);
      setAnsweredCorrect(prev => { const a = [...prev]; a[currentIdx] = correct; return a; });
    } else {
      playSound('wrong');
      const msg = rand(WRONG_MSGS);
      setMotivMsg(msg);
      setShowMotiv(true);
      setTimeout(() => setShowMotiv(false), 2000);
      setAnsweredCorrect(prev => { const a = [...prev]; a[currentIdx] = false; return a; });
    }
  }, [revealed, questions, currentIdx, pointsForQ, isGolden, reveal, playSound]);

  const saveResultToLeaderboard = useCallback((finalScore: number, correct: number) => {
    if (!quiz || !playerName) return;
    const pct = Math.round((correct / questions.length) * 100);
    const entry = { name: playerName, score: finalScore, correct, total: questions.length, pct, date: new Date().toLocaleDateString('ar-EG') };
    const key = `quiz-leaderboard-${quiz.id}`;
    const existing: { name: string; score: number; correct: number; total: number; pct: number; date: string }[] = JSON.parse(localStorage.getItem(key) ?? '[]');
    const updated = [...existing, entry].sort((a, b) => b.score - a.score).slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updated));
    setLeaderboard(updated);
  }, [quiz, playerName, questions.length]);

  /* next question / stage transition / end */
  const next = useCallback(() => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= questions.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      const correct = answeredCorrect.filter(Boolean).length;
      saveResultToLeaderboard(score, correct);
      playSound('end');
      setScreen('end');
      return;
    }

    const nextStage = Math.floor(nextIdx / stageSize);
    if (nextStage > currentStageIdx && effectiveStageCount > 1) {
      playSound('stage');
      setPendingStageIdx(nextStage);
      setScreen('stage-transition');
    } else {
      goTo(nextIdx);
    }
  }, [currentIdx, questions.length, stageSize, currentStageIdx, effectiveStageCount, goTo, answeredCorrect, score, saveResultToLeaderboard, playSound]);

  const prev = useCallback(() => { if (currentIdx > 0) goTo(currentIdx - 1); }, [currentIdx, goTo]);

  /* keyboard */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (screen !== 'play' || showSettings) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); if (revealed) next(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); prev(); }
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!revealed) reveal(); else next(); }
      if (!revealed && e.key >= '1' && e.key <= '4') { setSelectedOption(Number(e.key) - 1); playSound('select'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, showSettings, revealed, next, prev, reveal]);

  const applyOrder = (base: InteractiveQuestion[]) => {
    const { ordered, stageSize } = buildMixedOrder(base, mcqPerStage, tfPerStage, stageCount);
    setQuestions(ordered);
    setEffectiveStageSz(stageSize);
  };

  const startQuiz = () => {
    applyOrder(questions);
    setScreen('play');
    setCurrentIdx(0);
    setScore(0);
    setAnsweredCorrect([]);
    setShowLeaderboard(false);
    resetTimer();
  };

  const restart = () => {
    const base = shuffled
      ? [...(quiz?.questions ?? [])].sort(() => Math.random() - 0.5)
      : [...(quiz?.questions ?? [])];
    applyOrder(base);
    setScreen('start');
    setCurrentIdx(0);
    setScore(0);
    setAnsweredCorrect([]);
    setShowLeaderboard(false);
  };

  const toggleShuffle = () => {
    const next = !shuffled;
    setShuffled(next);
    const base = next
      ? [...(quiz?.questions ?? [])].sort(() => Math.random() - 0.5)
      : [...(quiz?.questions ?? [])];
    applyOrder(base);
    setCurrentIdx(0);
  };

  /* ── Loading / Error (shown before name screen too) ── */
  if (isLoading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error || !quiz) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-4 text-white">
      <p className="text-xl">لم يتم العثور على الاختبار</p>
      <button onClick={() => navigate('/admin/quizzes')} className="btn-primary">العودة</button>
    </div>
  );

  /* ── NAME SCREEN ── */
  if (screen === 'name') return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]' : 'bg-gradient-to-br from-[#0f172a] via-[#312e81] to-[#0f172a]'}`} dir="rtl">
      <TechBackground />
      <button onClick={toggleDark} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors z-10">
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div className="text-center max-w-md w-full relative z-10">
        {quiz.coverImageUrl ? (
          <img src={quiz.coverImageUrl} alt={quiz.title} className="w-24 h-24 rounded-3xl object-cover mx-auto mb-6 shadow-2xl border-2 border-white/20" onError={e => { e.currentTarget.style.display='none'; }} />
        ) : (
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/30">
            <User size={40} className="text-white" />
          </div>
        )}
        <h1 className="text-3xl font-black text-white mb-1">أهلاً بك! 👋</h1>
        <p className="text-primary-300 font-bold text-lg mb-1">{quiz.title}</p>
        {viewCount !== null && (
          <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs mb-2">
            <Eye size={13} className="text-primary-400" />
            <span>{viewCount.toLocaleString('ar-EG')} مشارك</span>
          </div>
        )}
        <p className="text-gray-400 text-sm mb-8">اكتب اسمك لتسجيل نتيجتك في لوحة المتصدرين</p>
        <div className="space-y-4">
          <input
            value={playerNameInput}
            onChange={e => setPlayerNameInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && playerNameInput.trim()) { setPlayerName(playerNameInput.trim()); setScreen('start'); } }}
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white text-xl text-center placeholder-gray-500 focus:outline-none focus:border-primary-400 focus:bg-white/15 transition-all"
            placeholder="اكتب اسمك هنا..."
            autoFocus
          />
          <button
            onClick={() => { if (playerNameInput.trim()) { setPlayerName(playerNameInput.trim()); setScreen('start'); } }}
            disabled={!playerNameInput.trim()}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-600 text-white text-xl font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-2xl shadow-primary-500/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🚀 ابدأ الاختبار
          </button>
          <button onClick={() => { setPlayerName('زائر'); setScreen('start'); }} className="w-full py-3 bg-white/5 text-gray-400 rounded-2xl hover:bg-white/10 transition-colors text-sm">
            تخطي — بدون تسجيل
          </button>
        </div>

        {leaderboard.length > 0 && (
          <div className="mt-8">
            <h3 className="text-gray-400 text-sm mb-3 flex items-center gap-2 justify-center"><Trophy size={14} /> أفضل المتصدرين</h3>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5">
                  <span className="text-lg w-6 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</span>
                  <span className="flex-1 text-white text-sm font-medium text-right">{r.name}</span>
                  <span className="text-yellow-400 font-bold text-sm">{r.score}</span>
                  <span className="text-gray-500 text-xs">{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6">
          <SocialBanner
            teacherName={quiz.teacherName}
            teacherImage={quiz.teacherImage}
            whatsappUrl={quiz.whatsappUrl}
            youtubeUrl={quiz.youtubeUrl}
            facebookUrl={quiz.facebookUrl}
          />
        </div>
      </div>
      <button onClick={() => navigate(-1)} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
    </div>
  );

  /* ── START SCREEN ── */
  if (screen === 'start') return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]' : 'bg-gradient-to-br from-[#0f172a] via-[#312e81] to-[#0f172a]'}`} dir="rtl">
      <TechBackground />
      <div className="text-center max-w-2xl w-full relative z-10">
        {quiz.coverImageUrl ? (
          <img src={quiz.coverImageUrl} alt={quiz.title} className="w-28 h-28 rounded-3xl object-cover mx-auto mb-6 shadow-2xl border-2 border-white/20" onError={e => { e.currentTarget.style.display='none'; }} />
        ) : (
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/30">
            <span className="text-5xl">🎓</span>
          </div>
        )}
        {playerName && playerName !== 'زائر' && (
          <p className="text-primary-300 text-lg mb-2">مرحباً <span className="font-black text-white">{playerName}</span> 👋</p>
        )}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">{quiz.title}</h1>
        {(quiz.subject || quiz.grade) && (
          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            {quiz.subject && <span className="px-4 py-1.5 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium border border-primary-500/30">{quiz.subject}</span>}
            {quiz.grade && <span className="px-4 py-1.5 bg-accent-500/20 text-accent-300 rounded-full text-sm font-medium border border-accent-500/30">{quiz.grade}</span>}
          </div>
        )}

        <div className="flex items-center justify-center gap-8 my-6">
          <div className="text-center">
            <div className="text-4xl font-black text-white">{questions.length}</div>
            <div className="text-gray-400 text-sm">سؤال</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-4xl font-black text-white">{effectiveStageCount}</div>
            <div className="text-gray-400 text-sm">مراحل</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-4xl font-black text-white">{questions.length * 10}</div>
            <div className="text-gray-400 text-sm">نقطة كاملة</div>
          </div>
          {viewCount !== null && (
            <>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-4xl font-black text-primary-300">
                  <Eye size={28} className="text-primary-400" />
                  <span>{viewCount.toLocaleString('ar-EG')}</span>
                </div>
                <div className="text-gray-400 text-sm">مشارك</div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto">
          {Array.from({ length: Math.min(effectiveStageCount, 5) }).map((_, i) => {
            const meta = getStageMeta(i);
            return (
              <div key={i} className={`p-3 rounded-2xl bg-gradient-to-br ${meta.color} text-white text-center opacity-90`}>
                <div className="text-2xl mb-1">{meta.emoji}</div>
                <div className="text-xs font-bold">{meta.name}</div>
                <div className="text-xs opacity-75">{stageSize} سؤال</div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-8 text-xs text-gray-500">
          <span>⌨️ Space = إجابة/تالي</span>
          <span>← → = تنقل</span>
          <span>1-4 = اختيار</span>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={startQuiz} className="px-10 py-4 bg-gradient-to-r from-primary-500 to-accent-600 text-white text-xl font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-2xl shadow-primary-500/30 active:scale-95">
            🚀 ابدأ الاختبار
          </button>
          <button onClick={() => setShowSettings(s => !s)} className="px-6 py-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-colors">
            <Settings size={22} />
          </button>
        </div>

        {showSettings && (
          <SettingsPanel
            stageCount={stageCount} setStageCount={setStageCount}
            questionsPerStage={questionsPerStage} setQuestionsPerStage={setQuestionsPerStage}
            mcqPerStage={mcqPerStage} setMcqPerStage={setMcqPerStage}
            tfPerStage={tfPerStage} setTfPerStage={setTfPerStage}
            goldenEvery={goldenEvery} setGoldenEvery={setGoldenEvery}
            timerEnabled={timerEnabled} setTimerEnabled={setTimerEnabled}
            timerDuration={timerDuration} setTimerDuration={setTimerDuration}
            shuffled={shuffled} toggleShuffle={toggleShuffle}
            soundVolume={soundVolume} setVolume={setVolume}
            soundEnabled={soundEnabled} toggleSound={toggleSound}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
      <button onClick={() => navigate(-1)} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
    </div>
  );

  /* ── STAGE TRANSITION ── */
  if (screen === 'stage-transition') {
    const meta = getStageMeta(pendingStageIdx);
    const prevCorrect = answeredCorrect.filter(Boolean).length;
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]' : 'bg-gradient-to-br from-[#0f172a] via-[#312e81] to-[#0f172a]'}`} dir="rtl"
        style={{ animation: 'fadeIn 0.5s ease' }}>
        <TechBackground />
        <div className="text-center max-w-lg w-full relative z-10">
          <div className="text-8xl mb-4" style={{ animation: 'bounceIn 0.6s ease' }}>{meta.emoji}</div>
          <h2 className={`text-4xl font-black mb-2 bg-gradient-to-r ${meta.color} bg-clip-text text-transparent`}>
            المرحلة {pendingStageIdx + 1}
          </h2>
          <p className="text-2xl text-white font-bold mb-2">{meta.name}</p>
          <p className="text-gray-400 mb-6">أسئلة {pendingStageIdx * stageSize + 1} — {Math.min((pendingStageIdx + 1) * stageSize, questions.length)}</p>

          <div className="bg-white/5 rounded-2xl p-5 mb-6 flex items-center justify-around">
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-400">{score}</div>
              <div className="text-gray-400 text-sm">نقاطك</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-400">{prevCorrect}</div>
              <div className="text-gray-400 text-sm">إجابة صحيحة</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-black text-white">{Math.round(overallProgress)}%</div>
              <div className="text-gray-400 text-sm">اكتملت</div>
            </div>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2 mb-6">
            <div className="h-2 bg-gradient-to-l from-primary-400 to-accent-500 rounded-full transition-all duration-1000" style={{ width: `${overallProgress}%` }} />
          </div>

          <p className="text-gray-300 text-lg mb-6">{rand(CORRECT_MSGS)} استمر!</p>

          <button
            onClick={() => { setScreen('play'); goTo(pendingStageIdx * stageSize); }}
            className={`px-10 py-4 bg-gradient-to-r ${meta.color} text-white text-xl font-bold rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-2xl`}
          >
            {meta.emoji} ابدأ المرحلة {pendingStageIdx + 1}
          </button>
        </div>
      </div>
    );
  }

  /* ── END SCREEN ── */
  if (screen === 'end') {
    const totalCorrect = answeredCorrect.filter(Boolean).length;
    const pct = Math.round((totalCorrect / questions.length) * 100);
    const rank = getRank(pct);
    const msg = pct >= 80 ? 'ممتاز! أداء رائع' : pct >= 60 ? 'جيد جداً! واصل' : pct >= 40 ? 'كويس، حاول تحسّن' : 'احتاج مزيد من المراجعة';
    const myPos = leaderboard.findIndex(r => r.name === playerName && r.score === score);
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 overflow-y-auto relative ${isDark ? 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]' : 'bg-gradient-to-br from-[#0a1628] via-[#0f3460] to-[#16213e]'}`} dir="rtl">
        <div className="text-center max-w-xl w-full py-6">
          <div className="text-7xl mb-3">{rank.emoji}</div>
          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border text-lg font-black mb-4 ${rank.bg} ${rank.color}`}>
            {rank.title}
          </div>
          {playerName && playerName !== 'زائر' && (
            <p className="text-white text-xl font-bold mb-1">{playerName}</p>
          )}
          <h2 className="text-3xl font-black text-white mb-1">انتهى الاختبار!</h2>
          <p className="text-gray-400 mb-5">{quiz.title}</p>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-5 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl font-black text-yellow-400">{score}</div>
              <div className="text-gray-400 text-sm">النقاط</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-emerald-400">{totalCorrect}/{questions.length}</div>
              <div className="text-gray-400 text-sm">صحيح</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white">{pct}%</div>
              <div className="text-gray-400 text-sm">النسبة</div>
            </div>
          </div>

          <div className="w-full bg-white/10 rounded-full h-3 mb-2 overflow-hidden">
            <div className={`h-3 rounded-full transition-all duration-1000 ${pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-gray-300 mb-5">{msg}</p>

          {myPos >= 0 && (
            <p className="text-sm text-gray-400 mb-4">ترتيبك في المتصدرين: <span className="text-white font-bold">#{myPos + 1}</span></p>
          )}

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="mb-5">
              <button onClick={() => setShowLeaderboard(s => !s)} className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-white transition-colors mb-3">
                <Trophy size={14} className="text-yellow-400" />
                {showLeaderboard ? 'إخفاء' : 'عرض'} لوحة المتصدرين ({leaderboard.length})
              </button>
              {showLeaderboard && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {leaderboard.slice(0, 10).map((r, i) => {
                    const isMe = r.name === playerName && r.score === score && i === myPos;
                    return (
                      <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${isMe ? 'bg-primary-500/20 border border-primary-500/40' : 'bg-white/5'}`}>
                        <span className="text-base w-6 text-center shrink-0">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</span>
                        <span className={`flex-1 font-medium text-sm text-right ${isMe ? 'text-primary-300' : 'text-white'}`}>{r.name}{isMe ? ' (أنت)' : ''}</span>
                        <span className="text-yellow-400 font-bold text-sm">{r.score}</span>
                        <span className={`text-xs font-bold ${getRank(r.pct).color}`}>{getRank(r.pct).title}</span>
                        <span className="text-gray-500 text-xs">{r.pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            {quiz?.teacherWhatsappNumber && (
              <button 
                onClick={() => {
                  const msg = `🎓 نتيجة الاختبار: ${quiz.title}\n\n👤 الطالب: ${playerName || 'زائر'}\n📊 النقاط: ${score}\n✅ صحيح: ${totalCorrect}/${questions.length}\n📈 النسبة: ${pct}%\n\n${pct >= 80 ? '🌟 ممتاز!' : pct >= 60 ? '👍 جيد!' : pct >= 40 ? '📚 حاول مجدداً' : '💪 استمر في المراجعة'}`;
                  const url = `https://wa.me/${quiz.teacherWhatsappNumber}?text=${encodeURIComponent(msg)}`;
                  window.open(url, '_blank');
                }}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                إرسال النتيجة
              </button>
            )}
            <button onClick={restart} className="px-8 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-400 transition-colors flex items-center gap-2">
              <RotateCcw size={18} /> إعادة
            </button>
            <button onClick={() => setScreen('name')} className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 flex items-center gap-2">
              <User size={18} /> لاعب جديد
            </button>
            <button onClick={() => navigate('/admin/quizzes')} className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 flex items-center gap-2">
              <Home size={18} /> الاختبارات
            </button>
          </div>

          <div className="mt-6">
            <SocialBanner
              teacherName={quiz?.teacherName}
              teacherImage={quiz?.teacherImage}
              whatsappUrl={quiz?.whatsappUrl}
              youtubeUrl={quiz?.youtubeUrl}
              facebookUrl={quiz?.facebookUrl}
            />
          </div>

        </div>
      </div>
    );
  }

  /* ── PLAY SCREEN ── */
  const q = questions[currentIdx];
  const options = q ? parseOptions(q.options) : [];
  const correctIdx = q ? getCorrectIdx(q) : -1;
  const timerPct = timerDuration > 0 ? (timeLeft / timerDuration) * 100 : 0;

  return (
    <div className={`min-h-screen flex flex-col select-none relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]' : 'bg-gradient-to-br from-[#0a1628] via-[#0f3460] to-[#16213e]'}`} dir="rtl">
      <TechBackground />

      {/* Top progress bar */}
      <div className={`h-1.5 w-full shrink-0 bg-white/10`}>
        <div className={`h-full bg-gradient-to-l ${currentMeta.color} transition-all duration-500`} style={{ width: `${stageProgress}%` }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => navigate('/admin/quizzes')} className="p-2 text-gray-500 hover:text-white transition-colors rounded-xl hover:bg-white/10 shrink-0"><X size={20} /></button>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r ${currentMeta.color} text-white text-sm font-bold shrink-0`}>
            <span>{currentMeta.emoji}</span>
            <span>المرحلة {currentStageIdx + 1}</span>
          </div>
          <span className="text-gray-300 text-xs font-medium hidden sm:block">{quiz.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Score */}
          <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/20 text-yellow-400 font-black text-lg">
            <Star size={14} fill="currentColor" />
            {score}
            {pointAnim && (
              <span key={pointAnim.key} className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-300 font-black text-base whitespace-nowrap"
                style={{ animation: 'floatUp 1.2s ease forwards' }}>
                +{pointAnim.v}
              </span>
            )}
          </div>

          {/* Timer */}
          {timerEnabled && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-400 bg-red-500/20' : 'text-white bg-white/10'}`}>
              <Timer size={14} />
              {String(timeLeft).padStart(2, '0')}
            </div>
          )}

          {/* Question counter */}
          <span className="text-gray-400 text-sm bg-white/10 px-3 py-1.5 rounded-xl font-medium">
            {idxInStage + 1} / {stageEnd - stageStart}
          </span>

          <button onClick={toggleDark} className="p-2 text-gray-500 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={toggleSound} className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${soundEnabled ? 'text-primary-400' : 'text-gray-600'}`}>
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button onClick={() => setShowSettings(s => !s)} className="p-2 text-gray-500 hover:text-white rounded-xl hover:bg-white/10 transition-colors"><Settings size={18} /></button>
        </div>
      </div>

      {/* Timer bar */}
      {timerEnabled && (
        <div className="px-4 mb-1 shrink-0">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${timerPct > 50 ? 'bg-emerald-500' : timerPct > 25 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${timerPct}%` }} />
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute top-16 left-4 md:left-auto md:right-16 z-50 bg-[#1e293b] border border-white/10 rounded-2xl p-5 w-72 shadow-2xl" dir="rtl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">الإعدادات</h3>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
          </div>
          <SettingsPanel
            stageCount={stageCount} setStageCount={setStageCount}
            questionsPerStage={questionsPerStage} setQuestionsPerStage={setQuestionsPerStage}
            mcqPerStage={mcqPerStage} setMcqPerStage={setMcqPerStage}
            tfPerStage={tfPerStage} setTfPerStage={setTfPerStage}
            goldenEvery={goldenEvery} setGoldenEvery={setGoldenEvery}
            timerEnabled={timerEnabled} setTimerEnabled={setTimerEnabled}
            timerDuration={timerDuration} setTimerDuration={setTimerDuration}
            shuffled={shuffled} toggleShuffle={toggleShuffle}
            soundVolume={soundVolume} setVolume={setVolume}
            soundEnabled={soundEnabled} toggleSound={toggleSound}
            onClose={() => setShowSettings(false)}
            inline
          />
        </div>
      )}

      {/* Golden question badge */}
      {isGolden && (
        <div className="px-4 mb-2 shrink-0">
          <div className="flex items-center justify-center gap-2 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm font-bold"
            style={{ animation: 'pulse 1s infinite' }}>
            ⭐ سؤال ذهبي — نقطتان مضاعفتان (+{pointsForQ})
          </div>
        </div>
      )}

      {/* Motivational message */}
      {showMotiv && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="text-3xl md:text-5xl font-black text-white text-center px-8 py-4 rounded-2xl bg-black/40 backdrop-blur-sm"
            style={{ animation: 'popIn 0.3s ease, fadeOut 0.5s ease 1.5s forwards' }}>
            {motivMsg}
          </div>
        </div>
      )}

      {/* Question + Options Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-2 overflow-hidden">
        <div key={animKey} className="w-full max-w-2xl" style={{ animation: 'slideUp 0.35s ease-out' }}>

          {/* Question card */}
          <div className={`relative rounded-3xl border mb-4 overflow-hidden ${isGolden ? 'border-yellow-400/50' : 'border-white/10'}`}>
            {/* Gradient top bar */}
            <div className={`h-1 w-full ${isGolden ? 'bg-gradient-to-l from-yellow-400 to-amber-500' : `bg-gradient-to-l ${currentMeta.color}`}`} />
            <div className={`p-5 md:p-6 backdrop-blur-sm ${isGolden ? 'bg-yellow-500/10' : 'bg-white/5'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full bg-gradient-to-r ${currentMeta.color} text-white`}>
                    {currentIdx + 1} / {questions.length}
                  </span>
                  {isGolden && <span className="text-xs text-yellow-400 font-bold animate-pulse">⭐ ذهبي ×2</span>}
                </div>
              </div>
              <div className="flex items-start gap-2" dir="rtl">
                <span className="text-2xl shrink-0 mt-0.5 leading-none">{q ? getQuestionIcon(q.text) : '💡'}</span>
                <p className="text-base md:text-lg font-bold text-white leading-snug text-right flex-1">{q?.text}</p>
              </div>
            </div>
          </div>

          {/* Options */}
          {q?.type === 'TrueFalse' ? (
            <div key={`tf-${animKey}`} className="grid grid-cols-2 gap-3" style={{ animation: 'slideUp 0.45s ease-out' }}>
              {[{ val: 'true', label: '✅ صح', bg: 'bg-emerald-500', hover: 'hover:bg-emerald-400', dim: 'bg-emerald-900/30' },
                { val: 'false', label: '❌ خطأ', bg: 'bg-red-500', hover: 'hover:bg-red-400', dim: 'bg-red-900/30' }]
                .map((opt, i) => {
                  const isCorrect = revealed && correctIdx === i;
                  const isWrong = revealed && selectedOption === i && !isCorrect;
                  return (
                    <button key={opt.val}
                      onClick={() => { if (!revealed) { playSound('select'); setSelectedOption(i); handleRevealResult(i); } }}
                      className={`py-12 rounded-2xl font-black text-2xl text-white transition-all duration-300
                        ${revealed ? isCorrect ? `${opt.bg} scale-105 ring-4 ring-white/40 shadow-2xl` : `${opt.dim} opacity-40` : `${opt.bg} ${opt.hover} active:scale-95 cursor-pointer shadow-lg`}
                        ${isWrong ? 'ring-2 ring-red-300/50' : ''}`}
                    >
                      {opt.label}{isCorrect && <div className="text-xl mt-1">✨</div>}
                    </button>
                  );
                })}
            </div>
          ) : (
            <div key={`mcq-${animKey}`} className="grid grid-cols-2 gap-2.5" style={{ animation: 'slideUp 0.45s ease-out' }}>
              {options.map((opt, i) => {
                const color = OPTION_COLORS[i] ?? OPTION_COLORS[0];
                const isCorrect = revealed && correctIdx === i;
                const isSelected = selectedOption === i;
                return (
                  <button key={i}
                    onClick={() => { if (!revealed) { playSound('select'); setSelectedOption(i); handleRevealResult(i); } }}
                    className={`p-5 rounded-2xl text-right transition-all duration-300
                      ${revealed ? isCorrect ? `${color.bg} scale-[1.03] ring-4 ring-white/40 shadow-2xl` : `${color.dim} opacity-40` : `${color.bg} ${color.hover} active:scale-95 cursor-pointer shadow-md ${isSelected ? 'ring-4 ring-white/50 scale-[1.02]' : ''}`}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-black/25 flex items-center justify-center text-white font-black text-sm shrink-0">{color.letter}</span>
                      <span className="text-white font-bold text-base leading-snug">{opt}</span>
                      {isCorrect && <span className="mr-auto text-lg shrink-0">✨</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="shrink-0 px-4 py-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={prev} disabled={currentIdx === 0} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm">
            <ChevronRight size={18} /> السابق
          </button>
          <button
            onClick={revealed ? next : reveal}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 justify-center ${revealed ? `bg-gradient-to-r ${currentMeta.color} text-white hover:opacity-90 shadow-lg` : 'bg-white/15 text-white hover:bg-white/25'}`}
          >
            {revealed
              ? (currentIdx === questions.length - 1 ? '🏁 إنهاء' : <><ChevronLeft size={18} /> السؤال التالي</>)
              : <><Eye size={16} /> إظهار الإجابة</>}
          </button>
          <button onClick={next} disabled={currentIdx === questions.length - 1} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm">
            التالي <ChevronLeft size={18} />
          </button>
        </div>
        <p className="text-center text-gray-600 text-xs mt-1.5">Space = إجابة/تالي · ← → = تنقل · 1-4 = اختيار</p>
      </div>

      {/* Social Banner */}
      <div className="shrink-0 px-4 pb-1">
        <div className="max-w-2xl mx-auto">
          <SocialBanner
            compact
            teacherName={quiz?.teacherName}
            teacherImage={quiz?.teacherImage}
            whatsappUrl={quiz?.whatsappUrl}
            youtubeUrl={quiz?.youtubeUrl}
            facebookUrl={quiz?.facebookUrl}
          />
        </div>
      </div>

      {/* Support Button */}
      {(quiz?.showSupportButton ?? true) && (
        <div className="shrink-0 px-4 pb-3">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setSupportOpen(true)}
              className="w-full py-2.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
            >
              <span>💛</span> ادعم المحتوى المجاني
            </button>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {supportOpen && <SupportModal onClose={() => setSupportOpen(false)} />}

      <style>{`
        @keyframes slideUp   { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        @keyframes floatUp   { from { opacity:1; transform:translateX(-50%) translateY(0) } to { opacity:0; transform:translateX(-50%) translateY(-40px) } }
        @keyframes popIn     { from { opacity:0; transform:translate(-50%,-50%) scale(0.5) } to { opacity:1; transform:translate(-50%,-50%) scale(1) } }
        @keyframes fadeOut   { from { opacity:1 } to { opacity:0 } }
        @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
        @keyframes bounceIn  { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes techFloat { from { transform: translateY(0px) rotate(var(--r,0deg)); } to { transform: translateY(-12px) rotate(var(--r,0deg)); } }
      `}</style>
    </div>
  );
}

/* ─── Tech Background ───────────────────────────────────── */
function TechBackground() {
  const items = [
    { icon: '💻', x: 5,  y: 10, s: 2.5, r: -15, d: 0   },
    { icon: '📱', x: 20, y: 5,  s: 2.0, r:  10, d: 0.4 },
    { icon: '⌨️', x: 85, y: 15, s: 2.2, r:   5, d: 0.8 },
    { icon: '🖥️', x: 70, y: 8,  s: 2.8, r:  -8, d: 1.2 },
    { icon: '⚙️', x: 45, y: 3,  s: 2.0, r:  20, d: 1.6 },
    { icon: '🔌', x: 92, y: 42, s: 1.8, r: -25, d: 0.2 },
    { icon: '📡', x: 8,  y: 52, s: 2.3, r:  12, d: 0.6 },
    { icon: '🤖', x: 75, y: 58, s: 2.5, r: -10, d: 1.0 },
    { icon: '💾', x: 30, y: 78, s: 2.0, r:  15, d: 1.4 },
    { icon: '🔬', x: 60, y: 83, s: 2.2, r:  -5, d: 1.8 },
    { icon: '📶', x: 15, y: 86, s: 1.8, r:  18, d: 0.3 },
    { icon: '🎮', x: 90, y: 78, s: 2.4, r: -12, d: 0.9 },
    { icon: '🔋', x: 50, y: 91, s: 2.0, r:   8, d: 1.5 },
    { icon: '🖱️', x: 38, y: 44, s: 1.6, r: -20, d: 0.7 },
    { icon: '📲', x: 55, y: 22, s: 2.0, r:  14, d: 1.1 },
    { icon: '🔧', x: 2,  y: 75, s: 2.1, r: -18, d: 2.0 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {items.map((item, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.s}rem`,
            transform: `rotate(${item.r}deg)`,
            opacity: 0.05,
            animation: `techFloat ${4 + (i % 3)}s ease-in-out infinite alternate`,
            animationDelay: `${item.d}s`,
          }}
        >{item.icon}</span>
      ))}
    </div>
  );
}

/* ─── Support Modal ─────────────────────────────────────── */
function SupportModal({ onClose }: { onClose: () => void }) {
  const [copiedVf, setCopiedVf] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const NUMBER = '01096066818';

  const copy = (which: 'vf' | 'ip') => {
    navigator.clipboard.writeText(NUMBER);
    if (which === 'vf') { setCopiedVf(true); setTimeout(() => setCopiedVf(false), 2000); }
    else                { setCopiedIp(true); setTimeout(() => setCopiedIp(false), 2000); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 text-right"
        style={{ background: 'linear-gradient(145deg,#1e1b4b,#1a1a2e)', border: '1px solid rgba(255,255,255,0.12)', animation: 'popIn .3s cubic-bezier(.34,1.56,.64,1) both' }}
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="text-center mb-5">
          <div className="text-4xl mb-2">💛</div>
          <h2 className="text-white font-black text-lg leading-snug">ادعم المحتوى التعليمي المجاني</h2>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            كل الاختبارات والمراجعات هنا مجانية بالكامل 🎓<br />
            لو المحتوى ده فادك وحابب تساعدنا نكمل، أي دعم بيفرق معانا جداً 🙏
          </p>
        </div>

        <div className="space-y-3">
          {/* Vodafone Cash */}
          <div className="rounded-2xl p-3.5" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => copy('vf')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95"
                style={{ background: copiedVf ? '#16a34a' : '#ef4444', color: '#fff' }}
              >
                {copiedVf ? '✓ تم النسخ' : 'نسخ'}
              </button>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <div>
                  <p className="text-red-400 font-bold text-sm">فودافون كاش</p>
                  <p className="text-white font-mono font-bold text-base tracking-widest">{NUMBER}</p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#ef4444' }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.5 17.5c-3.038 0-5.5-2.462-5.5-5.5S8.462 6.5 11.5 6.5c1.8 0 3.39.868 4.383 2.203l-1.763 1.763C13.582 9.573 12.596 9 11.5 9 9.567 9 8 10.567 8 12.5S9.567 16 11.5 16c1.676 0 3.082-1.119 3.41-2.696H11.5v-2h5.476c.033.296.024.579.024.696 0 3.038-2.462 5.5-5.5 5.5z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* InstaPay */}
          <div className="rounded-2xl p-3.5" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => copy('ip')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95"
                style={{ background: copiedIp ? '#16a34a' : '#8b5cf6', color: '#fff' }}
              >
                {copiedIp ? '✓ تم النسخ' : 'نسخ'}
              </button>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <div>
                  <p className="text-purple-400 font-bold text-sm">انستا باي</p>
                  <p className="text-white font-mono font-bold text-base tracking-widest">{NUMBER}</p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#8b5cf6,#a855f7)' }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M13.5 2C8.806 2 5 5.806 5 10.5c0 1.986.687 3.813 1.828 5.262L5 22l6.413-1.797A8.46 8.46 0 0013.5 20.5c4.694 0 8.5-3.806 8.5-8.5S18.194 2 13.5 2zm0 15.5a6.975 6.975 0 01-3.552-.97l-.255-.152-2.643.74.74-2.563-.166-.265A6.959 6.959 0 016.5 10.5C6.5 6.634 9.634 3.5 13.5 3.5S20.5 6.634 20.5 10.5 17.366 17.5 13.5 17.5zm3.857-5.232c-.211-.106-1.25-.617-1.443-.687-.193-.07-.334-.106-.475.106-.141.211-.546.687-.669.828-.123.141-.246.159-.457.053-.211-.106-.89-.328-1.695-1.046-.626-.559-1.049-1.249-1.172-1.46-.123-.212-.013-.326.092-.432.095-.095.211-.246.317-.37.106-.123.141-.211.211-.352.07-.141.035-.264-.018-.37-.053-.106-.475-1.145-.651-1.568-.171-.411-.345-.355-.475-.362l-.405-.007c-.141 0-.37.053-.563.264-.194.211-.738.722-.738 1.761s.756 2.043.861 2.184c.106.141 1.488 2.271 3.604 3.185.504.218.898.348 1.204.445.506.161.967.138 1.331.084.406-.061 1.25-.511 1.426-1.005.176-.494.176-.917.123-1.005-.053-.088-.194-.141-.405-.246z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-4">جزاك الله خيراً على دعمك 🤍</p>
      </div>
    </div>
  );
}

/* ─── Social Banner ──────────────────────────────────────── */
const DEFAULT_TEACHER = {
  name:      'مستر عامر تمراز',
  image:     '/teacher2.png',
  whatsapp:  'https://whatsapp.com/channel/0029Vb7KXht7oQhjG0RCMp3m',
  youtube:   'https://www.youtube.com/@AmerTimraz',
  facebook:  'https://www.facebook.com/MrAmerTimraz',
};

interface SocialBannerProps {
  compact?: boolean;
  teacherName?: string | null;
  teacherImage?: string | null;
  whatsappUrl?: string | null;
  youtubeUrl?: string | null;
  facebookUrl?: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';
function resolveUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

function SocialBanner({ compact = false, teacherName, teacherImage, whatsappUrl, youtubeUrl, facebookUrl }: SocialBannerProps) {
  const name     = teacherName  || DEFAULT_TEACHER.name;
  const image    = resolveUrl(teacherImage) || DEFAULT_TEACHER.image;
  const whatsapp = whatsappUrl  || DEFAULT_TEACHER.whatsapp;
  const youtube  = youtubeUrl   || DEFAULT_TEACHER.youtube;
  const facebook = facebookUrl  || DEFAULT_TEACHER.facebook;

  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl text-right ${compact ? 'p-3' : 'p-4'}`} dir="rtl">
      {!compact && (
        <div className="flex items-center gap-3 mb-3">
          <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shrink-0" />
          <div>
            <p className="text-white font-black text-sm leading-tight">{name}</p>
            <p className="text-gray-400 text-xs mt-0.5">للمزيد من الاختبارات والمراجعات تابعنا</p>
          </div>
        </div>
      )}
      <div className={`flex flex-wrap gap-2 ${compact ? 'justify-between items-center' : 'justify-end'}`}>
        {compact && (
          <div className="flex items-center gap-2 shrink-0">
            <img src={image} alt={name} className="w-11 h-11 rounded-full object-cover border-2 border-white/30 shrink-0" />
            <span className="text-gray-200 text-sm font-bold">{name}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
        <a href={whatsapp} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: '#25D366' }}>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.549 4.09 1.504 5.815L0 24l6.335-1.48A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.374l-.36-.213-3.76.876.916-3.653-.234-.374A9.818 9.818 0 1112 21.818z"/></svg>
          واتساب 🔔
        </a>
        <a href={youtube} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: '#FF0000' }}>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white shrink-0"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
          يوتيوب
        </a>
        <a href={facebook} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: '#1877F2' }}>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white shrink-0"><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.027 4.388 11.025 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.098 24 18.1 24 12.073z"/></svg>
          فيسبوك
        </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Settings Panel ──────────────────────────────────────── */
function SettingsPanel({ stageCount, setStageCount, questionsPerStage, setQuestionsPerStage, mcqPerStage, setMcqPerStage, tfPerStage, setTfPerStage, goldenEvery, setGoldenEvery, timerEnabled, setTimerEnabled, timerDuration, setTimerDuration, shuffled, toggleShuffle, soundVolume, setVolume, soundEnabled, toggleSound, onClose, inline }: {
  stageCount: number; setStageCount: (n: number) => void;
  questionsPerStage: number; setQuestionsPerStage: (n: number) => void;
  mcqPerStage: number; setMcqPerStage: (n: number) => void;
  tfPerStage: number; setTfPerStage: (n: number) => void;
  goldenEvery: number; setGoldenEvery: (n: number) => void;
  timerEnabled: boolean; setTimerEnabled: (b: boolean) => void;
  timerDuration: number; setTimerDuration: (n: number) => void;
  shuffled: boolean; toggleShuffle: () => void;
  soundVolume: number; setVolume: (v: number) => void;
  soundEnabled: boolean; toggleSound: () => void;
  onClose: () => void;
  inline?: boolean;
}) {
  const [typeTab, setTypeTab] = useState<'general' | 'mcq' | 'tf'>('general');

  return (
    <div className={`${inline ? '' : 'mt-6 bg-white/5 border border-white/10 rounded-2xl p-5 max-w-sm mx-auto text-right'} space-y-4`} dir="rtl">
      {!inline && <div className="flex items-center justify-between"><h3 className="text-white font-bold flex items-center gap-2"><Layers size={16} /> الإعدادات</h3><button onClick={onClose} className="text-gray-400 hover:text-white"><X size={16} /></button></div>}

      {/* Type Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {([['general', '⚙️ عام'], ['mcq', '📝 اختيارات'], ['tf', '✅ صح/خطأ']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTypeTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${typeTab === t ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {typeTab === 'general' && (<>
        <div>
          <label className="text-gray-300 text-sm block mb-2">عدد المراحل: <span className="text-white font-bold">{stageCount}</span></label>
          <input type="range" min={1} max={10} value={stageCount} onChange={e => setStageCount(Number(e.target.value))} className="w-full accent-primary-500" />
          <div className="flex justify-between text-xs text-gray-500 mt-1"><span>مرحلة 1</span><span>10 مراحل</span></div>
        </div>
        <div>
          <label className="text-gray-300 text-sm block mb-2">أسئلة كل مرحلة (إجمالي): <span className="text-white font-bold">{questionsPerStage === 0 ? 'تلقائي' : questionsPerStage}</span></label>
          <input type="range" min={0} max={50} step={5} value={questionsPerStage} onChange={e => setQuestionsPerStage(Number(e.target.value))} className="w-full accent-primary-500" />
          <div className="flex justify-between text-xs text-gray-500 mt-1"><span>تلقائي</span><span>50 سؤال</span></div>
          <p className="text-xs text-gray-600 mt-1">يُتجاهل إذا حدّدت اختيارات أو صح/خطأ بشكل منفصل</p>
        </div>
      </>)}

      {typeTab === 'mcq' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <span className="text-2xl">📝</span>
            <div>
              <p className="text-white text-sm font-bold">أسئلة الاختيارات</p>
              <p className="text-gray-400 text-xs">عدد أسئلة الاختيار من متعدد في كل مرحلة</p>
            </div>
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-2">اختيارات كل مرحلة: <span className="text-blue-400 font-bold">{mcqPerStage === 0 ? 'تلقائي' : mcqPerStage}</span></label>
            <input type="range" min={0} max={40} step={1} value={mcqPerStage} onChange={e => setMcqPerStage(Number(e.target.value))} className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>تلقائي</span><span>40 سؤال</span></div>
          </div>
        </div>
      )}

      {typeTab === 'tf' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-white text-sm font-bold">أسئلة صح وخطأ</p>
              <p className="text-gray-400 text-xs">عدد أسئلة الصح والخطأ في كل مرحلة (تظهر أولاً)</p>
            </div>
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-2">صح/خطأ كل مرحلة: <span className="text-emerald-400 font-bold">{tfPerStage === 0 ? 'تلقائي' : tfPerStage}</span></label>
            <input type="range" min={0} max={30} step={1} value={tfPerStage} onChange={e => setTfPerStage(Number(e.target.value))} className="w-full accent-emerald-500" />
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>تلقائي</span><span>30 سؤال</span></div>
          </div>
        </div>
      )}

      <div>
        <label className="text-gray-300 text-sm block mb-2">السؤال الذهبي كل: <span className="text-yellow-400 font-bold">{goldenEvery === 0 ? 'معطّل' : `${goldenEvery} سؤال`}</span></label>
        <input type="range" min={0} max={20} step={1} value={goldenEvery} onChange={e => setGoldenEvery(Number(e.target.value))} className="w-full accent-yellow-500" />
        <div className="flex justify-between text-xs text-gray-500 mt-1"><span>معطّل</span><span>كل 20</span></div>
      </div>

      {/* Sound Control */}
      <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between">
          <label className="text-gray-300 text-sm flex items-center gap-2">
            {soundEnabled ? <Volume2 size={14} className="text-primary-400" /> : <VolumeX size={14} className="text-gray-500" />}
            المؤثرات الصوتية
          </label>
          <button onClick={toggleSound} className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-primary-500' : 'bg-gray-600'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${soundEnabled ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
        {soundEnabled && (
          <div className="flex items-center gap-2">
            <VolumeX size={12} className="text-gray-500 shrink-0" />
            <input type="range" min={0} max={1} step={0.05} value={soundVolume}
              onChange={e => setVolume(Number(e.target.value))}
              className="flex-1 accent-primary-500 h-1" />
            <Volume2 size={12} className="text-primary-400 shrink-0" />
            <span className="text-xs text-gray-400 w-8 text-center">{Math.round(soundVolume * 100)}%</span>
          </div>
        )}
      </div>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-gray-300 text-sm">تفعيل المؤقت</span>
        <button onClick={() => setTimerEnabled(!timerEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${timerEnabled ? 'bg-primary-500' : 'bg-gray-600'}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${timerEnabled ? 'right-0.5' : 'left-0.5'}`} />
        </button>
      </label>

      {timerEnabled && (
        <div>
          <label className="text-gray-300 text-sm block mb-2">مدة السؤال: <span className="text-white font-bold">{timerDuration}ث</span></label>
          <input type="range" min={10} max={120} step={5} value={timerDuration} onChange={e => setTimerDuration(Number(e.target.value))} className="w-full accent-primary-500" />
        </div>
      )}

      <button onClick={toggleShuffle} className={`w-full py-2 rounded-xl text-sm font-medium flex items-center gap-2 justify-center transition-colors ${shuffled ? 'bg-primary-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
        <Shuffle size={14} /> {shuffled ? 'إلغاء العشوائية' : 'ترتيب عشوائي'}
      </button>
    </div>
  );
}
