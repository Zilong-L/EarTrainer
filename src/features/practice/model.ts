/** Pure, auditable practice content. Times and durations are seconds; notes are MIDI. */
export type LocalizedText = { en: string; zh: string };
export type Language = 'en' | 'zh';
export const text = (value: LocalizedText, language = 'en'): string =>
  language.toLowerCase().startsWith('zh') ? value.zh : value.en;

export type LessonId =
  | 'degrees-core'
  | 'intervals-core'
  | 'triads-core'
  | 'triads-diminished'
  | 'inversions-core'
  | 'functions-core'
  | 'degrees-diatonic';
export type QuestionType =
  | 'degree'
  | 'interval'
  | 'triad'
  | 'inversion'
  | 'function';
export type Choice = { id: string; label: LocalizedText };
export type PracticeEvent = {
  note: number;
  time: number;
  duration: number;
  velocity?: number;
};
export type Lesson = {
  id: LessonId;
  title: LocalizedText;
  description: LocalizedText;
  instruction: LocalizedText;
  focus: LocalizedText;
  level: number;
  stage: number;
  type: QuestionType;
  choices: Choice[];
};
export type PracticeQuestion = {
  id: string;
  lessonId: LessonId;
  type: QuestionType;
  prompt: LocalizedText;
  answer: string;
  answerLabel: LocalizedText;
  choices: Choice[];
  events: PracticeEvent[];
  referenceEvents: PracticeEvent[];
  hintEvents: PracticeEvent[];
  hint: LocalizedText;
  explanation: LocalizedText;
  /** For anonymous local progress diversity only. Never display as a pre-answer cue. */
  tonic: number;
};
export type LessonExample = {
  choice: Choice;
  events: PracticeEvent[];
  referenceEvents: PracticeEvent[];
  explanation: LocalizedText;
};
export type RandomSource = () => number;
export const SESSION_LENGTH = 8;
export const PRACTICE_MIDI_RANGE = [48, 79] as const;

const localized = (en: string, zh: string): LocalizedText => ({ en, zh });
const choice = (id: string, en: string, zh: string): Choice => ({
  id,
  label: localized(en, zh),
});
const degrees = [
  choice('1', '1 · Do', '1 · Do'),
  choice('2', '2 · Re', '2 · Re'),
  choice('3', '3 · Mi', '3 · Mi'),
  choice('4', '4 · Fa', '4 · Fa'),
  choice('5', '5 · Sol', '5 · Sol'),
  choice('6', '6 · La', '6 · La'),
  choice('7', '7 · Ti', '7 · Ti'),
];
const triads = [
  choice('major', 'Major', '大三和弦'),
  choice('minor', 'Minor', '小三和弦'),
  choice('diminished', 'Diminished', '减三和弦'),
];

