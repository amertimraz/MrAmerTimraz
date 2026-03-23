import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, CreditCard } from 'lucide-react';
import { paymentsApi } from '../../api/payments';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: number | null;
  courseTitle: string;
  coursePrice: number;
  sessionId?: number | null;
}

export default function PaymentModal({ isOpen, onClose, courseId, courseTitle, coursePrice, sessionId }: PaymentModalProps) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState(String(coursePrice));
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const submitPayment = useMutation({
    mutationFn: () => paymentsApi.createRequest(
      courseId || null,
      parseFloat(amount),
      notes,
      receipt ?? undefined,
      sessionId || null
    ),
    onSuccess: () => {
      toast.success('تم إرسال طلب الدفع! سيتم مراجعته من الإدارة.');
      qc.invalidateQueries({ queryKey: ['my-payment-requests'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'فشل إرسال الطلب. ربما أرسلت طلباً من قبل.';
      toast.error(msg);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-scale-in" dir="rtl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600">
                <CreditCard size={20} />
             </div>
             <h3 className="font-bold text-xl text-gray-900 dark:text-white">طلب اشتراك</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-5 border border-primary-100 dark:border-primary-800/50">
          <p className="font-bold text-gray-900 dark:text-white mb-1">{courseTitle}</p>
          <p className="text-sm text-gray-500">القيمة المطلوب سدادها: <span className="font-black text-primary-600 text-lg">{coursePrice} ج.م</span></p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50">
          <p className="font-bold mb-1">طريقة الدفع:</p>
          <p>قم بتحويل المبلغ على رقم فودافون كاش: <span className="font-black text-lg select-all">01096066818</span></p>
          <p className="mt-1 opacity-80">ثم قم برفع صورة التحويل أدناه لتأكيد طلبك.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-1">المبلغ المحوّل (ج.م) *</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              className="w-full input-field" 
              placeholder="أدخل المبلغ الذي قمت بتحويله" 
              min={0} 
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-1">إيصال الدفع (صورة التحويل)</label>
            <input 
              ref={fileRef} 
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={e => setReceipt(e.target.files?.[0] ?? null)} 
            />
            <button 
              type="button" 
              onClick={() => fileRef.current?.click()}
              className={`w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed rounded-2xl transition-all ${
                receipt 
                  ? 'border-green-500 bg-green-50/10 text-green-600' 
                  : 'border-gray-200 dark:border-gray-800 text-gray-400 hover:border-primary-400 hover:bg-primary-50/5'
              }`}
            >
              <Upload size={24} className={receipt ? 'text-green-500' : ''} />
              <span className="text-sm font-medium">
                {receipt ? receipt.name : 'اضغط لاختيار صورة الإيصال'}
              </span>
              {!receipt && <span className="text-[10px] opacity-60">يدعم JPG, PNG بجودة واضحة</span>}
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-1">ملاحظات إضافية (اختياري)</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              className="w-full input-field resize-none py-3" 
              rows={2} 
              placeholder="أدخل أي ملاحظات تهمنا بخصوص عملية الدفع..." 
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={() => submitPayment.mutate()} 
            disabled={!amount || !receipt || submitPayment.isPending}
            className="flex-1 btn-primary py-4 text-lg"
          >
            {submitPayment.isPending ? 'جاري الإرسال...' : 'تأكيد وإرسال الطلب'}
          </button>
          <button 
            onClick={onClose} 
            className="px-6 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
