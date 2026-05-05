import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from '@/components/theme-provider.tsx';
import { TooltipProvider } from '@/components/ui/tooltip';

// Custom cursor — desktop only
if (window.matchMedia('(pointer: fine)').matches) {
  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  const ring = document.createElement('div');
  ring.id = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let ringX = 0, ringY = 0;
  let dotX = 0, dotY = 0;

  document.addEventListener('mousemove', (e) => {
    dotX = e.clientX;
    dotY = e.clientY;
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';
  });

  // Ring follows with lag
  function animateRing() {
    ringX += (dotX - ringX) * 0.12;
    ringY += (dotY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Grow ring on hover over interactive elements
  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea, select, [role="button"]')) {
      dot.style.width = '12px';
      dot.style.height = '12px';
      ring.style.width = '44px';
      ring.style.height = '44px';
      ring.style.borderColor = 'rgba(42,199,182,0.8)';
    }
  });
  document.addEventListener('mouseout', () => {
    dot.style.width = '7px';
    dot.style.height = '7px';
    ring.style.width = '30px';
    ring.style.height = '30px';
    ring.style.borderColor = 'rgba(42,199,182,0.55)';
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
);
