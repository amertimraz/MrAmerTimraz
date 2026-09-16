import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewsApi, type ReviewStageSummary } from '../../api/reviews';
import { STAGE_GROUPS } from './stageMeta';

export default function ReviewsStagesPage() {
  const navigate = useNavigate();
  const [stages, setStages] = useState<ReviewStageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewsApi.getStages()
      .then(setStages)
      .finally(() => setLoading(false));
  }, []);

  const quizCountByYear = Object.fromEntries(stages.map(s => [s.stage, s.quizzes.length]));

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center p-6" dir="rtl">
      <div className="max-w-4xl w-full text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">مراجعات الأستاذ عامر تمراز</h1>
        <p className="text-slate-400">اختر مرحلتك وصفك الدراسي وابدأ الحل، وشوف اسمك في لوحة الصدارة 🏆</p>
      </div>

      {loading ? (
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="max-w-4xl w-full space-y-8">
          {STAGE_GROUPS.map(group => (
            <div key={group.key} className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6" style={{ borderTopColor: group.accent, borderTopWidth: 4 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{group.emoji}</span>
                <h2 className="font-bold text-lg">{group.label}</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {group.years.map(year => {
                  const count = quizCountByYear[year.key] ?? 0;
                  return (
                    <button
                      key={year.key}
                      disabled={count === 0}
                      onClick={() => navigate(`/reviews/${year.key}`)}
                      className="flex flex-col items-center gap-1 bg-[#0f172a] border border-[#334155] hover:border-primary-500 rounded-xl px-4 py-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="font-bold text-sm">{year.label}</span>
                      <span className="text-[11px] text-slate-400">
                        {count > 0 ? `${count} مراجعة` : 'لا توجد مراجعات'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
