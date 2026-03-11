import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { X, Download, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { BACKEND_URL } from '../../config';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

interface PdfViewerModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function PdfViewerModal({ url, title, onClose }: PdfViewerModalProps) {
  const resolvedUrl = url.startsWith('/') ? `${BACKEND_URL}${url}` : url;
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<ReturnType<ReturnType<PDFDocumentProxy['getPage']>['then']> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    pdfjsLib.getDocument({ url: resolvedUrl, withCredentials: false }).promise
      .then(doc => {
        if (cancelled) return;
        setPdf(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) { setError(true); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [resolvedUrl]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    let cancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        if (cancelled) return;

        const container = canvasRef.current!.parentElement!;
        const containerWidth = container.clientWidth || 800;
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(containerWidth / viewport.width, 2);
        const scaled = page.getViewport({ scale });

        const canvas = canvasRef.current!;
        canvas.width = scaled.width;
        canvas.height = scaled.height;

        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const task = page.render({ canvasContext: ctx, viewport: scaled, canvas });
        renderTaskRef.current = task.promise as unknown as typeof renderTaskRef.current;
        await task.promise;
      } catch {
        // ignore cancelled renders
      }
    };

    renderPage();
    return () => { cancelled = true; };
  }, [pdf, currentPage]);

  const goToPage = (n: number) => {
    if (n >= 1 && n <= totalPages) setCurrentPage(n);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      dir="rtl"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-white font-semibold text-sm truncate max-w-xs">{title}</h2>
          {totalPages > 0 && (
            <span className="text-xs text-gray-400 shrink-0">
              صفحة {currentPage} من {totalPages}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}

          <a
            href={resolvedUrl}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors"
          >
            <Download size={14} />
            تحميل
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-red-500/80 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-start justify-center py-6 px-4">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-white mt-24">
            <Loader2 size={36} className="animate-spin text-orange-400" />
            <span className="text-sm text-gray-400">جاري تحميل الملف...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 text-white mt-24">
            <span className="text-4xl">⚠️</span>
            <p className="text-gray-300 font-medium">تعذّر تحميل الملف</p>
            <p className="text-gray-500 text-sm">تأكد من أن الملف موجود وحاول مرة أخرى</p>
            <a
              href={resolvedUrl}
              download
              className="mt-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              تحميل مباشر
            </a>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <canvas ref={canvasRef} style={{ display: 'block' }} />
          </div>
        )}
      </div>

      {totalPages > 1 && !loading && !error && (
        <div className="shrink-0 py-3 px-4 bg-gray-900 border-t border-white/10 flex items-center justify-center gap-4">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage <= 1}
            className="text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            الأولى
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <ChevronRight size={16} /> السابقة
          </button>
          <span className="text-white text-sm font-medium">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            التالية <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            الأخيرة
          </button>
        </div>
      )}
    </div>
  );
}
