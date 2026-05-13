import { useQuery, useMutation } from '@tanstack/react-query';
import { bookletsApi } from '../../api/booklets';
import { paymentsApi } from '../../api/payments';
import { ShoppingCart, Download, CreditCard, CheckCircle, Lock } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';


export default function BookletStorePage() {
  const { data: booklets = [], isLoading } = useQuery({
    queryKey: ['booklets-store'],
    queryFn: () => bookletsApi.getAll(),
  });

  // Filter only paid booklets (or all if you want to show free ones too)
  const storeItems = booklets.filter(b => b.isPublished);

  const initiatePayment = useMutation({
    mutationFn: (bookletId: number) => {
      const booklet = booklets.find(b => b.id === bookletId);
      if (!booklet) throw new Error('الملزمة غير موجودة');
      return paymentsApi.initiateKashier({
        bookletId,
        amountPaid: booklet.price,
        notes: `Purchase of booklet: ${booklet.title}`
      });
    },
    onSuccess: (data) => {
      // Redirect to Kashier
      window.location.href = data.paymentUrl;
    },
    onError: () => toast.error('فشل في بدء عملية الدفع')
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <ShoppingCart className="text-blue-600" size={32} />
            متجر المذكرات الرقمية
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            احصل على أقوى المذكرات التعليمية وحملها فوراً بعد الدفع
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {storeItems.map((booklet) => (
          <BookletCard 
            key={booklet.id} 
            booklet={booklet} 
            onBuy={() => initiatePayment.mutate(booklet.id)}
            isPending={initiatePayment.isPending && initiatePayment.variables === booklet.id}
          />
        ))}
      </div>

      {storeItems.length === 0 && (
        <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10">
          <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد مذكرات متاحة في المتجر حالياً.</p>
        </div>
      )}
    </div>
  );
}

function BookletCard({ booklet, onBuy, isPending }: any) {
  const { data: accessData } = useQuery({
    queryKey: ['booklet-access', booklet.id],
    queryFn: () => paymentsApi.getAccessStatus(undefined, undefined, booklet.id),
    enabled: booklet.price > 0
  });

  const hasAccess = accessData?.hasAccess || booklet.price === 0;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-900">
        {booklet.coverImageUrl ? (
          <img 
            src={booklet.coverImageUrl} 
            alt={booklet.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Download size={64} />
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg border border-white/20">
          <span className="text-lg font-black text-blue-600 dark:text-blue-400">
            {booklet.price > 0 ? `${booklet.price} ج.م` : 'مجانية'}
          </span>
        </div>

        {hasAccess && (
          <div className="absolute top-4 left-4 bg-green-500 text-white p-2 rounded-xl shadow-lg animate-bounce">
            <CheckCircle size={20} />
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full uppercase tracking-wider">
            {booklet.subject || 'عام'}
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 line-clamp-2">
            {booklet.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
            {booklet.description || 'لا يوجد وصف متاح لهذه المذكرة.'}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-3">
          {hasAccess ? (
            <a 
              href={bookletsApi.getDownloadUrl(booklet.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl text-center flex items-center justify-center gap-2 transition-colors"
            >
              <Download size={18} />
              تحميل المذكرة
            </a>
          ) : (
            <button 
              onClick={onBuy}
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isPending ? (
                'جاري التحويل...'
              ) : (
                <>
                  <CreditCard size={18} />
                  شراء الآن
                </>
              )}
            </button>
          )}
          
          {!hasAccess && (
            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-400">
              <Lock size={18} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
