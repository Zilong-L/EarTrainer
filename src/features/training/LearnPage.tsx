import { useTranslation } from 'react-i18next';
import { LESSONS } from '../practice/model';
import LessonCard from './LessonCard';
import useTrainingProgress from './useTrainingProgress';

export default function LearnPage() {
  const { i18n } = useTranslation();
  const zh = i18n.language.startsWith('zh');
  const { summary } = useTrainingProgress();
  return (
    <main>
      <header className="trainer-page-heading">
        <p className="trainer-eyebrow">
          {zh ? '一步一步，建立听觉地图' : 'BUILD YOUR LISTENING MAP'}
        </p>
        <h1>{zh ? '你的学习路线' : 'Your learning path'}</h1>
        <p>
          {zh
            ? '先建立调性感，再听音程与和弦。所有练习都可以自由进入，进阶提示来自多次练习，不是一道题的结果。'
            : 'Find a tonal center, then explore intervals and harmony. Every lesson is open; progress guidance comes from several sessions, never a single answer.'}
        </p>
      </header>
      <div className="trainer-path-note">
        <span>{zh ? '先认识声音' : 'Meet the sound'}</span>
        <span aria-hidden="true">→</span>
        <span>{zh ? '8 题专注听辨' : '8 focused questions'}</span>
        <span aria-hidden="true">→</span>
        <span>{zh ? '对比、复盘、再练' : 'Compare, reflect, repeat'}</span>
      </div>
      <div className="trainer-lesson-grid">
        {LESSONS.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            language={i18n.language}
            index={index}
            status={summary.lessons[lesson.id].status}
            accuracy={summary.lessons[lesson.id].accuracy}
          />
        ))}
      </div>
      <p className="trainer-footnote">
        {zh
          ? '“可进阶”是练习建议，不是掌握能力的认证。换一个调、隔天再听，能帮助检验是否真的听熟了。'
          : '“Ready to grow” is practice guidance, not a mastery certificate. Try another key and come back on a different day to check what feels familiar.'}
      </p>
    </main>
  );
}
