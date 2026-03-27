import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { coursesApi } from '../../api/courses';
import { videosApi } from '../../api/videos';
import { testsApi } from '../../api/tests';
import type { Video } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CommentItem from '../../components/ui/CommentItem';
import { Play, FileText, ArrowRight, Clock, Youtube, Download, MessageCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { resolveFileUrl } from '../../config';
import { useAuthStore } from '../../store/authStore';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeVideoData, setActiveVideoData] = useState<Video | null>(null);
  const [tab, setTab] = useState<'videos' | 'tests'>('videos');
  const [comment, setComment] = useState('');


  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.getById(Number(id)),
  });

  const { data: videos } = useQuery({
    queryKey: ['videos', id],
    queryFn: () => videosApi.getByCourse(Number(id)),
  });

  const { data: tests } = useQuery({
    queryKey: ['tests', id],
    queryFn: () => testsApi.getByCourse(Number(id)),
  });

  const { data: videoComments = [], refetch: refetchComments } = useQuery({
    queryKey: ['video-comments', activeVideoId],
    queryFn: () => videosApi.getComments(activeVideoId!),
    enabled: !!activeVideoId,
  });

  const addComment = useMutation({
    mutationFn: ({ text, parentId }: { text: string, parentId?: number }) => 
      videosApi.addComment(activeVideoId!, text, parentId),
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

  const toggleReaction = useMutation({
    mutationFn: ({ commentId, type }: { commentId: number, type: string }) => 
      videosApi.toggleReaction(commentId, type),
    onSuccess: () => refetchComments(),
  });

  const getYouTubeId = (url: string) => {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n]+)/);
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

  const resolveUrl = resolveFileUrl;

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (!course) return <div className="text-center text-gray-400 mt-20">الدرس غير موجود</div>;

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowRight size={18} /> العودة
      </button>

      <div className="card p-6 bg-gradient-to-l from-primary-50 to-accent-50 dark:from-gray-700 dark:to-gray-800 border-none shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
        {course.description && <p className="text-gray-600 dark:text-gray-300 mt-2">{course.description}</p>}
        <p className="text-sm text-gray-500 mt-3">المدرّس: {course.teacherName}</p>
      </div>

      {activeVideo && (
        <div className="card overflow-hidden shadow-xl border-none ring-1 ring-gray-100 dark:ring-gray-800">
          {activeVideo.includes('youtube.com') || activeVideo.includes('vimeo.com') || activeVideo.startsWith('http') && !activeVideo.match(/\.(mp4|webm|mkv)/) ? (
            <iframe src={activeVideo} className="w-full aspect-video" allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          ) : (
            <video src={activeVideo} controls className="w-full aspect-video bg-black" />
          )}
          {activeVideoData?.pdfUrl && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
              <a
                href={resolveUrl(activeVideoData.pdfUrl)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors"
              >
                <Download size={16} />
                تحميل ملف PDF المرفق
              </a>
            </div>
          )}
          
          {/* Comments Section for Active Video */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-black/10">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-8">
              <MessageCircle size={20} className="text-primary-600" /> التعليقات ({videoComments.length})
            </h2>

            {/* Post Comment */}
            {course.isEnrolled ? (
              <div className="flex gap-4 mb-10">
                <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl shadow-sm flex items-center justify-center text-gray-400 shrink-0">
                  <MessageCircle size={24} />
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
                      onClick={() => { if (comment.trim()) addComment.mutate({ text: comment.trim() }); }}
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
            ) : (
              <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 rounded-2xl p-6 mb-10 text-center">
                <p className="text-primary-700 dark:text-primary-300 font-medium">يجب الاشتراك في الكورس للانضمام إلى المناقشة وطرح الأسئلة.</p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {videoComments.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                  لا توجد تعليقات بعد. كن أول من يضيف تعليقاً!
                </div>
              ) : videoComments.map(c => (
                <CommentItem 
                  key={c.id} 
                  comment={c} 
                  isAdmin={user?.role === 'Admin'}
                  currentUserId={user?.id}
                  onDelete={(id) => deleteComment.mutate(id)}
                  onReact={(id, type) => toggleReaction.mutate({ commentId: id, type })}
                  onReply={(text, parentId) => addComment.mutate({ text, parentId })}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 w-fit">
        {[{ k: 'videos', l: 'الفيديوهات' }, { k: 'tests', l: 'الاختبارات' }].map(({ k, l }) => (
          <button key={k} onClick={() => setTab(k as 'videos' | 'tests')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : 'text-gray-500'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'videos' && (
        <div className="space-y-3">
          {!videos?.length ? (
            <div className="card p-8 text-center text-gray-400">لا توجد فيديوهات بعد</div>
          ) : videos.map((v, i) => (
            <div key={v.id} onClick={() => { setActiveVideoId(v.id); setActiveVideo(getEmbedUrl(v.url, v.source)); setActiveVideoData(v); }}
              className={`card p-4 flex items-center gap-4 hover:shadow-md cursor-pointer transition-all group ${activeVideoId === v.id ? 'ring-2 ring-primary-500 bg-primary-50/10' : ''}`}>
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center text-primary-600 font-bold group-hover:bg-primary-600 group-hover:text-white transition-colors">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{v.title}</p>
                {v.description && <p className="text-sm text-gray-400 truncate">{v.description}</p>}
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                {v.source === 'YouTube' && <Youtube size={16} className="text-red-500" />}
                {v.pdfUrl && <FileText size={15} className="text-orange-400" />}
                {v.durationSeconds > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {Math.floor(v.durationSeconds / 60)}:{String(v.durationSeconds % 60).padStart(2, '0')}
                  </span>
                )}
                <Play size={18} className="text-primary-600" />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'tests' && (
        <div className="space-y-3">
          {!tests?.length ? (
            <div className="card p-8 text-center text-gray-400">لا توجد اختبارات بعد</div>
          ) : tests.filter(t => t.isPublished).map(t => (
            <div key={t.id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{t.title}</p>
                <p className="text-sm text-gray-400">{t.durationMinutes} دقيقة | درجة النجاح: {t.passingScore}%</p>
              </div>
              <button onClick={() => navigate(`/student/tests/${t.id}`)} className="btn-primary text-sm py-1.5 px-4">
                ابدأ الاختبار
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
