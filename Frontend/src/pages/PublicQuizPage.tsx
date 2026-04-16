import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle, XCircle, Trophy, Clock, Target } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { quizzesApi } from '../api/quizzes';
import { useNavigate, useParams } from 'react-router-dom';
import type { InteractiveQuestion } from '../types';
import { saveLevelAttempt } from '../utils/levelAssessments';

/* ─── Helpers ────────────────────────────────────────────── */

/** Strip all metadata markers from text:
 *  - ::[align=ltr], ::[align=rtl], ::[align=auto]
 *  - ::[code]
 */
function stripMetaMarkers(raw: string): { text: string; isCode: boolean; align: 'auto' | 'rtl' | 'ltr' } {
  let text = raw;
  let isCode = false;
  let align: 'auto' | 'rtl' | 'ltr' = 'auto';

  // Extract ::[code] marker
  if (text.includes('::[code]')) {
    isCode = true;
    text = text.replace(/::\[code\]/gi, '');
  }

  // Extract ::[align=...] marker
  const alignMatch = text.match(/::\[align=(ltr|rtl|auto)\]/i);
  if (alignMatch) {
    align = alignMatch[1].toLowerCase() as 'ltr' | 'rtl' | 'auto';
    text = text.replace(/::\[align=(ltr|rtl|auto)\]/gi, '');
  }

  return { text: text.trim(), isCode, align };
}

