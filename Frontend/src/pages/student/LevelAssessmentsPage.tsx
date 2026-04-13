import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Lock, PlayCircle, Trophy } from 'lucide-react';
import { quizzesApi } from '../../api/quizzes';
import { useAuthStore } from '../../store/authStore';
import {
  canOpenLevel,
  extractLevelNumber,
  getStoredAttempts,
} from '../../utils/levelAssessments';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function LevelAssessmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['interactive-quizzes-levels'],
    queryFn: quizzesApi.getAll,
  });

  const attempts = getStoredAttempts(user?.id);

  const levelQuizzes = useMemo(() => {
    return quizzes
      .filter(q => {
        const s = `${q.subject ?? ''} ${q.title}`.toLowerCase();
        return s.includes('javascript') || s.includes('java script') || s.includes('js') || extractLevelNumber(q.title) !== null;
      })
      .sort((a, b) => {
        const la = extractLevelNumber(a.title) ?? 9999;
        const lb = extractLevelNumber(b.title) ?? 9999;
        if (la !== lb) return la - lb;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [quizzes]);

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">اختبارات مستويات JavaScript</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          كل مستوى يفتح بعد اجتياز المستوى السابق بنسبة 70% على الأقل.
        </p>
      </div>

      {!levelQuizzes.length ? (
        <div className="card p-10 text-center text-gray-500 dark:text-gray-400">
          لا توجد اختبارات مستويات مضافة بعد.
        </div>
      ) : (
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
                    onClick={() => navigate(`/quiz/${quiz.slug || quiz.id}`)}
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
      )}
    </div>
  );
}
