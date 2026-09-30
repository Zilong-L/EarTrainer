import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRightIcon,
  PlayIcon,
  SparklesIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import { LESSONS, text } from '../practice/model';
import useTrainingProgress from './useTrainingProgress';

export default function TrainingHome() {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const zh = language.startsWith('zh');
  const { summary } = useTrainingProgress();
  const recommended =
    LESSONS.find(lesson => lesson.id === summary.recommendation) ?? LESSONS[0];
  const started = summary.totals.sessions > 0;
  return (
    <main className="trainer-home">
      <section className="trainer-welcome">
        <div>
          <p className="trainer-eyebrow">
            {zh ? '把音乐，听进心里' : 'LISTEN. NOTICE. GROW.'}
          </p>
          <h1>{zh ? '练出你的音乐直觉' : 'Make listening a habit'}</h1>
          <p>
            {zh
              ? '从一个清楚的声音开始，每次只练一件事'
              : 'Start with one clear sound. Build one skill at a time.'}
          </p>
        </div>
        <span className="trainer-welcome-tag">
          <SparklesIcon aria-hidden="true" />
          {zh ? '为专注的耳朵设计' : 'Made for mindful ears'}
        </span>
      </section>
      <section className="trainer-hero">
        <div className="trainer-hero-content">
          <span className="trainer-hero-label">
            {started
              ? zh
                ? '你的下一步'
                : 'YOUR NEXT LISTEN'
              : zh
                ? '从这里开始'
                : 'A GOOD PLACE TO START'}
          </span>
          <h2>{text(recommended.title, language)}</h2>
          <p>{text(recommended.description, language)}</p>
          <div className="trainer-hero-meta">
            <span>{zh ? '8 道听辨题' : '8 listening questions'}</span>
            <span>{zh ? '自己掌握节奏' : 'At your own pace'}</span>
          </div>
          <Link className="trainer-hero-cta" to={`/practice/${recommended.id}`}>
            <PlayIcon aria-hidden="true" />
            {started
              ? zh
                ? '继续练习'
                : 'Continue practice'
              : zh
                ? '开始第一次练习'
                : 'Start your first practice'}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </div>
        <div className="trainer-hero-art" aria-hidden="true">
          <div className="trainer-sound-orbit orbit-one" />
          <div className="trainer-sound-orbit orbit-two" />
          <div className="trainer-sound-core">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <span className="trainer-floating-note note-one">♪</span>
          <span className="trainer-floating-note note-two">♫</span>
          <div className="trainer-art-caption">
            {zh ? '先听，再想，再确认' : 'Hear it. Feel it. Find it.'}
          </div>
        </div>
      </section>
      <section
        className="trainer-mini-stats"
        aria-label={zh ? '练习概览' : 'Practice overview'}
      >
        <div>
          <strong>{summary.totals.sessions}</strong>
          <span>{zh ? '完成的短练' : 'Sessions completed'}</span>
        </div>
        <div>
          <strong>
            {summary.totals.questions
              ? `${Math.round(summary.totals.accuracy * 100)}%`
              : '—'}
          </strong>
          <span>{zh ? '无辅助首答正确率' : 'Unaided first-try accuracy'}</span>
        </div>
        <div>
          <strong>{summary.totals.activeDays}</strong>
          <span>{zh ? '练习过的日子' : 'Days with practice'}</span>
        </div>
        <Link to="/progress">
          {zh ? '看看进步' : 'See your progress'}
          <ArrowUpRightIcon aria-hidden="true" />
        </Link>
      </section>
      <section className="trainer-section">
        <div className="trainer-section-heading">
          <div>
            <p className="trainer-eyebrow">
              {zh ? '听得清楚，有迹可循' : 'A CLEAR PATH FOR YOUR EAR'}
            </p>
            <h2>{zh ? '从音级，到和声' : 'From a note to a harmony'}</h2>
          </div>
          <Link to="/learn">
            {zh ? '查看学习路线' : 'Explore the path'}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </div>
        <div className="trainer-skill-preview">
          {LESSONS.filter((_lesson, index) => [0, 2, 4].includes(index)).map(
            (lesson, index) => (
              <Link key={lesson.id} to={`/practice/${lesson.id}`}>
                <span
                  className={`trainer-skill-symbol symbol-${index}`}
                  aria-hidden="true"
                >
                  {['1 · 3 · 5', '△ · ◇', '↗'][index]}
                </span>
                <h3>{text(lesson.title, language)}</h3>
                <p>{text(lesson.focus, language)}</p>
                <ArrowUpRightIcon aria-hidden="true" />
              </Link>
            )
          )}
        </div>
      </section>
      <aside className="trainer-listen-note">
        <span aria-hidden="true">◎</span>
        <div>
          <h2>
            {zh
              ? '小声开始，留一点思考的空间'
              : 'Start quietly. Leave room to notice.'}
          </h2>
          <p>
            {zh
              ? '先把设备音量调低。可以反复听，也可以随时停止；猜错之后，慢慢对比声音。练习记录只保存在当前浏览器。'
              : 'Keep your device volume low. Replay freely, stop whenever you need, and compare sounds after an answer. Practice is saved only in this browser.'}
          </p>
        </div>
      </aside>
    </main>
  );
}
