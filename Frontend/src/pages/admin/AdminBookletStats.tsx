import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../api/payments';
import { FileText, Users, DollarSign, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatCard from '../../components/ui/StatCard';
import type { BookletPurchaseStats, BookletPurchaseItem, BookletSummary } from '../../types';

export default function AdminBookletStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['booklet-stats'],
    queryFn: paymentsApi.getBookletStats,
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إحصائيات الملازم</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">مبيعات الملازم والمشتريات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="إجمالي المبيعات" 
          value={stats?.totalPurchases ?? 0} 
          icon={<FileText size={22} />} 
          color="blue" 
        />
        <StatCard 
          title="إجمالي الإيرادات" 
          value={`${stats?.totalRevenue ?? 0} ج.م`} 
          icon={<DollarSign size={22} />} 
          color="green" 
        />
        <StatCard 
          title="أحدث عملية" 
          value={stats?.recentPurchases?.[0] ? new Date(stats.recentPurchases[0].purchaseDate).toLocaleDateString('ar-EG') : '-'} 
          icon={<Calendar size={22} />} 
          color="purple" 
        />
        <StatCard 
          title="المشتريين" 
          value={new Set(stats?.recentPurchases?.map((p: BookletPurchaseItem) => p.studentUsername)).size ?? 0} 
          icon={<Users size={22} />} 
          color="orange" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} />
              آخر المشتريات
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {stats?.recentPurchases?.length === 0 && (
              <div className="p-8 text-center text-gray-400">لا توجد مشتريات حتى الآن</div>
            )}
            {stats?.recentPurchases?.map((purchase: BookletPurchaseItem) => (
              <div key={purchase.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm">
                    {purchase.studentName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{purchase.studentName}</p>
                    <p className="text-xs text-gray-500">@{purchase.studentUsername}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{purchase.amountPaid} ج.م</p>
                  <p className="text-xs text-gray-400">{new Date(purchase.purchaseDate).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Booklets */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen size={18} />
              أكثر الملازم مبيعاً
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {stats?.topBooklets?.length === 0 && (
              <div className="p-8 text-center text-gray-400">لا توجد مبيعات حتى الآن</div>
            )}
            {stats?.topBooklets?.map((booklet: BookletSummary, index: number) => (
              <div key={booklet.bookletId} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{booklet.title}</p>
                    <p className="text-xs text-gray-500">{booklet.purchaseCount} عملية شراء</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{booklet.totalRevenue} ج.م</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Recent Purchases Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">تفاصيل المشتريات الأخيرة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">الطالب</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">الملزمة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">المبلغ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">تاريخ الشراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {stats?.recentPurchases?.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">لا توجد مشتريات</td>
                </tr>
              )}
              {stats?.recentPurchases?.map((purchase: BookletPurchaseItem) => (
                <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{purchase.studentName}</p>
                    <p className="text-xs text-gray-500">@{purchase.studentUsername}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {purchase.bookletTitle}
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {purchase.amountPaid} ج.م
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(purchase.purchaseDate).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
