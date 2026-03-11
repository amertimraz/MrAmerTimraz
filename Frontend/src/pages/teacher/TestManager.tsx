import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testsApi } from '../../api/tests';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { Plus, Trash2, ArrowRight, Send, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Question } from '../../types';

const TYPE_LABELS: Record<string, string> = {
  TrueFalse: 'صح / خطأ',
  MultipleChoice: 'اختياري',
  FillBlank: 'أكمل الفراغ',
  Ordering: 'ترتيب',
};

const emptyForm = { questionText: '', questionType: 'MultipleChoice', options: '', correctAnswer: '', points: 1, orderIndex: 0, imageUrl: '' };

export default function TestManager() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [tab, setTab] = useState<'questions' | 'results'>('questions');

  const { data: test, isLoading } = useQuery({
    queryKey: ['test-manage', id],
    queryFn: () => testsApi.getById(Number(id)),
  });

  const { data: results } = useQuery({
    queryKey: ['test-results', id],
    queryFn: () => testsApi.getTestResults(Number(id)),
    enabled: tab === 'results',
  });

  const addQ = useMutation({
    mutationFn: (data: object) => testsApi.addQuestion(Number(id), data),
    onSuccess: () => { toast.success('تم إضافة السؤال!'); qc.invalidateQueries({ queryKey: ['test-manage', id] }); setShowModal(false); setForm({ ...emptyForm }); },
    onError: () => toast.error('فشل في إضافة السؤال'),
  });

  const deleteQ = useMutation({
    mutationFn: (qid: number) => testsApi.deleteQuestion(qid),
    onSuccess: () => { toast.success('تم حذف السؤال'); qc.invalidateQueries({ queryKey: ['test-manage', id] }); },
  });

  const publish = useMutation({
    mutationFn: () => testsApi.publish(Number(id)),
    onSuccess: () => { toast.success('تم نشر الاختبار!'); qc.invalidateQueries({ queryKey: ['test-manage', id] }); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = { ...form };
    if (form.questionType === 'MultipleChoice' && form.options) {
      const opts = form.options.split('\n').map(o => o.trim()).filter(Boolean);
      payload.options = JSON.stringify(opts);
    } else if (form.questionType === 'Ordering' && form.options) {
      const opts = form.options.split('\n').map(o => o.trim()).filter(Boolean);
      payload.options = JSON.stringify(opts);
    } else {
      payload.options = null;
    }
    addQ.mutate(payload);
  };

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (!test) return <div className="text-center text-gray-400 mt-20">الاختبار غير موجود</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowRight size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{test.title}</h1>
          <p className="text-sm text-gray-400">{test.questions.length} سؤال | {test.durationMinutes} دقيقة | نجاح: {test.passingScore}%</p>
        </div>
        <span className={test.isPublished ? 'badge-green' : 'badge-yellow'}>{test.isPublished ? 'منشور' : 'مسودة'}</span>
        {!test.isPublished && (
          <button onClick={() => publish.mutate()} className="btn-primary flex items-center gap-2 text-sm" disabled={publish.isPending}>
            <Send size={16} /> نشر الاختبار
          </button>
        )}
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 w-fit gap-1">
        {[{ k: 'questions', l: 'الأسئلة' }, { k: 'results', l: 'النتائج' }].map(({ k, l }) => (
          <button key={k} onClick={() => setTab(k as 'questions'|'results')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : 'text-gray-500'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'questions' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button onClick={() => navigate(`/teacher/tests/${id}/questions/new`)} className="btn-primary flex items-center gap-2">
              <Plus size={18} /> إضافة سؤال
            </button>
            <button onClick={() => setShowModal(true)} className="btn-secondary text-sm flex items-center gap-1 py-2 px-3">
              ⚡ سريع
            </button>
          </div>

          {!test.questions.length ? (
            <div className="card p-10 text-center text-gray-400">
              <CheckSquare size={48} className="mx-auto mb-3 opacity-30" />
              <p>لا توجد أسئلة بعد. أضف أول سؤال!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {test.questions.map((q: Question, i: number) => (
                <div key={q.id} className="card p-5">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">{q.questionText}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="badge-blue">{TYPE_LABELS[q.questionType]}</span>
                        <span className="text-xs text-gray-400">{q.points} نقطة</span>
                        {q.correctAnswer && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            ✓ الإجابة: {q.correctAnswer}
                          </span>
                        )}
                      </div>
                      {q.options && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {JSON.parse(q.options).map((o: string, idx: number) => (
                            <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">{o}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => { if (confirm('حذف السؤال؟')) deleteQ.mutate(q.id); }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'results' && (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">نتائج الطلاب</h3>
          </div>
          {!results?.length ? (
            <div className="p-10 text-center text-gray-400">لم يؤدِّ أي طالب الاختبار بعد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الطالب</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الدرجة</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">النتيجة</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {(results as { id: number; studentName: string; studentEmail: string; percentage: number; passed: boolean; completedAt: string }[]).map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{r.studentName}</p>
                        <p className="text-xs text-gray-400">{r.studentEmail}</p>
                      </td>
                      <td className="px-5 py-3 font-bold text-primary-600">{r.percentage?.toFixed(1)}%</td>
                      <td className="px-5 py-3"><span className={r.passed ? 'badge-green' : 'badge-red'}>{r.passed ? 'ناجح' : 'راسب'}</span></td>
                      <td className="px-5 py-3 text-gray-400">{new Date(r.completedAt).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="إضافة سؤال جديد" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نص السؤال *</label>
            <textarea value={form.questionText} onChange={e => setForm(p => ({ ...p, questionText: e.target.value }))}
              className="input-field resize-none" rows={3} placeholder="اكتب السؤال هنا..." required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع السؤال</label>
              <select value={form.questionType} onChange={e => setForm(p => ({ ...p, questionType: e.target.value, options: '', correctAnswer: '' }))} className="input-field">
                <option value="MultipleChoice">اختياري</option>
                <option value="TrueFalse">صح / خطأ</option>
                <option value="FillBlank">أكمل الفراغ</option>
                <option value="Ordering">ترتيب</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">النقاط</label>
              <input type="number" value={form.points} onChange={e => setForm(p => ({ ...p, points: Number(e.target.value) }))} className="input-field" min={1} />
            </div>
          </div>

          {(form.questionType === 'MultipleChoice' || form.questionType === 'Ordering') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الخيارات (كل خيار في سطر منفصل) *
              </label>
              <textarea value={form.options} onChange={e => setForm(p => ({ ...p, options: e.target.value }))}
                className="input-field resize-none" rows={4} placeholder="الخيار الأول&#10;الخيار الثاني&#10;الخيار الثالث" required />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الإجابة الصحيحة *</label>
            {form.questionType === 'TrueFalse' ? (
              <select value={form.correctAnswer} onChange={e => setForm(p => ({ ...p, correctAnswer: e.target.value }))} className="input-field" required>
                <option value="">اختر...</option>
                <option value="صح">صح</option>
                <option value="خطأ">خطأ</option>
              </select>
            ) : (
              <input value={form.correctAnswer} onChange={e => setForm(p => ({ ...p, correctAnswer: e.target.value }))}
                className="input-field" placeholder={form.questionType === 'Ordering' ? 'مثال: 1,3,2,4' : 'الإجابة الصحيحة'} required />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رابط صورة (اختياري)</label>
            <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} className="input-field" placeholder="https://..." type="url" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={addQ.isPending}>إضافة السؤال</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">إلغاء</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
