import { getLesson, LESSONS, SESSION_LENGTH, type LessonId } from './model';

export const PROGRESS_STORAGE_KEY = 'eartrainer.guided-progress.v1';
export const PROGRESS_EVENT = 'eartrainer:guided-progress';
export const PROGRESS_VERSION = 1;
export const MAX_SAVED_SESSIONS = 200;
const MAX_STORAGE_LENGTH = 512_000;
const MAX_ID_LENGTH = 128;
const DAY_MS = 86_400_000;

export type SessionResult = {
  questionId: string;
  /** Correct answer class, not a guessed label. */
  answer: string;
  selectedAnswer: string | null;
  /** Correctness of the first locked selection; null if there was no scored choice. */
  firstAttemptCorrect: boolean | null;
  usedHint: boolean;
  revealed: boolean;
  skipped: boolean;
  tonicPitchClass?: number;
};
export type PracticeSession = {
  id: string;
  lessonId: LessonId;
  completedAt: number;
  results: SessionResult[];
};
export type Progress = {
  version: typeof PROGRESS_VERSION;
  sessions: PracticeSession[];
};
export type SaveSessionInput = {
  lessonId: LessonId;
  results: SessionResult[];
  completedAt?: number;
  id?: string;
};
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
export type SaveSessionResult = {
  progress: Progress;
  saved: boolean;
  error?: 'unavailable' | 'quota' | 'invalid';
};
export type LessonStatus = 'new' | 'building' | 'ready' | 'solid';
export type LessonSummary = {
  attempts: number;
  firstAttemptCorrect: number;
  accuracy: number;
  completedSessions: number;
  assisted: number;
  revealed: number;
  skipped: number;
  status: LessonStatus;
  needsReview: boolean;
  /** Independent first-choice sample counts, including mistakes. */
  answerCoverage: Record<string, number>;
  tonicCoverage: number;
};
export type ProgressSummary = {
  totals: {
    sessions: number;
    questions: number;
    firstAttemptCorrect: number;
    accuracy: number;
    assisted: number;
    revealed: number;
    skipped: number;
    activeDays: number;
  };
  lessons: Record<LessonId, LessonSummary>;
  recommendation: LessonId;
  recommendedLessonId: LessonId;
  totalSessions: number;
  totalQuestions: number;
  firstAttemptCorrect: number;
  firstAttemptAccuracy: number;
};

const emptyProgress = (): Progress => ({
  version: PROGRESS_VERSION,
  sessions: [],
});
let volatileProgress = emptyProgress();
let hasUnsavedProgress = false;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const validId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= MAX_ID_LENGTH;

function validateResult(
  value: unknown,
  lessonId: LessonId
): SessionResult | null {
  if (!isRecord(value)) return null;
  const lesson = getLesson(lessonId);
  const allowed = lesson?.choices.map(choice => choice.id) ?? [];
  if (
    !validId(value.questionId) ||
    typeof value.answer !== 'string' ||
    !allowed.includes(value.answer)
  )
    return null;
  if (
    value.selectedAnswer !== null &&
    (typeof value.selectedAnswer !== 'string' ||
      !allowed.includes(value.selectedAnswer))
  )
    return null;
  if (
    typeof value.usedHint !== 'boolean' ||
    typeof value.revealed !== 'boolean' ||
    typeof value.skipped !== 'boolean'
  )
    return null;
  if (
    value.firstAttemptCorrect !== null &&
    typeof value.firstAttemptCorrect !== 'boolean'
  )
    return null;
  if (value.skipped && value.selectedAnswer !== null) return null;
  if (value.selectedAnswer === null && value.firstAttemptCorrect !== null)
    return null;
  if (
    value.selectedAnswer !== null &&
    value.firstAttemptCorrect !== (value.selectedAnswer === value.answer)
  )
    return null;
  // An unanswered question must have a terminal reason. Partial sessions are not history.
  if (value.selectedAnswer === null && !value.skipped && !value.revealed)
    return null;
  if (
    value.tonicPitchClass !== undefined &&
    (!Number.isInteger(value.tonicPitchClass) ||
      Number(value.tonicPitchClass) < 0 ||
      Number(value.tonicPitchClass) > 11)
  )
    return null;
  return {
    questionId: value.questionId,
    answer: value.answer,
    selectedAnswer: value.selectedAnswer as string | null,
    firstAttemptCorrect: value.firstAttemptCorrect as boolean | null,
    usedHint: value.usedHint,
    revealed: value.revealed,
    skipped: value.skipped,
    ...(value.tonicPitchClass !== undefined
      ? { tonicPitchClass: Number(value.tonicPitchClass) }
      : {}),
  };
}

