# Guitar strum chord-quality practice

Routes: `/practice/guitar-strums` and `/learn/guitar-strums`.

The listening task identifies major or minor quality, with root and voicing
chosen independently of the answer. A, E and D each have three reviewed grips:
open, a lower movable shape and an upper-position shape. All are standard tuning,
root-bass, full triads. Frets are at most 12 and the fretted span is at most four.
The lesson intentionally does not ask an inversion question.

A downstroke traverses actual played-string indices, low E toward high E. Muted
strings stay silent, octave doublings remain, and sustain overlaps. Fast and slow
sweeps take 60 ms and 200 ms. Seeded interior onset variation is bounded to 1.5 ms
and 4 ms; small velocity variation changes level only. Pitch is never detuned.
Nylon and steel guitar reuse the existing CC BY 3.0 sample collection; see
`public/samples/ATTRIBUTION.txt`. This is timing/dynamics simulation with ordinary
single-note samples, not direction-specific recordings or a velocity-layer model.
Palm mute is deliberately outside this feature.

Practice controls choose timbre, speed and open-only versus varied voicings.
They never expose the target root, current shape or frets before a decision.
Changing setup stops audio, preserves the musical question, and requires a fresh
listen. Correct/wrong A/B comparisons preserve the same root, shape family,
timbre and timing. Learn illustrates exactly the sounded strings, frets, octave
pitches and chord members. Its additional A/B holds the same chord while changing
only voicing.

Each physical string uses its own sampler, so unison pitches release independently.
The lazy bank is bounded to six current-style managers; style switches dispose
old managers. Pending loads, future Transport events and active sources are
cancelled by Stop, replay, route changes, hidden tabs and unmount. Failed guitar
samples report an error rather than silently using a synthesizer as a guitar.
The existing foreground piano and bass paths remain separate.

Validation: guitar shape/strum tests, class/root/shape balancing, settings and A/B
invariance, rendered no-answer-leak checks, cancellation and sample-bank lifecycle,
then repository lint, formatting, typecheck, full tests and production build.
