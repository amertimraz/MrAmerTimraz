import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { quizzesApi } from '../api/quizzes';
import { Video, BookOpen, ChevronLeft, Search, Filter, Sparkles, Trophy, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function RevisionHub() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['interactive-quizzes'],
    queryFn: quizzesApi.getAll,
  });

  const subjects = Array.from(new Set(quizzes?.map(q => q.subject).filter(Boolean))) as string[];

  const filteredQuizzes = quizzes?.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) || 
                         q.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = !selectedSubject || q.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 md:p-8" dir="rtl">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] -mr-48 -mt-48 rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-right">
              <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-4 py-1 rounded-full backdrop-blur-md border border-white/20">
                <Sparkles size={16} className="text-yellow-300" />
                <span className="text-sm font-bold">نظام المراجعة الذكي</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                المراجعة التفاعلية <br /> <span className="text-indigo-200">بأسلوب مبتكر</span>
              </h1>
              <p className="text-indigo-100 text-lg max-w-xl font-medium leading-relaxed">
                استعد للامتحانات بطريقة ممتعة وتفاعلية. اختر المادة وابدأ المراجعة الآن مع حلول فورية وشرح مبسط لكل سؤال.
              </p>
            </div>
            <div className="w-64 h-64 bg-white/10 rounded-[3rem] backdrop-blur-2xl border border-white/20 flex items-center justify-center relative group">
               <Video size={100} className="text-white group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-slate-900 px-6 py-2 rounded-2xl font-black shadow-xl">جديد 🔥</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="بحث عن مراجعة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border-none rounded-2xl py-4 pr-12 pl-4 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700 dark:text-white"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setSelectedSubject(null)}
            className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${!selectedSubject ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100'}`}
          >
            الكل
          </button>
          {subjects.map(s => (
            <button 
              key={s}
              onClick={() => setSelectedSubject(s)}
              className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${selectedSubject === s ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredQuizzes?.map((quiz, i) => (
          <motion.div 
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className="group bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-slate-100 dark:border-white/5"
          >
            <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-900 relative">
              {quiz.coverImageUrl ? (
                <img src={quiz.coverImageUrl} alt={quiz.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                  <BookOpen size={48} className="text-indigo-200" />
                </div>
              )}
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-xs font-black text-indigo-600 shadow-sm">
                {quiz.subject || 'عام'}
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-500 transition-colors">
                {quiz.title}
              </h3>
              <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                {quiz.description || 'مراجعة تفاعلية شاملة لمادة ' + (quiz.subject || 'التكنولوجيا') + ' بأسلوب حديث.'}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle size={16} className="text-indigo-400" />
                    <span className="text-xs font-bold">{quiz.questionCount} سؤال</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/interactive-revision/${quiz.id}`)}
                  className="w-12 h-12 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white rounded-2xl flex items-center justify-center transition-all group/btn"
                >
                  <ChevronLeft size={24} className="group-hover/btn:-translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredQuizzes?.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">لم يتم العثور على مراجعات</h3>
          <p className="text-slate-500">حاول البحث بكلمات أخرى أو اختر مادة مختلفة</p>
        </div>
      )}
    </div>
  );
}
