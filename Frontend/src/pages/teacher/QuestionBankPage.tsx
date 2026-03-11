import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { testsApi } from '../../api/tests';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Database, BookOpen, Copy,
  CheckCircle, Tag, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Question, Test } from '../../types';

type QType = 'All' | 'MultipleChoice' | 'TrueFalse' | 'FillBlank' | 'Ordering';

const TYPE_LABELS: Record<string, string> = {
  MultipleChoice: 'اختيار متعدد',
  TrueFalse:      'صح / خطأ',
  FillBlank:      'أكمل الفراغ',
  Ordering:       'ترتيب',
};

const TYPE_COLORS: Record<string, string> = {
  MultipleChoice: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  TrueFalse:      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  FillBlank:      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  Ordering:       'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

interface QuestionWithTest extends Question {
  testTitle: string;
  testId: number;
  courseTitle: string;
}

export default function QuestionBankPage() {
  const navigate  = useNavigate();
  const qc        = useQueryClient();

  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState<QType>('All');
  const [expanded,   setExpanded]   = useState<number | null>(null);
  const [copied,     setCopied]     = useState<number | null>(null);

  const { data: tests = [], isLoading } = useQuery<Test[]>({
    queryKey: ['my-tests'],
    queryFn: () => testsApi.getMyTests(),
  });

  const deleteQ = useMutation({
    mutationFn: (qid: number) => testsApi.deleteQuestion(qid),
    onSuccess: () => {
      toast.success('تم حذف السؤال');
      qc.invalidateQueries({ queryKey: ['my-tests'] });
    },
    onError: () => toast.error('فشل في حذف السؤال'),
  });

  const allQuestions: QuestionWithTest[] = useMemo(() => {
    return tests.flatMap(t =>
      t.questions.map(q => ({
        ...q,
        testTitle:   t.title,
        testId:      t.id,
        courseTitle: t.courseName,
      }))
    );
  }, [tests]);

  const filtered = useMemo(() => {
    return allQuestions.filter(q => {
      const matchType   = typeFilter === 'All' || q.questionType === typeFilter;
      const matchSearch = !search ||
        q.questionText.toLowerCase().includes(search.toLowerCase()) ||
        q.testTitle.toLowerCase().includes(search.toLowerCase()) ||
        q.courseTitle.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [allQuestions, typeFilter, search]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allQuestions.forEach(q => {
      counts[q.questionType] = (counts[q.questionType] ?? 0) + 1;
    });
    return counts;
  }, [allQuestions]);

  const handleCopy = (q: QuestionWithTest) => {
    const text = `السؤال: ${q.questionText}\nالنوع: ${TYPE_LABELS[q.questionType] ?? q.questionType}${q.correctAnswer ? `\nالإجابة: ${q.correctAnswer}` : ''}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(q.id);
      setTimeout(() => setCopied(null), 2000);
      toast.success('تم نسخ السؤال!');
    });
  };

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Database size={26} className="text-primary-500" />
            بنك الأسئلة
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            جميع أسئلتك في مكان واحد — {allQuestions.length} سؤال من {tests.length} اختبار
          </p>
        </div>
        <button
          onClick={() => navigate('/teacher/tests/generate')}
          className="btn-primary flex items-center gap-2"
        >
          ⚡ مولّد الاختبارات
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <div key={key} className="card p-4 flex items-center gap-3">
            <div className={`badge ${TYPE_COLORS[key] ?? ''} text-xs px-2 py-1`}>{label}</div>
            <span className="font-bold text-xl text-gray-800 dark:text-gray-200 mr-auto">
              {typeCounts[key] ?? 0}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pr-10"
            placeholder="ابحث في الأسئلة أو الاختبارات..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as QType)}
            className="input-field w-44"
          >
            <option value="All">كل الأنواع</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500">
        عرض <span className="font-bold text-primary-600">{filtered.length}</span> سؤال
        {search && ` لـ "${search}"`}
      </p>

      {/* Question List */}
      {filtered.length === 0 ? (
        <div className="card p-14 text-center">
          <Database size={56} className="mx-auto mb-4 text-gray-200 dark:text-gray-700" />
          <p className="font-semibold text-gray-500">لا توجد أسئلة</p>
          <p className="text-sm text-gray-400 mt-1">أضف أسئلة للاختبارات لتظهر هنا</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: idx * 0.03 }}
                className="card overflow-hidden"
              >
                {/* Question Header */}
                <button
                  onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                  className="w-full flex items-start gap-4 p-4 text-right hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-gray-900 dark:text-white font-medium leading-relaxed text-right">
                      {q.questionText}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`badge text-xs px-2 py-0.5 ${TYPE_COLORS[q.questionType] ?? ''}`}>
                        {TYPE_LABELS[q.questionType] ?? q.questionType}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <BookOpen size={11} />
                        {q.courseTitle}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Tag size={11} />
                        {q.testTitle}
                      </span>
                      <span className="text-xs text-yellow-600 font-semibold">{q.points} درجة</span>
                    </div>
                  </div>
                  <span className="text-gray-300 shrink-0">
                    {expanded === q.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>

                {/* Expanded */}
                <AnimatePresence>
                  {expanded === q.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 px-4 py-4 space-y-3"
                    >
                      {/* Options */}
                      {q.options && (() => {
                        try {
                          const opts: string[] = JSON.parse(q.options);
                          return (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-2">الاختيارات:</p>
                              <div className="space-y-1">
                                {opts.map((o, i) => (
                                  <div key={i} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                                    o === q.correctAnswer ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {o === q.correctAnswer && <CheckCircle size={14} />}
                                    <span>{String.fromCharCode(65 + i)}. {o}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        } catch { return null; }
                      })()}

                      {/* Correct Answer */}
                      {q.correctAnswer && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">الإجابة الصحيحة:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                            {q.correctAnswer}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => navigate(`/teacher/tests/${q.testId}/questions/new`)}
                          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                        >
                          <BookOpen size={13} /> فتح الاختبار
                        </button>
                        <button
                          onClick={() => handleCopy(q)}
                          className={`text-xs py-1.5 px-3 rounded-xl border font-semibold flex items-center gap-1 transition-all ${
                            copied === q.id
                              ? 'bg-green-100 border-green-300 text-green-700'
                              : 'btn-secondary'
                          }`}
                        >
                          {copied === q.id ? <><CheckCircle size={13} /> تم النسخ</> : <><Copy size={13} /> نسخ السؤال</>}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('هل تريد حذف هذا السؤال نهائياً؟'))
                              deleteQ.mutate(q.id);
                          }}
                          className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1 mr-auto"
                        >
                          <Trash2 size={13} /> حذف
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
