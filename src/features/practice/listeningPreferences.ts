import { getLesson, type LessonId } from './model';

/** Separate from legacy practice history: only listening setup is stored. */
export const LISTENING_PREFERENCES_KEY = 'eartrainer.listening-preferences.v1';
export type ListeningPreferences = {
  lastLessonId: LessonId;
  volume: number;
};
export type PreferencesStorage = Pick<Storage, 'getItem' | 'setItem'>;

const defaults = (): ListeningPreferences => ({
  lastLessonId: 'degrees-core',
  volume: 0.45,
});

function browserStorage(): PreferencesStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function normalize(
  value: unknown,
  fallback = defaults()
): ListeningPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return { ...fallback };
  const input = value as Record<string, unknown>;
  return {
    lastLessonId:
      typeof input.lastLessonId === 'string' && getLesson(input.lastLessonId)
        ? (input.lastLessonId as LessonId)
        : fallback.lastLessonId,
    volume:
      typeof input.volume === 'number' && Number.isFinite(input.volume)
        ? Math.min(1, Math.max(0, input.volume))
        : fallback.volume,
  };
}

/** Missing, malformed, or denied browser storage never blocks listening. */
export function getListeningPreferences(
  storage?: PreferencesStorage | null
): ListeningPreferences {
  const target = storage === undefined ? browserStorage() : storage;
  if (!target) return defaults();
  try {
    const raw = target.getItem(LISTENING_PREFERENCES_KEY);
    if (!raw || raw.length > 2_048) return defaults();
    return normalize(JSON.parse(raw));
  } catch {
    return defaults();
  }
}

/** Whitelists setup fields; answers, scores, and session data are never written. */
export function saveListeningPreferences(
  partial: Partial<ListeningPreferences>,
  storage?: PreferencesStorage | null
): boolean {
  const target = storage === undefined ? browserStorage() : storage;
  if (!target) return false;
  try {
    const preferences = normalize(partial, getListeningPreferences(target));
    target.setItem(LISTENING_PREFERENCES_KEY, JSON.stringify(preferences));
    return true;
  } catch {
    return false;
  }
}