function validateSession(value: unknown): PracticeSession | null {
  if (
    !isRecord(value) ||
    !validId(value.id) ||
    typeof value.lessonId !== 'string' ||
    !getLesson(value.lessonId)
  )
    return null;
  if (
    typeof value.completedAt !== 'number' ||
    !Number.isFinite(value.completedAt) ||
    value.completedAt < 0 ||
    value.completedAt > Date.now() + DAY_MS
  )
    return null;
  if (!Array.isArray(value.results) || value.results.length !== SESSION_LENGTH)
    return null;
  const lessonId = value.lessonId as LessonId;
  const results = value.results.map(result => validateResult(result, lessonId));
  if (results.some(result => result === null)) return null;
  const safeResults = results as SessionResult[];
  if (
    new Set(safeResults.map(result => result.questionId)).size !==
    SESSION_LENGTH
  )
    return null;
  return {
    id: value.id,
    lessonId,
    completedAt: value.completedAt,
    results: safeResults,
  };
}

/** Unknown versions fail closed; individually damaged sessions cannot inflate stats. */
function validateProgress(value: unknown): Progress {
  if (
    !isRecord(value) ||
    value.version !== PROGRESS_VERSION ||
    !Array.isArray(value.sessions)
  )
    return emptyProgress();
  const seen = new Set<string>();
  const sessions: PracticeSession[] = [];
  for (const raw of value.sessions.slice(-MAX_SAVED_SESSIONS)) {
    const session = validateSession(raw);
    if (session && !seen.has(session.id)) {
      seen.add(session.id);
      sessions.push(session);
    }
  }
  return {
    version: PROGRESS_VERSION,
    sessions: sessions.sort((a, b) => a.completedAt - b.completedAt),
  };
}

function browserStorage(): StorageLike | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/** Browser-only storage. No account, cloud transfer or dependency on React. */
export function getProgress(storage?: StorageLike): Progress {
  const target = storage ?? browserStorage();
  if (!target) return validateProgress(volatileProgress);
  try {
    const raw = target.getItem(PROGRESS_STORAGE_KEY);
    if (!raw || raw.length > MAX_STORAGE_LENGTH)
      return !storage && hasUnsavedProgress
        ? validateProgress(volatileProgress)
        : emptyProgress();
    let progress = validateProgress(JSON.parse(raw));
    if (!storage && hasUnsavedProgress) {
      const merged = new Map(
        progress.sessions.map(session => [session.id, session])
      );
      for (const session of volatileProgress.sessions)
        merged.set(session.id, session);
      progress = validateProgress({
        version: PROGRESS_VERSION,
        sessions: [...merged.values()].sort(
          (a, b) => a.completedAt - b.completedAt
        ),
      });
    }
    if (!storage) volatileProgress = progress;
    return progress;
  } catch {
    return storage ? emptyProgress() : validateProgress(volatileProgress);
  }
}

function notifyProgressChanged(): void {
  if (typeof window !== 'undefined')
    window.dispatchEvent(new Event(PROGRESS_EVENT));
}

