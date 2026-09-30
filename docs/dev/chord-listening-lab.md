# Chord listening lab: dev preview

This development branch improves the existing Chord Color Trainer at
`/ear-trainer/chord-color-trainer`. Production remains on `main`.

## Listening and theory

- Chord root and lowest sounding bass are separate. First/second inversions
  keep the third/fifth in the bass even when soft bass support is enabled.
- Bass support has its own quiet synthesis voice and level. Bass-only audition
  helps isolate the lowest tone without replacing the instrument.
- Isolated chords are the default. Optional tonic or I–IV–V–I context plays
  before the target with a release gap, never as unrelated looping background
  harmony. Minor cadence context uses i–iv–V–i; the practice set itself is
  explicitly natural minor (i–ii°–♭III–iv–v–♭VI–♭VII).
- Voicings use Tonal's chord intervals and preserve note spelling. Narrow ranges
  extend upward only when a full close-position chord will not fit.
- Immediate repeats are avoided when there is more than one available answer.
  An empty/invalid selection cannot start or produce an undefined note.

## Sound and lifecycle

The foreground previously had a parallel unfiltered connection bypassing level
control, a fully wet heavy chorus, and no scheduling look-ahead. It now has one
dry processing path, bounded levels, Tone's scheduling buffer, and a shared
peak limiter. A piano is the new-user default; saved instrument choices remain.
Sample thinning is now MIDI-sorted and spread across the instrument's register.

Audio resumes from an explicit listening action. Replay/stop/navigation clear
scheduled notes and release active voices. Same-pitch synth replay also discards
old voice allocations. Failed or superseded instrument loads leave a usable
sound. Switching settings does not automatically start audio.

Digital peak protection is **not a guarantee of hearing-safe sound pressure**.
Start with low device volume and take listening breaks.

## Feedback and accessibility

- Real keyboard-accessible answer buttons replace overlapping draggable cards
- Layout adapts to small screens; controls keep touch-friendly dimensions
- Replay, block chord, bass-only, tonic, stop, reveal, and next are explicit
- Revealed answers explain root, sounding bass, inversion, and chord tones
- English and Chinese copy; reduced-motion animation support
- Keyboard shortcuts: Space listen, N next, B bass, T key center, Escape stop
- MIDI access is opt-in; all channels, sustain, device reconnects, and rejected
  access are handled. Physical MIDI hardware still needs device testing

First-attempt scores count once per target question. Wrong→right, reveal,
comparisons, and replays cannot inflate scores. Previous answer statistics are
preserved separately; a new first-attempt series starts for the updated scoring.

## Verification

Run `npm ci`, `npm run typecheck`, `npm test`, `npm run lint`,
`npm run format:check`, and `npm run build`. Tests cover theory, audio lifecycle
through Tone mocks, loading/persistence, and actual trainer-hook scoring.
Browser checks supplement these tests; mocked audio tests do not establish
subjective timbre quality or device-specific latency/headphone loudness.

The static sample library is retained unchanged. Individual assets must remain
under Cloudflare Pages' upload limit.

## Design references

- [Inverted triads, Music Theory for the 21st-Century Classroom](https://musictheory.pugetsound.edu/mt21c/InvertedTriads.html)
- [Berklee harmonic ear training curriculum](https://online.berklee.edu/courses/harmonic-ear-training-recognizing-chord-progressions)
- [Tone Sampler API](https://tonejs.github.io/docs/15.1.22/classes/Sampler.html)

These support musical constraints and a sensible practice progression; no
specific learning-outcome improvement is claimed from this implementation.
