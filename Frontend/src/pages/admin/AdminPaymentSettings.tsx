import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../api/settings';
import { CreditCard, Smartphone, Building2, Wallet, Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminPaymentSettings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: () => settingsApi.getPaymentSettings(),
  });

  const [formData, setFormData] = useState({
    vodafoneCashNumber: '',
    instapayNumber: '',
    bankAccountNumber: '',
    bankName: '',
    bankAccountHolder: '',
    paymentInstructions: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        vodafoneCashNumber: settings.vodafoneCashNumber || '',
        instapayNumber: settings.instapayNumber || '',
        bankAccountNumber: settings.bankAccountNumber || '',
        bankName: settings.bankName || '',
        bankAccountHolder: settings.bankAccountHolder || '',
        paymentInstructions: settings.paymentInstructions || '',
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: settingsApi.updatePaymentSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      toast.success('تم حفظ إعدادات الدفع بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحفظ');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard size={28} />
          إعدادات الدفع
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة بيانات الدفع التي تظهر للطلاب عند شراء الملازم</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Vodafone Cash */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Smartphone size={18} className="text-red-500" />
            فودافون كاش
          </label>
          <input
            type="text"
            value={formData.vodafoneCashNumber}
            onChange={(e) => setFormData({ ...formData, vodafoneCashNumber: e.target.value })}
            placeholder="مثال: 01001234567"
            className="input w-full"
          />
        </div>

        {/* Instapay */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Wallet size={18} className="text-blue-500" />
            انستا باي
          </label>
          <input
            type="text"
            value={formData.instapayNumber}
            onChange={(e) => setFormData({ ...formData, instapayNumber: e.target.value })}
            placeholder="مثال: 01001234567 أو اسم المستخدم"
            className="input w-full"
          />
        </div>

        {/* Bank Account */}
        <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Building2 size={18} className="text-emerald-500" />
            الحساب البنكي
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">اسم البنك</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="مثال: البنك الأهلي"
                className="input w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">رقم الحساب</label>
              <input
                type="text"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                placeholder="رقم الحساب البنكي"
                className="input w-full"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-500 mb-1 block">اسم صاحب الحساب</label>
            <input
              type="text"
              value={formData.bankAccountHolder}
              onChange={(e) => setFormData({ ...formData, bankAccountHolder: e.target.value })}
              placeholder="الاسم كما يظهر في البنك"
              className="input w-full"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <CreditCard size={18} className="text-amber-500" />
            تعليمات الدفع (اختياري)
          </label>
          <textarea
            value={formData.paymentInstructions}
            onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
            placeholder="أي تعليمات إضافية للطلاب مثل: 'يرجى إرفاق رقم الهاتف في ملاحظات التحويل'"
            rows={3}
            className="input w-full"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save size={18} />
                حفظ الإعدادات
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview */}
      <div className="card bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">معاينة (كما يظهر للطلاب)</h3>
        <div className="space-y-2 text-sm">
          {formData.vodafoneCashNumber && (
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-red-500" />
              <span className="text-gray-600 dark:text-gray-400">فودافون كاش:</span>
              <span className="font-mono font-bold">{formData.vodafoneCashNumber}</span>
            </div>
          )}
          {formData.instapayNumber && (
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">انستا باي:</span>
              <span className="font-mono font-bold">{formData.instapayNumber}</span>
            </div>
          )}
          {formData.bankAccountNumber && (
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-emerald-500" />
              <span className="text-gray-600 dark:text-gray-400">{formData.bankName || 'حساب بنكي'}:</span>
              <span className="font-mono font-bold">{formData.bankAccountNumber}</span>
            </div>
          )}
          {!formData.vodafoneCashNumber && !formData.instapayNumber && !formData.bankAccountNumber && (
            <p className="text-amber-500 text-sm">لم يتم إضافة أي بيانات دفع بعد</p>
          )}
        </div>
      </div>
    </div>
  );
}
