import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HardDrive, Trash2, FileText, Image as ImageIcon, Film, 
  ArrowRight, RefreshCw, AlertCircle, CheckCircle, X 
} from 'lucide-react';
import client from '../../api/client';
import { resolveFileUrl } from '../../config';
import toast from 'react-hot-toast';

interface FileInfo {
  fileName: string;
  folder: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
  url: string;
  isComplete: boolean;
}

interface FilesData {
  files: FileInfo[];
  totalCount: number;
  totalSize: number;
  totalSizeFormatted: string;
}

export default function FileManagerPage() {
  const navigate = useNavigate();
  const [filesData, setFilesData] = useState<FilesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await client.get<FilesData>('/uploads/all');
      setFilesData(response.data);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      toast.error('فشل في جلب الملفات. تأكد من صلاحيات Admin.');
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (folder: string, fileName: string) => {
    try {
      setDeleting(`${folder}/${fileName}`);
      await client.delete(`/uploads/${folder}/${fileName}`);
      toast.success('تم حذف الملف بنجاح');
      await fetchFiles();
    } catch (err: any) {
      console.error('Error deleting file:', err);
      toast.error('فشل في حذف الملف');
    } finally {
      setDeleting(null);
    }
  };

  const cleanupIncomplete = async () => {
    try {
      setLoading(true);
      const response = await client.get<{ message: string; deletedCount: number }>('/uploads/cleanup-incomplete');
      toast.success(response.data.message);
      await fetchFiles();
    } catch (err: any) {
      console.error('Error cleaning up:', err);
      toast.error('فشل في تنظيف الملفات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const filteredFiles = filesData?.files.filter(file => 
    selectedFolder === 'all' || file.folder === selectedFolder
  ) || [];

  const getFolderIcon = (folder: string) => {
    switch (folder) {
      case 'images': return <ImageIcon size={20} className="text-blue-500" />;
      case 'pdfs': return <FileText size={20} className="text-orange-500" />;
      case 'videos': return <Film size={20} className="text-red-500" />;
      default: return <HardDrive size={20} className="text-gray-500" />;
    }
  };

  const getFolderLabel = (folder: string) => {
    switch (folder) {
      case 'images': return 'الصور';
      case 'pdfs': return 'ملفات PDF';
      case 'videos': return 'الفيديوهات';
      default: return folder;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HardDrive size={28} className="text-primary-500" />
            إدارة الملفات
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            عرض وإدارة الملفات المخزنة على Railway
          </p>
        </div>
        <button
          onClick={fetchFiles}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          تحديث
        </button>
      </div>

      {/* Storage Stats */}
      {filesData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الملفات</p>
            <p className="text-2xl font-bold text-blue-600">{filesData.totalCount}</p>
          </div>
          <div className="card p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <p className="text-sm text-gray-600 dark:text-gray-400">المساحة المستخدمة</p>
            <p className="text-2xl font-bold text-red-600">{filesData.totalSizeFormatted}</p>
          </div>
          <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <p className="text-sm text-gray-600 dark:text-gray-400">الملفات المكتملة</p>
            <p className="text-2xl font-bold text-green-600">
              {filesData.files.filter(f => f.isComplete).length}
            </p>
          </div>
          <div className="card p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <p className="text-sm text-gray-600 dark:text-gray-400">ملفات غير مكتملة</p>
            <p className="text-2xl font-bold text-orange-600">
              {filesData.files.filter(f => !f.isComplete).length}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">كل المجلدات</option>
          <option value="images">الصور</option>
          <option value="pdfs">ملفات PDF</option>
          <option value="videos">الفيديوهات</option>
        </select>

        <button
          onClick={cleanupIncomplete}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <Trash2 size={16} />
          حذف الملفات غير المكتملة
        </button>
      </div>

      {/* Warning for large storage */}
      {filesData && filesData.totalSize > 400 * 1024 * 1024 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle size={24} className="text-red-500" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-200">تنبيه: المساحة شبه ممتلئة!</p>
            <p className="text-sm text-red-600 dark:text-red-300">
              لقد استخدمت {filesData.totalSizeFormatted} من 500 MB. يجب حذف بعض الملفات.
            </p>
          </div>
        </div>
      )}

      {/* Files Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">النوع</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">اسم الملف</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الحجم</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">تاريخ الرفع</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الحالة</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFiles.map((file) => (
                <tr key={file.url} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getFolderIcon(file.folder)}
                      <span className="text-sm text-gray-600">{getFolderLabel(file.folder)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                      {file.fileName}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{file.sizeFormatted}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {new Date(file.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {file.isComplete ? (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle size={14} /> مكتمل
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-orange-600">
                        <X size={14} /> غير مكتمل
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href={resolveFileUrl(file.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="عرض الملف"
                      >
                        <ImageIcon size={16} />
                      </a>
                      <button
                        onClick={() => deleteFile(file.folder, file.fileName)}
                        disabled={deleting === `${file.folder}/${file.fileName}`}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="حذف الملف"
                      >
                        {deleting === `${file.folder}/${file.fileName}` ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFiles.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            <HardDrive size={48} className="mx-auto mb-4 opacity-30" />
            <p>لا توجد ملفات في هذا المجلد</p>
          </div>
        )}

        {loading && (
          <div className="p-8 text-center">
            <RefreshCw size={32} className="mx-auto animate-spin text-primary-500" />
            <p className="mt-4 text-gray-500">جاري تحميل الملفات...</p>
          </div>
        )}
      </div>
    </div>
  );
}
