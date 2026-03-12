import { FileText } from 'lucide-react';

interface PdfThumbnailProps {
  thumbnailUrl?: string;
  className?: string;
}

export default function PdfThumbnail({ thumbnailUrl, className = '' }: PdfThumbnailProps) {
  if (thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl}
        alt="thumbnail"
        className={`object-cover w-full h-full ${className}`}
        onError={e => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.removeAttribute('style');
        }}
      />
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center bg-orange-50 dark:bg-orange-900/20 rounded-xl ${className}`}>
      <FileText size={40} className="text-orange-400" />
      <span className="text-xs text-orange-400 mt-1 font-semibold">PDF</span>
    </div>
  );
}
