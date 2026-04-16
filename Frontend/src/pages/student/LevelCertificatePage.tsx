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

      // Always open WhatsApp directly with the certificate image
      const imageUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `Mr-Amer-Certificate-${quizAttempt.quizId}.png`;
      a.click();
      URL.revokeObjectURL(imageUrl);

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
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
        className="relative overflow-hidden rounded-2xl p-8 md:p-10 shadow-2xl border border-yellow-300/30 bg-gradient-to-br from-[#070b18] via-[#0f1933] to-[#070b18] max-w-4xl mx-auto"
        style={{ minHeight: '600px' }}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_12%_18%,#facc15_0,transparent_32%),radial-gradient(circle_at_88%_80%,#38bdf8_0,transparent_28%)]" />
        <div className="absolute inset-4 rounded-xl border border-white/15" />
        <div className="absolute inset-0 pointer-events-none opacity-10 text-cyan-200 font-mono text-xs">
          <span className="absolute top-16 right-20">{'</>'}</span>
          <span className="absolute top-24 left-20">{'{}'}</span>
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
          <p className="text-3xl md:text-4xl font-black text-yellow-300 mb-8">{user?.name ?? 'طالب المنصة'}</p>

          <div className="mx-auto max-w-3xl rounded-xl bg-white/5 border border-white/15 px-4 py-4 mb-8">
            <p className="text-sm text-gray-300 mb-1">لاستكمال اختبار</p>
            <p className="text-xl md:text-2xl font-bold text-white">{quizAttempt.quizTitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4">
              <p className="text-sm text-gray-300">الدرجة</p>
              <p className="text-2xl font-bold text-white">{quizAttempt.score}/{quizAttempt.total}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4">
              <p className="text-sm text-gray-300">النسبة</p>
              <p className="text-2xl font-bold text-green-400">{quizAttempt.pct}%</p>
            </div>
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
            <p>Issued At: {new Date(quizAttempt.completedAt).toLocaleString('ar-EG')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
