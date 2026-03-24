import { useQuery } from '@tanstack/react-query';
import { bookletsApi } from '../../api/booklets';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BookletsPage() {
  const navigate = useNavigate();

  const { data: booklets, isLoading } = useQuery({
    queryKey: ['student-booklets'],
    queryFn: () => bookletsApi.getAll(false), // only published
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-pulse">
        <div className="h-8 bg-gray-800 rounded-lg w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-900 border border-gray-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <div className="p-3 bg-indigo-500/10 rounded-2xl">
               <BookOpen className="text-indigo-500" size={28} />
             </div>
             الملازم الدراسية الخاصة
          </h1>
          <p className="text-gray-400 mt-2 font-medium">مذكرات حصرية، مراجعات نهائية، وتلخيصات شاملة.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {booklets?.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-dark border-gray-800 rounded-3xl">
            <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">لا توجد ملازم متاحة في الوقت الحالي.</p>
          </div>
        ) : (
          booklets?.map(booklet => (
            <div key={booklet.id} className="group relative glass-dark rounded-3xl overflow-hidden border border-white/5 flex flex-col h-full hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
              <div className="aspect-[4/3] bg-gray-950 relative overflow-hidden flex items-center justify-center p-6">
                 {booklet.coverImageUrl ? (
                   <img src={booklet.coverImageUrl} alt={booklet.title} className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                   <BookOpen size={64} className="text-indigo-500/20" />
                 )}
                 <div className="absolute top-4 left-4">
                   <div className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-white shadow-xl flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     {booklet.subject || 'مادة عامة'}
                   </div>
                 </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">{booklet.title}</h3>
                <p className="text-sm text-gray-400 mb-6 line-clamp-3 leading-relaxed flex-1">{booklet.description}</p>
                
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">السعر</p>
                    <p className="text-2xl font-black text-white flex items-baseline gap-1">
                      {booklet.price > 0 ? booklet.price : 'مجاناً'}
                      {booklet.price > 0 && <span className="text-sm text-indigo-400">ج.م</span>}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/booklets/${booklet.id}`)}
                    className="h-10 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition active:scale-95"
                  >
                    تفاصيل وشراء
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
