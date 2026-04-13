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
        const la = extractLevelNumber(a.title) ?? 9999;
        const lb = extractLevelNumber(b.title) ?? 9999;
        if (la !== lb) return la - lb;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [quizzes]);
  const certificates = getPassedCertificates(user?.id);

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">اختبارات مستويات JavaScript</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          كل مستوى يفتح بعد اجتياز المستوى السابق بنسبة 70% على الأقل.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('levels')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === 'levels' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
        >
          المستويات
        </button>
        <button
          onClick={() => setTab('certificates')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === 'certificates' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
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

            return (
              <div key={quiz.id} className="card p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{quiz.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {level ? `Level ${level}` : 'JavaScript Level'}
                    </p>
                  </div>
                  {attempt?.passed ? (
                    <span className="badge-green">تم الاجتياز</span>
                  ) : attempt ? (
                    <span className="badge-red">غير مجتاز</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">جديد</span>
                  )}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p>عدد الأسئلة: {quiz.questionCount}</p>
                  {attempt && <p>آخر نتيجة: {attempt.score}/{attempt.total} ({attempt.pct}%)</p>}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    disabled={!unlocked}
                    onClick={() => navigate(`/student/levels/take/${quiz.slug || quiz.id}`)}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {unlocked ? <PlayCircle size={16} /> : <Lock size={16} />}
                    {unlocked ? 'ابدأ الاختبار' : 'مغلق حتى اجتياز السابق'}
                  </button>

                  {attempt?.passed && (
                    <button
                      onClick={() => navigate(`/student/levels/certificate/${quiz.id}`)}
                      className="btn-secondary flex items-center gap-2"
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
            <div key={cert.quizId} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">{cert.quizTitle}</h3>
                <Award size={18} className="text-yellow-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">النتيجة: {cert.score}/{cert.total} ({cert.pct}%)</p>
              <p className="text-xs text-gray-500">ID: {buildCertificateId(user?.id, cert.quizId, cert.completedAt)}</p>
              <button
                onClick={() => navigate(`/student/levels/certificate/${cert.quizId}`)}
                className="btn-secondary flex items-center gap-2"
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
