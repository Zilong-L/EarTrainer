import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { LESSONS } from '../practice/model';
import LessonCard from './LessonCard';
import useTrainingProgress from './useTrainingProgress';

export default function PracticeLibrary() {
  const { i18n } = useTranslation();
  const zh = i18n.language.startsWith('zh');
  const { summary } = useTrainingProgress();
  const labs = [
    {
      to: '/ear-trainer/degree-trainer',
      title: zh ? '音级自由练习' : 'Scale-degree lab',
      description: zh
        ? '自选音级、调性与练习模式；继续使用原来的记录'
        : 'Choose your degrees, key and practice modes with your existing records',
      symbol: '1 2 3',
    },
    {
      to: '/ear-trainer/chord-color-trainer',
      title: zh ? '和弦听觉实验室' : 'Chord listening lab',
      description: zh
        ? '自选和弦色彩、转位、低音与调性参照'
        : 'Explore chord colors, voicings, bass support and tonal references',
      symbol: '♬',
    },
    {
      to: '/chord-trainer',
      title: zh ? '键盘和弦练习' : 'Keyboard chord lab',
      description: zh
        ? '保留原有的键盘与 MIDI 和弦练习功能'
        : 'Keep exploring the existing keyboard and MIDI chord exercises',
      symbol: '▥',
    },
  ];
  return (
    <main>
      <header className="trainer-page-heading">
        <p className="trainer-eyebrow">
          {zh ? '今天，想把什么听清楚？' : 'WHAT WILL YOU LISTEN FOR?'}
        </p>
        <h1>{zh ? '选择一种练习' : 'Pick your focus'}</h1>
        <p>
          {zh
            ? '短练习有明确的目标与结束；熟悉以后，再到自由实验室探索。'
            : 'Short sessions give you one clear goal and a place to finish. Use the labs when you want to explore further.'}
        </p>
      </header>
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
      <section className="trainer-section">
        <div className="trainer-section-heading">
          <div>
            <p className="trainer-eyebrow">
              {zh ? '自定义与深入练习' : 'CUSTOMIZE & EXPLORE'}
            </p>
            <h2>{zh ? '自由实验室' : 'The practice labs'}</h2>
          </div>
        </div>
        <div className="trainer-lab-grid">
          {labs.map(lab => (
            <Link to={lab.to} key={lab.to}>
              <span className="trainer-lab-symbol" aria-hidden="true">
                {lab.symbol}
              </span>
              <div>
                <h3>{lab.title}</h3>
                <p>{lab.description}</p>
              </div>
              <ArrowUpRightIcon aria-hidden="true" />
            </Link>
          ))}
        </div>
        <p className="trainer-footnote">
          {zh
            ? '原有自由练习统计与新短练统计分别保留，因为答题方式不同。部分实验室针对桌面键盘与 MIDI 设计。'
            : 'Lab statistics and guided-session progress stay separate because they measure different answer flows. Some labs are designed for desktop keyboards and MIDI.'}
        </p>
      </section>
    </main>
  );
}
