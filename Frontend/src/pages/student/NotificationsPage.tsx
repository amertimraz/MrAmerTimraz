import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Bell, CheckCheck } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: notificationsApi.getMy,
  });

  const markRead = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          الإشعارات ({notifications?.filter(n => !n.isRead).length} غير مقروءة)
        </h2>
      </div>

      {!notifications?.length ? (
        <div className="card p-12 text-center text-gray-400">
          <Bell size={48} className="mx-auto mb-3 opacity-30" />
          <p>لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id}
              className={`card p-4 flex gap-4 transition-all ${!n.isRead ? 'border-r-4 border-r-primary-500 bg-primary-50/10 dark:bg-primary-900/10' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1
                ${n.isRead ? 'bg-gray-100 dark:bg-gray-700' : 'bg-primary-100 dark:bg-primary-900'}`}>
                <Bell size={18} className={n.isRead ? 'text-gray-400' : 'text-primary-600'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${n.isRead ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                  {n.title}
                </p>
                <div className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{n.message}</div>
                
                {n.imageUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden border">
                    <img src={getMediaUrl(n.imageUrl)} alt="Notification Attachment" className="w-full max-w-sm h-auto object-cover rounded-lg" />
                  </div>
                )}
                  
                {n.link && (
                  <a href={n.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors">
                    🔗 فتح الرابط المرفق
                  </a>
                )}
                
                <p className="text-xs text-gray-400 mt-3 inline-block ml-3 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {new Date(n.createdAt).toLocaleString('ar-EG')}
                </p>
              </div>
              {!n.isRead && (
                <button onClick={() => markRead.mutate(n.id)}
                  className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors shrink-0 items-start self-start"
                  title="تحديد كمقروء">
                  <CheckCheck size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