/** Seven freely selectable lessons, grouped into six curriculum stages. */
export const LESSONS: Lesson[] = [
  {
    id: 'degrees-core',
    title: localized('Find home', '找到主音'),
    description: localized(
      'Hear do, mi and sol inside a major key.',
      '在大调中听辨 Do、Mi 和 Sol。'
    ),
    instruction: localized(
      'Listen to the key reference first. Sing do back, then hear where the single note sits: 1, 3 or 5. Replay the reference freely.',
      '先听调性参考，轻唱 Do，再判断单音是 1、3 还是 5。可以自由重听调性参考。'
    ),
    focus: localized('Tonal anchors · 3 choices', '调性锚点 · 3 个选项'),
    level: 1,
    stage: 1,
    type: 'degree',
    choices: degrees.filter(item => ['1', '3', '5'].includes(item.id)),
  },
  {
    id: 'intervals-core',
    title: localized('Hear the distance', '听见音程距离'),
    description: localized(
      'Compare minor thirds, major thirds and perfect fifths.',
      '比较小三度、大三度和纯五度。'
    ),
    instruction: localized(
      'Two notes rise in pitch. Hear the gap between them, independent of the first note. A minor third is 3 semitones, a major third 4, and a perfect fifth 7.',
      '两个音依次上行。听辨它们之间的距离，不必判断第一个音的绝对音高。小三度为 3 个半音，大三度为 4 个，纯五度为 7 个。'
    ),
    focus: localized('Ascending intervals · 3 choices', '上行音程 · 3 个选项'),
    level: 2,
    stage: 2,
    type: 'interval',
    choices: [
      choice('m3', 'Minor 3rd', '小三度'),
      choice('M3', 'Major 3rd', '大三度'),
      choice('P5', 'Perfect 5th', '纯五度'),
    ],
  },
  {
    id: 'triads-core',
    title: localized('Major or minor', '大三和弦 / 小三和弦'),
    description: localized(
      'Start with two root-position triad colors.',
      '从原位三和弦的两种色彩开始。'
    ),
    instruction: localized(
      'Hear three notes together. Major and minor share a perfect fifth; listen to the third above the lowest note. Major has a major third, minor has a minor third.',
      '听三个同时发声的音。大三和弦与小三和弦都有纯五度，重点听最低音上方的三度：大三度或小三度。'
    ),
    focus: localized(
      'Root-position triads · 2 choices',
      '原位三和弦 · 2 个选项'
    ),
    level: 3,
    stage: 3,
    type: 'triad',
    choices: triads.slice(0, 2),
  },
  {
    id: 'triads-diminished',
    title: localized('Add diminished', '加入减三和弦'),
    description: localized(
      'Add the smaller fifth to your triad palette.',
      '在三和弦色彩中加入减五度。'
    ),
    instruction: localized(
      'Compare the major and minor examples with diminished before you begin. Diminished has a minor third and a diminished fifth; its outer span is one semitone smaller than a perfect fifth.',
      '开始前，把减三和弦示例与大小三和弦比较。减三和弦由小三度和减五度构成，外侧两音的距离比纯五度小一个半音。'
    ),
    focus: localized('Triad qualities · 3 choices', '三和弦性质 · 3 个选项'),
    level: 3,
    stage: 3,
    type: 'triad',
    choices: [...triads],
  },
  {
    id: 'inversions-core',
    title: localized('Follow the bass', '跟随低音'),
    description: localized(
      'Hear root, first and second inversions.',
      '听辨原位、第一转位和第二转位。'
    ),
    instruction: localized(
      'These are major or minor triads in close position. Follow the lowest note: the root means root position, the third means first inversion, and the fifth means second inversion.',
      '这里使用密集排列的大小三和弦。跟随最低音：根音在低音为原位，三音在低音为第一转位，五音在低音为第二转位。'
    ),
    focus: localized(
      'Major / minor inversions · 3 choices',
      '大小三和弦转位 · 3 个选项'
    ),
    level: 4,
    stage: 4,
    type: 'inversion',
    choices: [
      choice('root', 'Root position', '原位'),
      choice('first', 'First inversion', '第一转位'),
      choice('second', 'Second inversion', '第二转位'),
    ],
  },
  {
    id: 'functions-core',
    title: localized('Hear the role', '听见和弦功能'),
    description: localized(
      'Place I, IV, V and vi inside a major key.',
      '在大调中听辨 I、IV、V 和 vi。'
    ),
    instruction: localized(
      'Establish the major key with the key reference, then hear the target root-position chord. I is home, IV moves away, V leans toward home, and vi is the minor chord on degree 6.',
      '先用调性参考建立大调调性，再听目标原位和弦。I 是主和弦，IV 离开主音，V 倾向解决回主音，vi 是第 6 级上的小三和弦。'
    ),
    focus: localized(
      'Major-key functions · 4 choices',
      '大调和弦功能 · 4 个选项'
    ),
    level: 5,
    stage: 5,
    type: 'function',
    choices: [
      choice('I', 'I · Tonic', 'I · 主和弦'),
      choice('IV', 'IV · Subdominant', 'IV · 下属和弦'),
      choice('V', 'V · Dominant', 'V · 属和弦'),
      choice('vi', 'vi · Submediant', 'vi · 下中音和弦'),
    ],
  },
  {
    id: 'degrees-diatonic',
    title: localized('Explore the whole key', '探索完整音阶'),
    description: localized(
      'A harder challenge: all seven major-scale degrees.',
      '进阶挑战：大调音阶的全部七个音级。'
    ),
    instruction: localized(
      'First listen to the labeled examples for new degrees 2, 4, 6 and 7. Sing 1–2–3–4–5–6–7–1. Then use the reference to hear each target in the key; 7 sits a semitone below the upper tonic.',
      '先听新音级 2、4、6 和 7 的标记示例，再轻唱 1–2–3–4–5–6–7–1。用调性参考判断目标音；7 比高八度主音低一个半音。'
    ),
    focus: localized(
      'Full diatonic set · 7 choices',
      '完整大调音级 · 7 个选项'
    ),
    level: 6,
    stage: 6,
    type: 'degree',
    choices: [...degrees],
  },
];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find(lesson => lesson.id === id);
}

