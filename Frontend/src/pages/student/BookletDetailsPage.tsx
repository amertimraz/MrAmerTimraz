import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { bookletsApi } from '../../api/booklets';
import { paymentsApi } from '../../api/payments';
import { BookOpen, AlertCircle, ArrowLeft, Download, Eye, CheckCircle2, Lock } from 'lucide-react';
import React, { useState } from 'react';

export default function BookletDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { data: booklet, isLoading } = useQuery({
    queryKey: ['booklet', id],
    queryFn: () => bookletsApi.getById(Number(id)),
    enabled: !!id
  });

  const { data: paymentStatus, refetch: checkStatus } = useQuery({
    queryKey: ['booklet-payment-status', id],
    queryFn: () => paymentsApi.getStatus(undefined, undefined, Number(id)),
    enabled: !!id
  });

  const { data: accessStatus } = useQuery({
    queryKey: ['booklet-access', id],
    queryFn: () => paymentsApi.getAccessStatus(undefined, undefined, Number(id)),
    enabled: !!id
  });

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booklet || (booklet.price > 0 && !receiptFile)) return;

    setPurchaseStatus('loading');
    try {
      await paymentsApi.createRequest(
        null, // courseId
        booklet.price,
        `شراء ملزمة: ${booklet.title}`,
        receiptFile || undefined,
        null, // sessionId
        booklet.id
      );
      setPurchaseStatus('success');
      checkStatus();
    } catch {
      setPurchaseStatus('error');
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-gray-400">جاري التحميل...</div>;
  if (!booklet) return <div className="p-8 text-center text-red-500 font-bold">الملزمة غير موجودة.</div>;

  const hasAccess = booklet.price === 0 || accessStatus?.hasAccess;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <Link to="/booklets" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        العودة للملازم
      </Link>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
         <div className="md:flex">
           {/* Cover */}
           <div className="md:w-1/3 bg-gray-950 p-8 flex items-center justify-center relative min-h-[300px]">
             {booklet.coverImageUrl ? (
               <img src={booklet.coverImageUrl} alt={booklet.title} className="w-full h-auto object-contain rounded-xl shadow-2xl" />
             ) : (
               <BookOpen size={100} className="text-gray-800" />
             )}
           </div>

           {/* Details */}
           <div className="p-8 md:w-2/3 flex flex-col">
              <div className="flex gap-2 mb-4">
                 {booklet.subject && <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold">{booklet.subject}</span>}
                 {booklet.gradeLevel && <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold">{booklet.gradeLevel}</span>}
              </div>

              <h1 className="text-3xl font-black text-white mb-4 leading-tight">{booklet.title}</h1>
              <p className="text-gray-400 leading-relaxed mb-8 flex-1">{booklet.description || 'لا يوجد وصف متاح لهذه الملزمة.'}</p>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 mb-6">
                <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">السعر المطلوب</p>
                   <p className="text-2xl font-black text-white flex items-baseline gap-1">
                      {booklet.price > 0 ? booklet.price : 'مجاناً'}
                      {booklet.price > 0 && <span className="text-sm text-indigo-400">ج.م</span>}
                   </p>
                </div>
                
                {hasAccess ? (
                  <div className="flex gap-3">
                    <a href={booklet.pdfUrl} target="_blank" rel="noreferrer" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-lg shadow-indigo-500/20">
                      <Eye size={20} />
                      عرض
                    </a>
                    <a href={booklet.pdfUrl} download className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl flex items-center gap-2 transition">
                      <Download size={20} />
                      تحميل
                    </a>
                  </div>
                ) : (
                  <div className="text-amber-500 font-bold flex items-center gap-2">
                    <Lock size={20} />
                    يتطلب الشراء
                  </div>
                )}
              </div>

              {/* Purchase Section */}
              {!hasAccess && (
                <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-2xl p-6">
                  {purchaseStatus === 'success' || paymentStatus?.hasPendingOrApproved ? (
                    <div className="text-emerald-400 flex items-center gap-3">
                      <CheckCircle2 size={24} />
                      <div>
                        <p className="font-bold">طلبك قيد المراجعة!</p>
                        <p className="text-sm opacity-80 mt-1">سيتم تفعيل الملزمة فور تأكيد الدفع من الإدارة.</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handlePurchase} className="space-y-4">
                       <h3 className="text-white font-bold mb-2">لشراء الملزمة:</h3>
                       <p className="text-sm text-gray-400 mb-4">يرجى تحويل المبلغ ({booklet.price} ج.م) ثم رفع صورة إيصال التحويل هنا.</p>
                       
                       <div>
                         <label className="block text-sm text-gray-400 mb-1.5 font-medium">صورة إيصال التحويل</label>
                         <input
                           type="file"
                           accept="image/*"
                           required
                           onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                           className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 transition cursor-pointer"
                         />
                       </div>

                       {purchaseStatus === 'error' && (
                         <div className="flex gap-2 text-red-400 text-sm mt-2">
                           <AlertCircle size={16} />
                           <span>حدث خطأ، يرجى المحاولة مرة أخرى.</span>
                         </div>
                       )}

                       <button
                         type="submit"
                         disabled={purchaseStatus === 'loading' || !receiptFile}
                         className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition"
                       >
                         {purchaseStatus === 'loading' ? 'جاري إرسال الطلب...' : 'تأكيد ودفع'}
                       </button>
                    </form>
                  )}
                </div>
              )}
           </div>
         </div>
      </div>
    </div>
  );
}
