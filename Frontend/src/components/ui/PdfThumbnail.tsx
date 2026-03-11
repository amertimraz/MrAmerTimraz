import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FileText } from 'lucide-react';
import { BACKEND_URL } from '../../config';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

interface PdfThumbnailProps {
  url: string;
  className?: string;
}

export default function PdfThumbnail({ url, className = '' }: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const resolvedUrl = url.startsWith('/') ? `${BACKEND_URL}${url}` : url;

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      if (!canvasRef.current) return;
      setLoading(true);
      setError(false);
      try {
        const pdf = await pdfjsLib.getDocument({ url: resolvedUrl, withCredentials: false }).promise;
        if (cancelled) return;
        const page = await pdf.getPage(1);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: 1 });
        const scale = 300 / viewport.width;
        const scaled = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = scaled.width;
        canvas.height = scaled.height;

        await page.render({ canvasContext: canvas.getContext('2d')!, viewport: scaled, canvas }).promise;
        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) { setError(true); setLoading(false); }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [resolvedUrl]);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-orange-50 dark:bg-orange-900/20 rounded-xl ${className}`}>
        <FileText size={40} className="text-orange-400" />
        <span className="text-xs text-orange-400 mt-1">PDF</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        style={{ display: 'block' }}
      />
    </div>
  );
}
