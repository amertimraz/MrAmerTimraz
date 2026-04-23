import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  Globe, 
  Server, 
  Info, 
  ArrowRight, 
  Database,
  Search,
  Activity,
  Zap,
  FileCode,
  Layers,
  Cpu,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function InteractiveProgrammingTheory() {
  const [currentLesson, setCurrentLesson] = useState(1);
  const [activeTab, setActiveTab] = useState<string>('basics');
  const [searchUrl, setSearchUrl] = useState('google.com');
  const [resolvedIp, setResolvedIp] = useState('');

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
            <p className="text-gray-500 text-xs">تحديث شامل: شرح كامل وشامل لكل محتوى المذكرة</p>
          </div>
        </div>
        <div className="flex bg-black/40 p-1 rounded-2xl border border-gray-800 overflow-x-auto max-w-full">
           {[
             { id: 1, title: 'شبكات الكمبيوتر' },
             { id: 2, title: 'عناوين IP وأسماء النطاقات' },
             { id: 3, title: 'بروتوكول الاتصال' }
           ].map(lesson => (
             <button 
              key={lesson.id}
              onClick={() => { setCurrentLesson(lesson.id); setActiveTab(lesson.id === 1 ? 'basics' : lesson.id === 2 ? 'ip-basics' : 'protocols-def'); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${currentLesson === lesson.id ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
             >
               {lesson.title}
             </button>
           ))}
        </div>
      </div>

      {/* Tabs based on lesson */}
      <div className="flex bg-gray-900/50 p-2 gap-2 border-b border-gray-800 overflow-x-auto no-scrollbar">
        {currentLesson === 1 && (
          <>
            <TabButton active={activeTab === 'basics'} onClick={() => setActiveTab('basics')} icon={<Info size={16} />} label="مفاهيم أساسية" />
            <TabButton active={activeTab === 'infrastructure'} onClick={() => setActiveTab('infrastructure')} icon={<Cpu size={16} />} label="البنية التحتية" />
            <TabButton active={activeTab === 'models'} onClick={() => setActiveTab('models')} icon={<Layers size={16} />} label="أنظمة الشبكات" />
            <TabButton active={activeTab === 'switching'} onClick={() => setActiveTab('switching')} icon={<Activity size={16} />} label="نقل البيانات" />
          </>
        )}
        {currentLesson === 2 && (
          <>
            <TabButton active={activeTab === 'ip-basics'} onClick={() => setActiveTab('ip-basics')} icon={<Globe size={16} />} label="عنوان IP" />
            <TabButton active={activeTab === 'ip-types'} onClick={() => setActiveTab('ip-types')} icon={<ShieldCheck size={16} />} label="الأنواع والإصدارات" />
            <TabButton active={activeTab === 'dns'} onClick={() => setActiveTab('dns')} icon={<Search size={16} />} label="نظام DNS" />
          </>
        )}
        {currentLesson === 3 && (
          <>
            <TabButton active={activeTab === 'protocols-def'} onClick={() => setActiveTab('protocols-def')} icon={<Info size={16} />} label="مفهوم البروتوكول" />
            <TabButton active={activeTab === 'tcp-udp'} onClick={() => setActiveTab('tcp-udp')} icon={<Activity size={16} />} label="TCP vs UDP" />
            <TabButton active={activeTab === 'layers'} onClick={() => setActiveTab('layers')} icon={<Layers size={16} />} label="نموذج TCP/IP" />
          </>
        )}
      </div>

      <div className="p-4 sm:p-8 min-h-[500px]">
        <AnimatePresence mode="wait">
          {/* Lesson 1 Tabs */}
          {activeTab === 'basics' && (
            <motion.div key="basics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <SectionHeader title="مفاهيم الشبكة الأساسية" desc="التعريفات الواردة في المذكرة" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="شبكة الكمبيوتر" desc="مجموعة من أجهزة الكمبيوتر وبعض الأجهزة الأخرى المتصلة معاً لمشاركة الموارد والأجهزة." />
                <InfoCard title="شبكة المعلومات والاتصالات" desc="شبكة عالمية تمكن من تبادل المعلومات والرسائل بين أجهزة الكمبيوتر حول العالم." />
                <InfoCard title="LAN (الشبكة المحلية)" desc="تغطي مساحة جغرافية محدودة مثل معمل كمبيوتر أو مبنى واحد." color="blue" />
                <InfoCard title="WAN (الشبكة الواسعة)" subtitle="الإنترنت" desc="تغطي مساحات جغرافية واسعة كالدول والقارات، وتستخدم خطوط الهاتف والأقمار الصناعية." color="orange" />
              </div>
            </motion.div>
          )}

          {activeTab === 'infrastructure' && (
            <motion.div key="infrastructure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <SectionHeader title="البنية التحتية للشبكة" desc="الأجهزة والمزودات" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TechBox icon={<Cpu size={24} />} title="Hub" desc="جهاز يربط الأجهزة في الشبكة المحلية." />
                <TechBox icon={<Network size={24} />} title="Router" desc="جهاز يوجه البيانات بين الشبكات المختلفة." />
                <TechBox icon={<Globe size={24} />} title="ISP" desc="موفر خدمة الإنترنت (شركة الاتصالات)." />
              </div>
              <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Server size={18} className="text-primary-500" /> أنواع الخوادم (Servers):</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ServerType label="خادم الملفات" desc="تخزين الملفات" />
                  <ServerType label="خادم الطابعة" desc="إدارة الطباعة" />
                  <ServerType label="خادم البريد" desc="إرسال الرسائل" />
                  <ServerType label="خادم الوكيل (Proxy)" desc="أمن الشبكة" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'models' && (
            <motion.div key="models" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <SectionHeader title="أنظمة تشغيل الشبكات" desc="كيفية تنظيم العلاقة بين الأجهزة" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl space-y-3">
                   <h4 className="text-blue-400 font-black text-xl">خادم / عميل (Client/Server)</h4>
                   <p className="text-gray-400 text-sm leading-relaxed text-justify">نظام يعتمد على وجود جهاز قوي (الخادم) يقدم الخدمات، وأجهزة أخرى (العملاء) تطلب تلك الخدمات. الخادم هو المسئول عن الإدارة والأمن.</p>
                </div>
                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-3xl space-y-3">
                   <h4 className="text-green-400 font-black text-xl">ند لند (Peer-to-Peer)</h4>
                   <p className="text-gray-400 text-sm leading-relaxed text-justify">تكون جميع الأجهزة متساوية في القوة والمسئولية، وكل جهاز يمكن أن يعمل كخادم وعميل في نفس الوقت. يستخدم في الشبكات الصغيرة.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'switching' && (
            <motion.div key="switching" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <SectionHeader title="تقنيات نقل البيانات" desc="كيف تتحرك البيانات عبر الشبكة؟" />
              <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 space-y-6">
                <div>
                  <h4 className="text-white font-bold mb-2">الحزمة (Packet):</h4>
                  <p className="text-gray-500 text-sm">هي أصغر جزء يتم تقسيم البيانات إليه عند إرسالها عبر الشبكة، وتحتوي على عنوان المرسل والمستقبل.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <h5 className="text-primary-500 font-bold">تبديل الحزم (Packet Switching)</h5>
                      <p className="text-gray-400 text-xs leading-relaxed text-justify italic">المزايا: الكفاءة العالية، الموثوقية (إذا تعطل مسار تسلك الحزمة مساراً آخر).<br/>العيوب: قد تصل الحزم بترتيب مختلف.</p>
                   </div>
                   <div className="space-y-3">
                      <h5 className="text-red-500 font-bold">تبديل الدوائر (Circuit Switching)</h5>
                      <p className="text-gray-400 text-xs leading-relaxed text-justify italic">المزايا: ثبات السرعة والجودة لأن المسار محجوز بالكامل.<br/>العيوب: عدم الكفاءة (إهدار الموارد إذا لم يتم الإرسال).</p>
                   </div>
                </div>
                <div className="pt-4 border-t border-gray-800 text-center">
                  <p className="text-white font-bold text-sm mb-4">رحلة الرسالة من العميل للخادم:</p>
                  <div className="flex flex-wrap justify-center gap-2 text-[10px]">
                     <StepBox num="1" text="تقسيم البيانات لحزم" />
                     <ArrowRight size={14} className="text-gray-700 self-center" />
                     <StepBox num="2" text="إضافة العناوين والترقيم" />
                     <ArrowRight size={14} className="text-gray-700 self-center" />
                     <StepBox num="3" text="توجيه الحزم عبر المسارات" />
                     <ArrowRight size={14} className="text-gray-700 self-center" />
                     <StepBox num="4" text="إعادة التجميع عند المستلم" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Lesson 2 Tabs */}
          {activeTab === 'ip-basics' && (
            <motion.div key="ip-basics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <SectionHeader title="عنوان IP" desc="بطاقة التعريف الرقمية لكل جهاز" />
              <div className="p-8 bg-gray-900 border border-gray-800 rounded-3xl text-center space-y-6">
                <div className="inline-block px-8 py-4 bg-black/50 border-2 border-primary-500/50 rounded-2xl">
                   <span className="text-4xl font-mono text-white tracking-widest">192.168.1.1</span>
                </div>
                <div className="max-w-md mx-auto text-sm text-gray-400 leading-relaxed space-y-4">
                  <p>يتكون نظام <span className="text-white font-bold">IPv4</span> من <span className="text-white font-bold">32 بت</span> مقسمة إلى 4 مجموعات (أرقام)، كل مجموعة تفصلها نقطة.</p>
                  <p>كل رقم يتراوح قيمته بين <span className="text-primary-500">0 إلى 255</span>.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ip-types' && (
            <motion.div key="ip-types" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <SectionHeader title="أنواع وإصدارات العناوين" desc="كيف تواجه الإنترنت مشكلة نفاد العناوين؟" />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-900 rounded-3xl border border-gray-800 space-y-4">
                    <h4 className="text-white font-bold">حسب الاستخدام:</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-black/20 rounded-xl border border-gray-800">
                        <p className="text-xs text-white font-bold mb-1">IP عام (Public/Global)</p>
                        <p className="text-[10px] text-gray-500">يستخدم للاتصال المباشر بالإنترنت، ويكون فريداً عالمياً.</p>
                      </div>
                      <div className="p-4 bg-black/20 rounded-xl border border-gray-800">
                        <p className="text-xs text-white font-bold mb-1">IP خاص (Private)</p>
                        <p className="text-[10px] text-gray-500">يستخدم داخل الشبكة المحلية ولا يمكن الوصول إليه من الخارج مباشرة.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-primary-600/5 rounded-3xl border border-primary-500/20 space-y-4">
                    <h4 className="text-white font-bold">التطور (IPv4 vs IPv6):</h4>
                    <div className="space-y-2">
                       <div className="flex justify-between p-2 bg-black/30 rounded-lg text-xs"> <span className="text-gray-400">IPv4</span> <span className="text-white font-mono">32-Bit (أربع كتل)</span> </div>
                       <div className="flex justify-between p-2 bg-primary-600/20 rounded-lg text-xs"> <span className="text-primary-400">IPv6</span> <span className="text-white font-mono">128-Bit (أرقام وحروف)</span> </div>
                    </div>
                    <p className="text-[10px] text-gray-500 italic">سبب التحول لـ IPv6: نفاد العناوين المتاحة في الإصدار الرابع بسبب كثرة الأجهزة.</p>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'dns' && (
            <motion.div key="dns" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
               <SectionHeader title="نظام أسماء النطاقات (DNS)" desc="دليل الهاتف الخاص بالإنترنت" />
               <div className="bg-purple-500/5 border border-purple-500/20 p-8 rounded-3xl text-center space-y-8">
                  <div className="max-w-md mx-auto">
                    <p className="text-gray-400 text-sm mb-6">اسم النطاق (Domain Name) هو الاسم الذي نكتبه للوصول للموقع، ويقوم الـ DNS بتحويله لعنوان IP ليفهمه الكمبيوتر.</p>
                    <div className="relative group">
                      <input type="text" value={searchUrl} onChange={(e) => setSearchUrl(e.target.value)} className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-6 py-4 text-white text-left font-mono focus:border-purple-500 outline-none pr-12" />
                      <button onClick={handleDnsLookup} className="absolute left-2 top-2 bottom-2 bg-purple-600 text-white px-6 rounded-xl font-bold">تجربة</button>
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

          {/* Lesson 3 Tabs */}
          {activeTab === 'protocols-def' && (
            <motion.div key="protocols-def" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <SectionHeader title="مفهوم البروتوكول" desc="القوانين الحاكمة للشبكة" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                 <div className="p-8 bg-gray-900 border border-gray-800 rounded-3xl space-y-4">
                    <h4 className="text-2xl font-black text-white">التعريف الرسمي:</h4>
                    <p className="text-gray-400 leading-relaxed text-justify">هو عبارة عن <span className="text-primary-500 font-bold">قواعد واتفاقيات مشتركة</span> تسمح لأجهزة الكمبيوتر بتبادل المعلومات وفهم بعضها البعض عبر الشبكة.</p>
                 </div>
                 <div className="bg-primary-600/10 p-6 rounded-3xl border border-primary-500/20 border-dashed">
                    <p className="text-primary-400 text-sm italic font-bold">تخيل البروتوكول كلغة مشتركة بين شخصين من بلاد مختلفة، لو مفيش لغة (قواعد) مش هيفهموا بعض!</p>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tcp-udp' && (
            <motion.div key="tcp-udp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <SectionHeader title="مقارنة بين TCP و UDP" desc="أشهر بروتوكولات نقل البيانات" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl space-y-4 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle2 size={100} /></div>
                   <h4 className="text-blue-400 font-black text-xl">بروتوكول TCP</h4>
                   <p className="text-[10px] text-gray-500 font-bold">Transmission Control Protocol</p>
                   <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside">
                     <li>يركز على <span className="text-white">الدقة والموثوقية</span>.</li>
                     <li>يتأكد من وصول كل حزمة وإعادة إرسال التالف.</li>
                     <li><span className="text-white">مثال:</span> تصفح الويب، تحميل الملفات، البريد.</li>
                   </ul>
                </div>
                <div className="p-6 bg-orange-500/5 border border-orange-500/20 rounded-3xl space-y-4 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><AlertCircle size={100} /></div>
                   <h4 className="text-orange-400 font-black text-xl">بروتوكول UDP</h4>
                   <p className="text-[10px] text-gray-500 font-bold">User Datagram Protocol</p>
                   <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside">
                     <li>يركز على <span className="text-white">السرعة والإرسال الفوري</span>.</li>
                     <li>لا يتأكد من وصول كل حزمة (أسرع بكثير).</li>
                     <li><span className="text-white">مثال:</span> البث المباشر، الألعاب، الفيديو.</li>
                   </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'layers' && (
            <motion.div key="layers" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
               <SectionHeader title="نموذج TCP/IP" desc="الطبقات الأربع لاتصال الإنترنت" />
               <div className="flex flex-col gap-3 max-w-2xl mx-auto">
                  <LayerBox num="4" name="طبقة التطبيق (Application Layer)" desc="واجهة المستخدم مثل المتصفح." examples="HTTP, SMTP" color="purple" />
                  <LayerBox num="3" name="طبقة النقل (Transport Layer)" desc="تنظيم نقل البيانات وضمان الجودة." examples="TCP, UDP" color="blue" />
                  <LayerBox num="2" name="طبقة الإنترنت (Internet Layer)" desc="تحديد المسار والعنونة." examples="IP" color="green" />
                  <LayerBox num="1" name="طبقة واجهة الشبكة (Network Interface)" desc="تحويل البيانات لإشارات في الكابلات." examples="Ethernet" color="orange" />
               </div>
               <div className="mt-8 p-6 bg-gray-900 border border-gray-800 rounded-3xl">
                  <h4 className="text-white font-bold mb-4">خطوات الاتصال (الآلية):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-black/30 rounded-xl border border-gray-800 text-[10px] text-gray-400">1. التقسيم (Segmentation)</div>
                    <div className="p-3 bg-black/30 rounded-xl border border-gray-800 text-[10px] text-gray-400">2. العنونة (Addressing)</div>
                    <div className="p-3 bg-black/30 rounded-xl border border-gray-800 text-[10px] text-gray-400">3. التوجيه (Routing)</div>
                    <div className="p-3 bg-black/30 rounded-xl border border-gray-800 text-[10px] text-gray-400">4. التجميع والتأكيد</div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-gray-900 p-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
        <span>محتوى كامل - دروس الوحدة الثامنة - مادة الحاسب الآلي</span>
        <div className="flex gap-2 items-center">
          <Info size={14} />
          <span>هذا الشرح يحتوي على كل معلومة وردت في المذكرة المرفقة</span>
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
    <button onClick={onClick} className={`flex-shrink-0 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-bold ${active ? 'bg-primary-600/10 text-primary-500 border border-primary-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
      {icon} <span className="text-[10px] sm:text-xs">{label}</span>
    </button>
  );
}

function InfoCard({ title, subtitle, desc, color }: any) {
  const colors: any = {
    blue: 'bg-blue-600/10 border-blue-500/30 text-blue-400',
    orange: 'bg-orange-600/10 border-orange-500/30 text-orange-400',
    default: 'bg-gray-900 border-gray-800 text-white'
  };
  return (
    <div className={`p-5 rounded-3xl border ${colors[color] || colors.default}`}>
      <h4 className="font-black mb-1">{title}</h4>
      {subtitle && <p className="text-[10px] opacity-60 mb-2 font-bold">{subtitle}</p>}
      <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

function TechBox({ icon, title, desc }: any) {
  return (
    <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl text-center space-y-2">
      <div className="text-primary-500 flex justify-center">{icon}</div>
      <h5 className="text-white font-bold text-xs">{title}</h5>
      <p className="text-[10px] text-gray-500">{desc}</p>
    </div>
  );
}

function ServerType({ label, desc }: any) {
  return (
    <div className="p-3 bg-black/40 rounded-xl border border-gray-800 text-center">
      <p className="text-white font-bold text-[10px] mb-1">{label}</p>
      <p className="text-[8px] text-gray-500">{desc}</p>
    </div>
  );
}

function StepBox({ num, text }: any) {
  return (
    <div className="flex items-center gap-2 bg-black/50 p-2 rounded-lg border border-gray-800">
      <span className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">{num}</span>
      <span className="text-gray-400">{text}</span>
    </div>
  );
}

function LayerBox({ num, name, desc, examples, color }: any) {
  const colors: any = {
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    green: 'border-green-500/30 bg-green-500/5 text-green-400',
    orange: 'border-orange-500/30 bg-orange-500/5 text-orange-400',
  };
  return (
    <div className={`flex items-center gap-4 p-4 border rounded-2xl ${colors[color]}`}>
       <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center font-bold">{num}</div>
       <div className="flex-1">
          <h5 className="font-bold text-xs">{name}</h5>
          <p className="text-[10px] opacity-70">{desc}</p>
       </div>
       <div className="text-[10px] font-mono opacity-50 px-3 py-1 bg-black/30 rounded-full">{examples}</div>
    </div>
  );
}

function DnsBox({ label, value, icon, active, highlight, success }: any) {
  return (
    <div className={`p-4 rounded-2xl border-2 transition-all w-40 ${success ? 'bg-green-500/10 border-green-500/50 text-green-400' : highlight ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' : active ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-900 border-gray-800 text-gray-600'}`}>
      <div className="flex items-center gap-2 mb-2 text-[10px] font-bold opacity-60"> {icon} {label} </div>
      <div className="font-mono text-[10px] truncate">{value}</div>
    </div>
  );
}

function TopologyVisual({ type }: { type: string }) {
  return (
    <div className="relative w-48 h-48 sm:w-64 sm:h-64 border-2 border-dashed border-gray-800 rounded-full flex items-center justify-center">
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
