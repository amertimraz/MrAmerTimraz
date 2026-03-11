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
      <TechBackground />
      <Navbar />
      <main className="relative z-10 flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
