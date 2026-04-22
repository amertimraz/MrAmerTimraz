import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  Globe, 
  Server, 
  ShieldCheck, 
  Info, 
  ArrowRight, 
  Database,
  Search,
  Activity,
  Zap,
  FileCode,
  Share2
} from 'lucide-react';

export default function InteractiveProgrammingTheory() {
  const [currentLesson, setCurrentLesson] = useState(1);
  const [activeTab, setActiveTab] = useState<string>('types');
  const [searchUrl, setSearchUrl] = useState('google.com');
  const [resolvedIp, setResolvedIp] = useState('');
  const [selectedTopology, setSelectedTopology] = useState('Star');
  const [selectedProtocol, setSelectedProtocol] = useState('TCP/IP');

  const topologies = [
    { name: 'Star (النجمة)', icon: '⭐', desc: 'تتصل جميع أجهزة الشبكة بجهاز مركزي (Switch). وهي الأكثر انتشاراً لسهولة إدارتها.' },
    { name: 'Mesh (الشبكي)', icon: '🕸️', desc: 'كل جهاز متصل بكل الأجهزة الأخرى في الشبكة بمسارات مباشرة.' },
    { name: 'Bus (الناقل)', icon: '🚌', desc: 'تتصل جميع الأجهزة بكابل واحد رئيسي يبدأ بنقطة وينتهي بنقطة.' },
  ];

  const protocols = [
    { id: 'TCP/IP', name: 'TCP/IP', icon: <Share2 size={24} />, desc: 'البروتوكول الأساسي الذي يربط أجهزة الكمبيوتر ببعضها عبر الإنترنت.', color: 'blue' },
    { id: 'HTTP', name: 'HTTP', icon: <Globe size={24} />, desc: 'يستخدم لنقل صفحات الويب من الخادم (Server) إلى جهاز المستخدم.', color: 'orange' },
    { id: 'FTP', name: 'FTP', icon: <FileCode size={24} />, desc: 'يستخدم لنقل الملفات من وإلى أجهزة الكمبيوتر على الشبكة.', color: 'purple' },
  ];

  const handleDnsLookup = () => {
    if (searchUrl.includes('google')) setResolvedIp('142.250.190.46');
    else if (searchUrl.includes('facebook')) setResolvedIp('157.240.2.35');
    else setResolvedIp('192.168.1.' + Math.floor(Math.random() * 254));
  };

  return (
    <div className="w-full bg-gray-950 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl font-['Cairo'] text-right" dir="rtl">
      {/* Lesson Selector */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Zap size={20} />
          </div>
          <div>
            <h2 className="text-white font-bold leading-tight">الوحدة الثامنة: الشبكات والإنترنت</h2>
            <p className="text-gray-500 text-xs">اختر الدرس لبدء الشرح التفاعلي</p>
          </div>
        </div>
        <div className="flex bg-black/40 p-1 rounded-2xl border border-gray-800">
           {[
             { id: 1, title: 'شبكات الكمبيوتر' },
             { id: 2, title: 'عناوين IP وأسماء النطاقات' },
             { id: 3, title: 'بروتوكول الاتصال' }
           ].map(lesson => (
             <button 
              key={lesson.id}
              onClick={() => { setCurrentLesson(lesson.id); setActiveTab(lesson.id === 1 ? 'types' : lesson.id === 2 ? 'dns' : 'protocols'); }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${currentLesson === lesson.id ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
             >
               {lesson.title}
             </button>
           ))}
        </div>
      </div>

      <div className="flex bg-gray-900/50 p-2 gap-2 border-b border-gray-800">
        {currentLesson === 1 && (
          <>
            <TabButton active={activeTab === 'types'} onClick={() => setActiveTab('types')} icon={<Globe size={18} />} label="أنواع الشبكات" />
            <TabButton active={activeTab === 'topologies'} onClick={() => setActiveTab('topologies')} icon={<Network size={18} />} label="طوبولوجيا الشبكة" />
          </>
        )}
        {currentLesson === 2 && (
          <>
            <TabButton active={activeTab === 'dns'} onClick={() => setActiveTab('dns')} icon={<Search size={18} />} label="نظام DNS" />
            <TabButton active={activeTab === 'ip'} onClick={() => setActiveTab('ip')} icon={<Activity size={18} />} label="عناوين IP" />
          </>
        )}
        {currentLesson === 3 && (
          <>
            <TabButton active={activeTab === 'protocols'} onClick={() => setActiveTab('protocols')} icon={<Share2 size={18} />} label="أنواع البروتوكولات" />
            <TabButton active={activeTab === 'how-it-works'} onClick={() => setActiveTab('how-it-works')} icon={<Activity size={18} />} label="كيفية العمل" />
          </>
        )}
      </div>

      <div className="p-8 min-h-[450px]">
        <AnimatePresence mode="wait">
          {activeTab === 'types' && (
            <motion.div key="types" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <SectionHeader title="الدرس الأول: شبكات الكمبيوتر" desc="مفهوم الشبكة: مجموعة من الأجهزة المتصلة معاً لمشاركة الموارد." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NetworkCard title="LAN (شبكة محلية)" subtitle="Local Area Network" desc="شبكة تغطي مساحة جغرافية محدودة (مثل معمل الكمبيوتر)." color="blue" icon={<Server size={30} />} />
                <NetworkCard title="WAN (شبكة واسعة)" subtitle="Wide Area Network" desc="شبكة تغطي مساحات جغرافية واسعة (مثل شبكة الإنترنت)." color="orange" icon={<Globe size={30} />} />
              </div>
            </motion.div>
          )}

          {activeTab === 'topologies' && (
            <motion.div key="topologies" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <SectionHeader title="طوبولوجيا الشبكة" desc="الطريقة التي يتم بها تنظيم وتوصيل أجهزة الشبكة." />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-3">
                  {topologies.map((t) => (
                    <button key={t.name} onClick={() => setSelectedTopology(t.name.split(' ')[0])} className={`w-full text-right p-4 rounded-2xl border transition-all ${selectedTopology === t.name.split(' ')[0] ? 'bg-green-500/20 border-green-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
                      <div className="flex items-center gap-3"> <span className="text-2xl">{t.icon}</span> <span className="font-bold">{t.name}</span> </div>
                    </button>
                  ))}
                </div>
                <div className="lg:col-span-2 bg-gray-900 rounded-3xl border border-gray-800 p-8 flex flex-col items-center justify-center">
                   <TopologyVisual type={selectedTopology} />
                   <p className="mt-8 text-gray-400 text-center text-sm">{topologies.find(t => t.name.includes(selectedTopology))?.desc}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'dns' && (
            <motion.div key="dns" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-6">
               <SectionHeader title="الدرس الثاني: عناوين IP وأسماء النطاقات" desc="يستخدم نظام DNS لتحويل أسماء النطاقات إلى عناوين IP." />
               <div className="bg-purple-500/5 border border-purple-500/20 p-8 rounded-3xl text-center space-y-8">
                  <div className="max-w-md mx-auto">
                    <div className="relative group">
                      <input type="text" value={searchUrl} onChange={(e) => setSearchUrl(e.target.value)} className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-6 py-4 text-white text-left font-mono focus:border-purple-500 outline-none pr-12" />
                      <button onClick={handleDnsLookup} className="absolute left-2 top-2 bottom-2 bg-purple-600 text-white px-6 rounded-xl font-bold">تحويل</button>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <DnsBox label="URL" value={searchUrl} icon={<Globe size={18} />} active />
                    <ArrowRight className="text-gray-700 hidden md:block" />
                    <DnsBox label="DNS Server" value="يتم البحث..." icon={<Database size={18} />} active highlight />
                    <ArrowRight className="text-gray-700 hidden md:block" />
                    <DnsBox label="IP Address" value={resolvedIp || '?.?.?.?'} icon={<ShieldCheck size={18} />} active success />
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'ip' && (
            <motion.div key="ip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-6 text-center">
               <SectionHeader title="عنوان الـ IP" desc="رقم فريد يميز كل جهاز على شبكة الإنترنت." />
               <div className="flex flex-wrap justify-center gap-4">
                  {['192', '168', '1', '10'].map((num, i) => (
                    <motion.div 
                      key={i}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center text-2xl font-mono font-bold text-primary-500"
                    >
                      {num}
                    </motion.div>
                  ))}
               </div>
               <p className="text-gray-500 max-w-lg mx-auto text-sm">عنوان الـ IP (Internet Protocol) هو العنوان الرقمي للجهاز.</p>
            </motion.div>
          )}

          {activeTab === 'protocols' && (
            <motion.div key="protocols" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
               <SectionHeader title="الدرس الثالث: بروتوكول الاتصال" desc="البروتوكول هو مجموعة القواعد التي تنظم عملية الاتصال ونقل البيانات." />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {protocols.map((p) => (
                    <button 
                      key={p.id}
                      onClick={() => setSelectedProtocol(p.id)}
                      className={`p-6 rounded-3xl border transition-all text-right ${selectedProtocol === p.id ? 'bg-primary-600/10 border-primary-500 ring-2 ring-primary-500/20' : 'bg-gray-900 border-gray-800'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${selectedProtocol === p.id ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                        {p.icon}
                      </div>
                      <h4 className="text-white font-bold mb-2">{p.name}</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === 'how-it-works' && (
            <motion.div key="how-it-works" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 flex flex-col items-center py-10">
               <SectionHeader title="آلية عمل البروتوكول" desc="تنظيم تبادل البيانات بين العميل (Client) والخادم (Server)." />
               <div className="flex gap-10 items-center">
                  <div className="text-center space-y-2">
                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/30 text-blue-500"><Globe size={32} /></div>
                    <p className="text-[10px] text-white font-bold">Client (جهاز المستخدم)</p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <motion.div animate={{ x: [100, -100] }} transition={{ duration: 2, repeat: Infinity }} className="bg-primary-600 text-white px-3 py-1 rounded-full text-[10px] font-bold">Request</motion.div>
                    <motion.div animate={{ x: [-100, 100] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-bold">Response</motion.div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/30 text-orange-500"><Server size={32} /></div>
                    <p className="text-[10px] text-white font-bold">Server (الخادم)</p>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-gray-900 p-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
        <span>محتوى تفاعلي - مادة الحاسب الآلي - أولى ثانوي</span>
        <div className="flex gap-2 items-center">
          <Info size={14} />
          <span>الشرح مطابق لمذكرة الطالب المرفقة</span>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, desc }: any) {
  return (
    <div className="mb-6">
      <h3 className="text-2xl font-black text-white mb-1">{title}</h3>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-bold ${active ? 'bg-primary-600/10 text-primary-500 border border-primary-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
      {icon} <span className="hidden sm:inline text-sm">{label}</span>
    </button>
  );
}

function NetworkCard({ title, subtitle, desc, color, icon }: any) {
  const colors: any = {
    blue: 'from-blue-600 to-blue-800 shadow-blue-500/20 border-blue-500/30',
    orange: 'from-orange-600 to-orange-800 shadow-orange-500/20 border-orange-500/30'
  };
  return (
    <div className={`p-6 bg-gradient-to-br ${colors[color]} rounded-3xl border shadow-xl`}>
      <div className="text-white/20 mb-4">{icon}</div>
      <h4 className="text-xl font-black text-white">{title}</h4>
      <p className="text-white/70 text-[10px] font-bold mb-3">{subtitle}</p>
      <p className="text-white/90 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function DnsBox({ label, value, icon, active, highlight, success }: any) {
  return (
    <div className={`p-4 rounded-2xl border-2 transition-all w-40 ${success ? 'bg-green-500/10 border-green-500/50 text-green-400' : highlight ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' : active ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-900 border-gray-800 text-gray-600'}`}>
      <div className="flex items-center gap-2 mb-2 text-[10px] font-bold opacity-60"> {icon} {label} </div>
      <div className="font-mono text-xs truncate">{value}</div>
    </div>
  );
}

function TopologyVisual({ type }: { type: string }) {
  return (
    <div className="relative w-64 h-64 border-2 border-dashed border-gray-800 rounded-full flex items-center justify-center">
      {type === 'Star' && (
        <>
          <div className="w-12 h-12 bg-yellow-500 rounded-xl shadow-lg z-10 flex items-center justify-center text-white font-bold text-[10px]">Switch</div>
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <motion.div key={deg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute w-10 h-10 bg-blue-500 rounded-lg" style={{ transform: `rotate(${deg}deg) translateY(-80px) rotate(-${deg}deg)` }} />
          ))}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <line key={deg} x1="50%" y1="50%" x2={`${50 + 35 * Math.cos((deg - 90) * Math.PI / 180)}%`} y2={`${50 + 35 * Math.sin((deg - 90) * Math.PI / 180)}%`} stroke="white" strokeWidth="2" />
            ))}
          </svg>
        </>
      )}
      {type === 'Bus' && (
        <div className="w-full flex flex-col items-center gap-4">
          <div className="w-full h-2 bg-gray-700 rounded-full relative">
             {[20, 40, 60, 80].map(pos => (
                <div key={pos} className="absolute w-8 h-8 bg-blue-500 rounded-lg -top-12" style={{ left: `${pos}%` }} />
             ))}
          </div>
          <span className="text-gray-500 text-[10px]">كابل رئيسي</span>
        </div>
      )}
      {type === 'Mesh' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {[0, 72, 144, 216, 288].map((deg) => (
            <div key={deg} className="absolute w-8 h-8 bg-blue-500 rounded-lg z-10" style={{ transform: `rotate(${deg}deg) translateY(-80px) rotate(-${deg}deg)` }} />
          ))}
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <polygon points="128,48 204,103 175,193 81,193 52,103" fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  );
}
