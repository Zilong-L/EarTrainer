import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import './practiceUi.css';
import FillingChordText from '@ChordTrainer/components/FillingChordText';

type ScrollerItem = {
  id: number;
  label: string;
  title?: string;
};

type ChordQueueScrollerProps = {
  items: ScrollerItem[];
  targetIndex: number;
  holdMs?: number;
  isFilling?: boolean;
  runId?: number;
  successId?: number;
  className?: string;
};

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const NARROW_BREAKPOINT_PX = 768;

const ChordQueueScroller: React.FC<ChordQueueScrollerProps> = ({
  items,
  targetIndex,
  holdMs = 0,
  isFilling = false,
  runId = 0,
  successId = 0,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(entries => {
      const nextWidth = entries[0]?.contentRect?.width ?? 0;
      const nextHeight = entries[0]?.contentRect?.height ?? 0;
      setRect({ width: nextWidth, height: nextHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isNarrow = rect.width > 0 && rect.width < NARROW_BREAKPOINT_PX;
  const axis: 'x' | 'y' = isNarrow ? 'y' : 'x';

  const slotPx = useMemo(() => {
    // Responsive spacing between the 3 chords: clamp to keep side chords visible.
    if (axis === 'y') {
      // Portrait (narrow) layout: give a bit more breathing room between chords.
      if (!rect.height) return 132;
      return clamp(rect.height * 0.38, 86, 220);
    }
    if (!rect.width) return 160;
    return clamp(rect.width * 0.3, 92, 300);
  }, [axis, rect.height, rect.width]);

  const start = Math.max(0, targetIndex - 1);
  const end = Math.min(items.length, targetIndex + 2);
  const visible = items.slice(start, end);

  const slotX = (slot: number) => slot * slotPx;
  const slotScale = (slot: number) => (slot === 0 ? 1 : 0.7);
  const slotOpacity = (slot: number) => (slot === 0 ? 1 : 0.7);
  const fontSizeClass =
    axis === 'y' ? 'text-5xl' : 'text-4xl sm:text-6xl lg:text-7xl';
  const textClass = `font-bold text-text-primary text-center leading-[1.12] px-[0.22em] pb-[0.12em] max-w-[82vw] whitespace-nowrap ${fontSizeClass}`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        height:
          axis === 'y'
            ? 'clamp(200px, 32vh, 340px)'
            : 'clamp(84px, 18vh, 170px)',
      }}
      aria-label="Chord scroller"
    >
      <AnimatePresence initial={false}>
        {visible.map((item, i) => {
          const idx = start + i;
          const slot = idx - targetIndex; // -1 | 0 | 1 (for the visible window)
          const pos = slotX(slot);
          const isTarget = slot === 0;

          return (
            <motion.div
              key={item.id}
              className="absolute inset-0 flex items-center justify-center"
              initial={{
                x: axis === 'x' ? (slot === 1 ? pos + slotPx : pos) : 0,
                y: axis === 'y' ? (slot === 1 ? pos + slotPx : pos) : 0,
                opacity: 0,
                scale: slotScale(slot),
              }}
              animate={{
                x: axis === 'x' ? pos : 0,
                y: axis === 'y' ? pos : 0,
                opacity: slotOpacity(slot),
                scale: slotScale(slot),
                transition: { duration: 0.26, ease: 'easeOut' },
              }}
              exit={{
                x: axis === 'x' ? pos - slotPx : 0,
                y: axis === 'y' ? pos - slotPx : 0,
                opacity: 0,
                scale: 0.55,
                transition: { duration: 0.18, ease: 'easeIn' },
              }}
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="select-none" title={item.title}>
                {isTarget ? (
                  <FillingChordText
                    text={item.label}
                    isFilling={isFilling}
                    holdMs={holdMs}
                    runId={runId}
                    successId={successId}
                    className={textClass}
                  />
                ) : (
                  <div className={textClass}>{item.label}</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ChordQueueScroller;
