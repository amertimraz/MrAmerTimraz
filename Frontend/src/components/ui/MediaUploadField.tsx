import { useRef, useState } from 'react';
import { Upload, Link2, X, Loader2, FileText, Film } from 'lucide-react';
import { uploadsApi } from '../../api/uploads';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../../config';

type MediaType = 'image' | 'pdf' | 'video';

interface MediaUploadFieldProps {
  type: MediaType;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  optional?: boolean;
}

const BACKEND = BACKEND_URL;

const config: Record<MediaType, { accept: string; maxMB: number; icon: React.ReactNode; hint: string }> = {
  image: { accept: 'image/*', maxMB: 10,  icon: <Upload size={18} />,   hint: 'JPG, PNG, WEBP — حتى 10 MB' },
  pdf:   { accept: '.pdf',    maxMB: 50,  icon: <FileText size={18} />, hint: 'PDF — حتى 50 MB' },
  video: { accept: 'video/*', maxMB: 500, icon: <Film size={18} />,     hint: 'MP4, WEBM — حتى 500 MB' },
};

export default function MediaUploadField({ type, value, onChange, label, optional = true }: MediaUploadFieldProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const cfg = config[type];

  const handleFile = async (file: File) => {
    if (file.size > cfg.maxMB * 1024 * 1024) {
      toast.error(`حجم الملف يتجاوز ${cfg.maxMB} MB`);
      return;
    }
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => setProgress(p => Math.min(p + 10, 85)), 300);
    try {
      const url = await uploadsApi[type](file);
      clearInterval(interval);
      setProgress(100);
      onChange(url);
      toast.success('تم رفع الملف بنجاح!');
    } catch {
      clearInterval(interval);
      toast.error('فشل رفع الملف، حاول مرة أخرى');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const previewUrl = value.startsWith('/') ? `${BACKEND}${value}` : value;

  return (
    <div className="space-y-3">
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {cfg.icon}
          {label} {optional && <span className="text-xs font-normal text-gray-400">(اختياري)</span>}
        </label>
      )}

      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 gap-1 w-fit">
        <button type="button" onClick={() => setTab('upload')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${tab === 'upload' ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : 'text-gray-500'}`}>
          <Upload size={13} /> رفع من الجهاز
        </button>
        <button type="button" onClick={() => setTab('url')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${tab === 'url' ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : 'text-gray-500'}`}>
          <Link2 size={13} /> إضافة رابط
        </button>
      </div>

      {tab === 'upload' ? (
        <div>
          <input ref={fileRef} type="file" accept={cfg.accept} className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-400 hover:bg-primary-50/30 dark:hover:border-primary-500 transition-colors disabled:opacity-60">
            {uploading ? (
              <>
                <Loader2 size={24} className="animate-spin text-primary-500" />
                <span className="text-sm text-primary-600 font-medium">جاري الرفع... {progress}%</span>
                <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : (
              <>
                <div className="text-primary-400">{cfg.icon}</div>
                <span className="text-sm text-gray-500">اضغط لاختيار الملف</span>
                <span className="text-xs text-gray-400">{cfg.hint}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <input type="url" value={value} onChange={e => onChange(e.target.value)}
          className="input-field" placeholder="https://..." />
      )}

      {value && (
        <div className="relative">
          {type === 'image' && (
            <img src={previewUrl} alt="preview"
              className="w-full max-h-44 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
              onError={e => (e.currentTarget.style.display = 'none')} />
          )}
          {type === 'pdf' && (
            <a href={previewUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 text-sm hover:bg-orange-100 transition-colors">
              <FileText size={16} />
              <span className="truncate">{value.split('/').pop()}</span>
            </a>
          )}
          {type === 'video' && (
            <video src={previewUrl} controls className="w-full rounded-xl border border-gray-200 dark:border-gray-700 max-h-52" />
          )}
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
