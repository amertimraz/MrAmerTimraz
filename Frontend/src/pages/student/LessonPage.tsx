import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { videosApi } from '../../api/videos';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Play, FileText, ArrowRight, Download, MessageCircle, Send, User as UserIcon } from 'lucide-react';
import { resolveFileUrl } from '../../config';
import toast from 'react-hot-toast';

export default function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');

  const { data: video, isLoading, error } = useQuery({
    queryKey: ['video', slug],
    queryFn: () => videosApi.getBySlug(slug!),
    enabled: !!slug,
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
    onError: () => toast.error('فشل في إضافة التعليق'),
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
  if (error || !video) return (
    <div className="text-center py-20 px-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">عذراً، الدرس غير موجود</h2>
      <button onClick={() => navigate('/')} className="text-primary-600 hover:underline">العودة للرئيسية</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in p-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{video.title}</h1>
          <p className="text-sm text-gray-400 mt-1">
             رابط الدرس المباشر
          </p>
        </div>
      </div>

      {/* Video Player */}
      <div className="card overflow-hidden shadow-2xl shadow-primary-500/10 border-none bg-black">
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

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Description & PDF */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
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
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 px-2">
              <MessageCircle size={22} className="text-primary-600" /> التعليقات ({comments.length})
            </h2>

            {/* Post Comment */}
            <div className="card p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400">
                  <UserIcon size={20} />
                </div>
                <div className="flex-1 space-y-3">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="ضع استفسارك أو تعليقك هنا..."
                    className="w-full input-field resize-none min-h-[100px] border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => { if (comment.trim()) addComment.mutate(comment.trim()); }}
                      disabled={!comment.trim() || addComment.isPending}
                      className="btn-primary flex items-center gap-2"
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
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                  لا توجد تعليقات بعد. كن أول من يعلق!
                </div>
              ) : comments.map(c => (
                <div key={c.id} className="card p-5 group hover:shadow-lg transition-shadow">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-700 shadow-sm shrink-0">
                      {c.student.profileImage ? (
                        <img src={resolveFileUrl(c.student.profileImage)} alt={c.student.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white">
                          <UserIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 dark:text-white">{c.student.name}</h4>
                        <span className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 bg-primary-600 text-white border-none shadow-xl shadow-primary-500/20">
            <h3 className="text-lg font-bold mb-2">تعليمات</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              يمكنك متابعة الدرس وتحميل المذكرة المرفقة. في حال كان لديك أي سؤال، يمكنك تركه في قسم التعليقات وسنقوم بالرد عليك في أقرب وقت.
            </p>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
               معلومات الدرس
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-400">المدة</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{Math.floor(video.durationSeconds / 60)} دقيقة</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2">
                <span className="text-gray-400">تاريخ الإضافة</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{new Date(video.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