/** Mulberry32: reproducible question streams for tests and deliberate practice. */
export function createSeededRng(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleIndex(length: number, rng: RandomSource): number {
  const value = rng();
  const safe = Number.isFinite(value)
    ? Math.min(Math.max(value, 0), 1 - Number.EPSILON)
    : 0;
  return Math.floor(safe * length);
}

const event = (note: number, time = 0, duration = 1.15): PracticeEvent => ({
  note,
  time,
  duration,
  velocity: 0.72,
});
const block = (notes: number[], time = 0, duration = 1.3): PracticeEvent[] =>
  notes.map(note => event(note, time, duration));
const arpeggio = (notes: number[], gap = 0.45): PracticeEvent[] =>
  notes.map((note, index) => event(note, index * gap, 0.55));
const scaleOffsets = [0, 2, 4, 5, 7, 9, 11];
const intervalOffsets: Record<string, number> = { m3: 3, M3: 4, P5: 7 };
const triadOffsets: Record<string, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
};
const inversionIndexes: Record<string, number> = {
  root: 0,
  first: 1,
  second: 2,
};

/** Voice-led I–IV–V–I key context (not a root-position cadence). */
function cadence(tonic: number): PracticeEvent[] {
  const voicings = [
    [0, 4, 7],
    [0, 5, 9],
    [2, 7, 11],
    [0, 4, 7],
  ];
  return voicings.flatMap((notes, index) =>
    block(
      notes.map(note => tonic + note),
      index * 0.8,
      0.62
    )
  );
}

