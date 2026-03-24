import { motion } from 'framer-motion';

const Orbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      animate={{
        x: [0, 100, 0],
        y: [0, -50, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-[10%] left-[15%] w-[40vw] h-[40vw] rounded-full bg-green-500/5 blur-[120px]"
    />
    <motion.div
      animate={{
        x: [0, -80, 0],
        y: [0, 100, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute bottom-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-blue-500/5 blur-[120px]"
    />
    <motion.div
      animate={{
        x: [0, 50, 0],
        y: [0, 80, 0],
        rotate: 360,
      }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full bg-purple-500/[0.03] blur-[150px]"
    />
  </div>
);

const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    {Array.from({ length: 30 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          x: Math.random() * 100 + '%', 
          y: Math.random() * 100 + '%',
          opacity: Math.random() * 0.5 + 0.2
        }}
        animate={{ 
          y: [null, Math.random() * -100 - 50 + '%'],
          opacity: [null, 0]
        }}
        transition={{ 
          duration: Math.random() * 10 + 10, 
          repeat: Infinity, 
          ease: 'linear',
          delay: Math.random() * 10
        }}
        className="absolute w-1 h-1 bg-white rounded-full"
      />
    ))}
  </div>
);

export default function TechBackground() {
  return (
    <div className="absolute inset-0 bg-[#0a0e27] pointer-events-none overflow-hidden" aria-hidden>
      <Orbs />
      <Particles />
      
      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} 
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient(circle, transparent 40%, rgba(10, 14, 39, 0.8) 100%)" />
    </div>
  );
}
