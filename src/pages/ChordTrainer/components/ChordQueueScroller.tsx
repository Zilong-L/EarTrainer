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
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(entries => {
      const next = entries[0]?.contentRect?.width ?? 0;
      setWidth(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const slotPx = useMemo(() => {
    // Responsive spacing between the 3 chords: clamp to keep side chords visible.
    if (!width) return 160;
    return clamp(width * 0.3, 92, 300);
  }, [width]);

  const start = Math.max(0, targetIndex - 1);
  const end = Math.min(items.length, targetIndex + 2);
  const visible = items.slice(start, end);

  const slotX = (slot: number) => slot * slotPx;
  const slotScale = (slot: number) => (slot === 0 ? 1 : 0.7);
  const slotOpacity = (slot: number) => (slot === 0 ? 1 : 0.7);
  const textClass =
    'font-bold text-text-primary text-center leading-[1.12] px-[0.22em] pb-[0.12em] max-w-[82vw] whitespace-nowrap text-4xl sm:text-6xl lg:text-7xl';

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: 'clamp(84px, 18vh, 170px)' }}
      aria-label="Chord scroller"
    >
      <AnimatePresence initial={false}>
        {visible.map((item, i) => {
          const idx = start + i;
          const slot = idx - targetIndex; // -1 | 0 | 1 (for the visible window)
          const x = slotX(slot);
          const isTarget = slot === 0;

          return (
            <motion.div
              key={item.id}
              className="absolute inset-0 flex items-center justify-center"
              initial={{
                x: slot === 1 ? x + slotPx : x,
                opacity: 0,
                scale: slotScale(slot),
              }}
              animate={{
                x,
                opacity: slotOpacity(slot),
                scale: slotScale(slot),
                transition: { duration: 0.26, ease: 'easeOut' },
              }}
              exit={{
                x: x - slotPx,
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
