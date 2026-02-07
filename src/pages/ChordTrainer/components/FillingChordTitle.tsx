import React, { useEffect, useMemo, useRef } from 'react';
import './practiceUi.css';

interface FillingChordTitleProps {
  display: React.ReactNode;
  fillText: string;
  isFilling: boolean;
  holdMs: number;
  runId: number;
  successId: number;
}

const titleTextClass =
  'text-[60px] sm:text-[100px] font-bold text-left text-text-primary leading-[1.05] break-words mb-4';

const FillingChordTitle: React.FC<FillingChordTitleProps> = ({
  display,
  fillText,
  isFilling,
  holdMs,
  runId,
  successId,
}) => {
  const shouldAnimateFill = isFilling && holdMs > 0;

  const fillRef = useRef<HTMLHeadingElement | null>(null);
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
    // Extend the clip region a bit beyond the element box so round glyph overshoot
    // (e.g. Chewy "C") still gets filled instead of being clipped at 0..100%.
    const clipPadY = 12; // percent
    const clipPadX = 2; // percent
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

      // 0 -> 100 (filled)
      const fill = t;
      // Base line moves from below the element (empty) to above it (full),
      // so the final frame doesn't clip top/bottom glyph overshoot.
      const baseY = maxY - fill * (maxY - minY);

      // Stronger motion mid-fill, calmer near start/end.
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
    <div className="relative w-full">
      <h1 className={titleTextClass}>
        <span title={fillText}>{display}</span>
      </h1>

      {successId > 0 && (
        <div
          key={`text-${successId}`}
          className="ct-successFade pointer-events-none absolute inset-0"
          aria-hidden
        >
          <h1
            className={titleTextClass}
            style={{ color: 'var(--notification-bg)' }}
          >
            {fillText}
          </h1>
        </div>
      )}

      {shouldAnimateFill && (
        <div className="pointer-events-none absolute inset-0 overflow-visible">
          <h1
            key={runId}
            ref={fillRef}
            className={`ct-waveFill ${titleTextClass}`}
            style={{
              color: 'var(--notification-bg)',
              clipPath: reducedMotion ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
            }}
          >
            {fillText}
          </h1>
        </div>
      )}
    </div>
  );
};

export default FillingChordTitle;
