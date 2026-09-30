import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Transport } from 'tone';
import {
  ArrowRightIcon,
  PlayIcon,
  StopIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import { getSamplerInstance } from '@utils/Tone/samplers';
import { useSoundSettingsStore } from '@stores/soundSettingsStore';
import {
  CHAPTERS,
  generateLessonExamples,
  getLesson,
  text,
  type Lesson,
  type LessonExample,
} from '../practice/model';
import usePracticeAudio from '../practice/usePracticeAudio';
import {
  getListeningPreferences,
  saveListeningPreferences,
} from '../practice/listeningPreferences';
import {
  buildLearningPlayback,
  bassRoute,
  chordMember,
  frameAtTime,
  keyboardRange,
  noteName,
  pitchClass,
  soundingNotes,
  targetPitchPair,
  type ChordStructure,
  type LearningFrame,
} from './lessonVisuals';
import './lessonExplainer.css';

const copy = {
  en: {
    back: 'The listening path',
    unavailable: 'This lesson isn’t here yet',
    sound: 'Hear it, see it',
    choose: 'Explore a sound',
    play: 'Play the example',
    stop: 'Stop sound',
    reference: 'Hear the key',
    detail: 'Hear the detail separately',
    loading: 'Preparing sound…',
    playing: 'Playing',
    paused: 'Sound paused',
    error: 'Sound couldn’t start. Tap play to try again.',
    fallback: 'Using the available instrument',
    volume: 'Volume',
    quiet: 'Keep your device volume low too',
    members: 'Inside the sound',
    bass: 'Bass',
    distance: 'Pitch distance',
    semitones: 'semitones',
    home: 'Home note',
    first: 'First pitch',
    second: 'Second pitch',
    same: 'Same pitch',
    up: 'up',
    down: 'down',
    keyboard: 'These are the pitches you hear',
    legend: 'Outlined: focus pitches · Filled: sounding now',
    sequence: 'Follow the sound',
    key: 'Key reference',
    example: 'Example',
    detailPhase: 'Separated detail',
    inspect: 'Inspect this moment',
    now: 'Sounding now',
    diagram: 'Pitch structure',
    compare: 'Hear the difference',
    compareWith: 'Compare with',
    together: 'Play both',
    fixed:
      'One key, the same instrument. Hear the selected sound first, then the comparison.',
    listen: 'Listen for it',
    practice: 'Take this relationship into listening practice',
    next: 'Continue along the path',
    note: 'Pitch names describe this example. The relationship still works when the whole example moves higher or lower.',
    voiced:
      'The lowest pitch is marked as bass. Root, third, fifth and seventh describe chord members, even when they move to another octave.',
    ear: 'Bring it back to your ear',
  },
  zh: {
    back: '聆听路线',
    unavailable: '暂时找不到这节课',
    sound: '听见，也看见',
    choose: '探索一个声音',
    play: '播放示例',
    stop: '停止声音',
    reference: '听调性',
    detail: '把细节拆开听',
    loading: '正在准备声音…',
    playing: '播放中',
    paused: '声音已暂停',
    error: '声音未能启动，点击播放重试。',
    fallback: '正在使用可用的音色',
    volume: '音量',
    quiet: '设备音量也请保持较低',
    members: '声音里面有什么',
    bass: '低音',
    distance: '音高距离',
    semitones: '个半音',
    home: '主音',
    first: '第一个音',
    second: '第二个音',
    same: '同一音高',
    up: '上行',
    down: '下行',
    keyboard: '这些就是听到的音高',
    legend: '描边：关注的音 · 填色：正在发声',
    sequence: '跟随声音的变化',
    key: '调性参考',
    example: '示例',
    detailPhase: '拆开的细节',
    inspect: '查看这一刻',
    now: '正在发声',
    diagram: '音高结构',
    compare: '听出它们的不同',
    compareWith: '对比',
    together: '连着听两个',
    fixed: '同一调性、同一音色。先听已选的声音，再听对比的声音。',
    listen: '去听辨这个声音',
    practice: '把这个关系带进专注的听辨练习',
    next: '沿着路线继续',
    note: '音名只说明这个示例。整段移高或移低时，音与音的关系仍然成立。',
    voiced:
      '实际最低音标为低音。根音、三音、五音、七音表示和弦成员，换到另一个八度后身份不变。',
    ear: '再回到耳朵里',
  },
};

const listeningIdea = {
  degree: {
    en: 'Echo the home note softly, or hold it in your mind. Replay the example without looking at the keys, and hear the single pitch against that home.',
    zh: '轻声模仿主音，或在心里保持它。重听示例时暂时不看琴键，把单音与记住的主音比较。',
  },
  interval: {
    en: 'Echo both pitches slowly. Keep the first in mind while hearing the second. The distance belongs to the pair, not to either pitch on its own.',
    zh: '慢慢轻唱这两个音。听第二个音时，在心里保持第一个音。音程属于两个音之间的关系，不能由单个音决定。',
  },
  triad: {
    en: 'Hear the complete chord, then unfold it. Hold the root in your mind while listening to the third and fifth; return to the whole sound afterward.',
    zh: '先听完整和弦，再逐音展开。听三音和五音时，在心里保持根音，之后再回到整体声音。',
  },
  inversion: {
    en: 'Listen beneath the upper voices. Echo the lowest pitch first, then hear which chord member it is. More space above the bass does not create a new inversion.',
    zh: '越过上方声部，先模仿最低音，再听它是哪个和弦成员。低音上方的空间变大，不会因此成为另一种转位。',
  },
  function: {
    en: 'Keep the key reference in your ear. Hear each root against the home note, then return to the full chord and its place in the key.',
    zh: '在耳朵里保持调性参考。把每个根音与主音比较，再听完整和弦在这个调性中的位置。',
  },
  seventh: {
    en: 'Hear the triad underneath, then listen to the seventh above its root. Compare two examples without changing the root, and find the member that changed.',
    zh: '先听底下的三和弦，再听根音上方的七音。保持相同根音比较两个示例，找到发生变化的成员。',
  },
  'seventh-inversion': {
    en: 'Find the lowest voice, then rebuild the chord from the root. All four members remain; inversion names the member at the bottom.',
    zh: '先找到最低声部，再从根音重建和弦。四个成员仍然保留，转位名称由最低的成员决定。',
  },
  'bass-motion': {
    en: 'Follow only the bottom voice through both chords. Compare it with the bass-only detail, then hear the same line inside the full harmony.',
    zh: '在两个和弦之间只跟随最下方声部。与单独的低音线比较，再听同一条线如何藏在完整和声里。',
  },
  cadence: {
    en: 'Listen through the phrase instead of naming one isolated chord. Hear the final two chords again, then replay the whole phrase and notice where it lands.',
    zh: '跟随整个乐句，不只给某个孤立和弦命名。再听最后两个和弦，然后重听全句，留意它最终落在哪里。',
  },
  progression: {
    en: 'Follow the roots first, then the complete chords. Keep the home chord in mind and hear the route away from it and back toward it.',
    zh: '先跟随根音，再听完整和弦。在心里保持主和弦，听它如何离开主音、又朝主音回来。',
  },
};

export default function LessonExplainer({ lessonId }: { lessonId?: string }) {
  const params = useParams();
  const { i18n } = useTranslation();
  const zh = i18n.language.startsWith('zh');
  const lesson = getLesson(lessonId ?? params.lessonId ?? '');
  if (!lesson)
    return (
      <main className="music-unavailable">
        <h1>{copy[zh ? 'zh' : 'en'].unavailable}</h1>
        <Link to="/learn" className="music-primary">
          {copy[zh ? 'zh' : 'en'].back}
        </Link>
      </main>
    );
  return <Explanation key={lesson.id} lesson={lesson} />;
}

function Explanation({ lesson }: { lesson: Lesson }) {
  const { i18n } = useTranslation();
  const zh = i18n.language.startsWith('zh');
  const language = zh ? 'zh' : 'en';
  const c = copy[language];
  const location = useLocation();
  const chapter = CHAPTERS.find(item => item.id === lesson.chapterId);
  const ordered = CHAPTERS.flatMap(item => item.lessonIds);
  const next = getLesson(ordered[ordered.indexOf(lesson.id) + 1] ?? '');
  const examples = useMemo(
    () => generateLessonExamples(lesson.id),
    [lesson.id]
  );
  const [selected, setSelected] = useState(0);
  const [compareId, setCompareId] = useState(examples[1]?.choice.id ?? '');
  const [playback, setPlayback] = useState(() =>
    buildLearningPlayback(lesson, [examples[0]])
  );
  const [inspected, setInspected] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [volume, setVolume] = useState(() => getListeningPreferences().volume);
  const request = useRef(0);
  const audio = usePracticeAudio(`${location.key}:${lesson.id}`);
  const loadError = useSoundSettingsStore(state => state.instrumentLoadError);
  const busy = audio.status === 'loading' || audio.status === 'playing';
  const example = examples[selected];
  const comparison =
    examples.find(
      item =>
        item.choice.id === compareId && item.choice.id !== example.choice.id
    ) ?? examples.find(item => item.choice.id !== example.choice.id);

  useEffect(() => {
    getSamplerInstance().setVolume(volume);
    saveListeningPreferences({ volume });
  }, [volume]);
  useEffect(() => {
    if (audio.status !== 'playing') {
      setElapsed(null);
      return;
    }
    let raf = 0;
    let previous = -1;
    const tick = () => {
      // Transport is the audio engine's clock, including actual sample-loading delay.
      const seconds = Number(Transport.seconds);
      if (seconds - previous >= 1 / 30 || seconds < previous) {
        setElapsed(seconds);
        previous = seconds;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [audio.status, playback]);

  const stop = () => {
    request.current++;
    audio.stop();
    setElapsed(null);
  };
  const play = async (
    items: LessonExample[],
    mode: 'example' | 'detail' | 'reference' = 'example'
  ) => {
    const revision = ++request.current;
    const nextPlayback = buildLearningPlayback(lesson, items, mode);
    setPlayback(nextPlayback);
    setInspected(null);
    setElapsed(null);
    const started = await audio.play(
      nextPlayback.events,
      items.length > 1
        ? 'comparison'
        : mode === 'detail'
          ? 'hint'
          : mode === 'reference'
            ? 'reference'
            : 'example'
    );
    if (revision !== request.current || !started) return;
  };
  const selectExample = (index: number) => {
    stop();
    setSelected(index);
    setPlayback(buildLearningPlayback(lesson, [examples[index]]));
    setInspected(null);
    void play([examples[index]]);
  };

  const activeFrames =
    elapsed === null
      ? []
      : playback.frames.filter(
          frame =>
            elapsed >= frame.time && elapsed < frame.time + frame.duration
        );
  const activeFrame = activeFrames[activeFrames.length - 1];
  const previewFrame =
    playback.frames.find(frame => frame.id === inspected) ??
    playback.frames.find(frame => frame.phase !== 'reference') ??
    playback.frames[0];
  const frame =
    elapsed === null
      ? previewFrame
      : (frameAtTime(playback.frames, elapsed) ?? previewFrame);
  const currentExample = frame?.example ?? example;
  const activeNotes =
    elapsed === null ? [] : soundingNotes(playback.events, elapsed);
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
  const targetNotes = [
    ...new Set(currentExample.events.map(event => event.note)),
  ].sort((a, b) => a - b);
  const structure =
    frame?.phase === 'reference'
      ? frame.structure
      : lesson.type === 'degree'
        ? [...new Set([currentExample.tonic, ...targetNotes])].sort(
            (a, b) => a - b
          )
        : lesson.id === 'intervals-context'
          ? [...new Set(targetPitchPair(lesson, currentExample))].sort(
              (a, b) => a - b
            )
          : lesson.type === 'interval'
            ? targetNotes
            : (frame?.structure ?? targetNotes);
  const notesForKeys = [
    ...new Set([
      ...playback.events.map(event => event.note),
      ...(lesson.type === 'degree' ? [example.tonic] : []),
    ]),
  ];
  const groups = (['reference', 'example', 'detail'] as const)
    .map(phase => ({
      phase,
      frames: playback.frames.filter(item => item.phase === phase),
    }))
    .filter(group => group.frames.length);

  return (
    <main className="lesson-explainer">
      <header className="lesson-heading">
        <Link to="/learn" onClick={stop} className="music-back">
          ← {c.back}
        </Link>
        <p className="music-eyebrow">
          {chapter && text(chapter.title, language)}
        </p>
        <h1>{text(lesson.title, language)}</h1>
        <p className="lesson-intro">{text(lesson.instruction, language)}</p>
      </header>

      <section className="lesson-sound" aria-labelledby="lesson-sound-heading">
        <div className="lesson-sound-heading">
          <h2 id="lesson-sound-heading">{c.sound}</h2>
          <span>{c.choose}</span>
        </div>
        <div className="lesson-example-choices" aria-label={c.choose}>
          {examples.map((item, index) => (
            <button
              type="button"
              key={item.choice.id}
              aria-pressed={selected === index}
              onClick={() => selectExample(index)}
            >
              <PlayIcon aria-hidden="true" />
              <span>{text(item.choice.label, language)}</span>
            </button>
          ))}
        </div>

        <div className="lesson-sound-layout">
          <div className="lesson-visual">
            <div className="lesson-visual-title">
              <span>
                {frame?.phase === 'reference'
                  ? c.key
                  : text(currentExample.choice.label, language)}
              </span>
              <small>{activeFrame ? c.now : c.diagram}</small>
            </div>
            <PitchDiagram
              lesson={lesson}
              example={currentExample}
              frame={frame}
              notes={structure}
              activeNotes={activeNotes}
              zh={zh}
            />
            <Piano
              notes={notesForKeys}
              structure={structure}
              activeNotes={activeNotes}
              chord={frame?.chord}
              zh={zh}
            />
            <p className="lesson-visual-legend">{c.legend}</p>
          </div>
          <div className="lesson-sound-copy">
            <h3>{text(currentExample.choice.label, language)}</h3>
            <p>{text(currentExample.explanation, language)}</p>
            <div className="lesson-play-controls">
              <button
                className="music-primary"
                type="button"
                onClick={() => (busy ? stop() : void play([example]))}
              >
                {busy ? (
                  <StopIcon aria-hidden="true" />
                ) : (
                  <PlayIcon aria-hidden="true" />
                )}
                {busy ? c.stop : c.play}
              </button>
              <button
                className="lesson-detail-button"
                type="button"
                onClick={() => void play([example], 'detail')}
              >
                <SpeakerWaveIcon aria-hidden="true" />
                {c.detail}
              </button>
              {example.referenceEvents.length > 0 && (
                <button
                  className="lesson-detail-button"
                  type="button"
                  onClick={() => void play([example], 'reference')}
                >
                  {c.reference}
                </button>
              )}
            </div>
            <div
              className="lesson-audio-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <span>{status}</span>
              {loadError && <span>{c.fallback}</span>}
            </div>
            <p className="lesson-caption">{frame?.chord ? c.voiced : c.note}</p>
          </div>
        </div>

        <div className="lesson-sequence" aria-label={c.sequence}>
          {groups.map(group => (
            <div className="lesson-sequence-group" key={group.phase}>
              <span className="lesson-sequence-label">
                {group.phase === 'reference'
                  ? c.key
                  : group.phase === 'detail'
                    ? c.detailPhase
                    : c.example}
              </span>
              <div className="lesson-frame-list">
                {group.frames.map(item => (
                  <button
                    type="button"
                    key={item.id}
                    className={`${activeFrames.some(active => active.id === item.id) ? 'is-sounding' : ''} ${frame?.id === item.id ? 'is-inspected' : ''}`}
                    aria-label={`${c.inspect}: ${item.symbol}, ${item.notes.map(note => noteName(note, item.chord, true)).join(', ')}`}
                    aria-pressed={frame?.id === item.id}
                    onClick={() => {
                      stop();
                      setInspected(item.id);
                    }}
                  >
                    <span>{item.symbol}</span>
                    <small>
                      {item.notes
                        .map(note => noteName(note, item.chord))
                        .join(' · ')}
                    </small>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="lesson-volume">
          <label htmlFor="lesson-volume">
            <SpeakerWaveIcon aria-hidden="true" />
            {c.volume}
          </label>
          <input
            id="lesson-volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            aria-valuetext={`${Math.round(volume * 100)}%`}
            onChange={event => setVolume(Number(event.currentTarget.value))}
          />
          <small>{c.quiet}</small>
        </div>
      </section>

      <section
        className="lesson-comparison"
        aria-labelledby="lesson-comparison-heading"
      >
        <div>
          <h2 id="lesson-comparison-heading">{c.compare}</h2>
          <p>{c.fixed}</p>
        </div>
        <div className="lesson-comparison-controls">
          <label htmlFor="lesson-compare">
            {text(example.choice.label, language)}
            <span aria-hidden="true"> ↔ </span>
            <span className="sr-only">{c.compareWith}</span>
          </label>
          <select
            id="lesson-compare"
            value={comparison?.choice.id ?? ''}
            onChange={event => {
              stop();
              setCompareId(event.currentTarget.value);
            }}
          >
            {examples
              .filter(item => item.choice.id !== example.choice.id)
              .map(item => (
                <option key={item.choice.id} value={item.choice.id}>
                  {text(item.choice.label, language)}
                </option>
              ))}
          </select>
          <button
            type="button"
            className="music-secondary"
            disabled={!comparison}
            onClick={() => comparison && void play([example, comparison])}
          >
            <PlayIcon aria-hidden="true" />
            {c.together}
          </button>
        </div>
      </section>

      <section className="lesson-ear">
        <span className="lesson-ear-mark" aria-hidden="true">
          ♪
        </span>
        <div>
          <h2>{c.ear}</h2>
          <p>{text(listeningIdea[lesson.type], language)}</p>
        </div>
      </section>

      <footer className="lesson-next">
        <div>
          <p>{c.practice}</p>
          <Link
            onClick={stop}
            to={`/practice/${lesson.id}`}
            className="music-primary"
          >
            {c.listen}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </div>
        {next && (
          <Link
            onClick={stop}
            to={`/learn/${next.id}`}
            className="lesson-next-topic"
          >
            <small>{c.next}</small>
            <span>
              {text(next.title, language)}
              <ArrowRightIcon aria-hidden="true" />
            </span>
          </Link>
        )}
      </footer>
    </main>
  );
}

function PitchDiagram({
  lesson,
  example,
  frame,
  notes,
  activeNotes,
  zh,
}: {
  lesson: Lesson;
  example: LessonExample;
  frame?: LearningFrame;
  notes: number[];
  activeNotes: number[];
  zh: boolean;
}) {
  const c = copy[zh ? 'zh' : 'en'];
  const chord = frame?.chord;
  const linear =
    frame?.phase !== 'reference' &&
    (lesson.type === 'interval' || lesson.type === 'degree');
  if (linear) {
    const [first, last] = targetPitchPair(lesson, example);
    const distance = Math.abs(last - first);
    const direction = last === first ? c.same : last > first ? c.up : c.down;
    const low = Math.min(first, last);
    return (
      <div className="lesson-distance-diagram">
        <div className="lesson-distance-pitches">
          <span>
            <small>
              {lesson.type === 'degree'
                ? c.home
                : lesson.id === 'intervals-context'
                  ? zh
                    ? '倒数第二个音'
                    : 'Penultimate pitch'
                  : c.first}
            </small>
            <strong>{noteName(first, undefined, true)}</strong>
          </span>
          <span className="lesson-distance-value">
            <strong>{distance}</strong>
            <small>
              {c.semitones} · {direction}
            </small>
          </span>
          <span>
            <small>
              {lesson.type === 'degree'
                ? text(example.choice.label, zh ? 'zh' : 'en')
                : lesson.id === 'intervals-context'
                  ? zh
                    ? '最后一个音'
                    : 'Last pitch'
                  : c.second}
            </small>
            <strong>{noteName(last, undefined, true)}</strong>
          </span>
        </div>
        <div
          className="lesson-semitone-rail"
          style={{ '--steps': distance + 1 } as React.CSSProperties}
          aria-label={`${c.distance}: ${distance} ${c.semitones}`}
        >
          {Array.from({ length: distance + 1 }, (_, index) => low + index).map(
            (note, index) => (
              <span
                key={index}
                className={`${index === 0 || index === distance ? 'is-endpoint' : ''} ${activeNotes.includes(note) ? 'is-sounding' : ''}`}
              >
                <i />
                <small>{index}</small>
              </span>
            )
          )}
        </div>
        <p className="lesson-diagram-note">
          {distance === 0
            ? c.same
            : zh
              ? '相邻两个点相距一个半音'
              : 'Each neighboring dot is one semitone apart'}
        </p>
      </div>
    );
  }
  const low = Math.min(...notes);
  const high = Math.max(...notes);
  const span = Math.max(7, high - low);
  const bass = Math.min(...notes);
  const basses =
    lesson.type === 'bass-motion' && frame?.phase !== 'reference'
      ? bassRoute(example)
      : [];
  const motion = basses.length > 1 ? basses[basses.length - 1] - basses[0] : 0;
  return (
    <>
      {basses.length > 1 && (
        <div className="lesson-bass-route">
          <small>{c.bass}</small>
          <strong>
            {basses.map(note => noteName(note, undefined, true)).join(' → ')}
          </strong>
          <span>
            {motion === 0
              ? c.same
              : `${Math.abs(motion)} ${c.semitones} · ${motion > 0 ? c.up : c.down}`}
          </span>
        </div>
      )}
      <div className="lesson-chord-diagram">
        <svg
          viewBox="0 0 240 190"
          role="img"
          aria-label={`${chord?.symbol ?? frame?.symbol ?? ''}: ${notes.map(note => `${noteName(note, chord, true)}${note === bass ? ` (${c.bass})` : ''}`).join(', ')}`}
        >
          <line
            className="lesson-pitch-axis"
            x1="61"
            y1="24"
            x2="61"
            y2="160"
          />
          {notes.map(note => {
            const y = 156 - ((note - low) / span) * 122;
            return (
              <g
                key={note}
                className={activeNotes.includes(note) ? 'is-sounding' : ''}
              >
                <line
                  className="lesson-pitch-guide"
                  x1="60"
                  y1={y}
                  x2="180"
                  y2={y}
                />
                <ellipse
                  className="lesson-pitch-note"
                  cx="62"
                  cy={y}
                  rx="11"
                  ry="8"
                  transform={`rotate(-18 62 ${y})`}
                />
                <text x="84" y={y + 5} className="lesson-pitch-name">
                  {noteName(note, chord, true)}
                </text>
                <text x="150" y={y + 5} className="lesson-pitch-member">
                  {chord ? chordMember(note, chord, zh) : ''}
                  {note === bass ? ` · ${c.bass}` : ''}
                </text>
              </g>
            );
          })}
          <text x="61" y="182" className="lesson-pitch-bottom">
            {chord?.symbol ?? frame?.symbol}
          </text>
        </svg>
        <div className="lesson-member-list" aria-label={c.members}>
          {notes.map(note => (
            <div
              key={note}
              className={activeNotes.includes(note) ? 'is-sounding' : ''}
            >
              <span>
                {chord ? chordMember(note, chord, zh) : noteName(note)}
              </span>
              <strong>{noteName(note, chord)}</strong>
              <small>
                {chord
                  ? `${pitchClass(note - chord.root)} ${c.semitones}`
                  : note === bass
                    ? c.bass
                    : ''}
              </small>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Piano({
  notes,
  structure,
  activeNotes,
  chord,
  zh,
}: {
  notes: number[];
  structure: number[];
  activeNotes: number[];
  chord?: ChordStructure;
  zh: boolean;
}) {
  const c = copy[zh ? 'zh' : 'en'];
  const keys = keyboardRange(notes);
  const isBlack = (note: number) => [1, 3, 6, 8, 10].includes(pitchClass(note));
  const whites = keys.filter(note => !isBlack(note));
  const bass = Math.min(...structure);
  return (
    <div
      className="lesson-piano"
      role="img"
      aria-label={`${c.keyboard}: ${structure.map(note => noteName(note, chord, true)).join(', ')}`}
    >
      <div className="lesson-white-keys">
        {whites.map(note => (
          <span
            key={note}
            className={`lesson-piano-key ${structure.includes(note) ? 'is-example' : ''} ${activeNotes.includes(note) ? 'is-sounding' : ''}`}
          >
            <i>{note === bass && structure.length > 2 ? '●' : ''}</i>
            <small>
              {structure.includes(note) || pitchClass(note) === 0
                ? noteName(note, chord)
                : ''}
            </small>
          </span>
        ))}
      </div>
      <div className="lesson-black-keys" aria-hidden="true">
        {keys.filter(isBlack).map(note => (
          <span
            key={note}
            style={{
              left: `${(whites.filter(white => white < note).length / whites.length) * 100}%`,
              width: `${58 / whites.length}%`,
            }}
            className={`lesson-piano-key ${structure.includes(note) ? 'is-example' : ''} ${activeNotes.includes(note) ? 'is-sounding' : ''}`}
          >
            <i>{note === bass && structure.length > 2 ? '●' : ''}</i>
            <small>
              {structure.includes(note) ? noteName(note, chord) : ''}
            </small>
          </span>
        ))}
      </div>
    </div>
  );
}
