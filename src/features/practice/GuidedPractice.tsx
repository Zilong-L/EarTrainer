import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PlayIcon,
  StopIcon,
  ArrowRightIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import { useSoundSettingsStore } from '@stores/soundSettingsStore';
import { getSamplerInstance } from '@utils/Tone/samplers';
import {
  generateComparisonExample,
  generateQuestion,
  getLesson,
  text,
  type Lesson,
  type PracticeEvent,
  type PracticeQuestion,
} from './model';
import usePracticeAudio, { type PracticeSound } from './usePracticeAudio';
import {
  getListeningPreferences,
  saveListeningPreferences,
} from './listeningPreferences';

const copy = {
  en: {
    back: 'The listening path',
    unavailable: 'This sound isn’t here yet',
    play: 'Play',
    replay: 'Listen again',
    stop: 'Stop',
    loading: 'Preparing sound…',
    playing: 'Listening',
    paused: 'Paused',
    error: 'Sound couldn’t start. Tap play to try again.',
    fallback: 'Using the available instrument',
    volume: 'Volume',
    quiet: 'Keep your device volume low too',
    tonic: 'Hear the key',
    hint: 'Hear the detail',
    reveal: 'Hear the answer',
    skip: 'Another sound',
    next: 'Continue',
    learn: 'Explore this sound',
    answer: 'Listen for',
    selected: 'You heard',
    correct: 'Yes',
    contrast: 'Compare with',
    actual: 'The sound',
    compare: 'Hear both',
    initial: 'Listen, then find the sound',
  },
  zh: {
    back: '聆听路线',
    unavailable: '暂时找不到这个声音',
    play: '播放',
    replay: '再听一次',
    stop: '停止',
    loading: '正在准备声音…',
    playing: '聆听中',
    paused: '已暂停',
    error: '声音未能启动，点击播放重试。',
    fallback: '正在使用可用的音色',
    volume: '音量',
    quiet: '设备音量也请保持较低',
    tonic: '听调性',
    hint: '拆开听',
    reveal: '听答案',
    skip: '换一个声音',
    next: '继续',
    learn: '理解这个声音',
    answer: '听听',
    selected: '你听成了',
    correct: '对',
    contrast: '对比',
    actual: '这个声音',
    compare: '连着听',
    initial: '先听，再找到这个声音',
  },
};

/** Context and target stay together, including when replayed or contrasted. */
function comparisonEvents(
  question: Pick<PracticeQuestion, 'events' | 'referenceEvents'>
): PracticeEvent[] {
  if (!question.referenceEvents.length) return [...question.events];
  const referenceEnd = Math.max(
    ...question.referenceEvents.map(event => event.time + event.duration)
  );
  return [
    ...question.referenceEvents,
    ...question.events.map(event => ({
      ...event,
      time: event.time + referenceEnd + 0.45,
    })),
  ];
}

export default function GuidedPractice({ lessonId }: { lessonId?: string }) {
  const params = useParams();
  const { i18n } = useTranslation();
  const language = i18n.language?.startsWith('zh') ? 'zh' : 'en';
  const selectedId = lessonId ?? params.lessonId ?? params.lesson;
  const lesson = getLesson(selectedId ?? 'degrees-core');
  if (!lesson)
    return (
      <main className="music-unavailable">
        <h1>{copy[language].unavailable}</h1>
        <Link className="music-primary" to="/learn">
          {copy[language].back}
        </Link>
      </main>
    );
  return <ListeningRoom key={lesson.id} lesson={lesson} />;
}

