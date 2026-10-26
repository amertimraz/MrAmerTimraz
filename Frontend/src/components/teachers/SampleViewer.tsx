import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMediaUrl } from '../../api/client';
import type { SamplePage } from '../../api/teachers';

// Samples are server-side watermarked images; no download link is ever rendered here.
export default function SampleViewer({ samples }: { samples: SamplePage[] }) {
  const [index, setIndex] = useState(0);

  if (samples.length === 0) {
    return (
      <p className="rounded-xl border-2 border-dashed border-slate-400 p-6 text-center font-bold text-slate-700 dark:text-slate-300">
        العينات قريباً
      </p>
    );
  }

  const go = (d: number) => setIndex(i => (i + d + samples.length) % samples.length);

  return (
    <section aria-label="عينات من المذكرة" className="select-none">
      <div className="relative overflow-hidden rounded-2xl border-2 border-slate-900 bg-white dark:border-teal-300">
        <img
          src={getMediaUrl(samples[index].imageUrl)}
          alt={`صفحة عينة ${index + 1} من ${samples.length}`}
          loading="lazy"
          draggable={false}
          onContextMenu={e => e.preventDefault()}
          className="mx-auto max-h-[70vh] w-full object-contain"
        />
        {samples.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="الصفحة السابقة"
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-slate-900 bg-orange-500 text-slate-900"
            >
              <ChevronRight size={20} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="الصفحة التالية"
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-slate-900 bg-orange-500 text-slate-900"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
          </>
        )}
      </div>
      <p className="mt-2 text-center text-sm font-bold text-slate-700 dark:text-slate-300">
        {(index + 1).toLocaleString('ar-EG')} / {samples.length.toLocaleString('ar-EG')}
      </p>
    </section>
  );
}
