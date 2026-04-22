import { motion } from 'framer-motion';

import InteractiveProgrammingTheory from '../../components/interactive/InteractiveProgrammingTheory';
import { Sparkles } from 'lucide-react';

export default function InteractiveTheoryPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-24 pb-12 px-4 font-['Cairo']" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-bold border border-primary-100 dark:border-primary-800"
          >
            <Sparkles size={16} /> تجربة تعليمية جديدة
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white"
          >
            الشرح <span className="text-primary-600">التفاعلي</span> المطور
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
          >
            استكشف مفاهيم البرمجة والشبكات بطريقة بصرية وتفاعلية. حولنا لك المنهج النظري لتجارب حية تقدر تجربها بنفسك.
          </motion.p>
        </div>

        {/* The Component */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="shadow-2xl shadow-primary-500/10 rounded-3xl"
        >
          <InteractiveProgrammingTheory />
        </motion.div>

        {/* Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-gray-100 dark:border-gray-800">
           <FeatureBox title="بصري بالكامل" desc="اعتمدنا على الرسوم المتحركة بدلاً من النصوص المملة." />
           <FeatureBox title="متوافق مع المنهج" desc="كل المحتوى مستخرج من كتاب الحاسب الآلي لأولى ثانوي." />
           <FeatureBox title="متاح للجميع" desc="تقدر تستخدم الشرح ده في أي وقت ومن أي جهاز." />
        </div>
      </div>
    </div>
  );
}

function FeatureBox({ title, desc }: any) {
  return (
    <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
      <h4 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
