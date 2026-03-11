import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { testsApi } from '../../api/tests';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Plus, Trash2, CheckCircle, Send,
  Image as ImageIcon, Star, LayoutList,
} from 'lucide-react';
import toast from 'react-hot-toast';

type QType = 'MultipleChoice' | 'TrueFalse' | 'FillBlank' | 'Ordering';

const TYPE_CONFIG: { key: QType; label: string; emoji: string; desc: string }[] = [
  { key: 'MultipleChoice', label: 'اختيار من متعدد', emoji: '☑️', desc: 'أربعة اختيارات وإجابة واحدة صحيحة' },
  { key: 'TrueFalse',      label: 'صح / خطأ',       emoji: '✅', desc: 'الطالب يختار صح أو خطأ' },
  { key: 'FillBlank',      label: 'أكمل الفراغ',     emoji: '✏️', desc: 'الطالب يكتب الإجابة بنفسه' },
  { key: 'Ordering',       label: 'ترتيب',           emoji: '🔢', desc: 'الطالب يرتب العناصر بالترتيب الصحيح' },
];

const EMPTY_FORM = {
  questionText: '',
  correctAnswer: '',
  points: 1,
  imageUrl: '',
};

export default function AddQuestionPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [qType, setQType]             = useState<QType>('MultipleChoice');
  const [form, setForm]               = useState({ ...EMPTY_FORM });
  const [options, setOptions]         = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx]   = useState<number | null>(null);
  const [tfAnswer, setTfAnswer]       = useState<'صح' | 'خطأ' | ''>('');
  const [addedCount, setAddedCount]   = useState(0);

  const { data: test } = useQuery({
    queryKey: ['test-manage', testId],
    queryFn: () => testsApi.getById(Number(testId)),
  });

  const addQ = useMutation({
    mutationFn: (data: object) => testsApi.addQuestion(Number(testId), data),
    onSuccess: () => {
      toast.success('✅ تم إضافة السؤال! يمكنك إضافة المزيد.');
      setAddedCount(p => p + 1);
      resetForm();
    },
    onError: () => toast.error('فشل في إضافة السؤال'),
  });

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setOptions(['', '', '', '']);
    setCorrectIdx(null);
    setTfAnswer('');
  };

  const handleTypeChange = (type: QType) => {
    setQType(type);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.questionText.trim()) { toast.error('نص السؤال مطلوب'); return; }

    const base = {
      questionText: form.questionText,
      questionType: qType,
      points: form.points,
      orderIndex: (test?.questions.length ?? 0) + addedCount + 1,
      imageUrl: form.imageUrl || null,
    };

    if (qType === 'MultipleChoice') {
      const filtered = options.filter(o => o.trim());
      if (filtered.length < 2) { toast.error('أضف اختيارين على الأقل'); return; }
      if (correctIdx === null || !options[correctIdx]?.trim()) { toast.error('حدد الإجابة الصحيحة'); return; }
      addQ.mutate({ ...base, options: JSON.stringify(filtered), correctAnswer: options[correctIdx] });

    } else if (qType === 'TrueFalse') {
      if (!tfAnswer) { toast.error('حدد الإجابة الصحيحة'); return; }
      addQ.mutate({ ...base, correctAnswer: tfAnswer });

    } else if (qType === 'FillBlank') {
      if (!form.correctAnswer.trim()) { toast.error('أدخل الإجابة الصحيحة'); return; }
      addQ.mutate({ ...base, correctAnswer: form.correctAnswer });

    } else if (qType === 'Ordering') {
      const filtered = options.filter(o => o.trim());
      if (filtered.length < 2) { toast.error('أضف عنصرين على الأقل'); return; }
      addQ.mutate({ ...base, options: JSON.stringify(filtered), correctAnswer: filtered.join(',') });
    }
  };

  const addOption = () => setOptions(p => [...p, '']);
  const removeOption = (i: number) => {
    setOptions(p => p.filter((_, idx) => idx !== i));
    if (correctIdx === i) setCorrectIdx(null);
    else if (correctIdx !== null && correctIdx > i) setCorrectIdx(correctIdx - 1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/teacher/tests/${testId}`)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutList size={24} className="text-primary-500" />
            إضافة الأسئلة
          </h1>
          {test && (
            <p className="text-sm text-gray-400 mt-0.5">
              {test.title} — <span className="text-primary-500">{test.questions.length + addedCount} سؤال</span>
            </p>
          )}
        </div>
        {addedCount > 0 && (
          <motion.span
            key={addedCount}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="badge-green text-sm px-3 py-1.5 font-bold"
          >
            +{addedCount} أُضيف ✓
          </motion.span>
        )}
      </div>

      {/* Question Type Selector */}
      <div className="card p-5">
        <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">نوع السؤال:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TYPE_CONFIG.map(({ key, label, emoji, desc }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTypeChange(key)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                qType === key
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
              }`}
            >
              <div className="text-3xl mb-1.5">{emoji}</div>
              <div className={`text-xs font-bold mb-0.5 ${qType === key ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {label}
              </div>
              <div className="text-xs text-gray-400 leading-tight">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Question Text + Meta */}
        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              نص السؤال <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.questionText}
              onChange={e => setForm(p => ({ ...p, questionText: e.target.value }))}
              className="input-field resize-none text-base leading-relaxed"
              rows={3}
              placeholder={
                qType === 'FillBlank'
                  ? 'مثال: لغة البرمجة هي ........ تُستخدم للتواصل مع الحاسوب'
                  : qType === 'TrueFalse'
                  ? 'مثال: الذكاء الاصطناعي يستطيع الابتكار والإبداع بشكل مستقل'
                  : qType === 'Ordering'
                  ? 'مثال: رتّب خطوات تشغيل الحاسوب بالترتيب الصحيح'
                  : 'مثال: ما هي اللغة المستخدمة لبناء صفحات الإنترنت؟'
              }
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              <ImageIcon size={14} className="text-primary-400" />
              صورة توضيحية (اختياري)
            </label>
            <input
              value={form.imageUrl}
              onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
              className="input-field text-sm"
              placeholder="https://..."
            />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="q" className="mt-2 max-h-32 rounded-lg object-contain border border-gray-200 dark:border-gray-700" />
            )}
          </div>

          {/* Points */}
          <div className="flex items-center gap-4 pt-1 border-t border-gray-100 dark:border-gray-700">
            <Star size={16} className="text-yellow-500 shrink-0" />
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">درجة السؤال:</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setForm(p => ({ ...p, points: Math.max(1, p.points - 1) }))}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">−</button>
              <span className="w-10 text-center font-bold text-xl text-primary-600">{form.points}</span>
              <button type="button" onClick={() => setForm(p => ({ ...p, points: Math.min(10, p.points + 1) }))}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">+</button>
            </div>
            <span className="text-sm text-gray-400">درجة</span>
          </div>
        </div>

        {/* Answer Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={qType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >

            {/* ─── Multiple Choice ─── */}
            {qType === 'MultipleChoice' && (
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-700 dark:text-gray-300">الاختيارات:</p>
                  <button type="button" onClick={addOption}
                    className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
                    <Plus size={14} /> إضافة اختيار
                  </button>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <CheckCircle size={12} className="text-green-500" />
                  انقر على الدائرة لتحديد الإجابة الصحيحة
                </p>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        correctIdx === i
                          ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setCorrectIdx(i)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          correctIdx === i
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {correctIdx === i && <CheckCircle size={14} className="text-white" />}
                      </button>
                      <span className="font-bold text-gray-400 w-6 text-sm">{String.fromCharCode(65 + i)}</span>
                      <input
                        value={opt}
                        onChange={e => setOptions(p => p.map((o, idx) => idx === i ? e.target.value : o))}
                        className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder={`الاختيار ${String.fromCharCode(65 + i)}`}
                      />
                      {options.length > 2 && (
                        <button type="button" onClick={() => removeOption(i)}
                          className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── True / False ─── */}
            {qType === 'TrueFalse' && (
              <div className="card p-6 space-y-4">
                <p className="font-bold text-gray-700 dark:text-gray-300">الإجابة الصحيحة:</p>
                <div className="grid grid-cols-2 gap-4">
                  {(['صح', 'خطأ'] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTfAnswer(opt)}
                      className={`p-6 rounded-xl border-2 font-bold text-xl transition-all ${
                        tfAnswer === opt
                          ? opt === 'صح'
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-md'
                            : 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {opt === 'صح' ? '✅ صح' : '❌ خطأ'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Fill Blank ─── */}
            {qType === 'FillBlank' && (
              <div className="card p-6 space-y-4">
                <p className="font-bold text-gray-700 dark:text-gray-300">الإجابة الصحيحة:</p>
                <input
                  value={form.correctAnswer}
                  onChange={e => setForm(p => ({ ...p, correctAnswer: e.target.value }))}
                  className="input-field text-lg"
                  placeholder="اكتب الإجابة الصحيحة التي سيُقيَّم عليها الطالب..."
                />
                <p className="text-xs text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl">
                  💡 يُقيَّم الطالب بالمقارنة المباشرة مع الإجابة، تأكد من كتابتها بدقة.
                </p>
              </div>
            )}

            {/* ─── Ordering ─── */}
            {qType === 'Ordering' && (
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-700 dark:text-gray-300">العناصر بالترتيب الصحيح:</p>
                  <button type="button" onClick={addOption}
                    className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
                    <Plus size={14} /> إضافة عنصر
                  </button>
                </div>
                <p className="text-xs text-gray-400">أدخل العناصر بالترتيب الصحيح — هذا هو الترتيب الذي سيُقيَّم عليه الطالب</p>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {i + 1}
                      </span>
                      <input
                        value={opt}
                        onChange={e => setOptions(p => p.map((o, idx) => idx === i ? e.target.value : o))}
                        className="input-field flex-1"
                        placeholder={`العنصر ${i + 1}`}
                      />
                      {options.length > 2 && (
                        <button type="button" onClick={() => removeOption(i)}
                          className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={addQ.isPending}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-base"
          >
            <Plus size={18} />
            {addQ.isPending ? 'جارٍ الإضافة...' : 'إضافة السؤال وإضافة آخر'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/teacher/tests/${testId}`)}
            className="btn-secondary flex items-center gap-2 px-5"
          >
            <Send size={16} />
            إنهاء والنشر
          </button>
        </div>
      </form>
    </div>
  );
}