export function saveSession(
  input: SaveSessionInput,
  storage?: StorageLike
): SaveSessionResult {
  const progress = getProgress(storage);
  const session = validateSession({
    id:
      input.id ??
      `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    lessonId: input.lessonId,
    completedAt: input.completedAt ?? Date.now(),
    results: input.results,
  });
  if (!session) return { progress, saved: false, error: 'invalid' };
  const next: Progress = {
    version: PROGRESS_VERSION,
    sessions: [
      ...progress.sessions.filter(item => item.id !== session.id),
      session,
    ]
      .sort((a, b) => a.completedAt - b.completedAt)
      .slice(-MAX_SAVED_SESSIONS),
  };
  // Keep results useful in the current tab even when browser storage is blocked.
  if (!storage) {
    volatileProgress = next;
    hasUnsavedProgress = true;
  }
  const target = storage ?? browserStorage();
  if (!target) {
    notifyProgressChanged();
    return { progress: next, saved: false, error: 'unavailable' };
  }
  try {
    target.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
    if (!storage) hasUnsavedProgress = false;
    notifyProgressChanged();
    return { progress: next, saved: true };
  } catch (error) {
    notifyProgressChanged();
    const name =
      isRecord(error) && typeof error.name === 'string' ? error.name : '';
    return {
      progress: next,
      saved: false,
      error: name === 'QuotaExceededError' ? 'quota' : 'unavailable',
    };
  }
}

export const isIndependentAttempt = (result: SessionResult): boolean =>
  result.selectedAnswer !== null &&
  !result.usedHint &&
  !result.revealed &&
  !result.skipped;
export const isFirstAttemptSuccess = (result: SessionResult): boolean =>
  isIndependentAttempt(result) && result.firstAttemptCorrect === true;

/**
 * Readiness is a conservative product suggestion, not a scientific mastery claim.
 * Every issued question is in the accuracy denominator, including hints/reveals/skips.
 * Missing diversity metadata never grants readiness. All lessons remain open.
 */
export function summarizeProgress(
  progress: Progress = getProgress()
): ProgressSummary {
  const safe = validateProgress(progress);
  const lessons = {} as Record<LessonId, LessonSummary>;
  for (const lesson of LESSONS) {
    const sessions = safe.sessions.filter(
      session => session.lessonId === lesson.id
    );
    const results = sessions.flatMap(session => session.results);
    const independent = results.filter(isIndependentAttempt);
    const firstAttemptCorrect = results.filter(isFirstAttemptSuccess).length;
    const accuracy = results.length ? firstAttemptCorrect / results.length : 0;
    const answerCoverage = Object.fromEntries(
      lesson.choices.map(choice => [
        choice.id,
        independent.filter(result => result.answer === choice.id).length,
      ])
    );
    const tonicCoverage = new Set(
      independent.flatMap(result =>
        result.tonicPitchClass === undefined ? [] : [result.tonicPitchClass]
      )
    ).size;
    const enoughSamples =
      results.length >= 24 &&
      sessions.length >= 3 &&
      tonicCoverage >= 3 &&
      Object.values(answerCoverage).every(count => count >= 3);
    const recent = sessions.slice(-3).flatMap(session => session.results);
    const recentAccuracy = recent.length
      ? recent.filter(isFirstAttemptSuccess).length / recent.length
      : 0;
    const needsReview = recent.length >= 16 && recentAccuracy < 0.65;
    const status: LessonStatus = !results.length
      ? 'new'
      : enoughSamples && accuracy >= 0.8 && !needsReview
        ? results.length >= 48 && accuracy >= 0.85
          ? 'solid'
          : 'ready'
        : 'building';
    lessons[lesson.id] = {
      attempts: results.length,
      firstAttemptCorrect,
      accuracy,
      completedSessions: sessions.length,
      assisted: results.filter(result => result.usedHint).length,
      revealed: results.filter(result => result.revealed).length,
      skipped: results.filter(result => result.skipped).length,
      status,
      needsReview,
      answerCoverage,
      tonicCoverage,
    };
  }
  const all = safe.sessions.flatMap(session => session.results);
  const firstAttemptCorrect = all.filter(isFirstAttemptSuccess).length;
  const totals = {
    sessions: safe.sessions.length,
    questions: all.length,
    firstAttemptCorrect,
    accuracy: all.length ? firstAttemptCorrect / all.length : 0,
    assisted: all.filter(result => result.usedHint).length,
    revealed: all.filter(result => result.revealed).length,
    skipped: all.filter(result => result.skipped).length,
    activeDays: new Set(
      safe.sessions.map(session => {
        const date = new Date(session.completedAt);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
    ).size,
  };
  const recommendation =
    LESSONS.find(lesson => lessons[lesson.id].needsReview)?.id ??
    LESSONS.find(lesson =>
      ['new', 'building'].includes(lessons[lesson.id].status)
    )?.id ??
    [...LESSONS].sort(
      (a, b) => lessons[a.id].accuracy - lessons[b.id].accuracy
    )[0].id;
  return {
    totals,
    lessons,
    recommendation,
    recommendedLessonId: recommendation,
    totalSessions: totals.sessions,
    totalQuestions: totals.questions,
    firstAttemptCorrect,
    firstAttemptAccuracy: totals.accuracy,
  };
}
