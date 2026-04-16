import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Play, Award, Lock, Unlock, Gamepad2, Trophy, Share2 } from 'lucide-react';
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
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">مستويات JavaScript</h1>
            <button
              onClick={handleShare}
              className="p-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
              title="مشاركة التحدي"
            >
              <Share2 size={20} className="text-white" />
            </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levelQuizzes.map((quiz) => {
              const level = extractLevel(quiz.title) ?? 1;
              const isUnlocked = level === 1; // TODO: Implement unlock logic based on previous level completion
              return (
                <div
                  key={quiz.id}
                  className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-yellow-400/50 transition-all hover:scale-105 cursor-pointer ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => isUnlocked && navigate(`/public-quiz/${quiz.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-white">Level {level}</span>
                        {isUnlocked ? <Unlock size={20} className="text-green-400" /> : <Lock size={20} className="text-gray-400" />}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{quiz.title}</h3>
                      <p className="text-sm text-purple-200">{quiz.questionCount} سؤال</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-slate-900">
                      <BookOpen size={24} />
                    </div>
                  </div>

                  {isUnlocked && (
                    <button className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                      <Play size={18} />
                      ابدأ التحدي
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
