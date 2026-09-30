import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { CHAPTERS, getLesson, text } from '../practice/model';

export default function LearnPage() {
  const { i18n } = useTranslation();
  const zh = i18n.language.startsWith('zh');
  return (
    <main className="music-path">
      <header className="music-page-heading">
        <p className="music-eyebrow">
          {zh ? '从一个音，到音乐的语言' : 'FROM SOUND TO MUSICAL LANGUAGE'}
        </p>
        <h1>{zh ? '聆听路线' : 'The listening path'}</h1>
        <p>
          {zh
            ? '顺着听，也可以从任何地方走进去。把同一个关系放进不同的声音里，慢慢听清楚。'
            : 'Follow it in order, or step in anywhere. Hear the same relationship in different musical settings.'}
        </p>
      </header>
      {CHAPTERS.map((chapter, index) => (
        <section
          key={chapter.id}
          id={
            index === 0
              ? 'tonal'
              : index === 2
                ? 'harmony'
                : index === 5
                  ? 'movement'
                  : chapter.id
          }
          className="music-chapter"
        >
          <div className="music-chapter-intro">
            <span className="music-chapter-number">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="music-chapter-symbol" aria-hidden="true">
              {chapter.symbol}
            </span>
            <h2>{text(chapter.title, i18n.language)}</h2>
            <p>{text(chapter.description, i18n.language)}</p>
          </div>
          <div className="music-chapter-topics">
            {chapter.lessonIds.map((id, topicIndex) => {
              const lesson = getLesson(id);
              return (
                lesson && (
                  <Link key={id} to={`/learn/${id}`} className="music-topic">
                    <span className="music-topic-number">{topicIndex + 1}</span>
                    <div>
                      <h3>{text(lesson.title, i18n.language)}</h3>
                      <p>{text(lesson.description, i18n.language)}</p>
                    </div>
                    <ArrowRightIcon aria-hidden="true" />
                  </Link>
                )
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
