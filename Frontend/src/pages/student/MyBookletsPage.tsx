import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../api/payments';
import { BookOpen, Eye, FileText, ArrowLeft, Clock, X, Receipt, Banknote, MessageSquare, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { PaymentRequest } from '../../types';
import { getMediaUrl } from '../../api/client';

export default function MyBookletsPage() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['student-payments'],
    queryFn: paymentsApi.getMy,
  });

  const [viewingPayment, setViewingPayment] = useState<PaymentRequest | null>(null);

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
            <div key={payment.id} onClick={() => setViewingPayment(payment)} className="glass-dark rounded-3xl p-6 border border-gray-800 hover:border-emerald-500/50 transition-colors flex flex-col h-full relative overflow-hidden cursor-pointer">
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
                    <Link to={`/booklets/${payment.bookletId}`} onClick={e => e.stopPropagation()} className="mt-4 w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 transition">
                      <Eye size={18} />
                      فتح تفاصيل الملزمة
                    </Link>
                  ) : payment.status === 'Pending' ? (
                     <div className="mt-4 py-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-500/80 text-sm font-medium flex items-center justify-center gap-2">
                       <Clock size={16} />
                       في انتظار التأكيد من الإدارة
                     </div>
                  ) : null}

                  <button
                    onClick={(e) => { e.stopPropagation(); setViewingPayment(payment); }}
                    className="mt-3 w-full py-2.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-medium rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Receipt size={16} />
                    عرض بيانات الدفع
                  </button>
               </div>
            </div>
          ))
        )}
      </div>

      {viewingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setViewingPayment(null)}>
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-gray-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Receipt className="text-emerald-500" size={20} />
                بيانات الدفع
              </h3>
              <button onClick={() => setViewingPayment(null)} className="p-1 rounded-lg hover:bg-gray-800 text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400 flex items-center gap-1"><BookOpen size={14} /> الملزمة</span>
                <span className="font-medium text-white">{viewingPayment.bookletTitle}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400 flex items-center gap-1"><Banknote size={14} /> سعر الملزمة</span>
                <span className="font-medium text-white">{viewingPayment.bookletPrice} ج.م</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400 flex items-center gap-1"><Banknote size={14} /> المبلغ المدفوع</span>
                <span className="font-bold text-emerald-400">{viewingPayment.amountPaid} ج.م</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">حالة الطلب</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  viewingPayment.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                  viewingPayment.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {viewingPayment.status === 'Approved' ? 'مقبول' :
                   viewingPayment.status === 'Pending' ? 'قيد المراجعة' :
                   'مرفوض'}
                </span>
              </div>

              {viewingPayment.notes && (
                <div className="py-2 border-b border-gray-800">
                  <span className="text-gray-400 flex items-center gap-1 mb-1"><MessageSquare size={14} /> ملاحظاتك</span>
                  <p className="text-gray-300 bg-gray-800/50 p-2 rounded-lg mt-1">{viewingPayment.notes}</p>
                </div>
              )}

              {viewingPayment.adminNote && (
                <div className="py-2 border-b border-gray-800">
                  <span className="text-gray-400 flex items-center gap-1 mb-1"><AlertCircle size={14} /> ملاحظة الإدارة</span>
                  <p className="text-amber-300 bg-amber-500/10 p-2 rounded-lg mt-1">{viewingPayment.adminNote}</p>
                </div>
              )}

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">تاريخ الشراء</span>
                <span className="text-gray-300">{new Date(viewingPayment.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>

            {viewingPayment.receiptImageUrl ? (
              <div>
                <p className="text-sm text-gray-400 mb-2">إيصال الدفع:</p>
                <a href={getMediaUrl(viewingPayment.receiptImageUrl)} target="_blank" rel="noreferrer">
                  <img
                    src={getMediaUrl(viewingPayment.receiptImageUrl)}
                    alt="إيصال الدفع"
                    className="w-full rounded-xl border border-gray-700 object-contain max-h-48 hover:border-emerald-500/50 transition"
                  />
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-3 bg-gray-800/50 rounded-xl">
                لم يتم رفع إيصال للدفع
              </p>
            )}

            <button
              onClick={() => setViewingPayment(null)}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
