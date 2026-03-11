import { useQuery } from '@tanstack/react-query';
import { testsApi } from '../../api/tests';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Trophy, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import { FileText } from 'lucide-react';

export default function StudentResults() {
  const { data: results, isLoading } = useQuery({
    queryKey: ['student-results'],
    queryFn: testsApi.getMyResults,
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  const passed = results?.filter(r => r.passed).length ?? 0;
  const avg = results?.length
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي الاختبارات" value={results?.length ?? 0}
          icon={<FileText size={22} />} color="blue" />
        <StatCard title="اختبارات ناجحة" value={passed}
          icon={<Trophy size={22} />} color="green" />
        <StatCard title="اختبارات راسبة" value={(results?.length ?? 0) - passed}
          icon={<XCircle size={22} />} color="orange" />
        <StatCard title="متوسط الدرجات" value={`${avg}%`}
          icon={<TrendingUp size={22} />} color="purple" />
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">سجل النتائج</h2>
        </div>

        {!results?.length ? (
          <div className="p-12 text-center text-gray-400">
            <Trophy size={48} className="mx-auto mb-3 opacity-30" />
            <p>لم تكمل أي اختبار بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الاختبار</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الدرس</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">الدرجة</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">النتيجة</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {results.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{r.testTitle}</td>
                    <td className="px-5 py-4 text-gray-500">{r.courseTitle}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full w-20">
                          <div className={`h-2 rounded-full ${r.passed ? 'bg-green-500' : 'bg-red-400'}`}
                            style={{ width: `${r.percentage}%` }} />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{r.percentage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={r.passed ? 'badge-green' : 'badge-red'}>
                        {r.passed ? <><CheckCircle size={12} className="inline ml-1" />ناجح</> : <><XCircle size={12} className="inline ml-1" />راسب</>}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {new Date(r.completedAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
