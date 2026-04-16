import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Lock, PlayCircle, Trophy, Award } from 'lucide-react';
import { quizzesApi } from '../../api/quizzes';
import { useAuthStore } from '../../store/authStore';
import {
  buildCertificateId,
  canOpenLevel,
  extractLevelNumber,
  getPassedCertificates,
  getStoredAttempts,
  isJavaScriptLevelQuiz,
} from '../../utils/levelAssessments';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function LevelAssessmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'levels' | 'certificates'>('levels');

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['interactive-quizzes-levels'],
    queryFn: quizzesApi.getAll,
  });

  const attempts = getStoredAttempts(user?.id);

  const levelQuizzes = useMemo(() => {
    return quizzes
      .filter(q => isJavaScriptLevelQuiz(q))
      .sort((a, b) => {
        const la = extractLevelNumber(a.title);
        const lb = extractLevelNumber(b.title);
        if (la != null && lb != null && la !== lb) return la - lb;
        if (la != null && lb == null) return -1;
        if (la == null && lb != null) return 1;
        const aCreatedAt = new Date(a.createdAt).getTime();
        const bCreatedAt = new Date(b.createdAt).getTime();
        if (aCreatedAt !== bCreatedAt) return aCreatedAt - bCreatedAt;
        if (la != null && lb != null && la !== lb) return la - lb;
        return a.id - b.id;
      });
  }, [quizzes]);
  const certificates = getPassedCertificates(user?.id);
  const passedCount = levelQuizzes.filter(q => attempts[q.id]?.passed).length;
  const totalLevels = levelQuizzes.length;
  const unlockedLevels = levelQuizzes.filter(q => canOpenLevel(q, levelQuizzes, user?.id)).length;
  const bestScore = Object.values(attempts).reduce((max, a) => Math.max(max, a.pct), 0);
  const totalPoints = levelQuizzes.reduce((sum, quiz) => sum + (attempts[quiz.id]?.score ?? 0), 0);
  const maxPoints = levelQuizzes.reduce((sum, quiz) => sum + quiz.questionCount, 0);
  const mascotStep = totalLevels ? Math.min(passedCount, Math.max(totalLevels - 1, 0)) : 0;
  const trackProgress = totalLevels > 1 ? (mascotStep / (totalLevels - 1)) * 100 : 0;
  const mascotSrc = '/qureo-mascot.png';

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl bg-gradient-to-l from-[#1e3a8a] via-[#1d4ed8] to-[#1e40af] p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold">تقرير مستويات JavaScript</h1>
        <p className="text-blue-100 mt-1">كل مستوى جديد يُفتح بعد اجتياز المستوى السابق بنسبة 70%.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl p-4 text-white bg-gradient-to-br from-violet-600 to-indigo-600">
          <p className="text-xs opacity-90">إجمالي المستويات</p>
          <p className="text-3xl font-extrabold mt-1">{totalLevels}</p>
        </div>
        <div className="rounded-2xl p-4 text-white bg-gradient-to-br from-emerald-500 to-teal-600">
          <p className="text-xs opacity-90">المستويات المجتازة</p>
          <p className="text-3xl font-extrabold mt-1">{passedCount}</p>
        </div>
        <div className="rounded-2xl p-4 text-white bg-gradient-to-br from-amber-500 to-orange-600">
          <p className="text-xs opacity-90">المستويات المفتوحة</p>
          <p className="text-3xl font-extrabold mt-1">{unlockedLevels}</p>
        </div>
        <div className="rounded-2xl p-4 text-white bg-gradient-to-br from-blue-600 to-cyan-600">
          <p className="text-xs opacity-90">أفضل نسبة</p>
          <p className="text-3xl font-extrabold mt-1">{bestScore}%</p>
        </div>
      </div>

      {!!levelQuizzes.length && (
        <div className="rounded-2xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">مجموع النقاط</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {totalPoints}
                <span className="text-sm font-semibold text-slate-500"> / {maxPoints}</span>
              </p>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
              موقعك الحالي: {Math.min(passedCount + 1, totalLevels)} / {totalLevels}
            </p>
          </div>

          <div className="relative pt-14 pb-2 px-2">
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 transition-all duration-700"
                style={{ width: `${Math.max(5, trackProgress)}%` }}
              />
            </div>

            <div
              className="absolute top-0 -translate-x-1/2 transition-all duration-700"
              style={{ left: `${trackProgress}%` }}
            >
              <img
                src={mascotSrc}
                alt="Qureo Mascot"
                className="w-14 h-14 object-contain drop-shadow-md"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="text-center -mt-1 text-lg">🚀</div>
            </div>

            <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${totalLevels}, minmax(0, 1fr))` }}>
              {levelQuizzes.map((quiz, idx) => {
                const level = extractLevelNumber(quiz.title) ?? idx + 1;
                const passed = !!attempts[quiz.id]?.passed;
                const reached = idx <= mascotStep;
                return (
                  <div key={quiz.id} className="text-center space-y-1">
                    <div className={`mx-auto w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-extrabold ${passed ? 'bg-emerald-500 border-emerald-500 text-white' : reached ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-500'}`}>
                      {level}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">L{level}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl w-fit">
        <button
          onClick={() => setTab('levels')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'levels' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}
        >
          المستويات
        </button>
        <button
          onClick={() => setTab('certificates')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'certificates' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}
        >
          الشهادات
        </button>
      </div>

      {tab === 'levels' && !levelQuizzes.length ? (
        <div className="card p-10 text-center text-gray-500 dark:text-gray-400">
          لا توجد اختبارات مستويات مضافة بعد.
        </div>
      ) : tab === 'levels' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {levelQuizzes.map((quiz) => {
            const level = extractLevelNumber(quiz.title);
            const unlocked = canOpenLevel(quiz, levelQuizzes, user?.id);
            const attempt = attempts[quiz.id];
            const pct = attempt?.pct ?? 0;
            const progressColor = attempt?.passed ? 'bg-emerald-500' : attempt ? 'bg-amber-500' : 'bg-slate-300';

            return (
              <div
                key={quiz.id}
                className={`rounded-2xl border p-5 space-y-4 shadow-sm transition-all ${
                  unlocked
                    ? 'border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-900'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/60 opacity-65'
                }`}
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">{quiz.title}</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                      {level ? `Level ${level}` : 'JavaScript Level'}
                    </p>
                  </div>
                  {attempt?.passed ? (
                    <span className="badge-green">تم الاجتياز</span>
                  ) : !unlocked ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      <Lock size={12} />
                      مقفول
                    </span>
                  ) : attempt ? (
                    <span className="badge-red">غير مجتاز</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">جديد</span>
                  )}
                </div>

                {!unlocked && (
                  <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      هذا المستوى مقفول. لازم تُنهي وتنجح في المستوى السابق أولًا.
                    </p>
                  </div>
                )}

                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <p>عدد الأسئلة: {quiz.questionCount}</p>
                  {attempt && <p>آخر نتيجة: {attempt.score}/{attempt.total} ({attempt.pct}%)</p>}
                  <div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-2 ${progressColor} transition-all`}
                        style={{ width: `${Math.max(8, pct)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {attempt ? `تقدمك الحالي ${pct}%` : 'لم تبدأ هذا المستوى بعد'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    disabled={!unlocked}
                    onClick={() => navigate(`/student/levels/take/${quiz.slug || quiz.id}`)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {unlocked ? <PlayCircle size={16} /> : <Lock size={16} />}
                    {unlocked ? 'ابدأ الاختبار' : 'مغلق حتى اجتياز السابق'}
                  </button>

                  {attempt?.passed && (
                    <button
                      disabled={!unlocked}
                      onClick={() => navigate(`/student/levels/certificate/${quiz.id}`)}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trophy size={16} />
                      عرض الشهادة
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : certificates.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div key={cert.quizId} className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">{cert.quizTitle}</h3>
                <Award size={18} className="text-yellow-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">النتيجة: {cert.score}/{cert.total} ({cert.pct}%)</p>
              <p className="text-xs text-gray-500">ID: {buildCertificateId(user?.id, cert.quizId, cert.completedAt)}</p>
              <button
                onClick={() => navigate(`/student/levels/certificate/${cert.quizId}`)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center gap-2"
              >
                <Trophy size={16} /> فتح الشهادة
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center text-gray-500 dark:text-gray-400">
          لا توجد شهادات حتى الآن. أكمل مستوى وحقق 70% لتظهر شهادتك هنا.
        </div>
      )}
    </div>
  );
}
