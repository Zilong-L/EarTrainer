import { Component, useEffect, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  AcademicCapIcon,
  MusicalNoteIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import './training.css';

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
  { to: '/', icon: HomeIcon, en: 'Today', zh: '今日' },
  { to: '/learn', icon: AcademicCapIcon, en: 'Learn', zh: '学习' },
  { to: '/practice', icon: MusicalNoteIcon, en: 'Practice', zh: '练习' },
  { to: '/progress', icon: ChartBarIcon, en: 'Progress', zh: '进度' },
];

export default function TrainingShell() {
  const { i18n } = useTranslation();
  const zh = i18n.language.startsWith('zh');
  const location = useLocation();
  useEffect(() => {
    document.documentElement.lang = zh ? 'zh-CN' : 'en';
    const title = location.pathname.startsWith('/practice/')
      ? zh
        ? '专注练习'
        : 'Focused practice'
      : (items.find(item => item.to === location.pathname)?.[
          zh ? 'zh' : 'en'
        ] ?? (zh ? '练耳' : 'Ear training'));
    document.title = `${title} · Ear Trainer`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, zh]);
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
        <nav
          className="trainer-desktop-nav"
          aria-label={zh ? '主导航' : 'Main navigation'}
        >
          {items.map(item => (
            <NavLink key={item.to} to={item.to} end>
              {zh ? item.zh : item.en}
            </NavLink>
          ))}
        </nav>
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
          <p>
            {zh
              ? '每天听一点，慢慢听得更清楚'
              : 'A little listening, a clearer musical ear'}
          </p>
          <a
            href="https://github.com/Zilong-L/EarTrainer/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            {zh ? '反馈与开源' : 'Feedback & source'}
          </a>
        </footer>
      )}
      {!inSession && (
        <nav
          className="trainer-mobile-nav"
          aria-label={zh ? '主导航' : 'Main navigation'}
        >
          {items.map(item => (
            <NavLink key={item.to} to={item.to} end>
              <item.icon aria-hidden="true" />
              <span>{zh ? item.zh : item.en}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
