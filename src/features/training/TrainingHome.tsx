import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PlayIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import { getLesson, text } from '../practice/model';
import { getListeningPreferences } from '../practice/listeningPreferences';

export default function TrainingHome() {
  const { i18n } = useTranslation();
  const zh = i18n.language.startsWith('zh');
  const lesson =
    getLesson(getListeningPreferences().lastLessonId) ??
    getLesson('degrees-core')!;
  const worlds = [
    {
      to: '/learn#tonal',
      number: '01',
      title: zh ? '旋律里的引力' : 'The pull of a melody',
      description: zh
        ? '主音、音级与旋律的方向'
        : 'Tonal anchors, scale degrees and melodic direction',
      notes: 'do · re · mi',
    },
    {
      to: '/learn#harmony',
      number: '02',
      title: zh ? '和弦的内在色彩' : 'Inside a chord',
      description: zh
        ? '三音、七音与低音的变化'
        : 'Thirds, sevenths and a changing bass',
      notes: '△ · m · 7',
    },
    {
      to: '/learn#movement',
      number: '03',
      title: zh ? '音乐怎样流动' : 'Where harmony goes',
      description: zh
        ? '低音路线、和弦进行与乐句落点'
        : 'Bass routes, progressions and phrase endings',
      notes: 'I → V → I',
    },
  ];
  return (
    <main className="music-home">
      <section className="music-home-hero">
        <div className="music-hero-copy">
          <p className="music-eyebrow">
            {zh ? '在声音里，理解音乐' : 'A PLACE TO LISTEN'}
          </p>
          <h1>
            {zh ? (
              <>
                听见音乐
                <br />
                里面的关系
              </>
            ) : (
              <>
                A little closer
                <br />
                to the music
              </>
            )}
          </h1>
          <p className="music-home-description">
            {zh
              ? '从一个音，到一段旋律，再到和声的流动。'
              : 'From a note to a melody. From a chord to the way it moves.'}
          </p>
          <Link
            to={`/practice/${lesson.id}`}
            className="music-primary music-start"
          >
            <PlayIcon aria-hidden="true" />
            {zh ? '开始聆听' : 'Start listening'}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
          <span className="music-current-sound">
            {text(lesson.title, i18n.language)}
          </span>
        </div>
        <div className="music-hero-drawing" aria-hidden="true">
          <div className="music-staff">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="music-note note-a" />
          <div className="music-note note-b" />
          <div className="music-note note-c" />
          <div className="music-note note-d" />
          <svg viewBox="0 0 480 360">
            <path d="M35 263 C105 110 227 348 425 133" />
            <path d="M65 280 C182 211 304 292 422 185" />
          </svg>
          <span>
            {zh ? '每个声音，都与下一个相连' : 'Every sound leads somewhere'}
          </span>
        </div>
      </section>
      <section className="music-worlds">
        <header>
          <h2>{zh ? '沿着音乐走' : 'Follow the music'}</h2>
          <Link to="/learn">
            {zh ? '完整聆听路线' : 'The listening path'}{' '}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </header>
        <div className="music-world-grid">
          {worlds.map(world => (
            <Link to={world.to} key={world.number} className="music-world">
              <span className="music-world-notes" aria-hidden="true">
                {world.notes}
              </span>
              <span className="music-world-number">{world.number}</span>
              <h3>{world.title}</h3>
              <p>{world.description}</p>
              <ArrowUpRightIcon aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
