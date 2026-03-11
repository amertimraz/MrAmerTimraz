import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../../api/payments';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import type { PaymentRequest } from '../../types';
import { CheckCircle, XCircle, Clock, Eye, X } from 'lucide-react';
import { BACKEND_URL } from '../../config';

const statusLabel = (s: string) =>
  s === 'Approved' ? 'مقبول' : s === 'Rejected' ? 'مرفوض' : 'قيد المراجعة';

const statusBadge = (s: string) =>
  s === 'Approved'
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : s === 'Rejected'
    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';

const statusIcon = (s: string) =>
  s === 'Approved' ? <CheckCircle size={14} /> : s === 'Rejected' ? <XCircle size={14} /> : <Clock size={14} />;

export default function AdminPayments() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');
  const [viewing, setViewing] = useState<PaymentRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['payment-requests'],
    queryFn: paymentsApi.getAll,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, approve, note }: { id: number; approve: boolean; note: string }) =>
      paymentsApi.review(id, approve, note),
    onSuccess: (_, vars) => {
      toast.success(vars.approve ? 'تم قبول الطلب وتسجيل الطالب في الكورس!' : 'تم رفض الطلب.');
      qc.invalidateQueries({ queryKey: ['payment-requests'] });
      setViewing(null);
    },
    onError: () => toast.error('فشلت العملية'),
  });

  const filtered = requests?.filter(r => {
    if (!filter) return true;
    return r.status === filter;
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">طلبات الدفع</h1>
          <p className="text-sm text-gray-500 mt-0.5">{requests?.length ?? 0} طلب إجمالاً</p>
        </div>
        <div className="flex gap-2">
          {['', 'Pending', 'Approved', 'Rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {s === '' ? 'الكل' : statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">الطالب</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">الكورس</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">المبلغ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">لا توجد طلبات</td>
                </tr>
              )}
              {filtered?.map(req => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{req.studentName}</p>
                    <p className="text-xs text-gray-400">@{req.studentUsername} · {req.studentPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-700 dark:text-gray-300">{req.courseTitle}</p>
                    <p className="text-xs text-gray-400">سعر الكورس: {req.coursePrice} ج.م</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                    {req.amountPaid} ج.م
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge(req.status)}`}>
                      {statusIcon(req.status)} {statusLabel(req.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(req.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setViewing(req); setAdminNote(''); }}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setViewing(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">تفاصيل الطلب</h3>
              <button onClick={() => setViewing(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">الطالب</span>
                <span className="font-medium text-gray-900 dark:text-white">{viewing.studentName} (@{viewing.studentUsername})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">رقم الهاتف</span>
                <span className="font-medium text-gray-900 dark:text-white">{viewing.studentPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">الكورس</span>
                <span className="font-medium text-gray-900 dark:text-white">{viewing.courseTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">سعر الكورس</span>
                <span className="font-medium">{viewing.coursePrice} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">المبلغ المدفوع</span>
                <span className="font-bold text-green-600 dark:text-green-400">{viewing.amountPaid} ج.م</span>
              </div>
              {viewing.notes && (
                <div className="flex justify-between">
                  <span className="text-gray-500">ملاحظات الطالب</span>
                  <span className="text-gray-700 dark:text-gray-300 text-left max-w-[60%]">{viewing.notes}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">الحالة</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge(viewing.status)}`}>
                  {statusIcon(viewing.status)} {statusLabel(viewing.status)}
                </span>
              </div>
              {viewing.adminNote && (
                <div className="flex justify-between">
                  <span className="text-gray-500">ملاحظة الأدمن</span>
                  <span className="text-gray-700 dark:text-gray-300 text-left max-w-[60%]">{viewing.adminNote}</span>
                </div>
              )}
            </div>

            {viewing.receiptImageUrl && (
              <div>
                <p className="text-sm text-gray-500 mb-2">إيصال الدفع:</p>
                <a href={`${BACKEND_URL}${viewing.receiptImageUrl}`} target="_blank" rel="noreferrer">
                  <img
                    src={`${BACKEND_URL}${viewing.receiptImageUrl}`}
                    alt="إيصال الدفع"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 object-contain max-h-48"
                  />
                </a>
              </div>
            )}

            {!viewing.receiptImageUrl && (
              <p className="text-sm text-gray-400 text-center py-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
                لم يرفع الطالب إيصالاً
              </p>
            )}

            {viewing.status === 'Pending' && (
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  className="input-field text-sm resize-none"
                  rows={2}
                  placeholder="ملاحظة اختيارية للطالب..."
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => reviewMutation.mutate({ id: viewing.id, approve: true, note: adminNote })}
                    disabled={reviewMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
                  >
                    <CheckCircle size={16} /> قبول وتسجيل
                  </button>
                  <button
                    onClick={() => reviewMutation.mutate({ id: viewing.id, approve: false, note: adminNote })}
                    disabled={reviewMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                  >
                    <XCircle size={16} /> رفض
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
