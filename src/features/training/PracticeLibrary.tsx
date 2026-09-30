import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';

export default function PracticeLibrary() {
  const { i18n } = useTranslation();
  const zh = i18n.language.startsWith('zh');
  const labs = [
    {
      to: '/ear-trainer/degree-trainer',
      title: zh ? '调性与旋律' : 'Tonal playground',
      description: zh
        ? '让主音成为参照，自己选择调性与音级。'
        : 'Keep a home note in your ear. Choose the key and degrees.',
      symbol: 'do · mi · sol',
    },
    {
      to: '/ear-trainer/chord-color-trainer',
      title: zh ? '和弦与色彩' : 'Chord colors',
      description: zh
        ? '改变和弦、转位与低音，听它们怎样相互影响。'
        : 'Change the chord, voicing and bass. Hear how they shape each other.',
      symbol: '△ · m · 7',
    },
    {
      to: '/chord-trainer',
      title: zh ? '指尖上的和声' : 'Harmony at your fingertips',
      description: zh
        ? '用键盘或 MIDI，把听见的和弦弹出来。'
        : 'Bring the sounds to a keyboard, on screen or with MIDI.',
      symbol: '▥',
    },
  ];
  return (
    <main className="music-studio">
      <header className="music-page-heading">
        <p className="music-eyebrow">
          {zh ? '留一点空间，自由探索' : 'ROOM TO EXPLORE'}
        </p>
        <h1>{zh ? '音乐工作室' : 'The studio'}</h1>
        <p>
          {zh
            ? '选一个声音，换一种排列，听一听会发生什么。'
            : 'Choose a sound. Move one note. Listen to what changes.'}
        </p>
      </header>
      <div className="music-studio-grid">
        {labs.map(lab => (
          <Link to={lab.to} key={lab.to} className="music-studio-card">
            <span aria-hidden="true">{lab.symbol}</span>
            <h2>{lab.title}</h2>
            <p>{lab.description}</p>
            <ArrowUpRightIcon aria-hidden="true" />
          </Link>
        ))}
      </div>
      <Link to="/learn" className="music-studio-path">
        {zh ? '沿着聆听路线探索' : 'Explore with the listening path'} →
      </Link>
    </main>
  );
}
