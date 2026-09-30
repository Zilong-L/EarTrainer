import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSoundSettingsStore } from '@stores/soundSettingsStore';
import { getSamplerInstance } from '@utils/Tone/samplers';
import {
  SESSION_LENGTH,
  generateLessonExamples,
  generateSessionQuestions,
  getLesson,
  text,
  type Lesson,
  type LessonId,
  type PracticeEvent,
  type PracticeQuestion,
} from './model';
import { saveSession, type SessionResult } from './progress';
import usePracticeAudio, { type PracticeSound } from './usePracticeAudio';

const copy = {
  en: {
    home: 'Back to practice',
    volume: 'Listening volume',
    volumeNote: 'Keep your device volume low too',
    review: 'One sound to come back to',
    replayCorrect: 'Replay the correct sound',
    unavailable: 'This lesson isn’t available',
    unavailableCopy: 'Choose a lesson from your practice home to get started.',
    guided: 'Guided practice',
    questions: '8 questions · about 3 minutes',
    before: 'Before you begin',
    lowVolume:
      'Start with a low device volume. Headphones can help you hear detail.',
    listenFirst: 'Listen, choose once, then compare. Replays are always free.',
    honestScore: 'Hints, revealed answers, and skips are tracked separately.',
    examples: 'Hear the sounds first',
    examplesCopy:
      'These labeled examples are just for learning. They don’t count toward your score.',
    start: 'Start listening',
    question: 'Question',
    of: 'of',
    listen: 'Listen to the question',
    replay: 'Replay question',
    listening: 'Playing',
    loading: 'Getting the sound ready…',
    ready: 'Listen again whenever you need to',
    listenToAnswer: 'Play the question before choosing an answer',
    paused: 'Sound paused when you left. Tap play to continue.',
    audioError:
      'The sound couldn’t start. Check your device volume and try again.',
    retryAudio: 'Try sound again',
    fallback:
      'The selected sound couldn’t load. A ready fallback sound is being used.',
    reference: 'Hear reference',
    hint: 'Listen with a hint',
    hintUsed: 'Hint used · this answer will be tracked as assisted',
    stop: 'Stop sound',
    choose: 'What do you hear?',
    reveal: 'Reveal answer',
    skip: 'Skip question',
    correct: 'You heard it',
    assistedCorrect: 'You found it with a hint',
    incorrect: 'Listen for the difference',
    revealed: 'Answer revealed',
    skipped: 'Question skipped',
    answer: 'The answer is',
    yourAnswer: 'You chose',
    firstLocked: 'Your first answer is locked in. Comparing won’t change it.',
    unscored: 'This question doesn’t count as a correct first try.',
    compare: 'Compare reference + question',
    compareCopy: 'The reference plays first, followed by the question.',
    next: 'Next question',
    finish: 'See session summary',
    complete: 'Session complete',
    completeCopy: 'Small, focused listens add up. Here’s how this round went.',
    firstTry: 'Correct first try',
    firstTryCopy: 'Without hints',
    assisted: 'Assisted answers',
    assistedCopy: 'A hint was used',
    revealedStat: 'Revealed',
    skippedStat: 'Skipped',
    saved: 'Progress saved on this device',
    notSaved:
      'Your session is complete, but this browser couldn’t save your progress.',
    retry: 'Practice again',
    finishHome: 'Choose your next lesson',
    learning: 'Keep the sound in mind',
  },
  zh: {
    home: '返回练习首页',
    volume: '聆听音量',
    volumeNote: '设备音量也请保持较低',
    review: '值得再听的声音',
    replayCorrect: '重听正确的声音',
    unavailable: '找不到这节课程',
    unavailableCopy: '请从练习首页选择一节课程。',
    guided: '引导练习',
    questions: '8 道题 · 约 3 分钟',
    before: '开始之前',
    lowVolume: '请先调低设备音量。使用耳机可以更清楚地听到细节。',
    listenFirst: '先听，再选择一次，然后比较。可以随时重听。',
    honestScore: '使用提示、查看答案与跳过会单独记录。',
    examples: '先认识这些声音',
    examplesCopy: '这些带名称的示例用于学习，不计入成绩。',
    start: '开始聆听',
    question: '第',
    of: '/',
    listen: '聆听题目',
    replay: '重听题目',
    listening: '播放中',
    loading: '正在准备声音…',
    ready: '需要时可以随时重听',
    listenToAnswer: '请先播放题目，再选择答案',
    paused: '离开页面时已暂停声音。点击播放继续。',
    audioError: '声音未能启动。请检查设备音量后重试。',
    retryAudio: '重试声音',
    fallback: '所选声音暂不可用，正在使用已准备好的备用声音。',
    reference: '聆听参考音',
    hint: '聆听提示',
    hintUsed: '已使用提示 · 此答案会记录为辅助作答',
    stop: '停止声音',
    choose: '你听到了什么？',
    reveal: '查看答案',
    skip: '跳过此题',
    correct: '你听出来了',
    assistedCorrect: '你借助提示听出来了',
    incorrect: '再听听区别',
    revealed: '已显示答案',
    skipped: '已跳过此题',
    answer: '正确答案是',
    yourAnswer: '你的选择是',
    firstLocked: '首次答案已记录。之后的比较不会改变成绩。',
    unscored: '此题不会计为首次答对。',
    compare: '比较参考音与题目',
    compareCopy: '先播放参考音，再播放题目。',
    next: '下一题',
    finish: '查看本次总结',
    complete: '练习完成',
    completeCopy: '每次专注聆听都在积累。看看这一轮的表现。',
    firstTry: '首次答对',
    firstTryCopy: '未使用提示',
    assisted: '辅助作答',
    assistedCopy: '使用过提示',
    revealedStat: '查看答案',
    skippedStat: '跳过',
    saved: '进度已保存在此设备',
    notSaved: '本次练习已完成，但此浏览器无法保存进度。',
    retry: '再练一轮',
    finishHome: '选择下一节课程',
    learning: '记住这个声音',
  },
};

