import { useMemo, useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Award, Lock, Unlock, Gamepad2, Trophy, Share2, CheckCircle, Download, X, MessageCircle } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { quizzesApi } from '../api/quizzes';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  extractLevelNumber,
  getStoredAttempts,
  canOpenLevel,
  buildCertificateId,
} from '../utils/levelAssessments';
import { toPng } from 'html-to-image';

const LEVEL_SUBJECT = 'JavaScript Levels';
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية',
  'القليوبية', 'الغربية', 'بورسعيد', 'دمياط', 'الإسماعيلية', 'كفر الشيخ',
  'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر',
  'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء'
];

export default function PublicLevelsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [screen, setScreen] = useState<'start' | 'levels'>('start');
  const [playerName, setPlayerName] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['interactive-quizzes'],
    queryFn: quizzesApi.getAll,
  });

  useEffect(() => {
    // Check if player already registered
    const playerData = localStorage.getItem('public-levels-player');
    if (playerData) {
      const data = JSON.parse(playerData);
      setPlayerName(data.name);
      setGovernorate(data.governorate);
      setScreen('levels');
    }

    // Check for shared link
    const sharedId = searchParams.get('id');
    if (sharedId) {
      const storedData = localStorage.getItem(`public-levels-${sharedId}`);
      if (storedData) {
        const data = JSON.parse(storedData);
        setPlayerName(data.name);
        setGovernorate(data.governorate);
        setScreen('levels');
      }
    }
  }, [searchParams]);

  const levelQuizzes = useMemo(() => {
    const filtered = quizzes.filter(q => q.subject === LEVEL_SUBJECT);
    return filtered.sort((a, b) => {
      const levelA = extractLevelNumber(a.title) ?? 999;
      const levelB = extractLevelNumber(b.title) ?? 999;
      return levelA - levelB;
    });
  }, [quizzes]);

  // Get stored attempts to determine which levels are completed
  const playerData = JSON.parse(localStorage.getItem('public-levels-player') || '{}');
  const userId = playerData.uniqueId;
  const attempts = useMemo(() => getStoredAttempts(userId), [screen, levelQuizzes, userId]);

  // Count completed (passed) levels
  const completedLevels = useMemo(() => {
    return levelQuizzes.filter(q => attempts[q.id]?.passed).length;
  }, [levelQuizzes, attempts]);

  // Calculate total score for logged user
  const totalScore = useMemo(() => {
    return levelQuizzes.reduce((sum, quiz) => {
      const attempt = attempts[quiz.id];
      if (attempt?.passed) {
        return sum + attempt.score;
      }
      return sum;
    }, 0);
  }, [levelQuizzes, attempts]);

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const allResults = await Promise.all(
        levelQuizzes.map(q => quizzesApi.getLeaderboard(q.id))
      );
      // Combine results by player name, summing scores
      const playerMap = new Map<string, { name: string; score: number }>();
      allResults.flat().forEach((r: any) => {
        const existing = playerMap.get(r.name);
        if (existing) {
          existing.score += r.score;
        } else {
          playerMap.set(r.name, { name: r.name, score: r.score });
        }
      });
      return Array.from(playerMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    },
    enabled: levelQuizzes.length > 0,
  });

  const handleStart = () => {
    if (!playerName.trim() || !governorate) {
      alert('الرجاء إدخال اسمك واختيار محافظتك');
      return;
    }
    const uniqueId = `USER${Date.now()}${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('public-levels-player', JSON.stringify({ name: playerName, governorate, uniqueId }));
    localStorage.setItem(`public-levels-${uniqueId}`, JSON.stringify({ name: playerName, governorate }));
    setScreen('levels');
  };

  const handleShare = () => {
    const playerData = JSON.parse(localStorage.getItem('public-levels-player') || '{}');
    const shareUrl = `${window.location.origin}/public-levels?id=${playerData.uniqueId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('تم نسخ رابط المشاركة!');
  };

  if (isLoading) return <LoadingSpinner size="lg" />;

  if (screen === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 mb-6 shadow-2xl">
                <Gamepad2 size={40} />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2">🎮 تحدي JavaScript</h1>
              <p className="text-purple-200">اختبر معلوماتك واجمع شهاداتك</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-white">اكتب اسمك:</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  placeholder="أدخل اسمك"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-white">اختر محافظتك:</label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="" className="bg-slate-900">اختر محافظتك</option>
                  {GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov} className="bg-slate-900">{gov}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStart}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-lg"
              >
                ابدأ التحدي 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 mb-6 shadow-2xl">
            <Award size={40} />
          </div>
          {screen === 'levels' && playerName && (
            <div className="mb-4 text-2xl font-bold text-yellow-300">
              أهلاً بك يا {playerName} من محافظة {governorate}
            </div>
          )}
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">مستويات JavaScript</h1>
            {screen === 'levels' && (
              <>
                <button
                  onClick={handleShare}
                  className="p-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
                  title="مشاركة التحدي"
                >
                  <Share2 size={20} className="text-white" />
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('public-levels-player');
                    setScreen('start');
                    setPlayerName('');
                    setGovernorate('');
                  }}
                  className="p-2 bg-red-500/20 border border-red-500/50 rounded-xl hover:bg-red-500/30 transition-colors"
                  title="تغيير الاسم"
                >
                  <Unlock size={20} className="text-red-400" />
                </button>
              </>
            )}
          </div>
          <p className="text-lg text-purple-200">اختبر معلوماتك واجمع شهاداتك</p>

          {/* Progress Summary */}
          {levelQuizzes.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur rounded-2xl px-6 py-3 border border-white/20">
              <div className="flex items-center gap-2">
                <span className="text-purple-200 text-sm">مستويات مكتملة:</span>
                <span className="text-yellow-400 font-bold text-lg">{completedLevels}</span>
                <span className="text-white">/</span>
                <span className="text-gray-300 font-bold text-lg">{levelQuizzes.length}</span>
              </div>
              <div className="flex items-center gap-2 border-l border-white/20 pl-3">
                <span className="text-purple-200 text-sm">إجمالي النقاط:</span>
                <span className="text-green-400 font-bold text-lg">{totalScore}</span>
              </div>
              <div className="w-24 bg-white/10 rounded-full h-2 mr-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${levelQuizzes.length > 0 ? (completedLevels / levelQuizzes.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard Section */}
        {leaderboard.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy size={24} className="text-yellow-400" />
                🏆 {showAllLeaderboard ? 'جميع المتسابقين' : `أفضل ${Math.min(10, leaderboard.length)}`}
              </h2>
              {leaderboard.length > 10 && (
                <button
                  onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
                  className="px-4 py-2 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors text-sm"
                >
                  {showAllLeaderboard ? 'عرض أول 10' : 'عرض الكل'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {(showAllLeaderboard ? leaderboard : leaderboard.slice(0, 10)).map((player: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400/30' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300/20 to-gray-400/20 border-2 border-gray-300/30' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400/20 to-orange-600/20 border-2 border-orange-400/30' :
                    'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <span className={`text-3xl font-bold mb-2 ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-orange-400' :
                      'text-gray-500'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </span>
                    <span className="text-white font-semibold text-sm mb-2">{player.name}</span>
                    <span className="text-yellow-400 font-bold">{player.score} نقطة</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {levelQuizzes.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">لا توجد مستويات متاحة حالياً</p>
          </div>
        ) : (
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/10 -translate-x-1/2 hidden md:block" />
            <div
              className="absolute left-1/2 top-0 w-1 bg-gradient-to-b from-yellow-400 to-orange-500 -translate-x-1/2 hidden md:block transition-all duration-1000"
              style={{ height: `${levelQuizzes.length > 0 ? (completedLevels / levelQuizzes.length) * 100 : 0}%` }}
            />

            {/* Game Map */}
            <div className="space-y-4 py-4">
              {levelQuizzes.map((quiz, index) => {
                const level = extractLevelNumber(quiz.title) ?? (index + 1);
                const isUnlocked = canOpenLevel(quiz, levelQuizzes, userId);
                const isPassed = attempts[quiz.id]?.passed;
                const attemptData = attempts[quiz.id];
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={quiz.id}
                    className={`relative flex items-center ${isEven ? 'justify-start md:justify-end' : 'justify-start md:justify-start'}`}
                  >
                    {/* Level Node */}
                    <div
                      className={`relative z-10 transition-all duration-500 hover:scale-105 ${isEven ? 'md:mr-12' : 'md:ml-12'} ${!isUnlocked ? 'opacity-50' : 'cursor-pointer'}`}
                      onClick={() => isUnlocked && navigate(`/public-quiz/${quiz.id}`)}
                    >
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl ${
                          isPassed
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-4 border-green-300'
                            : isUnlocked
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 border-4 border-yellow-300 animate-pulse'
                            : 'bg-gray-800 text-gray-500 border-4 border-gray-700'
                        }`}
                      >
                        {isPassed ? <CheckCircle size={32} /> : level}
                      </div>

                      {/* Level Card */}
                      <div
                        className={`mt-2 p-4 rounded-xl backdrop-blur-lg border-2 transition-all ${
                          isPassed
                            ? 'bg-green-500/10 border-green-400/50'
                            : isUnlocked
                            ? 'bg-white/10 border-yellow-400/50 hover:border-yellow-400'
                            : 'bg-gray-800/50 border-gray-700'
                        } max-w-xs`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {isPassed ? (
                            <CheckCircle size={20} className="text-green-400" />
                          ) : isUnlocked ? (
                            <Unlock size={20} className="text-green-400" />
                          ) : (
                            <Lock size={20} className="text-gray-400" />
                          )}
                          <h3 className="text-lg font-bold text-white">{quiz.title}</h3>
                        </div>
                        <p className="text-sm text-purple-200 mb-1">{quiz.questionCount} سؤال</p>
                        
                        {/* Show score if attempted */}
                        {attemptData && (
                          <p className={`text-sm mb-2 ${isPassed ? 'text-green-300' : 'text-red-300'}`}>
                            النتيجة: {attemptData.pct}% ({attemptData.score}/{attemptData.total})
                          </p>
                        )}

                        {isUnlocked && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/public-quiz/${quiz.id}`);
                              }}
                              className="flex-1 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                              <Play size={16} />
                              {isPassed ? 'إعادة' : 'ابدأ'}
                            </button>
                            {isPassed && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedQuiz(quiz);
                                  setShowCertificateModal(true);
                                }}
                                className="flex-1 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <Award size={16} />
                                الشهادة
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connector Dot */}
                    <div className={`absolute left-1/2 top-10 w-4 h-4 rounded-full -translate-x-1/2 hidden md:block ${
                      isPassed ? 'bg-green-400' : isUnlocked ? 'bg-yellow-400' : 'bg-gray-600'
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        {showCertificateModal && selectedQuiz && (
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
                <CertificateModalContent
                  quiz={selectedQuiz}
                  certRef={certRef}
                  downloading={downloading}
                  setDownloading={setDownloading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CertificateModalContent({ quiz, certRef, downloading, setDownloading }: any) {
  const playerData = JSON.parse(localStorage.getItem('public-levels-player') || '{}');
  const certId = buildCertificateId(undefined, quiz.id, new Date().toISOString());
  const attemptData = getStoredAttempts(undefined)[quiz.id];

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
      a.download = `Mr-Amer-Certificate-${quiz.id}.png`;
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
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'certificate.png';
      a.click();

      const message = `السلام عليكم مستر عامر، أنا ${playerData.name} وأتممت اختبار ${quiz.title} بنجاح وحصلت على ${attemptData?.pct || 0}%، أرجو منك عرض الشهادة على القناة`;
      const whatsappUrl = `https://wa.me/201096066818?text=${encodeURIComponent(message + '\n\n(يرجى إرفاق صورة الشهادة المحملة)')}`;
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error('Share failed:', err);
      const message = `السلام عليكم مستر عامر، أنا ${playerData.name} وأتممت اختبار ${quiz.title} بنجاح وحصلت على ${attemptData?.pct || 0}%، أرجو منك عرض الشهادة على القناة`;
      const whatsappUrl = `https://wa.me/201096066818?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <>
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
            <p className="text-sm text-gray-300 mt-2">النتيجة: {attemptData?.pct || 0}%</p>
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
    </>
  );
}
