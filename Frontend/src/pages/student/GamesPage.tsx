import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { QuizScene } from '../../games/QuizGame';
import { MatchScene } from '../../games/MatchGame';
import { Gamepad2, Brain, Layers } from 'lucide-react';

type GameType = 'quiz' | 'match' | null;

const GAMES = [
  { id: 'quiz',  title: 'لعبة الأسئلة',       desc: 'أجب على أسئلة متنوعة واكسب النقاط',        icon: <Brain size={32} />,    color: 'from-blue-500 to-primary-700' },
  { id: 'match', title: 'لعبة مطابقة البطاقات', desc: 'طابق البطاقات المتشابهة بأقل عدد من الحركات', icon: <Layers size={32} />,   color: 'from-purple-500 to-accent-600' },
];

export default function GamesPage() {
  const gameRef   = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<Phaser.Game | null>(null);
  const [active, setActive] = useState<GameType>(null);

  const startGame = (type: GameType) => {
    if (phaserRef.current) { phaserRef.current.destroy(true); phaserRef.current = null; }
    setActive(type);
  };

  useEffect(() => {
    if (!active || !gameRef.current) return;

    const scenes: Record<string, typeof Phaser.Scene[]> = {
      quiz:  [QuizScene  as unknown as typeof Phaser.Scene],
      match: [MatchScene as unknown as typeof Phaser.Scene],
    };

    phaserRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 480,
      height: 540,
      backgroundColor: '#0f172a',
      scene: scenes[active],
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    });

    return () => { phaserRef.current?.destroy(true); phaserRef.current = null; };
  }, [active]);

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Gamepad2 className="text-primary-600" size={28} /> الألعاب التعليمية
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">تعلّم وأنت تلعب وتستمتع!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GAMES.map(g => (
          <button key={g.id} onClick={() => startGame(g.id as GameType)}
            className={`card p-6 text-right hover:shadow-lg transition-all group overflow-hidden relative ${active === g.id ? 'ring-2 ring-primary-500' : ''}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${g.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
            <div className={`w-14 h-14 bg-gradient-to-br ${g.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
              {g.icon}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{g.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{g.desc}</p>
            <div className="mt-4 text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:underline">
              {active === g.id ? '🎮 يتم اللعب...' : 'ابدأ اللعبة ←'}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="card overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">
              {GAMES.find(g => g.id === active)?.title}
            </h3>
            <button onClick={() => { phaserRef.current?.destroy(true); phaserRef.current = null; setActive(null); }}
              className="btn-secondary text-sm py-1.5 px-3">
              إيقاف اللعبة
            </button>
          </div>
          <div className="flex justify-center bg-gray-900 p-4">
            <div ref={gameRef} className="rounded-xl overflow-hidden shadow-2xl" style={{ width: 480, height: 540 }} />
          </div>
        </div>
      )}
    </div>
  );
}
