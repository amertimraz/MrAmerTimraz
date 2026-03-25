import { Gamepad2, Code, Brain, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GamesPage() {
  const games = [
    {
      id: 'coding-puzzle',
      title: 'أحاجي البرمجة',
      description: 'حلل الأكواد البرمجية واكتشف الأخطاء المنطقية والقواعدية باحترافية.',
      icon: <Code className="text-blue-500" size={32} />,
      path: '/coding-puzzle',
      status: 'متاح الآن',
      color: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'logic-challenge',
      title: 'تحدي المنطق',
      description: 'اختبر قدراتك في التفكير المنطقي وحل المشكلات المعقدة.',
      icon: <Brain className="text-purple-500" size={32} />,
      path: '#',
      status: 'قريباً',
      color: 'bg-purple-500/10 border-purple-500/20 opacity-60'
    },
    {
      id: 'speed-code',
      title: 'السرعة القصوى',
      description: 'اكتب الكود بأسرع ما يمكن وتنافس مع زملائك في لوحة الصدارة.',
      icon: <Rocket className="text-orange-500" size={32} />,
      path: '#',
      status: 'قريباً',
      color: 'bg-orange-500/10 border-orange-500/20 opacity-60'
    }
  ];

  return (
    <div className="p-6 space-y-8 animate-fade-in" dir="rtl">
      <div className="bg-gradient-to-r from-[#0e3a5a] to-[#1a557e] p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Gamepad2 size={36} className="text-yellow-400" />
            الألعاب التعليمية والتفاعلية
          </h1>
          <p className="opacity-80 text-lg max-w-xl">استمتع بتجربة تعليمية فريدة من خلال حل الألغاز والتحديات البرمجية الممتعة.</p>
        </div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {games.map((game) => (
          <div key={game.id} className={`${game.color} border-2 rounded-3xl p-6 flex flex-col justify-between transition hover:scale-[1.02] hover:shadow-xl`}>
             <div>
                <div className="mb-4">{game.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{game.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">{game.description}</p>
             </div>
             
             <div className="flex items-center justify-between mt-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${game.path === '#' ? 'bg-gray-200 text-gray-500' : 'bg-green-500/20 text-green-600'}`}>
                  {game.status}
                </span>
                {game.path !== '#' ? (
                  <Link to={game.path} className="px-5 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition">
                    ابدأ اللعب
                  </Link>
                ) : (
                  <button disabled className="px-5 py-2 bg-gray-200 text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed">
                    انتظرنا
                  </button>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
