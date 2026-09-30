# EarTrainer · 在声音里理解音乐

2026-09-30 · 开发预览

## 音乐优先

首页提供一个直接的聆听入口；学习路线按相互关联的音乐主题展开；自由工作室保留原有音级、和弦与键盘/MIDI 工具。主导航为「聆听 / 路线 / 工作室」。没有每日任务、打卡、连胜、过关或强制课后报告。

解释与练习分开：

- `/learn/:lessonId`：独立的声音与图文解释页，示例音、实际 MIDI 对应的钢琴与音程/和弦/低音图形、播放关联的音符与乐句画面。学习示例公开名称，支持慢慢比较
- `/practice/:lessonId`：干净的连续听辨空间，只保留播放/停止、选择、简短声音对比、继续与音量。想了解原理时点「理解这个声音」，没有常驻解释或教学动画
- 首次进入练习不会自动发声。点击播放开始；点击「继续」或「换一个声音」代表明确请求播放下一个声音。不会自动倒数，也不会在八题后跳到总结

## 聆听路线

六个开放章节，由调性参照走向真实和声语境：

1. 主音与调性：Do/Mi/Sol、相邻音级、完整大调音级、小调主三和弦锚点
2. 旋律中的音程：半音/全音/纯四度、三度与五度、下行距离、同时发声音程、短旋律中的末尾音程
3. 和弦内部的色彩：大小三和弦、减三和弦、分解和弦、改变转位之后的性质
4. 低音怎样讲述音乐：密集转位、开放排列、调性中的主和弦转位、两和弦之间的低音保持/级进/五度运动
5. 三和弦之外：大七/属七/小七、半减七与全减七、非对称七和弦的四种低音
6. 音乐句子：大调和弦功能、ii 与 IV 的预备关系、终止类型、四和弦大调路线、小调中 V/v 与 VI 的区别

课程全部开放，不用答题次数或分数解锁。课程中新增的音型、和弦进行与 MIDI 示例由本项目生成，不复制外部教学录音。范围是相对听觉与基础调性/和弦关系；不宣称已经覆盖真实歌曲听写、完整节奏训练、唱音评估、所有调式、所有爵士和声或云端账户。

## 教学与生成边界

- 音级在先建立的大调或小调参照里听；小调使用以 Do 为主音的 1、♭3、5，避免把 Mi 和 Me 混淆
- 音程距离与起始绝对音高区分，包含上行、下行、同时发声与短旋律语境；指定目标始终明确
- 三和弦性质取决于根音上的三音/五音，不能用「快乐/悲伤」取代定义；排列改变不等于性质改变
- 转位由实际最低和弦成员决定。开放排列保留全部成员，并对整个和弦作八度移动；不会为了限音域而删掉定义音
- 减七和弦的对称结构会使孤立转位的根音认定有歧义，因此只提供明确原位参照的性质比较，不用于转位听辨
- 终止练习区分宽泛的正格、半终止、变格与阻碍类型；不把所有 V–I 都称为完全正格终止。功能解释限于给定调性语境
- 七和弦包含全部四个成员；大七/属七/小七按实际三度与七度组合，第三转位确实以七音为低音
- 目标、参照、提示与对比均在 MIDI 48–79，时值与事件起始有限且合法
- 答案类别先均匀抽取，再独立抽取调性/根音及排列。允许连续出现相同类别，避免二选一交替泄漏
- 重播不换音。回答后的 A/B 对比保持目标根音/调性和无关排列条件，只改变要比较的类别
- 未回答时不显示目标音名、标记键盘、谱面、答案相关动画或无障碍标签。学习页的命名示例与练习页是独立路由

## 记录更轻

连续聆听不写入题目、答案、分数或每日记录，只在当前浏览器记住上次的主题与音量。存储损坏或不可用不会妨碍播放。

以前的完整八题短练记录与原有实验室数据保持兼容，不删除、不迁移成新的成绩。旧短练只在页脚的「以前的记录」里查看。原有保存/校验/进度代码保留供既有数据读取，不再驱动首页或路径。

## 声音与可访问性

- 始终有停止；停止、离开路由、隐藏页面或更换例子会取消已排队/仍在加载的旧播放
- 音量控件、音色加载回退与错误重试保留。默认使用较低的软件音量；设备实际声压仍由设备与耳机决定
- 只有完整听完目标才启用答题；加载或参照被打断不会被误当作已经听到目标
- 快速重复答题不会改变已选答案；快速重复「继续」不会跳过多题；声音对比不会把选择变成分数
- 触摸控件至少 48 CSS 像素，窄屏重排，键盘焦点可见，文字与符号反馈不只依赖颜色
- 学习页动态尊重减少动态效果；练习页无教学动画。不会在切换回隐藏页之后突然恢复播放
- 模拟单元测试不能替代真实 iPhone/Safari、耳机音质与 MIDI 硬件验证

## 参考依据

- [Baylor Ear Training Compendium · Scale degrees](https://openbooks.library.baylor.edu/eartraining/chapter/unit-1-scale-degrees/)：在调性参照中建立相对音级
- [University of Idaho Integrated Aural Skills · Melodic dictation](https://uidaho.pressbooks.pub/auralskills/chapter/ear-training-introduction-to-melodic-dictation/)：用稳定的主三和弦音建立锚点
- [Open Music Theory · Triads](https://viva.pressbooks.pub/openmusictheory/chapter/triads/)：三和弦性质、成员与转位
- [Open Music Theory · Seventh chords](https://viva.pressbooks.pub/openmusictheory/chapter/seventh-chords/)：七和弦结构与转位
- [Integrated Music Theory · Triads and seventh chords](https://intmus.github.io/inttheory20-21/03-triads-7chords-leadsheet/a1-triads.html)：和弦成员及七和弦结构
- [University of Idaho · Intervals through key relationships](https://idaho.pressbooks.pub/auralskills/chapter/intervals-through-key-relationships/)：音程与调性位置的区别
- [Music Theory for the 21st-Century Classroom · Harmonic function](https://musictheory.pugetsound.edu/mt21c/HarmonicFunction.html)：主、属与预备属的语境
- [Open Music Theory · Augmented options](https://viva.pressbooks.pub/openmusictheory/chapter/augmented-options/)：对称和弦与根音歧义的背景
- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)、[Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)、[Audio control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html)：窄屏、触摸与声音控制

课程顺序、示例音型、音域、播放节奏与界面设计是产品选择，不是经过学习效果试验验证的最优方案。没有「科学认证掌握」、绝对音感、保证迁移到真实歌曲或医疗效果的宣称。
