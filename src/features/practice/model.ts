import {
  buildStrumEvents,
  getGuitarShapes,
  type GuitarChordId,
  type GuitarStyle,
} from './guitarStrum';

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
  | 'degrees-diatonic'
  | 'degrees-neighbors'
  | 'degrees-minor'
  | 'intervals-steps'
  | 'intervals-descending'
  | 'intervals-harmonic'
  | 'intervals-context'
  | 'triads-arpeggiated'
  | 'triads-voiced'
  | 'guitar-strums'
  | 'inversions-open'
  | 'inversions-context'
  | 'bass-motion'
  | 'sevenths-core'
  | 'sevenths-diminished'
  | 'sevenths-inversions'
  | 'functions-predominant'
  | 'cadences-core'
  | 'progressions-major'
  | 'progressions-minor';
export type ChapterId =
  | 'home'
  | 'melody'
  | 'triads'
  | 'bass'
  | 'sevenths'
  | 'phrases';
export type Chapter = {
  id: ChapterId;
  title: LocalizedText;
  description: LocalizedText;
  symbol: string;
  lessonIds: LessonId[];
};
export type QuestionType =
  | 'degree'
  | 'interval'
  | 'triad'
  | 'inversion'
  | 'function'
  | 'seventh'
  | 'seventh-inversion'
  | 'bass-motion'
  | 'cadence'
  | 'progression';
