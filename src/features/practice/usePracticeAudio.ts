import { useCallback, useEffect, useRef, useState } from 'react';
import { getContext } from 'tone';
import {
  cancelAllSounds,
  scheduleNotes,
  type NoteEvent,
} from '@utils/Tone/playbacks';

export type PracticeSound =
  | 'target'
  | 'reference'
  | 'hint'
  | 'comparison'
  | 'example';
export type PracticeAudioStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'error';

/** Owns one cancellable playback. Audio only starts in an explicit play action. */
export function usePracticeAudio(resetKey: string) {
  const [status, setStatus] = useState<PracticeAudioStatus>('idle');
  const [activeSound, setActiveSound] = useState<PracticeSound | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const pendingCancel = useRef<(() => void) | null>(null);
  const mounted = useRef(true);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    pendingCancel.current?.();
    pendingCancel.current = null;
    if (endTimer.current !== null) clearTimeout(endTimer.current);
    if (loadTimer.current !== null) clearTimeout(loadTimer.current);
    endTimer.current = null;
    loadTimer.current = null;
  }, []);

  const stop = useCallback(
    (nextStatus: 'idle' | 'paused' = 'idle') => {
      generation.current++;
      clearTimers();
      cancelAllSounds();
      if (mounted.current) {
        setStatus(nextStatus);
        setActiveSound(null);
        setError(null);
      }
    },
    [clearTimers]
  );

  const play = useCallback(
    async (
      events: readonly NoteEvent[],
      sound: PracticeSound = 'target',
      onComplete?: () => void
    ): Promise<boolean> => {
      const request = ++generation.current;
      clearTimers();
      cancelAllSounds();
      if (!mounted.current || document.hidden) return false;
      setStatus('loading');
      setActiveSound(sound);
      setError(null);
      const validEvents = events.filter(
        event =>
          Number.isFinite(event.time) &&
          event.time >= 0 &&
          Number.isFinite(event.duration) &&
          event.duration > 0 &&
          (typeof event.note === 'string' || Number.isFinite(event.note))
      );
      try {
        if (!validEvents.length) throw new Error('No playable notes.');
        // Invoke immediately, before awaiting: Tone resumes from this user gesture.
        const scheduling = scheduleNotes([...validEvents]);
        const cancelled = new Promise<false>(resolve => {
          pendingCancel.current = () => resolve(false);
        });
        const timeout = new Promise<never>((_resolve, reject) => {
          loadTimer.current = setTimeout(
            () => reject(new Error('Audio loading timed out.')),
            25000
          );
        });
        const scheduled = await Promise.race([
          scheduling.then(() => true),
          cancelled,
          timeout,
        ]);
        if (request !== generation.current || !mounted.current || !scheduled)
          return false;
        pendingCancel.current = null;
        if (document.hidden) {
          stop('paused');
          return false;
        }
        if (getContext().state !== 'running') {
          throw new Error('The browser could not resume audio.');
        }
        if (loadTimer.current !== null) clearTimeout(loadTimer.current);
        loadTimer.current = null;
        setStatus('playing');
        const duration = Math.max(
          ...validEvents.map(event => event.time + event.duration)
        );
        endTimer.current = setTimeout(
          () => {
            if (request !== generation.current || !mounted.current) return;
            if (document.hidden || getContext().state !== 'running') {
              stop('paused');
              return;
            }
            endTimer.current = null;
            setStatus('idle');
            setActiveSound(null);
            onComplete?.();
          },
          duration * 1000 + 150
        );
        return true;
      } catch (cause) {
        if (request !== generation.current || !mounted.current) return false;
        clearTimers();
        cancelAllSounds();
        setStatus('error');
        setActiveSound(null);
        setError(cause instanceof Error ? cause.message : 'Audio unavailable.');
        return false;
      }
    },
    [clearTimers, stop]
  );

  useEffect(() => {
    mounted.current = true;
    const onVisibility = () => {
      if (document.hidden) stop('paused');
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      mounted.current = false;
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [stop]);

  useEffect(() => {
    stop();
  }, [resetKey, stop]);

  return { status, activeSound, error, play, stop };
}

export default usePracticeAudio;
