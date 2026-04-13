import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  buildCertificateId,
  getStoredAttempts,
} from '../../utils/levelAssessments';

export default function LevelCertificatePage() {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuthStore();
  const attempts = getStoredAttempts(user?.id);
  const quizAttempt = attempts[Number(quizId)];

  const certId = useMemo(() => {
    if (!quizAttempt) return '';
    return buildCertificateId(user?.id, quizAttempt.quizId, quizAttempt.completedAt);
  }, [quizAttempt, user?.id]);

  if (!quizAttempt?.passed) {
    return (
      <div className="card p-8 text-center space-y-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">لا توجد شهادة لهذا المستوى</h1>
        <p className="text-gray-500 dark:text-gray-400">يجب اجتياز الاختبار بنسبة 70% على الأقل لفتح الشهادة.</p>
        <Link to="/student/levels" className="btn-primary inline-flex">الرجوع لاختبارات المستويات</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/student/levels" className="btn-secondary">رجوع</Link>
        <button onClick={() => window.print()} className="btn-primary">طباعة الشهادة</button>
      </div>

      <div className="bg-white dark:bg-gray-900 border-4 border-primary-500/30 rounded-2xl p-10 text-center shadow-lg">
        <p className="text-sm tracking-widest text-gray-500 mb-3">KORYO PLATFORM CERTIFICATE</p>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">شهادة إتمام مستوى</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">JavaScript Level Completion Certificate</p>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">تُمنح هذه الشهادة إلى</p>
        <p className="text-3xl font-bold text-primary-600 mb-8">{user?.name ?? 'طالب المنصة'}</p>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">لاستكمال اختبار</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">{quizAttempt.quizTitle}</p>

        <div className="flex items-center justify-center gap-10 mb-8">
          <div>
            <p className="text-sm text-gray-500">الدرجة</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{quizAttempt.score}/{quizAttempt.total}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">النسبة</p>
            <p className="text-2xl font-bold text-green-600">{quizAttempt.pct}%</p>
          </div>
        </div>

        <div className="border-t pt-5 text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>Certificate ID: <span className="font-semibold text-gray-700 dark:text-gray-300">{certId}</span></p>
          <p>Issued At: {new Date(quizAttempt.completedAt).toLocaleString('ar-EG')}</p>
        </div>
      </div>
    </div>
  );
}
