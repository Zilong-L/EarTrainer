import { useCallback, useEffect, useRef, useState } from 'react';

type HoldPhase = 'idle' | 'filling';

type UseHoldToAdvanceArgs = {
  isMatch: boolean;
  holdMs: number;
  onAdvance: () => void;
  resetKey?: string | number;
};

type UseHoldToAdvanceReturn = {
  phase: HoldPhase;
  runId: number; // bump to restart the CSS fill animation
  successId: number; // bump to trigger a CSS success fade animation
};

export default function useHoldToAdvance({
  isMatch,
  holdMs,
  onAdvance,
  resetKey,
}: UseHoldToAdvanceArgs): UseHoldToAdvanceReturn {
  const [phase, setPhase] = useState<HoldPhase>('idle');
  const [runId, setRunId] = useState(0);
  const [successId, setSuccessId] = useState(0);

  const onAdvanceRef = useRef(onAdvance);
  const prevMatchRef = useRef(false);
  const holdMsAtStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onAdvanceRef.current = onAdvance;
  }, [onAdvance]);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cancelFill = useCallback(() => {
    clearTimer();
    holdMsAtStartRef.current = null;
    setPhase('idle');
    // Remount the mask element to hard-reset the CSS animation to 0.
    setRunId(id => id + 1);
  }, [clearTimer]);

  const triggerSuccess = useCallback(() => {
    setSuccessId(id => id + 1);
  }, []);

  const startFill = useCallback(
    (ms: number) => {
      clearTimer();
      holdMsAtStartRef.current = ms;
      setPhase('filling');
      setRunId(id => id + 1);

      timerRef.current = setTimeout(
        () => {
          timerRef.current = null;
          holdMsAtStartRef.current = null;
          setPhase('idle');
          setRunId(id => id + 1);
          triggerSuccess();
          onAdvanceRef.current();
        },
        Math.max(0, ms)
      );
    },
    [clearTimer, triggerSuccess]
  );

  // Reset when target changes.
  useEffect(() => {
    cancelFill();
    prevMatchRef.current = false;
  }, [resetKey, cancelFill]);

  useEffect(() => {
    if (!isMatch) {
      prevMatchRef.current = false;
      if (timerRef.current != null || phase === 'filling') cancelFill();
      return;
    }

    // Match is true
    if (holdMs <= 0) {
      // Instant: advance on rising edge.
      if (!prevMatchRef.current) {
        prevMatchRef.current = true;
        triggerSuccess();
        onAdvanceRef.current();
      }
      return;
    }

    // Hold mode
    if (!prevMatchRef.current) {
      prevMatchRef.current = true;
      startFill(holdMs);
      return;
    }

    // Still matching, but duration changed while filling: restart.
    if (timerRef.current != null && holdMsAtStartRef.current !== holdMs) {
      startFill(holdMs);
    }
  }, [isMatch, holdMs, phase, cancelFill, startFill, triggerSuccess]);

  // Cleanup on unmount (avoid setState during unmount)
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { phase, runId, successId };
}
