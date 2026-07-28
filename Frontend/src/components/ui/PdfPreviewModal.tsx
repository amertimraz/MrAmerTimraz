import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { X, ChevronLeft, ChevronRight, Loader2, Lock, MessageCircle } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

interface PdfPreviewModalProps {
  url: string;
  title: string;
  maxPages?: number;
  onClose: () => void;
  studentWaLink?: string;
  teacherWaLink?: string;
}

export default function PdfPreviewModal({ url, title, maxPages = 5, onClose, studentWaLink, teacherWaLink }: PdfPreviewModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const previewLimit = totalPages > 0 ? Math.min(maxPages, totalPages) : maxPages;
  const isLocked = currentPage >= previewLimit && totalPages > maxPages;

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';

    const load = async () => {
      setLoading(true);
      setError(false);
      setPdf(null);
      setTotalPages(0);
      setCurrentPage(1);

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('fetch failed');
        const blob = await res.blob();
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        const doc = await pdfjsLib.getDocument({ url: objectUrl }).promise;
        if (cancelled) { doc.destroy(); return; }

        setPdf(doc);
        setTotalPages(doc.numPages);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  useEffect(() => {
    if (!pdf || !canvasRef.current || isLocked) return;
    let cancelled = false;

    const render = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        if (cancelled) return;

        const container = canvasRef.current!.parentElement!;
        const containerWidth = container.clientWidth || 800;
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(containerWidth / baseViewport.width, 2.5);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      } catch {
        /* render cancelled */
      }
    };

    render();
    return () => { cancelled = true; };
  }, [pdf, currentPage, isLocked]);

  const goTo = (n: number) => {
    if (n >= 1 && n <= Math.min(maxPages, totalPages || maxPages)) setCurrentPage(n);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.95)' }} dir="rtl">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-white font-semibold text-sm truncate max-w-xs">{title}</h2>
          <span className="text-xs text-amber-400 shrink-0 flex items-center gap-1">
            <Lock size={12} /> معاينة — أول {previewLimit} صفحات
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-red-500/80 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-auto flex items-start justify-center py-6 px-4">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-white mt-24">
            <Loader2 size={36} className="animate-spin text-green-400" />
            <span className="text-sm text-gray-400">جاري تحميل المعاينة...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 text-white mt-24">
            <span className="text-5xl">⚠️</span>
            <p className="text-gray-300 font-medium">تعذّر تحميل المعاينة</p>
          </div>
        )}

        {!loading && !error && !isLocked && (
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <canvas ref={canvasRef} style={{ display: 'block' }} />
          </div>
        )}

        {!loading && !error && isLocked && (
          <div className="flex flex-col items-center gap-5 text-white mt-16 max-w-sm text-center px-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <Lock size={28} className="text-green-400" />
            </div>
            <div>
              <p className="font-bold text-lg mb-1.5">باقي {totalPages - previewLimit} صفحة</p>
              <p className="text-sm text-gray-400 leading-relaxed">اشترِ المذكرة كاملة عشان تقدر تشوف كل الصفحات وتحملها</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {studentWaLink && (
                <a href={studentWaLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm"
                  style={{ background: '#22c55e' }}>
                  <MessageCircle size={16} /> اطلب نسخة الطالب
                </a>
              )}
              {teacherWaLink && (
                <a href={teacherWaLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm"
                  style={{ background: '#0ea5e9' }}>
                  <MessageCircle size={16} /> اطلب نسخة المعلم
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {!loading && !error && previewLimit > 1 && (
        <div className="shrink-0 py-3 px-4 bg-gray-900 border-t border-white/10 flex items-center justify-center gap-4">
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <ChevronRight size={16} /> السابقة
          </button>
          <span className="text-white text-sm font-medium">
            {Math.min(currentPage, previewLimit)} / {previewLimit}
          </span>
          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage >= previewLimit}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            التالية <ChevronLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
