import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Play, Award } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { quizzesApi } from '../api/quizzes';
import { useNavigate } from 'react-router-dom';

const LEVEL_SUBJECT = 'JavaScript Levels';

function extractLevel(title: string): number | null {
  const match = title.match(/Level\s+(\d+)/i);
  return match ? parseInt(match[1]) : null;
}

export default function PublicLevelsPage() {
  const navigate = useNavigate();
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['interactive-quizzes'],
    queryFn: quizzesApi.getAll,
  });

  const levelQuizzes = useMemo(() => {
    return quizzes
      .filter(q => (q.subject ?? '').toLowerCase() === LEVEL_SUBJECT.toLowerCase())
      .sort((a, b) => (extractLevel(a.title) ?? 999) - (extractLevel(b.title) ?? 999));
  }, [quizzes]);

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 mb-6 shadow-2xl">
            <Award size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">مستويات JavaScript</h1>
          <p className="text-lg text-purple-200">اختبر معلوماتك واجمع شهاداتك</p>
        </div>

        {levelQuizzes.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">لا توجد مستويات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levelQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-yellow-400/50 transition-all hover:scale-105 cursor-pointer"
                onClick={() => navigate(`/quiz/${quiz.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{quiz.title}</h3>
                    <p className="text-sm text-purple-200">{quiz.questionCount} سؤال</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-slate-900">
                    <BookOpen size={24} />
                  </div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Play size={18} />
                  ابدأ الاختبار
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
