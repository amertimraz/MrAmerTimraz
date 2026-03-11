import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { aiApi } from '../../api/ai';
import toast from 'react-hot-toast';

interface AiDescriptionButtonProps {
  title: string;
  context: string;
  onGenerated: (text: string) => void;
}

export default function AiDescriptionButton({ title, context, onGenerated }: AiDescriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!title.trim()) {
      toast.error('اكتب العنوان أولاً حتى يتم توليد الوصف');
      return;
    }
    setLoading(true);
    try {
      const res = await aiApi.describe(title, context);
      onGenerated(res.description);
      toast.success('تم توليد الوصف بالذكاء الاصطناعي ✨');
    } catch {
      toast.error('فشل توليد الوصف، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title="توليد وصف بالذكاء الاصطناعي"
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
      {loading ? 'جارٍ التوليد...' : 'AI ✨'}
    </button>
  );
}
