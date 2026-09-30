import { Component, useEffect, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  AcademicCapIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline';
import { getLesson, text } from '../practice/model';
import './training.css';
import './music.css';

export function TrainingError({ children }: { children: ReactNode }) {
  return <TrainingBoundary>{children}</TrainingBoundary>;
}

class TrainingBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="trainer-recovery" role="alert">
          <h1>Let’s get back to listening · 重新开始</h1>
          <p>
            The page couldn’t load. Your saved practice is kept on this device.
          </p>
          <p>页面暂时无法打开，本机已保存的练习记录仍会保留。</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload · 重新加载
          </button>
        </main>
      );
    return this.props.children;
  }
}

const items = [
  { to: '/', icon: HomeIcon, en: 'Listen', zh: '聆听' },
  { to: '/learn', icon: AcademicCapIcon, en: 'Path', zh: '路线' },
  { to: '/practice', icon: MusicalNoteIcon, en: 'Studio', zh: '工作室' },
];

export default function TrainingShell() {
  const { i18n } = useTranslation();
  const zh = i18n.language.startsWith('zh');
  const location = useLocation();
  useEffect(() => {
    document.documentElement.lang = zh ? 'zh-CN' : 'en';
    const currentLesson = getLesson(location.pathname.split('/')[2] ?? '');
    const title =
      location.pathname.startsWith('/learn/') && currentLesson
        ? text(currentLesson.title, i18n.language)
        : location.pathname.startsWith('/practice/')
          ? zh
            ? '聆听'
            : 'Listening'
          : (items.find(item => item.to === location.pathname)?.[
              zh ? 'zh' : 'en'
            ] ?? (zh ? '练耳' : 'Ear training'));
    document.title = `${title} · Ear Trainer`;
    if (location.hash) {
      document
        .getElementById(location.hash.slice(1))
        ?.scrollIntoView({ block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash, i18n.language, zh]);
  const changeLanguage = () => {
    const next = zh ? 'en' : 'zh';
    try {
      localStorage.setItem('language', JSON.stringify(next));
    } catch {
      // Language still works for this visit when browser storage is unavailable.
    }
    void i18n.changeLanguage(next);
  };
  const inSession = location.pathname.startsWith('/practice/');
  return (
    <div className={`trainer-app ${inSession ? 'trainer-in-session' : ''}`}>
      <a href="#trainer-main" className="trainer-skip-link">
        {zh ? '跳至主要内容' : 'Skip to content'}
      </a>
      <header className="trainer-topbar">
        <Link to="/" className="trainer-brand" aria-label="Ear Trainer">
          <span className="trainer-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            Ear<span className="trainer-brand-light">Trainer</span>
          </span>
        </Link>
        {!inSession && (
          <nav
            className="trainer-desktop-nav"
            aria-label={zh ? '主导航' : 'Main navigation'}
          >
            {items.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                {zh ? item.zh : item.en}
              </NavLink>
            ))}
          </nav>
        )}
        <button
          type="button"
          className="trainer-language"
          onClick={changeLanguage}
          aria-label={zh ? 'Switch to English' : '切换中文'}
        >
          {zh ? 'EN' : '中文'}
        </button>
      </header>
      <div id="trainer-main" className="trainer-main" tabIndex={-1}>
        <Outlet />
      </div>
      {!inSession && (
        <footer className="trainer-footer">
          <p>{zh ? 'All about music' : 'All about music'}</p>
          <div className="music-footer-links">
            <Link to="/progress">{zh ? '以前的记录' : 'Earlier practice'}</Link>
            <a
              href="https://github.com/Zilong-L/EarTrainer/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              {zh ? '反馈与开源' : 'Feedback & source'}
            </a>
          </div>
        </footer>
      )}
      {!inSession && (
        <nav
          className="trainer-mobile-nav"
          aria-label={zh ? '主导航' : 'Main navigation'}
        >
          {items.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              <item.icon aria-hidden="true" />
              <span>{zh ? item.zh : item.en}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
