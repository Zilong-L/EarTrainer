import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { text, type Lesson } from '../practice/model';

export default function LessonCard({
  lesson,
  language,
  status = 'new',
  accuracy,
  index,
}: {
  lesson: Lesson;
  language: string;
  status?: string;
  accuracy?: number;
  index: number;
}) {
  const zh = language.startsWith('zh');
  const done = status === 'ready' || status === 'solid';
  return (
    <Link to={`/practice/${lesson.id}`} className="trainer-lesson-card">
      <div className="trainer-lesson-top">
        <span className="trainer-lesson-number">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className={`trainer-lesson-status ${done ? 'is-ready' : ''}`}>
          {done ? (
            <>
              <CheckIcon aria-hidden="true" />
              {zh ? '可进阶' : 'Ready to grow'}
            </>
          ) : status === 'new' ? (
            zh ? (
              '开始探索'
            ) : (
              'Start here'
            )
          ) : zh ? (
            '正在练习'
          ) : (
            'In practice'
          )}
        </span>
      </div>
      <div className="trainer-lesson-content">
        <h3>{text(lesson.title, language)}</h3>
        <p>{text(lesson.description, language)}</p>
      </div>
      <div className="trainer-lesson-bottom">
        <span>
          {zh ? '8 题 · 专注短练' : '8 questions · a short focus'}
          {status !== 'new' && accuracy !== undefined
            ? ` · ${Math.round(accuracy * 100)}%`
            : ''}
        </span>
        <ArrowUpRightIcon aria-hidden="true" />
      </div>
    </Link>
  );
}