function ListeningRoom({ lesson }: { lesson: Lesson }) {
  const { i18n } = useTranslation();
  const language = i18n.language?.startsWith('zh') ? 'zh' : 'en';
  const c = copy[language];
  const location = useLocation();
  const [question, setQuestion] = useState(() => generateQuestion(lesson.id));
  const [heard, setHeard] = useState(false);
  const [decision, setDecision] = useState<{ selected: string | null } | null>(
    null
  );
  const [volume, setVolume] = useState(() => getListeningPreferences().volume);
  const audio = usePracticeAudio(`${location.key}:${lesson.id}`);
  const instrumentLoadError = useSoundSettingsStore(
    state => state.instrumentLoadError
  );
  const heardRef = useRef(false);
  const decisionRef = useRef<{ selected: string | null } | null>(null);
  const requestRef = useRef(0);
  const loadingRef = useRef(false);
  const advanceRef = useRef(false);
  const revision = useRef(0);
  const busy = audio.status === 'loading' || audio.status === 'playing';
  const canAnswer = heard && audio.status !== 'loading' && !decision;

  useEffect(() => {
    getSamplerInstance().setVolume(volume);
    saveListeningPreferences({ volume, lastLessonId: lesson.id });
  }, [volume, lesson.id]);
  useEffect(() => {
    advanceRef.current = false;
  }, [question.id]);

  const stopSound = () => {
    requestRef.current++;
    loadingRef.current = false;
    audio.stop();
  };
  const playSound = async (
    sound: PracticeSound = 'target',
    events?: PracticeEvent[],
    target: PracticeQuestion = question
  ) => {
    const request = ++requestRef.current;
    loadingRef.current = true;
    const notes =
      events ??
      (sound === 'reference'
        ? target.referenceEvents
        : sound === 'hint'
          ? target.hintEvents
          : comparisonEvents(target));
    const played = await audio.play(notes, sound, () => {
      if (request !== requestRef.current) return;
      if (sound === 'target') {
        heardRef.current = true;
        setHeard(true);
      }
    });
    if (request !== requestRef.current) return;
    loadingRef.current = false;
    if (!played) return;
  };
  const choose = (selected: string | null) => {
    if (decisionRef.current || advanceRef.current) return;
    if (selected !== null && (!heardRef.current || loadingRef.current)) return;
    stopSound();
    const next = { selected };
    decisionRef.current = next;
    setDecision(next);
  };
  const nextSound = () => {
    if (advanceRef.current) return;
    advanceRef.current = true;
    stopSound();
    const next = {
      ...generateQuestion(lesson.id),
      id: `listen-${++revision.current}-${Math.random().toString(36).slice(2)}`,
    };
    heardRef.current = false;
    decisionRef.current = null;
    setHeard(false);
    setDecision(null);
    setQuestion(next);
    void playSound('target', undefined, next);
  };
  const status =
    audio.status === 'loading'
      ? c.loading
      : audio.status === 'playing'
        ? c.playing
        : audio.status === 'paused'
          ? c.paused
          : audio.status === 'error'
            ? c.error
            : '';
  const selectedLabel = question.choices.find(
    item => item.id === decision?.selected
  )?.label;
  const correct = decision?.selected === question.answer;
  const contrast =
    decision?.selected && !correct
      ? generateComparisonExample(question, decision.selected)
      : undefined;
  const playBoth = () => {
    if (!contrast) return;
    const first = comparisonEvents(question);
    const second = comparisonEvents(contrast);
    const end = Math.max(...first.map(event => event.time + event.duration));
    void playSound('comparison', [
      ...first,
      ...second.map(event => ({ ...event, time: event.time + end + 0.7 })),
    ]);
  };

  return (
    <main className="music-room">
      <header className="music-room-heading">
        <Link to="/learn" onClick={stopSound} className="music-back">
          ← {c.back}
        </Link>
        <h1>{text(lesson.title, language)}</h1>
        <p>{text(lesson.description, language)}</p>
      </header>
      <section
        className="music-listening-space"
        aria-label={text(lesson.title, language)}
      >
        <div className="music-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="music-play-area">
          <button
            type="button"
            className="music-play"
            aria-label={busy ? c.stop : heard ? c.replay : c.play}
            onClick={() => (busy ? stopSound() : void playSound())}
          >
            {busy ? (
              <StopIcon aria-hidden="true" />
            ) : (
              <PlayIcon aria-hidden="true" />
            )}
          </button>
          <span className="music-play-label" aria-hidden="true">
            {busy ? c.stop : heard ? c.replay : c.play}
          </span>
        </div>
        <div
          className="music-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{status}</span>
          {instrumentLoadError && <span>{c.fallback}</span>}
        </div>
        <fieldset className="music-choices" disabled={!canAnswer}>
          <legend>{text(question.prompt, language)}</legend>
          <div
            className={`music-choice-grid ${question.choices.length > 4 ? 'music-choice-grid-wide' : ''}`}
          >
            {question.choices.map(item => (
              <button
                key={item.id}
                type="button"
                className={`music-choice ${decision && item.id === question.answer ? 'is-correct' : ''} ${decision?.selected === item.id && !correct ? 'is-selected' : ''}`}
                onClick={() => choose(item.id)}
              >
                <span>{text(item.label, language)}</span>
                {decision && item.id === question.answer && (
                  <span className="music-choice-mark" aria-label={c.actual}>
                    ✓
                  </span>
                )}
                {decision?.selected === item.id && !correct && (
                  <span className="music-choice-mark" aria-label={c.selected}>
                    ○
                  </span>
                )}
              </button>
            ))}
          </div>
        </fieldset>
        {decision ? (
          <div className="music-response" role="status" aria-live="polite">
            <p>
              {correct
                ? `${c.correct} · ${text(question.answerLabel, language)}`
                : `${c.answer} ${text(question.answerLabel, language)}`}
            </p>
            {selectedLabel && !correct && (
              <span>
                {c.selected} {text(selectedLabel, language)}
              </span>
            )}
            <div className="music-response-actions">
              <button
                type="button"
                className="music-secondary"
                onClick={() => void playSound('comparison')}
              >
                <SpeakerWaveIcon aria-hidden="true" />
                {text(question.answerLabel, language)}
              </button>
              {contrast && (
                <button
                  type="button"
                  className="music-secondary"
                  onClick={() =>
                    void playSound('comparison', comparisonEvents(contrast))
                  }
                >
                  <SpeakerWaveIcon aria-hidden="true" />
                  {text(contrast.choice.label, language)}
                </button>
              )}
              {contrast && (
                <button
                  type="button"
                  className="music-secondary music-compare-both"
                  onClick={playBoth}
                >
                  {c.compare}
                </button>
              )}
              <button
                type="button"
                className="music-primary"
                onClick={nextSound}
              >
                {c.next} <ArrowRightIcon aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <div className="music-quiet-actions">
            <button type="button" onClick={() => choose(null)}>
              {c.reveal}
            </button>
            <button type="button" onClick={nextSound}>
              {c.skip} →
            </button>
          </div>
        )}
      </section>
      <div className="music-room-tools">
        <Link
          to={`/learn/${lesson.id}`}
          className="music-learn-link"
          onClick={stopSound}
        >
          {c.learn} <ArrowRightIcon aria-hidden="true" />
        </Link>
      </div>
      <div className="music-volume">
        <label htmlFor="listening-volume">
          <SpeakerWaveIcon aria-hidden="true" />
          <span>{c.volume}</span>
        </label>
        <input
          id="listening-volume"
          aria-valuetext={`${Math.round(volume * 100)}%`}
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={event => setVolume(Number(event.currentTarget.value))}
        />
        <small>{c.quiet}</small>
      </div>
    </main>
  );
}
