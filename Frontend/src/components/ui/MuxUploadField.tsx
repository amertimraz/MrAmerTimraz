import { useRef, useState } from 'react';
import { Upload, X, Loader2, Film, CheckCircle } from 'lucide-react';
import { videosApi } from '../../api/videos';
import toast from 'react-hot-toast';

interface MuxUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  optional?: boolean;
}

export default function MuxUploadField({ value, onChange, label, optional = true }: MuxUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const maxMB = 500; // 500 MB max for videos

  const handleFile = async (file: File) => {
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`حجم الملف يتجاوز ${maxMB} MB`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Create direct upload URL from Backend
      const { uploadUrl, assetId: newAssetId } = await videosApi.createMuxDirectUpload();

      // Step 2: Upload file directly to Mux
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setUploading(false);
          setIsProcessing(true);
          setProgress(100);
          toast.success('تم رفع الفيديو! جاري المعالجة...');

          // Step 3: Poll for playback ID
          try {
            const playbackResult = await videosApi.getMuxPlaybackId(newAssetId);
            onChange(playbackResult.url);
            toast.success('تم إنشاء الفيديو بنجاح!');
          } catch (err) {
            toast.error('تم رفع الفيديو ولكن لم يكتمل معالجته بعد. حاول إضافة الدرس وانتظر قليلاً.');
            // Set a placeholder URL that will be updated later
            onChange(`https://stream.mux.com/${newAssetId}.m3u8`);
          } finally {
            setIsProcessing(false);
          }
        } else {
          throw new Error('Upload failed');
        }
      };

      xhr.onerror = () => {
        throw new Error('Network error');
      };

      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.send(file);

    } catch (err: any) {
      console.error('Mux upload error:', err);
      toast.error('فشل رفع الفيديو، حاول مرة أخرى');
      setUploading(false);
      setIsProcessing(false);
    }
  };

  const clear = () => {
    onChange('');
    setProgress(0);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Film size={18} />
          {label} {optional && <span className="text-xs font-normal text-gray-400">(اختياري)</span>}
        </label>
      )}

      {!value ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || isProcessing}
            className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-primary-300 dark:border-primary-600 rounded-xl hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-60"
          >
            {uploading || isProcessing ? (
              <>
                <Loader2 size={24} className="animate-spin text-primary-500" />
                <span className="text-sm text-primary-600 font-medium">
                  {isProcessing ? 'جاري المعالجة...' : `جاري الرفع... ${progress}%`}
                </span>
                {!isProcessing && (
                  <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <Upload size={20} className="text-primary-600" />
                </div>
                <span className="text-sm text-gray-600 font-medium">اضغط لاختيار فيديو</span>
                <span className="text-xs text-gray-400">MP4, WEBM — حتى 500 MB</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <CheckCircle size={24} className="text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">تم رفع الفيديو بنجاح</p>
              <p className="text-xs text-green-600 dark:text-green-400 truncate">{value}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
