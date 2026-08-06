import { useSearchParams } from 'react-router-dom';
import { BookOpen, Gift, Presentation } from 'lucide-react';
import BookletsManager from './BookletsManager';
import FreeResourcesManager from './FreeResourcesManager';
import TeacherPackagesManager from './TeacherPackagesManager';

type Tab = 'booklets' | 'free' | 'packages';

const TABS: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: 'booklets', label: 'الملازم الدراسية', icon: BookOpen },
  { id: 'free', label: 'الخدمات المجانية', icon: Gift },
  { id: 'packages', label: 'باكدجات المعلمين', icon: Presentation },
];

export default function ContentManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: Tab = tabParam === 'free' || tabParam === 'packages' ? tabParam : 'booklets';

  const setTab = (t: Tab) => setSearchParams(t === 'booklets' ? {} : { tab: t });

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-gray-900 p-2 rounded-2xl border border-gray-800 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'booklets' && <BookletsManager />}
      {tab === 'free' && <FreeResourcesManager />}
      {tab === 'packages' && <TeacherPackagesManager />}
    </div>
  );
}
