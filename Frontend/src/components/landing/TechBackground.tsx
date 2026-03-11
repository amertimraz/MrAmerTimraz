import { useAuthStore } from '../../store/authStore';

const TECH_ICONS: { path: string }[] = [
  { path: 'M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 14H4V8h16v10zM6 12h2v2H6zm4 0h2v2h-2zm4 0h2v2h-2z' },
  { path: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z' },
  { path: 'M8 3l-5 9h5l-1 9 13-11h-7l3-7H8z' },
  { path: 'M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z' },
  { path: 'M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z' },
  { path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z' },
  { path: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z' },
  { path: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z' },
  { path: 'M12 3C7.03 3 3 7.03 3 12h2c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.95-2.05L9 15H3v6l2.2-2.2C6.6 20.22 9.19 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H11z' },
  { path: 'M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z' },
  { path: 'M12 2a2 2 0 110 4 2 2 0 010-4zm8 0a2 2 0 110 4 2 2 0 010-4zM4 2a2 2 0 110 4A2 2 0 014 2zm8 8a2 2 0 110 4 2 2 0 010-4zm8 0a2 2 0 110 4 2 2 0 010-4zM4 10a2 2 0 110 4 2 2 0 010-4zm8 8a2 2 0 110 4 2 2 0 010-4zm8 0a2 2 0 110 4 2 2 0 010-4zM4 18a2 2 0 110 4 2 2 0 010-4z' },
  { path: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm7 14l7-7-1.4-1.4L12 14.2l-3.6-3.6L7 12l5 5z' },
  { path: 'M3 5h18v14H3V5zm2 2v10h14V7H5zm2 8l3-4 2 2.5 3-4 4 5.5H7z' },
  { path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z' },
  { path: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z' },
  { path: 'M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM4 8h16v2H4V8zm0 4h10v2H4v-2z' },
];

const POSITIONS = [
  { top: '4%',  left: '2%',  size: 26, opacity: 0.07, rotate: -15 },
  { top: '7%',  left: '14%', size: 20, opacity: 0.06, rotate:  10 },
  { top: '2%',  left: '27%', size: 28, opacity: 0.07, rotate:   0 },
  { top: '11%', left: '39%', size: 18, opacity: 0.05, rotate: -20 },
  { top: '3%',  left: '53%', size: 24, opacity: 0.07, rotate:  12 },
  { top: '9%',  left: '67%', size: 22, opacity: 0.06, rotate:  -8 },
  { top: '4%',  left: '79%', size: 30, opacity: 0.07, rotate:  18 },
  { top: '3%',  left: '91%', size: 20, opacity: 0.06, rotate:  -5 },
  { top: '21%', left: '0%',  size: 24, opacity: 0.06, rotate:  20 },
  { top: '19%', left: '9%',  size: 18, opacity: 0.05, rotate: -10 },
  { top: '24%', left: '21%', size: 26, opacity: 0.06, rotate:   5 },
  { top: '17%', left: '34%', size: 22, opacity: 0.07, rotate: -25 },
  { top: '27%', left: '47%', size: 20, opacity: 0.05, rotate:  15 },
  { top: '21%', left: '59%', size: 28, opacity: 0.07, rotate:  -5 },
  { top: '19%', left: '71%', size: 18, opacity: 0.06, rotate:  22 },
  { top: '24%', left: '84%', size: 24, opacity: 0.06, rotate: -12 },
  { top: '17%', left: '94%', size: 20, opacity: 0.05, rotate:   8 },
  { top: '39%', left: '1%',  size: 22, opacity: 0.06, rotate: -18 },
  { top: '37%', left: '11%', size: 26, opacity: 0.07, rotate:  10 },
  { top: '41%', left: '24%', size: 18, opacity: 0.05, rotate:  -6 },
  { top: '34%', left: '37%', size: 24, opacity: 0.07, rotate:  20 },
  { top: '43%', left: '51%', size: 20, opacity: 0.06, rotate: -14 },
  { top: '37%', left: '64%', size: 28, opacity: 0.07, rotate:   5 },
  { top: '41%', left: '77%', size: 22, opacity: 0.05, rotate: -22 },
  { top: '35%', left: '89%', size: 26, opacity: 0.07, rotate:  16 },
  { top: '57%', left: '3%',  size: 20, opacity: 0.06, rotate:  -8 },
  { top: '54%', left: '15%', size: 24, opacity: 0.06, rotate:  18 },
  { top: '59%', left: '29%', size: 18, opacity: 0.05, rotate: -20 },
  { top: '55%', left: '43%', size: 26, opacity: 0.07, rotate:  12 },
  { top: '61%', left: '57%', size: 22, opacity: 0.07, rotate:  -4 },
  { top: '54%', left: '69%', size: 20, opacity: 0.06, rotate:  24 },
  { top: '59%', left: '82%', size: 28, opacity: 0.07, rotate: -10 },
  { top: '57%', left: '93%', size: 18, opacity: 0.05, rotate:   6 },
  { top: '74%', left: '0%',  size: 26, opacity: 0.06, rotate:  14 },
  { top: '77%', left: '12%', size: 20, opacity: 0.06, rotate: -16 },
  { top: '71%', left: '25%', size: 24, opacity: 0.05, rotate:   8 },
  { top: '79%', left: '39%', size: 22, opacity: 0.07, rotate: -22 },
  { top: '73%', left: '53%', size: 18, opacity: 0.06, rotate:  18 },
  { top: '77%', left: '66%', size: 26, opacity: 0.07, rotate:  -6 },
  { top: '71%', left: '79%', size: 20, opacity: 0.05, rotate:  20 },
  { top: '75%', left: '91%', size: 24, opacity: 0.07, rotate: -12 },
  { top: '89%', left: '4%',  size: 22, opacity: 0.06, rotate:  10 },
  { top: '87%', left: '17%', size: 18, opacity: 0.06, rotate: -18 },
  { top: '91%', left: '31%', size: 26, opacity: 0.05, rotate:   4 },
  { top: '87%', left: '45%', size: 20, opacity: 0.07, rotate:  22 },
  { top: '91%', left: '59%', size: 24, opacity: 0.06, rotate:  -8 },
  { top: '87%', left: '73%', size: 22, opacity: 0.07, rotate:  14 },
  { top: '91%', left: '87%', size: 18, opacity: 0.05, rotate: -20 },
];

export default function TechBackground() {
  const { isDark } = useAuthStore();
  const iconColor = isDark ? 'white' : '#1e293b';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {POSITIONS.map((pos, i) => {
        const icon = TECH_ICONS[i % TECH_ICONS.length];
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            width={pos.size}
            height={pos.size}
            fill={iconColor}
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              opacity: isDark ? pos.opacity : pos.opacity * 0.55,
              transform: `rotate(${pos.rotate}deg)`,
              transition: 'fill 0.3s ease, opacity 0.3s ease',
            }}
          >
            <path d={icon.path} />
          </svg>
        );
      })}
    </div>
  );
}
