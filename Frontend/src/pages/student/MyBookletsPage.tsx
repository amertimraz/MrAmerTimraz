import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../api/payments';
import { BookOpen, Eye, FileText, ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyBookletsPage() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['student-payments'],
    queryFn: paymentsApi.getMy,
  });

  const bookletPayments = payments?.filter(p => p.bookletId != null) || [];

  if (isLoading) return <div className="p-8 text-center text-gray-400 animate-pulse">جاري التحميل...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-2xl">
            <BookOpen className="text-emerald-500" size={28} />
          </div>
          ملازمي
        </h1>
        <p className="text-gray-400 mt-2 font-medium">الملازم والمذكرات التي قمت بشرائها.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookletPayments.length === 0 ? (
          <div className="col-span-full text-center py-20 glass-dark rounded-3xl border border-gray-800">
             <FileText size={64} className="mx-auto text-gray-700 mb-4" />
             <p className="text-gray-400 text-lg mb-6">لم تقم بشراء أي ملازم حتى الآن.</p>
             <Link to="/booklets" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition">
               تصفح الملازم المتاحة
               <ArrowLeft size={18} />
             </Link>
          </div>
        ) : (
          bookletPayments.map(payment => (
            <div key={payment.id} className="glass-dark rounded-3xl p-6 border border-gray-800 hover:border-emerald-500/50 transition-colors flex flex-col h-full relative overflow-hidden">
               {payment.status === 'Pending' && (
                 <div className="absolute top-0 right-0 w-full h-1 bg-amber-500" title="قيد المراجعة" />
               )}
               {payment.status === 'Approved' && (
                 <div className="absolute top-0 right-0 w-full h-1 bg-emerald-500" title="مقبول" />
               )}
               {payment.status === 'Rejected' && (
                 <div className="absolute top-0 right-0 w-full h-1 bg-red-500" title="مرفوض" />
               )}

               <div className="flex items-start gap-4 mb-6">
                 <div className={`p-4 rounded-2xl ${payment.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                   <BookOpen size={28} />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-lg font-bold text-white leading-tight mb-1">{payment.bookletTitle}</h3>
                   <div className="flex items-center gap-2 mt-2">
                     <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                       payment.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                       payment.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                       'bg-red-500/20 text-red-400'
                     }`}>
                       {payment.status === 'Approved' ? 'متاح للتحميل' :
                        payment.status === 'Pending' ? 'قيد المراجعة' :
                        'مرفوض'}
                     </span>
                   </div>
                 </div>
               </div>

               <div className="mt-auto pt-6 border-t border-gray-800 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">تاريخ الشراء:</span>
                    <span className="text-gray-300">{new Date(payment.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                  
                  {payment.status === 'Approved' ? (
                    <Link to={`/booklets/${payment.bookletId}`} className="mt-4 w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 transition">
                      <Eye size={18} />
                      فتح تفاصيل الملزمة
                    </Link>
                  ) : payment.status === 'Pending' ? (
                     <div className="mt-4 py-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-500/80 text-sm font-medium flex items-center justify-center gap-2">
                       <Clock size={16} />
                       في انتظار التأكيد من الإدارة
                     </div>
                  ) : null}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
