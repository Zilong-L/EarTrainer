import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLesson, text } from '../practice/model';
import useTrainingProgress from './useTrainingProgress';

/** Earlier records are kept intact; open listening does not create session scores. */
export default function ProgressPage() {
  const { i18n } = useTranslation();
  const zh = i18n.language.startsWith('zh');
  const { progress, summary } = useTrainingProgress();
  const savedLessons = Object.entries(summary.lessons).filter(
    ([, value]) => value.completedSessions > 0
  );
  return (
    <main className="music-archive">
      <header className="music-page-heading">
        <h1>{zh ? '以前的练习记录' : 'Earlier practice'}</h1>
        <p>
          {zh
            ? '之前保存的短练记录仍在这里。现在的聆听只记住音量与上次的主题，不生成分数或打卡记录。'
            : 'Your earlier saved sessions are still here. Open listening remembers your volume and last topic, without creating scores or daily records.'}
        </p>
      </header>
      {savedLessons.length ? (
        <ul className="music-archive-list">
          {savedLessons.map(([id, result]) => {
            const lesson = getLesson(id);
            return (
              lesson && (
                <li key={id}>
                  <Link to={`/learn/${id}`}>
                    {text(lesson.title, i18n.language)}
                  </Link>
                  <span>
                    {zh
                      ? `${result.completedSessions} 次原有短练`
                      : `${result.completedSessions} earlier sessions`}{' '}
                    · {Math.round(result.accuracy * 100)}%
                  </span>
                </li>
              )
            );
          })}
        </ul>
      ) : (
        <p className="music-archive-empty">
          {zh
            ? '这个浏览器里没有以前的短练记录。'
            : 'There are no earlier sessions in this browser.'}
        </p>
      )}
      {progress.sessions.length > 0 && (
        <details className="music-archive-details">
          <summary>{zh ? '最近保存的记录' : 'Recent saved sessions'}</summary>
          <ul className="music-archive-list">
            {[...progress.sessions]
              .sort((a, b) => b.completedAt - a.completedAt)
              .slice(0, 10)
              .map(session => {
                const lesson = getLesson(session.lessonId);
                const correct = session.results.filter(
                  result =>
                    result.firstAttemptCorrect === true &&
                    !result.usedHint &&
                    !result.revealed &&
                    !result.skipped
                ).length;
                return (
                  lesson && (
                    <li key={session.id}>
                      <div>
                        {text(lesson.title, i18n.language)}
                        <small>
                          {new Intl.DateTimeFormat(zh ? 'zh-CN' : 'en', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          }).format(session.completedAt)}
                        </small>
                      </div>
                      <span>
                        {correct}/{session.results.length}{' '}
                        {zh ? '独立首答' : 'unaided first tries'}
                      </span>
                    </li>
                  )
                );
              })}
          </ul>
        </details>
      )}
      <Link to="/learn" className="music-studio-path">
        {zh ? '回到音乐里' : 'Back to the music'} →
      </Link>
    </main>
  );
}