export type Choice = { id: string; label: LocalizedText };
export type PracticeEvent = {
  note: number;
  time: number;
  duration: number;
  velocity?: number;
  guitarString?: number;
  instrument?: GuitarStyle;
};
export type Lesson = {
  id: LessonId;
  chapterId: ChapterId;
  mode?:
    | 'minor'
    | 'descending'
    | 'harmonic'
    | 'arpeggiated'
    | 'voiced'
    | 'open'
    | 'context'
    | 'guitar';
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
  /** Constructor-only context. Never use this as a pre-answer visual or accessible label. */
  construction: { quality: 'major' | 'minor'; variant: number };
};
export type LessonExample = {
  choice: Choice;
  tonic: number;
  hintEvents: PracticeEvent[];
  construction: PracticeQuestion['construction'];
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

/** Existing lesson identities stay valid for local history; chapters define the listening route. */
export const LESSONS: Lesson[] = [
  {
    id: 'degrees-core',
    chapterId: 'home',
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
    chapterId: 'melody',
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
    chapterId: 'triads',
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
    chapterId: 'triads',
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
    chapterId: 'bass',
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
    chapterId: 'phrases',
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
    chapterId: 'home',
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

const inversionChoices = [
  choice('root', 'Root position', '原位'),
  choice('first', 'First inversion', '第一转位'),
  choice('second', 'Second inversion', '第二转位'),
];
const seventhChoices = [
  choice('maj7', 'Major 7th', '大七和弦'),
  choice('dom7', 'Dominant 7th', '属七和弦'),
  choice('min7', 'Minor 7th', '小七和弦'),
];
function topic(
  id: LessonId,
  chapterId: ChapterId,
  type: QuestionType,
  title: LocalizedText,
  description: LocalizedText,
  instruction: LocalizedText,
  choices: Choice[],
  mode?: Lesson['mode']
): Lesson {
  const stage =
    ['home', 'melody', 'triads', 'bass', 'sevenths', 'phrases'].indexOf(
      chapterId
    ) + 1;
  return {
    id,
    chapterId,
    type,
    title,
    description,
    instruction,
    focus: description,
    choices,
    stage,
    level: stage,
    ...(mode ? { mode } : {}),
  };
}

LESSONS.push(
  topic(
    'degrees-neighbors',
    'home',
    'degree',
    localized('Steps around home', '主音身边的级进'),
    localized(
      'Hear 1, 2, 3 and 4 against the same home note.',
      '围绕同一主音，听辨 1、2、3、4。'
    ),
    localized(
      'Imagine or softly echo do–re–mi–fa. Hear re between do and mi, and fa just a semitone above mi. The target remains one note.',
      '在心里或轻声唱 Do–Re–Mi–Fa。Re 在 Do 与 Mi 之间，Fa 比 Mi 高一个半音。目标音仍然是单音。'
    ),
    degrees.slice(0, 4)
  ),
  topic(
    'degrees-minor',
    'home',
    'degree',
    localized('A minor home', '小调中的主音'),
    localized(
      'Hear do, me and sol inside a minor key.',
      '在小调中听辨 Do、Me、Sol。'
    ),
    localized(
      'Keep do as home in this do-based minor lesson. Echo the minor tonic arpeggio do–me–sol; me is three semitones above do. The reference uses a major V resolving to minor i.',
      '本节小调以 Do 为主音。轻唱小调主和弦 Do–Me–Sol；Me 比 Do 高三个半音。参考音使用大三和弦 V 解决到小三和弦 i。'
    ),
    [degrees[0], choice('b3', '♭3 · Me', '♭3 · Me'), degrees[4]],
    'minor'
  ),
  topic(
    'intervals-steps',
    'melody',
    'interval',
    localized('Half steps and whole steps', '半音与全音'),
    localized(
      'Compare the smallest melodic steps.',
      '比较旋律中最小的两种级进。'
    ),
    localized(
      'Echo the two pitches, or hold them in your mind. A minor second spans one semitone; a major second spans two. Compare the same starting note after answering.',
      '轻唱两个音，或在心里保持它们。小二度相距一个半音，大二度相距两个半音。回答后可从同一起始音比较。'
    ),
    [choice('m2', 'Minor 2nd', '小二度'), choice('M2', 'Major 2nd', '大二度')]
  ),
  topic(
    'intervals-descending',
    'melody',
    'interval',
    localized('Melody falling back', '下行旋律的距离'),
    localized(
      'Hear thirds, fourths and fifths going down.',
      '听辨下行三度、四度与五度。'
    ),
    localized(
      'Follow the first pitch down to the second. Distance keeps its name when direction reverses. Sing or imagine the notes back slowly before choosing.',
      '从第一个音跟随到较低的第二个音。方向反转时，音程距离的名称不变。选择前可慢慢轻唱或想象这两个音。'
    ),
    [
      choice('m3', 'Minor 3rd', '小三度'),
      choice('M3', 'Major 3rd', '大三度'),
      choice('P4', 'Perfect 4th', '纯四度'),
      choice('P5', 'Perfect 5th', '纯五度'),
    ],
    'descending'
  ),
  topic(
    'intervals-harmonic',
    'melody',
    'interval',
    localized('Two notes together', '同时响起的两个音'),
    localized(
      'Separate a fourth, tritone and fifth inside one sound.',
      '从同时发声的两音中分辨纯四度、三全音、纯五度。'
    ),
    localized(
      'Hear the two notes together, then use the optional separated-note hint. Fourths span five semitones, tritones six, and fifths seven. A tritone alone cannot tell you its enharmonic spelling.',
      '先听同时响起的两音，需要时用提示把它们分开。纯四度为五个半音，三全音为六个，纯五度为七个。孤立的三全音不能确定其等音拼写。'
    ),
    [
      choice('P4', 'Perfect 4th', '纯四度'),
      choice('TT', 'Tritone', '三全音'),
      choice('P5', 'Perfect 5th', '纯五度'),
    ],
    'harmonic'
  ),
  topic(
    'intervals-context',
    'melody',
    'interval',
    localized('Distances inside a key', '调性中的音程距离'),
    localized(
      'Hear the final interval inside a four-note major-key motif.',
      '在四音大调短句中听辨最后两音的音程。'
    ),
    localized(
      'Hear the four-note motif and focus on its final two pitches. Every motif begins do–sol. A final mi–sol is a minor third inside a major key; interval quality and key quality are different ideas. Echo the motif or imagine it back.',
      '听四音短句，重点听最后两个音。每个短句都以 Do–Sol 开始。末尾 Mi–Sol 是大调中的小三度；音程性质与调性性质是两回事。可以轻唱或在心里回想整个短句。'
    ),
    [
      choice('m3', 'Minor 3rd', '小三度'),
      choice('M3', 'Major 3rd', '大三度'),
      choice('P4', 'Perfect 4th', '纯四度'),
      choice('P5', 'Perfect 5th', '纯五度'),
    ],
    'context'
  ),
  topic(
    'triads-arpeggiated',
    'triads',
    'triad',
    localized('Hear a chord unfold', '听见和弦逐音展开'),
    localized(
      'Recognize major, minor and diminished in an arpeggio.',
      '在分解和弦中识别大、小、减三和弦。'
    ),
    localized(
      'The root, third and fifth arrive one at a time. Keep the first pitch in mind while hearing the other two; the same triad quality survives when notes are not simultaneous.',
      '根音、三音、五音依次出现。听后两个音时，在心里保持根音；音符不同时发声，三和弦性质也不改变。'
    ),
    [...triads],
    'arpeggiated'
  ),
  topic(
    'triads-voiced',
    'triads',
    'triad',
    localized('Color beyond the bass', '越过低音听和弦色彩'),
    localized(
      'Recognize the same qualities through changing inversions.',
      '在不同转位中辨认相同的和弦性质。'
    ),
    localized(
      'The lowest note is not always the root. Hear the complete major, minor or diminished pitch set; after answering, unfold it from the root to compare its third and fifth.',
      '最低音不一定是根音。听完整的大、小、减三和弦音集合；回答后，可从根音展开它们，比较三度与五度。'
    ),
    [...triads],
    'voiced'
  ),
  topic(
    'inversions-open',
    'bass',
    'inversion',
    localized('Space between the voices', '声部之间的空间'),
    localized(
      'Follow the bass even when the upper notes spread out.',
      '上方音符展开时，仍然跟随低音。'
    ),
    localized(
      'These major and minor triads are in open spacing. Root, third or fifth in the lowest voice still determines inversion; the order of higher voices does not.',
      '这里的大小三和弦采用开放排列。最低声部中的根音、三音或五音仍然决定转位；较高声部的顺序不决定转位。'
    ),
    [...inversionChoices],
    'open'
  ),
  topic(
    'inversions-context',
    'bass',
    'inversion',
    localized('The bass inside a key', '调性中的和弦低音'),
    localized(
      'Hear a tonic triad return in three inversions.',
      '听主三和弦以三种转位回来。'
    ),
    localized(
      'The reference establishes a major or minor home chord. The target is that same tonic triad with root, third or fifth in the bass. Compare the bass to the home note you remember.',
      '参考音建立大调或小调主和弦。目标是同一主三和弦，以根音、三音或五音作低音。把低音与记住的主音比较。'
    ),
    [...inversionChoices],
    'context'
  ),
  topic(
    'bass-motion',
    'bass',
    'bass-motion',
    localized('Follow a moving bass', '跟随移动的低音'),
    localized(
      'Hear a held bass, step or fifth between two chords.',
      '听两和弦之间的低音保持、级进或五度跳进。'
    ),
    localized(
      'Listen past the upper notes to the lowest pitch in each chord. An inversion can let harmony change while its bass stays still. The hint plays only the two bass notes.',
      '越过较高音，听每个和弦中的最低音。转位能让和声改变而低音保持不动。提示只播放这两个低音。'
    ),
    [
      choice('hold', 'Same bass', '低音保持'),
      choice('up-step', 'Step up', '级进上行'),
      choice('down-step', 'Step down', '级进下行'),
      choice('up-fifth', 'Fifth up', '纯五度上行'),
      choice('down-fifth', 'Fifth down', '纯五度下行'),
    ]
  ),
  topic(
    'sevenths-core',
    'sevenths',
    'seventh',
    localized('The fourth chord tone', '第四个和弦音'),
    localized(
      'Compare major, dominant and minor seventh colors.',
      '比较大七、属七、小七和弦色彩。'
    ),
    localized(
      'Hear the triad first in your mind, then its seventh. Major 7 has a major triad and major seventh; dominant 7 a major triad and minor seventh; minor 7 a minor triad and minor seventh.',
      '在心里先听三和弦，再听七音。大七和弦是大三和弦加大七度；属七和弦是大三和弦加小七度；小七和弦是小三和弦加小七度。'
    ),
    [...seventhChoices]
  ),
  topic(
    'sevenths-diminished',
    'sevenths',
    'seventh',
    localized('Two diminished sevenths', '两种减七色彩'),
    localized(
      'Compare half-diminished and fully diminished sevenths.',
      '比较半减七和弦与全减七和弦。'
    ),
    localized(
      'Both contain a diminished triad. The half-diminished chord adds a minor seventh (10 semitones); the fully diminished chord a diminished seventh (9). Here the bass supplies a root reference; no ambiguous inversion quiz.',
      '两者都包含减三和弦。半减七加小七度（十个半音），全减七加减七度（九个半音）。这里以低音提供根音参照，不考有歧义的转位。'
    ),
    [
      choice('half-dim7', 'Half-diminished 7th', '半减七和弦'),
      choice('dim7', 'Fully diminished 7th', '全减七和弦'),
    ]
  ),
  topic(
    'sevenths-inversions',
    'sevenths',
    'seventh-inversion',
    localized('Four possible bass notes', '七和弦的四种低音'),
    localized(
      'Hear root, third, fifth or seventh at the bottom.',
      '听根音、三音、五音或七音位于最低声部。'
    ),
    localized(
      'Major, dominant and minor sevenths retain all four chord tones. The seventh in the bass means third inversion. Fully diminished chords are excluded because their symmetry makes isolated root identity ambiguous.',
      '大七、属七、小七和弦保留全部四个和弦音。七音作低音是第三转位。全减七和弦的对称结构让孤立根音有歧义，因此不用于此题。'
    ),
    [...inversionChoices, choice('third', 'Third inversion', '第三转位')]
  ),
  topic(
    'functions-predominant',
    'phrases',
    'function',
    localized('Two ways toward the dominant', '走向属和弦的两条路'),
    localized(
      'Hear I, ii, IV and V within one major key.',
      '在同一大调中听辨 I、ii、IV、V。'
    ),
    localized(
      'Hold the tonic in mind while listening to each root-position chord. ii and IV can both prepare V in this tonal vocabulary, but ii is minor and IV is major. Function depends on the musical context.',
      '听原位和弦时，在心里保持主音。在这里的调性语汇中，ii 和 IV 都可预备 V；ii 是小三和弦，IV 是大三和弦。功能仍取决于音乐上下文。'
    ),
    [
      choice('I', 'I · Tonic', 'I · 主和弦'),
      choice('ii', 'ii · Supertonic', 'ii · 上主音和弦'),
      choice('IV', 'IV · Subdominant', 'IV · 下属和弦'),
      choice('V', 'V · Dominant', 'V · 属和弦'),
    ]
  ),
  topic(
    'cadences-core',
    'phrases',
    'cadence',
    localized('How a phrase comes to rest', '乐句怎样停下来'),
    localized(
      'Hear authentic, half, plagal and deceptive endings.',
      '听正格、半终止、变格与阻碍的乐句结尾。'
    ),
    localized(
      'Hear the whole short phrase, especially its final two chords. V–I returns home, a half cadence ends on V, IV–I is plagal, and V–vi takes an unexpected minor turn. These are broad cadence families, not a perfect-authentic-cadence exam.',
      '先听完整短句，尤其是最后两个和弦。V–I 回到主和弦，半终止停在 V，IV–I 为变格，V–vi 转向小三和弦。这些是宽泛的终止类型，不是完全正格终止考题。'
    ),
    [
      choice('authentic', 'Authentic · V–I', '正格 · V–I'),
      choice('half', 'Half · ends on V', '半终止 · 停在 V'),
      choice('plagal', 'Plagal · IV–I', '变格 · IV–I'),
      choice('deceptive', 'Deceptive · V–vi', '阻碍 · V–vi'),
    ]
  ),
  topic(
    'progressions-major',
    'phrases',
    'progression',
    localized('Hear the whole harmonic route', '听完整的和声路线'),
    localized(
      'Follow four-chord patterns by roots and colors.',
      '沿根音与和弦色彩，跟随四和弦路线。'
    ),
    localized(
      'Hear the bass route first, then check major and minor colors. Compare ii with IV before V, or hear vi turn a loop away from I. The hint strips the phrase to roots; replay brings the chords back.',
      '先听低音路线，再确认大小和弦色彩。比较 V 前的 ii 与 IV，或听 vi 怎样让循环离开 I。提示只保留根音，重听则回到完整和弦。'
    ),
    [
      choice('I-IV-V-I', 'I–IV–V–I', 'I–IV–V–I'),
      choice('I-ii-V-I', 'I–ii–V–I', 'I–ii–V–I'),
      choice('I-V-vi-IV', 'I–V–vi–IV', 'I–V–vi–IV'),
      choice('I-vi-IV-V', 'I–vi–IV–V', 'I–vi–IV–V'),
    ]
  ),
  topic(
    'progressions-minor',
    'phrases',
    'progression',
    localized('Harmonic routes in minor', '小调中的和声路线'),
    localized(
      'Compare major V, minor v and the turn to VI.',
      '比较大三和弦 V、小三和弦 v 与转向 VI。'
    ),
    localized(
      'The key reference establishes minor i with major V. In the phrase, a major V contains raised degree 7; minor v keeps the lowered seventh. Follow the final chord: i returns home, while VI is a major chord on lowered degree 6.',
      '参考音用大三和弦 V 与小三和弦 i 建立小调。乐句中的大三和弦 V 包含升高的第七级，小三和弦 v 保留降第七级。末尾 i 回到主和弦，而 VI 是降第六级上的大三和弦。'
    ),
    [
      choice('i-iv-V-i', 'i–iv–V–i', 'i–iv–V–i'),
      choice('i-iv-v-i', 'i–iv–v–i', 'i–iv–v–i'),
      choice('i-iv-V-VI', 'i–iv–V–VI', 'i–iv–V–VI'),
    ],
    'minor'
  )
);

LESSONS.push(
  topic(
    'guitar-strums',
    'triads',
    'triad',
    localized('Guitar strum colors', '扫弦里的和弦色彩'),
    localized(
      'Recognize major and minor through changing guitar voicings.',
      '换着吉他指型扫弦，仍然听出大小三和弦。'
    ),
    localized(
      'A downstroke crosses the played strings from low E toward high E. Notes overlap rather than becoming a scale. Open strings, barre shapes and upper positions change the spacing and doubled notes, but the third still defines major or minor. These are sample-based strum simulations.',
      '下扫按弦序从低音弦扫向高音弦，音的尾音相互重叠，不是逐音弹音阶。开放和弦、横按与高把位改变间距和重复音，但三音仍然决定大三或小三和弦。这里使用采样音色模拟扫弦。'
    ),
    triads.slice(0, 2),
    'guitar'
  )
);

export const CHAPTERS: Chapter[] = [
  {
    id: 'home',
    title: localized('A sense of home', '听见主音与调性'),
    description: localized(
      'Keep a tonic in mind, then hear the notes around it in major and minor.',
      '在心里保持主音，听见大调与小调中围绕它的音。'
    ),
    symbol: '♩',
    lessonIds: [
      'degrees-core',
      'degrees-neighbors',
      'degrees-diatonic',
      'degrees-minor',
    ],
  },
  {
    id: 'melody',
    title: localized('Melody in motion', '旋律中的音程'),
    description: localized(
      'Echo musical distances upward, downward and together.',
      '轻唱或想象上行、下行与同时发声的音乐距离。'
    ),
    symbol: '♪',
    lessonIds: [
      'intervals-steps',
      'intervals-core',
      'intervals-descending',
      'intervals-harmonic',
      'intervals-context',
    ],
  },
  {
    id: 'triads',
    title: localized('The colors inside a chord', '和弦内部的色彩'),
    description: localized(
      'Hear thirds and fifths as blocks, arpeggios and changing voicings.',
      '在同时发声、分解与改变排列的和弦中听见三度和五度。'
    ),
    symbol: '♫',
    lessonIds: [
      'triads-core',
      'triads-diminished',
      'triads-arpeggiated',
      'triads-voiced',
      'guitar-strums',
    ],
  },
  {
    id: 'bass',
    title: localized('The bass tells a story', '低音怎样讲述音乐'),
    description: localized(
      'Separate bass from root and follow the lowest voice through harmony.',
      '分清低音与根音，跟随和声中的最低声部。'
    ),
    symbol: '𝄢',
    lessonIds: [
      'inversions-core',
      'inversions-open',
      'inversions-context',
      'bass-motion',
    ],
  },
  {
    id: 'sevenths',
    title: localized('Beyond three notes', '三和弦之外'),
    description: localized(
      'Hear the seventh change a chord’s color, then find it in the bass.',
      '听七音怎样改变和弦色彩，再辨认它何时成为低音。'
    ),
    symbol: '♬',
    lessonIds: ['sevenths-core', 'sevenths-diminished', 'sevenths-inversions'],
  },
  {
    id: 'phrases',
    title: localized('Hearing musical sentences', '听懂音乐句子'),
    description: localized(
      'Connect chords into direction, endings and major or minor routes.',
      '把和弦连接为有方向、有结尾的大调或小调路线。'
    ),
    symbol: '𝄐',
    lessonIds: [
      'functions-core',
      'functions-predominant',
      'cadences-core',
      'progressions-major',
      'progressions-minor',
    ],
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
const intervalOffsets: Record<string, number> = {
  m2: 1,
  M2: 2,
  m3: 3,
  M3: 4,
  P4: 5,
  TT: 6,
  P5: 7,
};
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

const seventhOffsets: Record<string, number[]> = {
  maj7: [0, 4, 7, 11],
  dom7: [0, 4, 7, 10],
  min7: [0, 3, 7, 10],
  'half-dim7': [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
};
const invert = (notes: number[], index: number): number[] => [
  ...notes.slice(index),
  ...notes.slice(0, index).map(note => note + 12),
];
/** Shift a whole voicing by octaves, preserving every member and its actual bass. */
function fitChord(notes: number[]): number[] {
  const result = [...notes].sort((a, b) => a - b);
  while (result[0] < PRACTICE_MIDI_RANGE[0])
    for (let index = 0; index < result.length; index++) result[index] += 12;
  while (result[result.length - 1] > PRACTICE_MIDI_RANGE[1])
    for (let index = 0; index < result.length; index++) result[index] -= 12;
  return result;
}
const chordDefinitions: Record<
  string,
  { root: number; quality: 'major' | 'minor' }
> = {
  I: { root: 0, quality: 'major' },
  ii: { root: 2, quality: 'minor' },
  IV: { root: 5, quality: 'major' },
  V: { root: 7, quality: 'major' },
  vi: { root: 9, quality: 'minor' },
  i: { root: 0, quality: 'minor' },
  iv: { root: 5, quality: 'minor' },
  v: { root: 7, quality: 'minor' },
  VI: { root: 8, quality: 'major' },
};
const chordNotes = (symbol: string, tonic: number): number[] => {
  const definition = chordDefinitions[symbol];
  return triadOffsets[definition.quality].map(
    offset => tonic + definition.root + offset
  );
};
const phrase = (symbols: string[], tonic: number, gap = 1.1): PracticeEvent[] =>
  symbols.flatMap((symbol, index) =>
    block(
      chordNotes(symbol, tonic),
      index * gap,
      index === symbols.length - 1 ? 1.5 : 0.82
    )
  );
const rootsOnly = (symbols: string[], tonic: number): PracticeEvent[] =>
  symbols.map((symbol, index) =>
    event(tonic + chordDefinitions[symbol].root, index * 1.1, 0.82)
  );
const cadencePhrases: Record<string, string[]> = {
  authentic: ['I', 'IV', 'V', 'I'],
  half: ['I', 'vi', 'ii', 'V'],
  plagal: ['I', 'V', 'IV', 'I'],
  deceptive: ['I', 'IV', 'V', 'vi'],
};
const bassPairs: Record<string, number[][]> = {
  hold: [
    [0, 4, 7],
    [0, 4, 9],
  ],
  'up-step': [
    [4, 7, 12],
    [5, 9, 12],
  ],
  'down-step': [
    [5, 9, 12],
    [4, 7, 12],
  ],
  'up-fifth': [
    [0, 4, 7],
    [7, 11, 14],
  ],
  'down-fifth': [
    [7, 11, 14],
    [0, 4, 7],
  ],
};

/** Voice-led I–IV–V–I key context (not a root-position cadence). */
function cadence(tonic: number, minor = false): PracticeEvent[] {
  const voicings = [
    [0, minor ? 3 : 4, 7],
    [0, 5, minor ? 8 : 9],
    [2, 7, 11],
    [0, minor ? 3 : 4, 7],
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
  id: string,
  variant = 0
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
      const offset = answer === 'b3' ? 3 : scaleOffsets[Number(answer) - 1];
      const target = tonic + offset;
      events = [event(target)];
      referenceEvents = cadence(tonic, lesson.mode === 'minor');
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
        b3: localized(
          'Me is a minor third above do: the third of this minor tonic triad. Do-based minor uses me, not the major-key mi.',
          'Me 在 Do 上方小三度，是这个小调主三和弦的三音。以 Do 为主音的小调用 Me，而非大调中的 Mi。'
        ),
        '7': localized(
          'Ti is a major seventh above do, a semitone below the upper tonic.',
          'Ti 在 Do 上方大七度，比高八度主音低一个半音。'
        ),
      };
      explanation =
        lesson.mode === 'minor' && answer === '1'
          ? localized(
              'Do is the tonic of this minor key. A minor key also has a home note; minor does not mean unstable.',
              'Do 是这个小调的主音。小调同样有稳定的主音，小调不等于不稳定。'
            )
          : lesson.mode === 'minor' && answer === '5'
            ? localized(
                'Sol is a perfect fifth above do. The fifth is shared by the major and minor tonic triads.',
                'Sol 在 Do 上方纯五度。大小调主三和弦都含有这个纯五度。'
              )
            : degreeHints[answer];
      break;
    }
    case 'interval': {
      const distance = intervalOffsets[answer];
      const descending = lesson.mode === 'descending';
      const tonalPairs: Record<string, number[]> = {
        m3: [4, 7],
        M3: [0, 4],
        P4: [7, 12],
        P5: [0, 7],
      };
      const notes =
        lesson.mode === 'context'
          ? tonalPairs[answer].map(offset => tonic + offset)
          : descending
            ? [tonic + distance, tonic]
            : [tonic, tonic + distance];
      if (lesson.mode === 'context') referenceEvents = cadence(tonic);
      events =
        lesson.mode === 'harmonic'
          ? block(notes)
          : [event(notes[0], 0, 0.65), event(notes[1], 0.85, 0.9)];
      if (lesson.mode === 'context')
        events = [
          event(tonic, 0, 0.4),
          event(tonic + 7, 0.6, 0.4),
          event(notes[0], 1.2, 0.4),
          event(notes[1], 1.8, 0.8),
        ];
      hintEvents = [event(notes[0], 0, 1), event(notes[1], 1.45, 1)];
      prompt = localized(
        'How far apart are the two notes?',
        '这两个音相距什么音程？'
      );
      if (lesson.mode === 'context')
        prompt = localized(
          'What interval is formed by the final two notes?',
          '短句最后两个音形成什么音程？'
        );
      hint = localized(
        'Hear the same two pitches separately and with a longer pause.',
        '把相同的两个音分开，停顿更长地听一次。'
      );
      explanation = localized(
        `The pitches span ${distance} semitones: ${selected.label.en.toLowerCase()}. ${descending ? 'They move downward.' : lesson.mode === 'harmonic' ? 'They sound together; the hint separates them.' : 'They move upward.'} The starting pitch can change while the distance stays the same.`,
        `两个音相距 ${distance} 个半音，即${selected.label.zh}。${descending ? '这里采用下行。' : lesson.mode === 'harmonic' ? '这里同时发声，提示会将它们分开。' : '这里采用上行。'}起始音高可以改变，但音程距离不变。`
      );
      if (lesson.mode === 'context') {
        const relationships: Record<string, LocalizedText> = {
          m3: localized(
            'Mi–sol is a minor third inside the major tonic triad. The interval quality and the key quality are different ideas.',
            'Mi–Sol 是大调主三和弦内部的小三度。音程性质与调性性质是两回事。'
          ),
          M3: localized(
            'Do–mi is the major third that gives the major tonic triad its quality.',
            'Do–Mi 是让大调主三和弦具有大三和弦性质的大三度。'
          ),
          P4: localized(
            'Sol rises to the upper do by a perfect fourth. It covers five semitones even though sol itself is a fifth above the lower do.',
            'Sol 上行到高八度 Do 是纯四度，相距五个半音；虽然 Sol 本身比低八度 Do 高纯五度。'
          ),
          P5: localized(
            'Do–sol is a perfect fifth: the outer span of the major tonic triad.',
            'Do–Sol 是纯五度，也是大调主三和弦外侧两音之间的距离。'
          ),
        };
        explanation = relationships[answer];
      }
      break;
    }
    case 'triad': {
      const rootNotes = triadOffsets[answer].map(offset => tonic + offset);
      const notes =
        lesson.mode === 'voiced' ? invert(rootNotes, variant % 3) : rootNotes;
      if (lesson.mode === 'guitar') {
        const root = tonic % 12 === 4 ? 'E' : tonic % 12 === 2 ? 'D' : 'A';
        const shapes = getGuitarShapes(`${root}-${answer}` as GuitarChordId);
        const shape = shapes[variant % shapes.length];
        events = buildStrumEvents(shape, {
          speed: 'fast',
          seed: tonic + variant,
        });
      } else {
        events = lesson.mode === 'arpeggiated' ? arpeggio(notes) : block(notes);
      }
      hintEvents =
        lesson.mode === 'guitar'
          ? events.map((item, index) => ({
              ...item,
              time: index * 0.45,
              duration: 0.9,
            }))
          : arpeggio(rootNotes, 0.7);
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
      let notes = voiced.map(offset => tonic + offset);
      if (lesson.mode === 'open')
        notes = fitChord([notes[0], notes[2], notes[1] + 12]);
      if (lesson.mode === 'context')
        referenceEvents = cadence(tonic, !majorInversion);
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
      const offsets: Record<string, number> = {
        I: 0,
        ii: 2,
        IV: 5,
        V: 7,
        vi: 9,
      };
      const root = tonic + offsets[answer];
      const notes = triadOffsets[
        answer === 'vi' || answer === 'ii' ? 'minor' : 'major'
      ].map(offset => root + offset);
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
        ii: localized(
          'ii is a minor triad rooted on degree 2. In a tonal phrase it often prepares V, as IV can, but its third and root distinguish it from IV.',
          'ii 是第 2 级上的小三和弦。在调性乐句中，它常像 IV 一样预备 V；根音与三音把它和 IV 区分开。'
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
    case 'seventh': {
      const offsets = seventhOffsets[answer];
      const notes = offsets.map(offset => tonic + offset);
      events = block(notes);
      hintEvents = arpeggio(notes, 0.65);
      prompt = localized(
        'Which seventh-chord color did you hear?',
        '你听到的是哪种七和弦色彩？'
      );
      hint = localized(
        'Hear the root, third, fifth and seventh unfold.',
        '听根音、三音、五音、七音依次展开。'
      );
      const base =
        answer === 'maj7' || answer === 'dom7'
          ? 'major'
          : answer === 'min7'
            ? 'minor'
            : 'diminished';
      const seventh =
        answer === 'maj7'
          ? 'major'
          : answer === 'dim7'
            ? 'diminished'
            : 'minor';
      explanation = localized(
        `${selected.label.en} combines a ${base} triad with a ${seventh} seventh. From the root, its third, fifth and seventh span ${offsets.slice(1).join(', ')} semitones. Hear the seventh as well as the triad underneath.`,
        `${selected.label.zh}由${base === 'major' ? '大' : base === 'minor' ? '小' : '减'}三和弦加${seventh === 'major' ? '大' : seventh === 'minor' ? '小' : '减'}七度构成。根音上方的三音、五音、七音分别相距 ${offsets.slice(1).join('、')} 个半音。除了底下的三和弦，也要听七音。`
      );
      break;
    }
    case 'seventh-inversion': {
      const quality = ['maj7', 'dom7', 'min7'][variant % 3];
      const rootNotes = seventhOffsets[quality].map(offset => tonic + offset);
      const inversion = answer === 'third' ? 3 : inversionIndexes[answer];
      const notes = invert(rootNotes, inversion);
      events = block(notes);
      hintEvents = [
        event(notes[0], 0, 0.75),
        ...arpeggio(rootNotes, 0.65).map(item => ({
          ...item,
          time: item.time + 1.1,
        })),
      ];
      prompt = localized(
        'Which inversion is this seventh chord in?',
        '这个七和弦采用哪种转位？'
      );
      hint = localized(
        'Hear the bass, then rebuild the same chord from its root.',
        '先听低音，再从根音重建同一和弦。'
      );
      const member = ['root', 'third', 'fifth', 'seventh'][inversion];
      const memberZh = ['根音', '三音', '五音', '七音'][inversion];
      explanation = localized(
        `The ${member} is in the bass: ${selected.label.en.toLowerCase()}. All four chord tones remain. Moving the seventh to the lowest voice creates third inversion, not a different chord quality.`,
        `${memberZh}在低音中，所以是${selected.label.zh}。四个和弦音都保留着。七音成为最低音时得到第三转位，并没有改变和弦性质。`
      );
      break;
    }
    case 'bass-motion': {
      const notes = bassPairs[answer].map(chord =>
        chord.map(offset => tonic + offset)
      );
      events = notes.flatMap((chord, index) => block(chord, index * 1.6, 1.15));
      hintEvents = notes.map((chord, index) =>
        event(Math.min(...chord), index * 1.6, 1.15)
      );
      prompt = localized(
        'How does the lowest pitch move between these chords?',
        '这两个和弦的最低音怎样移动？'
      );
      hint = localized(
        'Hear only the bass line; the upper chord tones are removed.',
        '只听低音线，暂时移除上方和弦音。'
      );
      const movement = Math.min(...notes[1]) - Math.min(...notes[0]);
      explanation = localized(
        `The bass ${movement === 0 ? 'stays on the same pitch while I changes to vi in first inversion' : `moves ${Math.abs(movement)} semitone${Math.abs(movement) === 1 ? '' : 's'} ${movement > 0 ? 'up' : 'down'}`}. Track the actual lowest note, which need not be the root.`,
        `低音${movement === 0 ? '保持同一音高，和声由 I 变成第一转位的 vi' : `${movement > 0 ? '上行' : '下行'} ${Math.abs(movement)} 个半音`}。跟随实际最低音，它不一定是根音。`
      );
      break;
    }
    case 'cadence': {
      const symbols = cadencePhrases[answer];
      events = phrase(symbols, tonic);
      referenceEvents = cadence(tonic);
      hintEvents = phrase(symbols.slice(-2), tonic, 1.7);
      prompt = localized(
        'How does this short phrase end?',
        '这个短乐句怎样结束？'
      );
      hint = localized(
        'Hear just the final two chords, with more space between them.',
        '只听最后两个和弦，停顿更长地比较它们。'
      );
      const endings: Record<string, LocalizedText> = {
        authentic: localized(
          'The phrase ends V–I: the dominant returns to the tonic. This is the authentic cadence family; a perfect authentic cadence also depends on the outer voices.',
          '乐句以 V–I 结束：属和弦回到主和弦。这属于正格终止；完全正格终止还取决于外声部。'
        ),
        half: localized(
          'The phrase ends on V, leaving the dominant as its resting point. A half cadence names that ending chord, not one fixed chord before it.',
          '乐句停在 V，暂时落在属和弦上。半终止由结尾的 V 定义，而非由它之前的某个固定和弦定义。'
        ),
        plagal: localized(
          'The final two chords are IV–I: a plagal return to the tonic. Listen to the bass move from degree 4 to degree 1.',
          '最后两个和弦是 IV–I，以变格方式回到主和弦。听低音从第 4 级回到第 1 级。'
        ),
        deceptive: localized(
          'V goes to minor vi instead of I. The dominant-to-tonic expectation is redirected, even though vi shares two notes with I.',
          'V 走向小三和弦 vi，而非 I。虽然 vi 与 I 共有两个音，原本期待的属到主解决仍然被转向。'
        ),
      };
      explanation = endings[answer];
      break;
    }
    case 'progression': {
      const symbols = answer.split('-');
      events = phrase(symbols, tonic);
      referenceEvents = cadence(tonic, lesson.mode === 'minor');
      hintEvents = rootsOnly(symbols, tonic);
      prompt = localized(
        'Which harmonic route did this phrase follow?',
        '这个乐句走过哪条和声路线？'
      );
      hint = localized(
        'Hear the roots alone, then replay the complete chords.',
        '先单独听根音，再重听完整和弦。'
      );
      const rootRoute = symbols.map(symbol => chordDefinitions[symbol].root);
      const rootDegrees: Record<number, string> = {
        0: '1',
        2: '2',
        5: '4',
        7: '5',
        8: '♭6',
        9: '6',
      };
      const route = rootRoute.map(root => rootDegrees[root]).join('–');
      const detail =
        lesson.mode === 'minor'
          ? answer.includes('-v-')
            ? localized(
                'The minor v keeps the lowered seventh of the key; compare its third with the raised leading tone in major V.',
                '小三和弦 v 保留调性中的降第七级；把其三音与大三和弦 V 中升高的导音比较。'
              )
            : answer.endsWith('-VI')
              ? localized(
                  'Major V contains the raised leading tone, but it turns to major VI rather than returning to i.',
                  '大三和弦 V 包含升高的导音，但转向大三和弦 VI，而非回到 i。'
                )
              : localized(
                  'Minor iv prepares major V, whose raised leading tone resolves toward the minor tonic i.',
                  '小三和弦 iv 预备大三和弦 V，后者升高的导音倾向解决到小调主和弦 i。'
                )
          : answer.includes('-ii-')
            ? localized(
                'Minor ii prepares V, then V returns home. Compare this with the major IV route, which has a different root and third.',
                '小三和弦 ii 预备 V，接着 V 回到主和弦。与大三和弦 IV 的路线比较，它们的根音与三音都不同。'
              )
            : answer === 'I-IV-V-I'
              ? localized(
                  'The phrase leaves I through IV, builds dominant tension on V, and returns to I.',
                  '乐句从 I 经 IV 离开主和弦，在 V 上形成属功能的倾向，再回到 I。'
                )
              : answer === 'I-V-vi-IV'
                ? localized(
                    'After V, minor vi redirects the expected return home. IV keeps the loop moving instead of ending on I.',
                    'V 之后，小三和弦 vi 转移了回到主和弦的期待；IV 继续循环，而非停在 I。'
                  )
                : localized(
                    'Minor vi shares two notes with I; IV then prepares the ending V. The loop ends away from home.',
                    '小三和弦 vi 与 I 共有两个音，IV 随后预备末尾的 V。这个循环停在主和弦之外。'
                  );
      explanation = localized(
        `${selected.label.en}. The root route is ${route}. ${detail.en}`,
        `${selected.label.zh}。根音路线为 ${route}。${detail.zh}`
      );
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
    construction: { quality: majorInversion ? 'major' : 'minor', variant },
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
    lesson.mode === 'guitar'
      ? [45, 40, 50][sampleIndex(3, rng)]
      : (lesson.type === 'degree' || lesson.type === 'interval' ? 55 : 48) +
        sampleIndex(12, rng);
  const majorInversion =
    lesson.type !== 'inversion' || sampleIndex(2, rng) === 0;
  const variant =
    lesson.mode === 'voiced' ||
    lesson.mode === 'guitar' ||
    lesson.type === 'seventh-inversion'
      ? sampleIndex(3, rng)
      : 0;
  const randomId = sampleIndex(0x100000000, rng).toString(36);
  return constructQuestion(
    lesson,
    selected,
    tonic,
    majorInversion,
    `q-${randomId}`,
    variant
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
    lesson.mode === 'guitar'
      ? 45
      : lesson.type === 'degree' || lesson.type === 'interval'
        ? 60
        : 48;
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
      tonic: question.tonic,
      hintEvents: question.hintEvents,
      construction: { ...question.construction },
      events: question.events,
      referenceEvents: question.referenceEvents,
      explanation: question.explanation,
    };
  });
}

/** Same-key contrast; incidental chord quality/voicing does not change when a choice changes. */
export function generateComparisonExample(
  question: PracticeQuestion,
  choiceId: string
): LessonExample | undefined {
  const lesson = getLesson(question.lessonId);
  const selected = lesson?.choices.find(item => item.id === choiceId);
  if (!lesson || !selected) return undefined;
  const comparison = constructQuestion(
    lesson,
    selected,
    question.tonic,
    question.construction.quality === 'major',
    'comparison',
    question.construction.variant
  );
  return {
    choice: { id: selected.id, label: { ...selected.label } },
    tonic: comparison.tonic,
    hintEvents: comparison.hintEvents,
    construction: { ...comparison.construction },
    events: comparison.events,
    referenceEvents: comparison.referenceEvents,
    explanation: comparison.explanation,
  };
}
