import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesApi } from '../../api/challenges';
import type { TofasTest, Challenge, ChallengeSnippet } from '../../api/challenges';
import { 
  Plus, Edit2, Trash2, X, PlusCircle, 
  Code as CodeIcon, Brain, Layout,
  Settings, Clock, ChevronLeft, ChevronRight, ListOrdered
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function AdminChallenges() {
  const queryClient = useQueryClient();
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  
  const [editingTest, setEditingTest] = useState<Partial<TofasTest> | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Challenge> | null>(null);

  const { data: tests, isLoading } = useQuery({
    queryKey: ['admin-challenges'],
    queryFn: challengesApi.getAllAdmin
  });

  // --- Test Mutations ---
  const createTestMutation = useMutation({
    mutationFn: challengesApi.createTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('تم إنشاء الاختبار بنجاح');
      setIsTestModalOpen(false);
    },
    onError: (err: any) => toast.error('خطأ في إنشاء الاختبار')
  });

  const updateTestMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<TofasTest> }) => challengesApi.updateTest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('تم تحديث الاختبار بنجاح');
      setIsTestModalOpen(false);
    }
  });

  const deleteTestMutation = useMutation({
    mutationFn: challengesApi.deleteTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('تم حذف الاختبار');
    }
  });

  // --- Question Mutations ---
  const addQuestionMutation = useMutation({
    mutationFn: ({ testId, data }: { testId: number, data: Partial<Challenge> }) => challengesApi.addQuestion(testId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('تم إضافة السؤال بنجاح');
      setIsQuestionModalOpen(false);
    }
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Challenge> }) => challengesApi.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('تم تحديث السؤال بنجاح');
      setIsQuestionModalOpen(false);
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: challengesApi.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('تم حذف السؤال');
    }
  });

  const handleEditTest = (test: TofasTest) => {
    setEditingTest({ ...test });
    setIsTestModalOpen(true);
  };

  const handleManageQuestions = (testId: number) => {
    setSelectedTestId(testId);
  };

  const handleEditQuestion = (question: Challenge) => {
    setEditingQuestion({ ...question });
    setIsQuestionModalOpen(true);
  };

  const handleAddQuestion = () => {
    if (!selectedTestId) return;
    const test = tests?.find(t => t.id === selectedTestId);
    setEditingQuestion({ 
      testId: selectedTestId, 
      title: '', 
      slug: `q-${Date.now()}`, 
      description: '', 
      targetOutput: '', 
      orderIndex: (test?.questions?.length || 0) + 1,
      snippets: [] 
    });
    setIsQuestionModalOpen(true);
  };

  const handleAddSnippet = () => {
    if (!editingQuestion) return;
    const snippets = editingQuestion.snippets || [];
    setEditingQuestion({
      ...editingQuestion,
      snippets: [
        ...snippets,
        { code: '', analysisType: 'Logic', analysisMessage: '', orderIndex: snippets.length + 1 }
      ]
    });
  };

  const handleRemoveSnippet = (index: number) => {
    if (!editingQuestion) return;
    const snippets = [...(editingQuestion.snippets || [])];
    snippets.splice(index, 1);
    setEditingQuestion({ ...editingQuestion, snippets });
  };

  const handleSnippetChange = (index: number, field: keyof ChallengeSnippet, value: any) => {
    if (!editingQuestion) return;
    const snippets = [...(editingQuestion.snippets || [])];
    snippets[index] = { ...snippets[index], [field]: value };
    setEditingQuestion({ ...editingQuestion, snippets });
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest) return;
    if (editingTest.id) {
      updateTestMutation.mutate({ id: editingTest.id, data: editingTest });
    } else {
      createTestMutation.mutate(editingTest);
    }
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !selectedTestId) return;
    if (editingQuestion.id) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, data: editingQuestion });
    } else {
      addQuestionMutation.mutate({ testId: selectedTestId, data: editingQuestion });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">جاري التحميل...</div>;

  const currentTest = tests?.find(t => t.id === selectedTestId);

  return (
    <div className="p-6 space-y-8" dir="rtl">
      {/* Header */}
      <AnimatePresence mode="wait">
        {!selectedTestId ? (
          <motion.div 
            key="test-list-header"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                <Layout className="text-primary-500" size={32} />
                إدارة إختبارات Tofas
              </h1>
              <p className="text-slate-500 mt-1 font-medium">أنشئ اختبارات برمجية كاملة تحتوي على عدة أسئلة تفاعلية.</p>
            </div>
            <button 
              onClick={() => { setEditingTest({ title: '', slug: '', description: '', price: 0, isVisible: true, timeLimitMinutes: 15 }); setIsTestModalOpen(true); }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 transition"
            >
              <Plus size={20} />
              إضافة اختبار جديد
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="question-list-header"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="flex items-center justify-between bg-slate-50 p-6 rounded-[2rem] border border-slate-100"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedTestId(null)}
                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary-500 transition"
              >
                <ChevronRight size={24} />
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-800">{currentTest?.title}</h2>
                <p className="text-slate-500 text-xs font-bold">إدارة الأسئلة ({currentTest?.questions?.length || 0} أسئلة)</p>
              </div>
            </div>
            <button 
              onClick={handleAddQuestion}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg"
            >
              <PlusCircle size={20} />
              إضافة سؤال للاختبار
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!selectedTestId ? (
          <motion.div 
            key="test-grid"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {tests?.map(test => (
              <div key={test.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group">
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-500">
                      <Brain size={24} />
                    </div>
                    <div className="flex gap-1">
                       <button onClick={() => handleEditTest(test)} className="p-2 text-slate-400 hover:text-blue-500 transition"><Edit2 size={18} /></button>
                       <button onClick={() => { if(window.confirm('حذف الاختبار بالكامل؟')) deleteTestMutation.mutate(test.id); }} className="p-2 text-slate-400 hover:text-rose-500 transition"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{test.title}</h3>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-1">{test.description || 'لا يوجد وصف'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black flex items-center gap-1">
                      <Clock size={12} /> {test.timeLimitMinutes}د
                    </span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black flex items-center gap-1">
                      <ListOrdered size={12} /> {test.questions?.length || 0} أسئلة
                    </span>
                    {test.price > 0 ? (
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black">{test.price} ج.م</span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black">مجاني</span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-50">
                    <button 
                      onClick={() => handleManageQuestions(test.id)}
                      className="w-full bg-slate-900 group-hover:bg-primary-600 text-white py-3 rounded-2xl font-black transition-all flex items-center justify-center gap-2"
                    >
                      إدارة الأسئلة
                      <ChevronLeft size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {tests?.length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <Layout size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-black text-slate-400">لا توجد اختبارات حالياً</h3>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="question-list"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            {currentTest?.questions?.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{q.title}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-slate-400 font-bold">المخرج: <code className="bg-slate-50 px-2 py-0.5 rounded">{q.targetOutput}</code></span>
                      <span className="text-xs text-slate-400 font-bold">{q.snippets?.length || 0} خيارات (Snippets)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => handleEditQuestion(q)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"><Edit2 size={18} /></button>
                   <button onClick={() => { if(window.confirm('حذف هذا السؤال؟')) deleteQuestionMutation.mutate(q.id); }} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
            {(!currentTest?.questions || currentTest.questions.length === 0) && (
              <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <CodeIcon size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-black text-slate-400">لا توجد أسئلة في هذا الاختبار بعد</h3>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Modal (Create/Edit Test) */}
      <AnimatePresence>
        {isTestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTestModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-8 space-y-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                 <Settings className="text-primary-500" />
                 {editingTest?.id ? 'تعديل الاختبار' : 'إنشاء اختبار Tofas'}
              </h2>
              <form onSubmit={handleTestSubmit} className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 pr-2 italic">عنوان الاختبار</label>
                      <input required value={editingTest?.title || ''} onChange={e => setEditingTest({...editingTest!, title: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-primary-500 transition" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-black text-slate-700 pr-2 italic">الرابط (Slug)</label>
                       <input required value={editingTest?.slug || ''} onChange={e => setEditingTest({...editingTest!, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-primary-500 transition font-mono" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 pr-2 italic">الوصف</label>
                    <textarea value={editingTest?.description || ''} onChange={e => setEditingTest({...editingTest!, description: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-primary-500 transition min-h-[80px]" />
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                       <label className="text-sm font-black text-slate-700 pr-2 italic">السعر</label>
                       <input type="number" value={editingTest?.price || 0} onChange={e => setEditingTest({...editingTest!, price: Number(e.target.value)})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-primary-500 transition text-center font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-black text-slate-700 pr-2 italic">الوقت (د)</label>
                       <input type="number" value={editingTest?.timeLimitMinutes || 0} onChange={e => setEditingTest({...editingTest!, timeLimitMinutes: Number(e.target.value)})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-primary-500 transition text-center font-bold" />
                    </div>
                    <div className="flex items-center justify-center pt-6">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={editingTest?.isVisible || false} onChange={e => setEditingTest({...editingTest!, isVisible: e.target.checked})} className="w-5 h-5 accent-primary-500" />
                          <span className="text-sm font-black text-slate-700 italic">مرئي للطلاب</span>
                       </label>
                    </div>
                 </div>
                 <div className="flex gap-3 justify-end pt-4">
                    <button type="button" onClick={() => setIsTestModalOpen(false)} className="px-6 py-3 font-bold text-slate-400">إلغاء</button>
                    <button type="submit" className="bg-primary-600 text-white px-10 py-3 rounded-2xl font-black shadow-lg shadow-primary-500/20 active:scale-95 transition">حفظ التغييرات</button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Question Modal (Create/Edit Question) */}
      <AnimatePresence>
        {isQuestionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsQuestionModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <CodeIcon className="text-primary-500" />
                    {editingQuestion?.id ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
                 </h2>
                 <button onClick={() => setIsQuestionModalOpen(false)} className="p-2 hover:bg-white rounded-2xl transition text-slate-400"><X /></button>
              </div>
              <form onSubmit={handleQuestionSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-sm font-black text-slate-700 pr-2 italic">عنوان السؤال</label>
                       <input required value={editingQuestion?.title || ''} onChange={e => setEditingQuestion({...editingQuestion!, title: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-primary-500 transition" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-black text-slate-700 pr-2 italic">المخرج المطلوب (Output)</label>
                       <input required value={editingQuestion?.targetOutput || ''} onChange={e => setEditingQuestion({...editingQuestion!, targetOutput: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-primary-500 transition font-mono font-bold text-center" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 pr-2 italic">وصف السؤال</label>
                    <textarea value={editingQuestion?.description || ''} onChange={e => setEditingQuestion({...editingQuestion!, description: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-primary-500 transition min-h-[80px]" />
                 </div>

                 {/* Snippets Area */}
                 <div className="space-y-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                       <h3 className="text-lg font-black text-slate-800">صناديق الأكواد ( Snippets )</h3>
                       <button type="button" onClick={handleAddSnippet} className="text-primary-600 font-bold flex items-center gap-1"><PlusCircle size={18} /> إضافة خيار</button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       {editingQuestion?.snippets?.map((s, idx) => (
                         <div key={idx} className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4 relative group">
                            <button type="button" onClick={() => handleRemoveSnippet(idx)} className="absolute -top-2 -left-2 w-8 h-8 bg-white border border-rose-100 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"><X size={14} /></button>
                            <div className="flex items-center gap-4">
                               <select value={s.analysisType} onChange={e => handleSnippetChange(idx, 'analysisType', e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold font-italic decoration-dotted">
                                  <option value="Correct">إجابة صحيحة</option>
                                  <option value="Syntax">خطأ قواعدي</option>
                                  <option value="Logic">خطأ منطقي</option>
                               </select>
                            </div>
                            <textarea value={s.code} onChange={e => handleSnippetChange(idx, 'code', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-4 font-mono text-sm min-h-[100px] outline-none" placeholder="اكتب الكود هنا..." />
                            <input value={s.analysisMessage} onChange={e => handleSnippetChange(idx, 'analysisMessage', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs italic" placeholder="شرح لماذا هذا الخيار صحيح أو خاطئ..." />
                         </div>
                       ))}
                    </div>
                 </div>
              </form>
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                 <button onClick={() => setIsQuestionModalOpen(false)} className="px-6 py-3 font-bold text-slate-400">إلغاء</button>
                 <button onClick={handleQuestionSubmit} className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-black shadow-lg active:scale-95 transition">حفظ السؤال</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