function constructQuestion(
  lesson: Lesson,
  selected: Choice,
  tonic: number,
  majorInversion: boolean,
  id: string
): PracticeQuestion {
  let events: PracticeEvent[];
  let referenceEvents: PracticeEvent[] = [];
  let hintEvents: PracticeEvent[];
  let prompt: LocalizedText;
  let hint: LocalizedText;
  let explanation: LocalizedText;
  const answer = selected.id;

  switch (lesson.type) {
    case 'degree': {
      const offset = scaleOffsets[Number(answer) - 1];
      const target = tonic + offset;
      events = [event(target)];
      referenceEvents = cadence(tonic);
      hintEvents = [
        event(tonic, 0, 0.7),
        event(target, 1, 0.9),
        event(tonic, 2.2, 0.7),
      ];
      prompt = localized(
        'Which scale degree did you hear?',
        '你听到的是哪个音级？'
      );
      hint = localized(
        'Compare the target directly with do.',
        '把目标音与 Do 直接比较。'
      );
      const degreeHints: Record<string, LocalizedText> = {
        '1': localized(
          'Do is the tonic: the point of rest in this major key.',
          'Do 是这个大调的主音，也是稳定的落点。'
        ),
        '2': localized(
          'Re is a whole step above do, between degrees 1 and 3.',
          'Re 在 Do 上方一个全音，位于 1 与 3 之间。'
        ),
        '3': localized(
          'Mi is a major third above do, one of the tonic-triad anchors.',
          'Mi 在 Do 上方大三度，是主三和弦的锚点之一。'
        ),
        '4': localized(
          'Fa is a perfect fourth above do and a semitone above mi.',
          'Fa 在 Do 上方纯四度，比 Mi 高一个半音。'
        ),
        '5': localized(
          'Sol is a perfect fifth above do, another tonic-triad anchor.',
          'Sol 在 Do 上方纯五度，也是主三和弦的锚点。'
        ),
        '6': localized(
          'La is a major sixth above do, a whole step above sol.',
          'La 在 Do 上方大六度，比 Sol 高一个全音。'
        ),
        '7': localized(
          'Ti is a major seventh above do, a semitone below the upper tonic.',
          'Ti 在 Do 上方大七度，比高八度主音低一个半音。'
        ),
      };
      explanation = degreeHints[answer];
      break;
    }
    case 'interval': {
      const distance = intervalOffsets[answer];
      events = [event(tonic, 0, 0.65), event(tonic + distance, 0.85, 0.9)];
      hintEvents = [event(tonic, 0, 1), event(tonic + distance, 1.45, 1)];
      prompt = localized(
        'How far apart are the two notes?',
        '这两个音相距什么音程？'
      );
      hint = localized(
        'Hear the same two notes with more space between them.',
        '把两个音之间的停顿拉长，再听一次。'
      );
      explanation = localized(
        `The second note is ${distance} semitones above the first: ${selected.label.en.toLowerCase()}. The starting pitch can change; the distance stays the same.`,
        `第二个音比第一个音高 ${distance} 个半音，即${selected.label.zh}。起始音高可以改变，但音程距离不变。`
      );
      break;
    }
    case 'triad': {
      const notes = triadOffsets[answer].map(offset => tonic + offset);
      events = block(notes);
      hintEvents = arpeggio(notes);
      prompt = localized(
        'Which triad quality did you hear?',
        '你听到的是哪种三和弦？'
      );
      hint = localized(
        'Hear the chord one note at a time, from its root.',
        '从根音开始，逐个听和弦音。'
      );
      const third = answer === 'major' ? 'major' : 'minor';
      const fifth = answer === 'diminished' ? 'diminished' : 'perfect';
      explanation = localized(
        `${selected.label.en} uses a ${third} third and a ${fifth} fifth above its root. Compare those distances, rather than relying on mood alone.`,
        `${selected.label.zh}在根音上方包含${third === 'major' ? '大' : '小'}三度和${fifth === 'diminished' ? '减' : '纯'}五度。重点比较音程距离，不必只凭情绪判断。`
      );
      break;
    }
    case 'inversion': {
      const quality = majorInversion ? 'major' : 'minor';
      const offsets = [...triadOffsets[quality]];
      const inversion = inversionIndexes[answer];
      const voiced = [
        ...offsets.slice(inversion),
        ...offsets.slice(0, inversion).map(offset => offset + 12),
      ];
      const notes = voiced.map(offset => tonic + offset);
      events = block(notes);
      hintEvents = [
        event(notes[0], 0, 0.75),
        ...arpeggio(notes).map(item => ({ ...item, time: item.time + 1 })),
      ];
      prompt = localized(
        'Which inversion is this triad in?',
        '这个三和弦采用哪种转位？'
      );
      hint = localized(
        'Hear the lowest note alone, then the chord from the bottom up.',
        '先单独听最低音，再从下到上听和弦。'
      );
      const bass = ['root', 'third', 'fifth'][inversion];
      const bassZh = ['根音', '三音', '五音'][inversion];
      explanation = localized(
        `The ${bass} is the lowest note, so this ${quality} triad is in ${selected.label.en.toLowerCase()}. Inversion changes the bass, not the chord quality.`,
        `最低音是${bassZh}，所以这个${majorInversion ? '大' : '小'}三和弦是${selected.label.zh}。转位改变低音，不改变和弦性质。`
      );
      break;
    }
    case 'function': {
      const offsets: Record<string, number> = { I: 0, IV: 5, V: 7, vi: 9 };
      const root = tonic + offsets[answer];
      const notes = triadOffsets[answer === 'vi' ? 'minor' : 'major'].map(
        offset => root + offset
      );
      events = block(notes);
      referenceEvents = cadence(tonic);
      hintEvents = [
        event(tonic, 0, 0.7),
        event(root, 1, 0.7),
        ...arpeggio(notes).map(item => ({ ...item, time: item.time + 2 })),
      ];
      prompt = localized(
        'What is this chord’s role in the major key?',
        '这个和弦在大调中是什么功能？'
      );
      hint = localized(
        'Compare do with the chord root, then hear its notes separately.',
        '比较主音与和弦根音，再逐个听和弦音。'
      );
      const descriptions: Record<string, LocalizedText> = {
        I: localized(
          'I is the major tonic triad, rooted on degree 1. It is the home chord established by the reference.',
          'I 是第 1 级上的大三和弦，是参考调性建立的主和弦。'
        ),
        IV: localized(
          'IV is the major subdominant triad, rooted on degree 4. Its root sits a perfect fourth above do.',
          'IV 是第 4 级上的大三和弦，根音在主音上方纯四度。'
        ),
        V: localized(
          'V is the major dominant triad, rooted on degree 5. Its third is the leading tone, which tends toward do.',
          'V 是第 5 级上的大三和弦，其三音是倾向主音的导音。'
        ),
        vi: localized(
          'vi is the minor submediant triad, rooted on degree 6. Its minor quality distinguishes it from I, IV and V.',
          'vi 是第 6 级上的小三和弦，其小三和弦性质与 I、IV 和 V 区分。'
        ),
      };
      explanation = descriptions[answer];
      break;
    }
  }

  return {
    id,
    lessonId: lesson.id,
    type: lesson.type,
    prompt,
    answer,
    answerLabel: { ...selected.label },
    choices: lesson.choices.map(item => ({
      id: item.id,
      label: { ...item.label },
    })),
    events,
    referenceEvents,
    hintEvents,
    hint,
    explanation,
    tonic,
  };
}

