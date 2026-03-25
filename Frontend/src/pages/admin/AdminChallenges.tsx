import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesApi } from '../../api/challenges';
import type { Challenge, ChallengeSnippet } from '../../api/challenges';
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, Save, X, PlusCircle, 
  Code as CodeIcon, AlertCircle, Brain, Layout,
  Settings, DollarSign, Link as LinkIcon, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function AdminChallenges() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Partial<Challenge> | null>(null);

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['admin-challenges'],
    queryFn: challengesApi.getAllAdmin
  });

  const createMutation = useMutation({
    mutationFn: challengesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('تم إنشاء التحدي بنجاح');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      const errorData = err.response?.data;
      const errorMessage = typeof errorData === 'string' ? errorData : (errorData?.message || errorData?.title || 'خطأ في إنشاء التحدي');
      toast.error(errorMessage);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Challenge> }) => challengesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('تم تحديث التحدي بنجاح');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      const errorData = err.response?.data;
      const errorMessage = typeof errorData === 'string' ? errorData : (errorData?.message || errorData?.title || 'خطأ في تحديث التحدي');
      toast.error(errorMessage);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: challengesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('تم حذف التحدي');
    }
  });

  const handleEdit = (challenge: Challenge) => {
    setEditingChallenge({ ...challenge });
    setIsModalOpen(true);
  };

  const handleAddSnippet = () => {
    if (!editingChallenge) return;
    const snippets = editingChallenge.snippets || [];
    setEditingChallenge({
      ...editingChallenge,
      snippets: [
        ...snippets,
        { code: '', analysisType: 'Logic', analysisMessage: '', orderIndex: snippets.length + 1 }
      ]
    });
  };

  const handleRemoveSnippet = (index: number) => {
    if (!editingChallenge) return;
    const snippets = [...(editingChallenge.snippets || [])];
    snippets.splice(index, 1);
    setEditingChallenge({ ...editingChallenge, snippets });
  };

  const handleSnippetChange = (index: number, field: keyof ChallengeSnippet, value: any) => {
    if (!editingChallenge) return;
    const snippets = [...(editingChallenge.snippets || [])];
    snippets[index] = { ...snippets[index], [field]: value };
    setEditingChallenge({ ...editingChallenge, snippets });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallenge) return;
    
    if (!editingChallenge.title?.trim() || !editingChallenge.slug?.trim()) {
      toast.error('يرجى إدخال العنوان والرابط (Slug)');
      return;
    }

    if (editingChallenge.id) {
      updateMutation.mutate({ id: editingChallenge.id, data: editingChallenge });
    } else {
      createMutation.mutate(editingChallenge);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Layout className="text-primary-500" size={32} />
            إدارة إختبارات Tofas
          </h1>
          <p className="text-slate-500 mt-1 font-medium">تحكم في التحديات، الأسعار، والروابط الخاصة بإختبارات Tofas.</p>
        </div>
        <button 
          onClick={() => { setEditingChallenge({ title: '', slug: '', description: '', targetOutput: '', price: 0, isVisible: true, snippets: [] }); setIsModalOpen(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 transition"
        >
          <Plus size={20} />
          إضافة تحدي جديد
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 font-black text-slate-600">التحدي</th>
              <th className="p-5 font-black text-slate-600">الرابط (Slug)</th>
              <th className="p-5 font-black text-slate-600 text-center">السعر</th>
              <th className="p-5 font-black text-slate-600 text-center">الظهور</th>
              <th className="p-5 font-black text-slate-600 text-center">العمليات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {challenges?.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition duration-300">
                <td className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                      <CodeIcon size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{c.title}</div>
                      <div className="text-xs text-slate-400 font-medium">أنشئ في {new Date().toLocaleDateString('ar-EG')}</div>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs bg-slate-100 px-3 py-1 rounded-lg text-slate-600 w-fit">
                      {c.slug}
                    </span>
                    <div className="text-[10px] text-blue-500 font-bold truncate max-w-[200px]" dir="ltr">
                      {window.location.origin}/challenges/{c.slug}
                    </div>
                  </div>
                </td>
                <td className="p-5 text-center">
                  {c.price === 0 ? (
                    <span className="text-emerald-600 font-black">مجاني</span>
                  ) : (
                    <span className="text-slate-800 font-black">{c.price} ج.م</span>
                  )}
                </td>
                <td className="p-5 text-center">
                  {c.isVisible ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
                      <Eye size={14} /> مرئي
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-50 px-3 py-1 rounded-full text-xs font-bold">
                      <EyeOff size={14} /> مخفي
                    </span>
                  )}
                </td>
                <td className="p-5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={18} /></button>
                    <button 
                      onClick={() => { if(window.confirm('هل أنت متأكد من حذف هذا التحدي؟')) deleteMutation.mutate(c.id); }}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    ><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <Settings className="text-primary-500" />
                  {editingChallenge?.id ? 'تعديل التحدي' : 'إنشاء تحدي جديد'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-2xl transition text-slate-400"><X /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 pr-2">عنوان التحدي</label>
                    <input 
                      required value={editingChallenge?.title || ''} 
                      onChange={e => setEditingChallenge({ ...editingChallenge!, title: e.target.value })}
                      placeholder="مثلاً: اللغز الأول: العمليات الحسابية"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 pr-2 flex items-center gap-2">
                      <LinkIcon size={14} /> الرابط (Slug)
                    </label>
                    <input 
                      required value={editingChallenge?.slug || ''} 
                      onChange={e => setEditingChallenge({ ...editingChallenge!, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                      placeholder="programming-puzzle-1"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 pr-2">وصف التحدي (اختياري)</label>
                  <textarea 
                    value={editingChallenge?.description || ''} 
                    onChange={e => setEditingChallenge({ ...editingChallenge!, description: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 min-h-[100px] outline-none"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 pr-2 flex items-center gap-2">
                      <Brain size={14} className="text-primary-500" /> المخرج المطلوب (Target Output)
                    </label>
                    <input 
                      required value={editingChallenge?.targetOutput || ''} 
                      onChange={e => setEditingChallenge({ ...editingChallenge!, targetOutput: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-mono font-bold text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 pr-2 flex items-center gap-2">
                      <DollarSign size={14} className="text-emerald-500" /> السعر (0 للمجاني)
                    </label>
                    <input 
                      type="number" value={editingChallenge?.price || 0} 
                      onChange={e => setEditingChallenge({ ...editingChallenge!, price: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 pr-2 flex items-center gap-2">
                      <Clock className="text-amber-500" size={14} /> الوقت (بالدقائق)
                    </label>
                    <input 
                      type="number" value={editingChallenge?.timeLimitMinutes || 15} 
                      onChange={e => setEditingChallenge({ ...editingChallenge!, timeLimitMinutes: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-center"
                    />
                  </div>
                  <div className="flex flex-col justify-end pb-3 pr-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" checked={editingChallenge?.isVisible || false}
                          onChange={e => setEditingChallenge({ ...editingChallenge!, isVisible: e.target.checked })}
                          className="sr-only p-4"
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${editingChallenge?.isVisible ? 'bg-primary-500' : 'bg-slate-300'}`}>
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${editingChallenge?.isVisible ? 'left-1' : 'left-7'}`} />
                        </div>
                      </div>
                      <span className="text-sm font-black text-slate-700 italic">ظهور للطلاب</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                      <CodeIcon size={20} className="text-primary-500" />
                      الأكواد البرمجية (Snippets)
                    </h3>
                    <button 
                      type="button" onClick={handleAddSnippet}
                      className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1.5 transition"
                    >
                      <PlusCircle size={18} /> إضافة صندوق كود
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editingChallenge?.snippets?.map((s, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-[2rem] p-6 border-2 border-slate-100 space-y-4 relative group">
                        <button 
                          type="button" onClick={() => handleRemoveSnippet(idx)}
                          className="absolute -top-3 -left-3 w-8 h-8 bg-white border-2 border-rose-100 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center font-black text-slate-400 text-xs">#{idx + 1}</span>
                          <select 
                             value={s.analysisType}
                             onChange={e => handleSnippetChange(idx, 'analysisType', e.target.value)}
                             className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none"
                          >
                            <option value="Correct">إجابة صحيحة</option>
                            <option value="Syntax">خطأ قواعدي (Syntax)</option>
                            <option value="Logic">خطأ منطقي (Logic)</option>
                          </select>
                        </div>

                        <textarea 
                          value={s.code} 
                          onChange={e => handleSnippetChange(idx, 'code', e.target.value)}
                          placeholder="اكتب الكود هنا..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-4 font-mono text-sm min-h-[120px] outline-none"
                        />

                        <div className="flex items-start gap-4">
                          <div className="bg-white border border-slate-200 p-2 rounded-xl text-primary-500 mt-1">
                            <AlertCircle size={18} />
                          </div>
                          <textarea 
                             value={s.analysisMessage}
                             onChange={e => handleSnippetChange(idx, 'analysisMessage', e.target.value)}
                             placeholder="اشرح هنا لماذا هذا الكود صحيح أو خاطئ..."
                             className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none"
                          />
                        </div>
                      </div>
                    ))}
                    {(!editingChallenge?.snippets || editingChallenge.snippets.length === 0) && (
                      <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        لا توجد صناديق أكواد. ابدأ بإضافة واحد لتحديك.
                      </div>
                    )}
                  </div>
                </div>
              </form>

              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                 <button 
                   type="button" onClick={() => setIsModalOpen(false)}
                   className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-white transition"
                 >
                   إلغاء
                 </button>
                 <button 
                   onClick={handleSubmit} 
                   className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-3 rounded-2xl font-black shadow-lg shadow-primary-500/20 active:scale-95 transition"
                 >
                   <Save size={20} className="inline-block ml-2" />
                   حفظ التحدي
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
