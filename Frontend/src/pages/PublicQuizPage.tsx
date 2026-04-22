import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle, XCircle, Trophy, Clock, Target, Code2, ChevronLeft, Download, X, MessageCircle } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { quizzesApi } from '../api/quizzes';
import { useNavigate, useParams } from 'react-router-dom';
import type { InteractiveQuestion } from '../types';
import { saveLevelAttempt, buildCertificateId } from '../utils/levelAssessments';
import { toPng } from 'html-to-image';

/* ─── Helpers ────────────────────────────────────────────── */

/** Strip all metadata markers from text:
 *  - [align=ltr]::, [align=rtl]::, [align=auto]::
 *  - ::[code] and [code]::
 */
function stripMetaMarkers(raw: string): { text: string; isCode: boolean; align: 'auto' | 'rtl' | 'ltr' } {
  let text = raw;
  let isCode = false;
  let align: 'auto' | 'rtl' | 'ltr' = 'auto';

  // Extract [align=...]:: marker (format used in admin panel)
  const alignMatch = text.match(/\[align=(ltr|rtl|auto)\]::/i);
  if (alignMatch) {
    align = alignMatch[1].toLowerCase() as 'ltr' | 'rtl' | 'auto';
    text = text.replace(/\[align=(ltr|rtl|auto)\]::/gi, '');
  }

  // Extract ::[align=...] marker (legacy format)
  const legacyAlignMatch = text.match(/::\[align=(ltr|rtl|auto)\]/i);
  if (legacyAlignMatch) {
    align = legacyAlignMatch[1].toLowerCase() as 'ltr' | 'rtl' | 'auto';
    text = text.replace(/::\[align=(ltr|rtl|auto)\]/gi, '');
  }

  // Extract [code]:: marker
  if (text.includes('[code]::')) {
    isCode = true;
    text = text.replace(/\[code\]::/gi, '');
  }

  // Extract ::[code] marker (legacy format)
  if (text.includes('::[code]')) {
    isCode = true;
    text = text.replace(/::\[code\]/gi, '');
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

  // 2. Strip [code]:: prefix (format used in admin panel)
  if (text.startsWith('[code]::')) {
    isCode = true;
    text = text.slice(8);
  }

  // 3. Strip RTL:/LTR: prefix
  if (text.startsWith('RTL:')) {
    align = 'rtl';
    text = text.slice(4);
  } else if (text.startsWith('LTR:')) {
    align = 'ltr';
    text = text.slice(4);
  }

  // 4. Strip inline metadata markers (::[code], ::[align=...])
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
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

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

  const handleNext = async () => {
    setShowResult(false);
    setSelectedOptionIndex(null);

    if (currentQuestionIndex < (quiz?.questions.length ?? 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz finished — save attempt for level unlocking and submit to backend
      if (quiz) {
        const totalCorrect = correctCount;
        const totalQuestions = quiz.questions.length;
        const percentage = Math.round((totalCorrect / totalQuestions) * 100);

        console.log('[DEBUG] Quiz finished:', {
          totalCorrect,
          totalQuestions,
          percentage,
          score,
          correctCount
        });

        // Submit to backend leaderboard
        const playerData = JSON.parse(localStorage.getItem('public-levels-player') || '{}');
        console.log('[DEBUG] Player data:', playerData);
        if (playerData.name) {
          // Save to localStorage for level unlocking
          const userId = playerData.uniqueId;
          console.log('[DEBUG] Saving level attempt for userId:', userId);
          saveLevelAttempt(userId, {
            quizId: quiz.id,
            quizTitle: quiz.title,
            score: totalCorrect,
            total: totalQuestions,
            pct: 0, // will be calculated in saveLevelAttempt
          });
          console.log('[DEBUG] Level attempt saved');
          try {
            await quizzesApi.submitResult(quiz.id, {
              sessionId: playerData.uniqueId || `USER${Date.now()}`,
              name: playerData.name,
              score: totalCorrect,
              correct: totalCorrect,
              total: totalQuestions,
              pct: percentage,
            });
            console.log('Result submitted successfully');
          } catch (err) {
            console.error('Failed to submit result:', err);
          }
        }
      }
      setShowFinalResult(true);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (!quiz) return <div className="text-center py-20">Quiz not found</div>;

  if (showFinalResult) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed = percentage >= 70;
    const playerData = JSON.parse(localStorage.getItem('public-levels-player') || '{}');
    const certId = buildCertificateId(undefined, quiz.id, new Date().toISOString());

    const handleDownload = async () => {
      if (!certRef.current) return;
      setDownloading(true);
      try {
        const dataUrl = await toPng(certRef.current, {
          cacheBust: true,
          pixelRatio: 2,
        });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `Mr-Amer-Certificate-${quizId}.png`;
        a.click();
      } catch {
        window.print();
      } finally {
        setDownloading(false);
      }
    };

    const handleWhatsApp = async () => {
      if (!certRef.current) return;

      try {
        // Generate certificate image
        const dataUrl = await toPng(certRef.current, {
          cacheBust: true,
          pixelRatio: 2,
        });

        // Download image
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'certificate.png';
        a.click();

        // Open WhatsApp directly
        const message = `السلام عليكم مستر عامر، أنا ${playerData.name} وأتممت اختبار ${quiz.title} بنجاح وحصلت على ${percentage}%، أرجو منك عرض الشهادة على القناة`;
        const whatsappUrl = `https://wa.me/201096066818?text=${encodeURIComponent(message + '\n\n(يرجى إرفاق صورة الشهادة المحملة)')}`;
        window.open(whatsappUrl, '_blank');
      } catch (err) {
        console.error('Share failed:', err);
        // Fallback to text-only WhatsApp
        const message = `السلام عليكم مستر عامر، أنا ${playerData.name} وأتممت اختبار ${quiz.title} بنجاح وحصلت على ${percentage}%، أرجو منك عرض الشهادة على القناة`;
        const whatsappUrl = `https://wa.me/201096066818?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
    };

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
                onClick={() => setShowCertificateModal(true)}
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

        {/* Certificate Modal */}
        {showCertificateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-900 p-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">الشهادة</h2>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="p-4">
                {/* Certificate Preview */}
                <div
                  ref={certRef}
                  className="relative overflow-hidden rounded-2xl p-8 md:p-10 shadow-2xl border border-yellow-300/30 bg-gradient-to-br from-[#070b18] via-[#0f1933] to-[#070b18] max-w-4xl mx-auto"
                  style={{ minHeight: '600px' }}
                >
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_12%_18%,#facc15_0,transparent_32%),radial-gradient(circle_at_88%_80%,#38bdf8_0,transparent_28%)]" />
                  <div className="absolute inset-4 rounded-xl border border-white/15" />
                  <div className="absolute inset-0 pointer-events-none opacity-10 text-cyan-200 font-mono text-xs">
                    <span className="absolute top-16 right-20">{`</>`}</span>
                    <span className="absolute top-24 left-20">{`{}`}</span>
                    <span className="absolute bottom-20 right-20">JS</span>
                    <span className="absolute bottom-28 left-20">function()</span>
                  </div>

                  <div className="relative z-10 text-center">
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-3 py-2">
                        <img
                          src="/teacher2.png"
                          alt="مستر عامر تمراز"
                          className="w-14 h-14 rounded-lg object-cover border border-white/30"
                        />
                        <div className="text-right">
                          <p className="text-xs text-cyan-200">إشراف</p>
                          <p className="text-sm font-bold text-white">مستر عامر تمراز</p>
                        </div>
                      </div>
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-[#0a0f1f] flex items-center justify-center shadow-lg border border-yellow-300">
                        <span className="text-3xl">🛡️</span>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm tracking-[0.22em] text-yellow-200 mb-2">QUREO JAVASCRIPT CERTIFICATE</p>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">شهادة إتمام مستوى</h1>
                    <p className="text-cyan-200 mb-8">مقدمة من منصة مستر عامر تمراز</p>

                    <p className="text-base text-gray-200 mb-1">تُمنح هذه الشهادة إلى</p>
                    <p className="text-3xl md:text-4xl font-black text-yellow-300 mb-8">{playerData.name}</p>

                    <div className="mx-auto max-w-3xl rounded-xl bg-white/5 border border-white/15 px-4 py-4 mb-8">
                      <p className="text-sm text-gray-300 mb-1">لاستكمال اختبار</p>
                      <p className="text-xl md:text-2xl font-bold text-white">{quiz.title}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border-t border-white/15 pt-5">
                      <div className="md:text-right text-center">
                        <p className="text-xs text-gray-400 mb-2">اعتماد المنصة</p>
                        <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/35 bg-emerald-400/10 px-3 py-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-xs font-semibold text-emerald-200">Verified by Mr Amer Platform</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="mx-auto w-24 h-24 rounded-full border-4 border-yellow-300/70 bg-yellow-300/10 flex items-center justify-center shadow-lg">
                          <div className="text-center">
                            <p className="text-[10px] tracking-widest text-yellow-200">OFFICIAL</p>
                            <p className="text-lg">🏆</p>
                          </div>
                        </div>
                      </div>

                      <div className="md:text-left text-center">
                        <p className="text-xs text-gray-400 mb-2">توقيع المشرف</p>
                        <div className="inline-block border-b border-white/30 min-w-[150px] pb-1">
                          <p className="text-sm font-semibold text-white">Mr Amer Timraz</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 text-xs md:text-sm text-gray-300 space-y-1">
                      <p>Certificate ID: <span className="font-semibold text-yellow-300">{certId}</span></p>
                      <p>Issued At: {new Date().toLocaleString('ar-EG')}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {downloading ? 'جاري التحميل...' : 'تحميل الشهادة'}
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} />
                    إرسال لمستر عامر
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>اختبار تفاعلي | منصة الأستاذ عامر تمراز</title>
        <meta name="description" content="اختبر معلوماتك في البرمجة والذكاء الاصطناعي — اختبارات تفاعلية لطلاب أول ثانوي مع شهادات عند النجاح." />
        <meta property="og:title" content="اختبار تفاعلي | منصة الأستاذ عامر تمراز" />
        <meta property="og:description" content="اختبر معلوماتك في البرمجة والذكاء الاصطناعي — اختبارات تفاعلية مع شهادات عند النجاح." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.amertimraz.com/teacher.png" />
        <meta name="twitter:title" content="اختبار تفاعلي | منصة الأستاذ عامر تمراز" />
        <meta name="twitter:description" content="اختبر معلوماتك في البرمجة والذكاء الاصطناعي — اختبارات تفاعلية مع شهادات عند النجاح." />
        <meta name="twitter:image" content="https://www.amertimraz.com/teacher.png" />
      </Helmet>
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

          {/* Question Box - Dark style like admin panel */}
          <div className="mb-6">
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-700">
              <div
                className="text-lg text-white leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: stripMetaMarkers(currentQuestion?.text || '').text }}
              />
            </div>
          </div>

          {/* Options - Styled like admin panel */}
          <div className="space-y-2 mb-6">
            {cleanedOptions.map((option, index) => {
              const isSelected = selectedOptionIndex === index;
              const isCorrect = showResult && index === correctIdx;
              const isWrong = showResult && isSelected && index !== correctIdx;

              return (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedOptionIndex(index)}
                  disabled={showResult}
                  className={`w-full p-3 rounded-lg transition-all flex items-center justify-between group ${
                    isSelected && !showResult
                      ? 'bg-yellow-400/20 border-2 border-yellow-400 text-white'
                      : isCorrect
                      ? 'bg-green-500/20 border-2 border-green-500 text-white'
                      : isWrong
                      ? 'bg-red-500/20 border-2 border-red-500 text-white'
                      : option.isCode
                      ? 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-yellow-400/50'
                      : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-yellow-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1" style={{ direction: option.align === 'ltr' ? 'ltr' : option.align === 'rtl' ? 'rtl' : 'rtl' }}>
                    {option.isCode ? (
                      <div className="flex items-center gap-2 bg-slate-900 text-cyan-300 px-3 py-1.5 rounded-lg font-mono text-sm flex-1">
                        <Code2 size={14} />
                        <span>{option.text}</span>
                      </div>
                    ) : (
                      <span className="text-base">{option.text}</span>
                    )}
                  </div>
                  <ChevronLeft size={16} className={`text-slate-400 ${isSelected ? 'text-yellow-400' : ''}`} />
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
    </>
  );
}