/**
 * Select the answer class FIRST, uniformly, then the tonic and incidental quality.
 * Repeated labels are intentionally allowed: two-choice drills must not alternate.
 * previousAnswer is accepted for caller compatibility, never used to remove classes.
 */
export function generateQuestion(
  lessonId: LessonId,
  rng: RandomSource = Math.random,
  _previousAnswer?: string | null
): PracticeQuestion {
  const lesson = getLesson(lessonId);
  if (!lesson)
    throw new RangeError(`Unknown practice lesson: ${String(lessonId)}`);
  const selected = lesson.choices[sampleIndex(lesson.choices.length, rng)];
  const tonic =
    (lesson.type === 'degree' || lesson.type === 'interval' ? 55 : 48) +
    sampleIndex(12, rng);
  const majorInversion =
    lesson.type !== 'inversion' || sampleIndex(2, rng) === 0;
  const randomId = sampleIndex(0x100000000, rng).toString(36);
  return constructQuestion(
    lesson,
    selected,
    tonic,
    majorInversion,
    `q-${randomId}`
  );
}

export function generateSessionQuestions(
  lessonId: LessonId,
  rng: RandomSource = Math.random
): PracticeQuestion[] {
  return Array.from({ length: SESSION_LENGTH }, (_, index) => ({
    ...generateQuestion(lessonId, rng),
    id: `q${index + 1}-${sampleIndex(0x100000000, rng).toString(36)}`,
  }));
}

/** Labeled, unscored demonstrations, including every newly introduced degree. */
export function generateLessonExamples(lessonId: LessonId): LessonExample[] {
  const lesson = getLesson(lessonId);
  if (!lesson) return [];
  const tonic =
    lesson.type === 'degree' || lesson.type === 'interval' ? 60 : 48;
  return lesson.choices.map(selected => {
    const question = constructQuestion(
      lesson,
      selected,
      tonic,
      true,
      'example'
    );
    return {
      choice: { id: selected.id, label: { ...selected.label } },
      events: question.events,
      referenceEvents: question.referenceEvents,
      explanation: question.explanation,
    };
  });
}
