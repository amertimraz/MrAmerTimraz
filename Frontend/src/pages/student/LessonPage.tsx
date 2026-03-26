import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { videosApi } from '../../api/videos';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Play, FileText, ArrowRight, Download, MessageCircle, Send, User as UserIcon, Trash2, Lock } from 'lucide-react';
import { resolveFileUrl } from '../../config';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');

  const { data: video, isLoading, error } = useQuery({
    queryKey: ['video', slug],
    queryFn: () => videosApi.getBySlug(slug!),
    enabled: !!slug,
    retry: false,
  });

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['video-comments', video?.id],
    queryFn: () => videosApi.getComments(video!.id),
    enabled: !!video?.id,
  });

  const addComment = useMutation({
    mutationFn: (text: string) => videosApi.addComment(video!.id, text),
    onSuccess: () => {
      setComment('');
      refetchComments();
      toast.success('تم إضافة تعليقك');
    },
    onError: (err: any) => {
      if (err.response?.status === 403) {
        toast.error('يجب الاشتراك في الكورس للتمكن من التعليق');
      } else {
        toast.error('فشل في إضافة التعليق');
      }
    },
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: number) => videosApi.deleteComment(commentId),
    onSuccess: () => {
      refetchComments();
      toast.success('تم حذف التعليق بنجاح');
    },
    onError: () => toast.error('فشل في حذف التعليق'),
  });

  const getYouTubeId = (url: string) => {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]+)/);
    return m ? m[1] : null;
  };

  const getEmbedUrl = (url: string, source: string) => {
    if (source === 'YouTube') {
      const id = getYouTubeId(url);
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (source === 'Vimeo') {
      const m = url.match(/vimeo\.com\/(\d+)/);
      return m ? `https://player.vimeo.com/video/${m[1]}` : url;
    }
    return resolveFileUrl(url);
  };

  if (isLoading) return <LoadingSpinner size="lg" />;

  if ((error as any)?.response?.status === 403) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-6">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 mx-auto">
          <Lock size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">محتوى مغلق</h2>
          <p className="text-gray-600 dark:text-gray-400">عذراً، يجب الاشتراك في الكورس لمشاهدة هذا الدرس المباشر.</p>
        </div>
        <button 
          onClick={() => navigate('/student/courses')} 
          className="btn-primary w-full"
        >
          استكشاف الكورسات
        </button>
      </div>
    );
  }

  if (error || !video) return (
    <div className="text-center py-20 px-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">عذراً، الدرس غير موجود</h2>
      <button onClick={() => navigate('/')} className="text-primary-600 hover:underline">العودة للرئيسية</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in p-4" dir="rtl">
      {/* Header */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowRight size={18} /> العودة
      </button>

      <div className="card p-6 bg-gradient-to-l from-primary-50 to-accent-50 dark:from-gray-700 dark:to-gray-800 border-none shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{video.title}</h1>
        {video.description && <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{video.description}</p>}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
           <span className="flex items-center gap-1.5"><UserIcon size={14} /> مستر عامر</span>
           <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
           <span className="text-primary-600 font-medium">رابط الدرس المباشر</span>
        </div>
      </div>

      {/* Video Player */}
      <div className="card overflow-hidden shadow-2xl shadow-primary-500/10 border-none bg-black ring-1 ring-gray-200 dark:ring-gray-800">
        {video.source === 'YouTube' || video.source === 'Vimeo' ? (
          <iframe 
            src={getEmbedUrl(video.url, video.source)} 
            className="w-full aspect-video" 
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          />
        ) : (
          <video src={resolveFileUrl(video.url)} controls className="w-full aspect-video bg-black" />
        )}
      </div>

      <div className="space-y-6">
        {/* Description & PDF */}
        <div className="card p-6 border-none shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Play size={20} className="text-primary-600" /> وصف الدرس
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {video.description || 'لا يوجد وصف لهذا الدرس'}
          </p>
          
          {video.pdfUrl && (
            <div className="mt-8 p-6 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase">المذكرة المرفقة</h3>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">ملف بصيغة PDF</p>
                </div>
              </div>
              <a
                href={resolveFileUrl(video.pdfUrl)}
                target="_blank"
                rel="noreferrer"
                className="btn-primary bg-orange-600 hover:bg-orange-700 border-none shadow-orange-500/20 flex items-center gap-2"
              >
                <Download size={18} /> تحميل
              </a>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="card p-6 border-none shadow-sm bg-gray-50/30 dark:bg-black/10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-8">
            <MessageCircle size={22} className="text-primary-600" /> التعليقات ({comments.length})
          </h2>

          {/* Post Comment */}
          <div className="flex gap-4 mb-10">
            <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl shadow-sm flex items-center justify-center text-gray-400 shrink-0">
              <UserIcon size={24} />
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="ضع استفسارك أو تعليقك هنا..."
                className="w-full input-field resize-none min-h-[100px] border-none shadow-sm focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => { if (comment.trim()) addComment.mutate(comment.trim()); }}
                  disabled={!comment.trim() || addComment.isPending}
                  className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 px-8"
                >
                  {addComment.isPending ? 'جارٍ الإرسال...' : (
                    <>
                      إرسال التعليق <Send size={16} className="-rotate-45" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                لا توجد تعليقات بعد. كن أول من يضيف تعليقاً!
              </div>
            ) : comments.map(c => (
              <div key={c.id} className="flex gap-4 p-5 rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:border-primary-100 dark:hover:border-primary-900/50 relative group/comment">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                  {c.student.profileImage ? (
                    <img src={resolveFileUrl(c.student.profileImage)} alt={c.student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                      <UserIcon size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <h4 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wide">{c.student.name}</h4>
                       <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-full font-medium">
                         {new Date(c.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}
                       </span>
                    </div>

                    {user?.role === 'Admin' && (
                      <button
                        onClick={() => { if(window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) deleteComment.mutate(c.id); }}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="حذف التعليق"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {c.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
