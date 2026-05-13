import { useQuery, useMutation } from '@tanstack/react-query';
import { bookletsApi } from '../../api/booklets';
import { paymentsApi } from '../../api/payments';
import { ShoppingCart, Download, CreditCard, CheckCircle, Lock, User as UserIcon, Phone } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function BookletStorePage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const guestToken = searchParams.get('token');
  const guestBookletId = searchParams.get('bookletId');

  const { data: booklets = [], isLoading } = useQuery({
    queryKey: ['booklets-store'],
    queryFn: () => bookletsApi.getAll(),
  });

  const [selectedBooklet, setSelectedBooklet] = useState<any>(null);
  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '' });

  const initiatePayment = useMutation({
    mutationFn: (booklet: any) => {
      return paymentsApi.initiateKashier({
        bookletId: booklet.id,
        amountPaid: booklet.price,
        notes: `Purchase of booklet: ${booklet.title}`,
        guestName: !user ? guestInfo.name : undefined,
        guestPhone: !user ? guestInfo.phone : undefined
      });
    },
    onSuccess: (data) => {
      window.location.href = data.paymentUrl;
    },
    onError: () => toast.error('فشل في بدء عملية الدفع')
  });

  const handleBuyClick = (booklet: any) => {
    if (!user) {
      setSelectedBooklet(booklet);
    } else {
      initiatePayment.mutate(booklet);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" />;

  const storeItems = booklets.filter(b => b.isPublished);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-white dark:bg-[#0f172a]" dir="rtl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
          <span className="text-blue-600">متجر</span> المذكرات التعليمية
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          اختر مذكرتك، ادفع بسهولة، وحمل المحتوى فوراً. لا يشترط وجود حساب!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {storeItems.map((booklet) => (
          <BookletCard 
            key={booklet.id} 
            booklet={booklet} 
            onBuy={() => handleBuyClick(booklet)}
            isPending={initiatePayment.isPending && initiatePayment.variables?.id === booklet.id}
            guestToken={Number(guestBookletId) === booklet.id ? guestToken : null}
          />
        ))}
      </div>

      {/* Guest Info Modal */}
      {selectedBooklet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="text-blue-600" />
              بيانات المشتري
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">الاسم بالكامل</label>
                <div className="relative">
                  <UserIcon className="absolute right-3 top-3 text-gray-400" size={20} />
                  <input 
                    type="text"
                    value={guestInfo.name}
                    onChange={e => setGuestInfo({...guestInfo, name: e.target.value})}
                    placeholder="أدخل اسمك"
                    className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 text-gray-400" size={20} />
                  <input 
                    type="tel"
                    value={guestInfo.phone}
                    onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})}
                    placeholder="رقم الواتساب للتواصل"
                    className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => initiatePayment.mutate(selectedBooklet)}
                disabled={!guestInfo.name || !guestInfo.phone || initiatePayment.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-2xl transition-all"
              >
                {initiatePayment.isPending ? 'جاري التحويل...' : 'تأكيد ودفع'}
              </button>
              <button 
                onClick={() => setSelectedBooklet(null)}
                className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold py-4 rounded-2xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookletCard({ booklet, onBuy, isPending, guestToken }: any) {
  const { user } = useAuthStore();
  const { data: accessData } = useQuery({
    queryKey: ['booklet-access', booklet.id],
    queryFn: () => paymentsApi.getAccessStatus(undefined, undefined, booklet.id),
    enabled: !!user && booklet.price > 0
  });

  const hasAccess = accessData?.hasAccess || booklet.price === 0 || !!guestToken;
  const downloadUrl = guestToken 
    ? `${bookletsApi.getDownloadUrl(booklet.id)}?token=${guestToken}`
    : bookletsApi.getDownloadUrl(booklet.id);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
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
        
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg border border-white/20">
          <span className="text-lg font-black text-blue-600 dark:text-blue-400">
            {booklet.price > 0 ? `${booklet.price} ج.م` : 'مجانية'}
          </span>
        </div>

        {hasAccess && (
          <div className="absolute inset-0 bg-green-600/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <div className="bg-white text-green-600 p-4 rounded-full shadow-2xl">
                <CheckCircle size={32} />
             </div>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div>
          <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full uppercase tracking-wider">
            {booklet.subject || 'عام'}
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 line-clamp-2">
            {booklet.title}
          </h3>
        </div>

        <div className="mt-auto pt-6">
          {hasAccess ? (
            <a 
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl text-center flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20"
            >
              <Download size={20} />
              تحميل المذكرة الآن
            </a>
          ) : (
            <button 
              onClick={onBuy}
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              {isPending ? 'جاري التحويل...' : <><CreditCard size={20} /> شراء وتحميل</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
