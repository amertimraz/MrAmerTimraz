import { useQuery } from '@tanstack/react-query';
import { challengesApi } from '../../api/challenges';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Layers, Lock, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ChallengesList() {
  const { data: challenges, isLoading } = useQuery({
    queryKey: ['visible-challenges'],
    queryFn: challengesApi.getVisible
  });

  if (isLoading) return <div className="p-12 text-center text-slate-500 font-bold">جاري تحميل ورش العمل...</div>;

  return (
    <div className="p-6 md:p-10 space-y-10" dir="rtl">
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Layers size={28} />
          </div>
          إختبارات Tofas
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl">
          اختبر مهاراتك مع تحديات Tofas التفاعلية. حل المشكلات، حلل الأكواد، وطور مهاراتك البرمجية.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {challenges?.map((challenge, idx) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col"
          >
            {/* Glossy Header Area */}
            <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
               <Brain className="text-white/20 absolute -bottom-4 -left-4" size={120} />
               <div className="relative z-10 flex justify-between items-start">
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                    Workshop #{challenge.id}
                  </div>
                  {challenge.price > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-slate-900 rounded-full text-xs font-black shadow-lg">
                       <Lock size={12} />
                       {challenge.price} ج.م
                    </div>
                  )}
               </div>
            </div>

            <div className="p-8 flex-1 flex flex-col gap-4">
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-primary-600 transition">
                {challenge.title}
              </h3>
              <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                {challenge.description || 'لا يوجد وصف متاح لهذا التحدي التفاعلي.'}
              </p>

              <div className="pt-4 mt-auto flex items-center justify-between border-t border-slate-50">
                 <div className="flex items-center gap-2 text-slate-400">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold">Interactive Experience</span>
                 </div>
                 <Link 
                   to={`/challenges/${challenge.slug}`}
                   className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-slate-200 transition active:scale-95"
                 >
                   إبدأ الآن
                   <PlayCircle size={18} />
                 </Link>
              </div>
            </div>
          </motion.div>
        ))}

        {(!challenges || challenges.length === 0) && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Layers className="text-slate-300" size={40} />
             </div>
             <h3 className="text-xl font-black text-slate-400">لا توجد ورش عمل متاحة حالياً</h3>
             <p className="text-slate-400 mt-2">سيتم إضافة تحديات جديدة قريباً!</p>
          </div>
        )}
      </div>
    </div>
  );
}
