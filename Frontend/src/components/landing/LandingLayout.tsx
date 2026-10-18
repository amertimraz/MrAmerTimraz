import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import TechBackground from './TechBackground';
import Navbar from './Navbar';
import { useAuthStore } from '../../store/authStore';

export default function LandingLayout() {
  const { isDark } = useAuthStore();

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{
        background: isDark
          ? 'linear-gradient(160deg, #0d1117 0%, #111827 60%, #0d1117 100%)'
          : 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 60%, #f8fafc 100%)',
        fontFamily: "'Cairo', sans-serif",
        transition: 'background 0.3s ease',
      }}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[60] focus:rounded-xl focus:bg-teal-700 focus:px-5 focus:py-3 focus:font-bold focus:text-white"
      >
        انتقل إلى المحتوى
      </a>
      <TechBackground />
      <Navbar />
      <main id="main-content" className="relative z-10 flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
