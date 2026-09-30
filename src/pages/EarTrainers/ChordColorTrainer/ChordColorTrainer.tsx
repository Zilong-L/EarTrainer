import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Cog6ToothIcon,
  SpeakerWaveIcon,
  PlayIcon,
  StopIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';
import { Note } from 'tonal';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@components/LanguageSwitcher';
import useI18nStore from '@stores/i18nStore';
import useChordColorTrainerSettingsStore from '@stores/chordColorTrainerSettingsStore';
import { useSoundSettingsStore } from '@stores/soundSettingsStore';
import useChordColorTrainer from './useChordColorTrainer';
import ChordColorTrainerSettings from './Settings';
import CardStack from './CardStack';
import MIDIInputHandler from './MIDIInputHandler';
import type { InversionMode, BackingMode } from './musicTheory';
import './chordLab.css';

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export default function ChordColorTrainer() {
  const { t } = useTranslation('chordColorTrainer');
  const setNamespace = useI18nStore(state => state.setNamespace);
  const settings = useChordColorTrainerSettingsStore();
  const { selectedInstrument, isLoadingInstrument, changeInstrument } =
    useSoundSettingsStore();
  const trainer = useChordColorTrainer(settings.chordPlayOption);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [midiEnabled, setMidiEnabled] = useState(false);
  const {
    currentChord,
    disabledChords,
    gameStarted,
    filteredChords,
    setActiveChord,
    startGame,
    advanceGame,
    playChordColorPattern,
    playChord,
    playTonic,
    playBass,
    isAdvance,
    activeNotes,
    setActiveNotes,
    stopPlayback,
    revealAnswer,
    wasRevealed,
    session,
    lastGuess,
    isPlaying,
    bassPitchClass,
  } = trainer;
  const ready = Boolean(currentChord) && !isLoadingInstrument;
  const answered = gameStarted && isAdvance !== 'No';

  useEffect(() => {
    setNamespace('chordColorTrainer');
  }, [setNamespace]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        isSettingsOpen ||
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        target.closest('input, select, textarea, button, a, [contenteditable]')
      )
        return;
      if (event.key === 'Escape') stopPlayback();
      if (!ready) return;
      if (event.code === 'Space') {
        event.preventDefault();
        void (gameStarted ? playChordColorPattern() : startGame());
      } else if (gameStarted && event.key.toLowerCase() === 'n')
        void advanceGame();
      else if (gameStarted && event.key.toLowerCase() === 'b') void playBass();
      else if (event.key.toLowerCase() === 't') void playTonic();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    isSettingsOpen,
    ready,
    gameStarted,
    startGame,
    playChordColorPattern,
    advanceGame,
    playBass,
    playTonic,
    stopPlayback,
  ]);

  const openSettings = () => {
    stopPlayback();
    setIsSettingsOpen(true);
  };
  const applyListeningChange = (change: () => void) => {
    stopPlayback();
    change();
  };
  const accuracy = session.answered
    ? Math.round((session.correct / session.answered) * 100)
    : 0;
  return (
    <div className="chord-lab">
      <header className="chord-lab-header">
        <Link to="/ear-trainer" className="chord-lab-back">
          ← {t('training.allTrainers')}
        </Link>
        <div className="chord-lab-header-actions">
          <LanguageSwitcher />
          <button
            type="button"
            className="chord-lab-icon"
            onClick={openSettings}
            aria-label={t('app.settings')}
            title={t('app.settings')}
          >
            <Cog6ToothIcon />
          </button>
        </div>
      </header>
      <main className="chord-lab-main">
        <section className="chord-lab-heading">
          <div>
            <p className="chord-lab-eyebrow">{t('training.eyebrow')}</p>
            <h1>{t('training.title')}</h1>
            <p>{t('training.subtitle')}</p>
          </div>
          <div className="chord-lab-score" aria-label={t('training.session')}>
            <div>
              <strong>
                {session.correct}
                <small> / {session.answered}</small>
              </strong>
              <span>{t('training.firstTry')}</span>
            </div>
            <div>
              <strong>
                {accuracy}
                <small>%</small>
              </strong>
              <span>{t('training.accuracy')}</span>
            </div>
            <div>
              <strong>{session.streak}</strong>
              <span>{t('training.streak')}</span>
            </div>
          </div>
        </section>

        <section
          className="chord-lab-setup"
          aria-label={t('training.practiceSetup')}
        >
          <label>
            {t('training.practiceSet')}
            <select
              value={
                ['大调', '小调', '基础色彩'].includes(settings.preset)
                  ? settings.preset
                  : 'custom'
              }
              onChange={event =>
                event.target.value === 'custom'
                  ? openSettings()
                  : settings.setPreset(event.target.value)
              }
            >
              <option value="基础色彩">{t('training.basicColors')}</option>
              <option value="大调">{t('training.majorFunctions')}</option>
              <option value="小调">{t('training.minorFunctions')}</option>
              <option value="custom">{t('training.customSet')}</option>
            </select>
          </label>
          <label>
            {t('training.tonic')}
            <select
              value={Note.pitchClass(settings.rootNote)}
              onChange={event => settings.setRootNote(`${event.target.value}3`)}
            >
              {KEYS.map(key => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
              {!KEYS.includes(Note.pitchClass(settings.rootNote)) && (
                <option value={Note.pitchClass(settings.rootNote)}>
                  {Note.pitchClass(settings.rootNote)}
                </option>
              )}
            </select>
          </label>
          <label>
            {t('training.sound')}
            <select
              value={selectedInstrument}
              disabled={isLoadingInstrument}
              onChange={event => {
                stopPlayback();
                void changeInstrument(event.target.value, 'medium');
              }}
            >
              <option value="piano">{t('training.piano')}</option>
              <option value="guitar-nylon">{t('training.guitar')}</option>
              <option value="triangle">{t('training.softSynth')}</option>
              {!['piano', 'guitar-nylon', 'triangle'].includes(
                selectedInstrument
              ) && (
                <option value={selectedInstrument}>{selectedInstrument}</option>
              )}
            </select>
          </label>
          <label>
            {t('training.pattern')}
            <select
              value={settings.chordPlayOption}
              onChange={event =>
                applyListeningChange(() =>
                  settings.setChordPlayOption(event.target.value)
                )
              }
            >
              {['block', 'ascending', 'descending', 'default', 'random'].map(
                pattern => (
                  <option key={pattern} value={pattern}>
                    {t(`training.patterns.${pattern}`)}
                  </option>
                )
              )}
            </select>
          </label>
        </section>

        <section
          className="chord-lab-listening"
          aria-label={t('training.listenSettings')}
        >
          <label>
            {t('training.voicing')}
            <select
              value={settings.inversionMode}
              onChange={event =>
                settings.setInversionMode(event.target.value as InversionMode)
              }
            >
              {['root', 'first', 'second', 'random'].map(mode => (
                <option key={mode} value={mode}>
                  {t(`training.inversions.${mode}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="chord-lab-toggle">
            <input
              type="checkbox"
              checked={settings.bassEnabled}
              onChange={event =>
                applyListeningChange(() =>
                  settings.setBassEnabled(event.target.checked)
                )
              }
            />
            <span>
              {t('training.bassSupport')}
              <small>{t('training.bassHint')}</small>
            </span>
          </label>
          <label>
            {t('training.context')}
            <select
              value={settings.backingMode}
              onChange={event =>
                applyListeningChange(() =>
                  settings.setBackingMode(event.target.value as BackingMode)
                )
              }
            >
              {['off', 'tonic', 'cadence'].map(mode => (
                <option key={mode} value={mode}>
                  {t(`training.contexts.${mode}`)}
                </option>
              ))}
            </select>
          </label>
        </section>
        {settings.backingMode !== 'off' && (
          <p className="chord-lab-context-note">{t('training.contextHint')}</p>
        )}

        <section
          className={`chord-lab-player ${isPlaying ? 'is-playing' : ''}`}
          aria-label={t('training.player')}
        >
          <div className="chord-lab-player-status" aria-live="polite">
            <span className="chord-lab-wave" aria-hidden="true">
              {[0, 1, 2, 3, 4].map(bar => (
                <i key={bar} />
              ))}
            </span>
            <div>
              <strong>
                {isLoadingInstrument
                  ? t('training.loading')
                  : !gameStarted
                    ? t('training.ready')
                    : answered
                      ? wasRevealed
                        ? t('training.answerRevealed')
                        : t('training.correct')
                      : isPlaying
                        ? t('training.listening')
                        : t('training.yourTurn')}
              </strong>
              <p>
                {!gameStarted
                  ? t('training.startHint')
                  : answered
                    ? t('training.compareHint')
                    : lastGuess
                      ? t('training.tryAgain')
                      : t('training.chooseAnswer')}
              </p>
            </div>
          </div>
          {!gameStarted ? (
            <button
              type="button"
              className="chord-lab-primary"
              onClick={() => void startGame()}
              disabled={!ready}
            >
              <PlayIcon />
              {isLoadingInstrument
                ? t('training.loading')
                : t('training.start')}
            </button>
          ) : (
            <div className="chord-lab-playback-controls">
              <button
                type="button"
                className="chord-lab-primary"
                onClick={() => void playChordColorPattern()}
                disabled={!ready}
              >
                <SpeakerWaveIcon />
                {t('buttons.replay')}
              </button>
              <button
                type="button"
                className="chord-lab-secondary"
                onClick={() => void playChord()}
                disabled={!ready}
              >
                {t('training.blockChord')}
              </button>
              <button
                type="button"
                className="chord-lab-secondary"
                onClick={() => void playBass()}
                disabled={!ready}
              >
                {t('training.bassOnly')}
              </button>
              <button
                type="button"
                className="chord-lab-secondary"
                onClick={() => void playTonic()}
                disabled={!ready}
              >
                {t('training.tonicNote')}
              </button>
              <button
                type="button"
                className="chord-lab-secondary"
                onClick={stopPlayback}
                aria-label={t('training.stop')}
              >
                <StopIcon />
                {t('training.stop')}
              </button>
            </div>
          )}
          {!currentChord && (
            <p className="chord-lab-error" role="alert">
              {t('training.emptySet')}
            </p>
          )}
        </section>

        {gameStarted && (
          <section className="chord-lab-question">
            <div className="chord-lab-section-label">
              <h2>
                {answered
                  ? t('training.exploreAnswers')
                  : t('training.chooseAnswer')}
              </h2>
              <span>
                {filteredChords.length} {t('training.choices')}
              </span>
            </div>
            <CardStack
              {...{
                currentChord,
                disabledChords,
                filteredChords,
                setActiveChord,
                isAdvance,
                gameStarted,
              }}
            />
            <div className="chord-lab-question-actions">
              {!answered ? (
                <button
                  type="button"
                  className="chord-lab-text-button"
                  onClick={revealAnswer}
                >
                  {t('training.reveal')}
                </button>
              ) : (
                <span className="chord-lab-complete">
                  ✓{' '}
                  {wasRevealed
                    ? t('training.studyThenContinue')
                    : t('training.niceListen')}
                </span>
              )}
              <button
                type="button"
                className={`chord-lab-next ${answered ? 'is-ready' : ''}`}
                onClick={() => void advanceGame()}
                disabled={!ready}
              >
                {t('training.next')}
                <ArrowRightIcon />
              </button>
            </div>
          </section>
        )}

        {answered && currentChord && (
          <section className="chord-lab-explanation" aria-live="polite">
            <div>
              <p className="chord-lab-eyebrow">{t('training.insideChord')}</p>
              <h2>
                {currentChord.symbol}
                {currentChord.inversion > 0 ? ` / ${bassPitchClass}` : ''}
                <span>
                  {currentChord.degree}
                  {currentChord.chordType}
                </span>
              </h2>
            </div>
            <dl>
              <div>
                <dt>{t('training.chordRoot')}</dt>
                <dd>{currentChord.root}</dd>
              </div>
              <div>
                <dt>{t('training.soundingBass')}</dt>
                <dd>{bassPitchClass}</dd>
              </div>
              <div>
                <dt>{t('training.voicing')}</dt>
                <dd>
                  {t(
                    `training.inversions.${['root', 'first', 'second', 'third'][currentChord.inversion]}`
                  )}
                </dd>
              </div>
              <div>
                <dt>{t('training.chordTones')}</dt>
                <dd>
                  {currentChord.notes
                    .map(note => Note.pitchClass(note))
                    .join(' · ')}
                </dd>
              </div>
            </dl>
            <p>{t('training.inversionHint')}</p>
          </section>
        )}

        <details className="chord-lab-details">
          <summary>{t('training.levelsAndTips')}</summary>
          <div className="chord-lab-levels">
            <label>
              {t('training.chordLevel')}{' '}
              <output>{Math.round(settings.pianoVolume * 100)}%</output>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.pianoVolume}
                onChange={event =>
                  settings.setPianoVolume(Number(event.target.value))
                }
              />
            </label>
            <label>
              {t('training.bassLevel')}{' '}
              <output>{Math.round(settings.bassLevel * 100)}%</output>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.bassLevel}
                onChange={event =>
                  settings.setBassLevel(Number(event.target.value))
                }
              />
            </label>
            <label>
              {t('practiceSettings.bpm')} <output>{settings.bpm}</output>
              <input
                type="range"
                min="40"
                max="200"
                value={settings.bpm}
                onChange={event => settings.setBpm(Number(event.target.value))}
              />
            </label>
          </div>
          <p>{t('training.hearingHint')}</p>
          <p>{t('training.learningHint')}</p>
          <p className="chord-lab-shortcuts">{t('training.shortcuts')}</p>
          <label className="chord-lab-toggle">
            <input
              type="checkbox"
              checked={midiEnabled}
              onChange={event => setMidiEnabled(event.target.checked)}
            />
            <span>{t('training.enableMidi')}</span>
          </label>
        </details>
        {midiEnabled && (
          <MIDIInputHandler {...{ activeNotes, setActiveNotes }} />
        )}
        <ChordColorTrainerSettings
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
        />
      </main>
      <Toaster />
    </div>
  );
}
