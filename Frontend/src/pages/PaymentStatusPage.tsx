import { CheckCircle, XCircle, ArrowLeft, Download } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const token = searchParams.get('token');

  // We need to know which booklet this order was for to redirect back.
  // For now, let's just go back to the store with the token.
  const downloadLink = token ? `/booklet-store?token=${token}` : "/booklet-store";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] px-4" dir="rtl">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl text-center border border-green-100 dark:border-green-900/30">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">تم الدفع بنجاح!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          شكراً لك! تم تأكيد عملية الدفع بنجاح. يمكنك الآن العودة للمتجر لتحميل المذكرة فوراً.
        </p>
        <div className="space-y-3">
          <Link 
            to={downloadLink} 
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Download size={20} />
            الذهاب للتحميل
          </Link>
          <button 
            onClick={() => navigate('/')}
            className="block w-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}

export function PaymentFailedPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] px-4" dir="rtl">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl text-center border border-red-100 dark:border-red-900/30">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={48} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">فشلت عملية الدفع</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          للأسف، لم تكتمل عملية الدفع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني إذا استمرت المشكلة.
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => navigate('/booklet-store')}
            className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            المحاولة مرة أخرى
          </button>
          <button 
            onClick={() => navigate('/')}
            className="block w-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all"
          >
            الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
