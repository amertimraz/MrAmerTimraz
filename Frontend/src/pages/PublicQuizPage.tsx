import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle, XCircle, Trophy } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { quizzesApi } from '../api/quizzes';
import { useNavigate, useParams } from 'react-router-dom';

export default function PublicQuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showFinalResult, setShowFinalResult] = useState(false);

  useEffect(() => {
    const playerData = localStorage.getItem('public-levels-player');
    if (!playerData) {
      navigate('/public-levels');
    }
  }, [navigate]);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizzesApi.getById(Number(quizId)),
    enabled: !!quizId,
  });

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const options = currentQuestion?.options ? JSON.parse(currentQuestion.options) : [];
  const progress = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;

  const handleAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedAnswer('');

    if (currentQuestionIndex < (quiz?.questions.length ?? 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
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
            </div>

            {passed && (
              <button
                onClick={() => navigate(`/levels/certificate/${quiz.id}`)}
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
              <span className="text-purple-200 text-sm">
                {currentQuestionIndex + 1} / {quiz.questions.length}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xl text-white leading-relaxed">{currentQuestion?.text}</p>
          </div>

          <div className="space-y-3 mb-6">
            {options.map((option: string, index: number) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = showResult && option === currentQuestion?.correctAnswer;
              const isWrong = showResult && isSelected && option !== currentQuestion?.correctAnswer;

              return (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedAnswer(option)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl text-right transition-all ${
                    isSelected && !showResult
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold'
                      : isCorrect
                      ? 'bg-green-500/20 border-2 border-green-500 text-white'
                      : isWrong
                      ? 'bg-red-500/20 border-2 border-red-500 text-white'
                      : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mb-6 text-center">
              {selectedAnswer === currentQuestion?.correctAnswer ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle size={24} />
                  <span className="font-bold">إجابة صحيحة!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-red-400">
                  <XCircle size={24} />
                  <span className="font-bold">إجابة خاطئة!</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={showResult ? handleNext : handleAnswer}
            disabled={!selectedAnswer && !showResult}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-lg"
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
