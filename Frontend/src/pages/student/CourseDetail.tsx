import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '../../api/courses';
import { videosApi } from '../../api/videos';
import { testsApi } from '../../api/tests';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Play, FileText, ArrowRight, Clock, Youtube, Download } from 'lucide-react';
import { resolveFileUrl } from '../../config';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeVideoData, setActiveVideoData] = useState<{ pdfUrl?: string } | null>(null);
  const [tab, setTab] = useState<'videos' | 'tests'>('videos');

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
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowRight size={18} /> العودة
      </button>

      <div className="card p-6 bg-gradient-to-l from-primary-50 to-accent-50 dark:from-gray-700 dark:to-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
        {course.description && <p className="text-gray-600 dark:text-gray-300 mt-2">{course.description}</p>}
        <p className="text-sm text-gray-500 mt-3">المدرّس: {course.teacherName}</p>
      </div>

      {activeVideo && (
        <div className="card overflow-hidden">
          {activeVideo.includes('youtube.com') || activeVideo.includes('vimeo.com') || activeVideo.startsWith('http') && !activeVideo.match(/\.(mp4|webm|mkv)/) ? (
            <iframe src={activeVideo} className="w-full aspect-video" allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          ) : (
            <video src={activeVideo} controls className="w-full aspect-video bg-black" />
          )}
          {activeVideoData?.pdfUrl && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
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
            <div key={v.id} onClick={() => { setActiveVideo(getEmbedUrl(v.url, v.source)); setActiveVideoData(v); }}
              className="card p-4 flex items-center gap-4 hover:shadow-md cursor-pointer transition-all group">
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
