import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { useAuthStore } from '../../store/authStore';
import {
  buildCertificateId,
  getStoredAttempts,
} from '../../utils/levelAssessments';

export default function LevelCertificatePage() {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuthStore();
  const certRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const attempts = getStoredAttempts(user?.id);
  const quizAttempt = attempts[Number(quizId)];
  const WHATSAPP_NUMBER = '201096066818';

  const certId = useMemo(() => {
    if (!quizAttempt) return '';
    return buildCertificateId(user?.id, quizAttempt.quizId, quizAttempt.completedAt);
  }, [quizAttempt, user?.id]);

  const getCertificatePngBlob = async (): Promise<Blob> => {
    if (!certRef.current) throw new Error('Certificate ref not found');
    const dataUrl = await toPng(certRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      // Avoid cross-origin CSS rules errors from remote Google Fonts stylesheets.
      skipFonts: true,
      fontEmbedCSS: '',
    } as any);
    const response = await fetch(dataUrl);
    return response.blob();
  };

  const downloadAsImage = async () => {
    if (!certRef.current || !quizAttempt) return;
    setDownloading(true);
    try {
      const blob = await getCertificatePngBlob();
      const dataUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Mr-Amer-JS-Certificate-Level-${quizAttempt.quizId}.png`;
      a.click();
      URL.revokeObjectURL(dataUrl);
    } catch {
      // Fallback if image generation fails.
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const shareWithMrAmer = async () => {
    if (!quizAttempt) return;
    setSharing(true);
    const text = `السلام عليكم مستر عامر تمراز 🌟\nأنا ${user?.name ?? 'طالب المنصة'}\nأنهيت ${quizAttempt.quizTitle}\nالنتيجة: ${quizAttempt.score}/${quizAttempt.total} (${quizAttempt.pct}%)\nCertificate ID: ${certId}\nحابب مشاركة الشهادة لعرضها على القناة.`;
    try {
      const blob = await getCertificatePngBlob();
      const file = new File([blob], `Mr-Amer-Certificate-${quizAttempt.quizId}.png`, { type: 'image/png' });

      // Best UX on mobile: share image + text directly (including WhatsApp target).
      if (navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'شهادة منصة مستر عامر تمراز',
          text,
          files: [file],
        });
      } else {
        // Web fallback: download the image then open WhatsApp chat with prefilled text.
        const imageUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `Mr-Amer-Certificate-${quizAttempt.quizId}.png`;
        a.click();
        URL.revokeObjectURL(imageUrl);

        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
      }
    } finally {
      setSharing(false);
    }
  };

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
        <div className="flex gap-2">
          <button onClick={downloadAsImage} className="btn-primary" disabled={downloading}>
            {downloading ? 'جاري التحميل...' : 'تحميل الشهادة صورة'}
          </button>
          <button onClick={shareWithMrAmer} className="btn-secondary" disabled={sharing}>
            {sharing ? 'جاري المشاركة...' : 'مشاركة مع مستر عامر'}
          </button>
        </div>
      </div>

      <div
        ref={certRef}
        className="relative overflow-hidden rounded-2xl p-10 text-center shadow-2xl border border-yellow-400/30 bg-gradient-to-br from-[#0a0f1f] via-[#121a32] to-[#0a0f1f]"
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_15%_20%,#facc15_0,transparent_35%),radial-gradient(circle_at_90%_80%,#38bdf8_0,transparent_30%)]" />
        <div className="absolute top-4 left-6 text-yellow-300/50 font-mono text-xs">const certificate = {'{'} level: "JavaScript" {'}'}</div>
        <div className="absolute bottom-4 right-6 text-cyan-300/50 font-mono text-xs">// Koryo x Mr Amer Timraz</div>

        <div className="relative z-10">
          <p className="text-sm tracking-widest text-yellow-200 mb-3">KORYO JAVASCRIPT CERTIFICATE</p>
          <h1 className="text-4xl font-extrabold text-white mb-2">شهادة إتمام مستوى</h1>
          <p className="text-cyan-200 mb-2">مقدمة من منصة مستر عامر تمراز</p>
          <p className="text-gray-300 mb-10">Presented by Mr Amer Timraz Platform</p>

          <p className="text-lg text-gray-200 mb-2">تُمنح هذه الشهادة إلى</p>
          <p className="text-3xl font-bold text-yellow-300 mb-8">{user?.name ?? 'طالب المنصة'}</p>

          <p className="text-lg text-gray-200 mb-2">لاستكمال اختبار</p>
          <p className="text-2xl font-semibold text-white mb-8">{quizAttempt.quizTitle}</p>

          <div className="flex items-center justify-center gap-10 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4">
              <p className="text-sm text-gray-300">الدرجة</p>
              <p className="text-2xl font-bold text-white">{quizAttempt.score}/{quizAttempt.total}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4">
              <p className="text-sm text-gray-300">النسبة</p>
              <p className="text-2xl font-bold text-green-400">{quizAttempt.pct}%</p>
            </div>
          </div>

          <div className="border-t border-white/15 pt-5 text-sm text-gray-300 space-y-1">
            <p>Certificate ID: <span className="font-semibold text-yellow-300">{certId}</span></p>
            <p>Issued At: {new Date(quizAttempt.completedAt).toLocaleString('ar-EG')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
