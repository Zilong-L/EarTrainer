import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { LESSONS, text } from '../practice/model';
import useTrainingProgress from './useTrainingProgress';

export default function ProgressPage() {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const zh = language.startsWith('zh');
  const { progress, summary } = useTrainingProgress();
  const t = summary.totals;
  return (
    <main>
      <header className="trainer-page-heading">
        <p className="trainer-eyebrow">
          {zh ? '让每次认真聆听，都留下痕迹' : 'NOTICE WHAT IS GETTING CLEARER'}
        </p>
        <h1>{zh ? '你的听觉进度' : 'Your listening progress'}</h1>
        <p>
          {zh
            ? '这里记录完整短练的无辅助首答表现。反复播放与调性参照不扣分；提示、揭晓和跳过会单独标记。'
            : 'A clear view of unaided first responses in completed sessions. Replay and tonal reference are free; hints, reveals and skips are recorded separately.'}
        </p>
      </header>
      <div className="trainer-progress-grid">
        <div className="trainer-metric">
          <strong>{t.sessions}</strong>
          <span>{zh ? '完整短练' : 'Completed sessions'}</span>
        </div>
        <div className="trainer-metric">
          <strong>
            {t.questions ? `${Math.round(t.accuracy * 100)}%` : '—'}
          </strong>
          <span>{zh ? '无辅助首答正确率' : 'Unaided first-try accuracy'}</span>
        </div>
        <div className="trainer-metric">
          <strong>{t.questions}</strong>
          <span>{zh ? '完成的听辨题' : 'Questions completed'}</span>
        </div>
        <div className="trainer-metric">
          <strong>{t.activeDays}</strong>
          <span>{zh ? '练习过的日子' : 'Days with practice'}</span>
        </div>
      </div>
      {t.sessions === 0 ? (
        <section className="trainer-empty">
          <h2>
            {zh ? '从第一次聆听开始' : 'Your first listen starts the story'}
          </h2>
          <p>
            {zh
              ? '完成一组 8 题练习后，这里会出现真实的记录。不用追赶分数，先把声音听清楚。'
              : 'Finish one 8-question session to see your own listening patterns here. Start with noticing the sound, not chasing a score.'}
          </p>
          <Link to={`/practice/${LESSONS[0].id}`}>
            {zh ? '开始短练' : 'Start a short session'}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </section>
      ) : (
        <>
          <section>
            <div className="trainer-section-heading">
              <h2>{zh ? '每种技能，分别看' : 'One skill at a time'}</h2>
            </div>
            <div className="trainer-skill-results">
              {LESSONS.map(lesson => {
                const result = summary.lessons[lesson.id];
                return (
                  <article className="trainer-skill-result" key={lesson.id}>
                    <div className="trainer-skill-result-head">
                      <div>
                        <h3>{text(lesson.title, language)}</h3>
                        <p>
                          {result.attempts
                            ? zh
                              ? `${result.completedSessions} 次短练 · ${result.attempts} 题`
                              : `${result.completedSessions} sessions · ${result.attempts} questions`
                            : zh
                              ? '还没有完整短练记录'
                              : 'No completed session yet'}
                        </p>
                      </div>
                      <strong>
                        {result.attempts
                          ? `${Math.round(result.accuracy * 100)}%`
                          : '—'}
                      </strong>
                    </div>
                    <div
                      className="trainer-skill-result-meter"
                      aria-hidden="true"
                    >
                      <span
                        style={{
                          width: `${Math.round(result.accuracy * 100)}%`,
                        }}
                      />
                    </div>
                    <p>
                      {result.status === 'ready' || result.status === 'solid'
                        ? zh
                          ? '已累积足够的独立答题与调性覆盖，可以试试进阶'
                          : 'Enough independent responses and key coverage to try the next step'
                        : result.needsReview
                          ? zh
                            ? '建议再听一组，重点比较容易混淆的声音'
                            : 'Try another session and compare the sounds that feel similar'
                          : zh
                            ? '继续积累不同调性的练习，再观察是否稳定'
                            : 'Build more practice across keys before looking for consistency'}
                    </p>
                    <Link to={`/practice/${lesson.id}`}>
                      {zh ? '练习这项技能' : 'Practice this skill'}
                      <ArrowUpRightIcon aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>
          <section className="trainer-section">
            <div className="trainer-section-heading">
              <h2>{zh ? '最近的练习' : 'Recent listening'}</h2>
            </div>
            <ul className="trainer-recent-list">
              {[...progress.sessions]
                .sort((a, b) => b.completedAt - a.completedAt)
                .slice(0, 5)
                .map(session => {
                  const lesson = LESSONS.find(
                    value => value.id === session.lessonId
                  )!;
                  const independent = session.results.filter(
                    result =>
                      result.firstAttemptCorrect === true &&
                      !result.usedHint &&
                      !result.revealed &&
                      !result.skipped
                  ).length;
                  return (
                    <li key={session.id}>
                      <div>
                        <h3>{text(lesson.title, language)}</h3>
                        <p>
                          {new Intl.DateTimeFormat(zh ? 'zh-CN' : 'en', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          }).format(session.completedAt)}
                        </p>
                      </div>
                      <strong>
                        {independent} / 8{' '}
                        {zh ? '独立首答' : 'unaided first tries'}
                      </strong>
                    </li>
                  );
                })}
            </ul>
          </section>
        </>
      )}
      <aside className="trainer-progress-note">
        <h2>
          {zh
            ? '诚实记录，比一个高分更有用'
            : 'Useful progress is honest progress'}
        </h2>
        <p>
          {zh
            ? `提示 ${t.assisted} 题 · 揭晓 ${t.revealed} 题 · 跳过 ${t.skipped} 题。进阶建议至少需要 3 次短练、24 题、每个答案类别的覆盖、不同调性与 80% 的无辅助首答表现；这是产品建议，不是能力认证。`
            : `${t.assisted} hinted · ${t.revealed} revealed · ${t.skipped} skipped. Guidance needs at least 3 sessions, 24 questions, coverage of every answer class and multiple keys, and 80% unaided first-try accuracy. This is product guidance, not a mastery certificate.`}
        </p>
        <p style={{ marginTop: 12 }}>
          {zh
            ? '记录仅在当前浏览器保存，最多保留最近 200 次完整短练；清理浏览器数据、换设备或无痕模式可能无法保留。原有实验室的记录没有合并进来。'
            : 'Saved only in this browser, with the latest 200 completed sessions kept. Clearing browser data, switching devices or private browsing may lose history. Existing lab records remain separate.'}
        </p>
      </aside>
    </main>
  );
}