const listeningSuggestions = {
  en: {
    degree:
      'Use the key reference, sing do, then compare the target with that home note.',
    interval:
      'Sing the two notes slowly and focus on the distance between them.',
    triad:
      'Use the arpeggio hint to compare the third and fifth above the root.',
    inversion: 'Listen to the lowest note first, then hear the full chord.',
    function: 'Hear the cadence, then compare the chord with the tonic sound.',
  },
  zh: {
    degree: '先听调性参考，轻唱 Do，再把目标音与主音比较。',
    interval: '慢慢唱出两个音，重点听辨它们之间的距离。',
    triad: '借助分解和弦提示，比较根音上方的三度与五度。',
    inversion: '先听最低音，再听完整的和弦。',
    function: '先听终止式，再把和弦与主和弦的声音比较。',
  },
};

function createQuestions(lessonId: LessonId): PracticeQuestion[] {
  return generateSessionQuestions(lessonId);
}

function comparisonEvents(
  question: Pick<PracticeQuestion, 'events' | 'referenceEvents'>
): PracticeEvent[] {
  if (!question.referenceEvents.length) return [...question.events];
  const referenceEnd = Math.max(
    0,
    ...question.referenceEvents.map(event => event.time + event.duration)
  );
  return [
    ...question.referenceEvents,
    ...question.events.map(event => ({
      ...event,
      time: event.time + referenceEnd + 0.6,
    })),
  ];
}

interface GuidedPracticeProps {
  lessonId?: string;
}

export default function GuidedPractice({ lessonId }: GuidedPracticeProps) {
  const params = useParams();
  const { i18n } = useTranslation();
  const language = i18n.language?.startsWith('zh') ? 'zh' : 'en';
  const c = copy[language];
  const selectedId = lessonId ?? params.lessonId ?? params.lesson;
  const lesson = getLesson(selectedId ?? 'degrees-core');
  if (!lesson) {
    return (
      <main className="practice-page practice-unavailable">
        <h1 className="practice-title">{c.unavailable}</h1>
        <p className="practice-copy">{c.unavailableCopy}</p>
        <Link className="practice-primary" to="/practice">
          {c.home}
        </Link>
      </main>
    );
  }
  return <PracticeSession key={lesson.id} lesson={lesson} />;
}

