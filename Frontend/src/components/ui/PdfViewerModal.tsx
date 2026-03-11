import { X, Download, ExternalLink } from 'lucide-react';
import { BACKEND_URL } from '../../config';

interface PdfViewerModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function PdfViewerModal({ url, title, onClose }: PdfViewerModalProps) {
  const resolvedUrl = url.startsWith('/') ? `${BACKEND_URL}${url}` : url;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-white/10 shrink-0">
        <h2 className="text-white font-semibold text-sm truncate max-w-xs">{title}</h2>
        <div className="flex items-center gap-2">
          <a
            href={resolvedUrl}
            download
            target="_blank"
            rel="noreferrer"
            title="تحميل"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors"
          >
            <Download size={14} />
            تحميل
          </a>
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noreferrer"
            title="فتح في تبويب جديد"
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ExternalLink size={16} />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-red-500/80 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <iframe
          src={`${resolvedUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          className="w-full h-full border-0"
          title={title}
        />
      </div>
    </div>
  );
}
