import { shapeNotes, type GuitarShape } from '../practice/guitarStrum';
import { chordMember, identifyChord, noteName } from './lessonVisuals';

/** The illustration uses the same frets and string indices as the audible sweep. */
export default function GuitarDiagram({
  shape,
  tonic,
  activeStrings,
  zh,
}: {
  shape: GuitarShape;
  tonic: number;
  activeStrings: number[];
  zh: boolean;
}) {
  const strings = shapeNotes(shape);
  const chord = identifyChord(
    strings.map(item => item.midi),
    tonic,
    tonic
  )!;
  const fretted = shape.frets.filter(
    (fret): fret is number => fret !== null && fret > 0
  );
  const base = shape.position === 'open' ? 1 : Math.min(...fretted);
  const bass = Math.min(...strings.map(item => item.midi));
  return (
    <div
      className="guitar-diagram"
      role="img"
      aria-label={`${chord.symbol}, ${shape.label[zh ? 'zh' : 'en']}. ${shape.frets.map((fret, index) => `${6 - index}: ${fret === null ? (zh ? '不弹' : 'not played') : fret === 0 ? (zh ? '空弦' : 'open') : `${zh ? '品' : 'fret'} ${fret}`}`).join(', ')}`}
    >
      <svg viewBox="0 0 360 300" aria-hidden="true">
        <text x="25" y="60" className="guitar-position">
          {base}fr
        </text>
        {Array.from({ length: 6 }, (_, index) => (
          <line
            key={`fret-${index}`}
            x1="70"
            x2="300"
            y1={56 + index * 32}
            y2={56 + index * 32}
            className={base === 1 && index === 0 ? 'guitar-nut' : 'guitar-fret'}
          />
        ))}
        {shape.frets.map((fret, index) => {
          const x = 70 + index * 46;
          const item = strings.find(string => string.stringIndex === index);
          const sounding = activeStrings.includes(index);
          return (
            <g key={index} className={sounding ? 'is-sounding' : ''}>
              <line
                x1={x}
                x2={x}
                y1="56"
                y2="216"
                className="guitar-string"
                strokeWidth={2.6 - index * 0.3}
              />
              <text x={x} y="24" className="guitar-string-label">
                {6 - index}
              </text>
              {fret === null ? (
                <text x={x} y="46" className="guitar-muted">
                  ×
                </text>
              ) : fret === 0 ? (
                <circle cx={x} cy="41" r="6" className="guitar-open" />
              ) : (
                <circle
                  cx={x}
                  cy={72 + (fret - base) * 32}
                  r="12"
                  className={`guitar-finger ${item && item.midi === bass ? 'is-bass' : ''}`}
                />
              )}
              {fret !== null && fret > 0 && (
                <text
                  x={x}
                  y={76 + (fret - base) * 32}
                  className="guitar-fret-number"
                >
                  {fret}
                </text>
              )}
              <text x={x} y="239" className="guitar-pitch">
                {item ? noteName(item.midi, chord, true) : '—'}
              </text>
              <text x={x} y="258" className="guitar-member">
                {item
                  ? chordMember(item.midi, chord, zh)
                  : zh
                    ? '不弹'
                    : 'skip'}
              </text>
              {item?.midi === bass && (
                <text x={x} y="276" className="guitar-bass">
                  {zh ? '低音' : 'Bass'}
                </text>
              )}
            </g>
          );
        })}
        <path
          d="M80 290 H288 l-8 -5 M288 290 l-8 5"
          className="guitar-sweep-arrow"
        />
      </svg>
      <p>
        {zh
          ? '标准调弦 E₂ A₂ D₃ G₃ B₃ E₄ · 下扫 6 → 1'
          : 'Standard tuning E₂ A₂ D₃ G₃ B₃ E₄ · downstroke 6 → 1'}
      </p>
    </div>
  );
}