function PracticeSession({ lesson }: { lesson: Lesson }) {
  const { i18n } = useTranslation();
  const language = i18n.language?.startsWith('zh') ? 'zh' : 'en';
  const c = copy[language];
  const location = useLocation();
  const [questions, setQuestions] = useState(() => createQuestions(lesson.id));
  const [phase, setPhase] = useState<'intro' | 'question' | 'complete'>(
    'intro'
  );
  const [index, setIndex] = useState(0);
  const [heard, setHeard] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [decision, setDecision] = useState<SessionResult | null>(null);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [saved, setSaved] = useState(true);
  const [volume, setVolume] = useState(0.45);
  const question = questions[index];
  const audio = usePracticeAudio(`${location.key}:${question.id}`);
  const instrumentLoadError = useSoundSettingsStore(
    state => state.instrumentLoadError
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLHeadingElement>(null);
  const heardRef = useRef(false);
  const hintRef = useRef(false);
  const decisionRef = useRef<SessionResult | null>(null);
  const resultsRef = useRef<SessionResult[]>([]);
  const playbackRequest = useRef(0);
  const loadingRef = useRef(false);
  const advancing = useRef(false);
  const examples = generateLessonExamples(lesson.id);
  const loading = audio.status === 'loading';
  const canAnswer = heard && !loading && !decision;

  useEffect(() => {
    getSamplerInstance().setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (phase !== 'intro') heading.current?.focus();
  }, [index, phase]);

  useEffect(() => {
    if (decision) feedback.current?.focus();
  }, [decision]);

  const stopSound = () => {
    playbackRequest.current++;
    loadingRef.current = false;
    audio.stop();
  };

  const playSound = async (sound: PracticeSound, events?: PracticeEvent[]) => {
    const request = ++playbackRequest.current;
    loadingRef.current = true;
    // Mark before scheduling: stopping a just-started hint cannot turn it unaided.
    if (sound === 'hint' && !decisionRef.current) {
      hintRef.current = true;
      setUsedHint(true);
    }
    const notes =
      events ??
      (sound === 'reference'
        ? question.referenceEvents
        : sound === 'hint'
          ? question.hintEvents
          : sound === 'comparison'
            ? comparisonEvents(question)
            : comparisonEvents(question));
    const played = await audio.play(notes, sound, () => {
      if (request !== playbackRequest.current) return;
      if (sound === 'target') {
        heardRef.current = true;
        setHeard(true);
      }
    });
    if (request !== playbackRequest.current) return;
    loadingRef.current = false;
    if (!played) return;
  };

  const start = () => {
    setPhase('question');
    void playSound('target');
  };

  const record = (
    selectedAnswer: string | null,
    mode: 'answer' | 'reveal' | 'skip'
  ) => {
    // Refs close the gap before React renders a disabled button after rapid taps.
    if (decisionRef.current) return;
    if (mode === 'answer' && (!heardRef.current || loadingRef.current)) return;
    stopSound();
    const nextDecision: SessionResult = {
      questionId: question.id,
      answer: question.answer,
      selectedAnswer,
      firstAttemptCorrect:
        mode === 'answer' ? selectedAnswer === question.answer : null,
      usedHint: hintRef.current,
      revealed: mode === 'reveal',
      skipped: mode === 'skip',
      tonicPitchClass: question.tonic % 12,
    };
    decisionRef.current = nextDecision;
    setDecision(nextDecision);
    resultsRef.current = [...resultsRef.current, nextDecision];
    setResults(resultsRef.current);
  };

  const nextQuestion = () => {
    if (!decisionRef.current || advancing.current) return;
    advancing.current = true;
    stopSound();
    if (index === SESSION_LENGTH - 1) {
      const result = saveSession({
        lessonId: lesson.id,
        results: resultsRef.current,
      });
      setSaved(result.saved);
      setPhase('complete');
      return;
    }
    heardRef.current = false;
    hintRef.current = false;
    decisionRef.current = null;
    setHeard(false);
    setUsedHint(false);
    setDecision(null);
    setIndex(value => value + 1);
  };

  useEffect(() => {
    advancing.current = false;
  }, [index]);

  const retry = () => {
    stopSound();
    setQuestions(createQuestions(lesson.id));
    setIndex(0);
    setPhase('intro');
    setHeard(false);
    setUsedHint(false);
    setDecision(null);
    setResults([]);
    setSaved(true);
    heardRef.current = false;
    hintRef.current = false;
    decisionRef.current = null;
    resultsRef.current = [];
    advancing.current = false;
  };

  const statusText =
    audio.status === 'loading'
      ? c.loading
      : audio.status === 'playing'
        ? c.listening
        : audio.status === 'paused'
          ? c.paused
          : audio.status === 'error'
            ? c.audioError
            : heard
              ? c.ready
              : c.listenToAnswer;

  const audioStatus = (
    <div
      className="practice-audio-state"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p>{statusText}</p>
      {audio.status === 'error' && phase === 'question' && (
        <button
          type="button"
          className="practice-secondary"
          onClick={() => void playSound('target')}
        >
          {c.retryAudio}
        </button>
      )}
      {instrumentLoadError && (
        <p className="practice-audio-fallback">{c.fallback}</p>
      )}
    </div>
  );

  if (phase === 'complete') {
    const firstTry = results.filter(
      result => result.firstAttemptCorrect && !result.usedHint
    ).length;
    const assisted = results.filter(
      result => result.usedHint && result.selectedAnswer !== null
    ).length;
    const revealed = results.filter(result => result.revealed).length;
    const skipped = results.filter(result => result.skipped).length;
    const confusions = new Map<
      string,
      { selected: string; correct: string; count: number; questionId: string }
    >();
    for (const result of results) {
      if (result.selectedAnswer === null || result.firstAttemptCorrect)
        continue;
      const key = `${result.selectedAnswer}:${result.answer}`;
      const previous = confusions.get(key);
      confusions.set(key, {
        selected: result.selectedAnswer,
        correct: result.answer,
        count: (previous?.count ?? 0) + 1,
        questionId: result.questionId,
      });
    }
    const confusion = [...confusions.values()].sort(
      (a, b) => b.count - a.count
    )[0];
    const reviewQuestion = confusion
      ? questions.find(item => item.id === confusion.questionId)
      : undefined;
    const selectedLabel = confusion
      ? lesson.choices.find(choice => choice.id === confusion.selected)?.label
      : undefined;
    const correctLabel = confusion
      ? lesson.choices.find(choice => choice.id === confusion.correct)?.label
      : undefined;
    return (
      <main className="practice-page practice-summary">
        <header className="practice-header">
          <span className="practice-kicker">
            {text(lesson.title, language)}
          </span>
          <h1 className="practice-title" ref={heading} tabIndex={-1}>
            {c.complete}
          </h1>
          <p className="practice-copy">{c.completeCopy}</p>
        </header>
        <div className="practice-stat-grid">
          <div className="practice-stat practice-stat-main">
            <strong>
              {firstTry}/{SESSION_LENGTH}
            </strong>
            <span>{c.firstTry}</span>
            <small>{c.firstTryCopy}</small>
          </div>
          <div className="practice-stat">
            <strong>{assisted}</strong>
            <span>{c.assisted}</span>
            <small>{c.assistedCopy}</small>
          </div>
          <div className="practice-stat">
            <strong>{revealed}</strong>
            <span>{c.revealedStat}</span>
          </div>
          <div className="practice-stat">
            <strong>{skipped}</strong>
            <span>{c.skippedStat}</span>
          </div>
        </div>
        {confusion && reviewQuestion && selectedLabel && correctLabel && (
          <section className="practice-card practice-review">
            <h2>{c.review}</h2>
            <p className="practice-copy">
              {language === 'zh'
                ? `你有 ${confusion.count} 次把“${text(correctLabel, language)}”听成了“${text(selectedLabel, language)}”。`
                : `You chose ${text(selectedLabel, language)} when the sound was ${text(correctLabel, language)} (${confusion.count} ${confusion.count === 1 ? 'time' : 'times'}).`}
            </p>
            <p className="practice-copy">
              {listeningSuggestions[language][lesson.type]}
            </p>
            <button
              type="button"
              className="practice-secondary"
              disabled={loading}
              onClick={() =>
                void playSound('target', comparisonEvents(reviewQuestion))
              }
            >
              {c.replayCorrect}: {text(correctLabel, language)}
            </button>
            {audioStatus}
            {(audio.status === 'playing' || loading) && (
              <button
                type="button"
                className="practice-text-button"
                onClick={stopSound}
              >
                {c.stop}
              </button>
            )}
          </section>
        )}
        <p
          className={`practice-save-status${saved ? '' : ' is-warning'}`}
          role="status"
        >
          {saved ? c.saved : c.notSaved}
        </p>
        <div className="practice-summary-actions">
          <button type="button" className="practice-primary" onClick={retry}>
            {c.retry}
          </button>
          <Link
            className="practice-secondary"
            to="/practice"
            onClick={stopSound}
          >
            {c.finishHome}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="practice-page">
      <header className="practice-header">
        <Link className="practice-back" to="/practice" onClick={stopSound}>
          ← {c.home}
        </Link>
        <span className="practice-kicker">
          {c.guided} · {text(lesson.focus, language)}
        </span>
        <h1 className="practice-title">{text(lesson.title, language)}</h1>
        {phase === 'intro' && (
          <p className="practice-copy">{text(lesson.description, language)}</p>
        )}
      </header>
      <div className="practice-volume">
        <label htmlFor="practice-volume">
          {c.volume} <span>{Math.round(volume * 100)}%</span>
        </label>
        <input
          id="practice-volume"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          aria-valuetext={`${Math.round(volume * 100)}%`}
          onChange={event => {
            const value = Number(event.currentTarget.value);
            setVolume(value);
            getSamplerInstance().setVolume(value);
          }}
        />
        <small>{c.volumeNote}</small>
      </div>
      {phase === 'intro' ? (
        <section className="practice-card practice-intro">
          <span className="practice-session-length">{c.questions}</span>
          <h2>{c.before}</h2>
          <p className="practice-instruction">
            {text(lesson.instruction, language)}
          </p>
          <ul className="practice-instruction-list">
            <li>{c.lowVolume}</li>
            <li>{c.listenFirst}</li>
            <li>{c.honestScore}</li>
          </ul>
          {examples.length > 0 && (
            <div className="practice-examples">
              <h3>{c.examples}</h3>
              <p className="practice-copy">{c.examplesCopy}</p>
              <div className="practice-example-buttons">
                {examples.map(example => (
                  <button
                    key={example.choice.id}
                    type="button"
                    className="practice-example-button"
                    disabled={loading}
                    onClick={() =>
                      void playSound('example', comparisonEvents(example))
                    }
                  >
                    <span aria-hidden="true">▶︎</span>{' '}
                    {text(example.choice.label, language)}
                  </button>
                ))}
              </div>
              {audio.status !== 'idle' && audioStatus}
              {(audio.status === 'playing' || loading) && (
                <button
                  type="button"
                  className="practice-text-button"
                  onClick={stopSound}
                >
                  {c.stop}
                </button>
              )}
            </div>
          )}
          <button
            type="button"
            className="practice-primary practice-start"
            onClick={start}
          >
            {c.start} <span aria-hidden="true">→</span>
          </button>
        </section>
      ) : (
        <>
          <div
            className="practice-progress"
            aria-label={`${c.question} ${index + 1} ${c.of} ${SESSION_LENGTH}`}
          >
            <span>
              {c.question} {index + 1} {c.of} {SESSION_LENGTH}
            </span>
            <progress value={index + (decision ? 1 : 0)} max={SESSION_LENGTH} />
          </div>
          <section className="practice-card practice-question">
            <h2 className="practice-question-title" ref={heading} tabIndex={-1}>
              {text(question.prompt, language)}
            </h2>
            <div className="practice-audio-panel" aria-busy={loading}>
              <button
                type="button"
                className={`practice-play-button${audio.status === 'playing' && audio.activeSound === 'target' ? ' is-playing' : ''}`}
                onClick={() => void playSound('target')}
                disabled={loading}
              >
                <span className="practice-play-icon" aria-hidden="true">
                  ▶︎
                </span>
                <span>{heard ? c.replay : c.listen}</span>
              </button>
              {audioStatus}
              {question.referenceEvents.length > 0 && (
                <p className="practice-listening-guide">{c.compareCopy}</p>
              )}
              <div className="practice-tools">
                {question.referenceEvents.length > 0 && (
                  <button
                    type="button"
                    className="practice-secondary"
                    disabled={loading}
                    onClick={() => void playSound('reference')}
                  >
                    {c.reference}
                  </button>
                )}
                {question.hintEvents.length > 0 && !decision && (
                  <button
                    type="button"
                    className="practice-secondary"
                    disabled={loading || !heard}
                    onClick={() => void playSound('hint')}
                  >
                    {c.hint}
                  </button>
                )}
                {(audio.status === 'playing' || loading) && (
                  <button
                    type="button"
                    className="practice-text-button"
                    onClick={stopSound}
                  >
                    {c.stop}
                  </button>
                )}
              </div>
              {usedHint && <p className="practice-hint-state">{c.hintUsed}</p>}
              {usedHint && !decision && (
                <p className="practice-hint-copy">
                  {text(question.hint, language)}
                </p>
              )}
            </div>
            <fieldset
              className="practice-answer-fieldset"
              disabled={!canAnswer}
            >
              <legend>{c.choose}</legend>
              <div className="practice-answers">
                {question.choices.map(choice => {
                  const chosen = decision?.selectedAnswer === choice.id;
                  const correct = !!decision && choice.id === question.answer;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      className={`practice-answer${chosen ? ' is-selected' : ''}${correct ? ' is-correct' : ''}${chosen && !correct ? ' is-incorrect' : ''}`}
                      aria-pressed={chosen}
                      onClick={() => record(choice.id, 'answer')}
                    >
                      <span>{text(choice.label, language)}</span>
                      {decision && (
                        <span
                          className="practice-answer-mark"
                          aria-hidden="true"
                        >
                          {correct ? '✓' : chosen ? '×' : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            {!decision ? (
              <div className="practice-question-actions">
                <button
                  type="button"
                  className="practice-text-button"
                  onClick={() => record(null, 'reveal')}
                >
                  {c.reveal}
                </button>
                <button
                  type="button"
                  className="practice-text-button"
                  onClick={() => record(null, 'skip')}
                >
                  {c.skip}
                </button>
              </div>
            ) : (
              <section
                className={`practice-feedback${decision.firstAttemptCorrect ? ' is-correct' : ''}`}
                aria-label={c.learning}
              >
                <h3 ref={feedback} tabIndex={-1}>
                  {decision.skipped
                    ? c.skipped
                    : decision.revealed
                      ? c.revealed
                      : decision.firstAttemptCorrect
                        ? decision.usedHint
                          ? c.assistedCorrect
                          : c.correct
                        : c.incorrect}
                </h3>
                <p className="practice-correct-answer">
                  {c.answer}{' '}
                  <strong>{text(question.answerLabel, language)}</strong>
                </p>
                {decision.selectedAnswer !== null &&
                  !decision.firstAttemptCorrect && (
                    <p className="practice-selected-answer">
                      {c.yourAnswer}{' '}
                      {text(
                        question.choices.find(
                          choice => choice.id === decision.selectedAnswer
                        )!.label,
                        language
                      )}
                    </p>
                  )}
                <p className="practice-explanation">
                  {text(question.explanation, language)}
                </p>
                <p className="practice-scoring-note">
                  {decision.selectedAnswer !== null
                    ? c.firstLocked
                    : c.unscored}
                </p>
                {question.referenceEvents.length > 0 && (
                  <div className="practice-comparison">
                    <button
                      type="button"
                      className="practice-secondary"
                      disabled={loading}
                      onClick={() => void playSound('comparison')}
                    >
                      {c.compare}
                    </button>
                    <p className="practice-copy">{c.compareCopy}</p>
                  </div>
                )}
                <button
                  type="button"
                  className="practice-primary practice-next"
                  onClick={nextQuestion}
                >
                  {index === SESSION_LENGTH - 1 ? c.finish : c.next}{' '}
                  <span aria-hidden="true">→</span>
                </button>
              </section>
            )}
          </section>
        </>
      )}
    </main>
  );
}
