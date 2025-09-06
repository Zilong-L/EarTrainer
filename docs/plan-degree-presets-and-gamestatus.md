# DegreeTrainer 共享 Preset 格式与 Challenge GameStatus 分离方案（Plan）

目标：
- FreeTrainer 与 ChallengeMode 共用一份“度位启用 Preset”的格式与应用方法。
- Challenge 的“GameStatus（关卡/解锁/成绩）”独立持久化，Preset 本身不持久化（运行时按 level 载入）。
- FreeTrainer 支持“预设 + 自定义”编辑并持久化。

## 共享 Preset 定义（基于枚举，更语义化）

应使用“级数枚举”而非纯数字 distance，以提高语义清晰度与可维护性。

```ts
// 更语义化的 12 半音级数枚举（命名可按团队风格调整）
export enum ScaleDegree {
  First = 'First',
  FlatTwo = 'FlatTwo',
  Two = 'Two',
  FlatThree = 'FlatThree',
  Three = 'Three',
  Fourth = 'Fourth',
  FlatFifth = 'FlatFifth',
  Fifth = 'Fifth',
  FlatSix = 'FlatSix',
  Six = 'Six',
  FlatSeven = 'FlatSeven',
  Seven = 'Seven',
}

export type DegreePreset = {
  id: string;                 // 唯一标识，如 'ionian' 或 'LEVEL_1'
  name: string;               // 展示名
  enabledDegrees: ScaleDegree[]; // 采用级数表达，更可读
  source?: 'free' | 'challenge'; // 可选：来源标注
};

// 可选：布尔掩码表达（内部工具用），长度 12，按 degrees 固定顺序
export type DegreeMaskPreset = {
  id: string;
  name: string;
  mask: boolean[];
  source?: 'free' | 'challenge';
};

// 映射关系：级数 ↔️ 半音距离（C 为 0）
export const degreeToDistance: Record<ScaleDegree, number> = {
  [ScaleDegree.First]: 0,
  [ScaleDegree.FlatTwo]: 1,
  [ScaleDegree.Two]: 2,
  [ScaleDegree.FlatThree]: 3,
  [ScaleDegree.Three]: 4,
  [ScaleDegree.Fourth]: 5,
  [ScaleDegree.FlatFifth]: 6,
  [ScaleDegree.Fifth]: 7,
  [ScaleDegree.FlatSix]: 8,
  [ScaleDegree.Six]: 9,
  [ScaleDegree.FlatSeven]: 10,
  [ScaleDegree.Seven]: 11,
};

export const distanceToDegree = (d: number): ScaleDegree => {
  const norm = ((d % 12) + 12) % 12;
  return (Object.keys(degreeToDistance) as ScaleDegree[]).find(
    k => degreeToDistance[k] === norm
  )!;
};

// 工具函数（建议放 `src/utils/DegreeTrainer/presets.ts`）
import { degrees } from '@EarTrainers/DegreeTrainer/Constants';

export const degreesToMask = (enabled: ScaleDegree[]): boolean[] => {
  const set = new Set(enabled.map(d => degreeToDistance[d]));
  return degrees.map(d => set.has(d.distance));
};

export const maskToDegrees = (mask: boolean[]): ScaleDegree[] =>
  degrees.filter((_, i) => !!mask[i]).map(d => distanceToDegree(d.distance));

export const applyPresetToDegrees = (preset: DegreePreset) => {
  const enabledDistances = new Set(
    preset.enabledDegrees.map(d => degreeToDistance[d])
  );
  return degrees.map(d => ({ ...d, enable: enabledDistances.has(d.distance) }));
};

// 将挑战关卡 boolean[]（DEGREES_MAP）转为通用枚举型 Preset：
export const levelMaskToPreset = (
  levelKey: string,
  mask: boolean[]
): DegreePreset => ({
  id: levelKey,
  name: levelKey.replace('LEVEL_', 'Level '),
  enabledDegrees: maskToDegrees(mask),
  source: 'challenge',
});
```

## Challenge：Preset + GameStatus 分离

- Preset 来源：从 `DEGREES_MAP['LEVEL_X']` 生成（运行时），不做持久化。
- GameStatus（Zustand + persist）：只存挑战进度。
  - state：`currentLevel: number`, `userProgress: UserProgress[]`, `progressVersion: number`
  - actions：`updateLevel(index)`, `resetUserProgress()`, 迁移/星级/解锁逻辑
  - selector：`currentPreset = levelMaskToPreset('LEVEL_'+(currentLevel+1), DEGREES_MAP[...])`
- 使用：`applyPresetToDegrees(currentPreset)` 获取 `currentNotes`，其余逻辑保持不变。

## FreeTrainer：Preset + Customized 持久化

- Preset 来源：沿用 `Games/Free/presets.ts` 的 `modes`（基于 distances），转换为 `DegreePreset` 列表。
- Store（Zustand + persist）：
  - state：
    - `selectedPresetId: string`
    - `customNotes: { name: string; distance: number; enable: boolean }[]`
  - actions：
    - `selectPreset(id)`：根据 preset 生成新的 `customNotes`
    - `toggleDegree(index)`：切换启用，校验“至少保留一个启用”
    - `setCustomNotes(notes)`：整表替换（用于导入/模式应用）
- 使用：UI 下拉选择预设 + 勾选自定义，刷新后保持。

## 复用点与边界

- 复用点：
  - 统一的 `DegreePreset` 类型
  - 统一的应用方法 `applyPresetToDegrees`
  - 互转工具（distances ↔ mask）
- 边界：
  - Challenge 的 Preset 不写入持久化；仅 GameStatus 持久化。
  - FreeTrainer 的 Preset 可作为“初始模板”，用户改动写入 `customNotes`，不反写到挑战侧。

## 数据流简图

- Challenge：`currentLevel` → `DEGREES_MAP[level] (mask)` → `levelMaskToPreset` → `applyPresetToDegrees` → `currentNotes`
- Free：`selectedPresetId` → `modes[preset].intervals → enabledDegrees (enum)` → `applyPresetToDegrees` → `customNotes`（可继续用户编辑）

## 迁移与兼容

- Free 迁移：
  - 旧 `localStorage('degreeTrainerCustomNotes')` → 初始化写入 `customNotes`（仅首次 rehydrate）
- Challenge 迁移：
  - 沿用现有 `useLocalStorage` 的字段迁移到新的 GameStatus store（若实施）；不涉及 Preset 数据。

## 实施步骤（建议）

1) 新增 `utils/DegreeTrainer/presets.ts`：实现 `DegreePreset`、互转与 `applyPresetToDegrees`。
2) FreeTrainer：新增 `degreeFreeTrainerStore.ts` 并接入 UI/Hook，移除旧 `localStorage` 读写。
3) Challenge：保留现结构；将生成 `currentNotes` 的逻辑统一走 `levelMaskToPreset` + `applyPresetToDegrees`（不改变现有行为）。
4) 验证：两模式下的出题范围、播放、最少保留校验、刷新持久化均正确。

---
如需，我可以按此计划开始落地 FreeTrainer store 与工具函数，随后再统一 Challenge 的 preset 应用路径。
