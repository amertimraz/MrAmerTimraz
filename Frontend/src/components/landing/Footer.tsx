import { Facebook, Youtube, Send, Mail, Phone, ArrowUpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const footerLinks = {
  platform: [
    { label: 'الرئيسية', to: '/' },
    { label: 'جميع الدروس', to: '/courses' },
    { label: 'المكتبة الرقمية', to: '/library' },
    { label: 'عن مستر عامر', to: '/about' },
  ],
  support: [
    { label: 'الأسئلة الشائعة', to: '#' },
    { label: 'تواصل معنا', to: '/contact' },
    { label: 'سياسة الخصوصية', to: '#' },
    { label: 'شروط الإستخدام', to: '#' },
  ],
};

const socialLinks = [
  { icon: <Facebook size={20} />, href: 'https://facebook.com/mramer', color: 'bg-[#1877F2]' },
  { icon: <Youtube size={20} />, href: 'https://youtube.com/mramer',  color: 'bg-[#FF0000]' },
  { icon: <Send size={20} />,    href: 'https://t.me/mramer',      color: 'bg-[#229ED9]' },
];

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer dir="rtl" className="bg-[#0a0e27] border-t border-white/5 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-4 group mb-8">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-black text-xl shadow-2xl group-hover:rotate-6 transition-transform">
                عا
               </div>
               <div>
                  <h3 className="text-xl font-black text-white tracking-tight">MR. AMER <span className="text-green-500">TIMRAZ</span></h3>
                  <p className="text-green-500/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">Educational Platform</p>
               </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-8 font-medium italic">
              "نهدف لتغيير مفهوم التعليم الإلكتروني وتوفير تجربة تعليمية فريدة وممتعة تساعد الطلاب على التفوق الدراسي وبناء مستقبل واعد."
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, scale: 1.1 }}
                  className={`w-10 h-10 rounded-xl ${social.color} text-white flex items-center justify-center shadow-xl shadow-${social.color}/20`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-white font-black text-lg mb-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              المنصة
            </h4>
            <ul className="space-y-4">
              {footerLinks.platform.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-white/40 hover:text-green-400 text-sm font-bold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-white font-black text-lg mb-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              الدعم والمساعدة
            </h4>
            <ul className="space-y-4">
              {footerLinks.support.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-white/40 hover:text-blue-400 text-sm font-bold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black text-lg mb-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              تواصل مباشرة
            </h4>
            <ul className="space-y-6">
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl glass-dark border-white/5 flex items-center justify-center text-white/40 group-hover:text-purple-400 transition-colors">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">البريد الإلكتروني</p>
                  <a href="mailto:info@mramer.com" className="text-white/60 hover:text-white text-sm font-bold transition-all underline decoration-purple-500/30">info@mramer.com</a>
                </div>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl glass-dark border-white/5 flex items-center justify-center text-white/40 group-hover:text-green-400 transition-colors">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">رقم الهاتف</p>
                  <span className="text-white/60 text-sm font-bold tracking-wider">0123456789 (واتساب)</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-white/20 text-xs font-bold uppercase tracking-widest text-center md:text-right">
             جميع الحقوق محفوظة © {new Date().getFullYear()} لـ <span className="text-white/40">مستر عامر تمراز</span> — تم التطوير بكل <Heart size={10} className="inline fill-red-500/50 text-transparent" />
          </p>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={scrollToTop}
              className="group flex items-center gap-3 text-white/20 hover:text-white transition-all"
            >
               <span className="text-[10px] font-black uppercase tracking-widest">إلى الأعلى</span>
               <ArrowUpCircle size={24} className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Heart({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}
