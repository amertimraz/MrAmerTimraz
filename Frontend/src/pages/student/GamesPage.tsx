import { Gamepad2, Sparkles } from 'lucide-react';

export default function GamesPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-fade-in p-6">
      <div className="relative">
        <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center text-primary-600 dark:text-primary-400 animate-pulse">
          <Gamepad2 size={48} />
        </div>
        <Sparkles className="absolute -top-2 -right-2 text-yellow-500 animate-bounce" size={24} />
      </div>

      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">الألعاب التعليمية</h1>
        <div className="inline-block px-4 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-bold tracking-wider uppercase">
          قريباً جداً
        </div>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-lg">
          نحن نعمل حالياً على تطوير تجربة تعليمية ممتعة وفريدة من نوعها. ترقبوا إطلاق الألعاب التفاعلية في التحديثات القادمة!
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-sm mt-8 opacity-50">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 w-1/3 animate-shimmer" style={{ animationDelay: `${i * 0.2}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
