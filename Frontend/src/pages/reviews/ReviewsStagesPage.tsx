import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Sparkles } from 'lucide-react';
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
    <div
      className="min-h-screen text-white flex flex-col items-center px-4 py-10 sm:px-6 sm:py-14"
      dir="rtl"
      style={{ background: 'radial-gradient(circle at 50% -10%, #1e3a5f 0%, #0b1120 55%, #060a14 100%)' }}
    >
      <div className="max-w-4xl w-full text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-300 text-xs sm:text-sm px-4 py-1.5 rounded-full mb-4">
          <Sparkles size={14} />
          <span>مراجعات مجانية بنظام صح وغلط واختيار من متعدد</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold mb-3 leading-tight">مراجعات الأستاذ عامر تمراز</h1>
        <p className="text-slate-400 text-sm sm:text-base flex items-center justify-center gap-1.5 flex-wrap">
          اختر مرحلتك وصفك الدراسي وابدأ الحل، وشوف اسمك في لوحة الصدارة
          <Trophy size={16} className="text-amber-400" />
        </p>
      </div>

      {loading ? (
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="max-w-4xl w-full space-y-5 sm:space-y-6">
          {STAGE_GROUPS.map(group => (
            <section
              key={group.key}
              className="rounded-2xl p-5 sm:p-7 backdrop-blur-sm bg-white/[0.03] border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
              style={{ boxShadow: `0 0 40px -20px ${group.accent}` }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="text-2xl sm:text-3xl w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl shrink-0"
                  style={{ backgroundColor: `${group.accent}22` }}
                >
                  {group.emoji}
                </span>
                <h2 className="font-bold text-base sm:text-lg">{group.label}</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {group.years.map(year => {
                  const count = quizCountByYear[year.key] ?? 0;
                  const available = count > 0;
                  return (
                    <button
                      key={year.key}
                      disabled={!available}
                      onClick={() => navigate(`/reviews/${year.key}`)}
                      className={`group flex flex-col items-center gap-1.5 rounded-xl px-3 py-4 sm:py-5 border transition-all ${
                        available
                          ? 'bg-white/[0.04] border-white/10 hover:border-white/25 hover:bg-white/[0.07] active:scale-95 cursor-pointer'
                          : 'bg-white/[0.015] border-white/5 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span className="font-bold text-sm sm:text-[15px]">{year.label}</span>
                      {available ? (
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: `${group.accent}22`, color: group.accent }}
                        >
                          {count} مراجعة متاحة
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">لا توجد مراجعات</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
