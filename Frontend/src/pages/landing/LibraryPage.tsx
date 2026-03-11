import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { libraryApi } from '../../api/library';
import { motion } from 'framer-motion';
import { FileText, Download, Search, FolderOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { BACKEND_URL } from '../../config';

const card: import('framer-motion').Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }),
};

export default function LibraryPage() {
  const { isDark } = useAuthStore();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const { data: items, isLoading } = useQuery({
    queryKey: ['library-public', filterCat],
    queryFn: () => libraryApi.getAll(filterCat || undefined),
  });

  const { data: categories } = useQuery({
    queryKey: ['library-categories'],
    queryFn: libraryApi.getCategories,
  });

  const filtered = items?.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  const resolveUrl = (url: string) => url.startsWith('/') ? `${BACKEND_URL}${url}` : url;

  const text = isDark ? 'text-white' : 'text-gray-900';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" dir="rtl">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/15 mb-2">
          <FolderOpen size={32} className="text-orange-500" />
        </div>
        <h1 className={`text-4xl font-black ${text}`}>المكتبة التعليمية</h1>
        <p className={`text-lg ${subtext}`}>مذكرات وملفات تعليمية مجانية — حمّلها وادرس بكل سهولة</p>
      </motion.div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className={`absolute top-1/2 -translate-y-1/2 right-3 ${subtext}`} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن مذكرة..."
            className={`w-full pr-10 pl-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-orange-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
            }`}
          />
        </div>
      </div>

      {/* Category chips */}
      {!!categories?.length && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCat('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filterCat === ''
                ? 'bg-orange-500 text-white border-orange-500'
                : isDark
                  ? 'border-white/15 text-gray-400 hover:border-orange-400 hover:text-orange-400'
                  : 'border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-500'
            }`}
          >
            الكل
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filterCat === cat
                  ? 'bg-orange-500 text-white border-orange-500'
                  : isDark
                    ? 'border-white/15 text-gray-400 hover:border-orange-400 hover:text-orange-400'
                    : 'border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Items grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : !filtered?.length ? (
        <div className="text-center py-24 space-y-3">
          <FolderOpen size={56} className="mx-auto text-gray-300" />
          <p className={`text-xl font-semibold ${text}`}>
            {search ? 'لا توجد نتائج لبحثك' : 'لا توجد ملفات حالياً'}
          </p>
          <p className={`text-sm ${subtext}`}>
            {search ? 'جرّب كلمة بحث مختلفة' : 'سيتم إضافة المذكرات قريباً'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              custom={i}
              variants={card}
              initial="hidden"
              animate="visible"
              className={`group rounded-2xl border p-5 flex flex-col gap-4 hover:shadow-lg transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-orange-500/40'
                  : 'bg-white border-gray-100 hover:border-orange-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-base leading-snug ${text}`}>{item.title}</h3>
                  {item.category && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>

              {item.description && (
                <p className={`text-sm ${subtext} line-clamp-3 flex-1`}>{item.description}</p>
              )}

              <a
                href={resolveUrl(item.fileUrl)}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors mt-auto"
              >
                <Download size={16} />
                تحميل المذكرة
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