/** Parse options JSON string into array */
function parseOptions(raw?: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

/** Clean an option for display: handle all metadata markers */
function cleanOption(raw: string): { text: string; isCode: boolean; align: 'auto' | 'rtl' | 'ltr' } {
  let text = raw;
  let isCode = false;
  let align: 'auto' | 'rtl' | 'ltr' = 'auto';

  // 1. Strip CODE: prefix
  if (text.startsWith('CODE:')) {
    isCode = true;
    text = text.slice(5);
  }

  // 2. Strip RTL:/LTR: prefix
  if (text.startsWith('RTL:')) {
    align = 'rtl';
    text = text.slice(4);
  } else if (text.startsWith('LTR:')) {
    align = 'ltr';
    text = text.slice(4);
  }

  // 3. Strip inline metadata markers (::[code], ::[align=...])
  const meta = stripMetaMarkers(text);
  text = meta.text;
  if (meta.isCode) isCode = true;
  if (meta.align !== 'auto') align = meta.align;

  // 4. Auto-detect code-like content (HTML tags, JS code, etc.)
  const trimmed = text.trim();
  if (!isCode && (
    /^<[a-zA-Z]/.test(trimmed) ||                           // HTML tags like <img, <div
    /^[a-zA-Z_$][a-zA-Z0-9_$.]*\s*\(/.test(trimmed) ||     // function calls like console.log(
    /^[a-zA-Z0-9_.<>(){}[\]=;:,"'\s\/\\-]+$/.test(trimmed) && /[<>(){}[\]=;]/.test(trimmed)  // code with special chars
  )) {
    isCode = true;
    if (align === 'auto') align = 'ltr';
  }

  return { text: trimmed, isCode, align };
}

/** Get the correct answer index (same logic as QuizPresenter) */
function getCorrectIdx(q: InteractiveQuestion): number {
  if (q.type === 'TrueFalse') return q.correctAnswer === 'true' ? 0 : 1;
  const n = Number(q.correctAnswer);
  return isNaN(n) ? -1 : n;
}

export default function PublicQuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    const playerData = localStorage.getItem('public-levels-player');
    if (!playerData) {
      navigate('/public-levels');
    }
  }, [navigate]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && !showFinalResult) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, showFinalResult]);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizzesApi.getById(Number(quizId)),
    enabled: !!quizId,
  });

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const options = useMemo(() => parseOptions(currentQuestion?.options), [currentQuestion]);
  const cleanedOptions = useMemo(() => options.map(cleanOption), [options]);
  const correctIdx = currentQuestion ? getCorrectIdx(currentQuestion) : -1;
  const progress = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;

  const handleAnswer = () => {
    if (selectedOptionIndex === null) return;

    const isCorrect = selectedOptionIndex === correctIdx;
    if (isCorrect) {
      setScore(score + 1);
      setCorrectCount(prev => prev + 1);
    }
    setShowResult(true);
  };

  // Start timer when quiz loads
  useEffect(() => {
    if (quiz && !showFinalResult) {
      setIsTimerRunning(true);
    }
    return () => setIsTimerRunning(false);
  }, [quiz, showFinalResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedOptionIndex(null);

    if (currentQuestionIndex < (quiz?.questions.length ?? 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz finished — save attempt for level unlocking
      if (quiz) {
        const totalCorrect = correctCount;
        const totalQuestions = quiz.questions.length;
        saveLevelAttempt(undefined, {
          quizId: quiz.id,
          quizTitle: quiz.title,
          score: totalCorrect,
          total: totalQuestions,
          pct: 0, // will be calculated in saveLevelAttempt
        });
      }
      setShowFinalResult(true);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (!quiz) return <div className="text-center py-20">Quiz not found</div>;

  if (showFinalResult) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 mb-6 shadow-2xl">
              <Trophy size={48} />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              {passed ? '🎉 مبروك!' : 'حاول مرة أخرى'}
            </h1>
            <p className="text-purple-200 mb-6">
              {passed ? `أنت نجحت في ${quiz.title}` : `أنت لم تنجح في ${quiz.title}`}
            </p>

            <div className="bg-white/10 rounded-2xl p-6 mb-6">
              <p className="text-4xl font-bold text-white mb-2">{percentage}%</p>
              <p className="text-purple-200">Score: {score}/{quiz.questions.length}</p>
              <p className="text-purple-300 text-sm mt-1">الوقت: {formatTime(timer)}</p>
            </div>

            {passed && (
              <button
                onClick={() => navigate(`/public-certificate/${quiz.id}`)}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity mb-3"
              >
                عرض الشهادة
              </button>
            )}

            <button
              onClick={() => navigate('/public-levels')}
              className="w-full py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
            >
              العودة للمستويات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg">
                  <Clock size={16} className="text-yellow-400" />
                  <span className="text-white text-sm">{formatTime(timer)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg">
                  <Target size={16} className="text-green-400" />
                  <span className="text-white text-sm">{score}/{quiz.questions.length}</span>
                </div>
                <span className="text-purple-200 text-sm">
                  {currentQuestionIndex + 1} / {quiz.questions.length}
                </span>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <div
              className="text-xl text-white leading-relaxed"
              dangerouslySetInnerHTML={{ __html: stripMetaMarkers(currentQuestion?.text || '').text }}
            />
          </div>

          <div className="space-y-3 mb-6">
            {cleanedOptions.map((option, index) => {
              const isSelected = selectedOptionIndex === index;
              const isCorrect = showResult && index === correctIdx;
              const isWrong = showResult && isSelected && index !== correctIdx;

              return (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedOptionIndex(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl transition-all ${
                    isSelected && !showResult
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold'
                      : isCorrect
                      ? 'bg-green-500/20 border-2 border-green-500 text-white'
                      : isWrong
                      ? 'bg-red-500/20 border-2 border-red-500 text-white'
                      : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  }`}
                  style={{ direction: option.align === 'ltr' ? 'ltr' : option.align === 'rtl' ? 'rtl' : undefined }}
                >
                  {option.isCode ? (
                    <code className="font-mono text-base bg-black/20 px-2 py-0.5 rounded" dir="ltr">
                      {option.text}
                    </code>
                  ) : (
                    <span>{option.text}</span>
                  )}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mb-6 text-center">
              {selectedOptionIndex === correctIdx ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle size={24} />
                  <span className="font-bold">إجابة صحيحة! 🔥</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-red-400">
                    <XCircle size={24} />
                    <span className="font-bold">إجابة خاطئة!</span>
                  </div>
                  <p className="text-green-300 text-sm">
                    الإجابة الصحيحة: {correctIdx >= 0 && correctIdx < cleanedOptions.length
                      ? cleanedOptions[correctIdx].text
                      : '—'}
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={showResult ? handleNext : handleAnswer}
            disabled={selectedOptionIndex === null && !showResult}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-lg disabled:opacity-50"
          >
            {showResult ? (
              <>
                التالي
                <ArrowRight size={20} />
              </>
            ) : (
              'إرسال الإجابة'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
