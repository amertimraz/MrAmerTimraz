import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { testsApi } from '../../api/tests';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Clock, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { TestResult } from '../../types';

export default function TakeTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);

  const { data: test, isLoading } = useQuery({
    queryKey: ['test', id],
    queryFn: () => testsApi.getById(Number(id)),
  });

  useEffect(() => {
    if (test) setTimeLeft(test.durationMinutes * 60);
  }, [test]);

  useEffect(() => {
    if (!timeLeft || result) return;
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { clearInterval(t); handleSubmit(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [timeLeft, result]);

  const submit = useMutation({
    mutationFn: (data: object) => testsApi.submit(data),
    onSuccess: (res) => setResult(res),
    onError: () => toast.error('حدث خطأ أثناء تسليم الاختبار'),
  });

  const handleSubmit = useCallback(() => {
    if (!test) return;
    submit.mutate({
      testId: test.id,
      answers: Object.entries(answers).map(([qId, answer]) => ({
        questionId: Number(qId),
        answer,
      })),
    });
  }, [test, answers, submit]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const isUrgent = timeLeft < 60;

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (!test) return <div className="text-center text-gray-400 mt-20">الاختبار غير موجود</div>;

  if (result) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center animate-fade-in">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl
          ${result.passed ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
          <CheckCircle size={48} className={result.passed ? 'text-green-500' : 'text-red-400'} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {result.passed ? '🎉 مبروك، نجحت!' : '😔 للأسف، لم تنجح'}
        </h1>
        <p className="text-gray-500 mb-8">يمكنك المراجعة والمحاولة مجدداً</p>

        <div className="card p-8 space-y-4 text-right">
          {[
            { label: 'درجتك', value: `${result.score} / ${result.maxScore}`, color: 'text-primary-600' },
            { label: 'النسبة المئوية', value: `${result.percentage.toFixed(1)}%`, color: result.passed ? 'text-green-600' : 'text-red-500' },
            { label: 'درجة النجاح', value: `${result.passingScore}%`, color: 'text-gray-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500">{label}</span>
              <span className={`font-bold text-xl ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8 justify-center">
          <button onClick={() => navigate('/student/results')} className="btn-primary">
            عرض كل نتائجي
          </button>
          <button onClick={() => navigate(-1)} className="btn-secondary">
            العودة
          </button>
        </div>
      </div>
    );
  }

  const q = test.questions[current];
  const totalQ = test.questions.length;
  const progress = ((current + 1) / totalQ) * 100;

  const renderOptions = () => {
    if (q.questionType === 'TrueFalse') {
      return (
        <div className="grid grid-cols-2 gap-4">
          {['صح', 'خطأ'].map(opt => (
            <button key={opt} onClick={() => setAnswers(p => ({ ...p, [q.id]: opt }))}
              className={`p-5 rounded-xl border-2 font-bold text-lg transition-all
                ${answers[q.id] === opt
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700'
                  : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'}`}>
              {opt === 'صح' ? '✅ صح' : '❌ خطأ'}
            </button>
          ))}
        </div>
      );
    }

    if (q.questionType === 'MultipleChoice' && q.options) {
      const opts: string[] = JSON.parse(q.options);
      return (
        <div className="space-y-3">
          {opts.map((opt, i) => (
            <button key={i} onClick={() => setAnswers(p => ({ ...p, [q.id]: opt }))}
              className={`w-full text-right p-4 rounded-xl border-2 font-medium transition-all
                ${answers[q.id] === opt
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700'
                  : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'}`}>
              <span className="inline-flex w-7 h-7 rounded-full border-2 items-center justify-center ml-3 text-sm font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (q.questionType === 'FillBlank') {
      return (
        <input value={answers[q.id] ?? ''} onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
          className="input-field text-lg" placeholder="اكتب إجابتك هنا..." />
      );
    }

    if (q.questionType === 'Ordering' && q.options) {
      const opts: string[] = JSON.parse(q.options);
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">اكتب الترتيب الصحيح (مفصول بفواصل):</p>
          {opts.map((opt, i) => (
            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              {opt}
            </div>
          ))}
          <input value={answers[q.id] ?? ''} onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
            className="input-field mt-3" placeholder="مثال: 1,3,2,4" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" dir="rtl">
      <div className="card p-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900 dark:text-white">{test.title}</h1>
          <p className="text-sm text-gray-400">السؤال {current + 1} من {totalQ}</p>
        </div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-xl
          ${isUrgent ? 'bg-red-100 dark:bg-red-900 text-red-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
          <Clock size={20} />
          {mm}:{ss}
        </div>
      </div>

      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div className="h-2 bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="card p-6 space-y-6">
        {q.imageUrl && (
          <img src={q.imageUrl} alt="question" className="w-full max-h-48 object-contain rounded-xl" />
        )}
        <p className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
          {current + 1}. {q.questionText}
        </p>
        <div>{renderOptions()}</div>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setCurrent(p => p - 1)} disabled={current === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-40">
          <ChevronRight size={18} /> السابق
        </button>

        {current < totalQ - 1 ? (
          <button onClick={() => setCurrent(p => p + 1)} className="btn-primary flex items-center gap-2">
            التالي <ChevronLeft size={18} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submit.isPending}
            className="btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2">
            <CheckCircle size={18} />
            {submit.isPending ? 'جاري التسليم...' : 'تسليم الاختبار'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {test.questions.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-9 h-9 rounded-lg text-sm font-bold transition-all
              ${i === current ? 'bg-primary-600 text-white shadow-md' :
                answers[test.questions[i].id] ? 'bg-green-100 dark:bg-green-900 text-green-600' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-600'}`}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
