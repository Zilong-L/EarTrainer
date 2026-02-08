import React, { useEffect, useMemo, useRef } from 'react';
import './practiceUi.css';

type FillingChordTextProps = {
  text: string;
  isFilling: boolean;
  holdMs: number;
  runId: number;
  successId: number;
  className?: string;
};

const FillingChordText: React.FC<FillingChordTextProps> = ({
  text,
  isFilling,
  holdMs,
  runId,
  successId,
  className = '',
}) => {
  const shouldAnimateFill = isFilling && holdMs > 0;

  const fillRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const cancelRaf = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  }, []);

  useEffect(() => {
    cancelRaf();
    const el = fillRef.current;
    if (!el) return;

    if (!shouldAnimateFill) return;
    if (reducedMotion) return;

    const start = performance.now();
    const duration = Math.max(1, holdMs);

    const sampleCount = 26;
    // Extend the clip region beyond the element box so glyph overshoot
    // (e.g. Chewy "C" curves, or descenders like "j") doesn't get clipped.
    const clipPadY = 18; // percent
    const clipPadX = 5; // percent
    const minY = -clipPadY;
    const maxY = 100 + clipPadY;
    const minX = -clipPadX;
    const maxX = 100 + clipPadX;
    const widthX = maxX - minX;
    const freq1 = Math.PI * 2 * 1.6;
    const freq2 = Math.PI * 2 * 3.1;
    const speed1 = 0.0045;
    const speed2 = 0.0072;

    const clampPct = (n: number) => Math.min(maxY, Math.max(minY, n));

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);

      const fill = t;
      const baseY = maxY - fill * (maxY - minY);

      const swell = 0.35 + 0.65 * Math.sin(fill * Math.PI);
      const amp1 = 2.6 * swell;
      const amp2 = 1.2 * swell;

      const phase1 = elapsed * speed1;
      const phase2 = elapsed * speed2;

      const points: string[] = [`${minX}% ${maxY}%`];
      for (let i = 0; i <= sampleCount; i++) {
        const x = minX + (i / sampleCount) * widthX;
        const nx = (x - minX) / widthX;
        const wave =
          amp1 * Math.sin(phase1 + nx * freq1) +
          amp2 * Math.sin(phase2 + nx * freq2 + 1.3);
        const y = clampPct(baseY + wave);
        points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
      }
      points.push(`${maxX}% ${maxY}%`);
      el.style.clipPath = `polygon(${points.join(',')})`;

      if (fill < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelRaf();
  }, [shouldAnimateFill, holdMs, runId, reducedMotion]);

  return (
    <div className="relative inline-block">
      <div className={className} title={text}>
        {text}
      </div>

      {successId > 0 && (
        <div
          key={`text-${successId}`}
          className="ct-successFade pointer-events-none absolute inset-0"
          aria-hidden
        >
          <div className={className} style={{ color: 'var(--notification-bg)' }}>
            {text}
          </div>
        </div>
      )}

      {shouldAnimateFill && (
        <div className="pointer-events-none absolute inset-0 overflow-visible">
          <div
            key={runId}
            ref={fillRef}
            className={`ct-waveFill ${className}`}
            style={{
              color: 'var(--notification-bg)',
              clipPath: reducedMotion ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
            }}
          >
            {text}
          </div>
        </div>
      )}
    </div>
  );
};

export default FillingChordText;
