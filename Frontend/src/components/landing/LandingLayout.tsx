import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import TechBackground from './TechBackground';
import Navbar from './Navbar';

export default function LandingLayout() {
  return (
    <div
      className="relative min-h-screen flex flex-col bg-[#0a0e27]"
      style={{
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      <TechBackground />
      <Navbar />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
