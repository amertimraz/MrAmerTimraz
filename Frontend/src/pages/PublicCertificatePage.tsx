import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { Download, Share2, QrCode } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { quizzesApi } from '../api/quizzes';

export default function PublicCertificatePage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [playerData, setPlayerData] = useState<any>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      const data = await quizzesApi.getById(Number(quizId));
      setQuiz(data);
    };

    const playerDataStr = localStorage.getItem('public-levels-player');
    if (playerDataStr) {
      const data = JSON.parse(playerDataStr);
      setPlayerData(data);
    }

    loadQuiz();
  }, [quizId]);

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Mr-Amer-Certificate-${quizId}.png`;
      a.click();
    } catch {
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (typeof navigator.share !== 'undefined') {
      try {
        await navigator.share({
          title: 'شهادة منصة مستر عامر تمراز',
          text: `أنا أنهيت ${quiz?.title} وحصلت على شهادة!`,
          url: window.location.href,
        });
      } catch {
        // Fallback
        navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ الرابط!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط!');
    }
    setSharing(false);
  };

  if (!quiz || !playerData) return <LoadingSpinner size="lg" />;

  const certId = `CERT-${quizId}-${Date.now()}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/public-levels')}
            className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
          >
            رجوع
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              disabled={downloading}
            >
              <Download size={18} />
              {downloading ? 'جاري التحميل...' : 'تحميل'}
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2"
              disabled={sharing}
            >
              <Share2 size={18} />
              مشاركة
            </button>
          </div>
        </div>

        <div
          ref={certRef}
          className="relative overflow-hidden rounded-2xl p-8 md:p-10 shadow-2xl border border-yellow-300/30 bg-gradient-to-br from-[#070b18] via-[#0f1933] to-[#070b18] max-w-4xl mx-auto"
          style={{ minHeight: '600px' }}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_12%_18%,#facc15_0,transparent_32%),radial-gradient(circle_at_88%_80%,#38bdf8_0,transparent_28%)]" />
          <div className="absolute inset-4 rounded-xl border border-white/15" />
          <div className="absolute inset-0 pointer-events-none opacity-10 text-cyan-200 font-mono text-xs">
            <span className="absolute top-16 right-20">{`</>`}</span>
            <span className="absolute top-24 left-20">{`{}`}</span>
            <span className="absolute bottom-20 right-20">JS</span>
            <span className="absolute bottom-28 left-20">function()</span>
          </div>

          <div className="relative z-10 text-center">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-3 py-2">
                <img
                  src="/teacher2.png"
                  alt="مستر عامر تمراز"
                  className="w-14 h-14 rounded-lg object-cover border border-white/30"
                />
                <div className="text-right">
                  <p className="text-xs text-cyan-200">إشراف</p>
                  <p className="text-sm font-bold text-white">مستر عامر تمراز</p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-[#0a0f1f] flex items-center justify-center shadow-lg border border-yellow-300">
                <span className="text-3xl">🛡️</span>
              </div>
            </div>

            <p className="text-xs md:text-sm tracking-[0.22em] text-yellow-200 mb-2">KORYO JAVASCRIPT CERTIFICATE</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">شهادة إتمام مستوى</h1>
            <p className="text-cyan-200 mb-8">مقدمة من منصة مستر عامر تمراز</p>

            <p className="text-base text-gray-200 mb-1">تُمنح هذه الشهادة إلى</p>
            <p className="text-3xl md:text-4xl font-black text-yellow-300 mb-8">{playerData.name}</p>

            <div className="mx-auto max-w-3xl rounded-xl bg-white/5 border border-white/15 px-4 py-4 mb-8">
              <p className="text-sm text-gray-300 mb-1">لاستكمال اختبار</p>
              <p className="text-xl md:text-2xl font-bold text-white">{quiz.title}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border-t border-white/15 pt-5">
              <div className="md:text-right text-center">
                <p className="text-xs text-gray-400 mb-2">اعتماد المنصة</p>
                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/35 bg-emerald-400/10 px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-200">Verified by Mr Amer Platform</span>
                </div>
              </div>

              <div className="text-center">
                <div className="mx-auto w-24 h-24 rounded-full border-4 border-yellow-300/70 bg-yellow-300/10 flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <p className="text-[10px] tracking-widest text-yellow-200">OFFICIAL</p>
                    <p className="text-lg">🏆</p>
                  </div>
                </div>
              </div>

              <div className="md:text-left text-center">
                <p className="text-xs text-gray-400 mb-2">توقيع المشرف</p>
                <div className="inline-block border-b border-white/30 min-w-[150px] pb-1">
                  <p className="text-sm font-semibold text-white">Mr Amer Timraz</p>
                </div>
              </div>
            </div>

            <div className="mt-5 text-xs md:text-sm text-gray-300 space-y-1">
              <p>Certificate ID: <span className="font-semibold text-yellow-300">{certId}</span></p>
              <p>Issued At: {new Date().toLocaleString('ar-EG')}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-slate-900">
                <QrCode size={24} />
              </div>
              <div>
                <p className="text-white font-bold">QR Code</p>
                <p className="text-purple-200 text-sm">امسح للتحقق من الشهادة</p>
              </div>
            </div>
            <button
              onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
            >
              إنشاء QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
