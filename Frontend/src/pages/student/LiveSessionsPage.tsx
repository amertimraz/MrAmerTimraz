import { useQuery } from '@tanstack/react-query';
import { liveSessionsApi } from '../../api/liveSessions';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Calendar, Video, DollarSign, ExternalLink, Lock } from 'lucide-react';
import { useState } from 'react';
import PaymentModal from '../../components/courses/PaymentModal';

export default function LiveSessionsPage() {
  const [selectedSession, setSelectedSession] = useState<{ id: number; title: string; price: number } | null>(null);

  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ['live-sessions'],
    queryFn: liveSessionsApi.getActive,
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">الحصص المباشرة</h1>
        <p className="opacity-90">انضم إلى حصص البث المباشر مع مستر عامر وتفاعل معه مباشرة.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions?.map((session) => (
          <div key={session.id} className="card overflow-hidden flex flex-col hover:shadow-2xl transition-all group">
            <div className="relative h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
               <div className="absolute inset-0 bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors" />
               <Video size={64} className="text-primary-500 group-hover:scale-110 transition-transform duration-500" />
               {session.isEnrolled && (
                 <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    مُشترك
                 </div>
               )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-1">{session.title}</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">{session.description || 'لا يوجد وصف متاح لهذه الحصة.'}</p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-primary-500">
                    <Calendar size={18} />
                  </div>
                  <span className="text-sm">{new Date(session.scheduledAt).toLocaleString('ar-EG')}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-green-500">
                    <DollarSign size={18} />
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{session.price} ج.م</span>
                </div>
              </div>

              {session.isEnrolled ? (
                <a
                  href={session.joinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-lg"
                >
                  <ExternalLink size={20} /> انضم الآن
                </a>
              ) : (
                <button
                  onClick={() => setSelectedSession({ id: session.id, title: session.title, price: session.price })}
                  className="w-full py-3 px-6 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold hover:bg-primary-600 hover:text-white transition-all flex items-center justify-center gap-2 text-lg"
                >
                  <Lock size={20} /> احجز الآن
                </button>
              )}
            </div>
          </div>
        ))}

        {sessions?.length === 0 && (
          <div className="col-span-full py-20 text-center card bg-gray-50/50">
            <Video size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">لا توجد حصص مباشرة متاحة حالياً.</p>
          </div>
        )}
      </div>

      {selectedSession && (
        <PaymentModal
          isOpen={!!selectedSession}
          onClose={() => {
            setSelectedSession(null);
            refetch();
          }}
          courseId={0} // dummy for modal logic, we'll use sessionId
          courseTitle={selectedSession.title}
          coursePrice={selectedSession.price}
          sessionId={selectedSession.id}
        />
      )}
    </div>
  );
}
