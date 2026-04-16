import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Award, Lock, Unlock, Gamepad2, Trophy, Share2 } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { quizzesApi } from '../api/quizzes';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LEVEL_SUBJECT = 'JavaScript Levels';
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية',
  'القليوبية', 'الغربية', 'بورسعيد', 'دمياط', 'الإسماعيلية', 'كفر الشيخ',
  'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر',
  'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء'
];

function extractLevel(title: string): number | null {
  const match = title.match(/Level\s+(\d+)/i);
  return match ? parseInt(match[1]) : null;
}

export default function PublicLevelsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [screen, setScreen] = useState<'start' | 'levels'>('start');
  const [playerName, setPlayerName] = useState('');
  const [governorate, setGovernorate] = useState('');
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
    return quizzes
      .filter(q => (q.subject ?? '').toLowerCase() === LEVEL_SUBJECT.toLowerCase())
      .sort((a, b) => (extractLevel(a.title) ?? 999) - (extractLevel(b.title) ?? 999));
  }, [quizzes]);

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const allResults = await Promise.all(
        levelQuizzes.map(q => quizzesApi.getLeaderboard(q.id))
      );
      const combined = allResults.flat().sort((a: any, b: any) => b.score - a.score).slice(0, 10);
      return combined;
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
        </div>

        {/* Leaderboard Section */}
        {leaderboard.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy size={24} className="text-yellow-400" />
                🏆 أفضل 10
              </h2>
            </div>
            <div className="space-y-3">
              {leaderboard.map((player: any, index: number) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300/20 to-gray-400/20 border border-gray-300/30' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400/20 to-orange-600/20 border border-orange-400/30' :
                    'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-orange-400' :
                      'text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-white font-semibold">{player.name}</span>
                  </div>
                  <span className="text-yellow-400 font-bold">{player.score} نقطة</span>
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
              style={{ height: `${((levelQuizzes.filter((_, i) => i === 0).length) / levelQuizzes.length) * 100}%` }}
            />

            {/* Game Map */}
            <div className="space-y-12 py-8">
              {levelQuizzes.map((quiz, index) => {
                const level = extractLevel(quiz.title) ?? 1;
                const isUnlocked = level === 1;
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
                          isUnlocked
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 border-4 border-yellow-300'
                            : 'bg-gray-800 text-gray-500 border-4 border-gray-700'
                        } animate-pulse`}
                      >
                        {level}
                      </div>

                      {/* Level Card */}
                      <div
                        className={`mt-4 p-6 rounded-2xl backdrop-blur-lg border-2 transition-all ${
                          isUnlocked
                            ? 'bg-white/10 border-yellow-400/50 hover:border-yellow-400'
                            : 'bg-gray-800/50 border-gray-700'
                        } max-w-xs`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {isUnlocked ? <Unlock size={20} className="text-green-400" /> : <Lock size={20} className="text-gray-400" />}
                          <h3 className="text-lg font-bold text-white">{quiz.title}</h3>
                        </div>
                        <p className="text-sm text-purple-200 mb-3">{quiz.questionCount} سؤال</p>
                        {isUnlocked && (
                          <button className="w-full py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            <Play size={16} />
                            ابدأ التحدي
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Connector Dot */}
                    <div className="absolute left-1/2 top-10 w-4 h-4 rounded-full bg-yellow-400 -translate-x-1/2 hidden md:block" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
