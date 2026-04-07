import { useQuery } from '@tanstack/react-query';
import { testsApi } from '../../api/tests';
import {
  Trophy, Calendar,
  Download, Search, GraduationCap, BookOpen
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TestResult {
  id: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  studentName: string;
  studentEmail: string;
  testTitle: string;
  courseTitle: string;
  testId: number;
  studentId: number;
}

export default function AdminAllResults() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'passed' | 'failed'>('all');

  const { data: results, isLoading } = useQuery({
    queryKey: ['admin-all-results'],
    queryFn: () => testsApi.getAllResults(),
  });

  const filteredResults = results?.filter((r: TestResult) => {
    const matchesSearch =
      r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.testTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterBy === 'passed') return matchesSearch && r.passed;
    if (filterBy === 'failed') return matchesSearch && !r.passed;
    return matchesSearch;
  });

  const stats = {
    total: filteredResults?.length || 0,
    passed: filteredResults?.filter((r: TestResult) => r.passed).length || 0,
    failed: filteredResults?.filter((r: TestResult) => !r.passed).length || 0,
    avgScore: filteredResults?.length
      ? (filteredResults.reduce((acc: number, r: TestResult) => acc + r.percentage, 0) / filteredResults.length).toFixed(1)
      : 0,
  };

  const exportToCSV = () => {
    if (!filteredResults?.length) return;

    const headers = ['الطالب', 'البريد', 'الاختبار', 'الدرس', 'الدرجة', 'النسبة', 'الحالة', 'التاريخ'];
    const rows = filteredResults.map((r: TestResult) => [
      r.studentName,
      r.studentEmail,
      r.testTitle,
      r.courseTitle || '-',
      `${r.score}/${r.maxScore}`,
      `${r.percentage.toFixed(1)}%`,
      r.passed ? 'ناجح' : 'راسب',
      new Date(r.completedAt).toLocaleDateString('ar-EG'),
    ]);

    const csv = [headers.join(','), ...rows.map((row: string[]) => row.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Trophy className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">نتائج جميع الاختبارات</h1>
            <p className="text-sm text-gray-500">جميع نتائج الطلاب في اختبارات الدروس</p>
          </div>
        </div>
        <button
          onClick={exportToCSV}
          disabled={!filteredResults?.length}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
        >
          <Download size={18} />
          تصدير CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">إجمالي النتائج</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Trophy className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">النجاح</p>
              <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <Trophy className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">الرسوب</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <BookOpen className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">متوسط الدرجات</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="بحث بالطالب، الاختبار، أو الدرس..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              onClick={() => setFilterBy('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterBy === 'all'
                  ? 'bg-white dark:bg-gray-600 shadow text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterBy('passed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterBy === 'passed'
                  ? 'bg-white dark:bg-gray-600 shadow text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ناجح
            </button>
            <button
              onClick={() => setFilterBy('failed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterBy === 'failed'
                  ? 'bg-white dark:bg-gray-600 shadow text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              راسب
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الطالب</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الاختبار</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الدرس</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الدرجة</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">النسبة</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredResults?.length ? (
                filteredResults.map((result: TestResult) => (
                  <tr
                    key={result.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/teacher/tests/${result.testId}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {result.studentName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{result.studentName}</p>
                          <p className="text-xs text-gray-500">{result.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{result.testTitle}</p>
                      <p className="text-xs text-gray-500">ID: {result.testId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{result.courseTitle || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.score}/{result.maxScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                        result.percentage >= 80
                          ? 'bg-green-100 text-green-600'
                          : result.percentage >= 60
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {result.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                        result.passed
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {result.passed ? 'ناجح' : 'راسب'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={16} />
                        <span className="text-sm">
                          {new Date(result.completedAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                        <Trophy className="text-gray-400" size={32} />
                      </div>
                      <p className="text-gray-500 font-medium">
                        {searchTerm || filterBy !== 'all'
                          ? 'لا توجد نتائج مطابقة للبحث'
                          : 'لا توجد نتائج مسجلة بعد'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
